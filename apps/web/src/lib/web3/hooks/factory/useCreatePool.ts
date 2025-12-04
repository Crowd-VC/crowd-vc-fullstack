/**
 * useCreatePool Hook
 * Create a new investment pool on-chain and save to database
 * Uses useSimulateContract to validate transaction before execution
 * @see https://wagmi.sh/react/api/hooks/useSimulateContract
 */

'use client';

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSimulateContract,
} from 'wagmi';
import { parseEventLogs } from 'viem';
import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CrowdVCFactoryABI } from '@crowd-vc/abis';
import { getFactoryAddress } from '../../config/contracts';
import {
  parseContractError,
  getCustomError,
  getErrorAction,
  isUserRejectionError,
} from '../../utils/errors';
import { GAS_LIMITS } from '../../utils/constants';

/**
 * Parameters for creating a pool on-chain
 */
export type CreatePoolContractParams = {
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
};

/**
 * Parameters for saving pool to database
 */
export type CreatePoolDatabaseParams = {
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
};

/**
 * Combined params for createPool function
 */
export type UseCreatePoolParams = {
  contractParams: CreatePoolContractParams;
  databaseParams: Omit<CreatePoolDatabaseParams, 'contractAddress'>;
};

/**
 * Hook params for simulation
 */
export type UseCreatePoolHookParams = {
  contractParams?: CreatePoolContractParams;
  enabled?: boolean;
};

export function useCreatePool(hookParams?: UseCreatePoolHookParams) {
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const factoryAddress = getFactoryAddress(chainId);

  // Build pool params for simulation (only if contractParams provided)
  const poolParams = hookParams?.contractParams
    ? {
        poolId: hookParams.contractParams.poolId,
        name: hookParams.contractParams.name,
        category: hookParams.contractParams.category,
        fundingGoal: hookParams.contractParams.fundingGoal,
        votingDuration: hookParams.contractParams.votingDuration,
        fundingDuration: hookParams.contractParams.fundingDuration,
        candidatePitches: hookParams.contractParams.candidatePitches || [],
        acceptedToken: hookParams.contractParams.acceptedToken,
        minContribution: hookParams.contractParams.minContribution,
        maxContribution: hookParams.contractParams.maxContribution || BigInt(0),
      }
    : undefined;
  console.log('poolParams', poolParams);
  // Simulate contract call to validate before execution
  const {
    data: simulationData,
    error: simulationError,
    isLoading: isSimulating,
    refetch: refetchSimulation,
  } = useSimulateContract({
    address: factoryAddress,
    abi: CrowdVCFactoryABI,
    functionName: 'createPool',
    args: poolParams ? [poolParams] : undefined,
    gas: GAS_LIMITS.CREATE_POOL,
    query: {
      enabled: hookParams?.enabled && !!poolParams,
    },
  });
  console.log('simulationData', simulationData);
  console.log('simulationError', simulationError);
  const {
    writeContractAsync,
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [dbData, setDbData] = useState<Omit<
    CreatePoolDatabaseParams,
    'contractAddress'
  > | null>(null);
  const [isCreatingDb, setIsCreatingDb] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

        // Invalidate queries to refresh pool list
        queryClient.invalidateQueries({ queryKey: ['admin-pools'] });

        setDbData(null);
        setIsSuccess(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save pool';
        setDbError(new Error(errorMessage));
      } finally {
        setIsCreatingDb(false);
      }
    }

    handleTxSuccess();
  }, [isTxSuccess, receipt, dbData, isCreatingDb, queryClient]);

  /**
   * Create a pool using the simulated request (recommended)
   * This uses the pre-validated simulation data for better UX
   */
  const createPoolFromSimulation = useCallback(
    (databaseParams: Omit<CreatePoolDatabaseParams, 'contractAddress'>) => {
      if (!simulationData?.request) {
        throw new Error('Simulation not ready. Please wait for validation.');
      }

      // Reset state
      setDbError(null);
      setIsSuccess(false);

      // Store database params for later use after tx confirmation
      setDbData(databaseParams);

      // Execute the pre-validated transaction
      writeContract(simulationData.request);
    },
    [simulationData, writeContract],
  );

  /**
   * Create a pool on-chain and save to database (async version)
   * This simulates inline before execution for one-off calls
   * @param params - Contract and database parameters
   */
  const createPool = useCallback(
    async (params: UseCreatePoolParams) => {
      // Reset state
      setDbError(null);
      setIsSuccess(false);

      // Store database params for later use after tx confirmation
      setDbData(params.databaseParams);

      try {
        // Build the PoolParams struct for the contract
        const contractPoolParams = {
          poolId: params.contractParams.poolId,
          name: params.contractParams.name,
          category: params.contractParams.category,
          fundingGoal: params.contractParams.fundingGoal,
          votingDuration: params.contractParams.votingDuration,
          fundingDuration: params.contractParams.fundingDuration,
          candidatePitches: params.contractParams.candidatePitches || [],
          acceptedToken: params.contractParams.acceptedToken,
          minContribution: params.contractParams.minContribution,
          maxContribution: params.contractParams.maxContribution || BigInt(0),
        };

        // If simulation data is available and matches, use it
        if (simulationData?.request) {
          return await writeContractAsync(simulationData.request);
        }

        // Otherwise, execute directly (wagmi will simulate internally)
        return await writeContractAsync({
          address: factoryAddress,
          abi: CrowdVCFactoryABI,
          functionName: 'createPool',
          args: [contractPoolParams],
          gas: GAS_LIMITS.CREATE_POOL,
        });
      } catch (error) {
        console.error('Failed to create pool:', error);
        setDbData(null);
        throw error;
      }
    },
    [factoryAddress, writeContractAsync, simulationData],
  );

  // Parse errors for user-friendly messages
  const error = simulationError || writeError || receiptError || dbError;
  const errorMessage = error ? parseContractError(error) : undefined;

  // Get detailed error info for enhanced UX
  const customError = error ? getCustomError(error) : null;
  const errorAction = error ? getErrorAction(error) : null;
  const isUserRejection = error ? isUserRejectionError(error) : false;

  // Simulation is ready when we have data and no error
  const isSimulationReady = !!simulationData?.request && !simulationError;

  return {
    // Actions
    createPool,
    createPoolFromSimulation,
    refetchSimulation,
    reset: () => {
      reset();
      setDbData(null);
      setDbError(null);
      setIsSuccess(false);
    },
    // Simulation state
    isSimulating,
    isSimulationReady,
    simulationError: simulationError
      ? parseContractError(simulationError)
      : undefined,
    // Transaction state
    hash,
    isPending,
    isConfirming,
    isCreatingDb,
    isLoading: isPending || isConfirming || isCreatingDb,
    isSuccess,
    // Combined error
    error: errorMessage,
    // Enhanced error details
    errorName: customError?.name,
    errorAction,
    isUserRejection,
  };
}
