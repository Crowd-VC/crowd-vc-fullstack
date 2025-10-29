/**
 * useRegisterUser Hook
 * Register a new user (Startup or Investor) in the CrowdVC Factory contract
 */

'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { CrowdVCFactoryABI, UserType } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { parseContractError } from '../../utils/errors'
import { GAS_LIMITS } from '../../utils/constants'

export type UseRegisterUserParams = {
  userType: UserType.Startup | UserType.Investor
  metadataURI: string
}

export function useRegisterUser() {
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
   * Register user on-chain
   * @param params - Registration parameters
   */
  const registerUser = async (params: UseRegisterUserParams) => {
    try {
      const factoryAddress = getFactoryAddress(chainId)

      return writeContract({
        address: factoryAddress,
        abi: CrowdVCFactoryABI,
        functionName: 'registerUser',
        args: [params.userType, params.metadataURI],
        gas: GAS_LIMITS.REGISTER_USER
      })
    } catch (error) {
      console.error('Failed to register user:', error)
      throw error
    }
  }

  // Parse error for user-friendly message
  const error = writeError || receiptError
  const errorMessage = error ? parseContractError(error) : undefined

  return {
    registerUser,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error: errorMessage,
    reset
  }
}
