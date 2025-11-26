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
        require(!_initialized, "Already initialized");
        require(msg.sender == factory, "Only factory");
        require(_config.maxContribution == 0 || _config.maxContribution >= _config.minContribution, "Invalid max contribution");
        require(_config.fundingGoal > 0, "Invalid funding goal");
        require(_config.votingDuration > 0 && _config.fundingDuration > 0, "Invalid durations");
        require(_config.candidatePitches.length > 0, "No candidate pitches");
        require(_config.acceptedToken != address(0), "Invalid token");
        require(_config.treasury != address(0), "Invalid treasury");
        require(_config.platformFeePercent <= 1000, "Fee too high"); // Max 10%

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
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(amount >= minContribution, "Below minimum contribution");
        if (maxContribution > 0) {
            require(amount <= maxContribution, "Above maximum contribution");
        }
        require(isAcceptedToken[token], "Token not accepted");
        require(isCandidatePitch[pitchId], "Invalid pitch");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting ended");
        require(contributions[msg.sender] > 0, "No contribution");

        ICrowdVCPool.Contribution storage contrib = contributionData[msg.sender];
        require(!contrib.withdrawn, "Already withdrawn");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(contributions[msg.sender] > 0, "No contribution");
        require(isCandidatePitch[pitchId], "Invalid pitch");
        require(!hasVoted[msg.sender][pitchId], "Already voted for this pitch");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(contributions[msg.sender] == 0, "Already contributed - vote is locked");
        require(isCandidatePitch[newPitchId], "Invalid pitch");

        bytes32 oldPitchId = currentVote[msg.sender];
        require(oldPitchId != bytes32(0), "No existing vote");
        require(oldPitchId != newPitchId, "Already voted for this pitch");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(contributions[msg.sender] == 0, "Already contributed - vote is locked");
        require(isCandidatePitch[newPitchId], "Invalid new pitch");
        require(hasVoted[msg.sender][oldPitchId], "Haven't voted for old pitch");
        require(!hasVoted[msg.sender][newPitchId], "Already voted for new pitch");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(
            block.timestamp >= votingDeadline || totalContributions >= fundingGoal,
            "Voting period not ended"
        );

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
        require(status == PoolStatus.Active, "Pool not active");
        require(!isCandidatePitch[pitchId], "Pitch already added");
        require(wallet != address(0), "Invalid wallet");

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
        require(status == PoolStatus.Active, "Pool not active");
        require(isCandidatePitch[pitchId], "Pitch not in pool");
        require(voteWeights[pitchId] == 0, "Pitch has votes");

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
        require(status == PoolStatus.Active, "Pool already active or closed");
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
        require(_winnerIndex[pitchId] > 0, "Not a winner");
        require(_milestones[pitchId].length == 0, "Milestones already set");
        require(milestones.length > 0, "No milestones");

        uint256 totalPercent = 0;
        
        // Calculate total vote weight for this pitch (for approval threshold)
        uint256 pitchVoteWeight = voteWeights[pitchId];
        uint256 approvalsNeeded = (pitchVoteWeight * 51) / 100; // 51% threshold
        
        for (uint256 i = 0; i < milestones.length; i++) {
            require(milestones[i].fundingPercent > 0, "Invalid milestone percentage");
            
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

        require(totalPercent == BASIS_POINTS, "Milestones must total 100%");
    }
    
    /**
     * @dev Approve a milestone completion (investor only)
     * @param pitchId ID of the winning pitch
     * @param milestoneIndex Index of the milestone to approve
     */
    function approveMilestone(bytes32 pitchId, uint256 milestoneIndex) external override {
        require(_winnerIndex[pitchId] > 0, "Not a winner");
        require(contributionsPerPitch[msg.sender][pitchId] > 0, "Did not contribute to this pitch");
        require(milestoneIndex < _milestones[pitchId].length, "Invalid milestone index");
        require(!milestoneApprovals[pitchId][milestoneIndex][msg.sender], "Already approved");

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        require(milestone.completed, "Milestone not marked complete");
        require(!milestone.disputed, "Milestone is disputed");

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
        require(_winnerIndex[pitchId] > 0, "Not a winner");

        // Get startup address from factory
        ICrowdVCFactory factoryContract = ICrowdVCFactory(factory);
        ICrowdVCFactory.PitchData memory pitchData = factoryContract.getPitchData(pitchId);
        require(msg.sender == pitchData.startup, "Not pitch owner");

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        require(!milestone.completed, "Already completed");
        require(!milestone.disputed, "Milestone disputed");

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
        require(status == PoolStatus.Funded, "Pool not funded");
        require(_winnerIndex[pitchId] > 0, "Not a winner");

        Milestone storage milestone = _milestones[pitchId][milestoneIndex];
        require(milestone.completed, "Milestone not completed");
        require(!milestone.disputed, "Milestone disputed");
        require(milestone.approvalCount >= milestone.approvalsNeeded, "Insufficient investor approvals");

        // Calculate amount
        uint256 amount = (totalAllocated[pitchId] * milestone.fundingPercent) / BASIS_POINTS;
        require(totalDistributed[pitchId] + amount <= totalAllocated[pitchId], "Exceeds allocation");

        totalDistributed[pitchId] += amount;

        // Update winner's claimed amount
        uint256 winnerIdx = _winnerIndex[pitchId] - 1;
        if (winnerIdx < _winners.length) {
            _winners[winnerIdx].claimed += amount;
        }

        // Get startup wallet
        address startupWallet = pitchToWallet[pitchId];
        require(startupWallet != address(0), "Invalid startup wallet");

        // Transfer funds (use first accepted token for now)
        address token = acceptedTokens.length > 0 ? acceptedTokens[0] : address(0);
        require(token != address(0), "No accepted token");
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
        require(status == PoolStatus.Failed, "Pool not failed");
        require(contributions[msg.sender] > 0, "No contribution");
        require(!hasRefunded[msg.sender], "Already refunded");

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
