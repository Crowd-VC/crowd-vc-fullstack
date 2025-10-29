/**
 * Error handling utilities for Web3 transactions
 * Parses and formats contract errors for user display
 */

import { BaseError, type ContractFunctionRevertedError } from 'viem'

/**
 * Common contract error messages mapped to user-friendly descriptions
 */
const ERROR_MESSAGES: Record<string, string> = {
  // User/wallet errors
  'User rejected': 'Transaction was rejected by user',
  'user rejected transaction': 'You cancelled the transaction',
  'User denied': 'Transaction was rejected by user',

  // Balance/allowance errors
  'insufficient funds': 'Insufficient funds for transaction (including gas)',
  'Insufficient balance': 'Your balance is too low for this transaction',
  'ERC20: insufficient allowance': 'Please approve token spending first',
  'ERC20InsufficientAllowance': 'Token approval required before transaction',

  // Network errors
  'network changed': 'Network was changed during transaction',
  'Chain mismatch': 'Please switch to the correct network',

  // Contract-specific errors (CrowdVC)
  'Already registered': 'This address is already registered',
  'Not registered': 'This address is not registered. Please register first',
  'Invalid user type': 'Invalid user type selected',
  'Unauthorized': 'You do not have permission to perform this action',
  'Only admin': 'Only administrators can perform this action',
  'Only startup': 'Only startups can perform this action',
  'Only investor': 'Only investors can perform this action',

  // Pitch errors
  'Pitch not found': 'Pitch does not exist',
  'Pitch not approved': 'Pitch has not been approved yet',
  'Invalid pitch status': 'Cannot perform this action with current pitch status',

  // Pool errors
  'Pool not active': 'This pool is not currently active',
  'Voting ended': 'Voting period has ended for this pool',
  'Voting not ended': 'Voting period has not ended yet',
  'Below minimum': 'Amount is below the minimum contribution',
  'Above funding goal': 'Pool funding goal already reached',
  'Already voted': 'You have already voted for this pitch',
  'Not a candidate': 'This pitch is not a candidate in this pool',
  'No contribution': 'You have not contributed to this pool',

  // Token errors
  'Unsupported token': 'This token is not supported',
  'Token not accepted': 'This token is not accepted for this pool',

  // Transaction errors
  'Transaction reverted': 'Transaction failed. Please try again',
  'gas required exceeds allowance': 'Transaction requires too much gas',
  'execution reverted': 'Transaction was reverted by the contract',
  'nonce too low': 'Please reset your wallet and try again',
  'replacement transaction underpriced': 'Gas price too low to replace transaction',
}

/**
 * Parse contract error and return user-friendly message
 * @param error - Error object from contract interaction
 * @returns User-friendly error message
 */
export function parseContractError(error: unknown): string {
  if (!error) return 'An unknown error occurred'

  // Handle Viem BaseError
  if (error instanceof BaseError) {
    // Check for contract function reverted error
    if (error.name === 'ContractFunctionRevertedError') {
      const revertError = error as ContractFunctionRevertedError
      const reason = revertError.reason || revertError.message

      // Try to match against known error messages
      for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (reason?.toLowerCase().includes(key.toLowerCase())) {
          return message
        }
      }

      return reason || 'Transaction failed. Please try again'
    }

    // Check short message first
    if (error.shortMessage) {
      for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (error.shortMessage.toLowerCase().includes(key.toLowerCase())) {
          return message
        }
      }
      return error.shortMessage
    }

    // Fall back to regular message
    if (error.message) {
      for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
        if (error.message.toLowerCase().includes(key.toLowerCase())) {
          return message
        }
      }
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message

    for (const [key, friendlyMessage] of Object.entries(ERROR_MESSAGES)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return friendlyMessage
      }
    }

    return message
  }

  // Handle string errors
  if (typeof error === 'string') {
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }
    return error
  }

  return 'An unexpected error occurred. Please try again'
}

/**
 * Format error for logging
 * @param error - Error object
 * @returns Formatted error string for logs
 */
export function formatErrorForLog(error: unknown): string {
  if (error instanceof BaseError) {
    return `${error.name}: ${error.message}`
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`
  }

  return String(error)
}

/**
 * Check if error is a user rejection
 * @param error - Error object
 * @returns True if user rejected the transaction
 */
export function isUserRejectionError(error: unknown): boolean {
  if (error instanceof BaseError) {
    const message = error.message.toLowerCase()
    return message.includes('user rejected') ||
           message.includes('user denied') ||
           message.includes('user cancelled')
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('user rejected') ||
           message.includes('user denied') ||
           message.includes('user cancelled')
  }

  return false
}

/**
 * Check if error is a network error
 * @param error - Error object
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof BaseError) {
    const message = error.message.toLowerCase()
    return message.includes('network') ||
           message.includes('chain') ||
           message.includes('rpc')
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('network') ||
           message.includes('chain') ||
           message.includes('rpc')
  }

  return false
}

/**
 * Check if error is insufficient funds/balance error
 * @param error - Error object
 * @returns True if error is balance-related
 */
export function isInsufficientFundsError(error: unknown): boolean {
  if (error instanceof BaseError) {
    const message = error.message.toLowerCase()
    return message.includes('insufficient') ||
           message.includes('balance')
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return message.includes('insufficient') ||
           message.includes('balance')
  }

  return false
}

/**
 * Get error category for analytics/logging
 * @param error - Error object
 * @returns Error category
 */
export function getErrorCategory(error: unknown): string {
  if (isUserRejectionError(error)) return 'USER_REJECTION'
  if (isNetworkError(error)) return 'NETWORK_ERROR'
  if (isInsufficientFundsError(error)) return 'INSUFFICIENT_FUNDS'

  if (error instanceof BaseError) {
    return error.name || 'UNKNOWN_ERROR'
  }

  if (error instanceof Error) {
    return error.name || 'UNKNOWN_ERROR'
  }

  return 'UNKNOWN_ERROR'
}
