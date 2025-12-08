/**
 * useRemoveStartupFromPool Hook
 * Remove a startup (pitch) from a pool on-chain via the Factory contract
 */

'use client';

import { useCallback, useState } from 'react';
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

export type RemoveStartupFromPoolParams = {
  poolAddress: `0x${string}`;
  pitchId: `0x${string}`;
};

export function useRemoveStartupFromPool() {
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

  const removeStartupFromPool = useCallback(
    async (params: RemoveStartupFromPoolParams) => {
      try {
        return await writeContractAsync({
          address: factoryAddress,
          abi: CrowdVCFactoryABI,
          functionName: 'removeStartupFromPool',
          args: [params.poolAddress, params.pitchId],
        });
      } catch (error) {
        console.error('Failed to remove startup from pool:', error);
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
    removeStartupFromPool,
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
