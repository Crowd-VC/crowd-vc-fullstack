/**
 * useGetUserPitches Hook
 * Fetch all pitch IDs for a user from CrowdVC Factory contract
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { type Address } from 'viem'
import { CrowdVCFactoryABI } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS } from '../../utils/constants'

export function useGetUserPitches(address?: Address) {
  const chainId = useChainId()

  const result = useReadContract({
    address: address ? getFactoryAddress(chainId) : undefined,
    abi: CrowdVCFactoryABI,
    functionName: 'getUserPitches',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      // Cache for 30 seconds
      staleTime: CACHE_DURATIONS.SHORT,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  const pitchIds = result.data as readonly `0x${string}`[] | undefined

  return {
    pitchIds: pitchIds || [],
    count: pitchIds?.length || 0,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasPitches: (pitchIds?.length || 0) > 0
  }
}
