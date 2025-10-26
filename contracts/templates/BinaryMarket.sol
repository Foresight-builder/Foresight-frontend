// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "../interfaces/IMarket.sol";
import "../tokens/OutcomeToken.sol";

/// @title BinaryMarket
/// @notice Minimal binary market template (YES/NO) using USDT (or other ERC20) as collateral
/// @dev Trading/AMM not implemented; supports deposit complete sets and redemption post resolution
contract BinaryMarket is AccessControl, ReentrancyGuard, IMarket {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    enum State { Created, Trading, Resolved, Canceled }

    State public state;

    address public factory;
    address public creator;
    IERC20 public collateral; // expected USDT
    uint8 public collateralDecimals;

    address public tokenYes;
    address public tokenNo;

    address public oracle;
    uint256 public feeBps;
    uint256 public resolutionTime;

    address public feeRecipient;
    uint256 public accruedFees; // in collateral smallest units

    int256 public finalOutcome; // -1=unset, 0=NO, 1=YES
    bool private _initialized;

    event Initialized(address factory, address creator, address collateral, address oracle, uint256 feeBps, uint256 resolutionTime);
    event TradingStarted();
    event MarketCanceled();
    event Finalized(int256 outcome);
    event DepositCompleteSet(address indexed user, uint256 collateralIn, uint256 yesOut, uint256 noOut);
    event Redeem(address indexed user, int256 outcome, uint256 tokenBurned, uint256 collateralOut);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event FeesWithdrawn(address indexed to, uint256 amount);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "not admin");
        _;
    }

    modifier onlyOracle() {
        require(hasRole(ORACLE_ROLE, msg.sender), "not oracle");
        _;
    }

    function initialize(
        address factory_,
        address creator_,
        address collateralToken_,
        address oracle_,
        uint256 feeBps_,
        uint256 resolutionTime_,
        bytes calldata /*data*/
    ) external override {
        require(!_initialized, "already init");
        require(factory_ != address(0) && creator_ != address(0), "bad actors");
        require(collateralToken_ != address(0) && oracle_ != address(0), "bad addrs");
        require(resolutionTime_ > block.timestamp, "resolution in past");
        require(feeBps_ <= 1000, "fee too high"); // max 10%

        factory = factory_;
        creator = creator_;
        collateral = IERC20(collateralToken_);
        collateralDecimals = IERC20Metadata(collateralToken_).decimals();
        oracle = oracle_;
        feeBps = feeBps_;
        resolutionTime = resolutionTime_;
        feeRecipient = creator_;

        _grantRole(ADMIN_ROLE, creator_);
        _grantRole(ORACLE_ROLE, oracle_);

        // deploy outcome tokens, market as admin
        OutcomeToken yes = new OutcomeToken("YES", "YES");
        OutcomeToken no = new OutcomeToken("NO", "NO");
        tokenYes = address(yes);
        tokenNo = address(no);

        yes.grantRole(yes.MINTER_ROLE(), address(this));
        no.grantRole(no.MINTER_ROLE(), address(this));

        state = State.Created;
        finalOutcome = -1;
        _initialized = true;

        emit Initialized(factory_, creator_, collateralToken_, oracle_, feeBps_, resolutionTime_);
    }

    function setFeeRecipient(address newRecipient) external onlyAdmin {
        require(newRecipient != address(0), "recipient=0");
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }

    function startTrading() external onlyAdmin {
        require(state == State.Created, "bad state");
        state = State.Trading;
        emit TradingStarted();
    }

    function cancelMarket() external onlyAdmin {
        require(state == State.Created || state == State.Trading, "bad state");
        state = State.Canceled;
        emit MarketCanceled();
    }

    /// @notice Deposit collateral to mint a complete set (1 YES + 1 NO equivalent)
    /// @param collateralAmount Amount in smallest units of collateral (e.g., USDT 6 decimals)
    function depositCompleteSet(uint256 collateralAmount) external nonReentrant {
        require(state == State.Trading, "not trading");
        require(block.timestamp < resolutionTime, "past resolution");
        require(collateralAmount > 0, "amount=0");

        // transfer collateral in
        require(collateral.transferFrom(msg.sender, address(this), collateralAmount), "transferFrom fail");

        // normalize to 18 decimals outcome tokens: amountOut = collateralAmount * 10^(18) / 10^(collateralDecimals)
        uint256 amountOut = _to18(collateralAmount);

        OutcomeToken(tokenYes).mint(msg.sender, amountOut);
        OutcomeToken(tokenNo).mint(msg.sender, amountOut);

        emit DepositCompleteSet(msg.sender, collateralAmount, amountOut, amountOut);
    }

    /// @notice Finalize market outcome by oracle after resolutionTime
    function finalize(int256 outcome) external onlyOracle {
        require(block.timestamp >= resolutionTime, "too early");
        require(state == State.Trading || state == State.Created, "bad state");
        require(outcome == 0 || outcome == 1, "bad outcome");
        state = State.Resolved;
        finalOutcome = outcome;
        emit Finalized(outcome);
    }

    /// @notice Redeem winning token for collateral 1:1 (minus fee if set)
    /// @param tokenAmount Amount in 18-decimal outcome token units
    function redeem(uint256 tokenAmount) external nonReentrant {
        require(state == State.Resolved, "not resolved");
        require(tokenAmount > 0, "amount=0");

        address winning = finalOutcome == 1 ? tokenYes : tokenNo;

        // burn winning tokens from user
        OutcomeToken(winning).burn(msg.sender, tokenAmount);

        // compute collateral out (apply fee if any)
        uint256 gross = _from18(tokenAmount);
        uint256 fee = feeBps > 0 ? (gross * feeBps) / 10000 : 0;
        uint256 net = gross - fee;
        accruedFees += fee;

        require(collateral.balanceOf(address(this)) >= net, "insufficient vault");
        require(collateral.transfer(msg.sender, net), "transfer fail");

        emit Redeem(msg.sender, finalOutcome, tokenAmount, net);
    }

    /// @notice On cancel, users can redeem a complete set back to collateral 1:1 (no fee)
    function redeemCompleteSetOnCancel(uint256 amount18PerOutcome) external nonReentrant {
        require(state == State.Canceled, "not canceled");
        require(amount18PerOutcome > 0, "amount=0");

        OutcomeToken(tokenYes).burn(msg.sender, amount18PerOutcome);
        OutcomeToken(tokenNo).burn(msg.sender, amount18PerOutcome);

        uint256 collateralOut = _from18(amount18PerOutcome);
        require(collateral.balanceOf(address(this)) >= collateralOut, "insufficient vault");
        require(collateral.transfer(msg.sender, collateralOut), "transfer fail");
    }

    function withdrawFees(uint256 amount) external onlyAdmin {
        require(amount > 0 && amount <= accruedFees, "bad amount");
        accruedFees -= amount;
        require(collateral.transfer(feeRecipient, amount), "transfer fail");
        emit FeesWithdrawn(feeRecipient, amount);
    }

    function _to18(uint256 amt) internal view returns (uint256) {
        if (collateralDecimals == 18) return amt;
        return amt * (10 ** (18 - collateralDecimals));
    }

    function _from18(uint256 amt18) internal view returns (uint256) {
        if (collateralDecimals == 18) return amt18;
        return amt18 / (10 ** (18 - collateralDecimals));
    }
}