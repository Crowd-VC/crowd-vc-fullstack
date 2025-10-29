/**
 * Web3 Types
 * Additional TypeScript types for Web3 integration
 *
 * Note: Most types are re-exported from @crowd-vc/abis
 * This file is for custom types specific to the web app
 */

// Re-export all types from abis package
export type {
  UserProfile,
  PitchData,
  PoolInfo,
  VoteResult,
  Milestone,
  RegisterUserParams,
  SubmitPitchParams,
  CreatePoolParams,
  ContributeParams,
  VoteParams,
  ERC20TokenInfo
} from '@crowd-vc/abis'

export {
  UserType,
  PitchStatus,
  PoolStatus
} from '@crowd-vc/abis'

// Custom web app types can be added here
export type TransactionState = {
  hash?: `0x${string}`
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error?: string
}
