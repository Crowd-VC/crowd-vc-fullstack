/**
 * CrowdVCPool Contract ABI and Types
 * Auto-generated from compiled Hardhat artifacts
 */

import poolArtifact from '../../contracts/artifacts/contracts/core/CrowdVCPool.sol/CrowdVCPool.json'

export const CrowdVCPoolABI = poolArtifact.abi

// Enums matching Solidity contract
export enum PoolStatus {
  Active = 0,
  VotingEnded = 1,
  Funded = 2,
  Closed = 3,
  Failed = 4
}

// TypeScript types for contract structs
export type PoolInfo = {
  name: string
  category: string
  fundingGoal: bigint
  votingDeadline: bigint
  fundingDeadline: bigint
  totalContributions: bigint
  status: PoolStatus
  acceptedToken: `0x${string}`
  minContribution: bigint
}

export type VoteResult = {
  pitchId: `0x${string}`
  voteWeight: bigint
  allocationPercent: bigint
}

export type Milestone = {
  description: string
  fundingPercent: bigint
  completed: boolean
  disputed: boolean
  deadline: bigint
  evidenceURI: string
}

// Function parameter types
export type ContributeParams = {
  amount: bigint
}

export type VoteParams = {
  pitchId: `0x${string}`
}

export type AddMilestonesParams = {
  pitchId: `0x${string}`
  milestones: readonly Milestone[]
}

export type CompleteMilestoneParams = {
  pitchId: `0x${string}`
  milestoneIndex: number
  evidenceURI: string
}

export type DistributeMilestoneFundsParams = {
  pitchId: `0x${string}`
  milestoneIndex: number
}

// Event types
export type ContributionMadeEvent = {
  investor: `0x${string}`
  amount: bigint
  tokenId: bigint
  timestamp: bigint
}

export type VoteCastEvent = {
  investor: `0x${string}`
  pitchId: `0x${string}`
  voteWeight: bigint
  timestamp: bigint
}

export type EarlyWithdrawalEvent = {
  investor: `0x${string}`
  amount: bigint
  penalty: bigint
  timestamp: bigint
}

export type VotingEndedEvent = {
  winners: readonly `0x${string}`[]
  timestamp: bigint
}

export type MilestoneCompletedEvent = {
  pitchId: `0x${string}`
  milestoneIndex: number
  startup: `0x${string}`
  timestamp: bigint
}

export type FundsDistributedEvent = {
  pitchId: `0x${string}`
  milestoneIndex: number
  amount: bigint
  recipient: `0x${string}`
}

export type RefundedEvent = {
  investor: `0x${string}`
  amount: bigint
  timestamp: bigint
}

export type PoolClosedEvent = {
  finalStatus: PoolStatus
  timestamp: bigint
}
