/**
 * CrowdVCFactory User Registration Tests
 *
 * Comprehensive tests for user registration, profile management, and role assignments.
 *
 * Coverage:
 * - User registration (startup and investor)
 * - Invalid user type handling
 * - Duplicate registration prevention
 * - User profile retrieval
 * - User type updates (admin only)
 * - Role assignment verification
 * - Event emissions
 * - Edge cases
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import hre from 'hardhat';
import { getAddress } from 'viem';
import {
  UserType,
  STARTUP_ROLE,
  INVESTOR_ROLE,
  ADMIN_ROLE,
  DEFAULT_METADATA_URI,
  ERRORS,
  deployFactoryFixture,
} from './helpers/index.js';

const { viem, networkHelpers } = await hre.network.connect();

describe('CrowdVCFactory - User Registration', function () {
  describe('registerUser', function () {
    describe('Startup Registration', function () {
      it('should register a user as startup successfully', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const hash = await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const profile = await factory.read.getUserProfile([
          getAddress(startup1.account.address),
        ]);

        assert.strictEqual(
          profile.userType,
          UserType.Startup,
          'UserType should be Startup'
        );
        assert.strictEqual(
          profile.metadataURI,
          DEFAULT_METADATA_URI,
          'metadataURI should match'
        );
        assert.strictEqual(profile.isActive, true, 'isActive should be true');
        assert.ok(profile.registeredAt > 0n, 'registeredAt should be set');
      });

      it('should grant STARTUP_ROLE to registered startup', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        const hasRole = await factory.read.hasRole([
          STARTUP_ROLE,
          getAddress(startup1.account.address),
        ]);

        assert.strictEqual(hasRole, true, 'Should have STARTUP_ROLE');
      });

      it('should emit UserRegistered event for startup', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const hash = await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.UserRegistered();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(
          logs[0].args.user,
          getAddress(startup1.account.address),
          'User address should match'
        );
        assert.strictEqual(
          logs[0].args.userType,
          UserType.Startup,
          'UserType should be Startup'
        );
        assert.ok(logs[0].args.timestamp > 0n, 'Timestamp should be set');
      });
    });

    describe('Investor Registration', function () {
      it('should register a user as investor successfully', async function () {
        const { factory, investor1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const hash = await factory.write.registerUser(
          [UserType.Investor, DEFAULT_METADATA_URI],
          { account: investor1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const profile = await factory.read.getUserProfile([
          getAddress(investor1.account.address),
        ]);

        assert.strictEqual(
          profile.userType,
          UserType.Investor,
          'UserType should be Investor'
        );
        assert.strictEqual(
          profile.metadataURI,
          DEFAULT_METADATA_URI,
          'metadataURI should match'
        );
        assert.strictEqual(profile.isActive, true, 'isActive should be true');
      });

      it('should grant INVESTOR_ROLE to registered investor', async function () {
        const { factory, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await factory.write.registerUser(
          [UserType.Investor, DEFAULT_METADATA_URI],
          { account: investor1.account }
        );

        const hasRole = await factory.read.hasRole([
          INVESTOR_ROLE,
          getAddress(investor1.account.address),
        ]);

        assert.strictEqual(hasRole, true, 'Should have INVESTOR_ROLE');
      });

      it('should emit UserRegistered event for investor', async function () {
        const { factory, investor1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const hash = await factory.write.registerUser(
          [UserType.Investor, DEFAULT_METADATA_URI],
          { account: investor1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.UserRegistered();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(
          logs[0].args.user,
          getAddress(investor1.account.address),
          'User address should match'
        );
        assert.strictEqual(
          logs[0].args.userType,
          UserType.Investor,
          'UserType should be Investor'
        );
      });
    });

    describe('Invalid Registration Attempts', function () {
      it('should revert when registering with UserType.None', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.registerUser(
              [UserType.None, DEFAULT_METADATA_URI],
              { account: startup1.account }
            );
          },
          /InvalidUserType/,
          'Should revert with InvalidUserType'
        );
      });

      it('should revert when registering with UserType.Admin', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.registerUser(
              [UserType.Admin, DEFAULT_METADATA_URI],
              { account: startup1.account }
            );
          },
          /InvalidUserType/,
          'Should revert with InvalidUserType'
        );
      });

      it('should revert when user is already registered', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // First registration
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Second registration attempt
        await assert.rejects(
          async () => {
            await factory.write.registerUser(
              [UserType.Investor, 'ipfs://different'],
              { account: startup1.account }
            );
          },
          /AlreadyRegistered/,
          'Should revert with AlreadyRegistered'
        );
      });

      it('should revert with empty metadata URI', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.registerUser([UserType.Startup, ''], {
              account: startup1.account,
            });
          },
          /InvalidString/,
          'Should revert with InvalidString'
        );
      });

      it('should revert when contract is paused', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Pause the contract
        await factory.write.pause({ account: owner.account });

        await assert.rejects(
          async () => {
            await factory.write.registerUser(
              [UserType.Startup, DEFAULT_METADATA_URI],
              { account: startup1.account }
            );
          },
          /EnforcedPause/,
          'Should revert with EnforcedPause'
        );
      });
    });

    describe('Multiple User Registration', function () {
      it('should allow multiple different users to register', async function () {
        const { factory, startup1, startup2, investor1, investor2 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await factory.write.registerUser(
          [UserType.Startup, 'ipfs://startup1'],
          { account: startup1.account }
        );
        await factory.write.registerUser(
          [UserType.Startup, 'ipfs://startup2'],
          { account: startup2.account }
        );
        await factory.write.registerUser(
          [UserType.Investor, 'ipfs://investor1'],
          { account: investor1.account }
        );
        await factory.write.registerUser(
          [UserType.Investor, 'ipfs://investor2'],
          { account: investor2.account }
        );

        // Verify all registrations
        const profile1 = await factory.read.getUserProfile([
          getAddress(startup1.account.address),
        ]);
        const profile2 = await factory.read.getUserProfile([
          getAddress(startup2.account.address),
        ]);
        const profile3 = await factory.read.getUserProfile([
          getAddress(investor1.account.address),
        ]);
        const profile4 = await factory.read.getUserProfile([
          getAddress(investor2.account.address),
        ]);

        assert.strictEqual(profile1.userType, UserType.Startup);
        assert.strictEqual(profile2.userType, UserType.Startup);
        assert.strictEqual(profile3.userType, UserType.Investor);
        assert.strictEqual(profile4.userType, UserType.Investor);
      });

      it('should emit separate events for each registration', async function () {
        const { factory, startup1, investor1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        const hash1 = await factory.write.registerUser(
          [UserType.Startup, 'ipfs://startup1'],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash1 });

        const hash2 = await factory.write.registerUser(
          [UserType.Investor, 'ipfs://investor1'],
          { account: investor1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash2 });

        const logs = await factory.getEvents.UserRegistered();

        assert.strictEqual(logs.length, 2, 'Should emit two events');
        assert.strictEqual(
          logs[0].args.user,
          getAddress(startup1.account.address)
        );
        assert.strictEqual(
          logs[1].args.user,
          getAddress(investor1.account.address)
        );
      });
    });
  });

  describe('updateUserType', function () {
    describe('Successful Updates', function () {
      it('should allow admin to update user type from Startup to Investor', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Update to investor
        await factory.write.updateUserType(
          [getAddress(startup1.account.address), UserType.Investor],
          { account: owner.account }
        );

        const profile = await factory.read.getUserProfile([
          getAddress(startup1.account.address),
        ]);

        assert.strictEqual(
          profile.userType,
          UserType.Investor,
          'UserType should be Investor'
        );
      });

      it('should allow admin to update user type from Investor to Startup', async function () {
        const { factory, owner, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as investor
        await factory.write.registerUser(
          [UserType.Investor, DEFAULT_METADATA_URI],
          { account: investor1.account }
        );

        // Update to startup
        await factory.write.updateUserType(
          [getAddress(investor1.account.address), UserType.Startup],
          { account: owner.account }
        );

        const profile = await factory.read.getUserProfile([
          getAddress(investor1.account.address),
        ]);

        assert.strictEqual(
          profile.userType,
          UserType.Startup,
          'UserType should be Startup'
        );
      });

      it('should allow admin to promote user to Admin type', async function () {
        const { factory, owner, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as investor
        await factory.write.registerUser(
          [UserType.Investor, DEFAULT_METADATA_URI],
          { account: investor1.account }
        );

        // Promote to admin
        await factory.write.updateUserType(
          [getAddress(investor1.account.address), UserType.Admin],
          { account: owner.account }
        );

        const profile = await factory.read.getUserProfile([
          getAddress(investor1.account.address),
        ]);

        assert.strictEqual(
          profile.userType,
          UserType.Admin,
          'UserType should be Admin'
        );

        // Verify admin role granted
        const hasAdminRole = await factory.read.hasRole([
          ADMIN_ROLE,
          getAddress(investor1.account.address),
        ]);
        assert.strictEqual(hasAdminRole, true, 'Should have ADMIN_ROLE');
      });

      it('should revoke old role when updating user type', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Verify has startup role
        let hasStartupRole = await factory.read.hasRole([
          STARTUP_ROLE,
          getAddress(startup1.account.address),
        ]);
        assert.strictEqual(hasStartupRole, true, 'Should have STARTUP_ROLE');

        // Update to investor
        await factory.write.updateUserType(
          [getAddress(startup1.account.address), UserType.Investor],
          { account: owner.account }
        );

        // Verify startup role revoked
        hasStartupRole = await factory.read.hasRole([
          STARTUP_ROLE,
          getAddress(startup1.account.address),
        ]);
        assert.strictEqual(
          hasStartupRole,
          false,
          'Should not have STARTUP_ROLE'
        );

        // Verify investor role granted
        const hasInvestorRole = await factory.read.hasRole([
          INVESTOR_ROLE,
          getAddress(startup1.account.address),
        ]);
        assert.strictEqual(hasInvestorRole, true, 'Should have INVESTOR_ROLE');
      });

      it('should emit UserTypeUpdated event', async function () {
        const { factory, owner, startup1, publicClient } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Update to investor
        const hash = await factory.write.updateUserType(
          [getAddress(startup1.account.address), UserType.Investor],
          { account: owner.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.UserTypeUpdated();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(
          logs[0].args.user,
          getAddress(startup1.account.address),
          'User address should match'
        );
        assert.strictEqual(
          logs[0].args.oldType,
          UserType.Startup,
          'Old type should be Startup'
        );
        assert.strictEqual(
          logs[0].args.newType,
          UserType.Investor,
          'New type should be Investor'
        );
      });
    });

    describe('Failed Updates', function () {
      it('should revert when non-admin tries to update user type', async function () {
        const { factory, startup1, investor1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Non-admin tries to update
        await assert.rejects(
          async () => {
            await factory.write.updateUserType(
              [getAddress(startup1.account.address), UserType.Investor],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });

      it('should revert when updating non-registered user', async function () {
        const { factory, owner, unauthorized } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.updateUserType(
              [getAddress(unauthorized.account.address), UserType.Investor],
              { account: owner.account }
            );
          },
          /UserNotRegistered/,
          'Should revert with UserNotRegistered'
        );
      });

      it('should revert when updating to UserType.None', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        await assert.rejects(
          async () => {
            await factory.write.updateUserType(
              [getAddress(startup1.account.address), UserType.None],
              { account: owner.account }
            );
          },
          /InvalidType/,
          'Should revert with InvalidType'
        );
      });

      it('should revert when updating to same type', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        // Register as startup
        await factory.write.registerUser(
          [UserType.Startup, DEFAULT_METADATA_URI],
          { account: startup1.account }
        );

        // Try to update to same type
        // This might succeed or fail depending on contract implementation
        // Testing the expected behavior
        await assert.rejects(
          async () => {
            await factory.write.updateUserType(
              [getAddress(startup1.account.address), UserType.Startup],
              { account: owner.account }
            );
          },
          /SameUserType/,
          'Should revert when updating to same type'
        );
      });
    });
  });

  describe('getUserProfile', function () {
    it('should return correct profile for registered user', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const customMetadata = 'ipfs://QmCustomMetadata123';
      await factory.write.registerUser([UserType.Startup, customMetadata], {
        account: startup1.account,
      });

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(profile.userType, UserType.Startup);
      assert.strictEqual(profile.metadataURI, customMetadata);
      assert.strictEqual(profile.isActive, true);
      assert.ok(profile.registeredAt > 0n);
    });

    it('should return default values for unregistered user', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const profile = await factory.read.getUserProfile([
        getAddress(unauthorized.account.address),
      ]);

      assert.strictEqual(profile.userType, UserType.None);
      assert.strictEqual(profile.metadataURI, '');
      assert.strictEqual(profile.isActive, false);
      assert.strictEqual(profile.registeredAt, 0n);
    });
  });

  describe('Edge Cases', function () {
    it('should handle very long metadata URI', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Create a long but valid IPFS-like URI
      const longMetadata = 'ipfs://Qm' + 'a'.repeat(200);

      await factory.write.registerUser([UserType.Startup, longMetadata], {
        account: startup1.account,
      });

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(profile.metadataURI, longMetadata);
    });

    it('should preserve timestamp after type update', async function () {
      const { factory, owner, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.registerUser(
        [UserType.Startup, DEFAULT_METADATA_URI],
        { account: startup1.account }
      );

      const profileBefore = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);
      const originalTimestamp = profileBefore.registeredAt;

      // Update type
      await factory.write.updateUserType(
        [getAddress(startup1.account.address), UserType.Investor],
        { account: owner.account }
      );

      const profileAfter = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);

      // Timestamp should remain the same
      assert.strictEqual(profileAfter.registeredAt, originalTimestamp);
    });

    it('should preserve metadata URI after type update', async function () {
      const { factory, owner, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      const customMetadata = 'ipfs://QmPreserveMe';
      await factory.write.registerUser([UserType.Startup, customMetadata], {
        account: startup1.account,
      });

      // Update type
      await factory.write.updateUserType(
        [getAddress(startup1.account.address), UserType.Investor],
        { account: owner.account }
      );

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(profile.metadataURI, customMetadata);
    });

    it('should preserve isActive status after type update', async function () {
      const { factory, owner, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.registerUser(
        [UserType.Startup, DEFAULT_METADATA_URI],
        { account: startup1.account }
      );

      // Update type
      await factory.write.updateUserType(
        [getAddress(startup1.account.address), UserType.Investor],
        { account: owner.account }
      );

      const profile = await factory.read.getUserProfile([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(profile.isActive, true);
    });

    it('should allow newly promoted admin to perform admin actions', async function () {
      const { factory, owner, investor1, investor2 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      // Register investor1
      await factory.write.registerUser(
        [UserType.Investor, DEFAULT_METADATA_URI],
        { account: investor1.account }
      );

      // Register investor2
      await factory.write.registerUser(
        [UserType.Investor, DEFAULT_METADATA_URI],
        { account: investor2.account }
      );

      // Promote investor1 to admin
      await factory.write.updateUserType(
        [getAddress(investor1.account.address), UserType.Admin],
        { account: owner.account }
      );

      // investor1 should now be able to update investor2's type
      await factory.write.updateUserType(
        [getAddress(investor2.account.address), UserType.Startup],
        { account: investor1.account }
      );

      const profile = await factory.read.getUserProfile([
        getAddress(investor2.account.address),
      ]);
      assert.strictEqual(profile.userType, UserType.Startup);
    });
  });

  describe('Role Assignment Verification', function () {
    it('should not have INVESTOR_ROLE after registering as startup', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.registerUser(
        [UserType.Startup, DEFAULT_METADATA_URI],
        { account: startup1.account }
      );

      const hasInvestorRole = await factory.read.hasRole([
        INVESTOR_ROLE,
        getAddress(startup1.account.address),
      ]);
      assert.strictEqual(hasInvestorRole, false);
    });

    it('should not have STARTUP_ROLE after registering as investor', async function () {
      const { factory, investor1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.registerUser(
        [UserType.Investor, DEFAULT_METADATA_URI],
        { account: investor1.account }
      );

      const hasStartupRole = await factory.read.hasRole([
        STARTUP_ROLE,
        getAddress(investor1.account.address),
      ]);
      assert.strictEqual(hasStartupRole, false);
    });

    it('should not have ADMIN_ROLE after registering', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(deployFactoryFixture);

      await factory.write.registerUser(
        [UserType.Startup, DEFAULT_METADATA_URI],
        { account: startup1.account }
      );

      const hasAdminRole = await factory.read.hasRole([
        ADMIN_ROLE,
        getAddress(startup1.account.address),
      ]);
      assert.strictEqual(hasAdminRole, false);
    });
  });
});
