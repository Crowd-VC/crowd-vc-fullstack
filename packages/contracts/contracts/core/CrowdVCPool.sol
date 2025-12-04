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
    error MaxVotesExceeded(uint256 current, uint256 max);
    error NotVotedForAnyPitch();

    // Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 private constant MAX_WINNERS = 3;
    uint256 private constant MAX_VOTES_PER_INVESTOR = 3; // Max pitches an investor can vote for
    uint256 private constant EARLY_WITHDRAWAL_PENALTY = 1000; // 10%
    uint256 private constant BASIS_POINTS = 10000;

    // Immutable factory reference
    address public immutable factory;

    // Pool configuration
    string public poolName;
    string public category;
    uint256 public fundingGoal;
    uint256 public votingDeadline;
    uint256 public minContribution;
    uint256 public maxContribution; // 0 = no limit
    address[] public acceptedTokens; // Multiple tokens supported
    uint256 public platformFeePercent;
    address public treasury;
    
    // Mapping for quick token validation
    mapping(address => bool) public isAcceptedToken;

    // Pool state
    PoolStatus public status;
    uint256 public totalContributions; // Tracks netAmount after platform fees (actual pool funds)
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

    // Voting - multi-vote support (up to MAX_VOTES_PER_INVESTOR pitches)
    mapping(address => bytes32[]) private _investorVotes; // investor => array of pitchIds voted for
    mapping(address => mapping(bytes32 => bool)) public hasVotedFor; // investor => pitchId => hasVoted
    mapping(address => mapping(bytes32 => uint256)) public voteWeightPerPitch; // investor => pitchId => weight
    mapping(bytes32 => uint256) public voteWeights; // pitchId => total vote weight

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
     * @notice Contribution and voting are separate actions. Call vote() to allocate your vote weight.
     * @param amount Amount of tokens to contribute
     * @param token Token address to contribute (must be in acceptedTokens)
     * @return tokenId NFT token ID representing the contribution
     */
    function contribute(uint256 amount, address token)
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

        // Calculate platform fee
        uint256 platformFee = FeeCalculator.calculatePlatformFee(amount, platformFeePercent);
        uint256 netAmount = amount - platformFee;

        // Transfer tokens from contributor (full amount including fee)
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Transfer platform fee to Treasury immediately
        if (platformFee > 0) {
            IERC20(token).safeTransfer(treasury, platformFee);
            emit PlatformFeeTransferred(token, platformFee, block.timestamp);
        }

        // Update contribution state (track netAmount for pool accounting)
        contributions[msg.sender] += netAmount;
        totalContributions += netAmount;
        tokenId = _nextTokenId++;

        // Store detailed contribution data
        contributionData[msg.sender] = ICrowdVCPool.Contribution({
            investor: msg.sender,
            amount: amount,          // Gross amount for records
            platformFee: platformFee,
            netAmount: netAmount,    // Net amount for penalty calculation
            token: token,
            timestamp: block.timestamp,
            nftTokenId: tokenId,
            withdrawn: false
        });

        // Mint NFT receipt
        _safeMint(msg.sender, tokenId);

        tokenIdToInvestor[tokenId] = msg.sender;
        tokenIdToAmount[tokenId] = netAmount; // Store netAmount for NFT tracking
        investorTokenIds[msg.sender].push(tokenId);

        emit ContributionMade(msg.sender, amount, platformFee, token, tokenId, block.timestamp);
        return tokenId;
    }

    /**
     * @dev Withdraw contribution early with penalty (before voting ends)
     * @notice Penalty is calculated on netAmount (after platform fee), then transferred to Treasury
     */
    function withdrawEarly() external override nonReentrant {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] == 0) revert NoContribution();

        ICrowdVCPool.Contribution storage contrib = contributionData[msg.sender];
        if (contrib.withdrawn) revert AlreadyWithdrawn();

        uint256 netAmount = contrib.netAmount; // Use netAmount for penalty calculation
        address token = contrib.token;

        // Clear contribution state
        contributions[msg.sender] = 0;
        totalContributions -= netAmount;
        contrib.withdrawn = true;

        // Calculate penalty on netAmount (after platform fee was already sent to Treasury)
        (uint256 penalty, uint256 refund) = FeeCalculator.calculateEarlyWithdrawalPenalty(
            netAmount,
            EARLY_WITHDRAWAL_PENALTY
        );

        // Clear all votes and their weights
        bytes32[] storage investorVotes = _investorVotes[msg.sender];
        uint256 numVotes = investorVotes.length;

        for (uint256 i = 0; i < numVotes; i++) {
            bytes32 pitchId = investorVotes[i];
            uint256 weight = voteWeightPerPitch[msg.sender][pitchId];

            // Remove vote weight from pitch
            if (weight > 0) {
                voteWeights[pitchId] -= weight;
                voteWeightPerPitch[msg.sender][pitchId] = 0;
            }

            // Clear voting flags
            hasVotedFor[msg.sender][pitchId] = false;
            contributionsPerPitch[msg.sender][pitchId] = 0;
        }

        // Clear investor votes array
        delete _investorVotes[msg.sender];

        if (numVotes > 0) {
            emit VotesCleared(msg.sender, numVotes, block.timestamp);
        }

        // Burn all NFTs of this investor
        uint256[] memory tokenIds = investorTokenIds[msg.sender];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) == msg.sender) {
                _burn(tokenIds[i]);
            }
        }
        delete investorTokenIds[msg.sender];

        // Transfer penalty to Treasury
        if (penalty > 0) {
            IERC20(token).safeTransfer(treasury, penalty);
            emit PenaltyTransferred(msg.sender, token, penalty, block.timestamp);
        }

        // Transfer refund to user
        IERC20(token).safeTransfer(msg.sender, refund);

        emit EarlyWithdrawal(msg.sender, netAmount, penalty, refund);
    }

    // ============ VOTING FUNCTIONS ============

    /**
     * @dev Vote for a pitch (up to MAX_VOTES_PER_INVESTOR pitches)
     * @notice Vote weight is equally distributed among all voted pitches
     * @param pitchId ID of the pitch to vote for
     */
    function vote(bytes32 pitchId) external override {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] == 0) revert NoContribution();
        if (!isCandidatePitch[pitchId]) revert InvalidPitch(pitchId);
        if (hasVotedFor[msg.sender][pitchId]) revert AlreadyVotedForPitch(pitchId);

        uint256 currentVoteCount = _investorVotes[msg.sender].length;
        if (currentVoteCount >= MAX_VOTES_PER_INVESTOR) {
            revert MaxVotesExceeded(currentVoteCount, MAX_VOTES_PER_INVESTOR);
        }

        // Add new vote
        _investorVotes[msg.sender].push(pitchId);
        hasVotedFor[msg.sender][pitchId] = true;

        // Recalculate vote weights for all voted pitches (equal distribution)
        _redistributeVoteWeights(msg.sender);

        // Get the weight assigned to this new pitch
        uint256 weight = voteWeightPerPitch[msg.sender][pitchId];

        // Track contribution per pitch for milestone approval
        contributionsPerPitch[msg.sender][pitchId] = weight;

        emit VoteCast(msg.sender, pitchId, weight, block.timestamp);
    }

    /**
     * @dev Change a vote from one pitch to another
     * @param oldPitchId Current pitch voted for (must have voted for this)
     * @param newPitchId New pitch to vote for
     */
    function changeVote(bytes32 oldPitchId, bytes32 newPitchId) external override {
        if (status != PoolStatus.Active) revert PoolNotActive();
        if (block.timestamp >= votingDeadline) revert VotingPeriodEnded();
        if (contributions[msg.sender] == 0) revert NoContribution();
        if (!isCandidatePitch[newPitchId]) revert InvalidPitch(newPitchId);
        if (!hasVotedFor[msg.sender][oldPitchId]) revert NotVotedForPitch(oldPitchId);
        if (hasVotedFor[msg.sender][newPitchId]) revert AlreadyVotedForPitch(newPitchId);
        if (oldPitchId == newPitchId) revert SamePitchVote();

        // Remove old vote weight
        uint256 oldWeight = voteWeightPerPitch[msg.sender][oldPitchId];
        voteWeights[oldPitchId] -= oldWeight;
        voteWeightPerPitch[msg.sender][oldPitchId] = 0;
        hasVotedFor[msg.sender][oldPitchId] = false;
        contributionsPerPitch[msg.sender][oldPitchId] = 0;

        // Update the _investorVotes array: replace oldPitchId with newPitchId
        bytes32[] storage votes = _investorVotes[msg.sender];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i] == oldPitchId) {
                votes[i] = newPitchId;
                break;
            }
        }

        // Add new vote
        hasVotedFor[msg.sender][newPitchId] = true;

        // No need to redistribute - just assign the same weight to the new pitch
        voteWeightPerPitch[msg.sender][newPitchId] = oldWeight;
        voteWeights[newPitchId] += oldWeight;
        contributionsPerPitch[msg.sender][newPitchId] = oldWeight;

        emit VoteChanged(msg.sender, oldPitchId, newPitchId);
    }

    /**
     * @dev Internal function to redistribute vote weights equally among all voted pitches
     * @param investor Address of the investor whose votes to redistribute
     */
    function _redistributeVoteWeights(address investor) private {
        bytes32[] storage votes = _investorVotes[investor];
        uint256 voteCount = votes.length;
        if (voteCount == 0) return;

        uint256 totalContribution = contributions[investor];
        uint256 weightPerPitch = totalContribution / voteCount;

        // First, remove old weights from all pitches
        for (uint256 i = 0; i < voteCount; i++) {
            bytes32 pitchId = votes[i];
            uint256 oldWeight = voteWeightPerPitch[investor][pitchId];
            if (oldWeight > 0) {
                voteWeights[pitchId] -= oldWeight;
            }
        }

        // Then, add new equal weights
        for (uint256 i = 0; i < voteCount; i++) {
            bytes32 pitchId = votes[i];
            voteWeightPerPitch[investor][pitchId] = weightPerPitch;
            voteWeights[pitchId] += weightPerPitch;
            contributionsPerPitch[investor][pitchId] = weightPerPitch;
        }
    }

    /**
     * @dev End voting period and determine winners (admin only)
     * @notice Selects top 3 pitches, handles ties by including all tied pitches
     * @notice Platform fees and penalties were already transferred to Treasury during contribute/withdraw
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

            // totalContributions already reflects net funds (after platform fees sent to Treasury)
            // Penalties from early withdrawals were also sent directly to Treasury
            // So totalContributions is the actual pool balance available for distribution
            uint256 distributableAmount = totalContributions;

            // Calculate allocations for each winner
            for (uint256 i = 0; i < _winners.length; i++) {
                uint256 allocation = (distributableAmount * _winners[i].allocationPercent) / BASIS_POINTS;
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
     * @notice Returns the netAmount (after platform fee) since fees were already sent to Treasury
     * @notice Platform fees are NOT refunded - they were transferred to Treasury at contribution time
     */
    function requestRefund() external override nonReentrant {
        if (status != PoolStatus.Failed) revert PoolNotFailed();
        if (contributions[msg.sender] == 0) revert NoContribution();
        if (hasRefunded[msg.sender]) revert AlreadyRefunded();

        ICrowdVCPool.Contribution storage contrib = contributionData[msg.sender];

        // Refund the netAmount (what's in the pool after platform fee was sent to Treasury)
        uint256 refundAmount = contrib.netAmount;
        address token = contrib.token;

        hasRefunded[msg.sender] = true;
        contrib.withdrawn = true;
        contributions[msg.sender] = 0;

        // Transfer refund (netAmount only - platform fee was already sent to Treasury)
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

    /**
     * @dev Check if an investor has voted for a specific pitch
     * @param voter Address of the investor
     * @param pitchId ID of the pitch
     * @return True if the investor has voted for this pitch
     */
    function hasVoted(address voter, bytes32 pitchId) external view override returns (bool) {
        return hasVotedFor[voter][pitchId];
    }

    /**
     * @dev Get all pitches an investor has voted for
     * @param investor Address of the investor
     * @return Array of pitch IDs the investor has voted for
     */
    function getInvestorVotes(address investor) external view override returns (bytes32[] memory) {
        return _investorVotes[investor];
    }

    /**
     * @dev Get the number of pitches an investor has voted for
     * @param investor Address of the investor
     * @return Number of votes cast
     */
    function getInvestorVoteCount(address investor) external view override returns (uint256) {
        return _investorVotes[investor].length;
    }

    /**
     * @dev Get the maximum number of pitches an investor can vote for
     * @return Maximum votes per investor
     */
    function getMaxVotesPerInvestor() external pure override returns (uint256) {
        return MAX_VOTES_PER_INVESTOR;
    }

    /**
     * @dev Get the vote weight an investor has allocated to a specific pitch
     * @param investor Address of the investor
     * @param pitchId ID of the pitch
     * @return Weight allocated to this pitch
     */
    function getInvestorVoteWeightForPitch(address investor, bytes32 pitchId) external view returns (uint256) {
        return voteWeightPerPitch[investor][pitchId];
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
