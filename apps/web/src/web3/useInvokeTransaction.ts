import { Abi } from 'viem';
import { useWriteContract } from 'wagmi';

const abi = [
  {
    inputs: [],
    name: 'sendPitch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const contractAddress = '0x9FE2c335DF2386D30531625C6c4b45cfbaA9E962';

export const useInvokeTransaction = () => {
  const { writeContractAsync, isPending, isSuccess, error } =
    useWriteContract();

  const invokeTransaction = async (args?: unknown[]) => {
    return writeContractAsync({
      address: contractAddress,
      abi: abi as Abi,
      functionName: 'sendPitch',
      args: args,
    });
  };

  return { invokeTransaction, isPending, isSuccess, error };
};
