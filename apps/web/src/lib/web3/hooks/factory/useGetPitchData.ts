/**
 * useGetPitchData Hook
 * Fetch pitch data from CrowdVC Factory contract
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { CrowdVCFactoryABI, type PitchData } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS } from '../../utils/constants'

export function useGetPitchData(pitchId?: `0x${string}`) {
  const chainId = useChainId()

  const result = useReadContract({
    address: pitchId ? getFactoryAddress(chainId) : undefined,
    abi: CrowdVCFactoryABI,
    functionName: 'getPitchData',
    args: pitchId ? [pitchId] : undefined,
    query: {
      enabled: !!pitchId,
      // Cache for 1 minute
      staleTime: CACHE_DURATIONS.MEDIUM,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  // Transform the result to match PitchData type
  const pitchData: PitchData | undefined = result.data
    ? {
        pitchId: result.data[0],
        startup: result.data[1],
        title: result.data[2],
        ipfsHash: result.data[3],
        fundingGoal: result.data[4],
        status: result.data[5],
        submittedAt: result.data[6],
        approvedAt: result.data[7]
      }
    : undefined

  return {
    pitchData,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}
