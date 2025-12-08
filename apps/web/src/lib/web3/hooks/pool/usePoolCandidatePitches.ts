/**
 * usePoolCandidatePitches Hook
 * Fetch candidate pitches (startups) from a CrowdVCPool contract
 */

'use client';

import { useReadContract, useChainId } from 'wagmi';
import { CrowdVCPoolABI } from '@crowd-vc/abis';
import { CACHE_DURATIONS } from '../../utils/constants';

export function usePoolCandidatePitches(poolAddress?: `0x${string}`) {
  const chainId = useChainId();

  const result = useReadContract({
    address: poolAddress,
    abi: CrowdVCPoolABI,
    functionName: 'getCandidatePitches',
    query: {
      enabled: !!poolAddress,
      staleTime: CACHE_DURATIONS.SHORT,
      refetchOnWindowFocus: true,
    },
  });

  const pitchIds = result.data as readonly `0x${string}`[] | undefined;

  return {
    pitchIds: pitchIds || [],
    count: pitchIds?.length || 0,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasPitches: (pitchIds?.length || 0) > 0,
  };
}
