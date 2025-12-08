/**
 * useEndVoting Hook
 * End voting for a pool on-chain, determining winners
 */

'use client';

import { useCallback } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { CrowdVCPoolABI } from '@crowd-vc/abis';
import {
  parseContractError,
  getErrorAction,
  isUserRejectionError,
} from '../../utils/errors';
import { GAS_LIMITS } from '../../utils/constants';

export function useEndVoting() {
  const chainId = useChainId();

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

  const endVoting = useCallback(
    async (poolAddress: `0x${string}`) => {
      try {
        return await writeContractAsync({
          address: poolAddress,
          abi: CrowdVCPoolABI,
          functionName: 'endVoting',
          gas: GAS_LIMITS.END_VOTING,
        });
      } catch (error) {
        console.error('Failed to end voting:', error);
        throw error;
      }
    },
    [writeContractAsync],
  );

  const error = writeError || receiptError;
  const errorMessage = error ? parseContractError(error) : undefined;
  const errorAction = error ? getErrorAction(error) : null;
  const isUserRejection = error ? isUserRejectionError(error) : false;

  return {
    endVoting,
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
