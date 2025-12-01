import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CrowdVC Factory Deployment Module (Non-Upgradeable)
 *
 * This is the main deployment module for the CrowdVC platform.
 * It deploys the Factory contract directly without proxy pattern.
 *
 * Deployed Contracts:
 * 1. CrowdVCPool (Implementation) - Pool template for minimal proxy cloning
 * 2. CrowdVCFactory - The main factory contract
 *
 * Network-Specific Parameters:
 * - BASE Mainnet: Use real USDT/USDC addresses
 * - BASE Sepolia: Deploy mock tokens first (see MockTokens module)
 * - Sepolia: Use test token addresses
 * - Local Hardhat: Deploy mock tokens first (see MockTokens module)
 *
 * Usage:
 * npx hardhat ignition deploy ignition/modules/Factory.ts --network sepolia --parameters ignition/parameters/sepolia.json
 */
export default buildModule('FactoryModule', (m) => {
  // Get deployment parameters
  const deployer = m.getAccount(0);

  // Network-specific token addresses
  // BASE Mainnet addresses (default):
  const USDT_BASE_MAINNET = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
  const USDC_BASE_MAINNET = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

  // Parameters - can be overridden via JSON file
  const treasury = m.getParameter('treasury', deployer);
  const platformFee = m.getParameter('platformFee', 500); // 5% default (500 basis points)
  const usdt = m.getParameter('usdt', USDT_BASE_MAINNET);
  const usdc = m.getParameter('usdc', USDC_BASE_MAINNET);

  // Step 1: Deploy Pool Implementation
  // This is used as the template for minimal proxy cloning (ERC-1167)
  const poolImplementation = m.contract('CrowdVCPool', [], {
    id: 'CrowdVCPool_Implementation',
  });

  // Step 2: Deploy the CrowdVCFactory directly
  // Constructor args: (poolImplementation, treasury, platformFee, usdt, usdc)
  const factory = m.contract(
    'CrowdVCFactory',
    [poolImplementation, treasury, platformFee, usdt, usdc],
    {
      id: 'CrowdVCFactory',
    },
  );

  return {
    poolImplementation,
    factory,
  };
});
