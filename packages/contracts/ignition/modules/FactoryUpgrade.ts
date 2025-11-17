import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CrowdVC Factory Upgrade Module using TransparentUpgradeableProxy
 *
 * This module upgrades the existing factory proxy to a new implementation.
 * It preserves all existing state and only updates the logic contract.
 *
 * Upgrade Process:
 * 1. Deploys new CrowdVCFactory implementation
 * 2. Uses ProxyAdmin to upgrade the proxy to point to new implementation
 * 3. Optionally calls a reinitializer function if new state variables are added
 *
 * Prerequisites:
 * - You need the address of the existing ProxyAdmin (from deployment)
 * - You need the address of the existing Proxy (from deployment)
 * - You must be the owner of ProxyAdmin (deployer account)
 * - The new implementation must be compatible with existing storage layout
 *
 * Usage:
 * npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts --network baseSepolia --parameters ignition/parameters/upgrade.json
 *
 * Example upgrade.json:
 * {
 *   "FactoryUpgradeModule": {
 *     "proxyAddress": "0x...",
 *     "proxyAdminAddress": "0x...",
 *     "needsReinitialize": false
 *   }
 * }
 */
export default buildModule('FactoryUpgradeModule', (m) => {
  // Get the addresses from parameters (REQUIRED)
  // These should be the addresses from the original deployment
  const proxyAddress = m.getParameter('proxyAddress');
  const proxyAdminAddress = m.getParameter('proxyAdminAddress');

  // Optional: Set to true if you added a reinitializer function
  // Example: function initializeV2() public reinitializer(2) { ... }
  const needsReinitialize = m.getParameter('needsReinitialize', false);

  // Step 1: Deploy the new implementation contract
  // This will be version 2, 3, etc. depending on your upgrade
  const newImplementation = m.contract('CrowdVCFactory', [], {
    id: 'CrowdVCFactory_Implementation_V2',
  });

  // Step 2: Get the ProxyAdmin contract instance
  // The ProxyAdmin is the only address that can upgrade the proxy
  const proxyAdmin = m.contractAt('ProxyAdmin', proxyAdminAddress, {
    id: 'ProxyAdmin_Existing',
  });

  // Step 3: Upgrade the proxy to the new implementation
  if (needsReinitialize) {
    // Use this when you need to initialize new state variables
    // Make sure your contract has a reinitializer function like:
    // function initializeV2() public reinitializer(2) { ... }

    const reinitializeData = m.encodeFunctionCall(
      newImplementation,
      'initializeV2', // Change this to your reinitialize function name
      [], // Add parameters if your reinitializer needs them
    );

    // Upgrade and call the reinitializer atomically
    m.call(
      proxyAdmin,
      'upgradeAndCall',
      [proxyAddress, newImplementation, reinitializeData],
      {
        id: 'upgrade_factory_with_reinit',
      },
    );
  } else {
    // Simple upgrade without calling any initialization
    // Use this when you're only fixing bugs or adding new functions
    // without adding new state variables
    m.call(proxyAdmin, 'upgrade', [proxyAddress, newImplementation], {
      id: 'upgrade_factory',
    });
  }

  return {
    newImplementation,
    proxyAdmin,
  };
});
