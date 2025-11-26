// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICrowdVCFactory
 * @dev Interface for the main CrowdVC factory contract
 */
interface ICrowdVCFactory {
    // Enums
    enum UserType { None, Startup, Investor, Admin }
    enum PitchStatus {
        Pending,
        UnderReview,
        Shortlisted,
        NeedsMoreInfo,
        ConditionalApproval,
        Approved,
        Rejected,
        InPool,
        Funded
    }

    // Structs
    struct UserProfile {
        UserType userType;
        string metadataURI;
        uint256 registeredAt;
        bool isActive;
    }

    struct PitchData {
        bytes32 pitchId;
        address startup;
        string title;
        string ipfsHash;
        uint256 fundingGoal;
        PitchStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    struct PoolParams {
        string poolId;
        string name;
        string category;
        uint256 fundingGoal;
        uint256 votingDuration;
        uint256 fundingDuration;
        bytes32[] candidatePitches;
        address acceptedToken;
        uint256 minContribution;
        uint256 maxContribution;
    }

    // Events
    event UserRegistered(address indexed user, UserType userType, uint256 timestamp);
    event UserTypeUpdated(address indexed user, UserType oldType, UserType newType);
    event PitchSubmitted(bytes32 indexed pitchId, address indexed startup, string title, string ipfsHash);
    event PitchStatusUpdated(bytes32 indexed pitchId, PitchStatus oldStatus, PitchStatus newStatus);
    event PoolDeployed(string indexed poolId, address indexed poolAddress, uint256 votingDeadline, uint256 timestamp);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event EmergencyWithdrawal(address indexed poolAddress, uint256 timestamp);

    // View functions
    function getUserProfile(address user) external view returns (UserProfile memory);
    function getPitchData(bytes32 pitchId) external view returns (PitchData memory);
    function isPitchApproved(bytes32 pitchId) external view returns (bool);
    function isPool(address poolAddress) external view returns (bool);
    function getPlatformFee() external view returns (uint256);
    function getTreasury() external view returns (address);
    function getAllPools() external view returns (address[] memory);

    // State-changing functions
    function registerUser(UserType userType, string calldata metadataURI) external;
    function submitPitch(string calldata title, string calldata ipfsHash, uint256 fundingGoal) external returns (bytes32);
    function updatePitchStatus(bytes32 pitchId, PitchStatus newStatus) external;
    function createPool(PoolParams calldata params) external returns (address);
}
