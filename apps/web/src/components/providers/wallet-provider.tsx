'use client';

import {
  projectId,
  wagmiAdapter,
  wagmiMetaData,
  localhost,
} from '@/app/shared/wagmi-config';
import { sepolia } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, cookieToInitialState } from 'wagmi';
import { ReownAuthentication } from '@reown/appkit-siwx';

const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig);

/**
 * Networks configuration
 * Development: includes localhost for local Hardhat node
 * Production: only BASE networks
 */
const isDevelopment = process.env.NODE_ENV === 'development';

createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  metadata: wagmiMetaData,
  projectId,
  features: {
    analytics: true,
  },
  siwx: new ReownAuthentication(),
});

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      {children}
    </WagmiProvider>
  );
}
