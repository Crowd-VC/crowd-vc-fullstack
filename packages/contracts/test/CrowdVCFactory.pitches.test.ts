/**
 * CrowdVCFactory Pitch Management Tests
 *
 * Comprehensive tests for pitch submission, status management, and retrieval.
 *
 * Coverage:
 * - Pitch submission by startups
 * - Pitch status workflow (Pending -> Approved/Rejected)
 * - Admin pitch management
 * - Pitch data retrieval and pagination
 * - Event emissions
 * - Access control
 * - Edge cases and validation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import hre from 'hardhat';
import { getAddress } from 'viem';
import {
  UserType,
  PitchStatus,
  DEFAULT_METADATA_URI,
  DEFAULT_PITCH_TITLE,
  DEFAULT_PITCH_IPFS,
  DEFAULT_PITCH_FUNDING_GOAL,
  MIN_FUNDING_GOAL,
  MAX_FUNDING_GOAL,
  ZERO_ADDRESS,
  deployFactoryFixture,
  fixtureWithUsers,
  fixtureWithPitches,
} from './helpers/index.js';

const { viem, networkHelpers } = await hre.network.connect();

describe('CrowdVCFactory - Pitch Management', function () {
  describe('submitPitch', function () {
    describe('Successful Submission', function () {
      it('should allow registered startup to submit a pitch', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash = await factory.write.submitPitch(
          [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PitchSubmitted();
        assert.strictEqual(logs.length, 1, 'Should emit one event');

        const pitchId = logs[0].args.pitchId as `0x${string}`;
        const pitch = await factory.read.getPitchData([pitchId]);

        assert.strictEqual(
          pitch.startup,
          getAddress(startup1.account.address),
          'Startup address should match'
        );
        assert.strictEqual(pitch.title, DEFAULT_PITCH_TITLE, 'Title should match');
        assert.strictEqual(
          pitch.ipfsHash,
          DEFAULT_PITCH_IPFS,
          'IPFS hash should match'
        );
        assert.strictEqual(
          pitch.fundingGoal,
          DEFAULT_PITCH_FUNDING_GOAL,
          'Funding goal should match'
        );
        assert.strictEqual(
          pitch.status,
          PitchStatus.Pending,
          'Status should be Pending'
        );
      });

      it('should emit PitchSubmitted event with correct data', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash = await factory.write.submitPitch(
          [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PitchSubmitted();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.ok(logs[0].args.pitchId, 'Pitch ID should be set');
        assert.strictEqual(
          logs[0].args.startup,
          getAddress(startup1.account.address),
          'Startup should match'
        );
        assert.strictEqual(
          logs[0].args.title,
          DEFAULT_PITCH_TITLE,
          'Title should match'
        );
        assert.ok(logs[0].args.timestamp > 0n, 'Timestamp should be set');
      });

      it('should track pitches by user', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        // Submit first pitch
        const hash1 = await factory.write.submitPitch(
          ['Pitch 1', 'ipfs://pitch1', MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash1 });

        // Submit second pitch
        const hash2 = await factory.write.submitPitch(
          ['Pitch 2', 'ipfs://pitch2', MIN_FUNDING_GOAL * 2n],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash2 });

        const userPitches = await factory.read.getUserPitches([
          getAddress(startup1.account.address),
        ]);

        assert.strictEqual(userPitches.length, 2, 'Should have 2 pitches');
      });

      it('should allow pitch with minimum funding goal', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash = await factory.write.submitPitch(
          ['Min Goal Pitch', 'ipfs://min', MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PitchSubmitted();
        const pitchId = logs[0].args.pitchId as `0x${string}`;
        const pitch = await factory.read.getPitchData([pitchId]);

        assert.strictEqual(pitch.fundingGoal, MIN_FUNDING_GOAL);
      });

      it('should allow pitch with maximum funding goal', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash = await factory.write.submitPitch(
          ['Max Goal Pitch', 'ipfs://max', MAX_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PitchSubmitted();
        const pitchId = logs[0].args.pitchId as `0x${string}`;
        const pitch = await factory.read.getPitchData([pitchId]);

        assert.strictEqual(pitch.fundingGoal, MAX_FUNDING_GOAL);
      });
    });

    describe('Failed Submission', function () {
      it('should revert when submitted by unregistered user', async function () {
        const { factory, unauthorized } =
          await networkHelpers.loadFixture(deployFactoryFixture);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
              { account: unauthorized.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for unregistered user'
        );
      });

      it('should revert when submitted by investor', async function () {
        const { factory, investor1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for investor'
        );
      });

      it('should revert with empty title', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              ['', DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
              { account: startup1.account }
            );
          },
          /InvalidString/,
          'Should revert with InvalidString'
        );
      });

      it('should revert with empty IPFS hash', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, '', DEFAULT_PITCH_FUNDING_GOAL],
              { account: startup1.account }
            );
          },
          /InvalidString/,
          'Should revert with InvalidString'
        );
      });

      it('should revert with funding goal below minimum', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, MIN_FUNDING_GOAL - 1n],
              { account: startup1.account }
            );
          },
          /InvalidFundingGoal/,
          'Should revert with InvalidFundingGoal'
        );
      });

      it('should revert with funding goal above maximum', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, MAX_FUNDING_GOAL + 1n],
              { account: startup1.account }
            );
          },
          /InvalidFundingGoal/,
          'Should revert with InvalidFundingGoal'
        );
      });

      it('should revert with zero funding goal', async function () {
        const { factory, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, 0n],
              { account: startup1.account }
            );
          },
          /InvalidFundingGoal/,
          'Should revert with InvalidFundingGoal'
        );
      });

      it('should revert when contract is paused', async function () {
        const { factory, owner, startup1 } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        await factory.write.pause({ account: owner.account });

        await assert.rejects(
          async () => {
            await factory.write.submitPitch(
              [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
              { account: startup1.account }
            );
          },
          /EnforcedPause/,
          'Should revert with EnforcedPause'
        );
      });
    });

    describe('Multiple Pitches', function () {
      it('should allow multiple startups to submit pitches', async function () {
        const { factory, startup1, startup2, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash1 = await factory.write.submitPitch(
          ['Startup 1 Pitch', 'ipfs://s1', MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash1 });

        const hash2 = await factory.write.submitPitch(
          ['Startup 2 Pitch', 'ipfs://s2', MIN_FUNDING_GOAL * 2n],
          { account: startup2.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash2 });

        const logs = await factory.getEvents.PitchSubmitted();
        assert.strictEqual(logs.length, 2, 'Should emit two events');

        const pitch1 = await factory.read.getPitchData([
          logs[0].args.pitchId as `0x${string}`,
        ]);
        const pitch2 = await factory.read.getPitchData([
          logs[1].args.pitchId as `0x${string}`,
        ]);

        assert.strictEqual(
          pitch1.startup,
          getAddress(startup1.account.address)
        );
        assert.strictEqual(
          pitch2.startup,
          getAddress(startup2.account.address)
        );
      });

      it('should generate unique pitch IDs', async function () {
        const { factory, startup1, publicClient } =
          await networkHelpers.loadFixture(fixtureWithUsers);

        const hash1 = await factory.write.submitPitch(
          ['Pitch 1', 'ipfs://p1', MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash1 });

        const hash2 = await factory.write.submitPitch(
          ['Pitch 2', 'ipfs://p2', MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash: hash2 });

        const logs = await factory.getEvents.PitchSubmitted();
        const pitchId1 = logs[0].args.pitchId;
        const pitchId2 = logs[1].args.pitchId;

        assert.notStrictEqual(pitchId1, pitchId2, 'Pitch IDs should be unique');
      });
    });
  });

  describe('updatePitchStatus', function () {
    describe('Successful Status Updates', function () {
      it('should allow admin to approve a pitch', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus([pitch1Id, PitchStatus.Approved], {
          account: owner.account,
        });

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Approved);
      });

      it('should allow admin to reject a pitch', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus([pitch1Id, PitchStatus.Rejected], {
          account: owner.account,
        });

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Rejected);
      });

      it('should allow admin to set pitch under review', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.UnderReview],
          { account: owner.account }
        );

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.UnderReview);
      });

      it('should allow admin to shortlist a pitch', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.Shortlisted],
          { account: owner.account }
        );

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Shortlisted);
      });

      it('should allow admin to request more info', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.NeedsMoreInfo],
          { account: owner.account }
        );

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.NeedsMoreInfo);
      });

      it('should allow admin to give conditional approval', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.ConditionalApproval],
          { account: owner.account }
        );

        const pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.ConditionalApproval);
      });

      it('should emit PitchStatusUpdated event', async function () {
        const { factory, owner, pitch1Id, publicClient } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        const hash = await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.Approved],
          { account: owner.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });

        const logs = await factory.getEvents.PitchStatusUpdated();

        assert.strictEqual(logs.length, 1, 'Should emit one event');
        assert.strictEqual(logs[0].args.pitchId, pitch1Id, 'Pitch ID should match');
        assert.strictEqual(
          logs[0].args.oldStatus,
          PitchStatus.Pending,
          'Old status should be Pending'
        );
        assert.strictEqual(
          logs[0].args.newStatus,
          PitchStatus.Approved,
          'New status should be Approved'
        );
      });
    });

    describe('Failed Status Updates', function () {
      it('should revert when non-admin tries to update status', async function () {
        const { factory, investor1, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await assert.rejects(
          async () => {
            await factory.write.updatePitchStatus(
              [pitch1Id, PitchStatus.Approved],
              { account: investor1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for non-admin'
        );
      });

      it('should revert when startup tries to update own pitch status', async function () {
        const { factory, startup1, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await assert.rejects(
          async () => {
            await factory.write.updatePitchStatus(
              [pitch1Id, PitchStatus.Approved],
              { account: startup1.account }
            );
          },
          /AccessControlUnauthorizedAccount/,
          'Should revert for startup'
        );
      });

      it('should revert for non-existent pitch', async function () {
        const { factory, owner } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        const fakePitchId =
          '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as `0x${string}`;

        await assert.rejects(
          async () => {
            await factory.write.updatePitchStatus(
              [fakePitchId, PitchStatus.Approved],
              { account: owner.account }
            );
          },
          /PitchDoesNotExist/,
          'Should revert with PitchDoesNotExist'
        );
      });

      it('should revert when contract is paused', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        await factory.write.pause({ account: owner.account });

        await assert.rejects(
          async () => {
            await factory.write.updatePitchStatus(
              [pitch1Id, PitchStatus.Approved],
              { account: owner.account }
            );
          },
          /EnforcedPause/,
          'Should revert with EnforcedPause'
        );
      });
    });

    describe('Status Workflow', function () {
      it('should allow transitioning through multiple statuses', async function () {
        const { factory, owner, pitch1Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        // Pending -> UnderReview
        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.UnderReview],
          { account: owner.account }
        );
        let pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.UnderReview);

        // UnderReview -> Shortlisted
        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.Shortlisted],
          { account: owner.account }
        );
        pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Shortlisted);

        // Shortlisted -> Approved
        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.Approved],
          { account: owner.account }
        );
        pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Approved);
      });

      it('should allow transitioning from any status to rejected', async function () {
        const { factory, owner, pitch1Id, pitch2Id, pitch3Id } =
          await networkHelpers.loadFixture(fixtureWithPitches);

        // Reject from Pending
        await factory.write.updatePitchStatus(
          [pitch1Id, PitchStatus.Rejected],
          { account: owner.account }
        );
        let pitch = await factory.read.getPitchData([pitch1Id]);
        assert.strictEqual(pitch.status, PitchStatus.Rejected);

        // Shortlist then reject
        await factory.write.updatePitchStatus(
          [pitch2Id, PitchStatus.Shortlisted],
          { account: owner.account }
        );
        await factory.write.updatePitchStatus(
          [pitch2Id, PitchStatus.Rejected],
          { account: owner.account }
        );
        pitch = await factory.read.getPitchData([pitch2Id]);
        assert.strictEqual(pitch.status, PitchStatus.Rejected);
      });
    });
  });

  describe('isPitchApproved', function () {
    it('should return true for approved pitch', async function () {
      const { factory, owner, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPitches);

      await factory.write.updatePitchStatus([pitch1Id, PitchStatus.Approved], {
        account: owner.account,
      });

      const isApproved = await factory.read.isPitchApproved([pitch1Id]);
      assert.strictEqual(isApproved, true);
    });

    it('should return false for pending pitch', async function () {
      const { factory, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPitches);

      const isApproved = await factory.read.isPitchApproved([pitch1Id]);
      assert.strictEqual(isApproved, false);
    });

    it('should return false for rejected pitch', async function () {
      const { factory, owner, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPitches);

      await factory.write.updatePitchStatus([pitch1Id, PitchStatus.Rejected], {
        account: owner.account,
      });

      const isApproved = await factory.read.isPitchApproved([pitch1Id]);
      assert.strictEqual(isApproved, false);
    });

    it('should return false for non-existent pitch', async function () {
      const { factory } = await networkHelpers.loadFixture(fixtureWithPitches);

      const fakePitchId =
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as `0x${string}`;

      const isApproved = await factory.read.isPitchApproved([fakePitchId]);
      assert.strictEqual(isApproved, false);
    });
  });

  describe('getPitchData', function () {
    it('should return correct pitch data', async function () {
      const { factory, startup1, pitch1Id } =
        await networkHelpers.loadFixture(fixtureWithPitches);

      const pitch = await factory.read.getPitchData([pitch1Id]);

      assert.strictEqual(
        pitch.startup,
        getAddress(startup1.account.address),
        'Startup address should match'
      );
      assert.strictEqual(
        pitch.title,
        DEFAULT_PITCH_TITLE,
        'Title should match'
      );
      assert.strictEqual(
        pitch.ipfsHash,
        DEFAULT_PITCH_IPFS,
        'IPFS hash should match'
      );
      assert.strictEqual(
        pitch.fundingGoal,
        DEFAULT_PITCH_FUNDING_GOAL,
        'Funding goal should match'
      );
      assert.strictEqual(
        pitch.status,
        PitchStatus.Pending,
        'Status should be Pending'
      );
      assert.ok(pitch.createdAt > 0n, 'createdAt should be set');
    });

    it('should return empty data for non-existent pitch', async function () {
      const { factory } = await networkHelpers.loadFixture(fixtureWithPitches);

      const fakePitchId =
        '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' as `0x${string}`;

      const pitch = await factory.read.getPitchData([fakePitchId]);

      assert.strictEqual(pitch.startup, ZERO_ADDRESS, 'Startup should be zero');
      assert.strictEqual(pitch.title, '', 'Title should be empty');
      assert.strictEqual(pitch.fundingGoal, 0n, 'Funding goal should be 0');
    });
  });

  describe('getUserPitches', function () {
    it('should return all pitches for a user', async function () {
      const { factory, startup1, publicClient } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      // Submit multiple pitches
      for (let i = 0; i < 3; i++) {
        const hash = await factory.write.submitPitch(
          [`Pitch ${i}`, `ipfs://pitch${i}`, MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });
      }

      const userPitches = await factory.read.getUserPitches([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(userPitches.length, 3, 'Should have 3 pitches');
    });

    it('should return empty array for user with no pitches', async function () {
      const { factory, startup1 } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      const userPitches = await factory.read.getUserPitches([
        getAddress(startup1.account.address),
      ]);

      assert.strictEqual(userPitches.length, 0, 'Should have no pitches');
    });

    it('should return empty array for unregistered user', async function () {
      const { factory, unauthorized } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      const userPitches = await factory.read.getUserPitches([
        getAddress(unauthorized.account.address),
      ]);

      assert.strictEqual(userPitches.length, 0, 'Should have no pitches');
    });

    it('should track pitches correctly for multiple users', async function () {
      const { factory, startup1, startup2, publicClient } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      // Startup1 submits 2 pitches
      for (let i = 0; i < 2; i++) {
        const hash = await factory.write.submitPitch(
          [`S1 Pitch ${i}`, `ipfs://s1-${i}`, MIN_FUNDING_GOAL],
          { account: startup1.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });
      }

      // Startup2 submits 3 pitches
      for (let i = 0; i < 3; i++) {
        const hash = await factory.write.submitPitch(
          [`S2 Pitch ${i}`, `ipfs://s2-${i}`, MIN_FUNDING_GOAL],
          { account: startup2.account }
        );
        await publicClient.waitForTransactionReceipt({ hash });
      }

      const s1Pitches = await factory.read.getUserPitches([
        getAddress(startup1.account.address),
      ]);
      const s2Pitches = await factory.read.getUserPitches([
        getAddress(startup2.account.address),
      ]);

      assert.strictEqual(s1Pitches.length, 2, 'Startup1 should have 2 pitches');
      assert.strictEqual(s2Pitches.length, 3, 'Startup2 should have 3 pitches');
    });
  });

  describe('Edge Cases', function () {
    it('should handle very long pitch title', async function () {
      const { factory, startup1, publicClient } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      const longTitle = 'A'.repeat(200);

      const hash = await factory.write.submitPitch(
        [longTitle, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
        { account: startup1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await factory.getEvents.PitchSubmitted();
      const pitchId = logs[0].args.pitchId as `0x${string}`;
      const pitch = await factory.read.getPitchData([pitchId]);

      assert.strictEqual(pitch.title, longTitle, 'Title should match');
    });

    it('should handle very long IPFS hash', async function () {
      const { factory, startup1, publicClient } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      const longIpfs = 'ipfs://Qm' + 'a'.repeat(200);

      const hash = await factory.write.submitPitch(
        [DEFAULT_PITCH_TITLE, longIpfs, DEFAULT_PITCH_FUNDING_GOAL],
        { account: startup1.account }
      );
      await publicClient.waitForTransactionReceipt({ hash });

      const logs = await factory.getEvents.PitchSubmitted();
      const pitchId = logs[0].args.pitchId as `0x${string}`;
      const pitch = await factory.read.getPitchData([pitchId]);

      assert.strictEqual(pitch.ipfsHash, longIpfs, 'IPFS hash should match');
    });

    it('should correctly track pitch count', async function () {
      const { factory, startup1, startup2, publicClient } =
        await networkHelpers.loadFixture(fixtureWithUsers);

      // Submit pitches from both startups
      await factory.write.submitPitch(
        ['P1', 'ipfs://1', MIN_FUNDING_GOAL],
        { account: startup1.account }
      );
      await factory.write.submitPitch(
        ['P2', 'ipfs://2', MIN_FUNDING_GOAL],
        { account: startup2.account }
      );
      await factory.write.submitPitch(
        ['P3', 'ipfs://3', MIN_FUNDING_GOAL],
        { account: startup1.account }
      );

      const allEvents = await factory.getEvents.PitchSubmitted();
      assert.strictEqual(allEvents.length, 3, 'Should have 3 pitches total');
    });
  });
});
