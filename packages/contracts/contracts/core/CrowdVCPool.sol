// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ICrowdVCPool.sol";
import "../interfaces/ICrowdVCFactory.sol";
import "../libraries/FeeCalculator.sol";
import "../libraries/ValidationLib.sol";

/**
 * @title CrowdVCPool
 * @dev Individual pool contract handling contributions, voting, and distributions
 * @notice Issues NFT receipts for contributions, implements weighted voting
 */
contract CrowdVCPool is ICrowdVCPool, ERC721, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using FeeCalculator for uint256;

    // ============ CUSTOM ERRORS ============
    error AlreadyInitialized();
    error OnlyFactory();
    error InvalidMaxContribution(uint256 maxContribution, uint256 minContribution);
    error InvalidFundingGoal();
    error InvalidDurations();
    error NoCandidatePitches();
    error InvalidToken();
    error InvalidTreasury();
    error FeeTooHigh(uint256 provided, uint256 maximum);
    error PoolNotActive();
    error VotingPeriodEnded();
    error VotingPeriodNotEnded();
    error BelowMinContribution(uint256 provided, uint256 minimum);
    error AboveMaxContribution(uint256 provided, uint256 maximum);
    error TokenNotAccepted(address token);
    error InvalidPitch(bytes32 pitchId);
    error NoContribution();
    error AlreadyWithdrawn();
    error AlreadyVotedForPitch(bytes32 pitchId);
    error AlreadyContributed();
    error NoExistingVote();
    error SamePitchVote();
    error NotVotedForPitch(bytes32 pitchId);
    error NotAWinner(bytes32 pitchId);
    error DidNotContributeToThisPitch(bytes32 pitchId);
    error InvalidMilestoneIndex(uint256 index);
    error AlreadyApprovedMilestone();
    error MilestoneNotCompleted();
    error MilestoneDisputed();
    error PitchAlreadyAdded(bytes32 pitchId);
    error InvalidWallet();
    error PitchNotInPool(bytes32 pitchId);
    error PitchHasVotes(bytes32 pitchId, uint256 votes);
    error PoolAlreadyActiveOrClosed();
    error MilestonesAlreadySet();
    error NoMilestones();
    error InvalidMilestonePercentage();
    error MilestonePercentageMismatch(uint256 total);
    error NotPitchOwner(address caller, address owner);
    error AlreadyCompleted();
    error PoolNotFunded();
    error InsufficientApprovals(uint256 current, uint256 required);
    error ExceedsAllocation(uint256 requested, uint256 available);
    error InvalidStartupWallet();
    error NoAcceptedToken();
    error PoolNotFailed();
    error AlreadyRefunded();

    // Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 private constant MAX_WINNERS = 3;
    uint256 private constant EARLY_WITHDRAWAL_PENALTY = 1000; // 10%
    uint256 private constant BASIS_POINTS = 10000;

    // Immutable factory reference
    address public immutable factory;

    // Pool configuration
    string public poolName;
    string public category;
    uint256 public fundingGoal;
    uint256 public votingDeadline;
    uint256 public fundingDeadline;
    uint256 public minContribution;
    uint256 public maxContribution; // 0 = no limit
    address[] public acceptedTokens; // Multiple tokens supported
    uint256 public platformFeePercent;
    address public treasury;
    
    // Mapping for quick token validation
    mapping(address => bool) public isAcceptedToken;

    // Pool state
    PoolStatus public status;
    uint256 public totalContributions;
    uint256 public totalPenalties; // Penalties from early withdrawals
    uint256 private _nextTokenId;

    // Candidate pitches
    bytes32[] public candidatePitches;
    mapping(bytes32 => bool) public isCandidatePitch;
    mapping(bytes32 => address) public pitchToWallet; // pitchId => startup wallet

    // Contributions - track per investor, per pitch
    mapping(address => ICrowdVCPool.Contribution) public contributionData;
    mapping(address => uint256) public contributions; // Total contribution per investor
    mapping(address => mapping(bytes32 => uint256)) public contributionsPerPitch; // investor => pitchId => amount
    mapping(uint256 => address) public tokenIdToInvestor;
    mapping(uint256 => uint256) public tokenIdToAmount;
    mapping(address => uint256[]) public investorTokenIds;
    uint256 public totalPlatformFees; // Track fees separately for refund logic

    // Voting - auto-vote on contribution
    mapping(address => bytes32) public currentVote; // investor => pitchId they voted for
    mapping(address => mapping(bytes32 => bool)) public hasVoted;
    mapping(bytes32 => uint256) public voteWeights;

    // Winners
    VoteResult[] private _winners;
    mapping(bytes32 => uint256) private _winnerIndex; // pitchId => index in _winners (1-indexed, 0 = not winner)

    // Milestones
    mapping(bytes32 => Milestone[]) private _milestones;
    mapping(bytes32 => uint256) public totalDistributed; // pitchId => amount distributed
    mapping(bytes32 => uint256) public totalAllocated; // pitchId => amount allocated
    
    // Milestone approvals: pitchId => milestoneIndex => investor => hasApproved
    mapping(bytes32 => mapping(uint256 => mapping(address => bool))) public milestoneApprovals;

    // Refunds
    mapping(address => bool) public hasRefunded;

    bool private _initialized;

    // Internal struct for sorting pitches by vote weight
    struct PitchVote {
        bytes32 pitchId;
        uint256 weight;
    }

    /**
     * @dev Constructor sets factory address
     * @notice Disables initialization on implementation contract to prevent attacks
     */
    constructor() ERC721("CrowdVC Pool Receipt", "CVCP") {
        factory = msg.sender;
        // Prevent implementation contract from being initialized
        _initialized = true;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Initialize pool (called by factory after deployment)
     */
    function initialize(
        address _factory,
        ICrowdVCPool.PoolConfig calldata _config
    ) external {
        if (_initialized) revert AlreadyInitialized();
        if (msg.sender != factory) revert OnlyFactory();
        if (_config.maxContribution != 0 && _config.maxContribution < _config.minContribution) {
            revert InvalidMaxContribution(_config.maxContribution, _config.minContribution);
        }
        if (_config.fundingGoal == 0) revert InvalidFundingGoal();
        if (_config.votingDuration == 0 || _config.fundingDuration == 0) revert InvalidDurations();
        if (_config.candidatePitches.length == 0) revert NoCandidatePitches();
        if (_config.acceptedToken == address(0)) revert InvalidToken();
        if (_config.treasury == address(0)) revert InvalidTreasury();
        if (_config.platformFeePercent > 1000) revert FeeTooHigh(_config.platformFeePercent, 1000);

        poolName = _config.name;
        category = _config.category;
        fundingGoal = _config.fundingGoal;
        votingDeadline = block.timestamp + _config.votingDuration;
        fundingDeadline = block.timestamp + _config.fundingDuration;
        
        // Set up accepted tokens (support single token for now, can add more later)
        acceptedTokens.push(_config.acceptedToken);
        isAcceptedToken[_config.acceptedToken] = true;
        
        minContribution = _config.minContribution;
        maxContribution = _config.maxContribution;
        platformFeePercent = _config.platformFeePercent;
        treasury = _config.treasury;

        candidatePitches = _config.candidatePitches;
        for (uint256 i = 0; i < _config.candidatePitches.length; i++) {
            isCandidatePitch[_config.candidatePitches[i]] = true;
        }

        status = PoolStatus.Active;
        _nextTokenId = 1;
        _initialized = true;

        _grantRole(ADMIN_ROLE, _factory);
    }

    // ============ CONTRIBUTION FUNCTIONS ============

    /**
     * @dev Contribute tokens to the pool and receive NFT receipt
     * @param amount Amount of tokens to contribute
     * @param token Token address to contribute (must be in acceptedTokens)
     * @param pitchId ID of the pitch to support (automatically casts vote)
     * @return tokenId NFT token ID representing the contribution
     */
    function contribute(uint256 amount, address token, bytes32 pitchId)
        external
        override
        nonReentrant
        returns (uint256 tokenId)
    {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (amount < minContribution) revert BelowMinContribution(amount, minContribution);
        if (maxContribution > 0 && amount > maxContribution) {
            revert AboveMaxContribution(amount, maxContribution);
        }
        if (!isAcceptedToken[token]) revert TokenNotAccepted(token);
        if (!isCandidatePitch[pitchId]) revert InvalidPitch(pitchId);

        // Calculate platform fee
        uint256 platformFee = FeeCalculator.calculatePlatformFee(amount, platformFeePercent);
        uint256 netAmount = amount - platformFee;

        // Transfer tokens from contributor
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update contribution state
        contributions[msg.sender] += amount;
        contributionsPerPitch[msg.sender][pitchId] += amount;
        totalContributions += amount;
        totalPlatformFees += platformFee;

        // Store detailed contribution data
        contributionData[msg.sender] = ICrowdVCPool.Contribution({
            investor: msg.sender,
            pitchId: pitchId,
            amount: amount,
            platformFee: platformFee,
            netAmount: netAmount,
            token: token,
            timestamp: block.timestamp,
            nftTokenId: _nextTokenId,
            withdrawn: false
        });

        // Mint NFT receipt
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        tokenIdToInvestor[tokenId] = msg.sender;
        tokenIdToAmount[tokenId] = amount;
        investorTokenIds[msg.sender].push(tokenId);

        // Automatically cast vote for the pitch (contribution = vote)
        if (!hasVoted[msg.sender][pitchId]) {
            hasVoted[msg.sender][pitchId] = true;
            currentVote[msg.sender] = pitchId;
        }
        voteWeights[pitchId] += amount;

        emit ContributionMade(msg.sender, pitchId, amount, platformFee, token, tokenId, block.timestamp);
        return tokenId;
    }

    /**
     * @dev Withdraw contribution early with penalty (before voting ends)
     */
    function withdrawEarly() external override nonReentrant {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] == 0) revert NoContribution();

        ICrowdVCPool.Contribution storage contrib = contributionData[msg.sender];
        if (contrib.withdrawn) revert AlreadyWithdrawn();

        uint256 contribution = contributions[msg.sender];
        bytes32 pitchId = contrib.pitchId;
        address token = contrib.token;
        
        contributions[msg.sender] = 0;
        totalContributions -= contribution;
        contrib.withdrawn = true;

        (uint256 penalty, uint256 refund) = FeeCalculator.calculateEarlyWithdrawalPenalty(
            contribution,
            EARLY_WITHDRAWAL_PENALTY
        );

        totalPenalties += penalty;

        // Remove vote weight
        if (hasVoted[msg.sender][pitchId]) {
            voteWeights[pitchId] -= contribution;
            hasVoted[msg.sender][pitchId] = false;
            currentVote[msg.sender] = bytes32(0);
        }

        // Burn all NFTs of this investor
        uint256[] memory tokenIds = investorTokenIds[msg.sender];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) == msg.sender) {
                _burn(tokenIds[i]);
            }
        }
        delete investorTokenIds[msg.sender];

        // Transfer refund
        IERC20(token).safeTransfer(msg.sender, refund);

        emit EarlyWithdrawal(msg.sender, contribution, penalty, refund);
    }

    // ============ VOTING FUNCTIONS ============

    /**
     * @dev Vote for a pitch (vote weight = contribution amount)
     * @param pitchId ID of the pitch to vote for
     */
    function vote(bytes32 pitchId) external override {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] == 0) revert NoContribution();
        if (!isCandidatePitch[pitchId]) revert InvalidPitch(pitchId);
        if (hasVoted[msg.sender][pitchId]) revert AlreadyVotedForPitch(pitchId);

        uint256 weight = contributions[msg.sender];
        hasVoted[msg.sender][pitchId] = true;
        voteWeights[pitchId] += weight;

        emit VoteCast(msg.sender, pitchId, weight, block.timestamp);
    }

    /**
     * @dev Change vote to a different pitch (only allowed BEFORE contributing)
     * @param newPitchId New pitch to vote for
     * @notice Once you contribute, your vote is locked to the pitch you contributed to
     */
    function changeVote(bytes32 newPitchId) external override {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] != 0) revert AlreadyContributed();
        if (!isCandidatePitch[newPitchId]) revert InvalidPitch(newPitchId);

        bytes32 oldPitchId = currentVote[msg.sender];
        if (oldPitchId == bytes32(0)) revert NoExistingVote();
        if (oldPitchId == newPitchId) revert SamePitchVote();

        // Remove vote from old pitch
        hasVoted[msg.sender][oldPitchId] = false;

        // Add vote to new pitch
        hasVoted[msg.sender][newPitchId] = true;
        currentVote[msg.sender] = newPitchId;

        emit VoteChanged(msg.sender, oldPitchId, newPitchId);
    }
    
    /**
     * @dev Legacy changeVote function for backward compatibility
     * @param oldPitchId Current pitch voted for
     * @param newPitchId New pitch to vote for
     */
    function changeVote(bytes32 oldPitchId, bytes32 newPitchId) external {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] != 0) revert AlreadyContributed();
        if (!isCandidatePitch[newPitchId]) revert InvalidPitch(newPitchId);
        if (!hasVoted[msg.sender][oldPitchId]) revert NotVotedForPitch(oldPitchId);
        if (hasVoted[msg.sender][newPitchId]) revert AlreadyVotedForPitch(newPitchId);

        // Remove vote from old pitch
        hasVoted[msg.sender][oldPitchId] = false;

        // Add vote to new pitch
        hasVoted[msg.sender][newPitchId] = true;
        currentVote[msg.sender] = newPitchId;

        emit VoteChanged(msg.sender, oldPitchId, newPitchId);
    }

    /**
     * @dev End voting period and determine winners (admin only)
     * @notice Selects top 3 pitches, handles ties by including all tied pitches
     */
    function endVoting() external override onlyRole(ADMIN_ROLE) {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp < votingDeadline && totalContributions < fundingGoal) {
            revert VotingPeriodNotEnded();
        }

        if (totalContributions < fundingGoal) {
            status = PoolStatus.Failed;
            emit PoolClosed(block.timestamp);
            return;
        }

        status = PoolStatus.VotingEnded;

        // Determine top 3 winners (or more if there's a tie)
        _determineWinners();

        // Calculate allocations
        if (_winners.length > 0) {
            uint256[] memory voteWeightArray = new uint256[](_winners.length);
            for (uint256 i = 0; i < _winners.length; i++) {
                voteWeightArray[i] = _winners[i].voteWeight;
            }

            uint256[] memory percentages = FeeCalculator.calculateAllocationPercents(voteWeightArray);

            for (uint256 i = 0; i < _winners.length; i++) {
                _winners[i].allocationPercent = percentages[i];
            }

            status = PoolStatus.Funded;

            // Platform fees were already deducted during contributions (stored in totalPlatformFees)
            // Calculate total distributable amount: original contributions - already collected fees + penalties
            uint256 netAmount = totalContributions - totalPlatformFees + totalPenalties;

            // Transfer accumulated platform fees to treasury (use first accepted token for now)
            address token = acceptedTokens.length > 0 ? acceptedTokens[0] : address(0);
            if (totalPlatformFees > 0 && token != address(0)) {
                IERC20(token).safeTransfer(treasury, totalPlatformFees);
            }

            // Calculate allocations for each winner
            for (uint256 i = 0; i < _winners.length; i++) {
                uint256 allocation = (netAmount * _winners[i].allocationPercent) / BASIS_POINTS;
                totalAllocated[_winners[i].pitchId] = allocation;
                _winners[i].allocation = allocation;
            }

            bytes32[] memory winnerIds = new bytes32[](_winners.length);
            uint256[] memory allocations = new uint256[](_winners.length);
            for (uint256 i = 0; i < _winners.length; i++) {
                winnerIds[i] = _winners[i].pitchId;
                allocations[i] = _winners[i].allocationPercent;
            }

            emit VotingEnded(block.timestamp, winnerIds, allocations);
        } else {
            status = PoolStatus.Failed;
        }

        emit PoolClosed(block.timestamp);
    }

    /**
     * @dev Internal function to determine top 3 winners with tie handling
     */
    function _determineWinners() private {
        uint256 length = candidatePitches.length;
        if (length == 0) return;

        // Create array of pitches with their vote weights
        PitchVote[] memory pitchVotes = new PitchVote[](length);
        for (uint256 i = 0; i < length; i++) {
            pitchVotes[i] = PitchVote({
                pitchId: candidatePitches[i],
                weight: voteWeights[candidatePitches[i]]
            });
        }

        // Sort by vote weight (descending) - simple bubble sort
        for (uint256 i = 0; i < length; i++) {
            for (uint256 j = i + 1; j < length; j++) {
                if (pitchVotes[j].weight > pitchVotes[i].weight) {
                    PitchVote memory temp = pitchVotes[i];
                    pitchVotes[i] = pitchVotes[j];
                    pitchVotes[j] = temp;
                }
            }
        }

        // Select top 3 (or more if tie at 3rd place)
        uint256 winnerCount = 0;
        uint256 thirdPlaceWeight = 0;

        // Get top 3 or fewer
        for (uint256 i = 0; i < length && i < MAX_WINNERS; i++) {
            if (pitchVotes[i].weight == 0) break;

            if (i == MAX_WINNERS - 1) {
                thirdPlaceWeight = pitchVotes[i].weight;
            }
            winnerCount++;
        }

        // Check for ties at 3rd place
        if (winnerCount == MAX_WINNERS && thirdPlaceWeight > 0) {
            for (uint256 i = MAX_WINNERS; i < length; i++) {
                if (pitchVotes[i].weight == thirdPlaceWeight) {
                    winnerCount++;
                } else {
                    break;
                }
            }
        }

        // Populate winners array
        for (uint256 i = 0; i < winnerCount; i++) {
            bytes32 pitchId = pitchVotes[i].pitchId;
            address wallet = pitchToWallet[pitchId];
            
            _winners.push(VoteResult({
                pitchId: pitchId,
                wallet: wallet,
                voteWeight: pitchVotes[i].weight,
                allocationPercent: 0, // Will be calculated after
                allocation: 0, // Will be calculated after
                claimed: 0 // Nothing claimed yet
            }));
            _winnerIndex[pitchId] = i + 1;
        }
    }

    // ============ POOL MANAGEMENT FUNCTIONS ============

    /**
     * @dev Add startup to pool (factory only)
     * @param pitchId ID of the pitch to add
     * @param wallet Startup wallet address
     */
    function addStartup(bytes32 pitchId, address wallet) external onlyRole(ADMIN_ROLE) {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (isCandidatePitch[pitchId]) revert PitchAlreadyAdded(pitchId);
        if (wallet == address(0)) revert InvalidWallet();

        candidatePitches.push(pitchId);
        isCandidatePitch[pitchId] = true;
        pitchToWallet[pitchId] = wallet;

        emit StartupAdded(pitchId, wallet);
    }

    /**
     * @dev Remove startup from pool before voting (factory only)
     * @param pitchId ID of the pitch to remove
     */
    function removeStartup(bytes32 pitchId) external onlyRole(ADMIN_ROLE) {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (!isCandidatePitch[pitchId]) revert PitchNotInPool(pitchId);
        if (voteWeights[pitchId] != 0) revert PitchHasVotes(pitchId, voteWeights[pitchId]);

        isCandidatePitch[pitchId] = false;

        // Remove from candidatePitches array
        for (uint256 i = 0; i < candidatePitches.length; i++) {
            if (candidatePitches[i] == pitchId) {
                candidatePitches[i] = candidatePitches[candidatePitches.length - 1];
                candidatePitches.pop();
                break;
            }
        }

        emit StartupRemoved(pitchId);
    }

    /**
     * @dev Activate pool (factory only)
     */
    function activatePool() external onlyRole(ADMIN_ROLE) {
        if (status != PoolStatus.Active) revert PoolAlreadyActiveOrClosed();
        emit PoolActivated(block.timestamp);
    }



    /**
     * @dev Emergency withdraw all funds (critical bug only)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) nonReentrant {
        // Withdraw all accepted tokens
        for (uint256 i = 0; i < acceptedTokens.length; i++) {
            address token = acceptedTokens[i];
            uint256 balance = IERC20(token).balanceOf(address(this));
            if (balance > 0) {
                IERC20(token).safeTransfer(treasury, balance);
            }
        }
        
        status = PoolStatus.Closed;
        emit PoolClosed(block.timestamp);
    }

    // ============ MILESTONE FUNCTIONS ============

    /**
     * @dev Add milestones for a winning pitch (admin only)
     */
    function addMilestones(bytes32 pitchId, Milestone[] calldata milestones)
        external
        override
        onlyRole(ADMIN_ROLE)
    {
        if (_winnerIndex[pitchId] == 0) revert NotAWinner(pitchId);
        if (_milestones[pitchId].length != 0) revert MilestonesAlreadySet();
        if (milestones.length == 0) revert NoMilestones();

        uint256 totalPercent = 0;
        
        // Calculate total vote weight for this pitch (for approval threshold)
        uint256 pitchVoteWeight = voteWeights[pitchId];
        uint256 approvalsNeeded = (pitchVoteWeight * 51) / 100; // 51% threshold
        
        for (uint256 i = 0; i < milestones.length; i++) {
            if (milestones[i].fundingPercent == 0) revert InvalidMilestonePercentage();
            
            // Create a new milestone with proper initialization
            _milestones[pitchId].push(Milestone({
                description: milestones[i].description,
                fundingPercent: milestones[i].fundingPercent,
                deadline: milestones[i].deadline,
                completed: false,
                disputed: false,
                evidenceURI: "",
                approvalCount: 0,
                approvalsNeeded: approvalsNeeded
            }));
            
            totalPercent += milestones[i].fundingPercent;
        }

        if (totalPercent != BASIS_POINTS) revert MilestonePercentageMismatch(totalPercent);
    }
    
    /**
     * @dev Approve a milestone completion (investor only)
     * @param pitchId ID of the winning pitch
     * @param milestoneIndex Index of the milestone to approve
     */
    function approveMilestone(bytes32 pitchId, uint256 milestoneIndex) external override {
        if (_winnerIndex[pitchId] == 0) revert NotAWinner(pitchId);
        if (contributionsPerPitch[msg.sender][pitchId] == 0) revert DidNotContributeToThisPitch(pitchId);
        if (milestoneIndex >= _milestones[pitchId].length) revert InvalidMilestoneIndex(milestoneIndex);
        if (milestoneApprovals[pitchId][milestoneIndex][msg.sender]) revert AlreadyApprovedMilestone();

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        if (!milestone.completed) revert MilestoneNotCompleted();
        if (milestone.disputed) revert MilestoneDisputed();

        // Record approval
        milestoneApprovals[pitchId][milestoneIndex][msg.sender] = true;
        
        // Add this investor's contribution weight to approval count
        uint256 investorWeight = contributionsPerPitch[msg.sender][pitchId];
        milestone.approvalCount += investorWeight;

        emit MilestoneApproved(pitchId, milestoneIndex, msg.sender);
    }

    /**
     * @dev Complete a milestone (startup only)
     */
    function completeMilestone(
        bytes32 pitchId,
        uint256 milestoneIndex,
        string calldata evidenceURI
    ) external override {
        if (_winnerIndex[pitchId] == 0) revert NotAWinner(pitchId);

        // Get startup address from factory
        ICrowdVCFactory factoryContract = ICrowdVCFactory(factory);
        ICrowdVCFactory.PitchData memory pitchData = factoryContract.getPitchData(pitchId);
        if (msg.sender != pitchData.startup) revert NotPitchOwner(msg.sender, pitchData.startup);

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        if (milestone.completed) revert AlreadyCompleted();
        if (milestone.disputed) revert MilestoneDisputed();

        milestone.completed = true;
        milestone.evidenceURI = evidenceURI;

        emit MilestoneCompleted(pitchId, milestoneIndex, 0);
    }

    /**
     * @dev Distribute funds for completed milestone (admin or automatic when approved)
     * @notice Requires sufficient investor approval (51% of pitch contributors)
     */
    function distributeMilestoneFunds(bytes32 pitchId, uint256 milestoneIndex)
        external
        override
        onlyRole(ADMIN_ROLE)
        nonReentrant
    {
        if (status != PoolStatus.Funded) revert PoolNotFunded();
        if (_winnerIndex[pitchId] == 0) revert NotAWinner(pitchId);

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        if (!milestone.completed) revert MilestoneNotCompleted();
        if (milestone.disputed) revert MilestoneDisputed();
        if (milestone.approvalCount < milestone.approvalsNeeded) {
            revert InsufficientApprovals(milestone.approvalCount, milestone.approvalsNeeded);
        }

        // Calculate amount
        uint256 amount = (totalAllocated[pitchId] * milestone.fundingPercent) / BASIS_POINTS;
        uint256 available = totalAllocated[pitchId] - totalDistributed[pitchId];
        if (amount > available) revert ExceedsAllocation(amount, available);

        totalDistributed[pitchId] += amount;

        // Update winner's claimed amount
        uint256 winnerIdx = _winnerIndex[pitchId] - 1;
        if (winnerIdx < _winners.length) {
            _winners[winnerIdx].claimed += amount;
        }

        // Get startup wallet
        address startupWallet = pitchToWallet[pitchId];
        if (startupWallet == address(0)) revert InvalidStartupWallet();

        // Transfer funds (use first accepted token for now)
        address token = acceptedTokens.length > 0 ? acceptedTokens[0] : address(0);
        if (token == address(0)) revert NoAcceptedToken();
        IERC20(token).safeTransfer(startupWallet, amount);

        emit FundsDistributed(pitchId, startupWallet, amount);
        emit FundsClaimed(pitchId, startupWallet, amount);
        emit MilestoneCompleted(pitchId, milestoneIndex, amount);
    }

    // ============ REFUND FUNCTIONS ============

    /**
     * @dev Request refund if pool failed to meet goal
     * @notice Returns the FULL original amount including platform fee (fair refund)
     */
    function requestRefund() external override nonReentrant {
        if (status != PoolStatus.Failed) revert PoolNotFailed();
        if (contributions[msg.sender] == 0) revert NoContribution();
        if (hasRefunded[msg.sender]) revert AlreadyRefunded();

        ICrowdVCPool.Contribution storage contrib = contributionData[msg.sender];
        
        // Refund the full gross amount (before platform fee was deducted)
        uint256 refundAmount = contrib.amount;
        address token = contrib.token;
        
        hasRefunded[msg.sender] = true;
        contrib.withdrawn = true;

        // Transfer full refund including platform fee
        IERC20(token).safeTransfer(msg.sender, refundAmount);

        emit Refunded(msg.sender, refundAmount);
    }

    // ============ VIEW FUNCTIONS ============

    function getPoolInfo() external view override returns (PoolInfo memory) {
        return PoolInfo({
            name: poolName,
            category: category,
            fundingGoal: fundingGoal,
            votingDeadline: votingDeadline,
            fundingDeadline: fundingDeadline,
            totalContributions: totalContributions,
            status: status,
            acceptedToken: acceptedTokens.length > 0 ? acceptedTokens[0] : address(0),
            minContribution: minContribution,
            maxContribution: maxContribution
        });
    }

    function getDetailedContribution(address investor) external view override returns (ICrowdVCPool.Contribution memory) {
        return contributionData[investor];
    }

    function getNFTsByInvestor(address investor) external view override returns (uint256[] memory) {
        return investorTokenIds[investor];
    }

    function getWinners() external view override returns (VoteResult[] memory) {
        return _winners;
    }

    function getContribution(address investor) external view override returns (uint256) {
        return contributions[investor];
    }

    function getVoteWeight(bytes32 pitchId) external view override returns (uint256) {
        return voteWeights[pitchId];
    }

    function getMilestones(bytes32 pitchId) external view override returns (Milestone[] memory) {
        return _milestones[pitchId];
    }

    function getCandidatePitches() external view returns (bytes32[] memory) {
        return candidatePitches;
    }

    function getInvestorTokenIds(address investor) external view returns (uint256[] memory) {
        return investorTokenIds[investor];
    }

    // ============ OVERRIDES ============

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override token URI to provide metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        // In production, this would return a proper metadata URI
        return string(abi.encodePacked("https://crowdvc.io/receipt/", poolName, "/", tokenId));
    }

    // ============ SOULBOUND TOKEN OVERRIDES ============

    /**
     * @dev Prevent transfers - NFTs are soulbound (non-transferable)
     * @notice This prevents vote buying and ensures receipts stay with original contributors
     * @notice Overrides the internal _update function to block all transfers except minting and burning
     */
    error SoulboundToken();

    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert SoulboundToken();
        }
        
        return super._update(to, tokenId, auth);
    }
}
