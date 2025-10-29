/**
 * useIsPitchApproved Hook
 * Check if a pitch is approved
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { CrowdVCFactoryABI } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS } from '../../utils/constants'

export function useIsPitchApproved(pitchId?: `0x${string}`) {
  const chainId = useChainId()

  const result = useReadContract({
    address: pitchId ? getFactoryAddress(chainId) : undefined,
    abi: CrowdVCFactoryABI,
    functionName: 'isPitchApproved',
    args: pitchId ? [pitchId] : undefined,
    query: {
      enabled: !!pitchId,
      // Cache for 1 minute
      staleTime: CACHE_DURATIONS.MEDIUM,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  return {
    isApproved: result.data === true,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}
