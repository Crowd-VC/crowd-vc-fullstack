import { keccak256, toBytes } from "viem";

/**
 * Contract Constants from CrowdVCFactory
 */

// Funding goal limits (in token base units, e.g., 6 decimals for USDT/USDC)
export const MIN_FUNDING_GOAL = BigInt(10000 * 1e6); // 10,000 tokens
export const MAX_FUNDING_GOAL = BigInt(1000000 * 1e6); // 1,000,000 tokens

// Pool goal limits
export const MIN_POOL_GOAL = BigInt(50000 * 1e6); // 50,000 tokens
export const MAX_POOL_GOAL = BigInt(5000000 * 1e6); // 5,000,000 tokens

// Duration limits (in seconds)
export const MIN_VOTING_DURATION = BigInt(1 * 24 * 60 * 60); // 1 day
export const MAX_VOTING_DURATION = BigInt(30 * 24 * 60 * 60); // 30 days
export const MIN_FUNDING_DURATION = BigInt(7 * 24 * 60 * 60); // 7 days
export const MAX_FUNDING_DURATION = BigInt(90 * 24 * 60 * 60); // 90 days

/**
 * Contract Constants from CrowdVCPool
 */

export const MAX_WINNERS = 3; // Maximum number of winning pitches per pool
export const EARLY_WITHDRAWAL_PENALTY = 1000; // 10% in basis points
export const BASIS_POINTS = 10000; // 100% = 10000 basis points

/**
 * OpenZeppelin AccessControl Role Identifiers
 * These should match the keccak256 hashes in the contracts
 */

// DEFAULT_ADMIN_ROLE is bytes32(0)
export const DEFAULT_ADMIN_ROLE = `0x${"0".repeat(64)}` as `0x${string}`;

// ADMIN_ROLE = keccak256("ADMIN_ROLE")
export const ADMIN_ROLE = keccak256(toBytes("ADMIN_ROLE"));

// STARTUP_ROLE = keccak256("STARTUP_ROLE")
export const STARTUP_ROLE = keccak256(toBytes("STARTUP_ROLE"));

// INVESTOR_ROLE = keccak256("INVESTOR_ROLE")
export const INVESTOR_ROLE = keccak256(toBytes("INVESTOR_ROLE"));

/**
 * Test Configuration Values
 */

// Default platform fee for tests (500 basis points = 5%)
export const DEFAULT_PLATFORM_FEE = 500;

// Default pool parameters
export const DEFAULT_POOL_CONFIG = {
  fundingGoal: BigInt(150000 * 1e6), // 150,000 tokens
  votingDuration: BigInt(7 * 24 * 60 * 60), // 7 days
  fundingDuration: BigInt(30 * 24 * 60 * 60), // 30 days
  minContribution: BigInt(100 * 1e6), // 100 tokens
} as const;

// Sample metadata URIs
export const SAMPLE_METADATA = {
  startup: "ipfs://QmStartupMetadata123",
  investor: "ipfs://QmInvestorMetadata456",
  pitch: "ipfs://QmPitchData789",
} as const;

// Sample pitch data
export const SAMPLE_PITCHES = [
  {
    title: "AI-Powered Analytics Platform",
    ipfsHash: "QmPitch1HashABC",
    fundingGoal: BigInt(50000 * 1e6), // 50,000 tokens
  },
  {
    title: "Blockchain Supply Chain Solution",
    ipfsHash: "QmPitch2HashDEF",
    fundingGoal: BigInt(75000 * 1e6), // 75,000 tokens
  },
  {
    title: "Green Energy Marketplace",
    ipfsHash: "QmPitch3HashGHI",
    fundingGoal: BigInt(60000 * 1e6), // 60,000 tokens
  },
] as const;

/**
 * Token Constants
 */

export const USDT_DECIMALS = 6;
export const USDC_DECIMALS = 6;

/**
 * Enum Mappings
 * These match the Solidity enum definitions
 */

export enum UserType {
  None = 0,
  Startup = 1,
  Investor = 2,
  Admin = 3,
}

export enum PitchStatus {
  Pending = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  InPool = 4,
  Funded = 5,
}

export enum PoolStatus {
  Active = 0,
  VotingEnded = 1,
  Funded = 2,
  Closed = 3,
  Failed = 4,
}

/**
 * Test Account Roles
 * Helpers for consistent account usage across test files
 */

export const ACCOUNT_ROLES = {
  ADMIN_INDEX: 0,
  TREASURY_INDEX: 1,
  STARTUP_1_INDEX: 2,
  STARTUP_2_INDEX: 3,
  STARTUP_3_INDEX: 4,
  INVESTOR_1_INDEX: 5,
  INVESTOR_2_INDEX: 6,
  INVESTOR_3_INDEX: 7,
} as const;

/**
 * Time Constants
 */

export const TIME_UNITS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
} as const;

/**
 * Gas Limits (for gas testing)
 */

export const GAS_LIMITS = {
  REGISTER_USER: 200000,
  SUBMIT_PITCH: 300000,
  CREATE_POOL: 500000,
  CONTRIBUTE: 250000,
  VOTE: 150000,
  CLAIM_FUNDS: 200000,
  WITHDRAW: 180000,
} as const;

/**
 * Error Messages
 * Common error messages from contract validations
 */

export const ERROR_MESSAGES = {
  // ValidationLib errors
  INVALID_ADDRESS: "InvalidAddress",
  INVALID_STRING: "InvalidString",
  INVALID_AMOUNT: "InvalidAmount",
  AMOUNT_BELOW_MINIMUM: "AmountBelowMinimum",
  AMOUNT_ABOVE_MAXIMUM: "AmountAboveMaximum",
  DURATION_TOO_SHORT: "DurationTooShort",
  DURATION_TOO_LONG: "DurationTooLong",

  // FeeCalculator errors
  FEE_TOO_HIGH: "FeeTooHigh",

  // Common AccessControl errors
  ACCESS_DENIED: "AccessControl",
  UNAUTHORIZED: "Unauthorized",
} as const;
