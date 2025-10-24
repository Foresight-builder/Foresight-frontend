// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Chainlink Aggregator v3 minimal interface
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title Foresight
 * @dev 预测市场智能合约（ERC20 押注版），集成Chainlink价格预言机用于价格型预测的自动结算
 */
contract Foresight is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public collateralToken;

    struct Prediction {
        address creator;
        string title;
        string description;
        uint256 deadline;
        uint256 totalStake;
        bool resolved;
        uint256 winningOption;
        // 价格型预测（可选）
        address priceFeed;     // Chainlink AggregatorV3 地址（为0表示非价格型预测）
        int256 targetPrice;    // 目标价格，单位为 priceFeed 的 decimals
        uint8 comparator;      // 0=<=, 1=<, 2=>=, 3=>
        mapping(uint256 => uint256) optionStakes;
        mapping(address => mapping(uint256 => uint256)) userStakes;
    }

    Prediction[] public predictions;
    
    event PredictionCreated(uint256 indexed predictionId, address indexed creator, string title, uint256 deadline);
    event StakeAdded(uint256 indexed predictionId, address indexed user, uint256 option, uint256 amount);
    event PredictionResolved(uint256 indexed predictionId, uint256 winningOption);
    event RewardClaimed(uint256 indexed predictionId, address indexed user, uint256 amount);

    constructor(address _collateralToken) {
        require(_collateralToken != address(0), "Invalid token address");
        collateralToken = IERC20(_collateralToken);
    }

    // 标准文本型预测
    function createPrediction(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 predictionId = predictions.length;
        Prediction storage newPrediction = predictions.push();
        newPrediction.creator = msg.sender;
        newPrediction.title = _title;
        newPrediction.description = _description;
        newPrediction.deadline = _deadline;
        newPrediction.resolved = false;
        // 默认非价格型预测
        newPrediction.priceFeed = address(0);
        newPrediction.targetPrice = 0;
        newPrediction.comparator = 0;
        
        emit PredictionCreated(predictionId, msg.sender, _title, _deadline);
        return predictionId;
    }

    // 价格型预测（基于 Chainlink Data Feeds）
    function createPricePrediction(
        string memory _title,
        string memory _description,
        uint256 _deadline,
        address _priceFeed,
        int256 _targetPrice,
        uint8 _comparator
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_priceFeed != address(0), "Invalid price feed");
        require(_comparator <= 3, "Invalid comparator");

        uint256 predictionId = predictions.length;
        Prediction storage p = predictions.push();
        p.creator = msg.sender;
        p.title = _title;
        p.description = _description;
        p.deadline = _deadline;
        p.resolved = false;
        p.priceFeed = _priceFeed;
        p.targetPrice = _targetPrice; // 要求调用方按 feed 的 decimals 传入
        p.comparator = _comparator;

        emit PredictionCreated(predictionId, msg.sender, _title, _deadline);
        return predictionId;
    }

    function stake(uint256 _predictionId, uint256 _option, uint256 amount) external nonReentrant {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp < prediction.deadline, "Prediction deadline passed");
        require(!prediction.resolved, "Prediction already resolved");
        require(amount > 0, "Stake amount must be greater than 0");
        
        // 拉取用户的抵押代币
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        
        prediction.optionStakes[_option] += amount;
        prediction.userStakes[msg.sender][_option] += amount;
        prediction.totalStake += amount;
        emit StakeAdded(_predictionId, msg.sender, _option, amount);
    }

    function resolvePrediction(uint256 _predictionId, uint256 _winningOption) external {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(msg.sender == prediction.creator, "Only creator can resolve");
        require(block.timestamp >= prediction.deadline, "Deadline not reached");
        require(!prediction.resolved, "Already resolved");
        
        prediction.resolved = true;
        prediction.winningOption = _winningOption;
        
        emit PredictionResolved(_predictionId, _winningOption);
    }

    // 使用 Chainlink 价格数据进行自动结算
    function resolvePredictionWithOracle(uint256 _predictionId) external {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(msg.sender == prediction.creator, "Only creator can resolve");
        require(block.timestamp >= prediction.deadline, "Deadline not reached");
        require(!prediction.resolved, "Already resolved");
        require(prediction.priceFeed != address(0), "Not a price prediction");

        (, int256 answer, , uint256 updatedAt, ) = AggregatorV3Interface(prediction.priceFeed).latestRoundData();
        require(updatedAt > 0, "Oracle data not available");

        bool hit = _compare(answer, prediction.targetPrice, prediction.comparator);
        prediction.resolved = true;
        prediction.winningOption = hit ? 1 : 0; // 满足条件视为YES(1)，否则NO(0)
        emit PredictionResolved(_predictionId, prediction.winningOption);
    }

    function claimReward(uint256 _predictionId) external nonReentrant {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.resolved, "Prediction not resolved");
        
        uint256 userStake = prediction.userStakes[msg.sender][prediction.winningOption];
        require(userStake > 0, "No stake in winning option");
        
        uint256 totalWinningStake = prediction.optionStakes[prediction.winningOption];
        require(totalWinningStake > 0, "No stakes on winning option");
        uint256 reward = (userStake * prediction.totalStake) / totalWinningStake;
        
        // 防止重入与重复领取：先清零后转账
        prediction.userStakes[msg.sender][prediction.winningOption] = 0;
        collateralToken.safeTransfer(msg.sender, reward);
        
        emit RewardClaimed(_predictionId, msg.sender, reward);
    }

    function getPredictionCount() external view returns (uint256) {
        return predictions.length;
    }

    function getPrediction(uint256 _predictionId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 deadline,
        uint256 totalStake,
        bool resolved,
        uint256 winningOption
    ) {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        return (
            prediction.creator,
            prediction.title,
            prediction.description,
            prediction.deadline,
            prediction.totalStake,
            prediction.resolved,
            prediction.winningOption
        );
    }

    function getUserStake(uint256 _predictionId, address _user, uint256 _option) external view returns (uint256) {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        return predictions[_predictionId].userStakes[_user][_option];
    }

    function getOptionStake(uint256 _predictionId, uint256 _option) external view returns (uint256) {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        return predictions[_predictionId].optionStakes[_option];
    }

    // 比较器：根据 comparator 判断价格与目标的关系
    function _compare(int256 price, int256 target, uint8 cmp) internal pure returns (bool) {
        if (cmp == 0) return price <= target; // <=
        if (cmp == 1) return price < target;  // <
        if (cmp == 2) return price >= target; // >=
        if (cmp == 3) return price > target;  // >
        return false;
    }
}