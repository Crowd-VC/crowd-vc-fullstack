/**
 * useVote Hook
 * Cast a vote for a pitch in a CrowdVC pool
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CrowdVCPoolABI } from "@crowd-vc/abis";
import { toast } from "sonner";
import {
  getErrorAction,
  isUserRejectionError,
  parseContractError,
} from "../../utils/errors";
import { GAS_LIMITS } from "../../utils/constants";
import { getPitchIdAsBytes32 } from "../../utils/pitchId";

export type VoteStatus =
  | "idle"
  | "pending"
  | "confirming"
  | "success"
  | "error";

export function useVote(
  poolAddress: `0x${string}` | undefined,
  onSuccess?: () => void,
) {
  const { address } = useAccount();
  const [status, setStatus] = useState<VoteStatus>("idle");

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

  // Update status based on state
  useEffect(() => {
    if (isPending) {
      setStatus("pending");
    } else if (isConfirming) {
      setStatus("confirming");
    } else if (isSuccess) {
      setStatus("success");
    } else if (writeError || receiptError) {
      setStatus("error");
    }
  }, [isPending, isConfirming, isSuccess, writeError, receiptError]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Vote cast successfully!", {
        description: "Your vote has been recorded on-chain.",
      });
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  // Handle errors
  useEffect(() => {
    const error = writeError || receiptError;
    if (error) {
      const errorMessage = parseContractError(error);
      const isRejection = isUserRejectionError(error);

      if (isRejection) {
        toast.info("Transaction cancelled", {
          description: "You cancelled the transaction.",
        });
      } else {
        toast.error("Voting failed", {
          description: errorMessage,
        });
      }
    }
  }, [writeError, receiptError]);

  const vote = useCallback(
    async (pitchId: string) => {
      if (!poolAddress) {
        toast.error("Pool address not available", {
          description: "Please wait for the pool data to load.",
        });
        return;
      }

      if (!address) {
        toast.error("Wallet not connected", {
          description: "Please connect your wallet to vote.",
        });
        return;
      }

      setStatus("pending");

      try {
        // Convert pitch ID to bytes32 format
        const pitchIdBytes32 = getPitchIdAsBytes32(pitchId);

        const txHash = await writeContractAsync({
          address: poolAddress,
          abi: CrowdVCPoolABI,
          functionName: "vote",
          args: [pitchIdBytes32],
        });

        toast.loading("Processing vote...", {
          description: "Waiting for transaction confirmation.",
          id: "vote-tx",
        });

        return txHash;
      } catch (error) {
        setStatus("error");
        console.error("Failed to vote:", error);
        // Error is handled by useEffect above
        throw error;
      }
    },
    [poolAddress, address, writeContractAsync],
  );

  // Dismiss loading toast when confirmed
  useEffect(() => {
    if (isSuccess || writeError || receiptError) {
      toast.dismiss("vote-tx");
    }
  }, [isSuccess, writeError, receiptError]);

  const error = writeError || receiptError;
  const errorMessage = error ? parseContractError(error) : undefined;
  const errorAction = error ? getErrorAction(error) : null;
  const isUserRejection = error ? isUserRejectionError(error) : false;

  return {
    vote,
    hash,
    status,
    isPending,
    isConfirming,
    isLoading: isPending || isConfirming,
    isSuccess,
    error: errorMessage,
    errorAction,
    isUserRejection,
    reset: () => {
      reset();
      setStatus("idle");
    },
  };
}
