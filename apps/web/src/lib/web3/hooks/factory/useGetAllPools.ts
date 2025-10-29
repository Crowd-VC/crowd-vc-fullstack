/**
 * useGetAllPools Hook
 * Fetch all pool addresses from CrowdVC Factory contract
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { CrowdVCFactoryABI } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS } from '../../utils/constants'

export function useGetAllPools() {
  const chainId = useChainId()

  const result = useReadContract({
    address: getFactoryAddress(chainId),
    abi: CrowdVCFactoryABI,
    functionName: 'getAllPools',
    query: {
      // Cache for 1 minute
      staleTime: CACHE_DURATIONS.MEDIUM,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  const pools = result.data as readonly `0x${string}`[] | undefined

  return {
    pools: pools || [],
    count: pools?.length || 0,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasPools: (pools?.length || 0) > 0
  }
}
