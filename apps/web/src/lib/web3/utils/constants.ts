/**
 * Web3 constants and configuration values
 */

/**
 * Gas limits for different transaction types
 * These are estimates and may need adjustment based on actual usage
 */
export const GAS_LIMITS = {
  // Factory contract operations
  REGISTER_USER: BigInt(200_0000),
  SUBMIT_PITCH: BigInt(250_0000),
  UPDATE_PITCH_STATUS: BigInt(150_0000),
  CREATE_POOL: BigInt(3_000_000), // Pool deployment with clone + initialize is gas-intensive
  ADD_STARTUP_TO_POOL: BigInt(500_000),

  // Token operations
  TOKEN_APPROVE: BigInt(100_0000),
  TOKEN_TRANSFER: BigInt(65_0000),

  // Pool contract operations
  CONTRIBUTE: BigInt(300_0000),
  VOTE: BigInt(150_000),
  WITHDRAW_EARLY: BigInt(200_0000),
  REQUEST_REFUND: BigInt(200_0000),
  END_VOTING: BigInt(500_0000),
  ADD_MILESTONES: BigInt(300_0000),
  COMPLETE_MILESTONE: BigInt(150_0000),
  DISTRIBUTE_MILESTONE_FUNDS: BigInt(250_0000),
} as const;

/**
 * Default slippage tolerance for transactions (in basis points)
 * 100 = 1%
 */
export const DEFAULT_SLIPPAGE_BP = BigInt(100);

/**
 * Platform fee percentage (in basis points)
 * 500 = 5%
 * This should match the contract configuration
 */
export const PLATFORM_FEE_BP = BigInt(500);

/**
 * Early withdrawal penalty percentage (in basis points)
 * 1000 = 10%
 */
export const EARLY_WITHDRAWAL_PENALTY_BP = BigInt(1000);

/**
 * Maximum number of winners in a pool
 */
export const MAX_POOL_WINNERS = 3;

/**
 * Minimum and maximum values for various operations
 */
export const LIMITS = {
  // Contribution limits
  MIN_CONTRIBUTION_USDT: "10", // $10 minimum
  MIN_CONTRIBUTION_USDC: "10", // $10 minimum

  // Pitch limits
  MIN_PITCH_TITLE_LENGTH: 5,
  MAX_PITCH_TITLE_LENGTH: 100,
  MIN_FUNDING_GOAL: "1000", // $1,000 minimum
  MAX_FUNDING_GOAL: "10000000", // $10M maximum

  // Pool limits
  MIN_VOTING_DURATION: 86400, // 1 day in seconds
  MAX_VOTING_DURATION: 2592000, // 30 days in seconds
  MIN_FUNDING_DURATION: 86400, // 1 day in seconds
  MAX_FUNDING_DURATION: 7776000, // 90 days in seconds
  MIN_CANDIDATE_PITCHES: 2,
  MAX_CANDIDATE_PITCHES: 20,

  // Milestone limits
  MIN_MILESTONES: 1,
  MAX_MILESTONES: 10,
  MIN_MILESTONE_FUNDING_PERCENT: 500, // 5% minimum per milestone
  MAX_MILESTONE_FUNDING_PERCENT: 10000, // 100% total
} as const;

/**
 * Time constants (in seconds)
 */
export const TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 365 days
} as const;

/**
 * Transaction confirmation blocks
 */
export const CONFIRMATION_BLOCKS = {
  MIN: 1, // Minimum confirmations before considering tx confirmed
  SAFE: 3, // Safe number of confirmations for most operations
  SECURE: 12, // Highly secure confirmations for critical operations
} as const;

/**
 * Polling intervals (in milliseconds)
 */
export const POLLING_INTERVALS = {
  FAST: 3_000, // 3 seconds - for active transactions
  NORMAL: 12_000, // 12 seconds - for general data
  SLOW: 60_000, // 1 minute - for static data
} as const;

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 30_000, // 30 seconds - user-specific data
  MEDIUM: 60_000, // 1 minute - pool data
  LONG: 300_000, // 5 minutes - static data (fees, etc.)
  VERY_LONG: 3_600_000, // 1 hour - contract addresses, etc.
} as const;

/**
 * Decimal precision for different contexts
 */
export const DECIMALS = {
  USDT: 6,
  USDC: 6,
  DISPLAY: 2, // Display precision for UI
  INTERNAL: 18, // Internal calculation precision
} as const;

/**
 * User type enum values (matching contract)
 */
export const USER_TYPES = {
  NONE: 0,
  STARTUP: 1,
  INVESTOR: 2,
  ADMIN: 3,
} as const;

/**
 * Pitch status enum values (matching contract)
 */
export const PITCH_STATUS = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  APPROVED: 2,
  REJECTED: 3,
  IN_POOL: 4,
  FUNDED: 5,
} as const;

/**
 * Pool status enum values (matching contract)
 */
export const POOL_STATUS = {
  ACTIVE: 0,
  VOTING_ENDED: 1,
  FUNDED: 2,
  CLOSED: 3,
  FAILED: 4,
} as const;

/**
 * Zero address constant
 */
export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

/**
 * Maximum uint256 value (for unlimited approvals)
 */
export const MAX_UINT256 = BigInt(2) ** BigInt(256) - BigInt(1);

/**
 * Basis points denominator
 * Used for percentage calculations (10000 = 100%)
 */
export const BASIS_POINTS_DENOMINATOR = BigInt(10000);

/**
 * Event names for logging/analytics
 */
export const EVENTS = {
  // Factory events
  USER_REGISTERED: "UserRegistered",
  PITCH_SUBMITTED: "PitchSubmitted",
  PITCH_STATUS_UPDATED: "PitchStatusUpdated",
  POOL_CREATED: "PoolCreated",

  // Pool events
  CONTRIBUTION_MADE: "ContributionMade",
  VOTE_CAST: "VoteCast",
  EARLY_WITHDRAWAL: "EarlyWithdrawal",
  VOTING_ENDED: "VotingEnded",
  MILESTONE_COMPLETED: "MilestoneCompleted",
  FUNDS_DISTRIBUTED: "FundsDistributed",
  REFUNDED: "Refunded",
  POOL_CLOSED: "PoolClosed",

  // Token events
  TRANSFER: "Transfer",
  APPROVAL: "Approval",
} as const;
