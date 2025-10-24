// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Foresight
 * @dev 预测市场智能合约
 */
contract Foresight {
    struct Prediction {
        address creator;
        string title;
        string description;
        uint256 deadline;
        uint256 totalStake;
        bool resolved;
        uint256 winningOption;
        mapping(uint256 => uint256) optionStakes;
        mapping(address => mapping(uint256 => uint256)) userStakes;
    }

    Prediction[] public predictions;
    
    event PredictionCreated(uint256 indexed predictionId, address indexed creator, string title, uint256 deadline);
    event StakeAdded(uint256 indexed predictionId, address indexed user, uint256 option, uint256 amount);
    event PredictionResolved(uint256 indexed predictionId, uint256 winningOption);
    event RewardClaimed(uint256 indexed predictionId, address indexed user, uint256 amount);

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
        
        emit PredictionCreated(predictionId, msg.sender, _title, _deadline);
        return predictionId;
    }

    function stake(uint256 _predictionId, uint256 _option) external payable {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp < prediction.deadline, "Prediction deadline passed");
        require(!prediction.resolved, "Prediction already resolved");
        require(msg.value > 0, "Stake amount must be greater than 0");
        
        prediction.optionStakes[_option] += msg.value;
        prediction.userStakes[msg.sender][_option] += msg.value;
        prediction.totalStake += msg.value;
        
        emit StakeAdded(_predictionId, msg.sender, _option, msg.value);
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

    function claimReward(uint256 _predictionId) external {
        require(_predictionId < predictions.length, "Invalid prediction ID");
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.resolved, "Prediction not resolved");
        
        uint256 userStake = prediction.userStakes[msg.sender][prediction.winningOption];
        require(userStake > 0, "No stake in winning option");
        
        uint256 totalWinningStake = prediction.optionStakes[prediction.winningOption];
        uint256 reward = (userStake * prediction.totalStake) / totalWinningStake;
        
        // 防止重入攻击
        prediction.userStakes[msg.sender][prediction.winningOption] = 0;
        
        payable(msg.sender).transfer(reward);
        
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
}