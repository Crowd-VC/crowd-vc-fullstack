#!/usr/bin/env tsx
/**
 * Generate TypeScript addresses file from Ignition deployments
 *
 * This script reads all deployed_addresses.json files from the ignition/deployments folder
 * and generates a TypeScript file with addresses organized by chainId.
 *
 * Usage: pnpm generate:addresses
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPLOYMENTS_DIR = path.join(__dirname, '../ignition/deployments');
const OUTPUT_FILE = path.join(__dirname, '../../abis/src/addresses.ts');

interface DeployedAddresses {
  [key: string]: string;
}

interface ChainAddresses {
  CrowdVCFactory: string;
  CrowdVCPool_Implementation: string;
}

interface AllAddresses {
  [chainId: number]: ChainAddresses;
}

function parseDeployedAddresses(addresses: DeployedAddresses): ChainAddresses {
  return {
    CrowdVCFactory:
      addresses['FactoryModule#CrowdVCFactory'] ||
      '0x0000000000000000000000000000000000000000',
    CrowdVCPool_Implementation:
      addresses['FactoryModule#CrowdVCPool_Implementation'] ||
      '0x0000000000000000000000000000000000000000',
  };
}

function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia',
    8453: 'Base',
    84532: 'Base Sepolia',
    31337: 'Localhost (Hardhat)',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

function generateAddressesFile(): void {
  console.log('🔍 Scanning deployments directory:', DEPLOYMENTS_DIR);

  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    console.error('❌ Deployments directory not found:', DEPLOYMENTS_DIR);
    process.exit(1);
  }

  const allAddresses: AllAddresses = {};
  const chainDirs = fs
    .readdirSync(DEPLOYMENTS_DIR)
    .filter((dir) => dir.startsWith('chain-'));

  console.log(`📁 Found ${chainDirs.length} deployment(s)`);

  for (const chainDir of chainDirs) {
    const chainId = parseInt(chainDir.replace('chain-', ''), 10);
    const addressesPath = path.join(
      DEPLOYMENTS_DIR,
      chainDir,
      'deployed_addresses.json',
    );

    if (!fs.existsSync(addressesPath)) {
      console.warn(`⚠️  No deployed_addresses.json found for chain ${chainId}`);
      continue;
    }

    const rawAddresses: DeployedAddresses = JSON.parse(
      fs.readFileSync(addressesPath, 'utf-8'),
    );
    allAddresses[chainId] = parseDeployedAddresses(rawAddresses);
    console.log(
      `✅ Loaded addresses for ${getChainName(chainId)} (${chainId})`,
    );
  }

  // Generate TypeScript file content
  const fileContent = `/**
 * Deployed Contract Addresses
 * Auto-generated from Ignition deployments - DO NOT EDIT MANUALLY
 * 
 * Generated at: ${new Date().toISOString()}
 * Run 'pnpm generate:addresses' in packages/contracts to regenerate
 */

/**
 * Chain addresses type
 */
export interface ChainAddresses {
  CrowdVCFactory: \`0x\${string}\`;
  CrowdVCPool_Implementation: \`0x\${string}\`;
}

/**
 * All deployed addresses organized by chain ID
 */
export const DeployedAddresses: Record<number, ChainAddresses> = ${JSON.stringify(allAddresses, null, 2)} as const;

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
export function getFactoryAddress(chainId: number): \`0x\${string}\` {
  const addresses = DeployedAddresses[chainId];
  if (!addresses) {
    throw new Error(\`No deployment found for chain \${chainId}\`);
  }
  return addresses.CrowdVCFactory as \`0x\${string}\`;
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
`;

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`\n✨ Generated addresses file: ${OUTPUT_FILE}`);
  console.log(
    `📊 Chains included: ${Object.keys(allAddresses)
      .map((id) => getChainName(parseInt(id)))
      .join(', ')}`,
  );
}

generateAddressesFile();
