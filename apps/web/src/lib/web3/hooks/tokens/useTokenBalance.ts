/**
 * useTokenBalance Hook
 * Fetch ERC20 token balance for an address
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

export function useTokenBalance(address?: Address, token?: SupportedToken) {
  const chainId = useChainId()

  const tokenAddress = address && token ? getTokenAddress(chainId, token) : undefined

  const result = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!token,
      // Cache for 30 seconds
      staleTime: CACHE_DURATIONS.SHORT,
      // Refetch on window focus
      refetchOnWindowFocus: true
    }
  })

  const balance = result.data as bigint | undefined

  // Format balance for display
  const formattedBalance = balance && token
    ? formatTokenAmount(balance, getTokenDecimals(token))
    : '0.00'

  return {
    balance,
    formattedBalance,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasBalance: balance ? balance > 0n : false
  }
}
