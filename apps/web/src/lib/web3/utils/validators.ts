/**
 * Validation utilities for Web3 inputs
 * Handles address validation, amount validation, etc.
 */

import { isAddress, parseUnits, type Address } from 'viem'

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: boolean
  error?: string
}

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns Validation result
 */
export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return { valid: false, error: 'Address is required' }
  }

  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' }
  }

  return { valid: true }
}

/**
 * Validate token amount
 * @param amount - Amount to validate (string)
 * @param minAmount - Minimum allowed amount (string)
 * @param maxAmount - Maximum allowed amount (string, optional)
 * @param decimals - Token decimals (default: 6)
 * @returns Validation result
 */
export function validateAmount(
  amount: string,
  minAmount: string,
  maxAmount?: string,
  decimals: number = 6
): ValidationResult {
  if (!amount || amount.trim() === '') {
    return { valid: false, error: 'Amount is required' }
  }

  // Check if amount is a valid number
  const numAmount = parseFloat(amount)
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be a positive number' }
  }

  try {
    const amountBigInt = parseUnits(amount, decimals)
    const minBigInt = parseUnits(minAmount, decimals)

    if (amountBigInt < minBigInt) {
      return { valid: false, error: `Minimum amount is ${minAmount}` }
    }

    if (maxAmount) {
      const maxBigInt = parseUnits(maxAmount, decimals)
      if (amountBigInt > maxBigInt) {
        return { valid: false, error: `Maximum amount is ${maxAmount}` }
      }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid amount format' }
  }
}

/**
 * Validate amount against user balance
 * @param amount - Amount to validate
 * @param balance - User's balance
 * @param decimals - Token decimals
 * @returns Validation result
 */
export function validateBalance(
  amount: string,
  balance: bigint,
  decimals: number = 6
): ValidationResult {
  if (!amount) {
    return { valid: false, error: 'Amount is required' }
  }

  try {
    const amountBigInt = parseUnits(amount, decimals)

    if (amountBigInt > balance) {
      return { valid: false, error: 'Insufficient balance' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid amount format' }
  }
}

/**
 * Validate pitch title
 * @param title - Pitch title
 * @param minLength - Minimum length (default: 5)
 * @param maxLength - Maximum length (default: 100)
 * @returns Validation result
 */
export function validatePitchTitle(
  title: string,
  minLength: number = 5,
  maxLength: number = 100
): ValidationResult {
  if (!title || title.trim() === '') {
    return { valid: false, error: 'Title is required' }
  }

  const trimmed = title.trim()

  if (trimmed.length < minLength) {
    return { valid: false, error: `Title must be at least ${minLength} characters` }
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `Title must not exceed ${maxLength} characters` }
  }

  return { valid: true }
}

/**
 * Validate IPFS hash
 * @param hash - IPFS hash to validate
 * @returns Validation result
 */
export function validateIPFSHash(hash: string): ValidationResult {
  if (!hash || hash.trim() === '') {
    return { valid: false, error: 'IPFS hash is required' }
  }

  // Basic IPFS hash format validation (CID v0 and v1)
  const cidV0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/
  const cidV1Pattern = /^[a-z2-7]{59}$/

  if (!cidV0Pattern.test(hash) && !cidV1Pattern.test(hash)) {
    return { valid: false, error: 'Invalid IPFS hash format' }
  }

  return { valid: true }
}

/**
 * Validate metadata URI
 * @param uri - Metadata URI (IPFS or HTTP)
 * @returns Validation result
 */
export function validateMetadataURI(uri: string): ValidationResult {
  if (!uri || uri.trim() === '') {
    return { valid: false, error: 'Metadata URI is required' }
  }

  const trimmed = uri.trim()

  // Check if it's a valid IPFS or HTTP(S) URL
  const ipfsPattern = /^ipfs:\/\/.+/
  const httpPattern = /^https?:\/\/.+/

  if (!ipfsPattern.test(trimmed) && !httpPattern.test(trimmed)) {
    return { valid: false, error: 'URI must be a valid IPFS or HTTP(S) URL' }
  }

  return { valid: true }
}

/**
 * Validate deadline timestamp
 * @param deadline - Deadline timestamp (seconds)
 * @param minFutureTime - Minimum time in future (seconds, default: 3600 = 1 hour)
 * @returns Validation result
 */
export function validateDeadline(
  deadline: bigint | number,
  minFutureTime: number = 3600
): ValidationResult {
  const numDeadline = typeof deadline === 'bigint' ? Number(deadline) : deadline
  const now = Math.floor(Date.now() / 1000)

  if (numDeadline <= now) {
    return { valid: false, error: 'Deadline must be in the future' }
  }

  if (numDeadline < now + minFutureTime) {
    const hours = minFutureTime / 3600
    return { valid: false, error: `Deadline must be at least ${hours} hour(s) in the future` }
  }

  return { valid: true }
}

/**
 * Validate chain ID
 * @param chainId - Chain ID to validate
 * @param supportedChainIds - Array of supported chain IDs
 * @returns Validation result
 */
export function validateChainId(
  chainId: number,
  supportedChainIds: number[]
): ValidationResult {
  if (!supportedChainIds.includes(chainId)) {
    return {
      valid: false,
      error: `Unsupported network. Please switch to a supported network.`
    }
  }

  return { valid: true }
}

/**
 * Validate transaction hash
 * @param hash - Transaction hash
 * @returns Validation result
 */
export function validateTxHash(hash: string): ValidationResult {
  if (!hash || hash.trim() === '') {
    return { valid: false, error: 'Transaction hash is required' }
  }

  // Ethereum transaction hash pattern (0x + 64 hex characters)
  const txHashPattern = /^0x[a-fA-F0-9]{64}$/

  if (!txHashPattern.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash format' }
  }

  return { valid: true }
}
