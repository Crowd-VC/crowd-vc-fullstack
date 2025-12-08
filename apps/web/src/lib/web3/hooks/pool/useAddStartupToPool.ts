/**
 * useAddStartupToPool Hook
 * Add a startup (pitch) to a pool on-chain via the Factory contract
 */

"use client";

import { useCallback } from "react";
import {
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CrowdVCFactoryABI } from "@crowd-vc/abis";
import { getFactoryAddress } from "../../config/contracts";
import {
  getErrorAction,
  isUserRejectionError,
  parseContractError,
} from "../../utils/errors";
import { GAS_LIMITS } from "../../utils/constants";

export type AddStartupToPoolParams = {
  poolAddress: `0x${string}`;
  pitchId: `0x${string}`;
  startupWallet: `0x${string}`;
};

export function useAddStartupToPool() {
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

  const addStartupToPool = useCallback(
    async (addParams: AddStartupToPoolParams) => {
      try {
        return await writeContractAsync({
          address: factoryAddress,
          abi: CrowdVCFactoryABI,
          functionName: "addStartupToPool",
          args: [
            addParams.poolAddress,
            addParams.pitchId,
            addParams.startupWallet,
          ],
          gas: GAS_LIMITS.ADD_STARTUP_TO_POOL,
        });
      } catch (error) {
        console.error("Failed to add startup to pool:", error);
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
    addStartupToPool,
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
