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
import { parseContractError } from '../../utils/errors'
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
   * Approve token spending
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

  // Parse error for user-friendly message
  const error = writeError || receiptError
  const errorMessage = error ? parseContractError(error) : undefined

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error: errorMessage,
    reset
  }
}
