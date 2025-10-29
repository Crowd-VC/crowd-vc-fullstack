/**
 * Supported blockchain networks configuration
 * CrowdVC operates on BASE network
 */

import { base, baseSepolia, localhost } from 'viem/chains'

/**
 * Local development chain (Hardhat/Anvil)
 */
export const localChain = {
  ...localhost,
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
} as const

/**
 * Supported chains for CrowdVC platform
 * Development: Localhost (Hardhat)
 * Testnet: BASE Sepolia
 * Production: BASE Mainnet
 */
export const SUPPORTED_CHAINS = [localChain, baseSepolia, base] as const

/**
 * Default chain for development
 * Use localhost for local development
 */
export const DEFAULT_CHAIN = process.env.NODE_ENV === 'development' ? localChain : baseSepolia

/**
 * Chain-specific configuration
 */
export const CHAIN_CONFIG = {
  [localChain.id]: {
    name: 'Localhost',
    shortName: 'Local',
    explorer: 'http://localhost:8545',
    rpcUrl: process.env.NEXT_PUBLIC_LOCAL_RPC_URL || 'http://127.0.0.1:8545',
    nativeCurrency: localChain.nativeCurrency,
    testnet: true
  },
  [base.id]: {
    name: 'BASE',
    shortName: 'BASE',
    explorer: 'https://basescan.org',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    nativeCurrency: base.nativeCurrency,
    testnet: false
  },
  [baseSepolia.id]: {
    name: 'BASE Sepolia',
    shortName: 'BASE Testnet',
    explorer: 'https://sepolia.basescan.org',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    nativeCurrency: baseSepolia.nativeCurrency,
    testnet: true
  }
} as const

/**
 * Type helper for chain IDs
 */
export type SupportedChainId = typeof localChain.id | typeof base.id | typeof baseSepolia.id

/**
 * Check if a chain ID is supported
 */
export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return chainId === localChain.id || chainId === base.id || chainId === baseSepolia.id
}

/**
 * Get chain configuration by ID
 */
export function getChainConfig(chainId: number) {
  if (!isSupportedChain(chainId)) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return CHAIN_CONFIG[chainId]
}

/**
 * Get block explorer URL for an address
 */
export function getExplorerAddressUrl(chainId: number, address: string): string {
  const config = getChainConfig(chainId)
  return `${config.explorer}/address/${address}`
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const config = getChainConfig(chainId)
  return `${config.explorer}/tx/${txHash}`
}
