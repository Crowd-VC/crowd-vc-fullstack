import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, baseSepolia, sepolia } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_CRYPTO_PROJECT_ID || '';

/**
 * Localhost network for local development
 * Compatible with Hardhat local node (chain ID: 31337)
 */
export const localhost: AppKitNetwork = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Localhost',
      url: 'http://localhost:8545',
    },
  },
  testnet: true,
};

export const wagmiMetaData = {
  name: 'CrowdVC',
  description: 'Decentralized Venture Capital Platform',
  url: 'https://crowdvc.io',
  icons: ['https://crowdvc.io/logo.png'],
};

/**
 * Networks configuration
 * Development: includes localhost
 * Production: only BASE networks
 */
const isDevelopment = process.env.NODE_ENV === 'development';
const networks = [isDevelopment ? sepolia : base]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
});
