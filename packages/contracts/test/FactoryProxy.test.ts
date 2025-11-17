import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

/**
 * Tests for TransparentUpgradeableProxy pattern with CrowdVCFactory
 * 
 * These tests verify:
 * 1. Initial deployment and initialization
 * 2. State persistence through proxy
 * 3. Upgrade functionality
 * 4. Admin separation
 */

describe('CrowdVCFactory - TransparentUpgradeableProxy', function () {
  // Define fixture for deployment
  async function deployFactoryFixture() {
    const [deployer, admin, user1, treasury] = await ethers.getSigners();

    // Mock token addresses (in production, use real tokens)
    const mockUSDT = '0x1234567890123456789012345678901234567890';
    const mockUSDC = '0x0987654321098765432109876543210987654321';
    const platformFee = 500; // 5%

    // Deploy ProxyAdmin
    const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.waitForDeployment();

    // Deploy Implementation
    const Factory = await ethers.getContractFactory('CrowdVCFactory');
    const implementation = await Factory.deploy();
    await implementation.waitForDeployment();

    // Encode initialize call
    const initData = Factory.interface.encodeFunctionData('initialize', [
      treasury.address,
      platformFee,
      mockUSDT,
      mockUSDC,
    ]);

    // Deploy TransparentUpgradeableProxy
    const TransparentProxy = await ethers.getContractFactory('TransparentUpgradeableProxy');
    const proxy = await TransparentProxy.deploy(
      await implementation.getAddress(),
      await proxyAdmin.getAddress(),
      initData
    );
    await proxy.waitForDeployment();

    // Get factory interface pointing to proxy
    const factory = Factory.attach(await proxy.getAddress());

    return {
      deployer,
      admin,
      user1,
      treasury,
      factory,
      implementation,
      proxy,
      proxyAdmin,
      mockUSDT,
      mockUSDC,
      platformFee,
    };
  }

  describe('Deployment', function () {
    it('Should deploy and initialize correctly', async function () {
      const { factory, treasury, platformFee } = await loadFixture(deployFactoryFixture);

      expect(await factory.getTreasury()).to.equal(treasury.address);
      expect(await factory.getPlatformFee()).to.equal(platformFee);
      expect(await factory.getVersion()).to.equal(1);
    });

    it('Should set deployer as admin', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);

      const ADMIN_ROLE = await factory.ADMIN_ROLE();
      expect(await factory.hasRole(ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it('Should support USDT and USDC', async function () {
      const { factory, mockUSDT, mockUSDC } = await loadFixture(deployFactoryFixture);

      expect(await factory.supportedTokens(mockUSDT)).to.be.true;
      expect(await factory.supportedTokens(mockUSDC)).to.be.true;
    });

    it('Should deploy pool implementation', async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      const poolImpl = await factory.poolImplementation();
      expect(poolImpl).to.not.equal(ethers.ZeroAddress);
    });
  });

  describe('Proxy Functionality', function () {
    it('Should store state in proxy, not implementation', async function () {
      const { factory, implementation, treasury } = await loadFixture(deployFactoryFixture);

      // Check state through proxy
      const proxyTreasury = await factory.getTreasury();
      expect(proxyTreasury).to.equal(treasury.address);

      // Implementation contract should have zero state (not initialized)
      const implContract = await ethers.getContractAt('CrowdVCFactory', await implementation.getAddress());
      
      // This should revert or return default values since implementation isn't initialized
      await expect(implContract.getTreasury()).to.be.reverted;
    });

    it('Should delegate calls through proxy', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);

      // Update platform fee through proxy
      const ADMIN_ROLE = await factory.ADMIN_ROLE();
      await factory.updatePlatformFee(600);

      expect(await factory.getPlatformFee()).to.equal(600);
    });
  });

  describe('Admin Operations', function () {
    it('Should allow admin to update platform fee', async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      await factory.updatePlatformFee(750);
      expect(await factory.getPlatformFee()).to.equal(750);
    });

    it('Should allow admin to update treasury', async function () {
      const { factory, user1 } = await loadFixture(deployFactoryFixture);

      await factory.updateTreasury(user1.address);
      expect(await factory.getTreasury()).to.equal(user1.address);
    });

    it('Should prevent non-admin from updating fee', async function () {
      const { factory, user1 } = await loadFixture(deployFactoryFixture);

      const ADMIN_ROLE = await factory.ADMIN_ROLE();
      await expect(
        factory.connect(user1).updatePlatformFee(600)
      ).to.be.reverted; // Should revert with AccessControl error
    });

    it('Should allow admin to pause contract', async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      await factory.pause();
      
      // Verify paused by trying to register (should fail)
      await expect(
        factory.registerUser(1, 'ipfs://metadata')
      ).to.be.reverted;
    });
  });

  describe('User Registration', function () {
    it('Should allow users to register', async function () {
      const { factory, user1 } = await loadFixture(deployFactoryFixture);

      await factory.connect(user1).registerUser(1, 'ipfs://startup-profile');

      const profile = await factory.getUserProfile(user1.address);
      expect(profile.userType).to.equal(1);
      expect(profile.isActive).to.be.true;
    });

    it('Should grant roles upon registration', async function () {
      const { factory, user1 } = await loadFixture(deployFactoryFixture);

      await factory.connect(user1).registerUser(1, 'ipfs://startup-profile');

      const STARTUP_ROLE = await factory.STARTUP_ROLE();
      expect(await factory.hasRole(STARTUP_ROLE, user1.address)).to.be.true;
    });

    it('Should prevent double registration', async function () {
      const { factory, user1 } = await loadFixture(deployFactoryFixture);

      await factory.connect(user1).registerUser(1, 'ipfs://startup-profile');

      await expect(
        factory.connect(user1).registerUser(2, 'ipfs://new-profile')
      ).to.be.revertedWith('Already registered');
    });
  });

  describe('ProxyAdmin Ownership', function () {
    it('Should have correct ProxyAdmin owner', async function () {
      const { proxyAdmin, deployer } = await loadFixture(deployFactoryFixture);

      expect(await proxyAdmin.owner()).to.equal(deployer.address);
    });

    it('Should allow owner to transfer ownership', async function () {
      const { proxyAdmin, user1 } = await loadFixture(deployFactoryFixture);

      await proxyAdmin.transferOwnership(user1.address);
      expect(await proxyAdmin.owner()).to.equal(user1.address);
    });

    it('Should get correct implementation address', async function () {
      const { proxyAdmin, proxy, implementation } = await loadFixture(deployFactoryFixture);

      const implAddress = await proxyAdmin.getProxyImplementation(await proxy.getAddress());
      expect(implAddress).to.equal(await implementation.getAddress());
    });
  });

  describe('Upgrade Functionality', function () {
    it('Should allow ProxyAdmin owner to upgrade', async function () {
      const { factory, proxyAdmin, proxy, deployer } = await loadFixture(deployFactoryFixture);

      // Store some state
      await factory.updatePlatformFee(700);
      const feeBefore = await factory.getPlatformFee();

      // Deploy new implementation (V2)
      const FactoryV2 = await ethers.getContractFactory('CrowdVCFactory');
      const newImplementation = await FactoryV2.deploy();
      await newImplementation.waitForDeployment();

      // Upgrade through ProxyAdmin
      await proxyAdmin.upgrade(
        await proxy.getAddress(),
        await newImplementation.getAddress()
      );

      // Verify state persisted
      const feeAfter = await factory.getPlatformFee();
      expect(feeAfter).to.equal(feeBefore);
      expect(feeAfter).to.equal(700);
    });

    it('Should prevent non-owner from upgrading', async function () {
      const { proxyAdmin, proxy, user1 } = await loadFixture(deployFactoryFixture);

      // Deploy new implementation
      const FactoryV2 = await ethers.getContractFactory('CrowdVCFactory');
      const newImplementation = await FactoryV2.deploy();
      await newImplementation.waitForDeployment();

      // Try to upgrade as non-owner (should fail)
      await expect(
        proxyAdmin.connect(user1).upgrade(
          await proxy.getAddress(),
          await newImplementation.getAddress()
        )
      ).to.be.reverted;
    });

    it('Should preserve all state after upgrade', async function () {
      const { factory, proxyAdmin, proxy, user1, treasury } = await loadFixture(deployFactoryFixture);

      // Set various state
      await factory.updatePlatformFee(800);
      await factory.connect(user1).registerUser(1, 'ipfs://profile');
      
      const feeBefore = await factory.getPlatformFee();
      const treasuryBefore = await factory.getTreasury();
      const profileBefore = await factory.getUserProfile(user1.address);

      // Deploy and upgrade to new implementation
      const FactoryV2 = await ethers.getContractFactory('CrowdVCFactory');
      const newImplementation = await FactoryV2.deploy();
      await newImplementation.waitForDeployment();

      await proxyAdmin.upgrade(
        await proxy.getAddress(),
        await newImplementation.getAddress()
      );

      // Verify all state preserved
      expect(await factory.getPlatformFee()).to.equal(feeBefore);
      expect(await factory.getTreasury()).to.equal(treasuryBefore);
      
      const profileAfter = await factory.getUserProfile(user1.address);
      expect(profileAfter.userType).to.equal(profileBefore.userType);
      expect(profileAfter.metadataURI).to.equal(profileBefore.metadataURI);
      expect(profileAfter.isActive).to.equal(profileBefore.isActive);
    });
  });

  describe('Storage Slots', function () {
    it('Should use correct ERC-1967 storage slots', async function () {
      const { proxy, implementation, proxyAdmin } = await loadFixture(deployFactoryFixture);

      // ERC-1967 storage slots
      const IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
      const ADMIN_SLOT = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';

      const proxyAddress = await proxy.getAddress();

      // Get implementation from storage
      const implValue = await ethers.provider.getStorage(proxyAddress, IMPLEMENTATION_SLOT);
      const implFromStorage = ethers.getAddress('0x' + implValue.slice(-40));
      expect(implFromStorage).to.equal(await implementation.getAddress());

      // Get admin from storage
      const adminValue = await ethers.provider.getStorage(proxyAddress, ADMIN_SLOT);
      const adminFromStorage = ethers.getAddress('0x' + adminValue.slice(-40));
      expect(adminFromStorage).to.equal(await proxyAdmin.getAddress());
    });
  });
});





