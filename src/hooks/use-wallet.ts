"use client"

import { useState } from "react"
import type { WalletInfo } from "@/lib/types"

export function useWallet() {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: "0x742d...8f3a",
    balance: 125000,
    connected: true,
  })

  return {
    wallet,
    connect: () => setWallet((prev) => ({ ...prev, connected: true })),
    disconnect: () => setWallet((prev) => ({ ...prev, connected: false })),
  }
}
