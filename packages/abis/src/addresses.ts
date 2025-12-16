/**
 * Deployed Contract Addresses
 * Auto-generated from Ignition deployments - DO NOT EDIT MANUALLY
 *
 * Generated at: 2025-12-08T20:44:44.808Z
 * Run 'pnpm generate:addresses' in packages/contracts to regenerate
 */

/**
 * Chain addresses type
 */
export interface ChainAddresses {
  CrowdVCFactory: `0x${string}`;
  CrowdVCPool_Implementation: `0x${string}`;
  MockUSDC: `0x${string}`;
  MockUSDT: `0x${string}`;
}

/**
 * All deployed addresses organized by chain ID
 */
export const DeployedAddresses: Record<number, ChainAddresses> = {
  "11155111": {
    "CrowdVCFactory": "0xA1fB31CC715BfcF9E26B216B331505bBE8873dc9",
    "CrowdVCPool_Implementation": "0x68c8F6d1907065feaCe73a612bABc3f9c0Ce0E29",
    "MockUSDC": "0x4a61B10b50cBfc20c147B732dD38dF733508266A",
    "MockUSDT": "0x557c5B8dA7F1B7091a0b6a7063384bc6fC9581Ca",
  },
} as const;

/**
 * Get addresses for a specific chain
 * @param chainId - The chain ID to get addresses for
 * @returns Chain addresses or undefined if not deployed
 */
export function getAddressesForChain(
  chainId: number,
): ChainAddresses | undefined {
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
  return !!addresses &&
    addresses.CrowdVCFactory !== "0x0000000000000000000000000000000000000000";
}

/**
 * Get all chain IDs with deployments
 * @returns Array of chain IDs
 */
export function getDeployedChainIds(): number[] {
  return Object.keys(DeployedAddresses).map(Number);
}

// Legacy exports for backwards compatibility
export const CROWD_VC_FACTORY_ADDRESS =
  DeployedAddresses[11155111]?.CrowdVCFactory ??
    DeployedAddresses[31337]?.CrowdVCFactory ??
    "0x0000000000000000000000000000000000000000";
