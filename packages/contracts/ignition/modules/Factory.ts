import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CrowdVC Factory Deployment using TransparentUpgradeableProxy Pattern
 *
 * This module deploys:
 * 1. ProxyAdmin - Admin contract for managing proxy upgrades
 * 2. CrowdVCFactory (Implementation) - The logic contract
 * 3. TransparentUpgradeableProxy - Proxy pointing to implementation
 *
 * The proxy is initialized with the factory's initialize() function
 */
export default buildModule('FactoryModule', (m) => {
  // Get deployment parameters
  const deployer = m.getAccount(0);

  // These should be configured for your target network
  // BASE Mainnet addresses:
  const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'; // Tether USD on BASE
  const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USD Coin on BASE

  // For testnets, you'll need to deploy mock tokens or use testnet addresses
  const treasury = m.getParameter('treasury', deployer);
  const platformFee = m.getParameter('platformFee', 500); // 5% default
  const usdt = m.getParameter('usdt', USDT_BASE);
  const usdc = m.getParameter('usdc', USDC_BASE);

  // Step 1: Deploy ProxyAdmin
  // This contract will be the admin of the TransparentUpgradeableProxy
  const proxyAdmin = m.contract('ProxyAdmin', [], {
    id: 'ProxyAdmin',
  });

  // Step 2: Deploy the implementation contract
  const factoryImplementation = m.contract('CrowdVCFactory', [], {
    id: 'CrowdVCFactory_Implementation',
  });

  // Step 3: Encode the initialize function call
  const initializeData = m.encodeFunctionCall(
    factoryImplementation,
    'initialize',
    [treasury, platformFee, usdt, usdc],
  );

  // Step 4: Deploy TransparentUpgradeableProxy
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
    factory, // This is the main contract you'll interact with
  };
});
