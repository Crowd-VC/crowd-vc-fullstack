# CrowdVC Platform - Context & Architecture

## 1. High-Level Overview

CrowdVC is a decentralized crowdfunding platform where investors fund **industry-specific pools** (e.g., "AI Startups", "Green Energy") rather than backing individual companies directly during the funding phase.

**Core Philosophy:**

- **Blind/Thematic Investing:** Investors contribute to a pool based on the industry or thesis, trusting the collective wisdom of the pool to select the best startups later.
- **Phased Execution:** The platform operates in distinct sequential phases (Submission -> Voting -> Distribution).

---

## 2. Platform Lifecycle & Phases

### Phase 1: Funding & Submission (Concurrent)

- **Pool Creation:** A pool is created with a specific theme (e.g., "DeFi Protocol Q3").
- **Funding Window:** Opens immediately. Investors contribute tokens (e.g., USDC) to the **Pool Smart Contract**.
  - _Note:_ Investors do **not** select a startup at this stage. They are funding the "pot."
  - Contributing increases their future **Voting Power** (1 Token = 1 Vote Unit).
- **Pitch Submission Window:** Startups submit their pitches to the pool during this specific time window.
  - Admins vet and approve pitches.
  - _Constraint:_ Pitches cannot be added after this window closes to ensure fairness (no late entries getting less exposure).

### Phase 2: Voting

- **Trigger:** Begins immediately after the **Pitch Submission Window** closes.
- **Action:** Investors use their accrued Voting Power to vote for the startups in the pool.
- **Rules:**
  - Investors can vote for **up to 3 startups** (configurable limit).
  - Investors can continue to contribute funds during this phase to increase their voting power on the fly.
  - Investors **cannot** withdraw funds during this phase without penalty (to prevent vote manipulation).

### Phase 3: Distribution & Execution

- **Trigger:** Voting Deadline reached.
- **Winner Selection:** The top voted startups (e.g., top 3) are declared winners.
- **Allocation:** The pool's total funds are divided among the winners based on their relative vote share.
- **Milestone Lock:** Funds are not sent immediately. They are locked in a milestone contract.

---

## 3. Core Entities & Data

### A. The Pool (Investment Container)

- **Configuration:** Industry/Genre, Funding Goal, Min/Max Contribution.
- **Timestamps:**
  - `fundingStartTime`: When the pool opens.
  - `pitchSubmissionDeadline` / `votingStartTime`: The cutoff for new pitches and start of voting.
  - `votingDeadline` / `fundingEndTime`: When the pool closes.

### B. The Pitch

- **Data:** Business Model, Team Info, Pitch Deck (IPFS), Financial Goals.
- **Status:** `Pending`, `Approved`, `Rejected`.

---

## 4. Key Mechanisms

### Voting Logic (Decoupled)

Unlike traditional crowdfunding, the contribution and the "backing" are separate events.

1.  **Deposit:** User sends 1000 USDC to the "FinTech Pool".
2.  **Power:** User receives 1000 Voting Power.
3.  **Vote:** User allocates votes to Startup A, Startup B, and Startup C.
    - _Collective Wisdom:_ The startups that win are decided by the aggregate votes of all pool participants.

### Safety: The Milestone System

To prevent "rug pulls" after winning:

1.  **Definition:** Winners must define clear milestones (e.g., "Alpha Release", "Audit Complete").
2.  **Escrow:** Funds are held in the pool contract.
3.  **Release Condition:**
    - Startup claims a milestone is complete.
    - **Investors Vote to Approve:** Only investors who voted for this specific winner can vote on milestone completion.
    - **Threshold:** 51% of the backing capital must approve the proof of work.
4.  **Protection:** If a startup fails to deliver, remaining funds are stuck (or returned via admin governance), preventing total loss.
