/**
 * usePoolsWithDetails Hook
 * Batch fetch pool details from multiple pool contracts using useReadContracts
 * @see https://wagmi.sh/react/api/hooks/useReadContracts
 */

'use client';

import { useMemo } from 'react';
import { useReadContracts, useChainId } from 'wagmi';
import { CrowdVCPoolABI, type PoolInfo, PoolStatus } from '@crowd-vc/abis';
import { CACHE_DURATIONS } from '../../utils/constants';

export type PoolWithDetails = {
  address: `0x${string}`;
  info: PoolInfo | null;
  candidatePitchCount: number;
};

export function usePoolsWithDetails(poolAddresses: `0x${string}`[]) {
  const chainId = useChainId();

  // Build contract read configurations for all pools
  const contracts = useMemo(() => {
    if (!poolAddresses.length) return [];

    const reads: {
      address: `0x${string}`;
      abi: typeof CrowdVCPoolABI;
      functionName: string;
    }[] = [];

    poolAddresses.forEach((poolAddress) => {
      // Get pool info
      reads.push({
        address: poolAddress,
        abi: CrowdVCPoolABI,
        functionName: 'getPoolInfo',
      });
      // Get candidate pitches count
      reads.push({
        address: poolAddress,
        abi: CrowdVCPoolABI,
        functionName: 'getCandidatePitches',
      });
    });

    return reads;
  }, [poolAddresses]);

  const result = useReadContracts({
    contracts,
    query: {
      enabled: poolAddresses.length > 0,
      staleTime: CACHE_DURATIONS.MEDIUM,
      refetchOnWindowFocus: true,
    },
  });

  // Transform results into structured data
  const pools = useMemo(() => {
    if (!result.data || !poolAddresses.length) return [];

    const poolsData: PoolWithDetails[] = [];

    poolAddresses.forEach((address, index) => {
      const infoResult = result.data[index * 2];
      const pitchesResult = result.data[index * 2 + 1];

      const info =
        infoResult?.status === 'success'
          ? (infoResult.result as PoolInfo)
          : null;
      const pitches =
        pitchesResult?.status === 'success'
          ? (pitchesResult.result as readonly `0x${string}`[])
          : [];

      poolsData.push({
        address,
        info,
        candidatePitchCount: pitches.length,
      });
    });

    return poolsData;
  }, [result.data, poolAddresses]);

  return {
    pools,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Map on-chain pool status to frontend status string
 */
export function mapPoolStatus(
  onChainStatus: PoolStatus,
): 'active' | 'closed' | 'upcoming' {
  switch (onChainStatus) {
    case PoolStatus.Active:
      return 'active';
    case PoolStatus.VotingEnded:
    case PoolStatus.Funded:
    case PoolStatus.Closed:
    case PoolStatus.Failed:
      return 'closed';
    default:
      return 'upcoming';
  }
}
