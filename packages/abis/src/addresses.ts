/**
 * Deployed Contract Addresses
 * Auto-generated from Ignition deployments - DO NOT EDIT MANUALLY
 * 
 * Generated at: 2025-12-07T05:17:38.974Z
 * Run 'pnpm generate:addresses' in packages/contracts to regenerate
 */

/**
 * Chain addresses type
 */
export interface ChainAddresses {
  CrowdVCFactory: `0x${string}`;
  CrowdVCPool_Implementation: `0x${string}`;
}

/**
 * All deployed addresses organized by chain ID
 */
export const DeployedAddresses: Record<number, ChainAddresses> = {
  "11155111": {
    "CrowdVCFactory": "0xF1eDF4371b950Fbf4B4469079BABEEfA807cD3da",
    "CrowdVCPool_Implementation": "0xb1D5fF77B7c8B6CE8fc995790ca44f5A4B073b21"
  }
} as const;

/**
 * Get addresses for a specific chain
 * @param chainId - The chain ID to get addresses for
 * @returns Chain addresses or undefined if not deployed
 */
export function getAddressesForChain(chainId: number): ChainAddresses | undefined {
  return DeployedAddresses[chainId];
}

/**
 * Get the CrowdVCFactory address for a specific chain
 * @param chainId - The chain ID
 * @returns Factory address or throws if not deployed
 */
export function getFactoryAddress(chainId: number): `0x${string}` {
  const addresses = DeployedAddresses[chainId];
  if (!addresses) {
    throw new Error(`No deployment found for chain ${chainId}`);
  }
  return addresses.CrowdVCFactory as `0x${string}`;
}

/**
 * Check if contracts are deployed on a chain
 * @param chainId - The chain ID to check
 * @returns true if contracts are deployed
 */
export function isDeployedOnChain(chainId: number): boolean {
  const addresses = DeployedAddresses[chainId];
  return !!addresses && addresses.CrowdVCFactory !== '0x0000000000000000000000000000000000000000';
}

/**
 * Get all chain IDs with deployments
 * @returns Array of chain IDs
 */
export function getDeployedChainIds(): number[] {
  return Object.keys(DeployedAddresses).map(Number);
}

// Legacy exports for backwards compatibility
export const CROWD_VC_FACTORY_ADDRESS = DeployedAddresses[11155111]?.CrowdVCFactory ?? DeployedAddresses[31337]?.CrowdVCFactory ?? '0x0000000000000000000000000000000000000000';
