'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from 'wagmi';
import {
  CrowdVCFactoryABI,
  CROWD_VC_FACTORY_ADDRESS,
  UserType,
  PitchStatus,
} from '@crowd-vc/abis';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';
import { decodeEventLog, parseEventLogs } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

export function useRegisterUser(onSuccess?: () => void) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('User registered successfully!');
      onSuccess?.();
    }
    if (error) {
      toast.error(`Registration failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  const registerUser = (userType: UserType, metadataURI: string) => {
    writeContract({
      address: CROWD_VC_FACTORY_ADDRESS,
      abi: CrowdVCFactoryABI,
      functionName: 'registerUser',
      args: [userType, metadataURI],
    });
  };

  return {
    registerUser,
    isPending: isPending || isConfirming,
    hash,
    isSuccess,
  };
}

export function useSubmitPitch(onSuccess?: () => void) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Pitch submitted successfully!');
      onSuccess?.();
    }
    if (error) {
      toast.error(`Pitch submission failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  const submitPitch = (
    title: string,
    ipfsHash: string,
    fundingGoal: bigint,
  ) => {
    writeContract({
      address: CROWD_VC_FACTORY_ADDRESS,
      abi: CrowdVCFactoryABI,
      functionName: 'submitPitch',
      args: [title, ipfsHash, fundingGoal],
    });
  };

  return {
    submitPitch,
    isPending: isPending || isConfirming,
    hash,
    isSuccess,
  };
}

/**
 * Parameters for creating a pool on-chain
 */
export interface CreatePoolContractParams {
  poolId: string;
  name: string;
  category: string;
  fundingGoal: bigint;
  votingDuration: bigint;
  fundingDuration: bigint;
  candidatePitches?: `0x${string}`[];
  acceptedToken: `0x${string}`;
  minContribution: bigint;
  maxContribution?: bigint;
}

/**
 * Parameters for saving pool to database
 */
export interface CreatePoolDatabaseParams {
  id: string;
  name: string;
  description: string;
  category: string;
  votingDeadline: Date;
  status?: 'active' | 'upcoming';
  fundingGoal: number;
  minContribution: number;
  maxContribution?: number;
  contractAddress: string;
  fundingDuration: number;
  acceptedToken: string;
}

/**
 * Hook to create a pool on-chain and save to database
 * Handles the full flow: contract transaction -> extract pool address -> save to database
 */
export function useCreatePoolWithContract(onSuccess?: () => void) {
  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [dbData, setDbData] = useState<Omit<
    CreatePoolDatabaseParams,
    'contractAddress'
  > | null>(null);
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success - extract pool address and save to database
  useEffect(() => {
    async function handleTxSuccess() {
      if (!isTxSuccess || !receipt || !dbData || isCreatingDb) return;

      try {
        setIsCreatingDb(true);

        // Parse the PoolDeployed event from transaction logs
        const logs = parseEventLogs({
          abi: CrowdVCFactoryABI,
          logs: receipt.logs,
          eventName: 'PoolDeployed',
        });

        if (logs.length === 0) {
          throw new Error('Pool deployment event not found in transaction');
        }

        // Extract pool address from the event args
        const eventLog = logs[0] as unknown as {
          args: { poolAddress: `0x${string}` };
        };
        const poolAddress = eventLog.args.poolAddress;

        // Save to database with contract address
        const response = await fetch('/api/admin/pools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...dbData,
            contractAddress: poolAddress,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save pool to database');
        }

        toast.success(
          'Pool created successfully on-chain and saved to database!',
        );

        // Invalidate queries to refresh pool list
        queryClient.invalidateQueries({ queryKey: ['admin-pools'] });

        setDbData(null);
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save pool';
        setError(new Error(errorMessage));
        toast.error(
          `Pool created on-chain but failed to save to database: ${errorMessage}`,
        );
      } finally {
        setIsCreatingDb(false);
      }
    }

    handleTxSuccess();
  }, [isTxSuccess, receipt, dbData, isCreatingDb, queryClient, onSuccess]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError);
      toast.error(`Pool creation failed: ${writeError.message}`);
    }
  }, [writeError]);

  /**
   * Create a pool on-chain with the given parameters
   */
  const createPool = useCallback(
    (
      contractParams: CreatePoolContractParams,
      databaseParams: Omit<CreatePoolDatabaseParams, 'contractAddress'>,
    ) => {
      // Reset error state
      setError(null);

      // Store database params for later use after tx confirmation
      setDbData(databaseParams);

      // Build the PoolParams struct for the contract
      const poolParams = {
        poolId: contractParams.poolId,
        name: contractParams.name,
        category: contractParams.category,
        fundingGoal: contractParams.fundingGoal,
        votingDuration: contractParams.votingDuration,
        fundingDuration: contractParams.fundingDuration,
        candidatePitches: contractParams.candidatePitches || [],
        acceptedToken: contractParams.acceptedToken,
        minContribution: contractParams.minContribution,
        maxContribution: contractParams.maxContribution || BigInt(0),
      };

      writeContract({
        address: CROWD_VC_FACTORY_ADDRESS,
        abi: CrowdVCFactoryABI,
        functionName: 'createPool',
        args: [poolParams],
      });
    },
    [writeContract],
  );

  return {
    createPool,
    isPending: isPending || isConfirming || isCreatingDb,
    isConfirming,
    isCreatingDb,
    hash,
    isSuccess: isTxSuccess && !isCreatingDb && !error,
    error,
  };
}

/**
 * Legacy hook for backward compatibility - use useCreatePoolWithContract instead
 * @deprecated Use useCreatePoolWithContract for full contract + database integration
 */
export function useCreatePool(onSuccess?: () => void) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Pool created successfully!');
      onSuccess?.();
    }
    if (error) {
      toast.error(`Pool creation failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  const createPool = (
    name: string,
    category: string,
    fundingGoal: bigint,
    votingDuration: bigint,
    fundingDuration: bigint,
    candidatePitches: `0x${string}`[],
    acceptedToken: `0x${string}`,
    minContribution: bigint,
  ) => {
    writeContract({
      address: CROWD_VC_FACTORY_ADDRESS,
      abi: CrowdVCFactoryABI,
      functionName: 'createPool',
      args: [
        name,
        category,
        fundingGoal,
        votingDuration,
        fundingDuration,
        candidatePitches,
        acceptedToken,
        minContribution,
      ],
    });
  };

  return {
    createPool,
    isPending: isPending || isConfirming,
    hash,
    isSuccess,
  };
}

export function usePitchStatus(pitchId: `0x${string}` | undefined) {
  const {
    data: status,
    isLoading,
    error,
  } = useReadContract({
    address: CROWD_VC_FACTORY_ADDRESS,
    abi: CrowdVCFactoryABI,
    functionName: 'getPitchStatus',
    args: pitchId ? [pitchId] : undefined,
    query: {
      enabled: !!pitchId,
    },
  });

  return {
    status: status as PitchStatus | undefined,
    isLoading,
    error,
  };
}
