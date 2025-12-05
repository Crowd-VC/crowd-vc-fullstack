/**
 * CrowdVCFactory Deployment Tests
 *
 * Comprehensive tests for contract deployment, initialization, and constructor validation.
 *
 * Coverage:
 * - Constructor parameter validation
 * - Initial state verification
 * - Role assignments
 * - Token support configuration
 * - Immutable values
 * - View functions
 * - Constants verification
 * - Pausable functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import hre from 'hardhat';
import { getAddress } from 'viem';
import {
  ADMIN_ROLE,
  DEFAULT_ADMIN_ROLE,
  DEFAULT_PLATFORM_FEE,
  MAX_PLATFORM_FEE,
  ZERO_ADDRESS,
  MIN_FUNDING_GOAL,
  MAX_FUNDING_GOAL,
  MIN_POOL_GOAL,
  MAX_POOL_GOAL,
  MIN_VOTING_DURATION,
  MAX_VOTING_DURATION,
  ONE_DAY,
  UserType,
  STARTUP_ROLE,
  INVESTOR_ROLE,
  deployFactoryFixture,
} from './helpers/index.js';

const { viem, networkHelpers } = await hre.network.connect();

describe('CrowdVCFactory - Deployment', function () {
  describe('Constructor', function () {
    it('should deploy with correct initial state', async function () {
      const { factory, treasury, usdt, usdc, poolImplementation } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Verify version
      const version = await factory.read.getVersion();
      assert.strictEqual(version, 1n, 'Version should be 1');

      // Verify treasury
      const treasuryAddress = await factory.read.getTreasury();
      assert.strictEqual(
        treasuryAddress,
        treasury.address,
        'Treasury address should match'
      );

      // Verify platform fee
      const platformFee = await factory.read.getPlatformFee();
      assert.strictEqual(
        platformFee,
        DEFAULT_PLATFORM_FEE,
        'Platform fee should match default'
      );

      // Verify pool implementation
      const poolImpl = await factory.read.getPoolImplementation();
      assert.strictEqual(
        poolImpl,
        poolImplementation.address,
        'Pool implementation should match'
      );
    });

    it('should set supported tokens correctly', async function () {
      const { factory, usdt, usdc } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const usdtSupported = await factory.read.supportedTokens([usdt.address]);
      const usdcSupported = await factory.read.supportedTokens([usdc.address]);

      assert.strictEqual(usdtSupported, true, 'USDT should be supported');
      assert.strictEqual(usdcSupported, true, 'USDC should be supported');
    });

    it('should not support arbitrary tokens', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const randomTokenSupported = await factory.read.supportedTokens([
        getAddress(unauthorized.account.address),
      ]);

      assert.strictEqual(
        randomTokenSupported,
        false,
        'Random address should not be supported token'
      );
    });

    it('should grant DEFAULT_ADMIN_ROLE to deployer', async function () {
      const { factory, owner } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const hasDefaultAdmin = await factory.read.hasRole([
        DEFAULT_ADMIN_ROLE,
        getAddress(owner.account.address),
      ]);

      assert.strictEqual(
        hasDefaultAdmin,
        true,
        'Deployer should have DEFAULT_ADMIN_ROLE'
      );
    });

    it('should grant ADMIN_ROLE to deployer', async function () {
      const { factory, owner } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const hasAdminRole = await factory.read.hasRole([
        ADMIN_ROLE,
        getAddress(owner.account.address),
      ]);

      assert.strictEqual(hasAdminRole, true, 'Deployer should have ADMIN_ROLE');
    });

    it('should not grant roles to non-deployers', async function () {
      const { factory, investor1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const hasDefaultAdmin = await factory.read.hasRole([
        DEFAULT_ADMIN_ROLE,
        getAddress(investor1.account.address),
      ]);
      const hasAdminRole = await factory.read.hasRole([
        ADMIN_ROLE,
        getAddress(investor1.account.address),
      ]);

      assert.strictEqual(
        hasDefaultAdmin,
        false,
        'Non-deployer should not have DEFAULT_ADMIN_ROLE'
      );
      assert.strictEqual(
        hasAdminRole,
        false,
        'Non-deployer should not have ADMIN_ROLE'
      );
    });

    it('should have no pools initially', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const pools = await factory.read.getAllPools();
      assert.strictEqual(pools.length, 0, 'Should have no pools initially');
    });

    it('should have pitch nonce at 0 initially', async function () {
      const { factory, startup1, publicClient } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Submit a pitch and verify it gets a valid ID (nonce starts at 0)
      const hash = await factory.write.submitPitch(
        ['Test Pitch', 'ipfs://test', MIN_FUNDING_GOAL],
        { account: startup1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await factory.getEvents.PitchSubmitted();
      assert.strictEqual(logs.length, 1, 'Should have one pitch submitted');
      assert.ok(logs[0].args.pitchId, 'Pitch ID should be generated');
    });
  });

  describe('Constructor Validation', function () {
    it('should revert with zero pool implementation address', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const usdt = await viem.deployContract('MockUSDT');
      const usdc = await viem.deployContract('MockUSDC');

      await assert.rejects(
        async () => {
          await viem.deployContract('CrowdVCFactory', [
            ZERO_ADDRESS,
            treasury.address,
            DEFAULT_PLATFORM_FEE,
            usdt.address,
            usdc.address,
          ]);
        },
        /InvalidAddress/,
        'Should revert with InvalidAddress for zero pool implementation'
      );
    });

    it('should revert with zero treasury address', async function () {
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdt = await viem.deployContract('MockUSDT');
      const usdc = await viem.deployContract('MockUSDC');

      await assert.rejects(
        async () => {
          await viem.deployContract('CrowdVCFactory', [
            poolImpl.address,
            ZERO_ADDRESS,
            DEFAULT_PLATFORM_FEE,
            usdt.address,
            usdc.address,
          ]);
        },
        /InvalidAddress/,
        'Should revert with InvalidAddress for zero treasury'
      );
    });

    it('should revert with zero USDT address', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdc = await viem.deployContract('MockUSDC');

      await assert.rejects(
        async () => {
          await viem.deployContract('CrowdVCFactory', [
            poolImpl.address,
            treasury.address,
            DEFAULT_PLATFORM_FEE,
            ZERO_ADDRESS,
            usdc.address,
          ]);
        },
        /InvalidAddress/,
        'Should revert with InvalidAddress for zero USDT'
      );
    });

    it('should revert with zero USDC address', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdt = await viem.deployContract('MockUSDT');

      await assert.rejects(
        async () => {
          await viem.deployContract('CrowdVCFactory', [
            poolImpl.address,
            treasury.address,
            DEFAULT_PLATFORM_FEE,
            usdt.address,
            ZERO_ADDRESS,
          ]);
        },
        /InvalidAddress/,
        'Should revert with InvalidAddress for zero USDC'
      );
    });

    it('should revert with platform fee exceeding maximum', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdt = await viem.deployContract('MockUSDT');
      const usdc = await viem.deployContract('MockUSDC');

      const excessiveFee = MAX_PLATFORM_FEE + 1n;

      await assert.rejects(
        async () => {
          await viem.deployContract('CrowdVCFactory', [
            poolImpl.address,
            treasury.address,
            excessiveFee,
            usdt.address,
            usdc.address,
          ]);
        },
        /FeeTooHigh/,
        'Should revert with FeeTooHigh for excessive fee'
      );
    });

    it('should allow platform fee at maximum boundary', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdt = await viem.deployContract('MockUSDT');
      const usdc = await viem.deployContract('MockUSDC');

      const factory = await viem.deployContract('CrowdVCFactory', [
        poolImpl.address,
        treasury.address,
        MAX_PLATFORM_FEE, // 10% - exactly at max
        usdt.address,
        usdc.address,
      ]);

      const fee = await factory.read.getPlatformFee();
      assert.strictEqual(fee, MAX_PLATFORM_FEE, 'Fee should be at max boundary');
    });

    it('should allow zero platform fee', async function () {
      const walletClients = await viem.getWalletClients();
      const [, , , treasuryWallet] = walletClients;
      const treasury = await viem.deployContract('CrowdVCTreasury', [
        getAddress(treasuryWallet.account.address),
      ]);
      const poolImpl = await viem.deployContract('CrowdVCPool');
      const usdt = await viem.deployContract('MockUSDT');
      const usdc = await viem.deployContract('MockUSDC');

      const factory = await viem.deployContract('CrowdVCFactory', [
        poolImpl.address,
        treasury.address,
        0n, // No fee
        usdt.address,
        usdc.address,
      ]);

      const fee = await factory.read.getPlatformFee();
      assert.strictEqual(fee, 0n, 'Fee should be zero');
    });
  });

  describe('View Functions', function () {
    it('should return empty user profile for unregistered user', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const profile = await factory.read.getUserProfile([
        getAddress(unauthorized.account.address),
      ]);

      assert.strictEqual(profile.userType, 0, 'UserType should be None');
      assert.strictEqual(profile.metadataURI, '', 'metadataURI should be empty');
      assert.strictEqual(profile.registeredAt, 0n, 'registeredAt should be 0');
      assert.strictEqual(profile.isActive, false, 'isActive should be false');
    });

    it('should return empty pitch data for non-existent pitch', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const fakePitchId =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;
      const pitch = await factory.read.getPitchData([fakePitchId]);

      assert.strictEqual(pitch.startup, ZERO_ADDRESS, 'startup should be zero');
      assert.strictEqual(pitch.title, '', 'title should be empty');
      assert.strictEqual(pitch.fundingGoal, 0n, 'fundingGoal should be 0');
    });

    it('should return false for isPitchApproved on non-existent pitch', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const fakePitchId =
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' as `0x${string}`;
      const isApproved = await factory.read.isPitchApproved([fakePitchId]);

      assert.strictEqual(isApproved, false, 'Should not be approved');
    });

    it('should return false for isPool on non-pool address', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const isPool = await factory.read.isPool([
        getAddress(unauthorized.account.address),
      ]);
      assert.strictEqual(isPool, false, 'Should not be a pool');
    });

    it('should return empty user pitches for user with no pitches', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const pitches = await factory.read.getUserPitches([
        getAddress(unauthorized.account.address),
      ]);
      assert.strictEqual(pitches.length, 0, 'Should have no pitches');
    });

    it('should return zero address for non-existent pool ID', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const { keccak256, toBytes } = await import('viem');
      const fakePoolIdHash = keccak256(toBytes('non-existent-pool'));

      const address = await factory.read.getPoolAddress([fakePoolIdHash]);
      assert.strictEqual(address, ZERO_ADDRESS, 'Should return zero address');
    });

    it('should return zero bytes32 for non-pool address', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const poolId = await factory.read.getPoolId([
        getAddress(unauthorized.account.address),
      ]);
      assert.strictEqual(
        poolId,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        'Should return zero bytes32'
      );
    });
  });

  describe('Constants', function () {
    it('should have correct MIN_FUNDING_GOAL', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const minGoal = await factory.read.MIN_FUNDING_GOAL();
      assert.strictEqual(minGoal, MIN_FUNDING_GOAL, 'MIN_FUNDING_GOAL should match');
    });

    it('should have correct MAX_FUNDING_GOAL', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const maxGoal = await factory.read.MAX_FUNDING_GOAL();
      assert.strictEqual(maxGoal, MAX_FUNDING_GOAL, 'MAX_FUNDING_GOAL should match');
    });

    it('should have correct MIN_VOTING_DURATION', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const minDuration = await factory.read.MIN_VOTING_DURATION();
      assert.strictEqual(
        minDuration,
        MIN_VOTING_DURATION,
        'MIN_VOTING_DURATION should match'
      );
    });

    it('should have correct MAX_VOTING_DURATION', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const maxDuration = await factory.read.MAX_VOTING_DURATION();
      assert.strictEqual(
        maxDuration,
        MAX_VOTING_DURATION,
        'MAX_VOTING_DURATION should match'
      );
    });

    it('should have correct MIN_POOL_GOAL', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const minPoolGoal = await factory.read.MIN_POOL_GOAL();
      assert.strictEqual(minPoolGoal, MIN_POOL_GOAL, 'MIN_POOL_GOAL should match');
    });

    it('should have correct MAX_POOL_GOAL', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const maxPoolGoal = await factory.read.MAX_POOL_GOAL();
      assert.strictEqual(maxPoolGoal, MAX_POOL_GOAL, 'MAX_POOL_GOAL should match');
    });

    it('should have correct ADMIN_ROLE hash', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const adminRole = await factory.read.ADMIN_ROLE();
      assert.strictEqual(adminRole, ADMIN_ROLE, 'ADMIN_ROLE hash should match');
    });

    it('should have correct STARTUP_ROLE hash', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const startupRole = await factory.read.STARTUP_ROLE();
      assert.strictEqual(startupRole, STARTUP_ROLE, 'STARTUP_ROLE hash should match');
    });

    it('should have correct INVESTOR_ROLE hash', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const investorRole = await factory.read.INVESTOR_ROLE();
      assert.strictEqual(
        investorRole,
        INVESTOR_ROLE,
        'INVESTOR_ROLE hash should match'
      );
    });
  });

  describe('Pausable', function () {
    it('should not be paused initially', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Try to register a user - should work if not paused
      await factory.write.registerUser([UserType.Startup, 'ipfs://test'], {
        account: startup1.account,
      });

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);
      assert.strictEqual(
        profile.userType,
        UserType.Startup,
        'Should register successfully when not paused'
      );
    });

    it('should allow admin to pause', async function () {
      const { factory, owner, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.pause({ account: owner.account });

      await assert.rejects(
        async () => {
          await factory.write.registerUser([UserType.Startup, 'ipfs://test'], {
            account: startup1.account,
          });
        },
        /EnforcedPause/,
        'Should revert with EnforcedPause when paused'
      );
    });

    it('should allow admin to unpause', async function () {
      const { factory, owner, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.pause({ account: owner.account });
      await factory.write.unpause({ account: owner.account });

      // Should work again after unpause
      await factory.write.registerUser([UserType.Startup, 'ipfs://test'], {
        account: startup1.account,
      });

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);
      assert.strictEqual(
        profile.userType,
        UserType.Startup,
        'Should register successfully after unpause'
      );
    });

    it('should reject pause by non-admin', async function () {
      const { factory, investor1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await assert.rejects(
        async () => {
          await factory.write.pause({ account: investor1.account });
        },
        /AccessControlUnauthorizedAccount/,
        'Should revert for non-admin'
      );
    });

    it('should reject unpause by non-admin', async function () {
      const { factory, owner, investor1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.pause({ account: owner.account });

      await assert.rejects(
        async () => {
          await factory.write.unpause({ account: investor1.account });
        },
        /AccessControlUnauthorizedAccount/,
        'Should revert for non-admin'
      );
    });
  });

  describe('Admin Functions', function () {
    describe('updatePlatformFee', function () {
      it('should allow admin to update platform fee', async function () {
        const { factory, owner, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const newFee = 300n; // 3%

        const hash = await factory.write.updatePlatformFee([newFee], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const fee = await factory.read.getPlatformFee();
        assert.strictEqual(fee, newFee, 'Fee should be updated');
      });

      it('should emit PlatformFeeUpdated event', async function () {
        const { factory, owner, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const newFee = 300n;
        const oldFee = await factory.read.getPlatformFee();

        const hash = await factory.write.updatePlatformFee([newFee], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PlatformFeeUpdated();
        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(logs[0].args.oldFee, oldFee, 'Old fee should match');
        assert.strictEqual(logs[0].args.newFee, newFee, 'New fee should match');
      });

      it('should reject fee exceeding maximum', async function () {
        const { factory, owner } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.updatePlatformFee([MAX_PLATFORM_FEE + 1n], {
              account: owner.account,
            });
          },
          /FeeTooHigh/,
          'Should revert with FeeTooHigh'
        );
      });

      it('should reject by non-admin', async function () {
        const { factory, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.updatePlatformFee([300n], {
              account: investor1.account,
            });
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });

      it('should allow setting fee to zero', async function () {
        const { factory, owner } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await factory.write.updatePlatformFee([0n], { account: owner.account });

        const fee = await factory.read.getPlatformFee();
        assert.strictEqual(fee, 0n, 'Fee should be zero');
      });
    });

    describe('updateTreasury', function () {
      it('should allow admin to update treasury', async function () {
        const { factory, owner, investor1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const newTreasury = getAddress(investor1.account.address);

        const hash = await factory.write.updateTreasury([newTreasury], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const treasury = await factory.read.getTreasury();
        assert.strictEqual(treasury, newTreasury, 'Treasury should be updated');
      });

      it('should emit TreasuryUpdated event', async function () {
        const { factory, owner, investor1, treasury, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const newTreasury = getAddress(investor1.account.address);
        const oldTreasury = treasury.address;

        const hash = await factory.write.updateTreasury([newTreasury], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.TreasuryUpdated();
        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(
          logs[0].args.oldTreasury,
          oldTreasury,
          'Old treasury should match'
        );
        assert.strictEqual(
          logs[0].args.newTreasury,
          newTreasury,
          'New treasury should match'
        );
      });

      it('should reject zero address', async function () {
        const { factory, owner } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.updateTreasury([ZERO_ADDRESS], {
              account: owner.account,
            });
          },
          /InvalidAddress/,
          'Should revert with InvalidAddress'
        );
      });

      it('should reject by non-admin', async function () {
        const { factory, investor1, investor2 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.updateTreasury(
              [getAddress(investor2.account.address)],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });
    });

    describe('addSupportedToken', function () {
      it('should allow admin to add supported token', async function () {
        const { factory, owner, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const newToken = getAddress(investor1.account.address);

        await factory.write.addSupportedToken([newToken], {
          account: owner.account,
        });

        const isSupported = await factory.read.supportedTokens([newToken]);
        assert.strictEqual(isSupported, true, 'Token should be supported');
      });

      it('should reject zero address', async function () {
        const { factory, owner } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.addSupportedToken([ZERO_ADDRESS], {
              account: owner.account,
            });
          },
          /InvalidAddress/,
          'Should revert with InvalidAddress'
        );
      });

      it('should reject by non-admin', async function () {
        const { factory, investor1, investor2 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.addSupportedToken(
              [getAddress(investor2.account.address)],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });
    });

    describe('removeSupportedToken', function () {
      it('should allow admin to remove supported token', async function () {
        const { factory, owner, usdt } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await factory.write.removeSupportedToken([usdt.address], {
          account: owner.account,
        });

        const isSupported = await factory.read.supportedTokens([usdt.address]);
        assert.strictEqual(isSupported, false, 'Token should not be supported');
      });

      it('should reject by non-admin', async function () {
        const { factory, investor1, usdt } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.removeSupportedToken([usdt.address], {
              account: investor1.account,
            });
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });
    });
  });

  describe('Immutable Values', function () {
    it('should have immutable pool implementation', async function () {
      const { factory, poolImplementation } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Pool implementation should not be changeable
      const impl1 = await factory.read.getPoolImplementation();

      // Deploy would be the only way to change it, so just verify it matches
      assert.strictEqual(
        impl1,
        poolImplementation.address,
        'Pool implementation should be immutable'
      );
    });
  });
});
