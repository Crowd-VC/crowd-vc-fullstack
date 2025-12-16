/**
 * Smart contract addresses configuration
 * Addresses are loaded from @crowd-vc/abis package (auto-generated from deployments)
 */

import { base, baseSepolia, sepolia } from "viem/chains";
import { localChain } from "./chains";
import {
  DeployedAddresses,
  getAddressesForChain,
  getFactoryAddress as getFactoryAddressFromAbis,
  isDeployedOnChain,
} from "@crowd-vc/abis";

/**
 * Contract addresses type definition
 */
export type ContractAddresses = {
  CrowdVCFactory: `0x${string}`;
  USDT: `0x${string}`;
  USDC: `0x${string}`;
};

/**
 * Get contract addresses for a specific network
 * Factory address comes from deployments, tokens from config
 */
function buildContractAddresses(
  chainId: number,
): ContractAddresses | undefined {
  const deployedAddresses = getAddressesForChain(chainId);

  if (!deployedAddresses) {
    return undefined;
  }

  return {
    CrowdVCFactory: deployedAddresses.CrowdVCFactory,
    USDT: deployedAddresses.MockUSDT,
    USDC: deployedAddresses.MockUSDC,
  };
}

/**
 * Contract addresses per network (lazy-loaded from deployments)
 */
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [localChain.id]: buildContractAddresses(localChain.id) || {
    CrowdVCFactory:
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDT: buildContractAddresses(localChain.id)?.USDT ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDC: buildContractAddresses(localChain.id)?.USDC ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  [base.id]: buildContractAddresses(base.id) || {
    CrowdVCFactory:
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDT: buildContractAddresses(base.id)?.USDT ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDC: buildContractAddresses(base.id)?.USDC ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  [baseSepolia.id]: buildContractAddresses(baseSepolia.id) || {
    CrowdVCFactory:
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDT: buildContractAddresses(baseSepolia.id)?.USDT ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDC: buildContractAddresses(baseSepolia.id)?.USDC ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
  [sepolia.id]: buildContractAddresses(sepolia.id) || {
    CrowdVCFactory:
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDT: buildContractAddresses(sepolia.id)?.USDT ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
    USDC: buildContractAddresses(sepolia.id)?.USDC ||
      "0x0000000000000000000000000000000000000000" as `0x${string}`,
  },
};

/**
 * Get contract address for a specific network
 * @param chainId - Network chain ID
 * @param contract - Contract name
 * @returns Contract address
 * @throws Error if contract not deployed on the network
 */
export function getContractAddress(
  chainId: number,
  contract: keyof ContractAddresses,
): `0x${string}` {
  const addresses = CONTRACT_ADDRESSES[chainId];

  if (!addresses) {
    throw new Error(`No contract addresses configured for chain ${chainId}`);
  }

  const address = addresses[contract];

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract ${contract} not deployed on chain ${chainId}.`);
  }

  return address;
}

/**
 * Get all contract addresses for a network
 * @param chainId - Network chain ID
 * @returns All contract addresses
 */
export function getAllContractAddresses(
  chainId: number,
): ContractAddresses | undefined {
  return CONTRACT_ADDRESSES[chainId];
}

/**
 * Check if contract is deployed on a network
 * @param chainId - Network chain ID
 * @param contract - Contract name
 * @returns True if contract is deployed
 */
export function isContractDeployed(
  chainId: number,
  contract: keyof ContractAddresses,
): boolean {
  try {
    const address = getContractAddress(chainId, contract);
    return address !== "0x0000000000000000000000000000000000000000";
  } catch {
    return false;
  }
}

/**
 * CrowdVCFactory contract address getter with error handling
 */
export function getFactoryAddress(chainId: number): `0x${string}` {
  // Try to get from deployments first
  if (isDeployedOnChain(chainId)) {
    return getFactoryAddressFromAbis(chainId);
  }
  // Fallback to local config
  return getContractAddress(chainId, "CrowdVCFactory");
}

/**
 * USDT token address getter
 */
export function getUSDTAddress(chainId: number): `0x${string}` {
  return getContractAddress(chainId, "USDT");
}

/**
 * USDC token address getter
 */
export function getUSDCAddress(chainId: number): `0x${string}` {
  return getContractAddress(chainId, "USDC");
}

// Re-export deployment utilities from abis package
export { DeployedAddresses, isDeployedOnChain } from "@crowd-vc/abis";
