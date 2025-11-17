import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

/**
 * CrowdVC Factory Upgrade Module using TransparentUpgradeableProxy
 *
 * This module upgrades the existing factory proxy to a new implementation.
 *
 * Usage:
 * 1. Deploy new implementation: CrowdVCFactoryV2 (or whatever version)
 * 2. Call upgradeAndCall on ProxyAdmin to upgrade the proxy
 *
 * Prerequisites:
 * - You need the address of the existing ProxyAdmin
 * - You need the address of the existing Proxy
 * - You must be the owner of ProxyAdmin
 */
export default buildModule('FactoryUpgradeModule', (m) => {
  // Get the addresses from parameters
  // These should be the addresses from the original deployment
  const proxyAddress = m.getParameter('proxyAddress');
  const proxyAdminAddress = m.getParameter('proxyAdminAddress');

  // Optional: if you need to call an initialization function on the new implementation
  const needsReinitialize = m.getParameter('needsReinitialize', false);

  // Step 1: Deploy the new implementation (e.g., CrowdVCFactoryV2)
  const newImplementation = m.contract('CrowdVCFactory', [], {
    id: 'CrowdVCFactory_Implementation_V2',
  });

  // Step 2: Get the ProxyAdmin contract instance
  const proxyAdmin = m.contractAt('ProxyAdmin', proxyAdminAddress, {
    id: 'ProxyAdmin_Existing',
  });

  // Step 3: Upgrade the proxy
  if (needsReinitialize) {
    // If you added a reinitializer function in your new implementation
    // Example: function initializeV2() public reinitializer(2) { ... }
    const reinitializeData = m.encodeFunctionCall(
      newImplementation,
      'initializeV2', // Your reinitialize function name
      [], // Parameters for reinitialize function
    );

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
    m.call(proxyAdmin, 'upgrade', [proxyAddress, newImplementation], {
      id: 'upgrade_factory',
    });
  }

  return {
    newImplementation,
    proxyAdmin,
  };
});
