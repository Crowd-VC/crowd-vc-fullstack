# CrowdVC Smart Contracts - Comprehensive Testing Plan

## Table of Contents
1. [Testing Framework & Setup](#testing-framework--setup)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Security Tests](#security-tests)
5. [Edge Cases & Boundary Tests](#edge-cases--boundary-tests)
6. [Gas Optimization Tests](#gas-optimization-tests)
7. [Upgrade Tests](#upgrade-tests)
8. [Coverage Goals](#coverage-goals)
9. [Test Execution Strategy](#test-execution-strategy)

---

## Testing Framework & Setup

### Tools & Dependencies
- **Framework**: Hardhat 3.0.9
- **Testing Library**: Hardhat Viem + Chai
- **Coverage**: solidity-coverage
- **Gas Reporter**: hardhat-gas-reporter
- **Network Helpers**: @nomicfoundation/hardhat-network-helpers

### Test Environment Configuration
```typescript
// hardhat.config.ts
{
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: BASE_RPC_URL, // Fork BASE mainnet for realistic testing
        enabled: process.env.FORK_ENABLED === 'true'
      }
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  }
}
```

### Test Fixtures
Create reusable fixtures for common scenarios:
- `deployFactoryFixture()` - Deploy factory with initialized state
- `deployPoolFixture()` - Deploy pool with test data
- `registerUsersFixture()` - Register startup, investor, admin
- `submitPitchesFixture()` - Create approved pitches
- `createActivePoolFixture()` - Pool with contributions and votes

---

## Unit Tests



### 1. Library Tests

#### **FeeCalculator.sol** (`test/hardhat/libraries/FeeCalculator.test.ts`)

**Test Cases:**
- ✓ `calculatePlatformFee()` - Calculate correct fee amounts
  - Should calculate 5% fee (500 basis points) correctly
  - Should calculate 0% fee when feePercent is 0
  - Should calculate 10% max fee (1000 basis points)
  - Should revert when fee exceeds 1000 basis points
  - Should handle large amounts without overflow
  - Should handle rounding correctly (e.g., 333 basis points)

- ✓ `calculateNetAmount()` - Calculate amount after fee deduction
  - Should return correct net amount after 5% fee
  - Should return full amount when fee is 0
  - Should handle small amounts (edge case: 1 wei)

- ✓ `calculateProportionalDistribution()` - Proportional split among winners
  - Should split evenly when all winners have equal votes
  - Should split proportionally with different vote weights
  - Should allocate rounding dust to last winner
  - Should handle single winner (100% allocation)
  - Should revert when total votes is 0
  - Should not leave any funds unallocated

- ✓ `calculateAllocationPercents()` - Calculate percentage allocations
  - Should return basis points that sum to 10000 (100%)
  - Should handle uneven distributions
  - Should adjust last winner's percentage to ensure exact 10000 total

- ✓ `calculateEarlyWithdrawalPenalty()` - Calculate penalty and refund
  - Should calculate 10% penalty correctly
  - Should return correct refund amount (90% of contribution)
  - Should revert when penalty exceeds 10000 basis points
  - Should handle zero penalty

**Edge Cases:**
- Very small amounts (1-10 wei)
- Very large amounts (type(uint256).max - 1)
- Zero vote weights
- Array with single element
- Maximum array size

---

#### **ValidationLib.sol** (`test/hardhat/libraries/ValidationLib.test.ts`)

**Test Cases:**
- ✓ `validateAddress()` - Validate non-zero addresses
  - Should accept valid addresses
  - Should revert for zero address

- ✓ `validateAmount()` - Validate positive amounts
  - Should accept amounts > 0
  - Should revert for zero amount

- ✓ `validateString()` - Validate non-empty strings
  - Should accept non-empty strings
  - Should revert for empty strings

- ✓ `validateDuration()` - Validate duration ranges
  - Should accept duration within min/max range
  - Should revert when duration < min
  - Should revert when duration > max
  - Should accept exact min and max values

- ✓ `validateFundingGoal()` - Validate funding goal ranges
  - Should accept goals within MIN_FUNDING_GOAL to MAX_FUNDING_GOAL
  - Should revert for goals below minimum
  - Should revert for goals above maximum

- ✓ `validateDeadline()` - Validate future deadlines
  - Should accept deadlines in the future
  - Should revert for past deadlines
  - Should revert for current timestamp

- ✓ `validateNonEmptyArray()` - Validate arrays have elements
  - Should accept arrays with elements
  - Should revert for empty arrays

- ✓ `validatePitchData()` - Combined pitch validation
  - Should accept valid pitch data
  - Should revert for empty title
  - Should revert for empty IPFS hash
  - Should revert for invalid funding goal

- ✓ `validatePoolParameters()` - Combined pool validation
  - Should accept valid pool parameters
  - Should revert for empty pool name
  - Should revert for invalid funding goal
  - Should revert for invalid voting duration
  - Should revert for zero min contribution

---

### 2. CrowdVCFactory Tests

#### **Initialization** (`test/hardhat/CrowdVCFactory.test.ts`)

**Test Cases:**
- ✓ Should initialize with correct parameters
  - Verify treasury address is set
  - Verify platform fee is set correctly
  - Verify USDT and USDC are marked as supported tokens
  - Verify deployer has DEFAULT_ADMIN_ROLE and ADMIN_ROLE
  - Verify initial version is 1
  - Verify contract is not paused

- ✓ Should prevent re-initialization
  - Attempting to call initialize() again should revert

- ✓ Should revert initialization with invalid parameters
  - Zero treasury address
  - Zero USDT address
  - Zero USDC address
  - Platform fee > 1000 (10%)

---

#### **User Registration** (`test/hardhat/CrowdVCFactory.test.ts`)

**Test Cases:**
- ✓ Should register new startup user
  - Verify STARTUP_ROLE is granted
  - Verify user profile is stored correctly
  - Verify metadataURI is saved
  - Verify registeredAt timestamp is set
  - Verify isActive is true
  - Emit `UserRegistered` event

- ✓ Should register new investor user
  - Verify INVESTOR_ROLE is granted
  - Verify user profile is stored
  - Emit correct event

- ✓ Should prevent duplicate registration
  - Registering same address twice should revert

- ✓ Should prevent registration with empty metadata
  - Empty metadataURI should revert

- ✓ Should only allow Startup and Investor roles
  - Attempting to register as Admin should revert

- ✓ Should handle role checks correctly
  - hasRole(STARTUP_ROLE, address) should work
  - User should not have roles they didn't register for

**Edge Cases:**
- Register maximum number of users
- Register with very long metadataURI
- Register immediately after another registration (same block)

---

#### **Pitch Management** (`test/hardhat/CrowdVCFactory.test.ts`)

**Submit Pitch:**
- ✓ Should allow startup to submit pitch
  - Verify pitch is stored with correct data
  - Verify pitchId is generated correctly (keccak256)
  - Verify status is `Pending`
  - Verify submittedAt timestamp is set
  - Verify pitch is added to _userPitches mapping
  - Emit `PitchSubmitted` event

- ✓ Should revert if non-startup tries to submit
  - Investor attempting to submit should revert
  - Unregistered user attempting to submit should revert

- ✓ Should validate pitch data
  - Empty title should revert
  - Empty IPFS hash should revert
  - Funding goal below MIN_FUNDING_GOAL should revert
  - Funding goal above MAX_FUNDING_GOAL should revert

- ✓ Should allow startup to submit multiple pitches
  - Track all pitches in _userPitches array

**Update Pitch Status:**
- ✓ Admin should approve pitch
  - Status changes from Pending to Approved
  - approvedAt timestamp is set
  - Emit `PitchApproved` event

- ✓ Admin should reject pitch
  - Status changes to Rejected
  - Emit `PitchRejected` event

- ✓ Admin should move pitch to UnderReview
  - Status changes to UnderReview

- ✓ Should revert if non-admin tries to update status
  - Only ADMIN_ROLE can update pitch status

- ✓ Should revert for invalid pitch ID
  - Non-existent pitchId should revert

**Get Pitch Data:**
- ✓ Should retrieve pitch by ID
  - getPitch() returns correct PitchData struct

- ✓ Should get all pitches by startup
  - getUserPitches() returns array of pitch IDs

- ✓ Should check if pitch is approved
  - isPitchApproved() returns correct boolean

---

#### **Pool Creation** (`test/hardhat/CrowdVCFactory.test.ts`)

**Create Pool:**
- ✓ Should create pool with valid parameters
  - Verify pool contract is deployed
  - Verify pool is initialized with correct data
  - Verify pool address is added to _allPools
  - Verify _isPools[poolAddress] is true
  - Verify candidate pitches are set
  - Emit `PoolCreated` event

- ✓ Should only allow admin to create pool
  - Non-admin should revert

- ✓ Should validate pool parameters
  - Pool name cannot be empty
  - Funding goal must be within MIN_POOL_GOAL to MAX_POOL_GOAL
  - Voting duration must be within MIN_VOTING_DURATION to MAX_VOTING_DURATION
  - Min contribution must be > 0
  - Candidate pitches array cannot be empty

- ✓ Should only allow approved pitches
  - Including non-approved pitch should revert
  - All pitches must have Approved status

- ✓ Should update pitch status to InPool
  - After pool creation, pitch status changes to InPool

- ✓ Should support multiple accepted tokens
  - Create pool with USDT
  - Create pool with USDC
  - Revert for unsupported token

**Get Pools:**
- ✓ Should return all deployed pools
  - getAllPools() returns correct array

- ✓ Should verify pool authenticity
  - isPool(address) returns true for deployed pools
  - isPool(address) returns false for random addresses

---

#### **Platform Configuration** (`test/hardhat/CrowdVCFactory.test.ts`)

**Update Platform Fee:**
- ✓ Admin should update platform fee
  - Fee updates correctly
  - Emit `PlatformFeeUpdated` event

- ✓ Should revert if fee > 1000 (10%)
  - Setting fee to 1001 should revert

- ✓ Should prevent non-admin from updating fee
  - Only ADMIN_ROLE can update

**Add/Remove Supported Tokens:**
- ✓ Admin should add new supported token
  - supportedTokens[newToken] becomes true

- ✓ Admin should remove supported token
  - supportedTokens[token] becomes false

- ✓ Should prevent non-admin from modifying tokens

**Update Treasury:**
- ✓ Admin should update treasury address
  - Treasury updates to new address
  - Revert for zero address

---

#### **Access Control** (`test/hardhat/CrowdVCFactory.test.ts`)

**Role Management:**
- ✓ Admin should grant ADMIN_ROLE to new address
  - New address should have admin privileges

- ✓ Admin should revoke roles
  - Revoked user loses permissions

- ✓ Should check DEFAULT_ADMIN_ROLE hierarchy
  - Only DEFAULT_ADMIN_ROLE can manage roles

**Pausable:**
- ✓ Admin should pause contract
  - whenNotPaused functions should revert
  - Emit `Paused` event

- ✓ Admin should unpause contract
  - Functions should work again
  - Emit `Unpaused` event

- ✓ Critical functions should respect pause
  - registerUser() should revert when paused
  - submitPitch() should revert when paused
  - createPool() should revert when paused

---

### 3. CrowdVCPool Tests

#### **Initialization** (`test/hardhat/CrowdVCPool.test.ts`)

**Test Cases:**
- ✓ Should initialize with correct parameters
  - Verify pool name, category, fundingGoal
  - Verify votingDeadline and fundingDeadline
  - Verify acceptedToken is set
  - Verify platformFeePercent matches factory
  - Verify treasury address
  - Verify candidate pitches are set
  - Verify status is Active
  - Verify factory has ADMIN_ROLE

- ✓ Should prevent re-initialization
  - Second initialize() call should revert

- ✓ Should correctly set immutable factory address
  - factory variable should equal deployer (CrowdVCFactory)

---

#### **Contributions** (`test/hardhat/CrowdVCPool.test.ts`)

**Make Contribution:**
- ✓ Investor should contribute USDT/USDC
  - Tokens transferred from investor to pool
  - contributions[investor] increases by amount
  - totalContributions increases
  - NFT receipt is minted to investor
  - tokenIdToInvestor maps NFT to investor
  - tokenIdToAmount maps NFT to contribution amount
  - investorTokenIds tracks all NFTs for investor
  - Emit `ContributionMade` event

- ✓ Should enforce minimum contribution
  - Contribution below minContribution should revert

- ✓ Should allow multiple contributions from same investor
  - contributions[investor] accumulates
  - Multiple NFTs are issued

- ✓ Should revert if pool is not Active
  - Contributions after voting deadline should revert
  - Contributions to closed pool should revert

- ✓ Should revert for zero amount
  - contribute(0) should revert

- ✓ Should revert if token allowance insufficient
  - Investor must approve pool to spend tokens

- ✓ Should handle ERC20 transfer failures gracefully
  - Use SafeERC20 to prevent silent failures

**Contribution Tracking:**
- ✓ Should track total contributions accurately
  - totalContributions matches sum of all contributions

- ✓ Should track individual investor contributions
  - contributions[investor] is correct

- ✓ Should issue unique NFT token IDs
  - Each contribution gets incrementing token ID
  - _nextTokenId increments correctly

**NFT Receipts:**
- ✓ Should mint ERC721 NFT for each contribution
  - ownerOf(tokenId) returns investor address
  - balanceOf(investor) increases

- ✓ Should allow NFT transfers
  - Investor can transfer NFT to another address
  - New owner does not inherit voting rights (tied to original contributor)

- ✓ Should support ERC721 metadata
  - tokenURI() returns correct metadata (if implemented)

---

#### **Voting** (`test/hardhat/CrowdVCPool.test.ts`)

**Cast Vote:**
- ✓ Should allow contributor to vote for pitch
  - Vote weight equals contribution amount
  - voteWeights[pitchId] increases by contribution amount
  - hasVoted[investor][pitchId] becomes true
  - Emit `VoteCast` event

- ✓ Should prevent duplicate votes for same pitch
  - Voting twice for same pitch should revert

- ✓ Should allow voting for multiple pitches
  - Investor can cast votes for different pitches
  - Vote weight is same for each pitch (contribution amount)

- ✓ Should prevent voting for non-candidate pitch
  - Pitch not in candidatePitches array should revert

- ✓ Should prevent voting by non-contributors
  - Address with zero contribution should revert

- ✓ Should prevent voting after deadline
  - Votes after votingDeadline should revert

- ✓ Should calculate weighted voting correctly
  - Investor with 1000 USDT contribution has 1000 vote weight
  - Vote weight is per-pitch (can vote for all pitches with same weight)

**Voting Deadline:**
- ✓ Should enforce voting deadline
  - Votes before deadline should succeed
  - Votes after deadline should revert

- ✓ Should allow early closure by admin
  - Admin can end voting before deadline
  - Status changes to VotingEnded

---

#### **Winner Selection** (`test/hardhat/CrowdVCPool.test.ts`)

**Finalize Voting:**
- ✓ Should finalize voting and select top 3 winners
  - Status changes from Active to VotingEnded
  - _winners array contains top 3 pitches by vote weight
  - Winners sorted by vote weight (descending)
  - Emit `VotingEnded` event

- ✓ Should handle ties correctly
  - If 4th place ties with 3rd, all tied pitches become winners
  - If 10 pitches tie for 3rd, all 10 become winners
  - MAX_WINNERS (3) is exceeded only in case of ties

- ✓ Should handle fewer than 3 candidates
  - If only 2 pitches, both become winners
  - If only 1 pitch, it becomes sole winner

- ✓ Should only allow admin to finalize
  - Non-admin calling finalizeVoting() should revert

- ✓ Should revert if already finalized
  - Calling finalizeVoting() twice should revert

- ✓ Should allocate funds to winners proportionally
  - Calculate net pool amount (after platform fee)
  - Distribute to winners based on vote weight percentages
  - totalAllocated[pitchId] is set for each winner
  - Platform fee is sent to treasury

**Get Winners:**
- ✓ Should return list of winning pitches
  - getWinners() returns array of VoteResult structs

- ✓ Should return allocation amounts for each winner
  - Winner with 50% of votes gets 50% of net pool funds

- ✓ Should handle no votes scenario
  - If no votes cast, finalize should handle gracefully (refund scenario)

---

#### **Fund Distribution** (`test/hardhat/CrowdVCPool.test.ts`)

**Create Milestones:**
- ✓ Admin should create milestones for winner
  - Milestones array is populated
  - Each milestone has description, fundingPercent, deadline
  - Sum of fundingPercent should equal 10000 (100%)

- ✓ Should validate milestone percentages
  - Total must equal 10000 basis points
  - Individual percentages must be > 0

**Complete Milestone:**
- ✓ Startup should submit milestone completion
  - Provide evidenceURI (IPFS proof)
  - Milestone marked as submitted (pending admin approval)

- ✓ Admin should approve milestone
  - Milestone.completed becomes true
  - Funds are released to startup
  - totalDistributed[pitchId] increases
  - Emit `MilestoneCompleted` event
  - Emit `FundsDistributed` event

- ✓ Should calculate milestone amount correctly
  - If milestone is 30%, release 30% of totalAllocated[pitchId]

- ✓ Should prevent double distribution
  - Completing same milestone twice should revert

- ✓ Should prevent distribution if milestone incomplete
  - Only completed milestones can distribute funds

**Milestone Disputes:**
- ✓ Should allow admin to dispute milestone
  - Milestone.disputed becomes true
  - Funds are not released
  - Emit `MilestoneDisputed` event

- ✓ Should allow resolving dispute
  - Admin can mark dispute as resolved
  - Funds can then be released

---

#### **Refunds** (`test/hardhat/CrowdVCPool.test.ts`)

**Early Withdrawal:**
- ✓ Should allow investor to withdraw before voting ends
  - 10% penalty is applied
  - Penalty is added to totalPenalties pool
  - 90% is returned to investor
  - contributions[investor] becomes 0
  - Vote weight is removed (if already voted)
  - NFT is burned or marked as redeemed
  - Emit `EarlyWithdrawal` event

- ✓ Should prevent early withdrawal after voting ends
  - After votingDeadline, early withdrawal should revert

- ✓ Should prevent double withdrawal
  - Withdrawing twice should revert

**Full Refund (Failed Pool):**
- ✓ Should refund all investors if funding goal not met
  - If totalContributions < fundingGoal by fundingDeadline
  - Status changes to Failed
  - Investors can call requestRefund()
  - 100% of contribution is returned
  - hasRefunded[investor] becomes true
  - Emit `Refunded` event

- ✓ Should prevent refund if pool succeeded
  - If totalContributions >= fundingGoal, refund should revert

- ✓ Should prevent duplicate refunds
  - Calling requestRefund() twice should revert

**Penalty Distribution:**
- ✓ Should distribute penalties to remaining investors
  - totalPenalties from early withdrawals
  - Distributed proportionally to contributors who stayed
  - Or sent to treasury (depending on implementation)

---

#### **Access Control & Admin Functions** (`test/hardhat/CrowdVCPool.test.ts`)

**Admin Functions:**
- ✓ Should allow factory to call admin functions
  - Factory has ADMIN_ROLE by default

- ✓ Should allow admin to pause pool
  - Contributions and voting pause
  - Emit `Paused` event

- ✓ Should allow admin to unpause pool
  - Operations resume

**Emergency Functions:**
- ✓ Admin should trigger emergency withdrawal
  - All funds returned to investors
  - Pool marked as Failed
  - Only callable in emergency situations

---

#### **Pool Status Lifecycle** (`test/hardhat/CrowdVCPool.test.ts`)

**Status Transitions:**
- ✓ Active → VotingEnded (after voting deadline or admin closure)
- ✓ VotingEnded → Funded (after winner selection and fund allocation)
- ✓ Active → Failed (if funding goal not met)
- ✓ Funded → Closed (after all milestones completed)

**Status Checks:**
- ✓ Functions should respect pool status
  - contribute() only works in Active status
  - vote() only works in Active status (before deadline)
  - finalizeVoting() only works after deadline or admin closure
  - requestRefund() only works in Failed status

---

## Integration Tests

### **Full Lifecycle Tests** (`test/hardhat/integration/FullLifecycle.test.ts`)

**Happy Path:**
1. ✓ Complete platform lifecycle
   - Deploy factory and configure
   - Register users (startups, investors, admin)
   - Startups submit pitches
   - Admin approves pitches
   - Admin creates pool with approved pitches
   - Investors contribute USDT to pool
   - Investors vote for pitches
   - Voting deadline passes
   - Admin finalizes voting
   - Top 3 winners are selected
   - Admin creates milestones for winners
   - Startups complete milestones
   - Admin approves milestones
   - Funds are distributed to startups
   - Pool closes successfully

**Multiple Pools:**
2. ✓ Create multiple concurrent pools
   - Pool A with Tech category
   - Pool B with Healthcare category
   - Investors contribute to both
   - Both pools finalize independently
   - Verify isolated state (no cross-pool interference)

**Failed Pool Scenario:**
3. ✓ Pool fails to meet funding goal
   - Create pool with high funding goal
   - Few contributions
   - Funding deadline passes
   - Pool status changes to Failed
   - All investors request and receive full refunds

**Early Withdrawal Scenario:**
4. ✓ Some investors withdraw early
   - Investors contribute
   - Some investors withdraw before voting ends (10% penalty)
   - Remaining investors vote
   - Pool succeeds with reduced funding
   - Penalties distributed or sent to treasury

**Tied Voting Scenario:**
5. ✓ Handle tie in voting results
   - 3 pitches tie for 3rd place
   - All tied pitches become winners (6 total winners)
   - Funds distributed proportionally to all winners

**Milestone Dispute:**
6. ✓ Milestone completion is disputed
   - Startup submits milestone evidence
   - Admin disputes milestone
   - Off-chain resolution occurs
   - Admin resolves dispute and approves/rejects
   - Funds distributed accordingly

---

### **Multi-User Scenarios** (`test/hardhat/integration/MultiUser.test.ts`)

**Concurrent Contributions:**
- ✓ 100 investors contribute to same pool simultaneously
  - Verify all contributions are recorded
  - Verify NFTs are issued correctly
  - Verify totalContributions is accurate

**Mass Voting:**
- ✓ 100 investors vote for various pitches
  - Verify all votes are counted
  - Verify vote weights are accurate
  - Verify winner selection handles large dataset

**Large Refund:**
- ✓ 100 investors request refunds after pool fails
  - All refunds processed correctly
  - Pool balance reaches zero

---

## Security Tests

### **Reentrancy Tests** (`test/hardhat/security/Reentrancy.test.ts`)

**Test Cases:**
- ✓ Prevent reentrancy on contribute()
  - Attempt reentrancy attack via malicious ERC20 token
  - Should revert due to ReentrancyGuard

- ✓ Prevent reentrancy on requestRefund()
  - Malicious investor contract attempts reentrancy
  - Should revert

- ✓ Prevent reentrancy on distributeFunds()
  - Malicious startup contract attempts reentrancy
  - Should revert

**Attack Vectors:**
- Malicious ERC20 token with callback on transfer
- Malicious investor contract with fallback function
- Cross-function reentrancy

---

### **Access Control Tests** (`test/hardhat/security/AccessControl.test.ts`)

**Test Cases:**
- ✓ Prevent non-admin from calling admin functions
  - updatePlatformFee() should revert for non-admin
  - approvePitch() should revert for non-admin
  - createPool() should revert for non-admin
  - finalizeVoting() should revert for non-admin

- ✓ Prevent privilege escalation
  - Startup cannot grant itself ADMIN_ROLE
  - Investor cannot grant itself STARTUP_ROLE

- ✓ Verify role hierarchy
  - DEFAULT_ADMIN_ROLE can manage all roles
  - ADMIN_ROLE can perform admin functions
  - STARTUP_ROLE can submit pitches
  - INVESTOR_ROLE can contribute and vote

**Attack Scenarios:**
- Attempt to bypass access control with delegatecall
- Attempt to front-run role grants
- Attempt to call initialize() again

---

### **Integer Overflow/Underflow** (`test/hardhat/security/IntegerSafety.test.ts`)

**Test Cases:**
- ✓ Prevent overflow in contribution accumulation
  - Contribute type(uint256).max - 1
  - Attempt another contribution (should revert)

- ✓ Prevent underflow in refunds
  - Attempt to refund more than contributed
  - Should revert or handle gracefully

- ✓ Prevent overflow in vote weight calculation
  - Very large contributions shouldn't overflow vote weights

**Note:** Solidity 0.8+ has built-in overflow protection, but test edge cases

---

### **Front-Running Tests** (`test/hardhat/security/FrontRunning.test.ts`)

**Test Cases:**
- ✓ Prevent front-running on contribution
  - Attacker sees large contribution in mempool
  - Attacker submits contribution with higher gas to vote first
  - Both should succeed in order (no benefit to front-running)

- ✓ Prevent front-running on vote
  - Similar scenario - no benefit to voting earlier

- ✓ Prevent front-running on early withdrawal
  - Investor tries to withdraw before malicious finalization

**Mitigation:** Use commit-reveal pattern if necessary (future enhancement)

---

### **Token Security** (`test/hardhat/security/TokenSecurity.test.ts`)

**Test Cases:**
- ✓ Handle ERC20 transfer failures
  - Use SafeERC20 to revert on failure
  - Test with token that returns false on transfer

- ✓ Prevent malicious token contracts
  - Token that reenters on transfer
  - Token that changes balance after transfer

- ✓ Handle USDT quirks
  - USDT on mainnet does not return bool on transfer
  - SafeERC20 handles this correctly

---

### **Upgrade Security** (`test/hardhat/security/UpgradeSecurity.test.ts`)

**Test Cases:**
- ✓ Prevent unauthorized upgrades
  - Only DEFAULT_ADMIN_ROLE can upgrade factory
  - _authorizeUpgrade() reverts for non-admin

- ✓ Verify storage preservation
  - Upgrade to V2 implementation
  - Verify all storage variables are intact

- ✓ Prevent initialization of implementation
  - Direct call to implementation's initialize() should revert

- ✓ Verify upgrade process
  - Deploy new implementation
  - Call upgradeToAndCall() with admin role
  - Verify new implementation is active

---

## Edge Cases & Boundary Tests

### **Boundary Value Tests** (`test/hardhat/edge-cases/BoundaryValues.test.ts`)

**Funding Goals:**
- ✓ MIN_FUNDING_GOAL (1000 USDC) - Should accept
- ✓ MIN_FUNDING_GOAL - 1 - Should revert
- ✓ MAX_FUNDING_GOAL (10M USDC) - Should accept
- ✓ MAX_FUNDING_GOAL + 1 - Should revert

**Voting Duration:**
- ✓ MIN_VOTING_DURATION (1 day) - Should accept
- ✓ MIN_VOTING_DURATION - 1 - Should revert
- ✓ MAX_VOTING_DURATION (30 days) - Should accept
- ✓ MAX_VOTING_DURATION + 1 - Should revert

**Platform Fee:**
- ✓ 0% fee (0 basis points) - Should accept
- ✓ 10% fee (1000 basis points) - Should accept
- ✓ 10.01% fee (1001 basis points) - Should revert

**Contribution Amounts:**
- ✓ minContribution - Should accept
- ✓ minContribution - 1 - Should revert
- ✓ Very large contribution (near type(uint256).max) - Should handle or revert gracefully

---

### **Edge Case Scenarios** (`test/hardhat/edge-cases/EdgeCases.test.ts`)

**Zero/Null Cases:**
- ✓ Pool with zero contributions
  - Should fail or allow refunds
- ✓ Pool with zero votes
  - finalizeVoting() should handle (no winners)
- ✓ Pitch with empty metadata
  - Should revert on submission

**Extreme Cases:**
- ✓ 1000 candidate pitches in single pool
  - Test gas limits on winner selection
- ✓ Single investor contributes 100% of funding goal
  - Verify voting works correctly
- ✓ Voting deadline = funding deadline (same timestamp)
  - Verify correct behavior

**Timing Edge Cases:**
- ✓ Contribute exactly at funding deadline
  - Block.timestamp == fundingDeadline
- ✓ Vote exactly at voting deadline
  - Block.timestamp == votingDeadline
- ✓ Multiple actions in same block
  - Contribute, vote, withdraw in same block

**Rounding Edge Cases:**
- ✓ Platform fee calculation with odd amounts
  - 333 basis points on 100 USDC
- ✓ Proportional distribution with rounding
  - Verify no funds are lost to rounding

---

## Gas Optimization Tests

### **Gas Reporter** (`test/hardhat/gas/GasOptimization.test.ts`)

**Measure Gas Costs:**
- ✓ Factory.initialize() - Target: < 500k gas
- ✓ Factory.registerUser() - Target: < 150k gas
- ✓ Factory.submitPitch() - Target: < 200k gas
- ✓ Factory.createPool() - Target: < 3M gas (deploys new contract)
- ✓ Pool.contribute() - Target: < 150k gas (includes ERC721 mint)
- ✓ Pool.vote() - Target: < 100k gas
- ✓ Pool.finalizeVoting() - Target: < 500k gas (depends on candidate count)
- ✓ Pool.distributeFunds() - Target: < 200k gas

**Optimization Opportunities:**
- Compare gas costs before and after optimizations
- Identify most expensive operations
- Test with varying data sizes (e.g., 10 vs 100 candidates)

**Gas Reporter Output:**
```
·--------------------------------|----------------|-------------·
|  Contract                      │  Method        │  Gas        │
·--------------------------------|----------------|-------------·
|  CrowdVCFactory                │  createPool    │  2,850,000  │
|  CrowdVCPool                   │  contribute    │    145,000  │
|  CrowdVCPool                   │  vote          │     85,000  │
·--------------------------------|----------------|-------------·
```

---

## Upgrade Tests

### **UUPS Upgrade Tests** (`test/hardhat/upgrades/UUPSUpgrade.test.ts`)

**Test Cases:**
- ✓ Deploy proxy and implementation
  - Verify proxy delegates to implementation
  - Verify proxy storage is separate

- ✓ Upgrade to new implementation
  - Deploy CrowdVCFactoryV2
  - Call upgradeToAndCall() from admin
  - Verify new implementation is used
  - Verify storage is preserved

- ✓ Add new functionality in V2
  - Add new state variable
  - Add new function
  - Verify new function works
  - Verify old functions still work

- ✓ Verify storage layout compatibility
  - V2 should not reorder or remove V1 storage variables
  - New variables should be appended

- ✓ Test version tracking
  - V1: version = 1
  - V2: version = 2

**Upgrade Scenarios:**
- Emergency upgrade to fix critical bug
- Feature upgrade to add new pool types
- Fee structure upgrade

---

## Coverage Goals

### **Target Metrics:**
- **Line Coverage**: > 95%
- **Branch Coverage**: > 90%
- **Function Coverage**: 100%
- **Statement Coverage**: > 95%

### **Coverage Report:**
```bash
# Generate coverage report
pnpm contracts:test --coverage

# Expected output:
File                  | % Stmts | % Branch | % Funcs | % Lines |
--------------------- |---------|----------|---------|---------|
CrowdVCFactory.sol    |   98.5  |   92.3   |   100   |   98.2  |
CrowdVCPool.sol       |   97.1  |   90.5   |   100   |   96.8  |
FeeCalculator.sol     |   100   |   100    |   100   |   100   |
ValidationLib.sol     |   100   |   100    |   100   |   100   |
--------------------- |---------|----------|---------|---------|
All files             |   98.2  |   91.5   |   100   |   97.9  |
```

### **Uncovered Lines:**
- Document any intentionally uncovered lines
- Explain why certain edge cases are not testable
- Create TODO for difficult-to-test scenarios

---

## Test Execution Strategy

### **Test Organization:**

```
test/hardhat/
├── libraries/
│   ├── FeeCalculator.test.ts           # Library tests
│   └── ValidationLib.test.ts
├── CrowdVCFactory.test.ts              # Factory unit tests
├── CrowdVCPool.test.ts                 # Pool unit tests
├── integration/
│   ├── FullLifecycle.test.ts           # End-to-end tests
│   └── MultiUser.test.ts               # Concurrent user tests
├── security/
│   ├── Reentrancy.test.ts              # Reentrancy attacks
│   ├── AccessControl.test.ts           # Permission tests
│   ├── IntegerSafety.test.ts           # Overflow/underflow
│   ├── FrontRunning.test.ts            # MEV tests
│   ├── TokenSecurity.test.ts           # ERC20 edge cases
│   └── UpgradeSecurity.test.ts         # UUPS upgrade tests
├── edge-cases/
│   ├── BoundaryValues.test.ts          # Min/max values
│   └── EdgeCases.test.ts               # Unusual scenarios
├── gas/
│   └── GasOptimization.test.ts         # Gas measurements
└── upgrades/
    └── UUPSUpgrade.test.ts             # Upgrade tests
```

### **Test Execution Commands:**

```bash
# Run all tests
pnpm contracts:test

# Run specific test file
pnpm contracts:test test/hardhat/CrowdVCFactory.test.ts

# Run tests with coverage
pnpm contracts:test --coverage

# Run tests with gas reporter
REPORT_GAS=true pnpm contracts:test

# Run only integration tests
pnpm contracts:test test/hardhat/integration/

# Run only security tests
pnpm contracts:test test/hardhat/security/

# Run tests on forked mainnet
FORK_ENABLED=true pnpm contracts:test
```

### **Continuous Integration:**

**GitHub Actions Workflow:**
```yaml
# .github/workflows/contracts-test.yml
name: Smart Contract Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm contracts:compile
      - run: pnpm contracts:test

      - name: Generate coverage report
        run: pnpm contracts:test --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### **Pre-Deployment Checklist:**

Before deploying to mainnet:
- [ ] All tests pass (100%)
- [ ] Coverage > 95%
- [ ] Gas costs reviewed and optimized
- [ ] Security tests pass
- [ ] Upgrade tests pass
- [ ] External audit completed
- [ ] Mainnet fork tests successful
- [ ] Emergency procedures documented
- [ ] Multisig setup verified

---

## Testing Best Practices

1. **Write tests before implementation** (TDD approach)
2. **Use descriptive test names** (should/when/given format)
3. **Test one thing per test case**
4. **Use fixtures for common setup**
5. **Mock external dependencies** (e.g., time with hardhat network helpers)
6. **Test both positive and negative cases**
7. **Document complex test scenarios**
8. **Keep tests maintainable** (DRY principle)
9. **Run tests frequently** (on every commit)
10. **Review test coverage reports** (identify gaps)

---

## Appendix: Test Utilities

### **Helper Functions:**

```typescript
// test/helpers/utils.ts

export async function increaseTime(seconds: number) {
  await time.increase(seconds);
}

export async function mineBlocks(blocks: number) {
  for (let i = 0; i < blocks; i++) {
    await time.increase(1);
  }
}

export async function getLatestBlockTimestamp() {
  return await time.latest();
}

export function calculatePitchId(startup: Address, title: string, timestamp: number) {
  return keccak256(
    encodePacked(['address', 'string', 'uint256'], [startup, title, timestamp])
  );
}

export async function deployMockUSDT() {
  // Deploy mock USDT with 6 decimals
  const MockUSDT = await viem.deployContract("MockUSDT");
  return MockUSDT;
}
```

### **Custom Matchers:**

```typescript
// test/helpers/matchers.ts

export function expectEvent(receipt: any, eventName: string) {
  // Helper to check event emission
}

export function expectRevert(promise: Promise<any>, reason?: string) {
  // Helper to check reverts with specific reasons
}
```

---

## Summary

This testing plan provides comprehensive coverage for the CrowdVC smart contracts. By implementing all test cases, we ensure:

- **Functionality**: All features work as intended
- **Security**: Contracts are resilient to attacks
- **Reliability**: Edge cases are handled gracefully
- **Performance**: Gas costs are optimized
- **Upgradeability**: UUPS upgrade mechanism is secure
- **Maintainability**: Tests are organized and documented

**Estimated Testing Timeline:**
- Library tests: 1 day
- CrowdVCFactory tests: 2 days
- CrowdVCPool tests: 3 days
- Integration tests: 2 days
- Security tests: 2 days
- Edge cases & optimization: 1 day
- **Total**: ~11 days for complete test suite

**Next Steps:**
1. Review and approve this testing plan
2. Set up test infrastructure (fixtures, helpers)
3. Implement tests incrementally (start with libraries)
4. Run tests continuously during contract development
5. Achieve 95%+ coverage before deployment
6. External audit with test suite as reference
