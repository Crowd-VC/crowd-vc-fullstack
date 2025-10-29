/**
 * Formatting utilities for Web3 data
 * Handles addresses, amounts, timestamps, etc.
 */

import { formatUnits, type Address } from 'viem'

/**
 * Format a wallet address to shortened form
 * @param address - Full wallet address
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(
  address: string | Address,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return ''
  if (address.length < startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format a pitch ID (bytes32) to shortened form
 * @param pitchId - Full pitch ID
 * @returns Formatted pitch ID
 */
export function formatPitchId(pitchId: string): string {
  if (!pitchId) return ''
  return `${pitchId.slice(0, 10)}...${pitchId.slice(-8)}`
}

/**
 * Format token amount from wei to human-readable form
 * @param amount - Amount in wei (bigint)
 * @param decimals - Token decimals (default: 6 for USDT/USDC)
 * @param displayDecimals - Number of decimals to display (default: 2)
 * @returns Formatted amount as string
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = 6,
  displayDecimals: number = 2
): string {
  const formatted = formatUnits(amount, decimals)
  const num = parseFloat(formatted)
  return num.toLocaleString('en-US', {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals
  })
}

/**
 * Format token amount with symbol
 * @param amount - Amount in wei (bigint)
 * @param symbol - Token symbol (e.g., "USDT")
 * @param decimals - Token decimals
 * @returns Formatted amount with symbol (e.g., "1,234.56 USDT")
 */
export function formatTokenAmountWithSymbol(
  amount: bigint,
  symbol: string,
  decimals: number = 6
): string {
  const formatted = formatTokenAmount(amount, decimals)
  return `${formatted} ${symbol}`
}

/**
 * Format percentage
 * @param value - Percentage value (0-100 or 0-10000 for basis points)
 * @param isBasisPoints - Whether value is in basis points
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string (e.g., "5.00%")
 */
export function formatPercentage(
  value: bigint | number,
  isBasisPoints: boolean = false,
  decimals: number = 2
): string {
  const numValue = typeof value === 'bigint' ? Number(value) : value
  const percentage = isBasisPoints ? numValue / 100 : numValue
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format Unix timestamp to readable date
 * @param timestamp - Unix timestamp (seconds)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: bigint | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const date = new Date(numTimestamp * 1000)

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }

  return date.toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format Unix timestamp to date and time
 * @param timestamp - Unix timestamp (seconds)
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: bigint | number): string {
  const numTimestamp = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const date = new Date(numTimestamp * 1000)

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format time remaining until a deadline
 * @param deadline - Unix timestamp (seconds)
 * @returns Human-readable time remaining (e.g., "3 days", "5 hours")
 */
export function formatTimeRemaining(deadline: bigint | number): string {
  const numDeadline = typeof deadline === 'bigint' ? Number(deadline) : deadline
  const now = Math.floor(Date.now() / 1000)
  const diff = numDeadline - now

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return 'Less than a minute'
}

/**
 * Format large numbers with suffixes (K, M, B)
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number with suffix
 */
export function formatCompactNumber(value: bigint | number, decimals: number = 1): string {
  const numValue = typeof value === 'bigint' ? Number(value) : value

  if (numValue >= 1_000_000_000) {
    return `${(numValue / 1_000_000_000).toFixed(decimals)}B`
  }
  if (numValue >= 1_000_000) {
    return `${(numValue / 1_000_000).toFixed(decimals)}M`
  }
  if (numValue >= 1_000) {
    return `${(numValue / 1_000).toFixed(decimals)}K`
  }
  return numValue.toFixed(decimals)
}

/**
 * Format transaction hash to shortened form
 * @param hash - Transaction hash
 * @returns Formatted hash
 */
export function formatTxHash(hash: string): string {
  if (!hash) return ''
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}
