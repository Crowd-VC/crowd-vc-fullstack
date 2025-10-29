/**
 * Smart contract addresses configuration
 * Addresses are network-specific
 */

import { base, baseSepolia } from 'viem/chains'
import { localChain } from './chains'

/**
 * Contract addresses type definition
 */
export type ContractAddresses = {
  CrowdVCFactory: `0x${string}`
  USDT: `0x${string}`
  USDC: `0x${string}`
}

/**
 * Contract addresses per network
 * These will be populated after deployment
 */
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [localChain.id]: {
    CrowdVCFactory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS_LOCAL || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDT: (process.env.NEXT_PUBLIC_USDT_ADDRESS_LOCAL || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS_LOCAL || '0x0000000000000000000000000000000000000000') as `0x${string}`
  },
  [base.id]: {
    CrowdVCFactory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDT: (process.env.NEXT_PUBLIC_USDT_ADDRESS_BASE || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS_BASE || '0x0000000000000000000000000000000000000000') as `0x${string}`
  },
  [baseSepolia.id]: {
    CrowdVCFactory: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDT: (process.env.NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as `0x${string}`,
    USDC: (process.env.NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA || '0x0000000000000000000000000000000000000000') as `0x${string}`
  }
}

/**
 * Get contract address for a specific network
 * @param chainId - Network chain ID
 * @param contract - Contract name
 * @returns Contract address
 * @throws Error if contract not deployed on the network
 */
export function getContractAddress(
  chainId: number,
  contract: keyof ContractAddresses
): `0x${string}` {
  const addresses = CONTRACT_ADDRESSES[chainId]

  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`)
  }

  const address = addresses[contract]

  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(
      `Contract ${contract} not deployed on chain ${chainId}. Please deploy contracts and update environment variables.`
    )
  }

  return address
}

/**
 * Get all contract addresses for a network
 * @param chainId - Network chain ID
 * @returns All contract addresses
 */
export function getAllContractAddresses(chainId: number): ContractAddresses | undefined {
  return CONTRACT_ADDRESSES[chainId]
}

/**
 * Check if contract is deployed on a network
 * @param chainId - Network chain ID
 * @param contract - Contract name
 * @returns True if contract is deployed
 */
export function isContractDeployed(
  chainId: number,
  contract: keyof ContractAddresses
): boolean {
  try {
    const address = getContractAddress(chainId, contract)
    return address !== '0x0000000000000000000000000000000000000000'
  } catch {
    return false
  }
}

/**
 * CrowdVCFactory contract address getter with error handling
 */
export function getFactoryAddress(chainId: number): `0x${string}` {
  return getContractAddress(chainId, 'CrowdVCFactory')
}

/**
 * USDT token address getter
 */
export function getUSDTAddress(chainId: number): `0x${string}` {
  return getContractAddress(chainId, 'USDT')
}

/**
 * USDC token address getter
 */
export function getUSDCAddress(chainId: number): `0x${string}` {
  return getContractAddress(chainId, 'USDC')
}
