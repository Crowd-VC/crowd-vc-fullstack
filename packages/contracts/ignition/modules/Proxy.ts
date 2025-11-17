import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const proxyModule = buildModule('CrowdVCProxyModule', (m) => {
  const proxyAdminOwner = m.getAccount(0);

  const demo = m.contract('CrowdVCFactory');

  const proxy = m.contract('TransparentUpgradeableProxy', [
    demo,
    proxyAdminOwner,
    '0x',
  ]);

  const proxyAdminAddress = m.readEventArgument(
    proxy,
    'AdminChanged',
    'newAdmin',
  );

  const proxyAdmin = m.contractAt('ProxyAdmin', proxyAdminAddress);

  return { proxyAdmin, proxy };
});

const factoryModule = buildModule('CrowdVCFactoryModule', (m) => {
  const { proxy, proxyAdmin } = m.useModule(proxyModule);

  const factory = m.contractAt('CrowdVCFactory', proxy);

  return { factory, proxy, proxyAdmin };
});

export default { proxyModule, factoryModule };
