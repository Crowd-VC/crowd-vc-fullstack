/**
 * useTokenAllowance Hook
 * Check ERC20 token allowance for a spender
 */

'use client'

import { useReadContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { type Address } from 'viem'
import { ERC20ABI } from '@crowd-vc/abis'
import { type SupportedToken, getTokenDecimals } from '../../config/tokens'
import { getUSDTAddress, getUSDCAddress } from '../../config/contracts'
import { formatTokenAmount } from '../../utils/formatters'
import { CACHE_DURATIONS } from '../../utils/constants'

/**
 * Get token contract address based on token type
 */
function getTokenAddress(chainId: number, token: SupportedToken): Address {
  if (token === 'USDT') {
    return getUSDTAddress(chainId)
  }
  return getUSDCAddress(chainId)
}

export function useTokenAllowance(
  owner?: Address,
  spender?: Address,
  token?: SupportedToken
) {
  const chainId = useChainId()

  const tokenAddress = owner && spender && token ? getTokenAddress(chainId, token) : undefined

  const result = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: owner && spender ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!spender && !!token,
      // Cache for 30 seconds
      staleTime: CACHE_DURATIONS.SHORT,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  const allowance = result.data as bigint | undefined

  // Format allowance for display
  const formattedAllowance = allowance && token
    ? formatTokenAmount(allowance, getTokenDecimals(token))
    : '0.00'

  /**
   * Check if allowance is sufficient for a given amount
   */
  const hasSufficientAllowance = (amount: bigint): boolean => {
    return allowance ? allowance >= amount : false
  }

  return {
    allowance,
    formattedAllowance,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasAllowance: allowance ? allowance > 0n : false,
    hasSufficientAllowance
  }
}
