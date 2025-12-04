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
    struct Contribution {
        address investor;
        uint256 amount;        // Gross amount (original contribution)
        uint256 platformFee;   // Fee deducted and sent to Treasury
        uint256 netAmount;     // Amount after platform fee (used for pool accounting)
        address token;
        uint256 timestamp;
        uint256 nftTokenId;
        bool withdrawn;
    }

    struct PoolInfo {
        string name;
        string category;
        uint256 fundingGoal;
        uint256 votingDeadline;
        uint256 totalContributions;
        PoolStatus status;
        address acceptedToken;
        uint256 minContribution;
        uint256 maxContribution;
    }

    struct PoolConfig {
        string name;
        string category;
        uint256 fundingGoal;
        uint256 votingDuration;
        uint256 fundingDuration;
        bytes32[] candidatePitches;
        address acceptedToken;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 pitchAddDuration;
        uint256 platformFeePercent;
        address treasury;
    }

    struct VoteResult {
        bytes32 pitchId;
        address wallet;
        uint256 voteWeight;
        uint256 allocationPercent; // Basis points (10000 = 100%)
        uint256 allocation; // Amount in tokens
        uint256 claimed; // Amount already claimed via milestones
    }

    struct Milestone {
        string description;
        uint256 fundingPercent; // Basis points
        bool completed;
        bool disputed;
        uint256 deadline;
        string evidenceURI;
        uint256 approvalCount;
        uint256 approvalsNeeded;
    }

    // Events
    event ContributionMade(
        address indexed investor,
        uint256 amount,
        uint256 platformFee,
        address token,
        uint256 tokenId,
        uint256 timestamp
    );
    event PlatformFeeTransferred(address indexed token, uint256 amount, uint256 timestamp);
    event PenaltyTransferred(address indexed investor, address indexed token, uint256 penalty, uint256 timestamp);
    event VoteCast(address indexed voter, bytes32 indexed pitchId, uint256 weight, uint256 timestamp);
    event VoteChanged(address indexed voter, bytes32 oldPitchId, bytes32 newPitchId);
    event VotesCleared(address indexed voter, uint256 numVotesCleared, uint256 timestamp);
    event EarlyWithdrawal(address indexed investor, uint256 netAmount, uint256 penalty, uint256 refund);
    event VotingEnded(uint256 timestamp, bytes32[] winners, uint256[] allocations);
    event StartupAdded(bytes32 indexed pitchId, address indexed wallet);
    event StartupRemoved(bytes32 indexed pitchId);
    event PoolActivated(uint256 timestamp);
    event MilestoneCompleted(bytes32 indexed pitchId, uint256 milestoneIndex, uint256 amountReleased);
    event MilestoneApproved(bytes32 indexed pitchId, uint256 milestoneIndex, address indexed approver);
    event FundsDistributed(bytes32 indexed pitchId, address indexed startup, uint256 amount);
    event FundsClaimed(bytes32 indexed pitchId, address indexed wallet, uint256 amount);
    event Refunded(address indexed investor, uint256 amount);
    event PoolClosed(uint256 timestamp);

    // View functions
    function getPoolInfo() external view returns (PoolInfo memory);
    function getWinners() external view returns (VoteResult[] memory);
    function getContribution(address investor) external view returns (uint256);
    function getDetailedContribution(address investor) external view returns (Contribution memory);
    function hasVoted(address voter, bytes32 pitchId) external view returns (bool);
    function getVoteWeight(bytes32 pitchId) external view returns (uint256);
    function getMilestones(bytes32 pitchId) external view returns (Milestone[] memory);
    function getNFTsByInvestor(address investor) external view returns (uint256[] memory);
    function getInvestorVotes(address investor) external view returns (bytes32[] memory);
    function getInvestorVoteCount(address investor) external view returns (uint256);
    function getMaxVotesPerInvestor() external view returns (uint256);

    // State-changing functions
    function contribute(uint256 amount, address token) external returns (uint256 tokenId);
    function vote(bytes32 pitchId) external;
    function changeVote(bytes32 oldPitchId, bytes32 newPitchId) external;
    function withdrawEarly() external;
    function endVoting() external;
    function addMilestones(bytes32 pitchId, Milestone[] calldata milestones) external;
    function approveMilestone(bytes32 pitchId, uint256 milestoneIndex) external;
    function completeMilestone(bytes32 pitchId, uint256 milestoneIndex, string calldata evidenceURI) external;
    function distributeMilestoneFunds(bytes32 pitchId, uint256 milestoneIndex) external;
    function requestRefund() external;
}
