/**
 * usePitchesData Hook
 * Batch fetch pitch data from Factory contract using useReadContracts
 * @see https://wagmi.sh/react/api/hooks/useReadContracts
 */

'use client';

import { useMemo } from 'react';
import { useReadContracts, useChainId } from 'wagmi';
import { CrowdVCFactoryABI, type PitchData, PitchStatus } from '@crowd-vc/abis';
import { getFactoryAddress } from '../../config/contracts';
import { CACHE_DURATIONS } from '../../utils/constants';

export type { PitchData, PitchStatus };

export function usePitchesData(pitchIds: `0x${string}`[]) {
  const chainId = useChainId();
  const factoryAddress = getFactoryAddress(chainId);

  // Build contract read configurations for all pitches
  const contracts = useMemo(() => {
    if (!pitchIds.length) return [];

    return pitchIds.map((pitchId) => ({
      address: factoryAddress,
      abi: CrowdVCFactoryABI,
      functionName: 'getPitchData' as const,
      args: [pitchId] as const,
    }));
  }, [pitchIds, factoryAddress]);

  const result = useReadContracts({
    contracts,
    query: {
      enabled: pitchIds.length > 0,
      staleTime: CACHE_DURATIONS.SHORT,
      refetchOnWindowFocus: true,
    },
  });

  // Transform results into structured data
  const pitches = useMemo(() => {
    if (!result.data || !pitchIds.length) return [];

    return result.data
      .map((res, index) => {
        if (res.status !== 'success' || !res.result) return null;

        // The result is a tuple from the contract
        const data = res.result as readonly [
          `0x${string}`, // pitchId
          `0x${string}`, // startup
          string, // title
          string, // ipfsHash
          bigint, // fundingGoal
          number, // status
          bigint, // submittedAt
          bigint, // approvedAt
        ];

        return {
          pitchId: data[0],
          startup: data[1],
          title: data[2],
          ipfsHash: data[3],
          fundingGoal: data[4],
          status: data[5] as PitchStatus,
          submittedAt: data[6],
          approvedAt: data[7],
        } as PitchData;
      })
      .filter((pitch): pitch is PitchData => pitch !== null);
  }, [result.data, pitchIds]);

  return {
    pitches,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

/**
 * Map on-chain pitch status to string
 */
export function mapPitchStatusToString(status: PitchStatus): string {
  switch (status) {
    case PitchStatus.Pending:
      return 'pending';
    case PitchStatus.UnderReview:
      return 'under_review';
    case PitchStatus.Approved:
      return 'approved';
    case PitchStatus.Rejected:
      return 'rejected';
    case PitchStatus.InPool:
      return 'in-pool';
    case PitchStatus.Funded:
      return 'funded';
    default:
      return 'unknown';
  }
}
