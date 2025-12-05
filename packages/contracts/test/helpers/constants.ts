/**
 * Test Constants for CrowdVC Platform Tests
 *
 * This file contains all constants, configurations, and magic numbers
 * used across the CrowdVC test suite.
 *
 * Compatible with Hardhat 3.0 + node:test + viem
 */

import { parseUnits, keccak256, toBytes } from 'viem';

// ============ TOKEN DECIMALS ============
// USDT and USDC use 6 decimals (not 18 like most ERC20 tokens)
export const TOKEN_DECIMALS = 6;

// ============ FUNDING CONSTANTS ============
// These match the contract constants in CrowdVCFactory.sol

/** Minimum funding goal for a pitch (1,000 USDC/USDT) */
export const MIN_FUNDING_GOAL = parseUnits('1000', TOKEN_DECIMALS);

/** Maximum funding goal for a pitch (10,000,000 USDC/USDT) */
export const MAX_FUNDING_GOAL = parseUnits('10000000', TOKEN_DECIMALS);

/** Minimum pool goal (10,000 USDC/USDT) */
export const MIN_POOL_GOAL = parseUnits('10000', TOKEN_DECIMALS);

/** Maximum pool goal (50,000,000 USDC/USDT) */
export const MAX_POOL_GOAL = parseUnits('50000000', TOKEN_DECIMALS);

// ============ DURATION CONSTANTS ============
// Time values in seconds

/** One day in seconds */
export const ONE_DAY = 86400n;

/** Minimum voting duration (1 day) */
export const MIN_VOTING_DURATION = ONE_DAY;

/** Maximum voting duration (30 days) */
export const MAX_VOTING_DURATION = 30n * ONE_DAY;

/** One week in seconds */
export const ONE_WEEK = 7n * ONE_DAY;

/** One hour in seconds */
export const ONE_HOUR = 3600n;

// ============ FEE CONSTANTS ============
// All fees are in basis points (10000 = 100%)

/** Basis points denominator */
export const BASIS_POINTS = 10000n;

/** Maximum platform fee (10% = 1000 basis points) */
export const MAX_PLATFORM_FEE = 1000n;

/** Default platform fee for tests (5% = 500 basis points) */
export const DEFAULT_PLATFORM_FEE = 500n;

/** Early withdrawal penalty (10% = 1000 basis points) */
export const EARLY_WITHDRAWAL_PENALTY = 1000n;

// ============ ROLE CONSTANTS ============
// These match the keccak256 hashes in the contract

/** DEFAULT_ADMIN_ROLE - OpenZeppelin AccessControl default admin */
export const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

/** ADMIN_ROLE hash */
export const ADMIN_ROLE = keccak256(toBytes('ADMIN_ROLE'));

/** STARTUP_ROLE hash */
export const STARTUP_ROLE = keccak256(toBytes('STARTUP_ROLE'));

/** INVESTOR_ROLE hash */
export const INVESTOR_ROLE = keccak256(toBytes('INVESTOR_ROLE'));

// ============ USER TYPE ENUM ============
// Matches ICrowdVCFactory.UserType enum

export enum UserType {
  None = 0,
  Startup = 1,
  Investor = 2,
  Admin = 3,
}

// ============ PITCH STATUS ENUM ============
// Matches ICrowdVCFactory.PitchStatus enum

export enum PitchStatus {
  Pending = 0,
  UnderReview = 1,
  Shortlisted = 2,
  NeedsMoreInfo = 3,
  ConditionalApproval = 4,
  Approved = 5,
  Rejected = 6,
  InPool = 7,
  Funded = 8,
}

// ============ POOL STATUS ENUM ============
// Matches ICrowdVCPool.PoolStatus enum

export enum PoolStatus {
  Active = 0,
  VotingEnded = 1,
  Funded = 2,
  Closed = 3,
  Failed = 4,
}

// ============ TEST DATA ============
// Default values for testing

/** Default metadata URI for user registration */
export const DEFAULT_METADATA_URI = 'ipfs://QmTest123456789';

/** Default pitch title */
export const DEFAULT_PITCH_TITLE = 'Test Startup Pitch';

/** Default IPFS hash for pitch deck */
export const DEFAULT_PITCH_IPFS = 'ipfs://QmPitchDeck123456789';

/** Default funding goal for pitches (100,000 USDC) */
export const DEFAULT_PITCH_FUNDING_GOAL = parseUnits('100000', TOKEN_DECIMALS);

/** Default pool name */
export const DEFAULT_POOL_NAME = 'Test Investment Pool';

/** Default pool category */
export const DEFAULT_POOL_CATEGORY = 'DeFi';

/** Default pool ID */
export const DEFAULT_POOL_ID = 'test-pool-001';

/** Default pool funding goal (100,000 USDC) */
export const DEFAULT_POOL_FUNDING_GOAL = parseUnits('100000', TOKEN_DECIMALS);

/** Default voting duration (7 days) */
export const DEFAULT_VOTING_DURATION = ONE_WEEK;

/** Default funding duration (14 days) */
export const DEFAULT_FUNDING_DURATION = 14n * ONE_DAY;

/** Default minimum contribution (100 USDC) */
export const DEFAULT_MIN_CONTRIBUTION = parseUnits('100', TOKEN_DECIMALS);

/** Default maximum contribution (0 = no limit) */
export const DEFAULT_MAX_CONTRIBUTION = 0n;

// ============ TEST AMOUNTS ============

/** Small contribution amount for testing (100 USDC) */
export const SMALL_CONTRIBUTION = parseUnits('100', TOKEN_DECIMALS);

/** Medium contribution amount for testing (1,000 USDC) */
export const MEDIUM_CONTRIBUTION = parseUnits('1000', TOKEN_DECIMALS);

/** Large contribution amount for testing (10,000 USDC) */
export const LARGE_CONTRIBUTION = parseUnits('10000', TOKEN_DECIMALS);

/** Very large contribution for testing (50,000 USDC) */
export const VERY_LARGE_CONTRIBUTION = parseUnits('50000', TOKEN_DECIMALS);

/** Faucet amount from mock tokens (10,000 USDC/USDT) */
export const FAUCET_AMOUNT = parseUnits('10000', TOKEN_DECIMALS);

/** Mint amount for testing (1,000,000 USDC/USDT) */
export const MINT_AMOUNT = parseUnits('1000000', TOKEN_DECIMALS);

// ============ VOTING CONSTANTS ============

/** Maximum winners per pool */
export const MAX_WINNERS = 3;

/** Maximum votes per investor */
export const MAX_VOTES_PER_INVESTOR = 3;

// ============ ERROR MESSAGES ============
// Custom error selectors for testing reverts

export const ERRORS = {
  // CrowdVCFactory errors
  InvalidUserType: 'InvalidUserType',
  AlreadyRegistered: 'AlreadyRegistered',
  UserNotRegistered: 'UserNotRegistered',
  InvalidType: 'InvalidType',
  PitchAlreadyExists: 'PitchAlreadyExists',
  PitchDoesNotExist: 'PitchDoesNotExist',
  PitchNotApproved: 'PitchNotApproved',
  InvalidPool: 'InvalidPool',
  PoolIdAlreadyExists: 'PoolIdAlreadyExists',
  InvalidMaxContribution: 'InvalidMaxContribution',
  TokenNotSupported: 'TokenNotSupported',
  FeeTooHigh: 'FeeTooHigh',
  PitchNotInPool: 'PitchNotInPool',

  // CrowdVCPool errors
  AlreadyInitialized: 'AlreadyInitialized',
  OnlyFactory: 'OnlyFactory',
  InvalidFundingGoal: 'InvalidFundingGoal',
  InvalidDurations: 'InvalidDurations',
  NoCandidatePitches: 'NoCandidatePitches',
  InvalidToken: 'InvalidToken',
  InvalidTreasury: 'InvalidTreasury',
  PoolNotActive: 'PoolNotActive',
  VotingPeriodEnded: 'VotingPeriodEnded',
  VotingPeriodNotEnded: 'VotingPeriodNotEnded',
  BelowMinContribution: 'BelowMinContribution',
  AboveMaxContribution: 'AboveMaxContribution',
  TokenNotAccepted: 'TokenNotAccepted',
  InvalidPitch: 'InvalidPitch',
  NoContribution: 'NoContribution',
  AlreadyWithdrawn: 'AlreadyWithdrawn',
  AlreadyVotedForPitch: 'AlreadyVotedForPitch',
  AlreadyContributed: 'AlreadyContributed',
  NoExistingVote: 'NoExistingVote',
  SamePitchVote: 'SamePitchVote',
  NotVotedForPitch: 'NotVotedForPitch',
  NotAWinner: 'NotAWinner',
  DidNotContributeToThisPitch: 'DidNotContributeToThisPitch',
  InvalidMilestoneIndex: 'InvalidMilestoneIndex',
  AlreadyApprovedMilestone: 'AlreadyApprovedMilestone',
  MilestoneNotCompleted: 'MilestoneNotCompleted',
  MilestoneDisputed: 'MilestoneDisputed',
  PitchAlreadyAdded: 'PitchAlreadyAdded',
  InvalidWallet: 'InvalidWallet',
  PitchNotInPool: 'PitchNotInPool',
  PitchHasVotes: 'PitchHasVotes',
  PoolAlreadyActiveOrClosed: 'PoolAlreadyActiveOrClosed',
  MilestonesAlreadySet: 'MilestonesAlreadySet',
  NoMilestones: 'NoMilestones',
  InvalidMilestonePercentage: 'InvalidMilestonePercentage',
  MilestonePercentageMismatch: 'MilestonePercentageMismatch',
  NotPitchOwner: 'NotPitchOwner',
  AlreadyCompleted: 'AlreadyCompleted',
  PoolNotFunded: 'PoolNotFunded',
  InsufficientApprovals: 'InsufficientApprovals',
  ExceedsAllocation: 'ExceedsAllocation',
  InvalidStartupWallet: 'InvalidStartupWallet',
  NoAcceptedToken: 'NoAcceptedToken',
  PoolNotFailed: 'PoolNotFailed',
  AlreadyRefunded: 'AlreadyRefunded',
  MaxVotesExceeded: 'MaxVotesExceeded',
  NotVotedForAnyPitch: 'NotVotedForAnyPitch',
  SoulboundToken: 'SoulboundToken',

  // CrowdVCTreasury errors
  InvalidRecipient: 'InvalidRecipient',
  InsufficientBalance: 'InsufficientBalance',
  NativeTransferFailed: 'NativeTransferFailed',
  InsufficientTokenBalance: 'InsufficientTokenBalance',
  NoTokensToRescue: 'NoTokensToRescue',

  // ValidationLib errors
  InvalidAddress: 'InvalidAddress',
  InvalidAmount: 'InvalidAmount',
  InvalidString: 'InvalidString',
  InvalidDuration: 'InvalidDuration',
  DeadlineInPast: 'DeadlineInPast',
  EmptyArray: 'EmptyArray',

  // AccessControl error
  AccessControlUnauthorizedAccount: 'AccessControlUnauthorizedAccount',

  // Pausable errors
  EnforcedPause: 'EnforcedPause',
  ExpectedPause: 'ExpectedPause',

  // Ownable errors
  OwnableUnauthorizedAccount: 'OwnableUnauthorizedAccount',
  OwnableInvalidOwner: 'OwnableInvalidOwner',
} as const;

// ============ ZERO ADDRESS ============
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

// ============ MILESTONE CONSTANTS ============

/** Standard milestone structure for testing */
export const DEFAULT_MILESTONES = [
  {
    description: 'Phase 1: Product Development',
    fundingPercent: 3000n, // 30%
    deadline: 0n, // Will be set dynamically
    completed: false,
    disputed: false,
    evidenceURI: '',
    approvalCount: 0n,
    approvalsNeeded: 0n,
  },
  {
    description: 'Phase 2: Market Launch',
    fundingPercent: 4000n, // 40%
    deadline: 0n,
    completed: false,
    disputed: false,
    evidenceURI: '',
    approvalCount: 0n,
    approvalsNeeded: 0n,
  },
  {
    description: 'Phase 3: Scale Operations',
    fundingPercent: 3000n, // 30%
    deadline: 0n,
    completed: false,
    disputed: false,
    evidenceURI: '',
    approvalCount: 0n,
    approvalsNeeded: 0n,
  },
];
