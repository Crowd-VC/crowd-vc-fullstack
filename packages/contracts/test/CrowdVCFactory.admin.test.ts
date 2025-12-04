import { describe, it, before } from 'node:test'
import { expect } from 'chai'
import { expectRevert } from './helpers/matchers'
import { network } from 'hardhat'
import { zeroAddress } from 'viem'

/**
 * Comprehensive test suite for CrowdVCFactory Admin Functions
 *
 * Tests cover:
 * - Pitch status management
 * - Pool creation and deployment
 * - Pool management functions
 * - Platform fee updates
 * - Treasury management
 * - Token support management
 * - Pause/unpause functionality
 * - Emergency functions
 * - Access control enforcement
 */
describe('CrowdVCFactory - Admin Functions', function () {
  let viem: Awaited<ReturnType<typeof network.connect>>['viem']
  let loadFixture: Awaited<ReturnType<typeof network.connect>>['networkHelpers']['loadFixture']

  before(async function () {
    const connection = await network.connect()
    viem = connection.viem
    loadFixture = connection.networkHelpers.loadFixture
  })

  /**
   * Deploy factory with registered users and submitted pitches
   */
  async function deployFactoryWithPitchesFixture() {
    const [deployer, treasury, startup1, startup2, startup3, investor1, attacker] =
      await viem.getWalletClients()
    const publicClient = await viem.getPublicClient()

    // Deploy mock tokens
    const usdt = await viem.deployContract('MockUSDT')
    const usdc = await viem.deployContract('MockUSDC')

    // Deploy pool implementation
    const poolImplementation = await viem.deployContract('CrowdVCPool')

    // Deploy and initialize factory
    const factory = await viem.deployContract('CrowdVCFactory', [
      poolImplementation.address,
    ])
    await factory.write.initialize([treasury.account.address, 500n, usdt.address, usdc.address])

    // Register startups
    await factory.write.registerUser([1, 'ipfs://startup1'], { account: startup1.account })
    await factory.write.registerUser([1, 'ipfs://startup2'], { account: startup2.account })
    await factory.write.registerUser([1, 'ipfs://startup3'], { account: startup3.account })

    // Submit pitches
    const pitch1Hash = await factory.write.submitPitch(
      ['AI Analytics', 'QmHash1', BigInt(50_000 * 1e6)],
      { account: startup1.account }
    )
    const pitch2Hash = await factory.write.submitPitch(
      ['Blockchain Supply Chain', 'QmHash2', BigInt(75_000 * 1e6)],
      { account: startup2.account }
    )
    const pitch3Hash = await factory.write.submitPitch(
      ['Green Energy', 'QmHash3', BigInt(60_000 * 1e6)],
      { account: startup3.account }
    )

    const logs = await factory.getEvents.PitchSubmitted()
    const pitchIds = logs.map(log => log.args.pitchId as `0x${string}`)

    return {
      factory,
      poolImplementation,
      usdt,
      usdc,
      deployer,
      treasury,
      startup1,
      startup2,
      startup3,
      investor1,
      attacker,
      pitchIds,
      publicClient,
    }
  }

  describe('Pitch Status Management', function () {
    it('should allow admin to approve pitch', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updatePitchStatus([pitchIds[0], 5], { account: deployer.account }) // 5 = Approved

      const pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(5) // PitchStatus.Approved
      expect(pitchData.approvedAt).to.be.greaterThan(0n)
    })

    it('should allow admin to reject pitch', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updatePitchStatus([pitchIds[0], 6], { account: deployer.account }) // 6 = Rejected

      const pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(6) // PitchStatus.Rejected
    })

    it('should allow admin to set pitch to under review', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updatePitchStatus([pitchIds[0], 1], { account: deployer.account }) // 1 = UnderReview

      const pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(1)
    })

    it('should reject pitch status update for non-existent pitch', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      const fakePitchId = '0x' + '0'.repeat(64) as `0x${string}`

      await expectRevert(
        factory.write.updatePitchStatus([fakePitchId, 5], { account: deployer.account }),
        'PitchDoesNotExist'
      )
    })

    it('should reject pitch status update by non-admin', async function () {
      const { factory, pitchIds, attacker } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await expect(
        factory.write.updatePitchStatus([pitchIds[0], 5], { account: attacker.account })
      ).to.be.rejected
    })

    it('should emit PitchStatusUpdated event', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updatePitchStatus([pitchIds[0], 5], { account: deployer.account })

      const logs = await factory.getEvents.PitchStatusUpdated()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.pitchId).to.equal(pitchIds[0])
      expect(logs[0].args.oldStatus).to.equal(0) // Pending
      expect(logs[0].args.newStatus).to.equal(5) // Approved
    })

    it('should record approval timestamp when approved', async function () {
      const { factory, pitchIds, deployer, publicClient } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      const hash = await factory.write.updatePitchStatus([pitchIds[0], 5], {
        account: deployer.account,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const block = await publicClient.getBlock({ blockHash: receipt.blockHash })

      const pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.approvedAt).to.be.closeTo(block.timestamp, 2n)
    })

    it('should allow multiple status transitions', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      // Pending -> UnderReview
      await factory.write.updatePitchStatus([pitchIds[0], 1], { account: deployer.account })
      let pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(1)

      // UnderReview -> NeedsMoreInfo
      await factory.write.updatePitchStatus([pitchIds[0], 3], { account: deployer.account })
      pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(3)

      // NeedsMoreInfo -> Approved
      await factory.write.updatePitchStatus([pitchIds[0], 5], { account: deployer.account })
      pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.status).to.equal(5)
    })

    it('should allow checking pitch approval status', async function () {
      const { factory, pitchIds, deployer } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      let isApproved = await factory.read.isPitchApproved([pitchIds[0]])
      expect(isApproved).to.be.false

      await factory.write.updatePitchStatus([pitchIds[0], 5], { account: deployer.account })

      isApproved = await factory.read.isPitchApproved([pitchIds[0]])
      expect(isApproved).to.be.true
    })
  })

  describe('Pool Creation', function () {
    async function approvedPitchesFixture() {
      const fixtureData = await deployFactoryWithPitchesFixture()
      const { factory, deployer, pitchIds } = fixtureData

      // Approve all pitches
      for (const pitchId of pitchIds) {
        await factory.write.updatePitchStatus([pitchId, 5], { account: deployer.account })
      }

      return fixtureData
    }

    it('should allow admin to create pool with approved pitches', async function () {
      const { factory, deployer, usdt, pitchIds, publicClient } = await loadFixture(
        approvedPitchesFixture
      )

      const poolName = 'Q1 2025 Innovation Pool'
      const category = 'Technology'
      const fundingGoal = BigInt(150_000 * 1e6)
      const votingDuration = BigInt(7 * 24 * 60 * 60)
      const fundingDuration = BigInt(30 * 24 * 60 * 60)
      const minContribution = BigInt(100 * 1e6)
      const maxContribution = 0n // No limit

      const hash = await factory.write.createPool(
        [
          poolName,
          category,
          fundingGoal,
          votingDuration,
          fundingDuration,
          pitchIds,
          usdt.address,
          minContribution,
          maxContribution,
        ],
        { account: deployer.account }
      )

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const logs = await factory.getEvents.PoolDeployed()

      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.poolAddress).to.not.equal(zeroAddress)
    })

    it('should deploy pool using minimal proxy (Clones)', async function () {
      const { factory, deployer, usdt, pitchIds, poolImplementation } = await loadFixture(
        approvedPitchesFixture
      )

      const hash = await factory.write.createPool(
        [
          'Test Pool',
          'Tech',
          BigInt(150_000 * 1e6),
          BigInt(7 * 24 * 60 * 60),
          BigInt(30 * 24 * 60 * 60),
          pitchIds,
          usdt.address,
          BigInt(100 * 1e6),
          0n,
        ],
        { account: deployer.account }
      )

      const logs = await factory.getEvents.PoolDeployed()
      const poolAddress = logs[0].args.poolAddress as `0x${string}`

      // Verify pool is tracked
      const isPool = await factory.read.isPool([poolAddress])
      expect(isPool).to.be.true

      // Verify pool address is in all pools list
      const allPools = await factory.read.getAllPools()
      expect(allPools).to.include(poolAddress)
    })

    it('should update pitch status to InPool when added to pool', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      await factory.write.createPool(
        [
          'Test Pool',
          'Tech',
          BigInt(150_000 * 1e6),
          BigInt(7 * 24 * 60 * 60),
          BigInt(30 * 24 * 60 * 60),
          pitchIds,
          usdt.address,
          BigInt(100 * 1e6),
          0n,
        ],
        { account: deployer.account }
      )

      for (const pitchId of pitchIds) {
        const pitchData = await factory.read.getPitchData([pitchId])
        expect(pitchData.status).to.equal(7) // PitchStatus.InPool
      }
    })

    it('should reject pool creation with non-approved pitch', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      // Don't approve pitches, try to create pool anyway
      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'PitchNotApproved'
      )
    })

    it('should reject pool creation with empty name', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      await expectRevert(
        factory.write.createPool(
          [
            '', // Empty name
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'InvalidString'
      )
    })

    it('should reject pool creation with funding goal below minimum', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      const MIN_POOL_GOAL = await factory.read.MIN_POOL_GOAL()
      const tooLow = MIN_POOL_GOAL - 1n

      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            tooLow,
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'InvalidFundingGoal'
      )
    })

    it('should reject pool creation with voting duration too short', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      const MIN_VOTING_DURATION = await factory.read.MIN_VOTING_DURATION()
      const tooShort = MIN_VOTING_DURATION - 1n

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            tooShort,
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        )
      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            tooShort,
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'InvalidDuration'
      )
    })

    it('should reject pool creation with unsupported token', async function () {
      const { factory, deployer, pitchIds, startup1 } = await loadFixture(
        approvedPitchesFixture
      )

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            startup1.account.address, // Not a supported token
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        )
      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            startup1.account.address, // Not a supported token
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'TokenNotSupported'
      )
    })

    it('should reject pool creation with invalid max contribution (less than min)', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      const minContribution = BigInt(100 * 1e6)
      const maxContribution = BigInt(50 * 1e6) // Less than min

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            minContribution,
            maxContribution,
          ],
          { account: deployer.account }
        )
      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            minContribution,
            maxContribution,
          ],
          { account: deployer.account }
        ),
        'InvalidMaxContribution'
      )
    })

    it('should reject pool creation with empty candidate pitches array', async function () {
      const { factory, deployer, usdt } = await loadFixture(approvedPitchesFixture)

      const emptyArray: `0x${string}`[] = []

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            emptyArray,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        )
      await expectRevert(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            emptyArray,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        ),
        'EmptyArray'
      )
    })

    it('should reject pool creation by non-admin', async function () {
      const { factory, attacker, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: attacker.account }
        )
      ).to.be.rejected
    })

    it('should not allow pool creation when factory is paused', async function () {
      const { factory, deployer, usdt, pitchIds } = await loadFixture(approvedPitchesFixture)

      await factory.write.pause({ account: deployer.account })

      await expect(
        factory.write.createPool(
          [
            'Test Pool',
            'Tech',
            BigInt(150_000 * 1e6),
            BigInt(7 * 24 * 60 * 60),
            BigInt(30 * 24 * 60 * 60),
            pitchIds,
            usdt.address,
            BigInt(100 * 1e6),
            0n,
          ],
          { account: deployer.account }
        )
      ).to.be.rejected
    })
  })

  describe('Platform Fee Management', function () {
    it('should allow admin to update platform fee', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.updatePlatformFee([750n], { account: deployer.account }) // 7.5%

      const newFee = await factory.read.platformFeePercent()
      expect(newFee).to.equal(750)
    })

    it('should emit PlatformFeeUpdated event', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.updatePlatformFee([750n], { account: deployer.account })

      const logs = await factory.getEvents.PlatformFeeUpdated()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.oldFee).to.equal(500n)
      expect(logs[0].args.newFee).to.equal(750n)
    })

    it('should reject platform fee update exceeding 10%', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await expectRevert(
        factory.write.updatePlatformFee([1001n], { account: deployer.account }),
        'FeeTooHigh'
      )
    })

    it('should allow setting platform fee to 0%', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.updatePlatformFee([0n], { account: deployer.account })

      const fee = await factory.read.platformFeePercent()
      expect(fee).to.equal(0)
    })

    it('should allow setting platform fee to maximum 10%', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.updatePlatformFee([1000n], { account: deployer.account })

      const fee = await factory.read.platformFeePercent()
      expect(fee).to.equal(1000)
    })

    it('should reject platform fee update by non-admin', async function () {
      const { factory, attacker } = await loadFixture(deployFactoryWithPitchesFixture)

      await expect(
        factory.write.updatePlatformFee([750n], { account: attacker.account })
      ).to.be.rejected
    })
  })

  describe('Treasury Management', function () {
    it('should allow admin to update treasury address', async function () {
      const { factory, deployer, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updateTreasury([startup1.account.address], {
        account: deployer.account,
      })

      const newTreasury = await factory.read.treasury()
      expect(newTreasury).to.equal(startup1.account.address)
    })

    it('should emit TreasuryUpdated event', async function () {
      const { factory, deployer, treasury, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.updateTreasury([startup1.account.address], {
        account: deployer.account,
      })

      const logs = await factory.getEvents.TreasuryUpdated()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.oldTreasury).to.equal(treasury.account.address)
      expect(logs[0].args.newTreasury).to.equal(startup1.account.address)
    })

    it('should reject treasury update to zero address', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await expectRevert(
        factory.write.updateTreasury([zeroAddress], { account: deployer.account }),
        'InvalidAddress'
      )
    })

    it('should reject treasury update by non-admin', async function () {
      const { factory, attacker, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await expect(
        factory.write.updateTreasury([startup1.account.address], { account: attacker.account })
      ).to.be.rejected
    })
  })

  describe('Supported Token Management', function () {
    it('should allow admin to add supported token', async function () {
      const { factory, deployer, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      const newToken = startup1.account.address // Mock token address

      await factory.write.addSupportedToken([newToken], { account: deployer.account })

      const isSupported = await factory.read.supportedTokens([newToken])
      expect(isSupported).to.be.true
    })

    it('should allow admin to remove supported token', async function () {
      const { factory, deployer, usdt } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.removeSupportedToken([usdt.address], { account: deployer.account })

      const isSupported = await factory.read.supportedTokens([usdt.address])
      expect(isSupported).to.be.false
    })

    it('should reject adding zero address as supported token', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await expectRevert(
        factory.write.addSupportedToken([zeroAddress], { account: deployer.account }),
        'InvalidAddress'
      )
    })

    it('should reject token addition by non-admin', async function () {
      const { factory, attacker, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await expect(
        factory.write.addSupportedToken([startup1.account.address], {
          account: attacker.account,
        })
      ).to.be.rejected
    })

    it('should reject token removal by non-admin', async function () {
      const { factory, attacker, usdt } = await loadFixture(deployFactoryWithPitchesFixture)

      await expect(
        factory.write.removeSupportedToken([usdt.address], { account: attacker.account })
      ).to.be.rejected
    })
  })

  describe('Pause and Unpause', function () {
    it('should allow admin to pause contract', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryWithPitchesFixture)

      await factory.write.pause({ account: deployer.account })

      // Try to perform an action that should fail
      await expect(
        factory.write.registerUser([1, 'ipfs://test'], { account: deployer.account })
      ).to.be.rejected
    })

    it('should allow admin to unpause contract', async function () {
      const { factory, deployer, startup1 } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.pause({ account: deployer.account })
      await factory.write.unpause({ account: deployer.account })

      // Should now be able to perform actions
      await factory.write.updatePlatformFee([600n], { account: deployer.account })
      const fee = await factory.read.platformFeePercent()
      expect(fee).to.equal(600)
    })

    it('should reject pause by non-admin', async function () {
      const { factory, attacker } = await loadFixture(deployFactoryWithPitchesFixture)

      await expect(factory.write.pause({ account: attacker.account })).to.be.rejected
    })

    it('should reject unpause by non-admin', async function () {
      const { factory, deployer, attacker } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      await factory.write.pause({ account: deployer.account })

      await expect(factory.write.unpause({ account: attacker.account })).to.be.rejected
    })
  })

  describe('View Functions', function () {
    it('should return all pools', async function () {
      const { factory } = await loadFixture(deployFactoryWithPitchesFixture)

      const pools = await factory.read.getAllPools()
      expect(pools).to.be.an('array')
    })

    it('should return user profile', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryWithPitchesFixture)

      const profile = await factory.read.getUserProfile([startup1.account.address])
      expect(profile.userType).to.equal(1)
      expect(profile.isActive).to.be.true
    })

    it('should return pitch data', async function () {
      const { factory, pitchIds } = await loadFixture(deployFactoryWithPitchesFixture)

      const pitchData = await factory.read.getPitchData([pitchIds[0]])
      expect(pitchData.pitchId).to.equal(pitchIds[0])
      expect(pitchData.title).to.not.equal('')
    })

    it('should return platform fee', async function () {
      const { factory } = await loadFixture(deployFactoryWithPitchesFixture)

      const fee = await factory.read.getPlatformFee()
      expect(fee).to.equal(500n)
    })

    it('should return treasury address', async function () {
      const { factory, treasury } = await loadFixture(deployFactoryWithPitchesFixture)

      const treasuryAddr = await factory.read.getTreasury()
      expect(treasuryAddr).to.equal(treasury.account.address)
    })

    it('should return version', async function () {
      const { factory } = await loadFixture(deployFactoryWithPitchesFixture)

      const version = await factory.read.getVersion()
      expect(version).to.equal(1n)
    })

    it('should return pool implementation address', async function () {
      const { factory, poolImplementation } = await loadFixture(
        deployFactoryWithPitchesFixture
      )

      const implAddr = await factory.read.getPoolImplementation()
      expect(implAddr).to.equal(poolImplementation.address)
    })

    it('should return user pitches', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryWithPitchesFixture)

      const userPitches = await factory.read.getUserPitches([startup1.account.address])
      expect(userPitches).to.have.lengthOf(1)
    })
  })
})
