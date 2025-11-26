'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CrowdVCPoolABI, PoolInfo } from '@crowd-vc/abis';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useContribute(poolAddress: `0x${string}`, onSuccess?: () => void) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Contribution successful!');
      onSuccess?.();
    }
    if (error) {
      toast.error(`Contribution failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  const contribute = (amount: bigint) => {
    writeContract({
      address: poolAddress,
      abi: CrowdVCPoolABI,
      functionName: 'contribute',
      args: [amount],
    });
  };

  return {
    contribute,
    isPending: isPending || isConfirming,
    hash,
    isSuccess
  };
}

export function useVote(poolAddress: `0x${string}`, onSuccess?: () => void) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Vote cast successfully!');
      onSuccess?.();
    }
    if (error) {
      toast.error(`Voting failed: ${error.message}`);
    }
  }, [isSuccess, error]);

  const vote = (pitchId: `0x${string}`) => {
    writeContract({
      address: poolAddress,
      abi: CrowdVCPoolABI,
      functionName: 'vote',
      args: [pitchId],
    });
  };

  return {
    vote,
    isPending: isPending || isConfirming,
    hash,
    isSuccess
  };
}

export function usePoolDetails(poolAddress: `0x${string}` | undefined) {
  const { data: poolInfo, isLoading, error } = useReadContract({
    address: poolAddress,
    abi: CrowdVCPoolABI,
    functionName: 'poolInfo',
    query: {
      enabled: !!poolAddress,
    }
  });

  return {
    poolInfo: poolInfo as PoolInfo | undefined,
    isLoading,
    error
  };
}
