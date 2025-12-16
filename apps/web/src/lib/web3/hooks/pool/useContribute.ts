/**
 * useContribute Hook
 * Contribute to a CrowdVC pool on-chain
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { CrowdVCPoolABI } from '@crowd-vc/abis';
import { getCustomError } from '../../utils/errors';
import { erc20Abi } from 'viem';
import { toast } from 'sonner';
import {
  getErrorAction,
  isUserRejectionError,
  parseContractError,
  isApprovalError,
} from '../../utils/errors';

export type ContributeParams = {
  amount: bigint;
  token: `0x${string}`;
};

export type ContributeStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export function useContribute(
  poolAddress: `0x${string}` | undefined,
  onSuccess?: () => void,
) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<ContributeStatus>('idle');
  const [contributeParams, setContributeParams] = useState<ContributeParams | null>(null);

  // Simulate contract call to get revert reason before sending tx
  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating,
    refetch: refetchSimulation,
  } = useSimulateContract({
    address: poolAddress,
    abi: CrowdVCPoolABI,
    functionName: 'contribute',
    args: contributeParams ? [contributeParams.amount, contributeParams.token] : undefined,
    query: {
      enabled: !!poolAddress && !!address && !!contributeParams,
    },
  });

  // Log simulation error for debugging
  useEffect(() => {
    if (simulateError) {
      const customError = getCustomError(simulateError);
      console.error('🔴 Simulation failed - Revert reason:', {
        errorName: customError.name,
        errorArgs: customError.args,
        errorMessage: customError.message,
        rawError: simulateError,
      });
    }
  }, [simulateError]);

  // Log simulation success
  useEffect(() => {
    if (simulateData) {
      console.log('✅ Simulation successful:', simulateData);
    }
  }, [simulateData]);

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
      setStatus('pending');
    } else if (isConfirming) {
      setStatus('confirming');
    } else if (isSuccess) {
      setStatus('success');
    } else if (writeError || receiptError) {
      setStatus('error');
    }
  }, [isPending, isConfirming, isSuccess, writeError, receiptError]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success('Contribution successful!', {
        description: 'Your contribution has been recorded on-chain.',
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
      const needsApproval = isApprovalError(error);

      if (isRejection) {
        toast.info('Transaction cancelled', {
          description: 'You cancelled the transaction.',
        });
      } else if (needsApproval) {
        toast.warning('Token approval required', {
          description: errorMessage,
          action: {
            label: 'Learn more',
            onClick: () => {
              // Could open a modal or link to docs
            },
          },
        });
      } else {
        toast.error('Contribution failed', {
          description: errorMessage,
        });
      }
    }
  }, [writeError, receiptError]);

  const contribute = useCallback(
    async (params: ContributeParams) => {
      if (!poolAddress) {
        toast.error('Pool address not available', {
          description: 'Please wait for the pool data to load.',
        });
        return;
      }

      if (!address) {
        toast.error('Wallet not connected', {
          description: 'Please connect your wallet to contribute.',
        });
        return;
      }

      // Set params to trigger simulation
      setContributeParams(params);
      setStatus('pending');

      try {
        // Pre-flight checks: log token balance and allowance
        if (publicClient) {
          const [balance, allowance] = await Promise.all([
            publicClient.readContract({
              address: params.token,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            }),
            publicClient.readContract({
              address: params.token,
              abi: erc20Abi,
              functionName: 'allowance',
              args: [address, poolAddress],
            }),
          ]);

          console.log('🔍 Pre-flight checks:', {
            poolAddress,
            token: params.token,
            caller: address,
            amount: params.amount.toString(),
            balance: balance.toString(),
            allowance: allowance.toString(),
            hasEnoughBalance: balance >= params.amount,
            hasEnoughAllowance: allowance >= params.amount,
          });

          if (balance < params.amount) {
            toast.error('Insufficient token balance', {
              description: `Balance: ${balance.toString()}, Required: ${params.amount.toString()}`,
            });
            setStatus('error');
            return;
          }

          if (allowance < params.amount) {
            toast.error('Insufficient token allowance', {
              description: `Allowance: ${allowance.toString()}, Required: ${params.amount.toString()}. Please approve tokens first.`,
            });
            setStatus('error');
            return;
          }
        }

        // Run simulation first to get detailed error
        const { data: simResult, error: simError } = await refetchSimulation();

        if (simError) {
          const customError = getCustomError(simError);
          console.error('🔴 Contribute simulation failed:', {
            errorName: customError.name,
            errorArgs: customError.args,
            errorMessage: customError.message,
            poolAddress,
            amount: params.amount.toString(),
            token: params.token,
            caller: address,
          });

          toast.error('Transaction will fail', {
            description: customError.message,
          });
          setStatus('error');
          return;
        }

        console.log('✅ Simulation passed, sending transaction...', simResult);

        // Use the simulation request directly - this ensures exact same params
        const txHash = await writeContractAsync(simResult.request);

        toast.loading('Processing contribution...', {
          description: 'Waiting for transaction confirmation.',
          id: 'contribute-tx',
        });

        return txHash;
      } catch (error) {
        setStatus('error');
        const customError = getCustomError(error);
        console.error('Failed to contribute:', {
          errorName: customError.name,
          errorArgs: customError.args,
          errorMessage: customError.message,
          rawError: error,
        });
        // Error is handled by useEffect above
        throw error;
      }
    },
    [poolAddress, address, writeContractAsync, refetchSimulation, publicClient],
  );

  // Dismiss loading toast when confirmed
  useEffect(() => {
    if (isSuccess || writeError || receiptError) {
      toast.dismiss('contribute-tx');
    }
  }, [isSuccess, writeError, receiptError]);

  const error = writeError || receiptError || simulateError;
  const errorMessage = error ? parseContractError(error) : undefined;
  const errorAction = error ? getErrorAction(error) : null;
  const isUserRejection = error ? isUserRejectionError(error) : false;
  const needsApproval = error ? isApprovalError(error) : false;

  // Get parsed simulation error for debugging
  const simulationError = simulateError ? getCustomError(simulateError) : null;

  return {
    contribute,
    hash,
    status,
    isPending,
    isConfirming,
    isSimulating,
    isLoading: isPending || isConfirming || isSimulating,
    isSuccess,
    error: errorMessage,
    errorAction,
    isUserRejection,
    needsApproval,
    // Expose simulation details for debugging
    simulationError,
    simulateData,
    reset: () => {
      reset();
      setContributeParams(null);
      setStatus('idle');
    },
  };
}
