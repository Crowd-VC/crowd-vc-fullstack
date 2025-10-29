/**
 * useSubmitPitch Hook
 * Submit a new pitch to the CrowdVC Factory contract
 */

'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { CrowdVCFactoryABI } from '@crowd-vc/abis'
import { getFactoryAddress } from '../../config/contracts'
import { parseContractError } from '../../utils/errors'
import { validatePitchTitle, validateIPFSHash } from '../../utils/validators'
import { GAS_LIMITS, DECIMALS } from '../../utils/constants'

export type UseSubmitPitchParams = {
  title: string
  ipfsHash: string
  fundingGoal: string // String for UI input, will be converted to bigint
}

export function useSubmitPitch() {
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
   * Submit pitch on-chain
   * @param params - Pitch parameters
   */
  const submitPitch = async (params: UseSubmitPitchParams) => {
    // Validate inputs
    const titleValidation = validatePitchTitle(params.title)
    if (!titleValidation.valid) {
      throw new Error(titleValidation.error)
    }

    const ipfsValidation = validateIPFSHash(params.ipfsHash)
    if (!ipfsValidation.valid) {
      throw new Error(ipfsValidation.error)
    }

    try {
      const factoryAddress = getFactoryAddress(chainId)

      // Convert funding goal to bigint with proper decimals (6 for USDC/USDT)
      const fundingGoalBigInt = parseUnits(params.fundingGoal, DECIMALS.USDC)

      return writeContract({
        address: factoryAddress,
        abi: CrowdVCFactoryABI,
        functionName: 'submitPitch',
        args: [params.title, params.ipfsHash, fundingGoalBigInt],
        gas: GAS_LIMITS.SUBMIT_PITCH
      })
    } catch (error) {
      console.error('Failed to submit pitch:', error)
      throw error
    }
  }

  // Parse error for user-friendly message
  const error = writeError || receiptError
  const errorMessage = error ? parseContractError(error) : undefined

  return {
    submitPitch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isLoading: isPending || isConfirming,
    error: errorMessage,
    reset
  }
}
