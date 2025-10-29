"use client"

import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  return {
    wallet: {
      address,
      isConnected,
      balance: balance?.value ? formatEther(balance.value) : 0,
    }
  }
}
