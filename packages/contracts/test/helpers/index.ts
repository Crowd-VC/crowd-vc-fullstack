/**
 * Test Helpers Index
 * Barrel export file for all test helper modules
 * Allows convenient importing: import { deployFactoryFixture, expectEvent, ADMIN_ROLE } from '../helpers'
 */

// ============================================================================
// Fixtures
// ============================================================================

export {
  deployMockTokensFixture,
  deployFactoryFixture,
  registerUsersFixture,
  submitPitchesFixture,
  deployPoolFixture,
  createActivePoolFixture,
  createPoolWithVotingEndedFixture,
} from "./fixtures";

// ============================================================================
// Utilities
// ============================================================================

export {
  // Time manipulation
  increaseTime,
  mineBlocks,
  getLatestBlockTimestamp,
  setNextBlockTimestamp,
  // ID calculation
  calculatePitchId,
  // Token deployment
  deployMockUSDT,
  deployMockUSDC,
  // Conversion helpers
  toTokenAmount,
  fromTokenAmount,
  // Calculation helpers
  calculateExpectedFee,
  calculateExpectedPenalty,
  calculateNetAmount,
  calculateAllocationPercent,
  calculateAllocatedAmount,
} from "./utils";

// ============================================================================
// Matchers and Assertions
// ============================================================================

export {
  // Event assertions
  expectEvent,
  expectEventWithArgs,
  expectNoEvent,
  // Revert assertions
  expectRevert,
  expectCustomError,
  expectAccessControlRevert,
  // Value comparisons
  expectBigIntEqual,
  expectBigIntCloseTo,
  expectArrayEqual,
  // State assertions
  expectRoleGranted,
  expectRoleRevoked,
  expectPoolStatus,
  expectPitchStatus,
  expectUserType,
} from "./matchers";

// ============================================================================
// Constants
// ============================================================================

export {
  // Contract constants
  MIN_FUNDING_GOAL,
  MAX_FUNDING_GOAL,
  MIN_POOL_GOAL,
  MAX_POOL_GOAL,
  MIN_VOTING_DURATION,
  MAX_VOTING_DURATION,
  MIN_FUNDING_DURATION,
  MAX_FUNDING_DURATION,
  MAX_WINNERS,
  EARLY_WITHDRAWAL_PENALTY,
  BASIS_POINTS,
  // Role identifiers
  DEFAULT_ADMIN_ROLE,
  ADMIN_ROLE,
  STARTUP_ROLE,
  INVESTOR_ROLE,
  // Test configuration
  DEFAULT_PLATFORM_FEE,
  DEFAULT_POOL_CONFIG,
  SAMPLE_METADATA,
  SAMPLE_PITCHES,
  // Token constants
  USDT_DECIMALS,
  USDC_DECIMALS,
  // Enums
  UserType,
  PitchStatus,
  PoolStatus,
  // Account roles
  ACCOUNT_ROLES,
  // Time units
  TIME_UNITS,
  // Gas limits
  GAS_LIMITS,
  // Error messages
  ERROR_MESSAGES,
} from "./constants";

// ============================================================================
// Types
// ============================================================================

export type {
  // Contract structs
  UserProfile,
  PitchData,
  PoolInfo,
  VoteResult,
  Milestone,
  // Fixture return types
  DeployMockTokensFixtureResult,
  DeployFactoryFixtureResult,
  RegisterUsersFixtureResult,
  SubmitPitchesFixtureResult,
  DeployPoolFixtureResult,
  CreateActivePoolFixtureResult,
  // Test helper types
  TestAccounts,
  ContributionData,
  VoteData,
  MilestoneData,
  PoolCreationParams,
  PitchSubmissionParams,
  UserRegistrationParams,
  TransactionReceipt,
  EventLog,
  // Utility types
  DeepReadonly,
  DeepPartial,
  ContractRead,
  ContractWrite,
} from "./types";

// Type guards
export { isUserType, isPitchStatus, isPoolStatus } from "./types";
