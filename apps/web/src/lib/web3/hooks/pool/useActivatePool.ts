/**
 * useActivatePool Hook
 * Activate a pool on-chain via the Factory contract
 * Note: Pool activation enables contributions. Pools start as Active after creation.
 */

'use client';

import { useCallback } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { CrowdVCFactoryABI } from '@crowd-vc/abis';
import { getFactoryAddress } from '../../config/contracts';
import {
  parseContractError,
  getErrorAction,
  isUserRejectionError,
} from '../../utils/errors';

export function useActivatePool() {
  const chainId = useChainId();
  const factoryAddress = getFactoryAddress(chainId);

  const {
    writeContractAsync,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const activatePool = useCallback(
    async (poolAddress: `0x${string}`) => {
      try {
        return await writeContractAsync({
          address: factoryAddress,
          abi: CrowdVCFactoryABI,
          functionName: 'activatePool',
          args: [poolAddress],
        });
      } catch (error) {
        console.error('Failed to activate pool:', error);
        throw error;
      }
    },
    [factoryAddress, writeContractAsync],
  );

  const error = writeError || receiptError;
  const errorMessage = error ? parseContractError(error) : undefined;
  const errorAction = error ? getErrorAction(error) : null;
  const isUserRejection = error ? isUserRejectionError(error) : false;

  return {
    activatePool,
    hash,
    isPending,
    isConfirming,
    isLoading: isPending || isConfirming,
    isSuccess,
    error: errorMessage,
    errorAction,
    isUserRejection,
    reset,
  };
}
