/**
 * Token symbol resolver utility
 * Map token addresses to symbols (USDT/USDC)
 */

'use client';

import { getUSDTAddress, getUSDCAddress } from '../config/contracts';
import type { SupportedToken } from '../config/tokens';

/**
 * Get token symbol from contract address
 * @param address - Token contract address
 * @param chainId - Chain ID
 * @returns Token symbol or 'UNKNOWN'
 */
export function getTokenSymbolFromAddress(
  address: `0x${string}`,
  chainId: number
): SupportedToken | 'UNKNOWN' {
  try {
    const usdtAddress = getUSDTAddress(chainId).toLowerCase();
    const usdcAddress = getUSDCAddress(chainId).toLowerCase();
    const targetAddress = address.toLowerCase();

    if (targetAddress === usdtAddress) return 'USDT';
    if (targetAddress === usdcAddress) return 'USDC';

    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Check if token address is a supported stablecoin
 * @param address - Token contract address
 * @param chainId - Chain ID
 * @returns True if token is USDT or USDC
 */
export function isSupportedToken(
  address: `0x${string}`,
  chainId: number
): boolean {
  return getTokenSymbolFromAddress(address, chainId) !== 'UNKNOWN';
}
