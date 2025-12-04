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

### 1.1 Vote Limit Enforcement

> **Priority:** 🔴 Critical  
> **Rationale:** App context specifies max 3 startups per investor

- [ ] **1.1.1** Add `MAX_VOTES_PER_INVESTOR` constant to `CrowdVCPool.sol`
  - [ ] Define constant (default: 3)
  - [ ] Make configurable per pool if needed
- [ ] **1.1.2** Add vote count tracking per investor
  - [ ] Create mapping: `mapping(address => uint256) public voteCount`
  - [ ] Increment on new vote
  - [ ] Decrement on vote change (if applicable)
- [ ] **1.1.3** Add vote limit check in `vote()` function
  - [ ] Add custom error: `error MaxVotesExceeded(uint256 current, uint256 max)`
  - [ ] Add check before recording vote
- [ ] **1.1.4** Update `contribute()` to respect vote limit
  - [ ] Auto-vote only if under limit
  - [ ] Or revert if at limit and different pitch
- [ ] **1.1.5** Write unit tests for vote limit
  - [ ] Test voting up to limit
  - [ ] Test rejection when exceeding limit
  - [ ] Test vote count after withdrawal

### 1.2 Pitch Submission Window

> **Priority:** 🟠 High  
> **Rationale:** Spec requires separate deadline from voting

- [ ] **1.2.1** Add `pitchSubmissionDeadline` to `PoolConfig` struct
  - [ ] Update `ICrowdVCPool.sol` interface
  - [ ] Update `CrowdVCPool.sol` implementation
- [ ] **1.2.2** Add validation in `addStartup()` function
  - [ ] Check `block.timestamp < pitchSubmissionDeadline`
  - [ ] Add custom error: `error PitchSubmissionClosed()`
- [ ] **1.2.3** Update `createPool()` in Factory
  - [ ] Accept `pitchSubmissionDeadline` parameter
  - [ ] Validate: submissionDeadline < votingDeadline
- [ ] **1.2.4** Write unit tests
  - [ ] Test adding startup before deadline
  - [ ] Test rejection after deadline

### 1.3 Review/Remove registerUser

> **Priority:** 🟡 Medium  
> **Rationale:** Function exists but roles are never checked

- [ ] **1.3.1** Decision: Keep or Remove?
  - [ ] Document decision rationale
- [ ] **1.3.2** Option A: Remove `registerUser()`
  - [ ] Remove function from `CrowdVCFactory.sol`
  - [ ] Remove from `ICrowdVCFactory.sol` interface
  - [ ] Remove `updateUserType()` function
  - [ ] Remove `UserProfile` struct if unused
  - [ ] Remove related events
  - [ ] Update deployment scripts
  - [ ] Update frontend hooks
- [ ] **1.3.3** Option B: Add Role Enforcement
  - [ ] Add role check to `submitPitch()`: `onlyRole(STARTUP_ROLE)`
  - [ ] Consider if `contribute()` should require `INVESTOR_ROLE`
  - [ ] Update frontend to require registration flow

### 1.4 Review activatePool Function

> **Priority:** 🟢 Low  
> **Rationale:** Currently a no-op, may need functionality

- [ ] **1.4.1** Analyze current implementation
  - [ ] Check if any state changes occur
  - [ ] Determine if pool status change is needed
- [ ] **1.4.2** Either implement proper activation logic or document as manual trigger

### 1.5 Contract Testing & Verification

> **Priority:** 🟠 High

- [ ] **1.5.1** Update test suite for new features
- [ ] **1.5.2** Run full test coverage
- [ ] **1.5.3** Verify contract on block explorer after deployment

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
