import { describe, it, before } from 'node:test'
import { expect } from 'chai'
import { expectRevert } from './helpers/matchers'
import { network } from 'hardhat'
import { parseEther, zeroAddress } from 'viem'

/**
 * Comprehensive test suite for CrowdVCFactory contract
 *
 * Tests cover:
 * - Contract deployment and initialization
 * - User registration with role-based access control
 * - Pitch submission and approval workflows
 * - Pool creation and deployment (minimal proxy pattern)
 * - Pool management (add/remove startups, activation, pausing)
 * - Admin functions (fee updates, treasury management, token support)
 * - Access control and permissions
 * - Emergency functions
 * - Edge cases and security considerations
 * - Gas optimization verification
 */
describe('CrowdVCFactory', function () {
  let viem: Awaited<ReturnType<typeof network.connect>>['viem']
  let loadFixture: Awaited<ReturnType<typeof network.connect>>['networkHelpers']['loadFixture']

  before(async function () {
    const connection = await network.connect()
    viem = connection.viem
    loadFixture = connection.networkHelpers.loadFixture
  })

  /**
   * Deploy CrowdVCFactory with pool implementation and mock tokens
   */
  async function deployFactoryFixture() {
    const [deployer, treasury, startup1, startup2, investor1, investor2, attacker] =
      await viem.getWalletClients()
    const publicClient = await viem.getPublicClient()

    // Deploy mock tokens
    const usdt = await viem.deployContract('MockUSDT')
    const usdc = await viem.deployContract('MockUSDC')

    // Deploy pool implementation (for minimal proxy pattern)
    const poolImplementation = await viem.deployContract('CrowdVCPool')

    // Deploy factory with pool implementation address
    const factory = await viem.deployContract('CrowdVCFactory', [
      poolImplementation.address,
    ])

    // Initialize factory
    const platformFee = 500n // 5% in basis points
    await factory.write.initialize([
      treasury.account.address,
      platformFee,
      usdt.address,
      usdc.address,
    ])

    return {
      factory,
      poolImplementation,
      usdt,
      usdc,
      deployer,
      treasury,
      startup1,
      startup2,
      investor1,
      investor2,
      attacker,
      publicClient,
    }
  }

  describe('Deployment and Initialization', function () {
    it('should deploy factory with correct pool implementation', async function () {
      const { factory, poolImplementation } = await loadFixture(deployFactoryFixture)

      const storedPoolImpl = await factory.read.poolImplementation()
      expect(storedPoolImpl).to.equal(poolImplementation.address)
    })

    it('should reject deployment with zero pool implementation address', async function () {
      await expectRevert(
        hre.viem.deployContract('CrowdVCFactory', [zeroAddress]),
        'InvalidAddress'
      )
    })

    it('should initialize with correct treasury address', async function () {
      const { factory, treasury } = await loadFixture(deployFactoryFixture)

      const storedTreasury = await factory.read.treasury()
      expect(storedTreasury).to.equal(treasury.account.address)
    })

    it('should initialize with correct platform fee', async function () {
      const { factory } = await loadFixture(deployFactoryFixture)

      const platformFee = await factory.read.platformFeePercent()
      expect(platformFee).to.equal(500) // 5%
    })

    it('should set deployer as admin', async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture)

      const ADMIN_ROLE = await factory.read.ADMIN_ROLE()
      const DEFAULT_ADMIN_ROLE = await factory.read.DEFAULT_ADMIN_ROLE()

      const hasAdminRole = await factory.read.hasRole([ADMIN_ROLE, deployer.account.address])
      const hasDefaultAdminRole = await factory.read.hasRole([
        DEFAULT_ADMIN_ROLE,
        deployer.account.address,
      ])

      expect(hasAdminRole).to.be.true
      expect(hasDefaultAdminRole).to.be.true
    })

    it('should register USDT and USDC as supported tokens', async function () {
      const { factory, usdt, usdc } = await loadFixture(deployFactoryFixture)

      const isUsdtSupported = await factory.read.supportedTokens([usdt.address])
      const isUsdcSupported = await factory.read.supportedTokens([usdc.address])

      expect(isUsdtSupported).to.be.true
      expect(isUsdcSupported).to.be.true
    })

    it('should set version to 1', async function () {
      const { factory } = await loadFixture(deployFactoryFixture)

      const version = await factory.read.getVersion()
      expect(version).to.equal(1n)
    })

    it('should reject initialization with zero treasury address', async function () {
      const [deployer] = await hre.viem.getWalletClients()
      const usdt = await hre.viem.deployContract('MockUSDT')
      const usdc = await hre.viem.deployContract('MockUSDC')
      const poolImpl = await hre.viem.deployContract('CrowdVCPool')
      const factory = await hre.viem.deployContract('CrowdVCFactory', [poolImpl.address])

      await expectRevert(
        factory.write.initialize([zeroAddress, 500n, usdt.address, usdc.address]),
        'InvalidAddress'
      )
    })

    it('should reject initialization with zero token addresses', async function () {
      const [deployer, treasury] = await hre.viem.getWalletClients()
      const poolImpl = await hre.viem.deployContract('CrowdVCPool')
      const factory = await hre.viem.deployContract('CrowdVCFactory', [poolImpl.address])

      await expectRevert(
        factory.write.initialize([treasury.account.address, 500n, zeroAddress, zeroAddress]),
        'InvalidAddress'
      )
    })

    it('should reject initialization with platform fee > 10%', async function () {
      const [deployer, treasury] = await hre.viem.getWalletClients()
      const usdt = await hre.viem.deployContract('MockUSDT')
      const usdc = await hre.viem.deployContract('MockUSDC')
      const poolImpl = await hre.viem.deployContract('CrowdVCPool')
      const factory = await hre.viem.deployContract('CrowdVCFactory', [poolImpl.address])

      await expectRevert(
        factory.write.initialize([treasury.account.address, 1001n, usdt.address, usdc.address]),
        'FeeTooHigh'
      )
    })

    it('should prevent re-initialization', async function () {
      const { factory, treasury, usdt, usdc } = await loadFixture(deployFactoryFixture)

      // Attempt to re-initialize
      await expect(
        factory.write.initialize([treasury.account.address, 500n, usdt.address, usdc.address])
      ).to.be.rejected
    })
  })

  describe('User Registration', function () {
    it('should allow startup registration', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      const metadataURI = 'ipfs://QmStartupProfile123'

      await factory.write.registerUser([1, metadataURI], { account: startup1.account })

      const profile = await factory.read.getUserProfile([startup1.account.address])
      expect(profile.userType).to.equal(1) // UserType.Startup
      expect(profile.metadataURI).to.equal(metadataURI)
      expect(profile.isActive).to.be.true
    })

    it('should allow investor registration', async function () {
      const { factory, investor1 } = await loadFixture(deployFactoryFixture)

      const metadataURI = 'ipfs://QmInvestorProfile456'

      await factory.write.registerUser([2, metadataURI], { account: investor1.account })

      const profile = await factory.read.getUserProfile([investor1.account.address])
      expect(profile.userType).to.equal(2) // UserType.Investor
      expect(profile.metadataURI).to.equal(metadataURI)
      expect(profile.isActive).to.be.true
    })

    it('should grant STARTUP_ROLE upon startup registration', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      const STARTUP_ROLE = await factory.read.STARTUP_ROLE()
      const hasRole = await factory.read.hasRole([STARTUP_ROLE, startup1.account.address])

      expect(hasRole).to.be.true
    })

    it('should grant INVESTOR_ROLE upon investor registration', async function () {
      const { factory, investor1 } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([2, 'ipfs://metadata'], { account: investor1.account })

      const INVESTOR_ROLE = await factory.read.INVESTOR_ROLE()
      const hasRole = await factory.read.hasRole([INVESTOR_ROLE, investor1.account.address])

      expect(hasRole).to.be.true
    })

    it('should reject registration with UserType.None', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      await expectRevert(
        factory.write.registerUser([0, 'ipfs://metadata'], { account: startup1.account }),
        'InvalidUserType'
      )
    })

    it('should reject registration with UserType.Admin', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      await expectRevert(
        factory.write.registerUser([3, 'ipfs://metadata'], { account: startup1.account }),
        'InvalidUserType'
      )
    })

    it('should reject duplicate registration', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata1'], { account: startup1.account })

      await expectRevert(
        factory.write.registerUser([1, 'ipfs://metadata2'], { account: startup1.account }),
        'AlreadyRegistered'
      )
    })

    it('should reject registration with empty metadata URI', async function () {
      const { factory, startup1 } = await loadFixture(deployFactoryFixture)

      await expectRevert(
        factory.write.registerUser([1, ''], { account: startup1.account }),
        'InvalidString'
      )
    })

    it('should emit UserRegistered event', async function () {
      const { factory, startup1, publicClient } = await loadFixture(deployFactoryFixture)

      const hash = await factory.write.registerUser([1, 'ipfs://metadata'], {
        account: startup1.account,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      const logs = await factory.getEvents.UserRegistered()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.user).to.equal(startup1.account.address)
      expect(logs[0].args.userType).to.equal(1)
    })

    it('should record registration timestamp', async function () {
      const { factory, startup1, publicClient } = await loadFixture(deployFactoryFixture)

      const hash = await factory.write.registerUser([1, 'ipfs://metadata'], {
        account: startup1.account,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const block = await publicClient.getBlock({ blockHash: receipt.blockHash })

      const profile = await factory.read.getUserProfile([startup1.account.address])
      expect(profile.registeredAt).to.equal(block.timestamp)
    })

    it('should not allow registration when contract is paused', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      // Pause contract
      await factory.write.pause({ account: deployer.account })

      await expect(
        factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })
      ).to.be.rejected
    })
  })

  describe('User Type Management', function () {
    it('should allow admin to update user type from startup to investor', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      // Register as startup
      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      // Admin updates to investor
      await factory.write.updateUserType([startup1.account.address, 2], {
        account: deployer.account,
      })

      const profile = await factory.read.getUserProfile([startup1.account.address])
      expect(profile.userType).to.equal(2) // UserType.Investor
    })

    it('should update roles when changing user type', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      const STARTUP_ROLE = await factory.read.STARTUP_ROLE()
      const INVESTOR_ROLE = await factory.read.INVESTOR_ROLE()

      // Initially has startup role
      let hasStartupRole = await factory.read.hasRole([STARTUP_ROLE, startup1.account.address])
      expect(hasStartupRole).to.be.true

      // Update to investor
      await factory.write.updateUserType([startup1.account.address, 2], {
        account: deployer.account,
      })

      // Now has investor role, not startup role
      hasStartupRole = await factory.read.hasRole([STARTUP_ROLE, startup1.account.address])
      const hasInvestorRole = await factory.read.hasRole([INVESTOR_ROLE, startup1.account.address])

      expect(hasStartupRole).to.be.false
      expect(hasInvestorRole).to.be.true
    })

    it('should allow admin to promote user to admin', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      await factory.write.updateUserType([startup1.account.address, 3], {
        account: deployer.account,
      })

      const ADMIN_ROLE = await factory.read.ADMIN_ROLE()
      const hasAdminRole = await factory.read.hasRole([ADMIN_ROLE, startup1.account.address])

      expect(hasAdminRole).to.be.true
    })

    it('should reject update for non-registered user', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      await expectRevert(
        factory.write.updateUserType([startup1.account.address, 2], {
          account: deployer.account,
        }),
        'UserNotRegistered'
      )
    })

    it('should reject update to UserType.None', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      await expectRevert(
        factory.write.updateUserType([startup1.account.address, 0], {
          account: deployer.account,
        }),
        'InvalidType'
      )
    })

    it('should reject update by non-admin', async function () {
      const { factory, startup1, startup2, attacker } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      await expect(
        factory.write.updateUserType([startup1.account.address, 2], {
          account: attacker.account,
        })
      ).to.be.rejected
    })

    it('should emit UserTypeUpdated event', async function () {
      const { factory, startup1, deployer } = await loadFixture(deployFactoryFixture)

      await factory.write.registerUser([1, 'ipfs://metadata'], { account: startup1.account })

      await factory.write.updateUserType([startup1.account.address, 2], {
        account: deployer.account,
      })

      const logs = await factory.getEvents.UserTypeUpdated()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.user).to.equal(startup1.account.address)
      expect(logs[0].args.oldType).to.equal(1)
      expect(logs[0].args.newType).to.equal(2)
    })
  })

  describe('Pitch Submission', function () {
    async function registerStartupFixture() {
      const fixtureData = await deployFactoryFixture()
      const { factory, startup1 } = fixtureData

      await factory.write.registerUser([1, 'ipfs://startup-profile'], {
        account: startup1.account,
      })

      return fixtureData
    }

    it('should allow registered startup to submit pitch', async function () {
      const { factory, startup1, publicClient } = await loadFixture(registerStartupFixture)

      const title = 'AI-Powered Analytics Platform'
      const ipfsHash = 'QmPitch123...'
      const fundingGoal = BigInt(50_000 * 1e6) // 50k USDT

      const hash = await factory.write.submitPitch([title, ipfsHash, fundingGoal], {
        account: startup1.account,
      })
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      const logs = await factory.getEvents.PitchSubmitted()
      expect(logs).to.have.lengthOf(1)

      const pitchId = logs[0].args.pitchId as `0x${string}`
      const pitchData = await factory.read.getPitchData([pitchId])

      expect(pitchData.startup).to.equal(startup1.account.address)
      expect(pitchData.title).to.equal(title)
      expect(pitchData.ipfsHash).to.equal(ipfsHash)
      expect(pitchData.fundingGoal).to.equal(fundingGoal)
      expect(pitchData.status).to.equal(0) // PitchStatus.Pending
    })

    it('should generate unique pitch IDs for different pitches', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const hash1 = await factory.write.submitPitch(
        ['Pitch 1', 'QmHash1', BigInt(50_000 * 1e6)],
        { account: startup1.account }
      )
      const hash2 = await factory.write.submitPitch(
        ['Pitch 2', 'QmHash2', BigInt(60_000 * 1e6)],
        { account: startup1.account }
      )

      const logs = await factory.getEvents.PitchSubmitted()
      expect(logs).to.have.lengthOf(2)

      const pitchId1 = logs[0].args.pitchId
      const pitchId2 = logs[1].args.pitchId

      expect(pitchId1).to.not.equal(pitchId2)
    })

    it('should reject pitch with empty title', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      await expectRevert(
        factory.write.submitPitch(['', 'QmHash', BigInt(50_000 * 1e6)], {
          account: startup1.account,
        }),
        'InvalidString'
      )
    })

    it('should reject pitch with empty IPFS hash', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      await expectRevert(
        factory.write.submitPitch(['Valid Title', '', BigInt(50_000 * 1e6)], {
          account: startup1.account,
        }),
        'InvalidString'
      )
    })

    it('should reject pitch with funding goal below minimum', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const MIN_FUNDING_GOAL = await factory.read.MIN_FUNDING_GOAL()
      const belowMin = MIN_FUNDING_GOAL - 1n

      await expectRevert(
        factory.write.submitPitch(['Title', 'QmHash', belowMin], { account: startup1.account }),
        'InvalidFundingGoal'
      )
    })

    it('should reject pitch with funding goal above maximum', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const MAX_FUNDING_GOAL = await factory.read.MAX_FUNDING_GOAL()
      const aboveMax = MAX_FUNDING_GOAL + 1n

      await expectRevert(
        factory.write.submitPitch(['Title', 'QmHash', aboveMax], { account: startup1.account }),
        'InvalidFundingGoal'
      )
    })

    it('should allow pitch at minimum funding goal boundary', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const MIN_FUNDING_GOAL = await factory.read.MIN_FUNDING_GOAL()

      await factory.write.submitPitch(['Title', 'QmHash', MIN_FUNDING_GOAL], {
        account: startup1.account,
      })

      const logs = await factory.getEvents.PitchSubmitted()
      expect(logs).to.have.lengthOf(1)
    })

    it('should allow pitch at maximum funding goal boundary', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const MAX_FUNDING_GOAL = await factory.read.MAX_FUNDING_GOAL()

      await factory.write.submitPitch(['Title', 'QmHash', MAX_FUNDING_GOAL], {
        account: startup1.account,
      })

      const logs = await factory.getEvents.PitchSubmitted()
      expect(logs).to.have.lengthOf(1)
    })

    it('should track user pitches', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      await factory.write.submitPitch(['Pitch 1', 'QmHash1', BigInt(50_000 * 1e6)], {
        account: startup1.account,
      })
      await factory.write.submitPitch(['Pitch 2', 'QmHash2', BigInt(60_000 * 1e6)], {
        account: startup1.account,
      })

      const userPitches = await factory.read.getUserPitches([startup1.account.address])
      expect(userPitches).to.have.lengthOf(2)
    })

    it('should not allow pitch submission when paused', async function () {
      const { factory, startup1, deployer } = await loadFixture(registerStartupFixture)

      await factory.write.pause({ account: deployer.account })

      await expect(
        factory.write.submitPitch(['Title', 'QmHash', BigInt(50_000 * 1e6)], {
          account: startup1.account,
        })
      ).to.be.rejected
    })

    it('should emit PitchSubmitted event with correct data', async function () {
      const { factory, startup1 } = await loadFixture(registerStartupFixture)

      const title = 'Test Pitch'
      const ipfsHash = 'QmTestHash'

      await factory.write.submitPitch([title, ipfsHash, BigInt(50_000 * 1e6)], {
        account: startup1.account,
      })

      const logs = await factory.getEvents.PitchSubmitted()
      expect(logs[0].args.startup).to.equal(startup1.account.address)
      expect(logs[0].args.title).to.equal(title)
      expect(logs[0].args.ipfsHash).to.equal(ipfsHash)
    })
  })

  // Continue in next part due to length...
})
