/**
 * usePoolInfo Hook
 * Fetch pool information from CrowdVCPool contract
 */

'use client';

import { useReadContract, useChainId } from 'wagmi';
import { CrowdVCPoolABI, type PoolInfo, PoolStatus } from '@crowd-vc/abis';
import { CACHE_DURATIONS } from '../../utils/constants';

export type { PoolInfo, PoolStatus };

export function usePoolInfo(poolAddress?: `0x${string}`) {
  const chainId = useChainId();

  const result = useReadContract({
    address: poolAddress,
    abi: CrowdVCPoolABI,
    functionName: 'getPoolInfo',
    query: {
      enabled: !!poolAddress,
      staleTime: CACHE_DURATIONS.MEDIUM,
      refetchOnWindowFocus: true,
    },
  });

  return {
    poolInfo: result.data as PoolInfo | undefined,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}
