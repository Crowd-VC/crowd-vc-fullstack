# CrowdVC Smart Contract Architecture Plan

## Overview
A decentralized venture capital platform where startups submit pitches, investors vote and contribute USDT to pools, and funds are distributed based on voting results and milestone completion.

## Core Design Principles
1. **Upgradeable Contracts**: UUPS (Universal Upgradeable Proxy Standard)
2. **Security First**: OpenZeppelin contracts, audited patterns
3. **Gas Optimization**: Efficient storage, minimal loops
4. **Transparency**: Comprehensive events for off-chain indexing
5. **Fail-Safe Mechanisms**: Pause, refund, emergency withdrawal

---

## Contract Architecture

### 1. CrowdVCFactory (Main Upgradeable Contract)
**Purpose**: Central registry and factory for pool creation

**Responsibilities**:
- User registration with roles (Startup, Investor, Admin)
- Startup pitch registry with IPFS metadata
- Pool factory (deploys new pool contracts)
- Global configuration (platform fee, USDT address, treasury)
- Access control and permissions
- Pitch status management (pending → approved → in-pool)

**Key Storage**:
```solidity
mapping(address => UserProfile) public users;
mapping(bytes32 => PitchData) public pitches; // pitchId => PitchData
mapping(address => bool) public isPool; // Track deployed pools
address[] public allPools;
uint256 public platformFeePercent; // Default: 500 = 5%
address public treasury;
address public usdtToken;
```

**Core Functions**:
- `registerUser(UserType, string metadata)`
- `submitPitch(string title, string ipfsHash, uint256 fundingGoal)`
- `approvePitch(bytes32 pitchId)` - Admin only
- `createPool(string name, uint256 goal, uint256 votingDeadline, bytes32[] pitchIds)`
- `updatePlatformFee(uint256 newFee)` - Admin only
- `pause() / unpause()` - Emergency controls

**Events**:
- `UserRegistered(address indexed user, UserType userType, uint256 timestamp)`
- `PitchSubmitted(bytes32 indexed pitchId, address indexed startup, string ipfsHash)`
- `PitchApproved(bytes32 indexed pitchId, uint256 timestamp)`
- `PoolCreated(address indexed poolAddress, string name, uint256 fundingGoal)`

---

### 2. CrowdVCPool (Individual Pool Contract)
**Purpose**: Handle voting, contributions, and fund distribution for a specific investment pool

**Design Pattern**: Each pool is a separate contract deployed by the factory

**Responsibilities**:
- Accept USDT contributions from investors
- Enable voting on pitches with vote weight proportional to contribution
- Track voting results and determine winners
- Distribute funds to winning startups based on milestones
- Handle refunds if pool fails to meet funding goal
- Enforce deadlines (voting period, funding period)

**Key Storage**:
```solidity
address public factory;
address public usdtToken;
PoolStatus public status; // Active, VotingEnded, Funded, Closed, Failed
uint256 public fundingGoal;
uint256 public votingDeadline;
uint256 public fundingDeadline;
uint256 public totalContributions;
uint256 public platformFeePercent;

bytes32[] public candidatePitches; // Pitches eligible for voting
mapping(address => uint256) public contributions; // investor => amount
mapping(bytes32 => uint256) public voteCount; // pitchId => weighted votes
mapping(address => mapping(bytes32 => bool)) public hasVoted; // investor => pitchId => voted
mapping(bytes32 => bool) public winners; // Selected startups
mapping(bytes32 => MilestoneTracker) public milestones;
```

**Voting Mechanism**:
- Vote weight = contribution amount
- One vote per pitch per investor (can vote for multiple pitches)
- Voting ends at deadline or when admin closes
- Top N pitches become winners (configurable)

**Contribution Flow**:
1. Investor contributes USDT during active period
2. Funds held in escrow until voting ends
3. If funding goal not met by deadline → refund
4. If goal met → funds locked for distribution

**Distribution Logic**:
- **Winner-takes-all**: Single winning pitch gets all funds
- **Proportional**: Multiple winners split funds based on vote %
- **Milestone-based**: Funds released as startups complete milestones

**Milestone System**:
```solidity
struct Milestone {
    string description;
    uint256 fundingPercent; // % of total allocation
    bool completed;
    bool disputed;
    uint256 deadline;
}
```

**Core Functions**:
- `contribute(uint256 amount)` - Deposit USDT
- `vote(bytes32 pitchId)` - Cast vote (weighted by contribution)
- `endVoting()` - Admin finalizes voting and determines winners
- `distributeFunds(bytes32 pitchId, uint256 milestoneIndex)` - Release funds for milestone
- `requestRefund()` - Investor withdraws if pool failed
- `emergencyWithdraw()` - Admin only, returns all funds

**Events**:
- `ContributionMade(address indexed investor, uint256 amount, uint256 timestamp)`
- `VoteCast(address indexed voter, bytes32 indexed pitchId, uint256 weight)`
- `VotingEnded(uint256 timestamp, bytes32[] winners)`
- `FundsDistributed(bytes32 indexed pitchId, address startup, uint256 amount)`
- `Refunded(address indexed investor, uint256 amount)`

---

### 3. Supporting Contracts & Libraries

#### A. CrowdVCGovernance (Optional - For DAO)
- Token-based governance for platform decisions
- Proposal system for fee changes, upgrades
- Timelock for sensitive operations

#### B. Libraries

**FeeCalculator.sol**:
```solidity
library FeeCalculator {
    function calculatePlatformFee(uint256 amount, uint256 feePercent) internal pure returns (uint256);
    function calculateDistribution(uint256 total, uint256[] votes) internal pure returns (uint256[]);
}
```

**ValidationLib.sol**:
```solidity
library ValidationLib {
    function validatePitchData(string memory ipfs, uint256 goal) internal pure;
    function validatePoolParameters(uint256 goal, uint256 deadline) internal view;
}
```

#### C. Interfaces

**ICrowdVCFactory.sol**:
- `function isPitchApproved(bytes32 pitchId) external view returns (bool);`
- `function getPlatformFee() external view returns (uint256);`

**ICrowdVCPool.sol**:
- `function getPoolStatus() external view returns (PoolStatus);`
- `function getWinners() external view returns (bytes32[]);`

---

## Data Structures

### User Profile
```solidity
enum UserType { None, Startup, Investor, Admin }

struct UserProfile {
    UserType userType;
    string metadataURI; // IPFS hash with KYC/profile data
    uint256 registeredAt;
    bool isActive;
    uint256 reputationScore; // Future: based on milestone completion
}
```

### Pitch Data
```solidity
enum PitchStatus { Pending, UnderReview, Approved, Rejected, InPool, Funded }

struct PitchData {
    bytes32 pitchId;
    address startup;
    string title;
    string ipfsHash; // Pitch deck, details
    uint256 fundingGoal;
    PitchStatus status;
    uint256 submittedAt;
    uint256 approvedAt;
}
```

### Pool Configuration
```solidity
enum PoolStatus { Active, VotingEnded, Funded, Closed, Failed }
enum DistributionModel { WinnerTakesAll, Proportional, TopN }

struct PoolConfig {
    string name;
    string category;
    uint256 fundingGoal;
    uint256 votingDeadline;
    uint256 fundingDeadline;
    DistributionModel distributionModel;
    uint256 maxWinners; // For TopN model
}
```

### Milestone Tracker
```solidity
struct MilestoneTracker {
    Milestone[] milestones;
    uint256 totalAllocated;
    uint256 totalReleased;
    uint256 lastReleaseTime;
}

struct Milestone {
    string description;
    uint256 fundingPercent; // Basis points (10000 = 100%)
    bool completed;
    bool disputed;
    uint256 deadline;
    string evidenceURI; // IPFS proof of completion
}
```

---

## Security Measures

### Access Control (OpenZeppelin)
```solidity
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant STARTUP_ROLE = keccak256("STARTUP_ROLE");
bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");
```

### Security Features
1. **ReentrancyGuard**: All functions handling ETH/tokens
2. **Pausable**: Emergency stop mechanism
3. **Role-Based Access Control**: Fine-grained permissions
4. **Input Validation**: Check all parameters
5. **Rate Limiting**: Prevent spam attacks
6. **SafeERC20**: Prevent token transfer failures
7. **Checks-Effects-Interactions**: Prevent reentrancy

### Upgrade Safety (UUPS)
- `_authorizeUpgrade()` restricted to admin
- Storage layout preservation
- Initializer protection
- Version tracking

---

## Economic Model

### Platform Fees
- **Default**: 5% of all contributions
- **Collected**: During distribution, sent to treasury
- **Adjustable**: Admin can update (with timelock/governance)

### Fee Breakdown
```solidity
Contribution: 1000 USDT
├── Platform Fee (5%): 50 USDT → Treasury
├── Gas Subsidy (optional): Tracked separately
└── Net to Pool: 950 USDT
    └── Distributed to winners based on milestones
```

### Refund Policy
- **Full Refund**: If funding goal not met
- **Partial Refund**: Before voting ends (minus small penalty to prevent gaming)
- **No Refund**: After funds distributed to startups

### Milestone Vesting
- Startups receive funds in tranches
- Each milestone requires proof (IPFS evidence)
- Admin/DAO can approve milestone completion
- Dispute resolution mechanism

---

## State Transitions

### Pitch Lifecycle
```
Pending → UnderReview → Approved/Rejected
                        ↓
                      InPool (added to pool)
                        ↓
                      Funded (received investment)
```

### Pool Lifecycle
```
Active (accepting contributions & votes)
  ↓
  ├─→ Failed (goal not met) → Refunds
  └─→ VotingEnded (deadline passed)
        ↓
      Funded (winners selected, funds allocated)
        ↓
      Closed (all milestones completed or expired)
```

---

## Integration Points

### Off-Chain (Database & API)
- **Events Indexing**: Listen to smart contract events
- **IPFS Storage**: Store pitch decks, evidence
- **User Profiles**: Off-chain KYC, extended metadata
- **Notifications**: Email/push based on contract events

### On-Chain (Smart Contracts)
- **Primary Source of Truth**: Contributions, votes, distributions
- **Immutable Records**: Funding history, milestone completion
- **Automated Logic**: Refunds, deadline enforcement

### Hybrid Model
- **User Registration**: Both on-chain (wallet) and off-chain (email, profile)
- **Pitch Submission**: IPFS hash on-chain, full data off-chain
- **Status Sync**: Database mirrors contract state
- **Dispute Resolution**: Off-chain investigation, on-chain execution

---

## Gas Optimization Strategies

1. **Packed Storage**: Use uint128 where possible
2. **Batch Operations**: Update multiple states in one tx
3. **Lazy Evaluation**: Calculate on-read rather than on-write
4. **Event Over Storage**: Use events for historical data
5. **Minimal Loops**: Avoid iterating over unbounded arrays
6. **Calldata**: Use calldata for read-only function parameters
7. **Short-Circuit**: Early returns to save gas

---

## Testing Strategy

### Unit Tests (Hardhat + Viem)
1. **CrowdVCFactory Tests**:
   - User registration (all roles)
   - Pitch submission and approval
   - Pool creation
   - Access control enforcement
   - Upgrade mechanism

2. **CrowdVCPool Tests**:
   - Contribution handling
   - Voting mechanism (weight, uniqueness)
   - Deadline enforcement
   - Winner selection algorithms
   - Milestone-based distribution
   - Refund scenarios
   - Emergency withdrawal

3. **Integration Tests**:
   - Full lifecycle: Register → Pitch → Pool → Vote → Contribute → Distribute
   - Multi-pool scenarios
   - Concurrent contributions
   - Edge cases (exactly meeting goal, tie votes)

4. **Security Tests**:
   - Reentrancy attacks
   - Access control bypass attempts
   - Integer overflow/underflow
   - Front-running scenarios
   - Upgrade vulnerabilities

### Coverage Goals
- Line coverage: >95%
- Branch coverage: >90%
- Function coverage: 100%

---

## Deployment Plan

### Phase 1: Testnet Deployment
1. Deploy USDT mock token (testnet)
2. Deploy CrowdVCFactory implementation
3. Deploy UUPS proxy pointing to implementation
4. Initialize with admin, treasury, USDT address
5. Deploy first test pool via factory

### Phase 2: Audit & Security
1. Internal security review
2. External audit (Quantstamp, OpenZeppelin)
3. Bug bounty program
4. Testnet battle-testing

### Phase 3: Mainnet Launch
1. Deploy to Ethereum Mainnet
2. Deploy to Arbitrum (Layer 2)
3. Verify contracts on Etherscan/Arbiscan
4. Set up monitoring (Tenderly, Defender)
5. Initialize governance/multisig

---

## Environment Variables Needed

Add to `.env.local`:
```bash
# Smart Contract
PRIVATE_KEY=                    # Deployer wallet private key
MAINNET_RPC_URL=               # Ethereum RPC
ARBITRUM_RPC_URL=              # Arbitrum RPC
ETHERSCAN_API_KEY=             # For verification
ARBISCAN_API_KEY=              # For verification

# Contract Addresses (after deployment)
USDT_ADDRESS_MAINNET=          # 0xdAC17F958D2ee523a2206206994597C13D831ec7
USDT_ADDRESS_ARBITRUM=         # 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
CROWDVC_FACTORY_ADDRESS=       # Deployed factory address
TREASURY_ADDRESS=              # Multisig treasury

# Configuration
PLATFORM_FEE_PERCENT=500       # 5% = 500 basis points
REPORT_GAS=true                # Gas reporting in tests
```

---

## Contracts to Implement

### Priority Order
1. ✅ **Interfaces & Types** (ICrowdVCFactory, ICrowdVCPool, structs)
2. ✅ **Libraries** (FeeCalculator, ValidationLib)
3. ✅ **CrowdVCFactory** (Main upgradeable contract)
4. ✅ **CrowdVCPool** (Pool implementation)
5. ✅ **Deployment Scripts** (deploy.ts, upgrade.ts)
6. ✅ **Test Suite** (Comprehensive tests)
7. ⏳ **Frontend Integration** (Update WalletProvider, add contract hooks)

### File Structure
```
contracts/
├── interfaces/
│   ├── ICrowdVCFactory.sol
│   ├── ICrowdVCPool.sol
│   └── IERC20.sol
├── libraries/
│   ├── FeeCalculator.sol
│   └── ValidationLib.sol
├── core/
│   ├── CrowdVCFactory.sol
│   └── CrowdVCPool.sol
├── mocks/
│   └── MockUSDT.sol (for testing)
└── governance/ (future)
    └── CrowdVCGovernance.sol

scripts/
├── deploy.ts
├── upgrade.ts
├── create-pool.ts
└── verify.ts

test/hardhat/
├── CrowdVCFactory.test.ts
├── CrowdVCPool.test.ts
├── integration/
│   └── FullLifecycle.test.ts
└── security/
    └── SecurityTests.test.ts
```

---

## Frontend Integration Points

### New Hooks Needed
- `useContractFactory()` - Interact with main factory
- `usePool(poolAddress)` - Interact with specific pool
- `useVote(poolAddress)` - Vote on pitches
- `useContribute(poolAddress)` - Contribute USDT
- `useMilestones(pitchId)` - Track milestone progress

### Contract Event Listeners
- Listen for `PoolCreated` → Update DB
- Listen for `ContributionMade` → Update contribution table
- Listen for `VoteCast` → Update votes table
- Listen for `FundsDistributed` → Update pitch status

### Transaction Flows
1. **Submit Pitch**: Frontend → API → DB + Smart Contract
2. **Create Pool**: Admin → Smart Contract → Event → DB Sync
3. **Contribute**: User → Smart Contract → Event → DB Sync
4. **Vote**: User → Smart Contract → Event → DB Sync

---

## Risk Mitigation

### Smart Contract Risks
- **Upgrade Risk**: Use timelock, test thoroughly
- **Oracle Risk**: If using price feeds, use Chainlink
- **Economic Attack**: Rate limits, minimum contributions
- **Admin Key Compromise**: Use multisig for admin role

### Operational Risks
- **Gas Spikes**: Deploy on L2 (Arbitrum)
- **USDT Blacklist**: Handle blacklisted addresses gracefully
- **Regulatory**: Include pausable & KYC hooks

### Contingency Plans
- Emergency pause functionality
- Upgrade path for bug fixes
- Refund mechanism for all scenarios
- Off-chain dispute resolution

---

## Questions to Resolve

1. **Distribution Model**: Winner-takes-all vs proportional split?
2. **Voting Period**: Fixed duration or admin-controlled end?
3. **Minimum Contribution**: Set minimum to prevent spam?
4. **Maximum Winners**: How many startups per pool?
5. **Milestone Approval**: Admin only or DAO voting?
6. **Partial Withdrawals**: Can investors withdraw before voting ends?
7. **Multi-Token Support**: Only USDT or also ETH/USDC?
8. **Cross-Chain**: Deploy on multiple chains or bridge?
9. **NFT Receipts**: Issue NFTs for contributions/votes?
10. **Reputation System**: On-chain reputation for startups/investors?

---

## Next Steps

1. Review and approve this architecture plan
2. Resolve open questions above
3. Begin implementation starting with interfaces
4. Set up testing framework
5. Deploy to testnet and iterate
6. Security audit before mainnet

## Estimated Timeline
- **Planning & Design**: 1 day ✅
- **Core Contracts**: 3-4 days
- **Testing Suite**: 2-3 days
- **Deployment Scripts**: 1 day
- **Frontend Integration**: 2-3 days
- **Audit & Launch**: 2-4 weeks

**Total Development**: ~2 weeks for MVP smart contracts
