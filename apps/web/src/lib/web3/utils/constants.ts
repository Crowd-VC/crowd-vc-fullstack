/**
 * Web3 constants and configuration values
 */

/**
 * Gas limits for different transaction types
 * These are estimates and may need adjustment based on actual usage
 */
export const GAS_LIMITS = {
  // Factory contract operations
  REGISTER_USER: 200_000n,
  SUBMIT_PITCH: 250_000n,
  UPDATE_PITCH_STATUS: 150_000n,
  CREATE_POOL: 5_000_000n, // Pool deployment is gas-intensive

  // Token operations
  TOKEN_APPROVE: 100_000n,
  TOKEN_TRANSFER: 65_000n,

  // Pool contract operations
  CONTRIBUTE: 300_000n,
  VOTE: 150_000n,
  WITHDRAW_EARLY: 200_000n,
  REQUEST_REFUND: 200_000n,
  END_VOTING: 500_000n,
  ADD_MILESTONES: 300_000n,
  COMPLETE_MILESTONE: 150_000n,
  DISTRIBUTE_MILESTONE_FUNDS: 250_000n
} as const

/**
 * Default slippage tolerance for transactions (in basis points)
 * 100 = 1%
 */
export const DEFAULT_SLIPPAGE_BP = 100n

/**
 * Platform fee percentage (in basis points)
 * 500 = 5%
 * This should match the contract configuration
 */
export const PLATFORM_FEE_BP = 500n

/**
 * Early withdrawal penalty percentage (in basis points)
 * 1000 = 10%
 */
export const EARLY_WITHDRAWAL_PENALTY_BP = 1000n

/**
 * Maximum number of winners in a pool
 */
export const MAX_POOL_WINNERS = 3

/**
 * Minimum and maximum values for various operations
 */
export const LIMITS = {
  // Contribution limits
  MIN_CONTRIBUTION_USDT: '10', // $10 minimum
  MIN_CONTRIBUTION_USDC: '10', // $10 minimum

  // Pitch limits
  MIN_PITCH_TITLE_LENGTH: 5,
  MAX_PITCH_TITLE_LENGTH: 100,
  MIN_FUNDING_GOAL: '1000', // $1,000 minimum
  MAX_FUNDING_GOAL: '10000000', // $10M maximum

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
  MAX_MILESTONE_FUNDING_PERCENT: 10000 // 100% total
} as const

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
  YEAR: 31536000 // 365 days
} as const

/**
 * Transaction confirmation blocks
 */
export const CONFIRMATION_BLOCKS = {
  MIN: 1, // Minimum confirmations before considering tx confirmed
  SAFE: 3, // Safe number of confirmations for most operations
  SECURE: 12 // Highly secure confirmations for critical operations
} as const

/**
 * Polling intervals (in milliseconds)
 */
export const POLLING_INTERVALS = {
  FAST: 3_000, // 3 seconds - for active transactions
  NORMAL: 12_000, // 12 seconds - for general data
  SLOW: 60_000 // 1 minute - for static data
} as const

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 30_000, // 30 seconds - user-specific data
  MEDIUM: 60_000, // 1 minute - pool data
  LONG: 300_000, // 5 minutes - static data (fees, etc.)
  VERY_LONG: 3_600_000 // 1 hour - contract addresses, etc.
} as const

/**
 * Decimal precision for different contexts
 */
export const DECIMALS = {
  USDT: 6,
  USDC: 6,
  DISPLAY: 2, // Display precision for UI
  INTERNAL: 18 // Internal calculation precision
} as const

/**
 * User type enum values (matching contract)
 */
export const USER_TYPES = {
  NONE: 0,
  STARTUP: 1,
  INVESTOR: 2,
  ADMIN: 3
} as const

/**
 * Pitch status enum values (matching contract)
 */
export const PITCH_STATUS = {
  PENDING: 0,
  UNDER_REVIEW: 1,
  APPROVED: 2,
  REJECTED: 3,
  IN_POOL: 4,
  FUNDED: 5
} as const

/**
 * Pool status enum values (matching contract)
 */
export const POOL_STATUS = {
  ACTIVE: 0,
  VOTING_ENDED: 1,
  FUNDED: 2,
  CLOSED: 3,
  FAILED: 4
} as const

/**
 * Zero address constant
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

/**
 * Maximum uint256 value (for unlimited approvals)
 */
export const MAX_UINT256 = 2n ** 256n - 1n

/**
 * Basis points denominator
 * Used for percentage calculations (10000 = 100%)
 */
export const BASIS_POINTS_DENOMINATOR = 10000n

/**
 * Event names for logging/analytics
 */
export const EVENTS = {
  // Factory events
  USER_REGISTERED: 'UserRegistered',
  PITCH_SUBMITTED: 'PitchSubmitted',
  PITCH_STATUS_UPDATED: 'PitchStatusUpdated',
  POOL_CREATED: 'PoolCreated',

  // Pool events
  CONTRIBUTION_MADE: 'ContributionMade',
  VOTE_CAST: 'VoteCast',
  EARLY_WITHDRAWAL: 'EarlyWithdrawal',
  VOTING_ENDED: 'VotingEnded',
  MILESTONE_COMPLETED: 'MilestoneCompleted',
  FUNDS_DISTRIBUTED: 'FundsDistributed',
  REFUNDED: 'Refunded',
  POOL_CLOSED: 'PoolClosed',

  // Token events
  TRANSFER: 'Transfer',
  APPROVAL: 'Approval'
} as const
