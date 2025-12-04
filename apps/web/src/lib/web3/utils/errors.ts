/**
 * Error handling utilities for Web3 transactions
 * Parses and formats contract errors for user display
 *
 * Following best practices for Wagmi v2 + Viem custom error handling:
 * - Uses Viem's error.walk() to traverse nested error chains
 * - Decodes custom errors with their parameters for detailed messages
 * - Provides user-friendly toast/alert messages
 */

import {
  BaseError,
  ContractFunctionRevertedError,
  type DecodeErrorResultReturnType,
} from 'viem';
import { CrowdVCFactoryABI, CrowdVCPoolABI } from '@crowd-vc/abis';
import { formatUnits } from 'viem';

// Combined ABI for error decoding
const COMBINED_ABI = [...CrowdVCFactoryABI, ...CrowdVCPoolABI] as const;

/**
 * Parsed custom error result
 */
export type ParsedCustomError = {
  name: string;
  args: readonly unknown[];
  message: string;
};

/**
 * User-friendly error messages for custom contract errors
 * Maps error names to message generators that can use error arguments
 */
const CUSTOM_ERROR_MESSAGES: Record<
  string,
  (args: readonly unknown[]) => string
> = {
  // ============ CrowdVCFactory Errors ============
  InvalidUserType: () =>
    'Invalid user type selected. Please choose Startup or Investor.',
  AlreadyRegistered: () => 'This wallet is already registered on the platform.',
  UserNotRegistered: () =>
    'This wallet is not registered. Please register first.',
  InvalidType: () => 'Invalid type provided.',
  PitchAlreadyExists: () => 'A pitch with this information already exists.',
  PitchDoesNotExist: () => 'The specified pitch does not exist.',
  PitchNotApproved: () => 'This pitch has not been approved yet.',
  InvalidPool: () => 'Invalid pool address provided.',
  PoolIdAlreadyExists: () =>
    'A pool with this ID already exists. Please choose a different ID.',
  InvalidMaxContribution: () =>
    'Maximum contribution must be greater than or equal to minimum contribution.',
  TokenNotSupported: () =>
    'This token is not supported. Please use USDC or USDT.',
  FeeTooHigh: (args) => {
    const [provided, maximum] = args as [bigint, bigint];
    return `Platform fee too high. Provided: ${provided}%, Maximum allowed: ${maximum / 100n}%.`;
  },
  PitchNotInPool: () => 'This pitch is not assigned to the pool.',

  // ============ ValidationLib Errors ============
  InvalidAddress: () =>
    'Invalid address provided. Please check the wallet address.',
  InvalidAmount: () => 'Invalid amount. Amount must be greater than zero.',
  InvalidString: () =>
    'A required text field is empty. Please fill in all required fields.',
  InvalidDuration: () =>
    'Invalid duration. Please check the voting and funding durations.',
  InvalidFundingGoal: () =>
    'Invalid funding goal. Goal must be within acceptable limits.',
  DeadlineInPast: () => 'Deadline cannot be in the past.',
  EmptyArray: () => 'At least one item is required.',

  // ============ CrowdVCPool Errors ============
  AlreadyInitialized: () => 'This pool has already been initialized.',
  OnlyFactory: () => 'Only the factory contract can perform this action.',
  InvalidDurations: () => 'Invalid voting or funding duration.',
  NoCandidatePitches: () =>
    'At least one startup pitch must be added to the pool.',
  InvalidToken: () => 'Invalid token address provided.',
  InvalidTreasury: () => 'Invalid treasury address provided.',
  PoolNotActive: () => 'This pool is not currently active.',
  VotingPeriodEnded: () => 'The voting period has ended for this pool.',
  VotingPeriodNotEnded: () => 'The voting period has not ended yet.',
  BelowMinContribution: (args) => {
    const [provided, minimum] = args as [bigint, bigint];
    return `Contribution too low. You provided ${formatUnits(provided, 6)} but minimum is ${formatUnits(minimum, 6)}.`;
  },
  AboveMaxContribution: (args) => {
    const [provided, maximum] = args as [bigint, bigint];
    return `Contribution too high. You provided ${formatUnits(provided, 6)} but maximum is ${formatUnits(maximum, 6)}.`;
  },
  TokenNotAccepted: (args) => {
    const [token] = args as [`0x${string}`];
    return `Token ${token.slice(0, 6)}...${token.slice(-4)} is not accepted by this pool.`;
  },
  InvalidPitch: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `Pitch ${pitchId.slice(0, 10)}... is not a candidate in this pool.`;
  },
  NoContribution: () => 'You have not contributed to this pool.',
  AlreadyWithdrawn: () => 'You have already withdrawn your contribution.',
  AlreadyVotedForPitch: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `You have already voted for pitch ${pitchId.slice(0, 10)}...`;
  },
  AlreadyContributed: () =>
    'You have already contributed. Your vote is now locked.',
  NoExistingVote: () => "You don't have an existing vote to change.",
  SamePitchVote: () => "You're already voting for this pitch.",
  NotVotedForPitch: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `You haven\'t voted for pitch ${pitchId.slice(0, 10)}...`;
  },
  NotAWinner: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `Pitch ${pitchId.slice(0, 10)}... is not a winning pitch.`;
  },
  DidNotContributeToThisPitch: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `You did not contribute to pitch ${pitchId.slice(0, 10)}...`;
  },
  InvalidMilestoneIndex: (args) => {
    const [index] = args as [bigint];
    return `Invalid milestone index: ${index}. Please check the milestone exists.`;
  },
  AlreadyApprovedMilestone: () => 'You have already approved this milestone.',
  MilestoneNotCompleted: () =>
    'This milestone has not been marked as completed yet.',
  MilestoneDisputed: () => 'This milestone is currently under dispute.',
  PitchAlreadyAdded: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `Pitch ${pitchId.slice(0, 10)}... is already added to this pool.`;
  },
  InvalidWallet: () => 'Invalid wallet address provided.',
  PitchNotInPool: (args) => {
    const [pitchId] = args as [`0x${string}`];
    return `Pitch ${pitchId.slice(0, 10)}... is not in this pool.`;
  },
  PitchHasVotes: (args) => {
    const [pitchId, votes] = args as [`0x${string}`, bigint];
    return `Cannot remove pitch ${pitchId.slice(0, 10)}... - it has ${formatUnits(votes, 6)} votes.`;
  },
  PoolAlreadyActiveOrClosed: () =>
    'This pool is already active or has been closed.',
  MilestonesAlreadySet: () =>
    'Milestones have already been set for this pitch.',
  NoMilestones: () => 'At least one milestone is required.',
  InvalidMilestonePercentage: () =>
    'Each milestone must have a funding percentage greater than 0.',
  MilestonePercentageMismatch: (args) => {
    const [total] = args as [bigint];
    return `Milestone percentages must total 100%. Current total: ${Number(total) / 100}%.`;
  },
  NotPitchOwner: (args) => {
    const [caller, owner] = args as [`0x${string}`, `0x${string}`];
    return `Only the pitch owner (${owner.slice(0, 6)}...${owner.slice(-4)}) can perform this action.`;
  },
  AlreadyCompleted: () => 'This milestone is already marked as completed.',
  PoolNotFunded: () => 'The pool has not been funded yet.',
  InsufficientApprovals: (args) => {
    const [current, required] = args as [bigint, bigint];
    return `Insufficient approvals. Current: ${formatUnits(current, 6)}, Required: ${formatUnits(required, 6)}.`;
  },
  ExceedsAllocation: (args) => {
    const [requested, available] = args as [bigint, bigint];
    return `Amount exceeds allocation. Requested: ${formatUnits(requested, 6)}, Available: ${formatUnits(available, 6)}.`;
  },
  InvalidStartupWallet: () => 'The startup wallet address is invalid.',
  NoAcceptedToken: () => 'No accepted token configured for this pool.',
  PoolNotFailed: () => 'Refunds are only available for failed pools.',
  AlreadyRefunded: () => 'You have already claimed your refund.',
  SoulboundToken: () =>
    'NFT receipts cannot be transferred. They are soulbound to the original contributor.',

  // ============ OpenZeppelin AccessControl Errors ============
  AccessControlUnauthorizedAccount: (args) => {
    const [account, role] = args as [`0x${string}`, `0x${string}`];
    const roleNames: Record<string, string> = {
      '0x0000000000000000000000000000000000000000000000000000000000000000':
        'Default Admin',
      '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775':
        'Admin',
      '0x8502233096d909befbda0999bb8ea2f3a6be3c138b9fbf003752a4c8bce86f6c':
        'Startup',
      '0x4e3d4f8c7e0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f':
        'Investor',
    };
    const roleName = roleNames[role] || 'required role';
    return `Account ${account.slice(0, 6)}...${account.slice(-4)} is missing the ${roleName}.`;
  },
  AccessControlBadConfirmation: () =>
    'Bad confirmation for access control change.',

  // ============ ERC20 Errors ============
  ERC20InsufficientBalance: (args) => {
    const [sender, balance, needed] = args as [`0x${string}`, bigint, bigint];
    return `Insufficient token balance. You have ${formatUnits(balance, 6)} but need ${formatUnits(needed, 6)}.`;
  },
  ERC20InsufficientAllowance: (args) => {
    const [spender, allowance, needed] = args as [
      `0x${string}`,
      bigint,
      bigint,
    ];
    return `Token approval required. Current allowance: ${formatUnits(allowance, 6)}, Needed: ${formatUnits(needed, 6)}. Please approve the token first.`;
  },
};

/**
 * Fallback error messages for common error patterns
 */
const FALLBACK_ERROR_MESSAGES: Record<string, string> = {
  // User/wallet errors
  'User rejected': 'Transaction was cancelled.',
  'user rejected transaction': 'You cancelled the transaction.',
  'User denied': 'Transaction was rejected.',

  // Network errors
  'network changed':
    'Network was changed during transaction. Please try again.',
  'Chain mismatch': 'Please switch to the correct network.',

  // Gas errors
  'gas required exceeds allowance':
    'Transaction requires too much gas. Please try with a lower amount.',
  'insufficient funds for gas': 'Insufficient ETH for gas fees.',

  // Generic contract errors
  'execution reverted': 'Transaction was reverted by the contract.',
  'nonce too low':
    'Transaction nonce issue. Please reset your wallet or wait for pending transactions.',
  'replacement transaction underpriced':
    'Gas price too low. Please increase the gas price.',
};

/**
 * Extract custom error from Viem error chain using walk pattern
 * This is the recommended approach for Wagmi v2 + Viem
 *
 * @param error - Error from contract interaction
 * @returns Parsed custom error with name, args, and user-friendly message
 */
export function getCustomError(error: unknown): ParsedCustomError {
  if (!error) {
    return {
      name: 'UnknownError',
      args: [],
      message: 'An unknown error occurred.',
    };
  }

  // Cast to BaseError to access the walk method
  const baseError = error as BaseError;

  // Walk the error chain to find ContractFunctionRevertedError
  const revertError = baseError.walk?.(
    (e) => e instanceof ContractFunctionRevertedError,
  ) as ContractFunctionRevertedError | null;

  if (revertError?.data) {
    const errorName = revertError.data.errorName;
    const errorArgs = revertError.data.args || [];

    // Get user-friendly message from our mapping
    const messageGenerator = CUSTOM_ERROR_MESSAGES[errorName];
    const message = messageGenerator
      ? messageGenerator(errorArgs)
      : `Contract error: ${errorName}`;

    return {
      name: errorName,
      args: errorArgs,
      message,
    };
  }

  // If no custom error found, try to extract from reason or message
  if (revertError?.reason) {
    return {
      name: 'RevertReason',
      args: [],
      message: revertError.reason,
    };
  }

  // Fallback: check for known error patterns in error message
  return getFallbackError(error);
}

/**
 * Get fallback error message from error patterns
 */
function getFallbackError(error: unknown): ParsedCustomError {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for known error patterns
  for (const [pattern, message] of Object.entries(FALLBACK_ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return {
        name: 'FallbackError',
        args: [],
        message,
      };
    }
  }

  // Try to get short message from BaseError
  if (error instanceof BaseError && error.shortMessage) {
    return {
      name: 'BaseError',
      args: [],
      message: error.shortMessage,
    };
  }

  return {
    name: 'UnknownError',
    args: [],
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Parse contract error and return user-friendly message
 * Main entry point for error handling in components
 *
 * @param error - Error object from contract interaction
 * @returns User-friendly error message for toast/alert display
 */
export function parseContractError(error: unknown): string {
  const customError = getCustomError(error);
  return customError.message;
}

/**
 * Format error for logging (includes technical details)
 * @param error - Error object
 * @returns Formatted error string for logs
 */
export function formatErrorForLog(error: unknown): string {
  if (error instanceof BaseError) {
    return `${error.name}: ${error.message}\nDetails: ${JSON.stringify(error.details || {})}`;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }

  return String(error);
}

/**
 * Check if error is a user rejection
 * @param error - Error object
 * @returns True if user rejected the transaction
 */
export function isUserRejectionError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('user cancelled') ||
    message.includes('rejected the request')
  );
}

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return (
    message.includes('network') ||
    message.includes('chain') ||
    message.includes('rpc') ||
    message.includes('disconnected')
  );
}

/**
 * Check if error is insufficient funds/balance error
 * @param error - Error object
 * @returns True if error is balance-related
 */
export function isInsufficientFundsError(error: unknown): boolean {
  const customError = getCustomError(error);
  return (
    customError.name === 'ERC20InsufficientBalance' ||
    customError.name === 'ERC20InsufficientAllowance' ||
    customError.message.toLowerCase().includes('insufficient')
  );
}

/**
 * Check if error requires token approval
 * @param error - Error object
 * @returns True if user needs to approve tokens
 */
export function isApprovalError(error: unknown): boolean {
  const customError = getCustomError(error);
  return customError.name === 'ERC20InsufficientAllowance';
}

/**
 * Get error category for analytics/logging
 * @param error - Error object
 * @returns Error category
 */
export function getErrorCategory(error: unknown): string {
  if (isUserRejectionError(error)) return 'USER_REJECTION';
  if (isNetworkError(error)) return 'NETWORK_ERROR';
  if (isApprovalError(error)) return 'APPROVAL_REQUIRED';
  if (isInsufficientFundsError(error)) return 'INSUFFICIENT_FUNDS';

  const customError = getCustomError(error);
  if (
    customError.name !== 'UnknownError' &&
    customError.name !== 'FallbackError'
  ) {
    return `CONTRACT_ERROR_${customError.name}`;
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Get action suggestion based on error type
 * Useful for providing next-step guidance in UI
 * @param error - Error object
 * @returns Suggested action for the user
 */
export function getErrorAction(error: unknown): string | null {
  const customError = getCustomError(error);

  switch (customError.name) {
    case 'ERC20InsufficientAllowance':
      return 'Approve tokens to continue';
    case 'ERC20InsufficientBalance':
      return 'Add funds to your wallet';
    case 'PoolNotActive':
      return 'Wait for pool to become active';
    case 'VotingPeriodEnded':
      return 'Voting has ended for this pool';
    case 'BelowMinContribution':
      return 'Increase your contribution amount';
    case 'AboveMaxContribution':
      return 'Decrease your contribution amount';
    case 'TokenNotSupported':
      return 'Use USDC or USDT';
    case 'AccessControlUnauthorizedAccount':
      return 'Contact an administrator';
    default:
      return null;
  }
}
