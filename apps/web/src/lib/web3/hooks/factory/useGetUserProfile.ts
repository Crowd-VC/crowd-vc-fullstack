/**
 * useGetUserProfile Hook
 * Fetch user profile data from CrowdVC Factory contract
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { type Address } from 'viem'
import { CrowdVCFactoryABI, type UserProfile } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { CACHE_DURATIONS } from '../../utils/constants'

export function useGetUserProfile(address?: Address) {
  const chainId = useChainId()

  const result = useReadContract({
    address: address ? getFactoryAddress(chainId) : undefined,
    abi: CrowdVCFactoryABI,
    functionName: 'getUserProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      // Cache for 30 seconds
      staleTime: CACHE_DURATIONS.SHORT,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  // Transform the result to match UserProfile type
  const userProfile: UserProfile | undefined = result.data
    ? {
        userType: result.data[0],
        metadataURI: result.data[1],
        registeredAt: result.data[2],
        isActive: result.data[3]
      }
    : undefined

  return {
    userProfile,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    isRegistered: userProfile ? userProfile.isActive : false,
    isStartup: userProfile ? userProfile.userType === 1 : false,
    isInvestor: userProfile ? userProfile.userType === 2 : false,
    isAdmin: userProfile ? userProfile.userType === 3 : false
  }
}
