# Smart Contract Requirements for CrowdVC Platform

**Version:** 1.0
**Date:** 2025-11-04
**Status:** Requirements Specification

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Overview](#platform-overview)
3. [User Roles & Journeys](#user-roles--journeys)
4. [Core Features Analysis](#core-features-analysis)
5. [Smart Contract Requirements](#smart-contract-requirements)
6. [Contract Architecture](#contract-architecture)
7. [Technical Specifications](#technical-specifications)
8. [Security Requirements](#security-requirements)
9. [Integration Points](#integration-points)
10. [Migration & Deployment](#migration--deployment)

---

## Executive Summary

CrowdVC is a decentralized venture capital platform that enables:

- **Startups** to submit pitches and receive funding
- **Investors** to discover, vote on, and fund promising startups
- **Admins** to curate pitches and manage investment pools

Based on comprehensive analysis of the database schema, API routes, and UI components, this document defines the smart contract requirements to move core platform logic on-chain while maintaining off-chain data for UI performance and discoverability.

**Key Insight:** The current system operates entirely off-chain (PostgreSQL database). The smart contracts should handle:

1. Immutable financial transactions (contributions, distributions)
2. Transparent voting mechanisms (weighted by contribution)
3. Trustless fund management (escrow, milestone releases)
4. NFT receipts for investor proof of participation

---

## Platform Overview

### Current Architecture (Off-Chain)

- **Database:** PostgreSQL via Drizzle ORM
- **Backend:** Next.js 15 API routes
- **Frontend:** React 19 with Wagmi/Viem for wallet connection
- **Chain:** Currently supports Ethereum Mainnet and Arbitrum
- **Tokens:** Intended for USDT/USDC stablecoins

### Proposed Hybrid Architecture

- **On-Chain (Smart Contracts):**
  - Pool creation and management
  - Contribution handling with escrow
  - Weighted voting based on contributions
  - Winner selection and fund distribution
  - NFT receipt issuance to investors
  - Milestone-based fund releases
  - Emergency refunds and withdrawals

- **Off-Chain (Database + API + IPFS):**
  - User profiles and authentication
  - Pitch content (text, media URLs, documents) [IPFS]
  - Pitch review workflow and status [IPFS]
  - Caching pool data for fast UI rendering
  - Email notifications
  - Search and discovery features

---

## User Roles & Journeys

### 1. Startup Founder Journey

#### Off-Chain Flow:

1. **Sign Up** - Connect wallet via Reown AppKit (SIWX)
2. **Create Profile** - Name, email, userType = "startup"
3. **Submit Pitch** - Multi-step form with:
   - Basic Info: Title, elevator pitch, summary
   - Company Details: Industry, stage, team size, location, website
   - Funding Breakdown: Goal amount, budget allocation (product, marketing, team, operations)
   - Metrics: Key metric, expected ROI, time to raise
   - Media: Pitch deck (PDF), video URL, demo URL, prototype URL, images
4. **Wait for Review** - Status: pending → under-review
5. **Admin Feedback** - Status changes to: shortlisted, needs-more-info, conditional-approval, approved, or rejected
6. **Get Added to Pool** - Admin assigns approved pitch to active pool (status: in-pool)
7. **Monitor Voting** - View votes and contribution amounts
8. **Receive Funds** - If in top 3, receive proportional distribution

#### On-Chain Touchpoints:

- **Pool Assignment** - Pitch ID registered in pool contract
- **Receive Distributions** - Startup wallet receives funds via milestone releases
- **Claim Mechanism** - Startup claims allocated funds after voting closes

---

### 2. Investor Journey

#### Off-Chain Flow:

1. **Sign Up** - Connect wallet via Reown AppKit
2. **Create Profile** - Name, email, userType = "investor"
3. **Browse Pitches** - View featured pitches, organized by industry
4. **Explore Pools** - See active investment pools with:
   - Category (FinTech, HealthTech, AI/ML, etc.)
   - Voting deadline
   - Funding goal vs. current funding
   - Min/max contribution limits
   - Startups competing in the pool
5. **View Pool Details** - List of 3-10 competing startups with full pitch info
6. **Decide on Investment** - Review pitches and decide which to support

#### On-Chain Flow:

1. **Connect Wallet** - Authorize transaction signing
2. **Vote for Startup** - Submit vote for preferred pitch in pool
   - Vote is recorded but has NO weight until contribution
   - One vote per wallet per pool (can change vote before contributing)
3. **Contribute Funds** - Deposit USDT or USDC to pool contract
   - **Amount:** Must be ≥ minContribution, ≤ maxContribution
   - **Platform Fee:** 5% deducted automatically
   - **Vote Weight:** Contribution amount = voting power
   - **NFT Receipt:** ERC721 token minted as proof of contribution
4. **Track Investment** - View contribution status (pending → confirmed → failed)
5. **Monitor Results** - Watch vote tallies update as pool closes
6. **Claim Refund** - If pool doesn't meet funding goal, claim full refund
7. **Early Withdrawal** - Withdraw contribution before voting ends (10% penalty)

---

### 3. Admin Journey

#### Off-Chain Flow:

1. **Sign Up** - userType = "admin"
2. **Review Pitches Dashboard** - View all pitches with filters:
   - Status: pending, under-review, approved, rejected, etc.
   - Search by title/keyword
   - Sort by submission date
3. **Review Pitch Details** - Open pitch in drawer/modal
4. **Approve/Reject Pitch** - Update status with feedback:
   - Approved → eligible for pool assignment
   - Rejected → select reason from predefined list or custom notes
5. **Create Investment Pool** - Define:
   - Name (e.g., "Q4 2024 FinTech Round")
   - Description
   - Category
   - Voting deadline
   - Funding goal
   - Min/max contribution limits
6. **Assign Startups to Pool** - Select 3-10 approved pitches to compete
7. **Activate Pool** - Change status from "upcoming" to "active"
8. **Close Pool** - Manual or automatic at voting deadline
9. **Monitor Contributions** - View real-time contribution data

#### On-Chain Touchpoints:

- **Deploy Pool Contract** - Create new pool on-chain with params
- **Register Startups** - Add pitch IDs and wallet addresses to pool
- **Activate Voting** - Enable contribution/voting period
- **Close Pool** - Trigger winner calculation and distribution
- **Emergency Actions** - Pause pool, enable refunds, update fees

---

## Core Features Analysis

### Feature 1: Pitch Submission & Review

**Type:** Off-Chain
**Rationale:** Rich media content, frequent status updates, subjective review process

**Database Entities:**

- `pitches` table (46 fields)
- `pitch_actions` table (audit trail)
- `rejection_reasons` constants

**API Endpoints:**

- `POST /api/pitches` - Create pitch
- `GET /api/pitches` - List pitches (filter by status)
- `GET /api/pitches/[id]` - Get pitch details
- `PATCH /api/pitches/[id]` - Update pitch
- `PATCH /api/admin/pitches/[id]` - Admin update with review notes
- `DELETE /api/pitches/[id]` - Delete pitch

**Status Workflow:**

```
pending → under-review → shortlisted → approved → in-pool
                       ↓
                   needs-more-info (can resubmit)
                       ↓
               conditional-approval → approved
                       ↓
                    rejected (final)
```

**Smart Contract Interaction:** NONE (purely off-chain)

---

### Feature 2: Investment Pool Creation

**Type:** Hybrid (Off-Chain Management + On-Chain Execution)

**Database Entities:**

- `pools` table: name, description, category, votingDeadline, fundingGoal, minContribution, maxContribution, status
- `pool_startups` junction table: links pools to pitches

**API Endpoints:**

- `POST /api/admin/pools` - Create pool (admin only)
- `GET /api/pools` - List active pools
- `GET /api/pools/[id]` - Get pool with competing startups
- `POST /api/admin/pools/[id]/startups` - Assign startups
- `DELETE /api/admin/pools/[id]/startups/[pitchId]` - Remove startup

**Pool Lifecycle:**

1. **upcoming** - Pool created, startups being assigned
2. **active** - Voting and contributions open
3. **closed** - Voting ended, distribution phase

**Smart Contract Requirements:**

#### Pool Contract Deployment

```solidity
struct PoolParams {
    string poolId;              // Off-chain database ID for syncing
    uint256 votingDeadline;     // Unix timestamp
    uint256 fundingGoal;        // In stablecoin smallest unit (e.g., USDT has 6 decimals)
    uint256 minContribution;    // Minimum per investor
    uint256 maxContribution;    // Maximum per investor (0 = no limit)
    address[] stablecoins;      // Accepted tokens (USDT, USDC)
    address treasury;           // Platform treasury for fees
    uint256 platformFeePercent; // Basis points (500 = 5%)
}
```

#### Required Functions:

- `createPool(PoolParams)` - Deploy new pool contract
- `addStartup(string pitchId, address wallet)` - Register competing startup
- `removeStartup(string pitchId)` - Remove startup before activation
- `activatePool()` - Enable contributions and voting
- `pausePool()` - Emergency stop
- `closePool()` - Finalize voting and trigger distribution

---

### Feature 3: Voting Mechanism

**Type:** Hybrid (Vote Intent Off-Chain, Vote Weight On-Chain)

**Database Entities:**

- `votes` table: poolId, pitchId, userId, walletAddress, votedAt
- Primary key: (walletAddress, poolId) - ONE vote per wallet per pool

**API Endpoints:**

- `POST /api/pools/[id]/vote` - Record vote intent
- Request: `{ walletAddress, pitchId }`
- Response: Vote confirmation

**Current Business Rules:**

- One vote per wallet per pool (enforced by DB constraint)
- Can change vote before contributing
- Vote has NO weight until contribution is made
- Vote weight = contribution amount in pool's stablecoin

**Smart Contract Requirements:**

#### Voting System

```solidity
struct Vote {
    address voter;
    string pitchId;
    uint256 weight;      // Contribution amount
    uint256 timestamp;
}

mapping(address => Vote) public votes;  // One vote per address per pool
```

#### Required Functions:

- `vote(string pitchId)` - Record vote (can be called multiple times to change)
- `contribute(uint256 amount, address token, string pitchId)` - Deposit funds + lock in vote
- `getVoteWeight(address voter)` - Return contribution amount
- `getTotalVotesForPitch(string pitchId)` - Sum of all contribution weights
- `changeVote(string newPitchId)` - Only allowed before contributing

**Vote Weight Calculation:**

- If investor contributes $1,000 USDT → vote weight = 1,000,000,000 (6 decimals)
- If investor contributes $500 USDC → vote weight = 500,000,000 (6 decimals)
- All contributions in same pool normalized to same token

---

### Feature 4: Fund Contribution

**Type:** On-Chain (Critical Financial Transaction)

**Database Entities:**

- `contributions` table: poolId, userId, walletAddress, amount, platformFee, gasFee, status, transactionHash

**API Endpoints:**

- `POST /api/contributions` - Create contribution record
- `GET /api/contributions?poolId=[id]` - List contributions by pool
- `GET /api/contributions?userId=[id]` - List contributions by user

**Current Business Rules:**

- Amount must be ≥ pool.minContribution
- Amount must be ≤ pool.maxContribution (if set)
- Platform fee = 5% (hardcoded in API route)
- Status: pending → confirmed → failed
- Transaction hash stored for verification

**Smart Contract Requirements:**

#### Contribution Handling

```solidity
struct Contribution {
    address investor;
    string pitchId;          // Which startup they're supporting
    uint256 amount;          // Gross amount (before fees)
    uint256 platformFee;     // 5% of amount
    uint256 netAmount;       // Amount - platformFee
    address token;           // USDT or USDC
    uint256 timestamp;
    uint256 nftTokenId;      // Receipt NFT
}

mapping(address => Contribution[]) public contributions;
```

#### Required Functions:

- `contribute(uint256 amount, address token, string pitchId)`
  - Validate: amount >= minContribution && amount <= maxContribution
  - Validate: votingDeadline not passed
  - Validate: pool is active
  - Transfer tokens from investor to contract (SafeERC20)
  - Calculate platformFee = amount \* platformFeePercent / 10000
  - Transfer platformFee to treasury
  - Store netAmount in escrow
  - Lock in vote for pitchId with weight = amount
  - Mint NFT receipt to investor
  - Emit ContributionMade event

- `withdraw()` - Early withdrawal before voting ends
  - Validate: votingDeadline not passed
  - Calculate penalty = contribution amount \* 10% / 100
  - Transfer (amount - penalty) to investor
  - Transfer penalty to treasury
  - Burn NFT receipt
  - Remove vote weight
  - Emit WithdrawalMade event

- `claimRefund()` - If pool doesn't meet funding goal
  - Validate: votingDeadline passed
  - Validate: totalContributions < fundingGoal
  - Transfer full original amount (including platform fee) back to investor
  - Burn NFT receipt
  - Emit RefundClaimed event

**NFT Receipt (ERC721):**

- One NFT minted per contribution
- Metadata includes: poolId, pitchId, amount, timestamp
- Non-transferable (soulbound) to prevent vote buying
- Auto-burned on withdrawal or refund

---

### Feature 5: Winner Selection & Fund Distribution

**Type:** On-Chain (Critical for Transparency)

**Current Off-Chain Logic:**

- After voting deadline, aggregate votes by pitchId
- Rank pitches by total contribution weight
- Select top 3 pitches (or more if tie for 3rd place)
- Distribute funds proportionally among winners

**Example:**

```
Pool Total: $100,000
Pitch A: $50,000 in contributions (50%)
Pitch B: $30,000 in contributions (30%)
Pitch C: $20,000 in contributions (20%)

Distribution:
Pitch A receives: $50,000 - platform fees
Pitch B receives: $30,000 - platform fees
Pitch C receives: $20,000 - platform fees
```

**Smart Contract Requirements:**

#### Winner Selection Algorithm

```solidity
struct Winner {
    string pitchId;
    address startupWallet;
    uint256 totalVotes;      // Sum of contribution weights
    uint256 allocation;      // Amount to receive
    uint256 percentage;      // Share of total pool
}

Winner[] public winners;  // Top 3 (or more if tie)
```

#### Required Functions:

- `finalizeVoting()` - Called after votingDeadline
  - Aggregate all contributions by pitchId
  - Sort pitches by total contribution weight (descending)
  - Select top 3 pitches
  - Handle ties: if multiple pitches tied for 3rd, include all tied pitches
  - Calculate proportional distribution
  - Mark pool as closed
  - Emit VotingFinalized event with winners

- `getWinners()` - Return array of Winner structs
- `getAllocation(string pitchId)` - Return amount allocated to pitch

**Tie Handling:**

```
Example with tie:
Pitch A: $40,000 (40%)
Pitch B: $30,000 (30%)
Pitch C: $15,000 (15%)
Pitch D: $15,000 (15%) ← Tied for 3rd

Result: All 4 pitches are winners
Distribution: Proportional split across all 4
```

---

### Feature 6: Milestone-Based Fund Release

**Type:** On-Chain (New Feature - Not in Current System)

**Rationale:** Investors need assurance that funds are released gradually as startups hit milestones, not all upfront.

**Smart Contract Requirements:**

#### Milestone Structure

```solidity
struct Milestone {
    string description;
    uint256 percentage;      // Percentage of allocation (basis points)
    bool completed;
    uint256 completedAt;
    address[] approvers;     // Investors who approved
    uint256 approvalsNeeded; // Threshold (e.g., 51% of contributors)
}

mapping(string => Milestone[]) public pitchMilestones;  // pitchId => milestones
```

#### Required Functions:

- `setMilestones(string pitchId, Milestone[] milestones)` - Admin sets milestones after pool closes
  - Validate: Sum of percentages = 100%
  - Validate: Only callable by admin

- `approveMilestone(string pitchId, uint256 milestoneIndex)` - Investor approves milestone completion
  - Validate: Caller contributed to this pitch
  - Validate: Milestone not already completed
  - Record approval
  - If approvalsNeeded threshold met → mark completed and release funds

- `claimMilestoneFunds(string pitchId, uint256 milestoneIndex)` - Startup claims released funds
  - Validate: Milestone marked as completed
  - Validate: Caller is startup wallet
  - Calculate amount = allocation \* milestone.percentage / 10000
  - Transfer amount to startup wallet
  - Emit MilestoneCompleted event

**Default Milestones (if not custom):**

1. **Milestone 1:** 40% - Upon pool closing (immediate release)
2. **Milestone 2:** 30% - 90 days after pool close (investor vote required)
3. **Milestone 3:** 30% - 180 days after pool close (investor vote required)

---

### Feature 7: User Registration

**Type:** Hybrid (Off-Chain Profile + On-Chain Role)

**Database Entities:**

- `users` table: email, walletAddress, name, userType, createdAt

**API Endpoints:**

- `POST /api/users` - Create user (implicit during sign-in)
- Wallet connection via Reown AppKit (SIWX)

**Smart Contract Requirements:**

#### User Registry (Optional - Can Stay Off-Chain)

```solidity
enum UserType { Startup, Investor, Admin }

struct User {
    address wallet;
    UserType role;
    bool isRegistered;
    uint256 registeredAt;
}

mapping(address => User) public users;
```

#### Required Functions:

- `registerUser(UserType role)` - Self-registration
  - Validate: Not already registered
  - Store wallet address + role
  - Emit UserRegistered event

**Decision Point:** User registration can remain entirely off-chain since it's not critical for financial transactions. On-chain registration only needed if we want to enforce role-based access control at contract level.

---

### Feature 8: Contribution History & Tracking

**Type:** Hybrid (On-Chain Source of Truth + Off-Chain Indexing)

**Database Entities:**

- `contributions` table with transactionHash field

**API Endpoints:**

- `GET /api/contributions?userId=[id]` - User's contribution history
- `GET /api/contributions?poolId=[id]` - Pool's contribution list

**Smart Contract Requirements:**

#### Events for Indexing

```solidity
event ContributionMade(
    address indexed investor,
    string indexed poolId,
    string indexed pitchId,
    uint256 amount,
    uint256 platformFee,
    address token,
    uint256 nftTokenId,
    uint256 timestamp
);

event WithdrawalMade(
    address indexed investor,
    string indexed poolId,
    uint256 amount,
    uint256 penalty,
    uint256 timestamp
);

event RefundClaimed(
    address indexed investor,
    string indexed poolId,
    uint256 amount,
    uint256 timestamp
);
```

#### Required Functions:

- `getContributions(address investor)` - Return all contributions by address
- `getPoolContributions(string poolId)` - Return all contributions to pool
- `getTotalContributed(address investor)` - Sum across all pools
- `getNFTsByInvestor(address investor)` - Return all receipt token IDs

**Off-Chain Indexing:**

- Listen to smart contract events
- Store in database for fast queries
- Use transactionHash to link on-chain and off-chain data

---

### Feature 9: Admin Pool Management

**Type:** Hybrid (On-Chain Financial Controls + Off-Chain Metadata)

**Admin Capabilities:**

1. Create pools
2. Assign/remove startups
3. Activate pools
4. Pause pools (emergency)
5. Update platform fee (within bounds)
6. Set milestones
7. Override milestone approval (emergency)

**Smart Contract Requirements:**

#### Access Control

```solidity
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
```

#### Admin Functions:

- `createPool(PoolParams)` - Only ADMIN_ROLE
- `addStartup(string poolId, string pitchId, address wallet)` - Only ADMIN_ROLE
- `removeStartup(string poolId, string pitchId)` - Only ADMIN_ROLE, only before activation
- `activatePool(string poolId)` - Only ADMIN_ROLE
- `pausePool(string poolId)` - Only ADMIN_ROLE, emergency only
- `updatePlatformFee(uint256 newFee)` - Only ADMIN_ROLE, max 10% (1000 basis points)
- `setMilestones(string pitchId, Milestone[])` - Only ADMIN_ROLE
- `emergencyWithdraw(string poolId)` - Only ADMIN_ROLE, only if critical bug

---

## Smart Contract Requirements

### Contract 1: CrowdVCFactory (Main Entry Point)

**Purpose:**

- Factory pattern for deploying pool contracts
- User registration and role management
- Platform configuration (fees, treasury, supported tokens)
- Upgradeability via UUPS proxy

**Key Features:**

- Deploy new pool contracts via minimal proxy pattern (ERC-1167)
- Store pool registry
- Manage admin roles (OpenZeppelin AccessControl)
- Configure platform parameters
- Emit events for off-chain indexing

**State Variables:**

```solidity
address public treasury;
uint256 public platformFeePercent;  // Basis points (500 = 5%)
address[] public supportedTokens;   // [USDT, USDC]
address[] public deployedPools;
mapping(string => address) public poolIdToAddress;  // Off-chain ID → contract address
```

**Functions:**

```solidity
// Initialization
function initialize(address _treasury, uint256 _platformFee, address[] _tokens) external initializer;

// Pool Management
function deployPool(PoolParams calldata params) external onlyRole(ADMIN_ROLE) returns (address);
function getPoolAddress(string poolId) external view returns (address);
function getAllPools() external view returns (address[]);

// Configuration
function updateTreasury(address newTreasury) external onlyRole(ADMIN_ROLE);
function updatePlatformFee(uint256 newFee) external onlyRole(ADMIN_ROLE);  // Max 1000 (10%)
function addSupportedToken(address token) external onlyRole(ADMIN_ROLE);
function removeSupportedToken(address token) external onlyRole(ADMIN_ROLE);

// User Management (Optional)
function registerUser(UserType role) external;
function getUserInfo(address wallet) external view returns (User memory);

// Upgradeability (UUPS)
function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE);
```

**Events:**

```solidity
event PoolDeployed(string indexed poolId, address indexed poolAddress, uint256 votingDeadline);
event TreasuryUpdated(address oldTreasury, address newTreasury);
event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
event UserRegistered(address indexed wallet, UserType role);
```

**Deployment:**

- Deploy as UUPS upgradeable proxy
- Use OpenZeppelin's `UUPSUpgradeable` + `AccessControlUpgradeable`

---

### Contract 2: CrowdVCPool (Individual Pool Instance)

**Purpose:**

- Handle contributions for a specific investment round
- Implement weighted voting mechanism
- Select top 3 winners and distribute funds
- Issue NFT receipts to contributors
- Support early withdrawal with penalty
- Enable refunds if funding goal not met
- Milestone-based fund releases

**Key Features:**

- ERC721 for NFT receipts
- SafeERC20 for token transfers
- ReentrancyGuard for security
- Pause functionality for emergencies
- Weighted voting based on contribution amount
- Automatic winner selection
- Proportional fund distribution

**State Variables:**

```solidity
string public poolId;                  // Off-chain DB identifier
uint256 public votingDeadline;
uint256 public fundingGoal;
uint256 public minContribution;
uint256 public maxContribution;
uint256 public platformFeePercent;
address public treasury;
address public factory;
bool public isActive;
bool public isClosed;
uint256 public totalContributions;
uint256 public nextNFTTokenId;

address[] public supportedTokens;      // [USDT, USDC]
string[] public pitchIds;              // Competing startups
mapping(string => address) public pitchToWallet;  // Startup wallets

mapping(address => Contribution) public contributions;
mapping(address => Vote) public votes;
mapping(string => uint256) public voteWeights;  // pitchId → total contribution amount
Winner[] public winners;
mapping(string => Milestone[]) public milestones;
```

**Structs:**

```solidity
struct Contribution {
    address investor;
    string pitchId;
    uint256 amount;
    uint256 platformFee;
    uint256 netAmount;
    address token;
    uint256 timestamp;
    uint256 nftTokenId;
    bool withdrawn;
}

struct Vote {
    string pitchId;
    uint256 weight;
    uint256 timestamp;
}

struct Winner {
    string pitchId;
    address wallet;
    uint256 totalVotes;
    uint256 allocation;
    uint256 percentage;
    uint256 claimed;  // Amount already claimed via milestones
}

struct Milestone {
    string description;
    uint256 percentage;
    bool completed;
    uint256 completedAt;
    mapping(address => bool) approvals;
    uint256 approvalCount;
    uint256 approvalsNeeded;
}
```

**Functions - Pool Setup:**

```solidity
function initialize(
    string calldata _poolId,
    uint256 _votingDeadline,
    uint256 _fundingGoal,
    uint256 _minContribution,
    uint256 _maxContribution,
    address[] calldata _supportedTokens,
    address _treasury,
    uint256 _platformFeePercent
) external initializer;

function addStartup(string calldata pitchId, address wallet) external onlyFactory;
function removeStartup(string calldata pitchId) external onlyFactory;
function activatePool() external onlyFactory;
function pausePool() external onlyFactory;
```

**Functions - Contribution & Voting:**

```solidity
function vote(string calldata pitchId) external;
function changeVote(string calldata newPitchId) external;

function contribute(
    uint256 amount,
    address token,
    string calldata pitchId
) external nonReentrant whenNotPaused;

function withdraw() external nonReentrant;
function claimRefund() external nonReentrant;
```

**Functions - Winner Selection:**

```solidity
function finalizeVoting() external onlyFactory;
function getWinners() external view returns (Winner[] memory);
function getAllocation(string calldata pitchId) external view returns (uint256);
```

**Functions - Milestones:**

```solidity
function setMilestones(string calldata pitchId, Milestone[] calldata _milestones) external onlyFactory;
function approveMilestone(string calldata pitchId, uint256 milestoneIndex) external;
function claimMilestoneFunds(string calldata pitchId, uint256 milestoneIndex) external nonReentrant;
```

**Functions - Queries:**

```solidity
function getContribution(address investor) external view returns (Contribution memory);
function getVote(address voter) external view returns (Vote memory);
function getVoteWeight(string calldata pitchId) external view returns (uint256);
function getTotalContributions() external view returns (uint256);
function getPoolStatus() external view returns (bool isActive, bool isClosed, uint256 totalRaised);
function getNFTMetadata(uint256 tokenId) external view returns (string memory);
```

**Events:**

```solidity
event StartupAdded(string indexed pitchId, address indexed wallet);
event StartupRemoved(string indexed pitchId);
event PoolActivated(uint256 timestamp);
event VoteCast(address indexed voter, string indexed pitchId, uint256 weight);
event VoteChanged(address indexed voter, string oldPitchId, string newPitchId);
event ContributionMade(
    address indexed investor,
    string indexed pitchId,
    uint256 amount,
    uint256 platformFee,
    address token,
    uint256 nftTokenId
);
event WithdrawalMade(address indexed investor, uint256 amount, uint256 penalty);
event RefundClaimed(address indexed investor, uint256 amount);
event VotingFinalized(uint256 timestamp, uint256 winnersCount);
event MilestoneSet(string indexed pitchId, uint256 milestonesCount);
event MilestoneApproved(string indexed pitchId, uint256 milestoneIndex, address approver);
event MilestoneCompleted(string indexed pitchId, uint256 milestoneIndex, uint256 amountReleased);
event FundsClaimed(string indexed pitchId, address indexed wallet, uint256 amount);
```

**Modifiers:**

```solidity
modifier onlyFactory() {
    require(msg.sender == factory, "Only factory can call");
    _;
}

modifier onlyBeforeDeadline() {
    require(block.timestamp < votingDeadline, "Voting ended");
    _;
}

modifier onlyAfterDeadline() {
    require(block.timestamp >= votingDeadline, "Voting not ended");
    _;
}

modifier whenActive() {
    require(isActive && !isClosed, "Pool not active");
    _;
}
```

---

### Contract 3: CrowdVCNFT (Receipt Token)

**Purpose:**

- Issue ERC721 NFT receipts to investors
- Store contribution metadata in token URI
- Make tokens soulbound (non-transferable) to prevent vote buying

**Key Features:**

- ERC721 standard with metadata
- Soulbound tokens (override transfer functions to revert)
- Auto-burned on withdrawal or refund

**State Variables:**

```solidity
mapping(uint256 => string) public tokenMetadata;  // tokenId → JSON metadata
```

**Functions:**

```solidity
function mint(address to, string calldata metadata) external onlyPool returns (uint256);
function burn(uint256 tokenId) external onlyPool;
function tokenURI(uint256 tokenId) external view override returns (string memory);

// Override to prevent transfers (soulbound)
function transferFrom(address from, address to, uint256 tokenId) public virtual override {
    revert("Soulbound: Transfer not allowed");
}

function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
    revert("Soulbound: Transfer not allowed");
}

function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public virtual override {
    revert("Soulbound: Transfer not allowed");
}
```

**Metadata Format:**

```json
{
  "name": "CrowdVC Contribution Receipt #123",
  "description": "Proof of $5,000 USDT contribution to Q4 2024 FinTech Pool",
  "image": "ipfs://...",
  "attributes": [
    { "trait_type": "Pool ID", "value": "pool-uuid-123" },
    { "trait_type": "Pitch ID", "value": "pitch-uuid-456" },
    { "trait_type": "Amount", "value": "5000000000" },
    { "trait_type": "Token", "value": "USDT" },
    { "trait_type": "Timestamp", "value": "1699999999" }
  ]
}
```

---

### Contract 4: Libraries

#### FeeCalculator.sol

```solidity
library FeeCalculator {
    uint256 constant BASIS_POINTS = 10000;

    function calculatePlatformFee(uint256 amount, uint256 feePercent)
        internal pure returns (uint256)
    {
        return (amount * feePercent) / BASIS_POINTS;
    }

    function calculateWithdrawalPenalty(uint256 amount)
        internal pure returns (uint256)
    {
        return (amount * 1000) / BASIS_POINTS;  // 10%
    }

    function calculateProportionalDistribution(
        uint256 totalPool,
        uint256 pitchVotes,
        uint256 totalVotes
    ) internal pure returns (uint256) {
        return (totalPool * pitchVotes) / totalVotes;
    }
}
```

#### ValidationLib.sol

```solidity
library ValidationLib {
    function validateContributionAmount(
        uint256 amount,
        uint256 minContribution,
        uint256 maxContribution
    ) internal pure {
        require(amount >= minContribution, "Below minimum");
        if (maxContribution > 0) {
            require(amount <= maxContribution, "Above maximum");
        }
    }

    function validateDeadline(uint256 deadline) internal view {
        require(block.timestamp < deadline, "Past deadline");
    }

    function validatePitchExists(
        string calldata pitchId,
        mapping(string => address) storage pitchToWallet
    ) internal view {
        require(pitchToWallet[pitchId] != address(0), "Pitch not in pool");
    }
}
```

---

## Contract Architecture

### Deployment Pattern

```
CrowdVCFactory (UUPS Proxy)
    │
    ├── Deploy Pool 1 (Minimal Proxy - ERC-1167)
    ├── Deploy Pool 2 (Minimal Proxy - ERC-1167)
    ├── Deploy Pool 3 (Minimal Proxy - ERC-1167)
    └── ...

Each Pool Contract includes:
    ├── Contribution handling
    ├── Voting mechanism
    ├── NFT receipt minting (ERC-721)
    └── Milestone management
```

**Why Minimal Proxies?**

- Reduces gas costs for pool deployment (~10x cheaper than full deployment)
- Each pool has identical logic, different state
- Factory holds implementation contract
- ERC-1167 clones implementation for each pool

---

### Contract Interactions

```
┌─────────────────────────────────────────────────────────┐
│                     CrowdVCFactory                       │
│  (UUPS Upgradeable, Access Control, Pool Registry)      │
└─────────────────────────────────────────────────────────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Pool A    │ │   Pool B    │ │   Pool C    │
    │  (Clone)    │ │  (Clone)    │ │  (Clone)    │
    └─────────────┘ └─────────────┘ └─────────────┘
            │
            ▼
    ┌─────────────────────────────────────────┐
    │           CrowdVCNFT (ERC-721)          │
    │     (Soulbound Receipt Tokens)          │
    └─────────────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────────┐
    │     USDT/USDC Token Contracts           │
    │     (External - SafeERC20)              │
    └─────────────────────────────────────────┘
```

---

### Upgradeability Strategy

**CrowdVCFactory:**

- UUPS (Universal Upgradeable Proxy Standard)
- Admin can upgrade logic contract
- Preserves all pool addresses and state
- Minimal gas overhead

**CrowdVCPool:**

- Immutable after deployment (NOT upgradeable)
- Rationale: Investors need assurance pool rules won't change mid-round
- If bug found: Deploy new factory, deprecate old pools, refund users

**Emergency Measures:**

- Factory has `pausePool(poolId)` to freeze pool operations
- Pool has `emergencyWithdraw()` admin function (only if critical bug)
- All withdrawals/refunds still functional even when paused

---

## Technical Specifications

### Supported Chains

- **Primary:** BASE Mainnet
- **Testnet:** BASE Sepolia
- **Future:** Arbitrum, Optimism (low gas L2s)

### Token Standards

- **Contributions:** USDT (6 decimals), USDC (6 decimals)
- **NFT Receipts:** ERC-721 (Soulbound)
- **Token Handling:** OpenZeppelin SafeERC20

### Compiler Version

- Solidity 0.8.28
- Optimizer enabled
- viaIR: true (for complex contracts)
- Runs: 200 (balance between deployment and runtime costs)

### Dependencies

- OpenZeppelin Contracts v5.4
  - `@openzeppelin/contracts-upgradeable`
  - `UUPS Upgradeable`
  - `Access Control Upgradeable`
  - `ReentrancyGuard Upgradeable`
  - `Pausable Upgradeable`
  - `ERC721Upgradeable`
  - `SafeERC20`

### Gas Optimization Strategies

1. Use `uint256` instead of smaller uints (except in structs)
2. Pack struct variables to minimize storage slots
3. Use events instead of storage for historical data
4. Batch operations where possible
5. Minimal proxy pattern for pool deployment
6. Cache storage reads in memory
7. Use `calldata` for function parameters when not modified

### Testing Framework

- Hardhat 3.0
- Viem for contract interactions
- Chai for assertions
- Gas reporter plugin
- Coverage plugin

---

## Security Requirements

### Access Control

- **Admin Role:**
  - Create pools
  - Update platform fee (max 10%)
  - Pause pools (emergency)
  - Set milestones
  - Upgrade factory contract

- **Factory Role:**
  - Add/remove startups to pools
  - Activate pools
  - Finalize voting

- **Public:**
  - Vote
  - Contribute
  - Withdraw
  - Claim refunds
  - Claim milestone funds

### Security Checks

#### Reentrancy Protection

```solidity
function contribute(...) external nonReentrant {
    // Checks
    require(isActive, "Pool not active");
    require(amount >= minContribution, "Below min");

    // Effects (update state BEFORE external calls)
    contributions[msg.sender] = Contribution(...);
    votes[msg.sender].weight = amount;
    totalContributions += amount;

    // Interactions (external calls LAST)
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    _mint(msg.sender, nextNFTTokenId);
}
```

#### Integer Overflow/Underflow

- Solidity 0.8.x has built-in overflow checks
- Use SafeMath for Solidity <0.8 (not needed here)

#### Front-Running Mitigation

- No sensitive price-dependent logic
- Vote changes allowed (no advantage to front-run)
- Contribution order doesn't affect outcome

#### Denial of Service

- No unbounded loops in critical functions
- `finalizeVoting()` loops over pitchIds (max 10, bounded by admin)
- Gas limit tests in deployment script

#### Access Control

```solidity
modifier onlyRole(bytes32 role) {
    require(hasRole(role, msg.sender), "Unauthorized");
    _;
}
```

#### Input Validation

```solidity
require(votingDeadline > block.timestamp, "Invalid deadline");
require(fundingGoal > 0, "Invalid goal");
require(platformFeePercent <= 1000, "Fee too high");  // Max 10%
require(pitchToWallet[pitchId] != address(0), "Invalid pitch");
```

#### Emergency Pause

```solidity
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

function contribute(...) external whenNotPaused {
    // ...
}
```

### Audit Requirements

1. **Pre-Mainnet:**
   - Internal security review
   - Automated tools: Slither, Mythril
   - Gas profiling
   - Testnet deployment and testing

2. **Before Production:**
   - External audit by reputable firm (OpenZeppelin, Trail of Bits, etc.)
   - Bug bounty program
   - Mainnet deployment with timelock

---

## Integration Points

### Frontend Integration (Next.js + Wagmi)

#### Wallet Connection

```typescript
import { useAccount, useConnect } from 'wagmi';

const { address, isConnected } = useAccount();
const { connect } = useConnect();
```

#### Contract Interaction

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';

// Contribute to pool
const { writeContract } = useWriteContract();

await writeContract({
  address: poolAddress,
  abi: CrowdVCPoolABI,
  functionName: 'contribute',
  args: [parseUnits('1000', 6), USDT_ADDRESS, pitchId], // $1000 USDT
});

// Read pool status
const { data } = useReadContract({
  address: poolAddress,
  abi: CrowdVCPoolABI,
  functionName: 'getPoolStatus',
});
```

#### Event Listening

```typescript
import { useWatchContractEvent } from 'wagmi';

useWatchContractEvent({
  address: poolAddress,
  abi: CrowdVCPoolABI,
  eventName: 'ContributionMade',
  onLogs: (logs) => {
    // Update UI when new contribution detected
    const { investor, pitchId, amount, nftTokenId } = logs[0].args;

    // Store in database
    await fetch('/api/contributions', {
      method: 'POST',
      body: JSON.stringify({
        poolId,
        userId,
        walletAddress: investor,
        amount: amount.toString(),
        transactionHash: logs[0].transactionHash,
        status: 'confirmed',
      }),
    });
  },
});
```

### Backend Sync (API Routes)

#### Contribution Sync

```typescript
// apps/web/src/app/api/contributions/sync/route.ts
import { createPublicClient } from 'viem';

export async function POST(request: Request) {
  const { transactionHash } = await request.json();

  // Verify transaction on-chain
  const receipt = await publicClient.getTransactionReceipt({
    hash: transactionHash,
  });

  if (receipt.status === 'success') {
    // Update database: status = 'confirmed'
    await db
      .update(contributions)
      .set({ status: 'confirmed' })
      .where(eq(contributions.transactionHash, transactionHash));
  } else {
    // Update database: status = 'failed'
    await db
      .update(contributions)
      .set({ status: 'failed' })
      .where(eq(contributions.transactionHash, transactionHash));
  }

  return Response.json({ success: true });
}
```

#### Event Indexer (Background Job)

```typescript
// apps/web/src/lib/indexer.ts
import { createPublicClient, parseAbiItem } from 'viem';

const client = createPublicClient({ ... });

// Listen to all ContributionMade events
const unwatch = client.watchEvent({
  address: FACTORY_ADDRESS,
  event: parseAbiItem('event ContributionMade(address indexed investor, string indexed pitchId, uint256 amount, uint256 nftTokenId)'),
  onLogs: async (logs) => {
    for (const log of logs) {
      const { investor, pitchId, amount, nftTokenId } = log.args;

      // Insert or update contribution in database
      await db.insert(contributions).values({
        id: nanoid(),
        poolId: log.address,  // Pool contract address
        walletAddress: investor,
        amount: amount.toString(),
        transactionHash: log.transactionHash,
        status: 'confirmed',
        contributedAt: new Date(),
      }).onConflictDoUpdate({ ... });
    }
  },
});
```

---

## Migration & Deployment

### Phase 1: Testnet Deployment (BASE Sepolia)

1. Deploy mock USDT and USDC tokens
2. Deploy CrowdVCFactory (UUPS proxy + implementation)
3. Set treasury address and platform fee (5%)
4. Add supported tokens
5. Grant ADMIN_ROLE to deployer
6. Deploy test pool via factory
7. Test full flow: contribute → vote → finalize → distribute
8. Verify contracts on Basescan

### Phase 2: Frontend Integration

1. Update wagmi config with contract addresses
2. Import ABIs from `artifacts/` folder
3. Build contribution UI with Wagmi hooks
4. Add event listeners for real-time updates
5. Sync events to database via API routes
6. Test on testnet with real wallets

### Phase 3: Security Audit

1. Internal code review
2. Automated security scans (Slither, Mythril)
3. Gas profiling and optimization
4. External audit by security firm
5. Address audit findings
6. Re-audit if major changes

### Phase 4: Mainnet Deployment (BASE)

1. Deploy to BASE mainnet
2. Use real USDT/USDC addresses
3. Set production treasury (multisig wallet recommended)
4. Transfer ADMIN_ROLE to multisig
5. Verify contracts on Basescan
6. Update frontend with mainnet addresses
7. Launch with limited pool (small funding goal)
8. Monitor for issues
9. Gradually increase pool sizes

### Phase 5: Post-Launch

1. Set up monitoring (Tenderly, Defender)
2. Bug bounty program
3. Regular security reviews
4. Community governance (future: DAO)

---

## Migration Strategy (Existing Users)

Since the current system is entirely off-chain, migration involves:

### Step 1: Announce Migration

- Notify all users of smart contract launch
- Explain benefits: transparency, trustlessness, NFT receipts
- Provide migration timeline

### Step 2: Freeze Legacy System

- Stop accepting new contributions to off-chain pools
- Allow existing off-chain pools to complete distribution
- Mark database pools as "legacy"

### Step 3: Launch Smart Contracts

- Deploy to mainnet
- Create first on-chain pool
- Market as "V2" or "Decentralized" pools

### Step 4: Dual System (Transition Period)

- Legacy pools: Continue off-chain (until completed)
- New pools: All on-chain
- Users choose which pools to join
- Database tracks both types

### Step 5: Deprecate Off-Chain (6 months later)

- All legacy pools completed
- All new activity on-chain
- Archive legacy data
- Smart contracts become sole source of truth

---

## Appendix: Key Metrics

### Gas Estimates (BASE Network)

- Deploy Factory: ~3,000,000 gas
- Deploy Pool (via clone): ~200,000 gas
- Contribute: ~150,000 gas
- Vote: ~50,000 gas
- Withdraw: ~100,000 gas
- Finalize Voting: ~500,000 gas (depends on # of pitches)
- Claim Milestone: ~80,000 gas

### Contract Size Limits

- Max contract size: 24KB (EIP-170)
- Current estimates:
  - CrowdVCFactory: ~22KB (within limit, but tight)
  - CrowdVCPool: ~20KB (within limit)
- If exceeds: Use contract splitting or diamond pattern

### Scalability

- Max pools: Unlimited (factory pattern)
- Max pitches per pool: 10 (bounded by admin)
- Max contributors per pool: Unlimited
- Max milestones per pitch: 5 (reasonable default)

---

## Conclusion

This requirements document provides a comprehensive blueprint for implementing smart contracts that will:

1. **Decentralize fund management** - Escrow, distribution, and refunds handled trustlessly on-chain
2. **Enable transparent voting** - Weighted by actual financial stake, verifiable by anyone
3. **Issue proof of participation** - NFT receipts for investor portfolios
4. **Support milestone releases** - Reduce risk for investors, incentivize startup execution
5. **Maintain off-chain flexibility** - Rich pitch content, fast search, admin curation

The hybrid approach balances the benefits of blockchain (transparency, immutability, trustlessness) with practical needs (rich metadata, subjective review, user experience).

**Next Steps:**

1. Review and approve requirements
2. Begin Solidity implementation
3. Write comprehensive test suite
4. Deploy to BASE Sepolia testnet
5. Integrate with frontend
6. Security audit
7. Mainnet launch

**Questions for Discussion:**

- Should user registration be on-chain or off-chain?
- Default milestone schedule (40/30/30 or custom per pitch)?
- Maximum platform fee limit (currently 10%)?
- Should admins have emergency fund withdrawal? (security vs. decentralization tradeoff)
- Future: DAO governance for platform parameters?

---

**Document Version:** 1.0
**Author:** Claude Code Analysis
**Date:** 2025-11-04
**Total Pages:** 30+
