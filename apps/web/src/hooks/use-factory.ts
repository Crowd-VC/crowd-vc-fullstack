'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CrowdVCFactoryABI, CROWD_VC_FACTORY_ADDRESS, UserType, PitchStatus } from '@crowd-vc/abis';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
    isSuccess
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

  const submitPitch = (title: string, ipfsHash: string, fundingGoal: bigint) => {
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
    isSuccess
  };
}

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
    minContribution: bigint
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
        minContribution
      ],
    });
  };

  return {
    createPool,
    isPending: isPending || isConfirming,
    hash,
    isSuccess
  };
}

export function usePitchStatus(pitchId: `0x${string}` | undefined) {
  const { data: status, isLoading, error } = useReadContract({
    address: CROWD_VC_FACTORY_ADDRESS,
    abi: CrowdVCFactoryABI,
    functionName: 'getPitchStatus',
    args: pitchId ? [pitchId] : undefined,
    query: {
      enabled: !!pitchId,
    }
  });

  return {
    status: status as PitchStatus | undefined,
    isLoading,
    error
  };
}
