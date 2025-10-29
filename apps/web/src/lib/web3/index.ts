/**
 * Web3 Integration Library
 * Complete Web3 integration for CrowdVC platform
 *
 * @packageDocumentation
 */

// Configuration exports
export * from './config'

// Utility exports
export * from './utils'

// Hook exports
export * from './hooks'

// Re-export commonly used types from @crowd-vc/abis
export type {
  UserProfile,
  PitchData,
  PoolInfo,
  VoteResult,
  Milestone
} from '@crowd-vc/abis'

export {
  UserType,
  PitchStatus,
  PoolStatus
} from '@crowd-vc/abis'
