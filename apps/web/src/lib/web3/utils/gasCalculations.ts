/**
 * Gas calculation utilities
 * Convert gas costs from wei to USD and calculate platform fees
 */

import { formatEther } from 'viem';

/**
 * Convert gas cost in wei to USD
 * @param gasCostWei - Gas cost in wei
 * @param nativeTokenPriceUsd - Current native token price in USD (ETH/MATIC/etc)
 * @returns Formatted USD string
 */
export function gasWeiToUSD(gasCostWei: bigint, nativeTokenPriceUsd: number): string {
  const ethAmount = formatEther(gasCostWei);
  const usdAmount = parseFloat(ethAmount) * nativeTokenPriceUsd;
  return usdAmount.toFixed(2);
}

/**
 * Calculate platform fee from contribution amount
 * @param amount - Contribution amount in token units (bigint)
 * @param feeBasisPoints - Platform fee in basis points (e.g., 500 = 5%)
 * @returns Platform fee amount (bigint)
 */
export function calculatePlatformFee(amount: bigint, feeBasisPoints: bigint): bigint {
  return (amount * feeBasisPoints) / 10000n;
}

/**
 * Calculate total contribution cost including fees
 * @param amount - Contribution amount in token units (bigint)
 * @param feeBasisPoints - Platform fee in basis points
 * @returns Object with breakdown of costs
 */
export function calculateContributionBreakdown(
  amount: bigint,
  feeBasisPoints: bigint
): {
  contribution: bigint;
  platformFee: bigint;
  total: bigint;
} {
  const platformFee = calculatePlatformFee(amount, feeBasisPoints);
  return {
    contribution: amount,
    platformFee,
    total: amount + platformFee,
  };
}
