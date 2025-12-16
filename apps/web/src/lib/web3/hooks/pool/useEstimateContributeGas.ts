/**
 * useEstimateContributeGas Hook
 * Estimate gas for contribution transactions using wagmi's simulation
 */

'use client';

import { useEstimateGas, useGasPrice } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { CrowdVCPoolABI } from '@crowd-vc/abis';
import { GAS_LIMITS } from '../../utils/constants';

export function useEstimateContributeGas(
  poolAddress?: `0x${string}`,
  amount?: bigint,
  token?: `0x${string}`,
  userAddress?: `0x${string}`
) {
  // Get current gas price
  const { data: gasPrice, isLoading: gasPriceLoading } = useGasPrice();

  // Estimate gas units needed
  const { data: gasEstimate, isLoading: gasEstimateLoading } = useEstimateGas({
    to: poolAddress,
    account: userAddress,
    data: poolAddress && amount && token
      ? encodeFunctionData({
          abi: CrowdVCPoolABI,
          functionName: 'contribute',
          args: [amount, token],
        })
      : undefined,
    query: {
      enabled: !!poolAddress && !!amount && amount > 0n && !!token && !!userAddress,
    },
  });

  // Calculate gas cost in wei
  // Fall back to GAS_LIMITS constant if estimation fails
  const effectiveGasEstimate = gasEstimate ?? GAS_LIMITS.CONTRIBUTE;
  const gasCostWei = gasPrice
    ? effectiveGasEstimate * gasPrice
    : 0n;

  return {
    gasEstimate: effectiveGasEstimate,
    gasPrice,
    gasCostWei,
    isLoading: gasPriceLoading || gasEstimateLoading,
    isEstimated: !!gasEstimate, // True if we got actual estimate vs fallback
  };
}
