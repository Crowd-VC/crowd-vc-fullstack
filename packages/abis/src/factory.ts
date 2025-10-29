/**
 * CrowdVCFactory Contract ABI and Types
 * Auto-generated from compiled Hardhat artifacts
 */

import factoryArtifact from '../../../apps/contracts/artifacts/contracts/core/CrowdVCFactory.sol/CrowdVCFactory.json'

export const CrowdVCFactoryABI = factoryArtifact.abi

// Enums matching Solidity contract
export enum UserType {
  None = 0,
  Startup = 1,
  Investor = 2,
  Admin = 3
}

export enum PitchStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  InPool = 4,
  Funded = 5
}

// TypeScript types for contract structs
export type UserProfile = {
  userType: UserType
  metadataURI: string
  registeredAt: bigint
  isActive: boolean
}

export type PitchData = {
  pitchId: `0x${string}`
  startup: `0x${string}`
  title: string
  ipfsHash: string
  fundingGoal: bigint
  status: PitchStatus
  submittedAt: bigint
  approvedAt: bigint
}

// Function parameter types
export type RegisterUserParams = {
  userType: UserType.Startup | UserType.Investor
  metadataURI: string
}

export type SubmitPitchParams = {
  title: string
  ipfsHash: string
  fundingGoal: bigint
}

export type CreatePoolParams = {
  name: string
  category: string
  fundingGoal: bigint
  votingDuration: bigint
  fundingDuration: bigint
  candidatePitches: readonly `0x${string}`[]
  acceptedToken: `0x${string}`
  minContribution: bigint
}

export type UpdatePitchStatusParams = {
  pitchId: `0x${string}`
  status: PitchStatus
}

// Event types
export type UserRegisteredEvent = {
  user: `0x${string}`
  userType: UserType
  timestamp: bigint
}

export type PitchSubmittedEvent = {
  pitchId: `0x${string}`
  startup: `0x${string}`
  title: string
  fundingGoal: bigint
  timestamp: bigint
}

export type PitchStatusUpdatedEvent = {
  pitchId: `0x${string}`
  oldStatus: PitchStatus
  newStatus: PitchStatus
  updatedBy: `0x${string}`
}

export type PoolCreatedEvent = {
  poolAddress: `0x${string}`
  name: string
  category: string
  fundingGoal: bigint
  acceptedToken: `0x${string}`
}
