// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./interfaces/IMarket.sol";

/// @title MarketFactory
/// @notice Factory to register market templates and create markets via minimal proxy clones
contract MarketFactory is AccessControl {
    using Clones for address;

    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;

    struct Template {
        address implementation;
        bool exists;
        string name; // optional label for UX
    }

    struct MarketInfo {
        address market;
        bytes32 templateId;
        address creator;
        address collateralToken;
        address oracle;
        uint256 feeBps;
        uint256 resolutionTime;
    }

    // template registry
    mapping(bytes32 => Template) public templates;

    // created markets
    uint256 public marketCount;
    mapping(uint256 => MarketInfo) public markets; // by sequential marketId
    mapping(address => bool) public isMarketFromFactory; // quick check

    event TemplateRegistered(bytes32 indexed templateId, address implementation, string name);
    event TemplateRemoved(bytes32 indexed templateId);

    event MarketCreated(
        uint256 indexed marketId,
        address indexed market,
        bytes32 indexed templateId,
        address creator,
        address collateralToken,
        address oracle,
        uint256 feeBps,
        uint256 resolutionTime
    );

    constructor(address admin) {
        require(admin != address(0), "admin=0");
        _grantRole(ADMIN_ROLE, admin);
    }

    // ----------------------
    // Template management
    // ----------------------

    function registerTemplate(bytes32 templateId, address implementation, string calldata name) external onlyRole(ADMIN_ROLE) {
        require(templateId != bytes32(0), "templateId=0");
        require(implementation != address(0), "impl=0");
        templates[templateId] = Template({ implementation: implementation, exists: true, name: name });
        emit TemplateRegistered(templateId, implementation, name);
    }

    function removeTemplate(bytes32 templateId) external onlyRole(ADMIN_ROLE) {
        require(templates[templateId].exists, "template!exists");
        delete templates[templateId];
        emit TemplateRemoved(templateId);
    }

    function getTemplate(bytes32 templateId) external view returns (Template memory) {
        return templates[templateId];
    }

    // ----------------------
    // Market creation
    // ----------------------

    /// @notice Create a market by cloning a registered template and initializing it
    /// @param templateId Registered template key (e.g., keccak256("BINARY"), keccak256("MULTI"))
    /// @param collateralToken ERC20 used as collateral in the market
    /// @param oracle Address responsible for resolution
    /// @param feeBps Fee in basis points taken by the market (e.g., 30 = 0.30%)
    /// @param resolutionTime Unix timestamp after which market can be finalized
    /// @param data ABI-encoded template-specific params (e.g., outcomes set, AMM config)
    /// @return market The created market address
    /// @return marketId Sequential id for indexing
    function createMarket(
        bytes32 templateId,
        address collateralToken,
        address oracle,
        uint256 feeBps,
        uint256 resolutionTime,
        bytes calldata data
    ) external returns (address market, uint256 marketId) {
        Template memory t = templates[templateId];
        require(t.exists, "template missing");
        require(collateralToken != address(0), "collateral=0");
        require(oracle != address(0), "oracle=0");

        market = t.implementation.clone();

        IMarket(market).initialize(
            address(this),
            msg.sender,
            collateralToken,
            oracle,
            feeBps,
            resolutionTime,
            data
        );

        marketId = ++marketCount;
        markets[marketId] = MarketInfo({
            market: market,
            templateId: templateId,
            creator: msg.sender,
            collateralToken: collateralToken,
            oracle: oracle,
            feeBps: feeBps,
            resolutionTime: resolutionTime
        });
        isMarketFromFactory[market] = true;

        emit MarketCreated(
            marketId,
            market,
            templateId,
            msg.sender,
            collateralToken,
            oracle,
            feeBps,
            resolutionTime
        );
    }
}