/**
 * Supported token configuration
 * CrowdVC supports USDT and USDC stablecoins
 */

/**
 * Token configuration constants
 */
export const TOKEN_CONFIG = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    description: 'Tether stablecoin pegged to USD',
    icon: '/icons/usdt.svg'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    description: 'Circle stablecoin pegged to USD',
    icon: '/icons/usdc.svg'
  }
} as const

/**
 * Supported token type
 */
export type SupportedToken = keyof typeof TOKEN_CONFIG

/**
 * Array of supported tokens for iteration
 */
export const SUPPORTED_TOKENS: SupportedToken[] = ['USDT', 'USDC']

/**
 * Get token configuration
 */
export function getTokenConfig(token: SupportedToken) {
  return TOKEN_CONFIG[token]
}

/**
 * Get token symbol
 */
export function getTokenSymbol(token: SupportedToken): string {
  return TOKEN_CONFIG[token].symbol
}

/**
 * Get token name
 */
export function getTokenName(token: SupportedToken): string {
  return TOKEN_CONFIG[token].name
}

/**
 * Get token decimals
 */
export function getTokenDecimals(token: SupportedToken): number {
  return TOKEN_CONFIG[token].decimals
}

/**
 * Check if a string is a valid token symbol
 */
export function isValidToken(symbol: string): symbol is SupportedToken {
  return symbol === 'USDT' || symbol === 'USDC'
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(amount: number | string, token: SupportedToken): string {
  const decimals = getTokenDecimals(token)
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toFixed(decimals)
}

/**
 * Token selection options for UI
 */
export const TOKEN_OPTIONS = SUPPORTED_TOKENS.map((token) => ({
  value: token,
  label: TOKEN_CONFIG[token].symbol,
  name: TOKEN_CONFIG[token].name,
  icon: TOKEN_CONFIG[token].icon
}))
