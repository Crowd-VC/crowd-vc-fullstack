/**
 * useTokenApproval Hook
 * Approve ERC20 token spending
 */

'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { type Address, parseUnits } from 'viem'
import { ERC20ABI } from '@crowd-vc/abis'
import { type SupportedToken, getTokenDecimals } from '../../config/tokens'
import { getUSDTAddress, getUSDCAddress } from '../../config/contracts'
import { parseContractError, getCustomError, getErrorAction, isUserRejectionError } from '../../utils/errors'
import { GAS_LIMITS, MAX_UINT256 } from '../../utils/constants'

/**
 * Get token contract address based on token type
 */
function getTokenAddress(chainId: number, token: SupportedToken): Address {
  if (token === 'USDT') {
    return getUSDTAddress(chainId)
  }
  return getUSDCAddress(chainId)
}

export type UseTokenApprovalParams = {
  spender: Address
  amount: string // String for UI input
  token: SupportedToken
  isUnlimited?: boolean // If true, approve max uint256
}

export type UseTokenApprovalByAddressParams = {
  tokenAddress: Address // Direct token contract address
  spender: Address
  amount: bigint
}

export function useTokenApproval() {
  const chainId = useChainId()

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash
  })

  /**
   * Approve token spending by symbol
   * @param params - Approval parameters
   */
  const approve = async (params: UseTokenApprovalParams) => {
    try {
      const tokenAddress = getTokenAddress(chainId, params.token)
      const decimals = getTokenDecimals(params.token)

      // Use max uint256 for unlimited approval, otherwise parse amount
      const approvalAmount = params.isUnlimited
        ? MAX_UINT256
        : parseUnits(params.amount, decimals)

      console.log('Approving token by symbol:', {
        symbol: params.token,
        resolvedAddress: tokenAddress,
        spender: params.spender,
        amount: approvalAmount.toString(),
      })

      return writeContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [params.spender, approvalAmount],
        gas: GAS_LIMITS.TOKEN_APPROVE
      })
    } catch (error) {
      console.error('Failed to approve token:', error)
      throw error
    }
  }

  /**
   * Approve token spending by direct address (bypasses symbol resolution)
   * Use this when you have the exact token address from the contract
   * @param params - Approval parameters with direct token address
   */
  const approveByAddress = async (params: UseTokenApprovalByAddressParams) => {
    try {
      console.log('Approving token by address:', {
        tokenAddress: params.tokenAddress,
        spender: params.spender,
        amount: params.amount.toString(),
      })

      return writeContract({
        address: params.tokenAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [params.spender, params.amount],
        gas: GAS_LIMITS.TOKEN_APPROVE
      })
    } catch (error) {
      console.error('Failed to approve token by address:', error)
      throw error
    }
  }

  // Parse error for user-friendly message
  const error = writeError || receiptError
  const errorMessage = error ? parseContractError(error) : undefined
  
  // Enhanced error details
  const customError = error ? getCustomError(error) : null
  const errorAction = error ? getErrorAction(error) : null
  const isUserRejection = error ? isUserRejectionError(error) : false

  return {
    approve,
    approveByAddress,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error: errorMessage,
    errorName: customError?.name,
    errorAction,
    isUserRejection,
    reset
  }
}
