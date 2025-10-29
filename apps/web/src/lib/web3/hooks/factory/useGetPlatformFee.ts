/**
 * useGetPlatformFee Hook
 * Fetch platform fee from CrowdVC Factory contract
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { CrowdVCFactoryABI } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS, BASIS_POINTS_DENOMINATOR } from '../../utils/constants'

export function useGetPlatformFee() {
  const chainId = useChainId()

  const result = useReadContract({
    address: getFactoryAddress(chainId),
    abi: CrowdVCFactoryABI,
    functionName: 'getPlatformFee',
    query: {
      // Cache for 5 minutes (static data)
      staleTime: CACHE_DURATIONS.LONG,
      // No need to refetch this often
      refetchOnWindowFocus: false
    }
  })

  const feeBasisPoints = result.data as bigint | undefined

  // Convert basis points to percentage
  const feePercentage = feeBasisPoints
    ? Number(feeBasisPoints) / Number(BASIS_POINTS_DENOMINATOR) * 100
    : undefined

  return {
    feeBasisPoints,
    feePercentage,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch
  }
}
