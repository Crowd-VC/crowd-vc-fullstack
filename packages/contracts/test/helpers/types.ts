import { Address } from "viem";
import { PitchStatus, PoolStatus, UserType } from "./constants";

/**
 * Contract Struct Types
 * These match the struct definitions in the Solidity contracts
 */

/**
 * UserProfile struct from ICrowdVCFactory
 */
export interface UserProfile {
  userType: UserType;
  metadataURI: string;
  registeredAt: bigint;
  isActive: boolean;
}

/**
 * PitchData struct from ICrowdVCFactory
 */
export interface PitchData {
  pitchId: `0x${string}`;
  startup: Address;
  title: string;
  ipfsHash: string;
  fundingGoal: bigint;
  status: PitchStatus;
  submittedAt: bigint;
  approvedAt: bigint;
}

/**
 * PoolInfo struct from ICrowdVCPool
 */
export interface PoolInfo {
  name: string;
  category: string;
  fundingGoal: bigint;
  votingDeadline: bigint;
  totalContributions: bigint;
  status: PoolStatus;
  acceptedToken: Address;
  minContribution: bigint;
  maxContribution: bigint;
}

/**
 * Contribution struct from ICrowdVCPool (updated - removed pitchId)
 */
export interface Contribution {
  investor: Address;
  amount: bigint;        // Gross amount (original contribution)
  platformFee: bigint;   // Fee deducted and sent to Treasury
  netAmount: bigint;     // Amount after platform fee
  token: Address;
  timestamp: bigint;
  nftTokenId: bigint;
  withdrawn: boolean;
}

/**
 * VoteResult struct from ICrowdVCPool
 */
export interface VoteResult {
  pitchId: `0x${string}`;
  wallet: Address;
  voteWeight: bigint;
  allocationPercent: bigint;
  allocation: bigint;
  claimed: bigint;
}

/**
 * Milestone struct from ICrowdVCPool
 */
export interface Milestone {
  description: string;
  fundingPercent: bigint;
  completed: boolean;
  disputed: boolean;
  deadline: bigint;
  evidenceURI: string;
  approvalCount: bigint;
  approvalsNeeded: bigint;
}

/**
 * Fixture Return Types
 * Types for the return values of fixture functions
 */

/**
 * Return type for deployMockTokensFixture
 */
export interface DeployMockTokensFixtureResult {
  usdt: any;
  usdc: any;
  usdtAddress: Address;
  usdcAddress: Address;
}

/**
 * Return type for deployFactoryFixture
 */
export interface DeployFactoryFixtureResult
  extends DeployMockTokensFixtureResult {
  factory: any;
  admin: any;
  treasury: any;
  others: any[];
  publicClient: any;
}

/**
 * Return type for registerUsersFixture
 */
export interface RegisterUsersFixtureResult extends DeployFactoryFixtureResult {
  startups: any[];
  investors: any[];
}

/**
 * Return type for submitPitchesFixture
 */
export interface SubmitPitchesFixtureResult extends RegisterUsersFixtureResult {
  pitchIds: `0x${string}`[];
}

/**
 * Return type for deployPoolFixture
 */
export interface DeployPoolFixtureResult extends SubmitPitchesFixtureResult {
  pool: any;
  poolAddress: Address;
  poolConfig: {
    poolName: string;
    category: string;
    fundingGoal: bigint;
    votingDuration: bigint;
    fundingDuration: bigint;
    minContribution: bigint;
  };
}

/**
 * Return type for createActivePoolFixture
 */
export interface CreateActivePoolFixtureResult extends DeployPoolFixtureResult {
  contributions: ContributionData[];
  votes: VoteData[];
}

/**
 * Test Helper Types
 */

/**
 * Test accounts object with named accounts
 */
export interface TestAccounts {
  admin: any;
  treasury: any;
  startup1: any;
  startup2: any;
  startup3: any;
  investor1: any;
  investor2: any;
  investor3: any;
  others: any[];
}

/**
 * Contribution data for tracking test contributions
 */
export interface ContributionData {
  investor: Address;
  amount: bigint;
  tokenId: bigint;
}

/**
 * Vote data for tracking test votes
 */
export interface VoteData {
  voter: Address;
  pitchId: `0x${string}`;
}

/**
 * Milestone data for creating test milestones
 */
export interface MilestoneData {
  description: string;
  fundingPercent: number;
}

/**
 * Pool creation parameters
 */
export interface PoolCreationParams {
  poolName: string;
  category: string;
  fundingGoal: bigint;
  votingDuration: bigint;
  fundingDuration: bigint;
  candidatePitches: `0x${string}`[];
  acceptedToken: Address;
  minContribution: bigint;
}

/**
 * Pitch submission parameters
 */
export interface PitchSubmissionParams {
  title: string;
  ipfsHash: string;
  fundingGoal: bigint;
}

/**
 * User registration parameters
 */
export interface UserRegistrationParams {
  userType: UserType;
  metadataURI: string;
}

/**
 * Transaction receipt type
 */
export interface TransactionReceipt {
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  blockHash: `0x${string}`;
  logs: any[];
  status: "success" | "reverted";
  gasUsed: bigint;
}

/**
 * Event log type
 */
export interface EventLog {
  address: Address;
  topics: `0x${string}`[];
  data: `0x${string}`;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
  logIndex: number;
}

/**
 * Type guards for enum validation
 */

export function isUserType(value: number): value is UserType {
  return Object.values(UserType).includes(value);
}

export function isPitchStatus(value: number): value is PitchStatus {
  return Object.values(PitchStatus).includes(value);
}

export function isPoolStatus(value: number): value is PoolStatus {
  return Object.values(PoolStatus).includes(value);
}

/**
 * Utility types
 */

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract contract read methods type
 */
export type ContractRead<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

/**
 * Extract contract write methods type
 */
export type ContractWrite<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};
