/**
 * CrowdVCPool Contract ABI and Types
 * Auto-generated from compiled Hardhat artifacts
 */

import poolArtifact from "../../contracts/artifacts/contracts/core/CrowdVCPool.sol/CrowdVCPool.json";

export const CrowdVCPoolABI = poolArtifact.abi;

// Enums matching Solidity contract
export enum PoolStatus {
  Active = 0,
  VotingEnded = 1,
  Funded = 2,
  Closed = 3,
  Failed = 4,
}

// TypeScript types for contract structs
export type PoolInfo = {
  name: string;
  category: string;
  fundingGoal: bigint;
  votingDeadline: bigint;
  totalContributions: bigint;
  status: PoolStatus;
  acceptedToken: `0x${string}`;
  minContribution: bigint;
  maxContribution: bigint;
};

// Contribution struct (updated - removed pitchId)
export type Contribution = {
  investor: `0x${string}`;
  amount: bigint;        // Gross amount (original contribution)
  platformFee: bigint;   // Fee deducted and sent to Treasury
  netAmount: bigint;     // Amount after platform fee
  token: `0x${string}`;
  timestamp: bigint;
  nftTokenId: bigint;
  withdrawn: boolean;
};

export type VoteResult = {
  pitchId: `0x${string}`;
  wallet: `0x${string}`;
  voteWeight: bigint;
  allocationPercent: bigint;
  allocation: bigint;
  claimed: bigint;
};

export type Milestone = {
  description: string;
  fundingPercent: bigint;
  completed: boolean;
  disputed: boolean;
  deadline: bigint;
  evidenceURI: string;
  approvalCount: bigint;
  approvalsNeeded: bigint;
};

// Function parameter types
export type ContributeParams = {
  amount: bigint;
  token: `0x${string}`;
};

export type VoteParams = {
  pitchId: `0x${string}`;
};

export type ChangeVoteParams = {
  oldPitchId: `0x${string}`;
  newPitchId: `0x${string}`;
};

export type AddMilestonesParams = {
  pitchId: `0x${string}`;
  milestones: readonly Milestone[];
};

export type CompleteMilestoneParams = {
  pitchId: `0x${string}`;
  milestoneIndex: number;
  evidenceURI: string;
};

export type DistributeMilestoneFundsParams = {
  pitchId: `0x${string}`;
  milestoneIndex: number;
};

// Event types
export type ContributionMadeEvent = {
  investor: `0x${string}`;
  amount: bigint;
  platformFee: bigint;
  token: `0x${string}`;
  tokenId: bigint;
  timestamp: bigint;
};

export type PlatformFeeTransferredEvent = {
  token: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
};

export type PenaltyTransferredEvent = {
  investor: `0x${string}`;
  token: `0x${string}`;
  penalty: bigint;
  timestamp: bigint;
};

export type VoteCastEvent = {
  voter: `0x${string}`;
  pitchId: `0x${string}`;
  weight: bigint;
  timestamp: bigint;
};

export type VoteChangedEvent = {
  voter: `0x${string}`;
  oldPitchId: `0x${string}`;
  newPitchId: `0x${string}`;
};

export type VotesClearedEvent = {
  voter: `0x${string}`;
  numVotesCleared: bigint;
  timestamp: bigint;
};

export type EarlyWithdrawalEvent = {
  investor: `0x${string}`;
  netAmount: bigint;
  penalty: bigint;
  refund: bigint;
};

export type VotingEndedEvent = {
  timestamp: bigint;
  winners: readonly `0x${string}`[];
  allocations: readonly bigint[];
};

export type MilestoneCompletedEvent = {
  pitchId: `0x${string}`;
  milestoneIndex: bigint;
  amountReleased: bigint;
};

export type MilestoneApprovedEvent = {
  pitchId: `0x${string}`;
  milestoneIndex: bigint;
  approver: `0x${string}`;
};

export type FundsDistributedEvent = {
  pitchId: `0x${string}`;
  startup: `0x${string}`;
  amount: bigint;
};

export type FundsClaimedEvent = {
  pitchId: `0x${string}`;
  wallet: `0x${string}`;
  amount: bigint;
};

export type RefundedEvent = {
  investor: `0x${string}`;
  amount: bigint;
};

export type PoolClosedEvent = {
  timestamp: bigint;
};

export type StartupAddedEvent = {
  pitchId: `0x${string}`;
  wallet: `0x${string}`;
};

export type StartupRemovedEvent = {
  pitchId: `0x${string}`;
};

export type PoolActivatedEvent = {
  timestamp: bigint;
};
