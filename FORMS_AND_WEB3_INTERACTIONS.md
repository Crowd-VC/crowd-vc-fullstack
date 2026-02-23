# Forms & Web3 Interactions Guide

This document catalogs all the required forms, their corresponding fields (for Zod schema creation), and the necessary Web3 interactions (for Wagmi hook creation) across the CrowdVC platform.

---

## 1. Form Definitions & Zod Schemas

These form definitions correspond to the API payloads required by the backend. All forms should be validated using Zod schemas on the frontend before submission.

### 1.1 Pitch Submission Form
**Purpose:** Allows a startup to submit a pitch for funding.
**Target API:** `POST /api/pitches`

**Programmatic Fields (Not in UI):**
*   `walletAddress` (string, required): The Ethereum address of the submitter. Retrieved programmatically via Wagmi's `useAccount` hook.

**UI Fields:**
*   `title` (string, required): The name of the startup/project.
*   `summary` (string, required): A brief 1-2 sentence description.
*   `elevatorPitch` (string, required): A detailed explanation of the problem, solution, and vision.
*   `industry` (string, required): Categorization (e.g., "DeFi", "AI", "Green Energy").
*   `companyStage` (string, required): Current stage (e.g., "Idea", "Seed", "Series A").
*   `teamSize` (string, required): Number of team members.
*   `location` (string, required): Base of operations or "Remote".
*   `website` (string, optional): Valid URL to the company website.
*   `oneKeyMetric` (string, required): The single most important KPI for the startup.
*   `fundingGoal` (string, required): Target amount. Can be a specific token amount (string) or the literal string `"custom"`.
*   `customAmount` (string, optional): Required only if `fundingGoal` is `"custom"`.
*   `productDevelopment` (number, optional): Percentage of funds allocated here (0-100).
*   `marketingSales` (number, optional): Percentage of funds allocated here (0-100).
*   `teamExpansion` (number, optional): Percentage of funds allocated here (0-100).
*   `operations` (number, optional): Percentage of funds allocated here (0-100).
    *   *Validation Note: The sum of the 4 percentage allocations above should equal 100 if provided.*
*   `timeToRaise` (string, optional): Estimated timeline to secure funding.
*   `expectedROI` (string, optional): Projected return for investors.
*   `pitchDeckUrl` (string, optional): Valid URL (often an IPFS link) to the pitch deck.
*   `pitchVideoUrl` (string, optional): Valid URL to a pitch video.
*   `imageUrl` (string, optional): Valid URL to a logo or cover image.
*   `demoUrl` (string, optional): Valid URL to a working demo.
*   `prototypeUrl` (string, optional): Valid URL to a prototype (Figma, etc.).

### 1.2 User Profile Form
**Purpose:** Allows users to set up or update their profile details based on their connected wallet.
**Target API:** `PUT /api/users/{address}` (Where `{address}` is retrieved programmatically via Wagmi's `useAccount`)

**UI Fields:**
*   `email` (string, required for new users): Must be a valid email format.
*   `name` (string, optional): Display name of the user.
*   `userType` (enum, optional): Must be one of `"startup"`, `"investor"`, or `"admin"`. Defaults to `"startup"`.

### 1.3 Admin: Pool Creation Form
**Purpose:** Allows administrators to configure and launch a new investment pool.
**Target API:** `POST /api/admin/pools`

**UI Fields:**
*   `name` (string, required): The name of the pool (e.g., "Q3 Web3 Gaming").
*   `description` (string, required): Detailed explanation of the pool's thesis.
*   `category` (string, required): The industry or theme (e.g., "Gaming", "DeFi").
*   `votingDeadline` (string, required): ISO 8601 date string for when voting closes.
*   `status` (enum, optional): Must be one of `"active"`, `"upcoming"`, or `"closed"`. Defaults to `"upcoming"`.
*   `fundingGoal` (string, optional): Target token amount (e.g., in Wei). Defaults to `"0"`.
*   `minContribution` (string, optional): Minimum token amount (e.g., in Wei). Defaults to `"1000"`.
*   `maxContribution` (string, optional): Maximum token amount (e.g., in Wei).
*   `contractAddress` (string, required): The deployed smart contract address for this pool. Must be a valid `0x` address.
*   `fundingDuration` (number, optional): Length of the funding period in seconds/days.
*   `acceptedToken` (string, optional): The contract address of the accepted ERC20 token (e.g., USDC address).

---

## 2. Web3 Interactions (Smart Contract Hooks)

These interactions define the core blockchain functionality of the platform. They will be implemented as custom React hooks wrapping Wagmi's `useWriteContract`, `useReadContract`, and `useSendTransaction`.

### 2.1 Fund a Pool (Contribution)
**Concept:** Investors deposit accepted tokens (e.g., USDC) into the Pool Smart Contract to back the theme and gain "Voting Power".

**Required Wagmi Hooks:**
1.  **Token Approval (`useWriteContract`):**
    *   **Action:** If the pool uses an ERC20 token (like USDC), the user must first approve the Pool Contract to spend their tokens.
    *   **ABI:** ERC20 `approve(address spender, uint256 amount)`
    *   **Parameters:** `spender` = Pool `contractAddress`, `amount` = contribution amount in Wei.
2.  **Deposit/Contribute (`useWriteContract`):**
    *   **Action:** Execute the deposit function on the Pool Contract.
    *   **ABI:** `deposit(uint256 amount)` or similar on the Pool Contract.
    *   **Parameters:** `amount` = contribution amount in Wei.
3.  **Read Allowance (`useReadContract`):**
    *   **Action:** Check if the user has already approved enough tokens to skip the approval step.
    *   **ABI:** ERC20 `allowance(address owner, address spender)`

**Post-Transaction Action:** Upon successful transaction receipt, trigger the backend API `POST /api/contributions` to sync the database with the blockchain.

### 2.2 Vote for a Startup
**Concept:** After the submission window closes, investors use their accrued Voting Power to vote for startups (up to 3).

**Required Wagmi Hooks:**
1.  **Cast Vote (`useWriteContract`):**
    *   **Action:** Execute the voting function on the Pool Contract.
    *   **ABI:** `vote(uint256 pitchId)` or `voteBatch(uint256[] pitchIds)` depending on the contract implementation.
    *   **Parameters:** The ID(s) representing the startup on the blockchain.
2.  **Read Voting Power (`useReadContract`):**
    *   **Action:** Display the user's available voting power.
    *   **ABI:** `getVotingPower(address user)` or similar on the Pool Contract.

**Post-Transaction Action:** Upon successful transaction receipt, trigger the backend API `POST /api/pools/{id}/vote` to sync the database.

### 2.3 Milestone Approval (Post-Funding)
**Concept:** Once a startup wins, funds are locked in an escrow/milestone contract. Investors who backed the winning startup must vote to approve the release of funds upon milestone completion.

**Required Wagmi Hooks:**
1.  **Approve Milestone (`useWriteContract`):**
    *   **Action:** Investor signs a transaction approving the current milestone.
    *   **ABI:** `approveMilestone(uint256 milestoneId)` on the Escrow/Milestone Contract.
2.  **Read Milestone Status (`useReadContract`):**
    *   **Action:** Check the current approval threshold (e.g., needs 51% of backing capital).
    *   **ABI:** `getMilestoneApprovalStatus(uint256 milestoneId)` on the Escrow/Milestone Contract.

### 2.4 Read Global State
**Concept:** General reads to populate UI components with real-time blockchain data.

**Required Wagmi Hooks:**
1.  **Pool Total Funds (`useReadContract`):**
    *   **Action:** Get the live TVL (Total Value Locked) in a specific pool.
    *   **ABI:** `getTotalDeposits()` or reading the token balance of the Pool Contract.
2.  **Pool State/Phase (`useReadContract`):**
    *   **Action:** Check if the pool is in the Funding, Voting, or Distribution phase based on block timestamps.
    *   **ABI:** `getCurrentPhase()` on the Pool Contract.