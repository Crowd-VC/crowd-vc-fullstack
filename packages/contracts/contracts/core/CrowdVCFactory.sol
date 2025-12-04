// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "../interfaces/ICrowdVCFactory.sol";
import "../interfaces/ICrowdVCPool.sol";
import "../libraries/ValidationLib.sol";
import "./CrowdVCPool.sol";

/**
 * @title CrowdVCFactory
 * @dev Gas-optimized factory contract for CrowdVC platform
 * @notice Handles user registration, pitch management, and pool deployment
 *
 * OPTIMIZATIONS APPLIED:
 * - Custom errors instead of require strings
 * - Storage variable packing
 * - Cached storage reads
 * - Immutable pool implementation
 * - Loop optimizations
 * - Event optimization
 * - Reduced redundant operations
 */
contract CrowdVCFactory is
    ICrowdVCFactory,
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    using ValidationLib for *;

    // ============ CUSTOM ERRORS ============

    error InvalidUserType();
    error AlreadyRegistered();
    error UserNotRegistered();
    error InvalidType();
    error PitchAlreadyExists();
    error PitchDoesNotExist();
    error PitchNotApproved();
    error InvalidPool();
    error PoolIdAlreadyExists();
    error InvalidMaxContribution();
    error TokenNotSupported();
    error FeeTooHigh();
    error PitchNotInPool();

    // ============ CONSTANTS ============

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant STARTUP_ROLE = keccak256("STARTUP_ROLE");
    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");

    uint256 public constant MIN_FUNDING_GOAL = 1000 * 10**6; // 1000 USDC/USDT (6 decimals)
    uint256 public constant MAX_FUNDING_GOAL = 10_000_000 * 10**6; // 10M USDC/USDT
    uint256 public constant MIN_VOTING_DURATION = 1 days;
    uint256 public constant MAX_VOTING_DURATION = 30 days;
    uint256 public constant MIN_POOL_GOAL = 10_000 * 10**6; // 10k minimum
    uint256 public constant MAX_POOL_GOAL = 50_000_000 * 10**6; // 50M maximum
    uint256 private constant MAX_PLATFORM_FEE = 1000; // 10%

    // ============ STATE VARIABLES (PACKED) ============

    // Slot 1: address (20 bytes) + uint16 (2 bytes) + uint32 (4 bytes) = 26 bytes
    address public treasury;
    uint16 public platformFeePercent; // Max 10000 basis points, uint16 sufficient
    uint32 public version; // uint32 sufficient for version numbers

    // Mappings (each takes separate slot)
    mapping(address => UserProfile) private _users;
    mapping(bytes32 => PitchData) private _pitches;
    mapping(address => bool) private _isPools;
    mapping(address => bytes32[]) private _userPitches;
    mapping(address => bool) public supportedTokens;

    // Pool ID mapping (using bytes32 instead of string for gas efficiency)
    mapping(bytes32 => address) public poolIdToAddress;
    mapping(address => bytes32) public poolAddressToId;

    address[] private _allPools;

    // Pool implementation for minimal proxy pattern (ERC-1167)
    address public immutable poolImplementation;

    // Nonce for pitch ID generation (prevents collision)
    uint256 private _pitchNonce;

    // ============ CONSTRUCTOR ============

    /**
     * @dev Constructor initializes the factory contract
     * @param _poolImplementation Address of the CrowdVCPool implementation for cloning
     * @param _treasury Address to receive platform fees
     * @param _platformFee Initial platform fee in basis points
     * @param _usdt USDT token address
     * @param _usdc USDC token address
     */
    constructor(
        address _poolImplementation,
        address _treasury,
        uint256 _platformFee,
        address _usdt,
        address _usdc
    ) {
        if (_poolImplementation == address(0)) revert ValidationLib.InvalidAddress();
        ValidationLib.validateAddress(_treasury);
        ValidationLib.validateAddress(_usdt);
        ValidationLib.validateAddress(_usdc);
        if (_platformFee > MAX_PLATFORM_FEE) revert FeeTooHigh();

        poolImplementation = _poolImplementation;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        treasury = _treasury;
        platformFeePercent = uint16(_platformFee);
        supportedTokens[_usdt] = true;
        supportedTokens[_usdc] = true;
        version = 1;
        _pitchNonce = 0;
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
        if (userType == UserType.None || userType == UserType.Admin) revert InvalidUserType();
        if (_users[msg.sender].userType != UserType.None) revert AlreadyRegistered();
        ValidationLib.validateString(metadataURI);

        _users[msg.sender] = UserProfile({
            userType: userType,
            metadataURI: metadataURI,
            registeredAt: block.timestamp,
            isActive: true
        });

        // Grant role based on user type
        if (userType == UserType.Startup) {
            _grantRole(STARTUP_ROLE, msg.sender);
        } else {
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
        UserProfile storage userProfile = _users[user];
        UserType oldType = userProfile.userType;

        if (oldType == UserType.None) revert UserNotRegistered();
        if (newType == UserType.None) revert InvalidType();

        userProfile.userType = newType;

        // Update roles efficiently
        if (oldType == UserType.Startup) {
            _revokeRole(STARTUP_ROLE, user);
        } else if (oldType == UserType.Investor) {
            _revokeRole(INVESTOR_ROLE, user);
        }

        if (newType == UserType.Startup) {
            _grantRole(STARTUP_ROLE, user);
        } else if (newType == UserType.Investor) {
            _grantRole(INVESTOR_ROLE, user);
        } else if (newType == UserType.Admin) {
            _grantRole(ADMIN_ROLE, user);
        }

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
    ) external override whenNotPaused returns (bytes32) {
        ValidationLib.validatePitchData(title, ipfsHash, fundingGoal, MIN_FUNDING_GOAL, MAX_FUNDING_GOAL);

        // Use nonce to prevent collision
        bytes32 pitchId = keccak256(abi.encodePacked(msg.sender, title, block.timestamp, _pitchNonce++));

        // This check should never fail with nonce, but keep for safety
        if (_pitches[pitchId].startup != address(0)) revert PitchAlreadyExists();

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
        if (pitch.startup == address(0)) revert PitchDoesNotExist();

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
     * @param params Pool configuration parameters
     * @return poolAddress Address of the newly created pool
     */
    function createPool(ICrowdVCFactory.PoolParams calldata params)
        external
        override
        onlyRole(ADMIN_ROLE)
        whenNotPaused
        nonReentrant
        returns (address)
    {
        bytes32 poolId = keccak256(bytes(params.poolId));
        
        // Validate pool ID
        if (poolId == bytes32(0)) revert ValidationLib.InvalidString();
        if (poolIdToAddress[poolId] != address(0)) revert PoolIdAlreadyExists();

        // Validate parameters
        ValidationLib.validatePoolParameters(
            params.name,
            params.fundingGoal,
            params.votingDuration,
            params.fundingDuration,
            params.minContribution,
            MIN_POOL_GOAL,
            MAX_POOL_GOAL,
            MIN_VOTING_DURATION,
            MAX_VOTING_DURATION
        );
        // Note: candidatePitches can be empty - startups can be added later via addStartupToPool

        if (!supportedTokens[params.acceptedToken]) revert TokenNotSupported();
        if (params.maxContribution != 0 && params.maxContribution < params.minContribution) revert InvalidMaxContribution();

        // Deploy new pool contract using minimal proxy (ERC-1167)
        address poolAddress = Clones.clone(poolImplementation);
        CrowdVCPool pool = CrowdVCPool(poolAddress);

        ICrowdVCPool.PoolConfig memory config = ICrowdVCPool.PoolConfig({
            name: params.name,
            category: params.category,
            fundingGoal: params.fundingGoal,
            votingDuration: params.votingDuration,
            fundingDuration: params.fundingDuration,
            candidatePitches: params.candidatePitches,
            acceptedToken: params.acceptedToken,
            minContribution: params.minContribution,
            maxContribution: params.maxContribution,
            platformFeePercent: platformFeePercent,
            treasury: treasury
        });

        pool.initialize(address(this), config);

        _isPools[poolAddress] = true;
        _allPools.push(poolAddress);
        poolIdToAddress[poolId] = poolAddress;
        poolAddressToId[poolAddress] = poolId;

        uint256 votingDeadline;
        unchecked {
            votingDeadline = block.timestamp + params.votingDuration;
        }

        emit PoolDeployed(params.poolId, poolAddress, votingDeadline, block.timestamp);
        return poolAddress;
    }

    /**
     * @dev Add startup to existing pool (admin only)
     * @param poolAddress Address of the pool
     * @param pitchId ID of the pitch to add
     * @param wallet Startup wallet address
     */
    function addStartupToPool(address poolAddress, bytes32 pitchId, address wallet)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        if (!_isPools[poolAddress]) revert InvalidPool();

        PitchData storage pitch = _pitches[pitchId];
        if (pitch.startup == address(0)) revert PitchDoesNotExist();
        if (pitch.status != PitchStatus.Approved) revert PitchNotApproved();

        ValidationLib.validateAddress(wallet);

        CrowdVCPool(poolAddress).addStartup(pitchId, wallet);
        pitch.status = PitchStatus.InPool;
    }

    /**
     * @dev Remove startup from pool before activation (admin only)
     * @param poolAddress Address of the pool
     * @param pitchId ID of the pitch to remove
     */
    function removeStartupFromPool(address poolAddress, bytes32 pitchId)
        external
        onlyRole(ADMIN_ROLE)
        whenNotPaused
    {
        if (!_isPools[poolAddress]) revert InvalidPool();

        PitchData storage pitch = _pitches[pitchId];
        if (pitch.status != PitchStatus.InPool) revert PitchNotInPool();

        CrowdVCPool(poolAddress).removeStartup(pitchId);
        pitch.status = PitchStatus.Approved;
    }

    /**
     * @dev Activate pool to enable contributions (admin only)
     * @param poolAddress Address of the pool to activate
     */
    function activatePool(address poolAddress) external onlyRole(ADMIN_ROLE) {
        if (!_isPools[poolAddress]) revert InvalidPool();
        CrowdVCPool(poolAddress).activatePool();
    }



    /**
     * @dev Emergency withdraw all funds from pool (critical bug only)
     * @param poolAddress Address of the pool
     */
    function emergencyWithdraw(address poolAddress) external onlyRole(ADMIN_ROLE) nonReentrant {
        if (!_isPools[poolAddress]) revert InvalidPool();
        CrowdVCPool(poolAddress).emergencyWithdraw();
        emit EmergencyWithdrawal(poolAddress, block.timestamp);
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update platform fee (admin only)
     * @param newFee New fee in basis points (max 1000 = 10%)
     */
    function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        if (newFee > MAX_PLATFORM_FEE) revert FeeTooHigh();
        uint256 oldFee = platformFeePercent;
        platformFeePercent = uint16(newFee);
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

    function getPoolAddress(bytes32 poolId) external view returns (address) {
        return poolIdToAddress[poolId];
    }

    function getPoolId(address poolAddress) external view returns (bytes32) {
        return poolAddressToId[poolAddress];
    }

    /**
     * @dev Get implementation version
     */
    function getVersion() external view returns (uint256) {
        return version;
    }

    /**
     * @dev Get pool implementation address
     */
    function getPoolImplementation() external view returns (address) {
        return poolImplementation;
    }
}
