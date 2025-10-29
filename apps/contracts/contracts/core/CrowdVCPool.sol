// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../interfaces/ICrowdVCPool.sol";
import "../interfaces/ICrowdVCFactory.sol";
import "../libraries/FeeCalculator.sol";
import "../libraries/ValidationLib.sol";

/**
 * @title CrowdVCPool
 * @dev Individual pool contract handling contributions, voting, and distributions
 * @notice Issues NFT receipts for contributions, implements weighted voting
 */
contract CrowdVCPool is ICrowdVCPool, ERC721, AccessControl, ReentrancyGuard, Pausable {
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
    address public acceptedToken;
    uint256 public platformFeePercent;
    address public treasury;

    // Pool state
    PoolStatus public status;
    uint256 public totalContributions;
    uint256 public totalPenalties; // Penalties from early withdrawals
    uint256 private _nextTokenId;

    // Candidate pitches
    bytes32[] public candidatePitches;
    mapping(bytes32 => bool) public isCandidatePitch;

    // Contributions
    mapping(address => uint256) public contributions;
    mapping(uint256 => address) public tokenIdToInvestor;
    mapping(uint256 => uint256) public tokenIdToAmount;
    mapping(address => uint256[]) public investorTokenIds;

    // Voting
    mapping(address => mapping(bytes32 => bool)) public hasVoted;
    mapping(bytes32 => uint256) public voteWeights;

    // Winners
    VoteResult[] private _winners;
    mapping(bytes32 => uint256) private _winnerIndex; // pitchId => index in _winners (1-indexed, 0 = not winner)

    // Milestones
    mapping(bytes32 => Milestone[]) private _milestones;
    mapping(bytes32 => uint256) public totalDistributed; // pitchId => amount distributed
    mapping(bytes32 => uint256) public totalAllocated; // pitchId => amount allocated

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
     */
    constructor() ERC721("CrowdVC Pool Receipt", "CVCP") {
        factory = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Initialize pool (called by factory after deployment)
     */
    function initialize(
        address _factory,
        string calldata _name,
        string calldata _category,
        uint256 _fundingGoal,
        uint256 _votingDuration,
        uint256 _fundingDuration,
        bytes32[] calldata _candidatePitches,
        address _acceptedToken,
        uint256 _minContribution,
        uint256 _platformFeePercent,
        address _treasury
    ) external {
        require(!_initialized, "Already initialized");
        require(msg.sender == factory, "Only factory");

        poolName = _name;
        category = _category;
        fundingGoal = _fundingGoal;
        votingDeadline = block.timestamp + _votingDuration;
        fundingDeadline = block.timestamp + _fundingDuration;
        acceptedToken = _acceptedToken;
        minContribution = _minContribution;
        platformFeePercent = _platformFeePercent;
        treasury = _treasury;

        candidatePitches = _candidatePitches;
        for (uint256 i = 0; i < _candidatePitches.length; i++) {
            isCandidatePitch[_candidatePitches[i]] = true;
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
     * @return tokenId NFT token ID representing the contribution
     */
    function contribute(uint256 amount)
        external
        override
        nonReentrant
        whenNotPaused
        returns (uint256 tokenId)
    {
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting period ended");
        require(amount >= minContribution, "Below minimum contribution");

        // Transfer tokens from contributor
        IERC20(acceptedToken).safeTransferFrom(msg.sender, address(this), amount);

        // Update state
        contributions[msg.sender] += amount;
        totalContributions += amount;

        // Mint NFT receipt
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        tokenIdToInvestor[tokenId] = msg.sender;
        tokenIdToAmount[tokenId] = amount;
        investorTokenIds[msg.sender].push(tokenId);

        emit ContributionMade(msg.sender, amount, tokenId, block.timestamp);
        return tokenId;
    }

    /**
     * @dev Withdraw contribution early with penalty (before voting ends)
     */
    function withdrawEarly() external override nonReentrant {
        require(status == PoolStatus.Active, "Pool not active");
        require(block.timestamp < votingDeadline, "Voting ended");
        require(contributions[msg.sender] > 0, "No contribution");

        uint256 contribution = contributions[msg.sender];
        contributions[msg.sender] = 0;
        totalContributions -= contribution;

        (uint256 penalty, uint256 refund) = FeeCalculator.calculateEarlyWithdrawalPenalty(
            contribution,
            EARLY_WITHDRAWAL_PENALTY
        );

        totalPenalties += penalty;

        // Burn all NFTs of this investor
        uint256[] memory tokenIds = investorTokenIds[msg.sender];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (_ownerOf(tokenIds[i]) == msg.sender) {
                _burn(tokenIds[i]);
            }
        }
        delete investorTokenIds[msg.sender];

        // Transfer refund
        IERC20(acceptedToken).safeTransfer(msg.sender, refund);

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

            // Calculate total amount after platform fee and penalties
            uint256 platformFee = FeeCalculator.calculatePlatformFee(totalContributions, platformFeePercent);
            uint256 netAmount = totalContributions - platformFee + totalPenalties;

            // Transfer platform fee to treasury
            if (platformFee > 0) {
                IERC20(acceptedToken).safeTransfer(treasury, platformFee);
            }

            // Calculate allocations for each winner
            for (uint256 i = 0; i < _winners.length; i++) {
                totalAllocated[_winners[i].pitchId] = (netAmount * _winners[i].allocationPercent) / BASIS_POINTS;
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
            _winners.push(VoteResult({
                pitchId: pitchVotes[i].pitchId,
                voteWeight: pitchVotes[i].weight,
                allocationPercent: 0 // Will be calculated after
            }));
            _winnerIndex[pitchVotes[i].pitchId] = i + 1;
        }
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
        for (uint256 i = 0; i < milestones.length; i++) {
            _milestones[pitchId].push(milestones[i]);
            totalPercent += milestones[i].fundingPercent;
        }

        require(totalPercent == BASIS_POINTS, "Milestones must total 100%");
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
     * @dev Distribute funds for completed milestone (admin only)
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

        // Calculate amount
        uint256 amount = (totalAllocated[pitchId] * milestone.fundingPercent) / BASIS_POINTS;
        require(totalDistributed[pitchId] + amount <= totalAllocated[pitchId], "Exceeds allocation");

        totalDistributed[pitchId] += amount;

        // Get startup address
        ICrowdVCFactory factoryContract = ICrowdVCFactory(factory);
        ICrowdVCFactory.PitchData memory pitchData = factoryContract.getPitchData(pitchId);

        // Transfer funds
        IERC20(acceptedToken).safeTransfer(pitchData.startup, amount);

        emit FundsDistributed(pitchId, pitchData.startup, amount);
        emit MilestoneCompleted(pitchId, milestoneIndex, amount);
    }

    // ============ REFUND FUNCTIONS ============

    /**
     * @dev Request refund if pool failed to meet goal
     */
    function requestRefund() external override nonReentrant {
        require(status == PoolStatus.Failed, "Pool not failed");
        require(contributions[msg.sender] > 0, "No contribution");
        require(!hasRefunded[msg.sender], "Already refunded");

        uint256 amount = contributions[msg.sender];
        hasRefunded[msg.sender] = true;

        IERC20(acceptedToken).safeTransfer(msg.sender, amount);

        emit Refunded(msg.sender, amount);
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
            acceptedToken: acceptedToken,
            minContribution: minContribution
        });
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
}
