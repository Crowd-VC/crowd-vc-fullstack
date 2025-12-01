/**
 * @crowd-vc/abis
 * Shared contract ABIs and TypeScript types for CrowdVC platform
 */

// Factory exports
export {
  CrowdVCFactoryABI,
  UserType,
  PitchStatus,
  type UserProfile,
  type PitchData,
  type RegisterUserParams,
  type SubmitPitchParams,
  type CreatePoolParams,
  type UpdatePitchStatusParams,
  type UserRegisteredEvent,
  type PitchSubmittedEvent,
  type PitchStatusUpdatedEvent,
  type PoolCreatedEvent,
} from './factory';

// Pool exports
export {
  CrowdVCPoolABI,
  PoolStatus,
  type PoolInfo,
  type VoteResult,
  type Milestone,
  type ContributeParams,
  type VoteParams,
  type AddMilestonesParams,
  type CompleteMilestoneParams,
  type DistributeMilestoneFundsParams,
  type ContributionMadeEvent,
  type VoteCastEvent,
  type EarlyWithdrawalEvent,
  type VotingEndedEvent,
  type MilestoneCompletedEvent,
  type FundsDistributedEvent,
  type RefundedEvent,
  type PoolClosedEvent,
} from './pool';

// ERC20 exports
export {
  ERC20ABI,
  type ERC20TokenInfo,
  type ERC20TransferEvent,
  type ERC20ApprovalEvent,
} from './erc20';

// Address exports
export {
  DeployedAddresses,
  CROWD_VC_FACTORY_ADDRESS,
  getAddressesForChain,
  getFactoryAddress,
  isDeployedOnChain,
  getDeployedChainIds,
  type ChainAddresses,
} from './addresses';
