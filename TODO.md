# CrowdVC Platform - Complete Development TODO

**Created:** December 4, 2025  
**Reference:** `PROJECT_STATUS_REPORT.md`, `app_context.md`

---

## Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked/Issue
- **Priority:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 1. Smart Contract Updates 🔴

### 1.1 Vote Limit Enforcement & Contribution Updates

> **Priority:** 🔴 Critical  
> **Rationale:** App context specifies max 3 startups per investor
>
> **Key Design Rules:**
>
> - Contribute and vote are **separate actions** (no auto-voting)
> - Contribute does NOT depend on vote (no `pitchId` in contribute function)
> - Can't vote if haven't contributed
> - Vote weight is **equally distributed** among all startups voted for
> - Vote changes are supported (decrement old, increment new)
> - Platform fees transferred to Treasury immediately on contribution
> - Early withdrawal penalties transferred to Treasury immediately
> - **Penalty calculated on netAmount** (after platform fee deducted)
>   - Example: 2.5% platform fee + 10% penalty = user receives 87.5% back (not 87.25%)
>
> **Architectural Changes:**
>
> 1. **`contribute()`**: Remove `pitchId` parameter, transfer platform fees to Treasury immediately
> 2. **`vote()`**: Handle pitch allocation and weight distribution
> 3. **`changeVote()`**: Recalculate weights across all votes
> 4. **`withdrawEarly()`**: Transfer penalties to Treasury immediately (calculated on netAmount)
> 5. **`endVoting()`**: Remove platform fee and penalty calculations (already transferred)
> 6. **`Contribution` struct**: Remove `pitchId` field
>
> **Money Flow Example** (1000 tokens, 2.5% platform fee, 10% penalty):
>
> - **Contribute**: User sends 1000 → Treasury gets 25 (fee) → Pool holds 975 (netAmount)
> - **Early Withdraw**: Pool has 975 → Treasury gets 97.5 (penalty) → User gets 877.5 (refund)
> - **Total to Treasury**: 25 + 97.5 = 122.5 | **Total to User**: 877.5 | **Total**: 1000 ✓

- [ ] **1.1.1** Add `MAX_VOTES_PER_INVESTOR` constant to `CrowdVCPool.sol`
  - [ ] Define constant (default: 3)
  - [ ] Make configurable ONLY BY ADMIN per pool if needed
- [ ] **1.1.2** Add vote tracking per investor
  - [ ] Create array: `mapping(address => bytes32[]) public investorVotes` (tracks all pitches voted for)
  - [ ] Create helper: `mapping(address => mapping(bytes32 => bool)) public hasVotedFor` (quick lookup)
  - [ ] Update on vote/changeVote to maintain array
- [ ] **1.1.3** Update vote weight calculation
  - [ ] Weight per pitch = `totalContribution / numberOfVotes`
  - [ ] Recalculate weights when votes change
  - [ ] Store: `mapping(address => mapping(bytes32 => uint256)) public voteWeightPerPitch`
- [ ] **1.1.4** Add vote limit check in `vote()` function
  - [ ] Add custom error: `error MaxVotesExceeded(uint256 current, uint256 max)`
  - [ ] Check: `investorVotes[msg.sender].length < MAX_VOTES_PER_INVESTOR`
  - [ ] Allow voting up to limit (not just one pitch)
- [ ] **1.1.5** Update `changeVote()` function
  - [ ] Remove old pitch from `investorVotes` array
  - [ ] Decrement old pitch's vote weight
  - [ ] Add new pitch to `investorVotes` array
  - [ ] Increment new pitch's vote weight
  - [ ] Respect vote limit
- [ ] **1.1.6** Update `contribute()` signature and logic
  - [ ] Remove `pitchId` parameter from function signature
  - [ ] Update interface: `function contribute(uint256 amount, address token) external returns (uint256 tokenId)`
  - [ ] Remove lines 258-263 (auto-vote logic)
  - [ ] Remove `contributionsPerPitch` tracking from contribute (move to vote)
  - [ ] **Update contribution tracking** (CRITICAL)
    - Current: `contributions[msg.sender] += amount` (gross amount - line 232)
    - New: `contributions[msg.sender] += netAmount` (after platform fee)
    - This ensures vote weight calculations use actual pool funds
  - [ ] Vote weight = 0 until investor explicitly votes
- [ ] **1.1.6b** Add Treasury transfer for platform fees
  - [ ] Transfer platform fee to Treasury immediately in `contribute()`
  - [ ] Use `IERC20(token).safeTransfer(treasury, platformFee)` right after fee calculation
  - [ ] Add new event: `event PlatformFeeTransferred(address indexed token, uint256 amount, uint256 timestamp)`
  - [ ] **IMPORTANT**: Update `totalContributions` tracking
    - Current: `totalContributions += amount` (gross amount)
    - New: `totalContributions += netAmount` (after platform fee)
    - This ensures `totalContributions` reflects actual pool funds
  - [ ] Remove platform fee transfer from `endVoting()` (lines 424-428)
  - [ ] Remove `totalPlatformFees` tracking (no longer needed - line 114)
  - [ ] Remove `totalPenalties` tracking (no longer needed - line 99)
  - [ ] Update netAmount calculation in `endVoting()` (line 422):
    - Current: `netAmount = totalContributions - totalPlatformFees + totalPenalties`
    - New: `netAmount = totalContributions` (already reflects net funds, fees/penalties sent to Treasury)
  - [ ] Treasury contract already supports ERC20 via `receive()` and SafeERC20
- [ ] **1.1.7** Update `vote()` function to track pitch contributions
  - [ ] Move `contributionsPerPitch` tracking here from contribute
  - [ ] Calculate vote weight per pitch when voting
  - [ ] Update `contributionsPerPitch[msg.sender][pitchId]` to reflect vote allocation
  - [ ] Emit event with weight allocation details
- [ ] **1.1.8** Update `withdrawEarly()` to handle multiple votes and penalties
  - [ ] Remove all vote weights from all voted pitches
  - [ ] Clear `investorVotes` array
  - [ ] Reset all `hasVotedFor` mappings
  - [ ] Clear all `contributionsPerPitch` entries
  - [ ] **Fix penalty calculation to use netAmount** (CRITICAL)
    - Current: Penalty calculated on gross `contribution` amount (line 288-291)
    - New: Penalty calculated on `netAmount` (after platform fee already sent to Treasury)
    - Get `netAmount` from `contributionData[msg.sender].netAmount`
    - Example: If platform fee = 2.5% and penalty = 10%, user loses 12.5% total (not 12.5% + 2.5%)
  - [ ] **Update totalContributions tracking**
    - Current: `totalContributions -= contribution` (gross amount - line 285)
    - New: `totalContributions -= netAmount` (matches what was added in contribute)
    - This ensures `totalContributions` always reflects actual pool balance
  - [ ] **Transfer penalty to Treasury and refund to user**
    - Calculate penalty on netAmount: `penalty = netAmount * penaltyPercent / BASIS_POINTS`
    - Calculate refund: `refund = netAmount - penalty`
    - Transfer penalty to Treasury: `IERC20(token).safeTransfer(treasury, penalty)`
    - Transfer refund to user: `IERC20(token).safeTransfer(msg.sender, refund)`
  - [ ] Add event: `event PenaltyTransferred(address indexed investor, address indexed token, uint256 penalty, uint256 timestamp)`
  - [ ] Update `EarlyWithdrawal` event to clarify penalty is on netAmount
  - [ ] Remove `totalPenalties` tracking (no longer needed - line 293)
  - [ ] Remove penalty from `endVoting()` calculation (line 422)
- [ ] **1.1.9** Update `Contribution` struct and tracking
  - [ ] Remove `pitchId` field (no longer needed at contribution time)
  - [ ] **Keep both `amount` (gross) and `netAmount` fields** (needed for accounting)
    - `amount`: Original gross contribution (for user records/NFT metadata)
    - `netAmount`: Amount after platform fee (for penalty calculation & pool accounting)
  - [ ] Update `contributionData` storage and retrieval
  - [ ] Update `getDetailedContribution()` view function
- [ ] **1.1.9b** Remove obsolete state variables
  - [ ] Remove `totalPlatformFees` (line 114) - fees sent directly to Treasury
  - [ ] Remove `totalPenalties` (line 99) - penalties sent directly to Treasury
  - [ ] Update any references to these variables throughout the contract
- [ ] **1.1.10** Write unit tests for vote limit and Treasury transfers
  - [ ] Test contributing without voting (no pitch specified)
  - [ ] Test voting for 1, 2, 3 pitches (equal distribution)
  - [ ] Test rejection when exceeding 3 votes
  - [ ] Test vote change within limit
  - [ ] Test vote weight redistribution on change
  - [ ] Test withdrawal clears all votes
  - [ ] Test platform fee transfer to Treasury on contribution
  - [ ] Test penalty transfer to Treasury on early withdrawal
  - [ ] **Test penalty calculation on netAmount** (CRITICAL)
    - Contribute 1000 tokens with 2.5% fee → 975 netAmount in pool
    - Early withdraw with 10% penalty → penalty = 97.5, refund = 877.5
    - Verify: Treasury gets 25 (fee) + 97.5 (penalty) = 122.5 total
    - Verify: User gets 877.5 refund (not 877.25)
  - [ ] Test contribution without pitchId parameter
  - [ ] Verify Treasury balance increases after fees and penalties

### 1.2 Interface Updates (ICrowdVCPool.sol)

> **Priority:** 🔴 Critical  
> **Rationale:** Interface must match implementation changes from 1.1

- [ ] **1.2.1** Update `contribute()` function signature
  - [ ] Change from: `function contribute(uint256 amount, address token, bytes32 pitchId) external returns (uint256 tokenId)`
  - [ ] Change to: `function contribute(uint256 amount, address token) external returns (uint256 tokenId)`
- [ ] **1.2.2** Update `Contribution` struct
  - [ ] Remove `pitchId` field
  - [ ] Keep all other fields (investor, amount, platformFee, netAmount, token, timestamp, nftTokenId, withdrawn)
- [ ] **1.2.3** Add new events
  - [ ] Add: `event PlatformFeeTransferred(address indexed token, uint256 amount, uint256 timestamp)`
  - [ ] Add: `event PenaltyTransferred(address indexed investor, address indexed token, uint256 penalty, uint256 timestamp)`
- [ ] **1.2.4** Update `ContributionMade` event (if needed)
  - [ ] Remove `pitchId` parameter if present
  - [ ] Keep: investor, amount, platformFee, token, tokenId, timestamp
- [ ] **1.2.5** Update `EarlyWithdrawal` event (if needed)
  - [ ] Ensure it includes: investor, contribution, penalty, refund, timestamp

### 1.3 Pitch Submission Window

> **Priority:** 🟠 High  
> **Rationale:** Spec requires separate deadline from voting

- [ ] **1.3.1** Add `pitchSubmissionDeadline` to `PoolConfig` struct
  - [ ] Update `ICrowdVCPool.sol` interface
  - [ ] Update `CrowdVCPool.sol` implementation
- [ ] **1.3.2** Add validation in `addStartup()` function
  - [ ] Check `block.timestamp < pitchSubmissionDeadline`
  - [ ] Add custom error: `error PitchSubmissionClosed()`
- [ ] **1.3.3** Update `createPool()` in Factory
  - [ ] Accept `pitchSubmissionDeadline` parameter
  - [ ] Validate: submissionDeadline < votingDeadline
- [ ] **1.3.4** Write unit tests
  - [ ] Test adding startup before deadline
  - [ ] Test rejection after deadline

### 1.4 Review/Remove registerUser

> **Priority:** 🟡 Medium  
> **Rationale:** Function exists but roles are never checked

- [ ] **1.4.1** Decision: Keep or Remove?
  - [ ] Document decision rationale
- [ ] **1.4.2** Option A: Remove `registerUser()`
  - [ ] Remove function from `CrowdVCFactory.sol`
  - [ ] Remove from `ICrowdVCFactory.sol` interface
  - [ ] Remove `updateUserType()` function
  - [ ] Remove `UserProfile` struct if unused
  - [ ] Remove related events
  - [ ] Update deployment scripts
  - [ ] Update frontend hooks
- [ ] **1.4.3** Option B: Add Role Enforcement
  - [ ] Add role check to `submitPitch()`: `onlyRole(STARTUP_ROLE)`
  - [ ] Consider if `contribute()` should require `INVESTOR_ROLE`
  - [ ] Update frontend to require registration flow

### 1.5 Review activatePool Function

> **Priority:** 🟢 Low  
> **Rationale:** Currently a no-op, may need functionality

- [ ] **1.5.1** Analyze current implementation
  - [ ] Check if any state changes occur
  - [ ] Determine if pool status change is needed
- [ ] **1.5.2** Either implement proper activation logic or document as manual trigger

### 1.6 Contract Testing & Verification

> **Priority:** 🔴 Critical  
> **Rationale:** Must ensure all changes work correctly

- [ ] **1.6.1** Test vote limit enforcement (multi-vote scenarios)
- [ ] **1.6.2** Test pitch submission window
- [ ] **1.6.3** Test contribution without pitchId parameter
- [ ] **1.6.4** Test Treasury transfers
  - [ ] Test platform fee transfer to Treasury on contribution
  - [ ] Test penalty transfer to Treasury on early withdrawal
  - [ ] Verify Treasury balance increases correctly
  - [ ] Test events: `PlatformFeeTransferred` and `PenaltyTransferred`
- [ ] **1.6.5** Test vote weight equal distribution
- [ ] **1.6.6** Test `endVoting()` with new netAmount calculation
  - [ ] Verify no double-counting of fees/penalties
  - [ ] Verify correct allocation to winners
- [ ] **1.6.7** Update test suite for new features
- [ ] **1.6.8** Run full test coverage (target: >80%)
- [ ] **1.6.9** Deploy to testnet (Sepolia)
- [ ] **1.6.10** Verify contract on block explorer after deployment

### 1.7 ABI Updates (packages/abis)

> **Priority:** 🔴 Critical  
> **Rationale:** ABIs must match updated contract interfaces

- [ ] **1.7.1** Update `pool.ts` ABI after contract changes
  - [ ] Update `contribute` function signature (remove pitchId)
  - [ ] Update `Contribution` struct (remove pitchId)
  - [ ] Add `PlatformFeeTransferred` event
  - [ ] Add `PenaltyTransferred` event
  - [ ] Update `ContributionMade` event if changed
  - [ ] Update `EarlyWithdrawal` event if changed
- [ ] **1.7.2** Regenerate ABIs from compiled contracts
  - [ ] Run: `cd packages/contracts && npx hardhat compile`
  - [ ] Copy updated ABIs to `packages/abis/src/`
- [ ] **1.7.3** Update TypeScript types
  - [ ] Ensure type safety for new signatures
  - [ ] Update any exported interfaces

---

## 2. Database Schema Updates 🔴

### 2.1 Milestones Table

> **Priority:** 🔴 Critical  
> **Rationale:** Required for off-chain milestone tracking

- [ ] **2.1.1** Create schema file: `src/db/schema/milestones.ts`
  ```
  - id (text, PK)
  - poolId (FK → pools)
  - pitchId (FK → pitches)
  - description (text)
  - fundingPercent (integer, basis points)
  - deadline (timestamp)
  - completed (boolean)
  - disputed (boolean)
  - evidenceUri (text, nullable)
  - approvalCount (integer)
  - approvalsNeeded (integer)
  - createdAt (timestamp)
  - updatedAt (timestamp)
  ```
- [ ] **2.1.2** Create milestone status enum
- [ ] **2.1.3** Export from `schema/index.ts`
- [ ] **2.1.4** Generate migration: `pnpm db:generate`
- [ ] **2.1.5** Apply migration: `pnpm db:push`

### 2.2 Milestone Approvals Table

> **Priority:** 🔴 Critical

- [ ] **2.2.1** Create schema file: `src/db/schema/milestone-approvals.ts`
  ```
  - id (text, PK)
  - milestoneId (FK → milestones)
  - userId (FK → users)
  - walletAddress (text)
  - approvalWeight (integer, contribution amount)
  - approvedAt (timestamp)
  ```
- [ ] **2.2.2** Add composite unique constraint (milestoneId, walletAddress)
- [ ] **2.2.3** Export and migrate

### 2.3 Winners Table

> **Priority:** 🔴 Critical

- [ ] **2.3.1** Create schema file: `src/db/schema/winners.ts`
  ```
  - id (text, PK)
  - poolId (FK → pools)
  - pitchId (FK → pitches)
  - rank (integer)
  - voteWeight (integer)
  - allocationPercent (integer, basis points)
  - allocationAmount (integer)
  - claimedAmount (integer)
  - walletAddress (text)
  - determinedAt (timestamp)
  ```
- [ ] **2.3.2** Export and migrate

### 2.4 Distributions Table

> **Priority:** 🟠 High

- [ ] **2.4.1** Create schema file: `src/db/schema/distributions.ts`
  ```
  - id (text, PK)
  - poolId (FK → pools)
  - pitchId (FK → pitches)
  - milestoneId (FK → milestones)
  - amount (integer)
  - recipientWallet (text)
  - transactionHash (text)
  - distributedAt (timestamp)
  ```
- [ ] **2.4.2** Export and migrate

### 2.5 Refunds Table

> **Priority:** 🟠 High

- [ ] **2.5.1** Create schema file: `src/db/schema/refunds.ts`
  ```
  - id (text, PK)
  - poolId (FK → pools)
  - userId (FK → users)
  - walletAddress (text)
  - amount (integer)
  - transactionHash (text)
  - status (enum: pending, completed, failed)
  - requestedAt (timestamp)
  - processedAt (timestamp, nullable)
  ```
- [ ] **2.5.2** Export and migrate

### 2.6 Update Existing Tables

> **Priority:** 🟠 High

- [ ] **2.6.1** Update `pools` table
  - [ ] Add `pitchSubmissionDeadline` (timestamp)
  - [ ] Add `phase` enum (funding, voting, distribution, closed, failed)
  - [ ] Add `totalVoteWeight` (integer)
  - [ ] Add `totalContributors` (integer)
- [ ] **2.6.2** Update `votes` table
  - [ ] Add `voteWeight` (integer) - contribution amount
- [ ] **2.6.3** Update `contributions` table
  - [ ] Add `pitchId` (FK → pitches) - which pitch was voted for
  - [ ] Add `nftTokenId` (integer) - on-chain NFT reference

---

## 3. Database Queries 🟠

### 3.1 Milestone Queries

> **Priority:** 🔴 Critical

- [ ] **3.1.1** Create `src/db/queries/milestones.ts`
  - [ ] `getMilestonesByPool(poolId)`
  - [ ] `getMilestonesByPitch(pitchId)`
  - [ ] `createMilestone(milestone)`
  - [ ] `updateMilestoneStatus(id, status)`
  - [ ] `getMilestoneApprovals(milestoneId)`
  - [ ] `addMilestoneApproval(approval)`
  - [ ] `getMilestoneApprovalProgress(milestoneId)`

### 3.2 Winner Queries

> **Priority:** 🔴 Critical

- [ ] **3.2.1** Create `src/db/queries/winners.ts`
  - [ ] `getWinnersByPool(poolId)`
  - [ ] `createWinners(poolId, winners[])`
  - [ ] `updateWinnerClaimedAmount(id, amount)`
  - [ ] `getWinnerByPitch(poolId, pitchId)`

### 3.3 Distribution Queries

> **Priority:** 🟠 High

- [ ] **3.3.1** Create `src/db/queries/distributions.ts`
  - [ ] `getDistributionsByPool(poolId)`
  - [ ] `getDistributionsByPitch(pitchId)`
  - [ ] `createDistribution(distribution)`
  - [ ] `getTotalDistributedForPitch(pitchId)`

### 3.4 Refund Queries

> **Priority:** 🟠 High

- [ ] **3.4.1** Create `src/db/queries/refunds.ts`
  - [ ] `getRefundsByPool(poolId)`
  - [ ] `getRefundsByUser(userId)`
  - [ ] `createRefundRequest(refund)`
  - [ ] `updateRefundStatus(id, status, txHash)`
  - [ ] `hasUserRefunded(poolId, walletAddress)`

---

## 4. API Routes 🟠

### 4.1 Milestone API

> **Priority:** 🔴 Critical

- [ ] **4.1.1** Create `src/app/api/pools/[poolId]/milestones/route.ts`
  - [ ] GET: List milestones for pool
  - [ ] POST: Create milestones (admin only)
- [ ] **4.1.2** Create `src/app/api/milestones/[id]/route.ts`
  - [ ] GET: Get milestone details
  - [ ] PATCH: Update milestone status
- [ ] **4.1.3** Create `src/app/api/milestones/[id]/approve/route.ts`
  - [ ] POST: Submit approval (investor only)

### 4.2 Winner API

> **Priority:** 🔴 Critical

- [ ] **4.2.1** Create `src/app/api/pools/[poolId]/winners/route.ts`
  - [ ] GET: Get winners and allocations
  - [ ] POST: Record winners (called after endVoting)
- [ ] **4.2.2** Create `src/app/api/pools/[poolId]/end-voting/route.ts`
  - [ ] POST: Trigger end voting and record results

### 4.3 Distribution API

> **Priority:** 🟠 High

- [ ] **4.3.1** Create `src/app/api/distributions/route.ts`
  - [ ] GET: List distributions (filtered by pool/pitch)
  - [ ] POST: Record distribution (after on-chain tx)

### 4.4 Refund API

> **Priority:** 🟠 High

- [ ] **4.4.1** Create `src/app/api/pools/[poolId]/refund/route.ts`
  - [ ] POST: Request refund (investor)
  - [ ] GET: Check refund status

---

## 5. Frontend Hooks 🟠

### 5.1 Milestone Hooks

> **Priority:** 🔴 Critical

- [ ] **5.1.1** Create `src/hooks/use-milestones.ts`
  - [ ] `useMilestones(poolId)` - fetch milestones
  - [ ] `useAddMilestones()` - admin add milestones on-chain
  - [ ] `useCompleteMilestone()` - startup complete milestone
  - [ ] `useApproveMilestone()` - investor approve
  - [ ] `useDistributeMilestoneFunds()` - admin distribute

### 5.2 Winner Hooks

> **Priority:** 🔴 Critical

- [ ] **5.2.1** Create `src/hooks/use-winners.ts`
  - [ ] `useWinners(poolId)` - fetch winners
  - [ ] `useEndVoting()` - admin end voting on-chain

### 5.3 Refund Hooks

> **Priority:** 🟠 High

- [ ] **5.3.1** Create `src/hooks/use-refunds.ts`
  - [ ] `useRequestRefund()` - investor request on-chain
  - [ ] `useRefundStatus(poolId)` - check refund status

---

## 6. Admin Dashboard UI 🔴

### 6.1 End Voting & Winners UI

> **Priority:** 🔴 Critical

- [ ] **6.1.1** Create "End Voting" button on pool detail
  - [ ] Show only when voting deadline passed
  - [ ] Confirm dialog before action
  - [ ] Call `endVoting()` on-chain
  - [ ] Record winners to database
- [ ] **6.1.2** Create Winners Display Component
  - [ ] Show rank, pitch name, vote weight
  - [ ] Show allocation percentage and amount
  - [ ] Show claimed vs remaining

### 6.2 Milestone Management UI

> **Priority:** 🔴 Critical

- [ ] **6.2.1** Create `admin/pools/[id]/milestones/page.tsx`
- [ ] **6.2.2** Create "Add Milestones" modal
  - [ ] Select winning pitch
  - [ ] Add multiple milestones (description, %, deadline)
  - [ ] Validate total = 100%
  - [ ] Submit on-chain transaction
- [ ] **6.2.3** Create Milestone List Component
  - [ ] Show all milestones per winner
  - [ ] Status indicators (pending, completed, approved)
  - [ ] Approval progress bar
- [ ] **6.2.4** Create "Distribute Funds" button
  - [ ] Show only when milestone approved (51%+)
  - [ ] Confirm dialog
  - [ ] Call `distributeMilestoneFunds()` on-chain
  - [ ] Record distribution to database

### 6.3 Pool Phase Management

> **Priority:** 🟠 High

- [ ] **6.3.1** Add phase indicator to pool cards
- [ ] **6.3.2** Add phase-specific action buttons
  - [ ] Funding phase: "Activate Pool"
  - [ ] Voting phase: "End Voting"
  - [ ] Distribution phase: "Manage Milestones"

---

## 7. Investor Dashboard UI 🟠

### 7.1 Milestone Approval UI

> **Priority:** 🔴 Critical

- [ ] **7.1.1** Create `pools/[id]/milestones/page.tsx`
- [ ] **7.1.2** Create Milestone Card Component
  - [ ] Show description, deadline, funding %
  - [ ] Show evidence URI (if completed)
  - [ ] Show approval progress
  - [ ] "Approve" button (if contributed to winning pitch)
- [ ] **7.1.3** Add "View Milestones" button on pool detail
  - [ ] Only show for funded pools

### 7.2 Refund UI

> **Priority:** 🟠 High

- [ ] **7.2.1** Create Refund Request Component
  - [ ] Show only for failed pools
  - [ ] Display contribution amount
  - [ ] "Request Refund" button
  - [ ] Call `requestRefund()` on-chain
- [ ] **7.2.2** Add refund status indicator
  - [ ] Show if already refunded

### 7.3 Contribution History Enhancement

> **Priority:** 🟡 Medium

- [ ] **7.3.1** Add NFT token ID display
- [ ] **7.3.2** Add transaction hash links
- [ ] **7.3.3** Add which pitch was voted for
- [ ] **7.3.4** Show current allocation if winner

---

## 8. Startup Dashboard UI 🟠

### 8.1 Milestone Completion UI

> **Priority:** 🔴 Critical

- [ ] **8.1.1** Create `dashboard/startup/milestones/page.tsx`
- [ ] **8.1.2** Create Milestone Progress Component
  - [ ] Show milestones for won pitches
  - [ ] Status and approval progress
  - [ ] "Complete" button with evidence upload
- [ ] **8.1.3** Create Complete Milestone Modal
  - [ ] Evidence URI input (IPFS upload)
  - [ ] Call `completeMilestone()` on-chain

### 8.2 Fund Claiming UI

> **Priority:** 🟠 High

- [ ] **8.2.1** Create Fund Status Component
  - [ ] Show total allocated
  - [ ] Show claimed vs remaining
  - [ ] Show next claimable milestone
- [ ] **8.2.2** Distribution history table

---

## 9. Event Indexing & Sync 🟡

### 9.1 Event Listener Setup

> **Priority:** 🟡 Medium

- [ ] **9.1.1** Choose indexing approach
  - [ ] Option A: Polling with `useContractEvent`
  - [ ] Option B: Webhook with Alchemy/QuickNode
  - [ ] Option C: Custom backend service
- [ ] **9.1.2** Create event handler functions
  - [ ] Handle `ContributionMade`
  - [ ] Handle `VoteCast`
  - [ ] Handle `VotingEnded`
  - [ ] Handle `MilestoneCompleted`
  - [ ] Handle `MilestoneApproved`
  - [ ] Handle `FundsDistributed`
  - [ ] Handle `Refunded`

### 9.2 Database Sync Functions

> **Priority:** 🟡 Medium

- [ ] **9.2.1** Create sync utilities
  - [ ] `syncPoolStatus(poolId)`
  - [ ] `syncContribution(event)`
  - [ ] `syncVote(event)`
  - [ ] `syncWinners(poolId)`
  - [ ] `syncMilestoneApproval(event)`
  - [ ] `syncDistribution(event)`

---

## 10. Testing 🟠

### 10.1 Smart Contract Tests

> **Priority:** 🟠 High

- [ ] **10.1.1** Vote limit tests
- [ ] **10.1.2** Pitch submission deadline tests
- [ ] **10.1.3** Full lifecycle integration test

### 10.2 API Tests

> **Priority:** 🟡 Medium

- [ ] **10.2.1** Milestone API tests
- [ ] **10.2.2** Winner API tests
- [ ] **10.2.3** Refund API tests

### 10.3 E2E Tests

> **Priority:** 🟢 Low

- [ ] **10.3.1** Full investor flow test
- [ ] **10.3.2** Full startup flow test
- [ ] **10.3.3** Admin management flow test

---

## 11. Documentation 🟢

### 11.1 Technical Documentation

> **Priority:** 🟢 Low

- [ ] **11.1.1** Update contract deployment docs
- [ ] **11.1.2** Document new API endpoints
- [ ] **11.1.3** Update database schema docs

### 11.2 User Guides

> **Priority:** 🟢 Low

- [ ] **11.2.1** Admin guide for pool management
- [ ] **11.2.2** Investor guide for milestone approval
- [ ] **11.2.3** Startup guide for milestone completion

---

## Summary Statistics

| Category         | Total Tasks | Critical | High   | Medium | Low    |
| ---------------- | ----------- | -------- | ------ | ------ | ------ |
| Smart Contracts  | 22          | 5        | 8      | 6      | 3      |
| Database Schema  | 18          | 9        | 6      | 3      | 0      |
| Database Queries | 16          | 7        | 6      | 3      | 0      |
| API Routes       | 12          | 6        | 4      | 2      | 0      |
| Frontend Hooks   | 10          | 5        | 3      | 2      | 0      |
| Admin UI         | 14          | 8        | 4      | 2      | 0      |
| Investor UI      | 10          | 4        | 3      | 2      | 1      |
| Startup UI       | 8           | 4        | 2      | 2      | 0      |
| Event Indexing   | 12          | 0        | 0      | 10     | 2      |
| Testing          | 10          | 0        | 4      | 3      | 3      |
| Documentation    | 6           | 0        | 0      | 0      | 6      |
| **TOTAL**        | **138**     | **48**   | **40** | **35** | **15** |

---

## Suggested Sprint Plan

### Sprint 1 (Week 1-2): Critical Smart Contract & Database

- [ ] 1.1 Vote Limit Enforcement
- [ ] 2.1 Milestones Table
- [ ] 2.2 Milestone Approvals Table
- [ ] 2.3 Winners Table
- [ ] 3.1 Milestone Queries
- [ ] 3.2 Winner Queries

### Sprint 2 (Week 3-4): API & Hooks

- [ ] 4.1 Milestone API
- [ ] 4.2 Winner API
- [ ] 5.1 Milestone Hooks
- [ ] 5.2 Winner Hooks
- [ ] 1.2 Pitch Submission Window

### Sprint 3 (Week 5-6): Admin UI

- [ ] 6.1 End Voting & Winners UI
- [ ] 6.2 Milestone Management UI
- [ ] 6.3 Pool Phase Management

### Sprint 4 (Week 7-8): Investor & Startup UI

- [ ] 7.1 Milestone Approval UI
- [ ] 7.2 Refund UI
- [ ] 8.1 Milestone Completion UI
- [ ] 8.2 Fund Claiming UI

### Sprint 5 (Week 9-10): Polish & Testing

- [ ] 2.4-2.6 Remaining DB tables
- [ ] 9.x Event Indexing
- [ ] 10.x Testing
- [ ] 11.x Documentation

---

_Last Updated: December 4, 2025_
