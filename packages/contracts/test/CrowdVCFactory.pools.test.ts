/**
 * CrowdVCFactory Pool Management Tests
 *
 * Comprehensive tests for pool creation, startup management, and pool activation.
 *
 * Coverage:
 * - Pool creation with valid parameters
 * - Parameter validation (funding goal, durations, tokens)
 * - Startup addition/removal from pools
 * - Pool activation
 * - Emergency withdrawal
 * - Event emissions
 * - Edge cases and boundary conditions
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import hre from 'hardhat';
import { getAddress, keccak256, toBytes } from 'viem';
import {
  PitchStatus,
  PoolStatus,
  DEFAULT_POOL_NAME,
  DEFAULT_POOL_CATEGORY,
  DEFAULT_POOL_ID,
  DEFAULT_POOL_FUNDING_GOAL,
  DEFAULT_VOTING_DURATION,
  DEFAULT_FUNDING_DURATION,
  DEFAULT_MIN_CONTRIBUTION,
  DEFAULT_MAX_CONTRIBUTION,
  MIN_POOL_GOAL,
  MAX_POOL_GOAL,
  MIN_VOTING_DURATION,
  MAX_VOTING_DURATION,
  ZERO_ADDRESS,
  deployFactoryFixture,
  fixtureWithApprovedPitches,
  fixtureWithPool,
  createPoolParams,
  getPoolContract,
} from './helpers/index.js';

const { viem, networkHelpers } = await hre.network.connect();

describe('CrowdVCFactory - Pool Management', function () {
  describe('createPool', function () {
    describe('Successful Pool Creation', function () {
      it('should create a pool with valid parameters', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = {
          poolId: DEFAULT_POOL_ID,
          name: DEFAULT_POOL_NAME,
          category: DEFAULT_POOL_CATEGORY,
          fundingGoal: DEFAULT_POOL_FUNDING_GOAL,
          votingDuration: DEFAULT_VOTING_DURATION,
          fundingDuration: DEFAULT_FUNDING_DURATION,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
          minContribution: DEFAULT_MIN_CONTRIBUTION,
          maxContribution: DEFAULT_MAX_CONTRIBUTION,
        };

        const hash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        const logs = await factory.getEvents.PoolDeployed();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(logs[0].args.poolId, DEFAULT_POOL_ID, 'Pool ID should match');
        assert.notStrictEqual(
          logs[0].args.poolAddress,
          ZERO_ADDRESS,
          'Pool address should not be zero'
        );
      });

      it('should emit PoolDeployed event with correct parameters', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'event-test-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        const hash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        const logs = await factory.getEvents.PoolDeployed();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(logs[0].args.poolId, 'event-test-pool', 'Pool ID should match');
        assert.ok(logs[0].args.votingDeadline > 0n, 'Voting deadline should be set');
        assert.ok(logs[0].args.timestamp > 0n, 'Timestamp should be set');
      });

      it('should register pool in factory mappings', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'mapping-test-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        const hash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        // Check isPool
        const isPool = await factory.read.isPool([poolAddress]);
        assert.strictEqual(isPool, true, 'Should be registered as pool');

        // Check getAllPools
        const allPools = await factory.read.getAllPools();
        assert.ok(
          allPools.includes(poolAddress),
          'Should be in all pools list'
        );
      });

      it('should create pool with empty candidate pitches', async function () {
        const { factory, owner, usdt } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'empty-pitches-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        // Should not throw
        await factory.write.createPool([poolParams], { account: owner.account });
      });

      it('should create pool with maximum funding goal', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'max-goal-pool',
          fundingGoal: MAX_POOL_GOAL,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await factory.write.createPool([poolParams], { account: owner.account });
      });

      it('should create pool with minimum funding goal', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'min-goal-pool',
          fundingGoal: MIN_POOL_GOAL,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await factory.write.createPool([poolParams], { account: owner.account });
      });
    });

    describe('Pool Parameter Validation', function () {
      it('should reject empty pool ID', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: '',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidString/,
          'Should revert with InvalidString'
        );
      });

      it('should reject duplicate pool ID', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'duplicate-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        // Create first pool
        await factory.write.createPool([poolParams], { account: owner.account });

        // Try to create second pool with same ID
        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /PoolIdAlreadyExists/,
          'Should revert with PoolIdAlreadyExists'
        );
      });

      it('should reject empty pool name', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'empty-name-pool',
          name: '',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidString/,
          'Should revert with InvalidString'
        );
      });

      it('should reject funding goal below minimum', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'low-goal-pool',
          fundingGoal: MIN_POOL_GOAL - 1n,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidFundingGoal/,
          'Should revert with InvalidFundingGoal'
        );
      });

      it('should reject funding goal above maximum', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'high-goal-pool',
          fundingGoal: MAX_POOL_GOAL + 1n,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidFundingGoal/,
          'Should revert with InvalidFundingGoal'
        );
      });

      it('should reject voting duration below minimum', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'short-voting-pool',
          votingDuration: MIN_VOTING_DURATION - 1n,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidDuration/,
          'Should revert with InvalidDuration'
        );
      });

      it('should reject voting duration above maximum', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'long-voting-pool',
          votingDuration: MAX_VOTING_DURATION + 1n,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidDuration/,
          'Should revert with InvalidDuration'
        );
      });

      it('should reject unsupported token', async function () {
        const { factory, owner, pitch1Id, pitch2Id, unauthorized } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'bad-token-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: getAddress(unauthorized.account.address),
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /TokenNotSupported/,
          'Should revert with TokenNotSupported'
        );
      });

      it('should reject zero min contribution', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'zero-min-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
          minContribution: 0n,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidAmount/,
          'Should revert with InvalidAmount'
        );
      });

      it('should reject max contribution less than min contribution', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'invalid-max-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
          minContribution: 1000n * 10n ** 6n,
          maxContribution: 500n * 10n ** 6n, // Less than min
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /InvalidMaxContribution/,
          'Should revert with InvalidMaxContribution'
        );
      });

      it('should accept zero max contribution (no limit)', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'no-max-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
          minContribution: 1000n * 10n ** 6n,
          maxContribution: 0n, // No limit
        });

        await factory.write.createPool([poolParams], { account: owner.account });
      });
    });

    describe('Access Control', function () {
      it('should reject pool creation by non-admin', async function () {
        const { factory, usdt, pitch1Id, pitch2Id, investor1 } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const poolParams = createPoolParams({
          poolId: 'unauthorized-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: investor1.account });
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });

      it('should reject pool creation when paused', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        await factory.write.pause({ account: owner.account });

        const poolParams = createPoolParams({
          poolId: 'paused-pool',
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await assert.rejects(
          async () => {
            await factory.write.createPool([poolParams], { account: owner.account });
          },
          /EnforcedPause/,
          'Should revert with EnforcedPause'
        );
      });
    });
  });

  describe('addStartupToPool', function () {
    describe('Successful Additions', function () {
      it('should add startup to existing pool', async function () {
        const { factory, owner, usdt, pitch1Id, publicClient, startup1 } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Create pool without pitches
        const poolParams = createPoolParams({
          poolId: 'add-startup-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        // Add startup
        await factory.write.addStartupToPool(
          [poolAddress, pitch1Id, getAddress(startup1.account.address)],
          { account: owner.account }
        );

        // Verify pitch status changed to InPool
        const pitchData = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitchData.status, PitchStatus.InPool);
      });

      it('should add multiple startups to pool', async function () {
        const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient, startup1, startup2 } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Create pool without pitches
        const poolParams = createPoolParams({
          poolId: 'multi-startup-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        // Add startups
        await factory.write.addStartupToPool(
          [poolAddress, pitch1Id, getAddress(startup1.account.address)],
          { account: owner.account }
        );
        await factory.write.addStartupToPool(
          [poolAddress, pitch2Id, getAddress(startup2.account.address)],
          { account: owner.account }
        );

        // Verify both pitches in pool
        const pitch1Data = await factory.read.getPitchData([pitch1Id]);
        const pitch2Data = await factory.read.getPitchData([pitch2Id]);
        assert.strictEqual(pitch1Data.status, PitchStatus.InPool);
        assert.strictEqual(pitch2Data.status, PitchStatus.InPool);
      });
    });

    describe('Failed Additions', function () {
      it('should reject adding to non-existent pool', async function () {
        const { factory, owner, pitch1Id, startup1 } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        const fakePoolAddress =
          '0x1234567890123456789012345678901234567890' as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.addStartupToPool(
              [fakePoolAddress, pitch1Id, getAddress(startup1.account.address)],
              { account: owner.account }
            );
          },
          /InvalidPool/,
          'Should revert with InvalidPool'
        );
      });

      it('should reject adding non-existent pitch', async function () {
        const { factory, owner, usdt, publicClient, startup1 } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Create pool
        const poolParams = createPoolParams({
          poolId: 'fake-pitch-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        const fakePitchId =
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.addStartupToPool(
              [poolAddress, fakePitchId, getAddress(startup1.account.address)],
              { account: owner.account }
            );
          },
          /PitchDoesNotExist/,
          'Should revert with PitchDoesNotExist'
        );
      });

      it('should reject adding unapproved pitch', async function () {
        const { factory, owner, usdt, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Submit new pitch (pending status)
        const submitHash = await factory.write.submitPitch(
          ['Unapproved Pitch', 'ipfs://unapproved', DEFAULT_POOL_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: submitHash });
        const submitLogs = await factory.getEvents.PitchSubmitted();
        const pendingPitchId = submitLogs[submitLogs.length - 1].args.pitchId as `0x${string}`;

        // Create pool
        const poolParams = createPoolParams({
          poolId: 'unapproved-pitch-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const poolLogs = await factory.getEvents.PoolDeployed();
        const poolAddress = poolLogs[0].args.poolAddress as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.addStartupToPool(
              [poolAddress, pendingPitchId, getAddress(startup1.account.address)],
              { account: owner.account }
            );
          },
          /PitchNotApproved/,
          'Should revert with PitchNotApproved'
        );
      });

      it('should reject adding with zero wallet address', async function () {
        const { factory, owner, usdt, pitch1Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Create pool
        const poolParams = createPoolParams({
          poolId: 'zero-wallet-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.addStartupToPool(
              [poolAddress, pitch1Id, ZERO_ADDRESS],
              { account: owner.account }
            );
          },
          /InvalidAddress/,
          'Should revert with InvalidAddress'
        );
      });

      it('should reject by non-admin', async function () {
        const { factory, usdt, pitch1Id, investor1, startup1, publicClient, owner } =
          await networkHelpers.loadFixture(fixtureWithApprovedPitches);

        // Create pool
        const poolParams = createPoolParams({
          poolId: 'non-admin-pool',
          candidatePitches: [],
          acceptedToken: usdt.address,
        });

        const createHash = await factory.write.createPool([poolParams], {
          account: owner.account,
        });
        await publicClient.waitForTransactionReceipt({ hash: createHash });
        const logs = await factory.getEvents.PoolDeployed();
        const poolAddress = logs[0].args.poolAddress as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.addStartupToPool(
              [poolAddress, pitch1Id, getAddress(startup1.account.address)],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });
    });
  });

  describe('removeStartupFromPool', function () {
    it('should remove startup from pool', async function () {
      const { factory, owner, poolAddress, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPool);

      // Remove startup
      await factory.write.removeStartupFromPool([poolAddress, pitch1Id], {
        account: owner.account,
      });

      // Verify pitch status changed back to Approved
      const pitchData = await factory.read.getPitchData([pitch1Id]);
      assert.strictEqual(pitchData.status, PitchStatus.Approved);
    });

    it('should reject removing from non-pool address', async function () {
      const { factory, owner, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPool);

      const fakePoolAddress =
        '0x1234567890123456789012345678901234567890' as `0x${string}`;

      await assert.rejects(
        async () => {
          await factory.write.removeStartupFromPool([fakePoolAddress, pitch1Id], {
            account: owner.account,
          });
        },
        /InvalidPool/,
        'Should revert with InvalidPool'
      );
    });

    it('should reject removing pitch not in pool', async function () {
      const { factory, owner, poolAddress, startup1, publicClient } =
        await networkHelpers.loadFixture(fixtureWithPool);

      // Submit and approve a new pitch
      const submitHash = await factory.write.submitPitch(
        ['New Pitch', 'ipfs://new', DEFAULT_POOL_FUNDING_GOAL],
        { account: startup1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash: submitHash });
      const logs = await factory.getEvents.PitchSubmitted();
      const newPitchId = logs[logs.length - 1].args.pitchId as `0x${string}`;

      await factory.write.updatePitchStatus([newPitchId, PitchStatus.Approved], {
        account: owner.account,
      });

      // Try to remove pitch that is not in pool
      await assert.rejects(
        async () => {
          await factory.write.removeStartupFromPool([poolAddress, newPitchId], {
            account: owner.account,
          });
        },
        /PitchNotInPool/,
        'Should revert with PitchNotInPool'
      );
    });

    it('should reject by non-admin', async function () {
      const { factory, poolAddress, pitch1Id, investor1 } =
        await networkHelpers.loadFixture(fixtureWithPool);

      await assert.rejects(
        async () => {
          await factory.write.removeStartupFromPool([poolAddress, pitch1Id], {
            account: investor1.account,
          });
        },
        /AccessControlUnauthorizedAccount/,
        'Should revert for non-admin'
      );
    });
  });

  describe('activatePool', function () {
    it('should activate pool', async function () {
      const { factory, owner, poolAddress, publicClient } =
        await networkHelpers.loadFixture(fixtureWithPool);

      const hash = await factory.write.activatePool([poolAddress], {
        account: owner.account,
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // Pool should still be active
      const pool = await getPoolContract(poolAddress);
      const status = await pool.read.status();
      assert.strictEqual(status, PoolStatus.Active);
    });

    it('should reject activating non-pool address', async function () {
      const { factory, owner } = await networkHelpers.loadFixture(fixtureWithPool);

      const fakePoolAddress =
        '0x1234567890123456789012345678901234567890' as `0x${string}`;

      await assert.rejects(
        async () => {
          await factory.write.activatePool([fakePoolAddress], { account: owner.account });
        },
        /InvalidPool/,
        'Should revert with InvalidPool'
      );
    });

    it('should reject by non-admin', async function () {
      const { factory, poolAddress, investor1 } =
        await networkHelpers.loadFixture(fixtureWithPool);

      await assert.rejects(
        async () => {
          await factory.write.activatePool([poolAddress], { account: investor1.account });
        },
        /AccessControlUnauthorizedAccount/,
        'Should revert for non-admin'
      );
    });
  });

  describe('emergencyWithdraw', function () {
    it('should emit EmergencyWithdrawal event', async function () {
      const { factory, owner, poolAddress, publicClient } =
        await networkHelpers.loadFixture(fixtureWithPool);

      const hash = await factory.write.emergencyWithdraw([poolAddress], {
        account: owner.account,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      const logs = await factory.getEvents.EmergencyWithdrawal();

      assert.strictEqual(logs.length, 1, 'Should emit one event');
      assert.strictEqual(logs[0].args.poolAddress, poolAddress, 'Pool address should match');
    });

    it('should reject emergency withdraw on non-pool address', async function () {
      const { factory, owner } = await networkHelpers.loadFixture(fixtureWithPool);

      const fakePoolAddress =
        '0x1234567890123456789012345678901234567890' as `0x${string}`;

      await assert.rejects(
        async () => {
          await factory.write.emergencyWithdraw([fakePoolAddress], {
            account: owner.account,
          });
        },
        /InvalidPool/,
        'Should revert with InvalidPool'
      );
    });

    it('should reject by non-admin', async function () {
      const { factory, poolAddress, investor1 } =
        await networkHelpers.loadFixture(fixtureWithPool);

      await assert.rejects(
        async () => {
          await factory.write.emergencyWithdraw([poolAddress], {
            account: investor1.account,
          });
        },
        /AccessControlUnauthorizedAccount/,
        'Should revert for non-admin'
      );
    });
  });

  describe('Pool Queries', function () {
    it('should return all pools', async function () {
      const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
        await networkHelpers.loadFixture(fixtureWithApprovedPitches);

      // Create multiple pools
      for (let i = 0; i < 3; i++) {
        const poolParams = createPoolParams({
          poolId: `query-pool-${i}`,
          candidatePitches: [pitch1Id, pitch2Id],
          acceptedToken: usdt.address,
        });

        await factory.write.createPool([poolParams], { account: owner.account });
      }

      const allPools = await factory.read.getAllPools();
      assert.strictEqual(allPools.length, 3, 'Should have 3 pools');
    });

    it('should return pool address by ID', async function () {
      const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
        await networkHelpers.loadFixture(fixtureWithApprovedPitches);

      const poolParams = createPoolParams({
        poolId: 'lookup-pool',
        candidatePitches: [pitch1Id, pitch2Id],
        acceptedToken: usdt.address,
      });

      const hash = await factory.write.createPool([poolParams], {
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      const logs = await factory.getEvents.PoolDeployed();
      const expectedAddress = logs[0].args.poolAddress as `0x${string}`;

      // Compute pool ID hash
      const poolIdHash = keccak256(toBytes('lookup-pool'));

      const actualAddress = await factory.read.getPoolAddress([poolIdHash]);
      assert.strictEqual(actualAddress, expectedAddress, 'Address should match');
    });

    it('should return pool ID by address', async function () {
      const { factory, owner, usdt, pitch1Id, pitch2Id, publicClient } =
        await networkHelpers.loadFixture(fixtureWithApprovedPitches);

      const poolParams = createPoolParams({
        poolId: 'reverse-lookup-pool',
        candidatePitches: [pitch1Id, pitch2Id],
        acceptedToken: usdt.address,
      });

      const hash = await factory.write.createPool([poolParams], {
        account: owner.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      const logs = await factory.getEvents.PoolDeployed();
      const poolAddress = logs[0].args.poolAddress as `0x${string}`;

      const poolIdHash = await factory.read.getPoolId([poolAddress]);

      // Compute expected hash
      const expectedHash = keccak256(toBytes('reverse-lookup-pool'));

      assert.strictEqual(poolIdHash, expectedHash, 'Pool ID hash should match');
    });

    it('should return zero address for non-existent pool ID', async function () {
      const { factory } = await networkHelpers.loadFixture(deployFactoryFixture);

      const fakePoolIdHash = keccak256(toBytes('non-existent-pool'));

      const address = await factory.read.getPoolAddress([fakePoolIdHash]);
      assert.strictEqual(address, ZERO_ADDRESS, 'Should return zero address');
    });
  });
});
