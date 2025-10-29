// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "../interfaces/ICrowdVCFactory.sol";
import "../interfaces/ICrowdVCPool.sol";
import "../libraries/ValidationLib.sol";
import "./CrowdVCPool.sol";

/**
 * @title CrowdVCFactory
 * @dev Main upgradeable factory contract for CrowdVC platform
 * @notice Handles user registration, pitch management, and pool deployment
 */
contract CrowdVCFactory is
    ICrowdVCFactory,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using ValidationLib for *;

    // Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STARTUP_ROLE = keccak256("STARTUP_ROLE");
    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");

    uint256 public constant MIN_FUNDING_GOAL = 1000 * 10**6; // 1000 USDC/USDT (6 decimals)
    uint256 public constant MAX_FUNDING_GOAL = 10_000_000 * 10**6; // 10M USDC/USDT
    uint256 public constant MIN_VOTING_DURATION = 1 days;
    uint256 public constant MAX_VOTING_DURATION = 30 days;
    uint256 public constant MIN_POOL_GOAL = 10_000 * 10**6; // 10k minimum
    uint256 public constant MAX_POOL_GOAL = 50_000_000 * 10**6; // 50M maximum

    // State variables
    mapping(address => UserProfile) private _users;
    mapping(bytes32 => PitchData) private _pitches;
    mapping(address => bool) private _isPools;
    mapping(address => bytes32[]) private _userPitches; // startup => pitchIds[]

    address[] private _allPools;
    address public treasury;
    uint256 public platformFeePercent; // Basis points (500 = 5%)

    // Supported tokens (USDT and USDC)
    mapping(address => bool) public supportedTokens;

    // Version
    uint256 public version;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract (replaces constructor for upgradeable contracts)
     * @param _treasury Address to receive platform fees
     * @param _platformFee Initial platform fee in basis points
     * @param _usdt USDT token address on BASE
     * @param _usdc USDC token address on BASE
     */
    function initialize(
        address _treasury,
        uint256 _platformFee,
        address _usdt,
        address _usdc
    ) public initializer {
        ValidationLib.validateAddress(_treasury);
        ValidationLib.validateAddress(_usdt);
        ValidationLib.validateAddress(_usdc);
        require(_platformFee <= 1000, "Fee too high"); // Max 10%

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        treasury = _treasury;
        platformFeePercent = _platformFee;
        supportedTokens[_usdt] = true;
        supportedTokens[_usdc] = true;
        version = 1;
    }

    // ============ USER MANAGEMENT ============

    /**
     * @dev Register a new user with a specific role
     * @param userType Type of user (Startup or Investor)
     * @param metadataURI IPFS hash containing user profile data
     */
    function registerUser(UserType userType, string calldata metadataURI)
        external
        override
        whenNotPaused
    {
        require(userType != UserType.None && userType != UserType.Admin, "Invalid user type");
        require(_users[msg.sender].userType == UserType.None, "Already registered");
        ValidationLib.validateString(metadataURI);

        _users[msg.sender] = UserProfile({
            userType: userType,
            metadataURI: metadataURI,
            registeredAt: block.timestamp,
            isActive: true
        });

        if (userType == UserType.Startup) {
            _grantRole(STARTUP_ROLE, msg.sender);
        } else if (userType == UserType.Investor) {
            _grantRole(INVESTOR_ROLE, msg.sender);
        }

        emit UserRegistered(msg.sender, userType, block.timestamp);
    }

    /**
     * @dev Update user type (admin only)
     */
    function updateUserType(address user, UserType newType)
        external
        onlyRole(ADMIN_ROLE)
    {
        UserType oldType = _users[user].userType;
        require(oldType != UserType.None, "User not registered");
        require(newType != UserType.None, "Invalid type");

        _users[user].userType = newType;

        // Update roles
        if (oldType == UserType.Startup) _revokeRole(STARTUP_ROLE, user);
        else if (oldType == UserType.Investor) _revokeRole(INVESTOR_ROLE, user);

        if (newType == UserType.Startup) _grantRole(STARTUP_ROLE, user);
        else if (newType == UserType.Investor) _grantRole(INVESTOR_ROLE, user);
        else if (newType == UserType.Admin) _grantRole(ADMIN_ROLE, user);

        emit UserTypeUpdated(user, oldType, newType);
    }

    // ============ PITCH MANAGEMENT ============

    /**
     * @dev Submit a new pitch (startups only)
     * @param title Pitch title
     * @param ipfsHash IPFS hash containing pitch deck and details
     * @param fundingGoal Target funding amount
     * @return pitchId Unique identifier for the pitch
     */
    function submitPitch(
        string calldata title,
        string calldata ipfsHash,
        uint256 fundingGoal
    ) external override onlyRole(STARTUP_ROLE) whenNotPaused returns (bytes32) {
        ValidationLib.validatePitchData(title, ipfsHash, fundingGoal, MIN_FUNDING_GOAL, MAX_FUNDING_GOAL);

        bytes32 pitchId = keccak256(abi.encodePacked(msg.sender, title, block.timestamp));
        require(_pitches[pitchId].startup == address(0), "Pitch already exists");

        _pitches[pitchId] = PitchData({
            pitchId: pitchId,
            startup: msg.sender,
            title: title,
            ipfsHash: ipfsHash,
            fundingGoal: fundingGoal,
            status: PitchStatus.Pending,
            submittedAt: block.timestamp,
            approvedAt: 0
        });

        _userPitches[msg.sender].push(pitchId);

        emit PitchSubmitted(pitchId, msg.sender, title, ipfsHash);
        return pitchId;
    }

    /**
     * @dev Update pitch status (admin only)
     * @param pitchId ID of the pitch
     * @param newStatus New status for the pitch
     */
    function updatePitchStatus(bytes32 pitchId, PitchStatus newStatus)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        PitchData storage pitch = _pitches[pitchId];
        require(pitch.startup != address(0), "Pitch does not exist");

        PitchStatus oldStatus = pitch.status;
        pitch.status = newStatus;

        if (newStatus == PitchStatus.Approved) {
            pitch.approvedAt = block.timestamp;
        }

        emit PitchStatusUpdated(pitchId, oldStatus, newStatus);
    }

    // ============ POOL MANAGEMENT ============

    /**
     * @dev Create a new investment pool (admin only)
     * @param name Pool name
     * @param category Pool category
     * @param fundingGoal Total funding goal for the pool
     * @param votingDuration Duration of voting period in seconds
     * @param fundingDuration Duration of funding period in seconds
     * @param candidatePitches Array of approved pitch IDs
     * @param acceptedToken Token address (USDT or USDC)
     * @param minContribution Minimum contribution amount
     * @return poolAddress Address of the newly created pool
     */
    function createPool(
        string calldata name,
        string calldata category,
        uint256 fundingGoal,
        uint256 votingDuration,
        uint256 fundingDuration,
        bytes32[] calldata candidatePitches,
        address acceptedToken,
        uint256 minContribution
    ) external override onlyRole(ADMIN_ROLE) whenNotPaused nonReentrant returns (address) {
        ValidationLib.validatePoolParameters(
            name,
            fundingGoal,
            votingDuration,
            fundingDuration,
            minContribution,
            MIN_POOL_GOAL,
            MAX_POOL_GOAL,
            MIN_VOTING_DURATION,
            MAX_VOTING_DURATION
        );
        ValidationLib.validateNonEmptyArray(candidatePitches);
        require(supportedTokens[acceptedToken], "Token not supported");

        // Verify all pitches are approved
        for (uint256 i = 0; i < candidatePitches.length; i++) {
            require(_pitches[candidatePitches[i]].status == PitchStatus.Approved, "Pitch not approved");
            _pitches[candidatePitches[i]].status = PitchStatus.InPool;
        }

        // Deploy new pool contract
        CrowdVCPool pool = new CrowdVCPool();
        pool.initialize(
            address(this),
            name,
            category,
            fundingGoal,
            votingDuration,
            fundingDuration,
            candidatePitches,
            acceptedToken,
            minContribution,
            platformFeePercent,
            treasury
        );

        address poolAddress = address(pool);
        _isPools[poolAddress] = true;
        _allPools.push(poolAddress);

        emit PoolCreated(poolAddress, name, fundingGoal, block.timestamp);
        return poolAddress;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update platform fee (admin only)
     * @param newFee New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        require(newFee <= 1000, "Fee too high");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update treasury address (admin only)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        ValidationLib.validateAddress(newTreasury);
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Add supported token (admin only)
     */
    function addSupportedToken(address token) external onlyRole(ADMIN_ROLE) {
        ValidationLib.validateAddress(token);
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove supported token (admin only)
     */
    function removeSupportedToken(address token) external onlyRole(ADMIN_ROLE) {
        supportedTokens[token] = false;
    }

    /**
     * @dev Pause contract (admin only)
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (admin only)
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // ============ VIEW FUNCTIONS ============

    function getUserProfile(address user) external view override returns (UserProfile memory) {
        return _users[user];
    }

    function getPitchData(bytes32 pitchId) external view override returns (PitchData memory) {
        return _pitches[pitchId];
    }

    function isPitchApproved(bytes32 pitchId) external view override returns (bool) {
        return _pitches[pitchId].status == PitchStatus.Approved;
    }

    function isPool(address poolAddress) external view override returns (bool) {
        return _isPools[poolAddress];
    }

    function getPlatformFee() external view override returns (uint256) {
        return platformFeePercent;
    }

    function getTreasury() external view override returns (address) {
        return treasury;
    }

    function getAllPools() external view override returns (address[] memory) {
        return _allPools;
    }

    function getUserPitches(address startup) external view returns (bytes32[] memory) {
        return _userPitches[startup];
    }

    // ============ UPGRADE AUTHORIZATION ============

    /**
     * @dev Authorize upgrade (admin only)
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(ADMIN_ROLE)
    {}

    /**
     * @dev Get implementation version
     */
    function getVersion() external view returns (uint256) {
        return version;
    }
}
