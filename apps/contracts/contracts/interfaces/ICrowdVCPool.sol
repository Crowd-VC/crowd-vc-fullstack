// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICrowdVCPool
 * @dev Interface for individual CrowdVC pool contracts
 */
interface ICrowdVCPool {
    // Enums
    enum PoolStatus { Active, VotingEnded, Funded, Closed, Failed }

    // Structs
    struct PoolInfo {
        string name;
        string category;
        uint256 fundingGoal;
        uint256 votingDeadline;
        uint256 fundingDeadline;
        uint256 totalContributions;
        PoolStatus status;
        address acceptedToken;
        uint256 minContribution;
    }

    struct VoteResult {
        bytes32 pitchId;
        uint256 voteWeight;
        uint256 allocationPercent; // Basis points (10000 = 100%)
    }

    struct Milestone {
        string description;
        uint256 fundingPercent; // Basis points
        bool completed;
        bool disputed;
        uint256 deadline;
        string evidenceURI;
    }

    // Events
    event ContributionMade(address indexed investor, uint256 amount, uint256 tokenId, uint256 timestamp);
    event VoteCast(address indexed voter, bytes32 indexed pitchId, uint256 weight, uint256 timestamp);
    event EarlyWithdrawal(address indexed investor, uint256 contribution, uint256 penalty, uint256 refund);
    event VotingEnded(uint256 timestamp, bytes32[] winners, uint256[] allocations);
    event MilestoneCompleted(bytes32 indexed pitchId, uint256 milestoneIndex, uint256 amountReleased);
    event FundsDistributed(bytes32 indexed pitchId, address indexed startup, uint256 amount);
    event Refunded(address indexed investor, uint256 amount);
    event PoolClosed(uint256 timestamp);

    // View functions
    function getPoolInfo() external view returns (PoolInfo memory);
    function getWinners() external view returns (VoteResult[] memory);
    function getContribution(address investor) external view returns (uint256);
    function hasVoted(address voter, bytes32 pitchId) external view returns (bool);
    function getVoteWeight(bytes32 pitchId) external view returns (uint256);
    function getMilestones(bytes32 pitchId) external view returns (Milestone[] memory);

    // State-changing functions
    function contribute(uint256 amount) external returns (uint256 tokenId);
    function vote(bytes32 pitchId) external;
    function withdrawEarly() external;
    function endVoting() external;
    function addMilestones(bytes32 pitchId, Milestone[] calldata milestones) external;
    function completeMilestone(bytes32 pitchId, uint256 milestoneIndex, string calldata evidenceURI) external;
    function distributeMilestoneFunds(bytes32 pitchId, uint256 milestoneIndex) external;
    function requestRefund() external;
}
