import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CrowdVC Factory Deployment using TransparentUpgradeableProxy Pattern
 *
 * This is the main deployment module for the CrowdVC platform.
 * It deploys the Factory contract with upgradeable proxy pattern.
 *
 * Deployed Contracts:
 * 1. ProxyAdmin - Admin contract for managing proxy upgrades
 * 2. CrowdVCFactory (Implementation) - The logic contract
 * 3. TransparentUpgradeableProxy - Proxy pointing to implementation
 *
 * Network-Specific Parameters:
 * - BASE Mainnet: Use real USDT/USDC addresses
 * - BASE Sepolia: Deploy mock tokens first (see MockTokens module)
 * - Local Hardhat: Deploy mock tokens first (see MockTokens module)
 *
 * Usage:
 * npx hardhat ignition deploy ignition/modules/Factory.ts --network baseSepolia --parameters ignition/parameters/baseSepolia.json
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

  // Step 1: Deploy ProxyAdmin
  // This contract will be the admin of the TransparentUpgradeableProxy
  // Only the ProxyAdmin owner can upgrade the proxy
  const proxyAdmin = m.contract('ProxyAdmin', [deployer], {
    id: 'ProxyAdmin',
  });

  // Step 1.5: Deploy Pool Implementation
  const poolImplementation = m.contract('CrowdVCPool', [], {
    id: 'CrowdVCPool_Implementation',
  });

  // Step 2: Deploy the implementation contract
  const factoryImplementation = m.contract('CrowdVCFactory', [poolImplementation], {
    id: 'CrowdVCFactory_Implementation',
  });

  // Step 3: Encode the initialize function call
  // This will be called atomically when deploying the proxy
  const initializeData = m.encodeFunctionCall(
    factoryImplementation,
    'initialize',
    [treasury, platformFee, usdt, usdc],
  );

  // Step 4: Deploy TransparentUpgradeableProxy
  // The proxy delegates all calls to the implementation contract
  const proxy = m.contract(
    'TransparentUpgradeableProxy',
    [factoryImplementation, proxyAdmin, initializeData],
    {
      id: 'CrowdVCFactory_Proxy',
    },
  );

  // Step 5: Get the proxied factory interface
  // This allows us to interact with the proxy as if it were the factory
  const factory = m.contractAt('CrowdVCFactory', proxy, {
    id: 'CrowdVCFactory',
  });

  return {
    proxyAdmin,
    factoryImplementation,
    proxy,
    factory, // This is the main contract address you'll use in your frontend
  };
});
