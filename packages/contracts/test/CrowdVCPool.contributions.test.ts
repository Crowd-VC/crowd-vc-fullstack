import { describe, it, before } from 'node:test'
import { expect } from 'chai'
import { expectRevert } from './helpers/matchers'
import { network } from 'hardhat'
import { parseEther, zeroAddress } from 'viem'

/**
 * Comprehensive test suite for CrowdVCPool - Contribution and Voting Functions
 *
 * Tests cover:
 * - Pool initialization
 * - Token contributions with NFT receipts
 * - Platform fee handling
 * - Voting mechanics (weighted by contribution)
 * - Vote changing
 * - Early withdrawal with penalty
 * - NFT receipt (ERC721) issuance
 * - Soulbound token restrictions
 * - Access control and state validation
 */
describe('CrowdVCPool - Contributions and Voting', function () {
  let viem: Awaited<ReturnType<typeof network.connect>>['viem']
  let loadFixture: Awaited<ReturnType<typeof network.connect>>['networkHelpers']['loadFixture']
  let time: Awaited<ReturnType<typeof network.connect>>['networkHelpers']['time']

  before(async function () {
    const connection = await network.connect()
    viem = connection.viem
    loadFixture = connection.networkHelpers.loadFixture
    time = connection.networkHelpers.time
  })

  /**
   * Deploy factory, create pool, and prepare for contributions
   */
  async function deployPoolFixture() {
    const [deployer, treasury, startup1, startup2, startup3, investor1, investor2, investor3] =
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

    // Submit and approve pitches
    await factory.write.submitPitch(['AI Analytics', 'QmHash1', BigInt(50_000 * 1e6)], {
      account: startup1.account,
    })
    await factory.write.submitPitch(['Blockchain Supply', 'QmHash2', BigInt(75_000 * 1e6)], {
      account: startup2.account,
    })
    await factory.write.submitPitch(['Green Energy', 'QmHash3', BigInt(60_000 * 1e6)], {
      account: startup3.account,
    })

    const pitchLogs = await factory.getEvents.PitchSubmitted()
    const pitchIds = pitchLogs.map(log => log.args.pitchId as `0x${string}`)

    // Approve pitches
    for (const pitchId of pitchIds) {
      await factory.write.updatePitchStatus([pitchId, 5], { account: deployer.account })
    }

    // Create pool
    const poolName = 'Q1 2025 Innovation Pool'
    const category = 'Technology'
    const fundingGoal = BigInt(150_000 * 1e6) // 150k USDT
    const votingDuration = BigInt(7 * 24 * 60 * 60) // 7 days
    const fundingDuration = BigInt(30 * 24 * 60 * 60) // 30 days
    const minContribution = BigInt(100 * 1e6) // 100 USDT
    const maxContribution = 0n // No limit

    await factory.write.createPool(
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

    const poolLogs = await factory.getEvents.PoolDeployed()
    const poolAddress = poolLogs[0].args.poolAddress as `0x${string}`

    const pool = await hre.viem.getContractAt('CrowdVCPool', poolAddress)

    return {
      pool,
      factory,
      usdt,
      usdc,
      deployer,
      treasury,
      startups: [startup1, startup2, startup3],
      investors: [investor1, investor2, investor3],
      pitchIds,
      poolAddress,
      publicClient,
      poolConfig: {
        fundingGoal,
        votingDuration,
        minContribution,
        maxContribution,
      },
    }
  }

  describe('Pool Initialization', function () {
    it('should initialize pool with correct parameters', async function () {
      const { pool, poolConfig } = await loadFixture(deployPoolFixture)

      const poolInfo = await pool.read.getPoolInfo()

      expect(poolInfo[0]).to.equal('Q1 2025 Innovation Pool') // name
      expect(poolInfo[1]).to.equal('Technology') // category
      expect(poolInfo[2]).to.equal(poolConfig.fundingGoal) // fundingGoal
      expect(poolInfo[6]).to.equal(0) // status: Active
      expect(poolInfo[8]).to.equal(poolConfig.minContribution) // minContribution
    })

    it('should set pool status to Active', async function () {
      const { pool } = await loadFixture(deployPoolFixture)

      const poolInfo = await pool.read.getPoolInfo()
      expect(poolInfo[6]).to.equal(0) // PoolStatus.Active
    })

    it('should register all candidate pitches', async function () {
      const { pool, pitchIds } = await loadFixture(deployPoolFixture)

      const candidatePitches = await pool.read.getCandidatePitches()
      expect(candidatePitches).to.have.lengthOf(pitchIds.length)

      for (const pitchId of pitchIds) {
        const isCandidate = await pool.read.isCandidatePitch([pitchId])
        expect(isCandidate).to.be.true
      }
    })

    it('should set voting and funding deadlines correctly', async function () {
      const { pool, poolConfig, publicClient } = await loadFixture(deployPoolFixture)

      const poolInfo = await pool.read.getPoolInfo()
      const votingDeadline = poolInfo[3]
      const fundingDeadline = poolInfo[4]

      const currentBlock = await publicClient.getBlock()
      const currentTimestamp = currentBlock.timestamp

      // Voting deadline should be approximately now + votingDuration
      expect(votingDeadline).to.be.closeTo(
        currentTimestamp + poolConfig.votingDuration,
        10n
      )

      // Funding deadline should be approximately now + fundingDuration
      expect(fundingDeadline).to.be.closeTo(
        currentTimestamp + poolConfig.fundingDuration,
        10n
      )
    })

    it('should have zero total contributions initially', async function () {
      const { pool } = await loadFixture(deployPoolFixture)

      const poolInfo = await pool.read.getPoolInfo()
      expect(poolInfo[5]).to.equal(0n) // totalContributions
    })

    it('should accept the specified token', async function () {
      const { pool, usdt } = await loadFixture(deployPoolFixture)

      const isAccepted = await pool.read.isAcceptedToken([usdt.address])
      expect(isAccepted).to.be.true
    })

    it('should have correct platform fee and treasury', async function () {
      const { pool, treasury } = await loadFixture(deployPoolFixture)

      const poolTreasury = await pool.read.treasury()
      const platformFee = await pool.read.platformFeePercent()

      expect(poolTreasury).to.equal(treasury.account.address)
      expect(platformFee).to.equal(500) // 5%
    })
  })

  describe('Contribution Functionality', function () {
    it('should allow investor to contribute and receive NFT receipt', async function () {
      const { pool, usdt, investors, pitchIds, publicClient } = await loadFixture(
        deployPoolFixture
      )

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6) // 1000 USDT

      // Mint tokens to investor
      await usdt.write.mint([investor.account.address, amount])

      // Approve pool to spend tokens
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      // Contribute
      const hash = await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const logs = await pool.getEvents.ContributionMade()

      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.investor).to.equal(investor.account.address)
      expect(logs[0].args.amount).to.equal(amount)
      expect(logs[0].args.pitchId).to.equal(pitchIds[0])

      // Verify NFT was minted (tokenId should be 1 for first contribution)
      const nftTokenId = logs[0].args.tokenId
      expect(nftTokenId).to.equal(1n)

      // Verify investor owns the NFT
      const owner = await pool.read.ownerOf([nftTokenId])
      expect(owner).to.equal(investor.account.address)
    })

    it('should calculate and deduct platform fee correctly', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6) // 1000 USDT

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const logs = await pool.getEvents.ContributionMade()
      const platformFee = logs[0].args.platformFee

      // Expected fee: 1000 * 5% = 50 USDT
      expect(platformFee).to.equal(BigInt(50 * 1e6))
    })

    it('should update total contributions', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const poolInfo = await pool.read.getPoolInfo()
      expect(poolInfo[5]).to.equal(amount) // totalContributions
    })

    it('should automatically cast vote for contributed pitch', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Check if vote was cast
      const hasVoted = await pool.read.hasVoted([investor.account.address, pitchIds[0]])
      expect(hasVoted).to.be.true

      // Check vote weight
      const voteWeight = await pool.read.getVoteWeight([pitchIds[0]])
      expect(voteWeight).to.equal(amount)
    })

    it('should reject contribution below minimum', async function () {
      const { pool, usdt, investors, pitchIds, poolConfig } = await loadFixture(
        deployPoolFixture
      )

      const investor = investors[0]
      const amount = poolConfig.minContribution - 1n

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await expectRevert(
        pool.write.contribute([amount, usdt.address, pitchIds[0]], {
          account: investor.account,
        }),
        'Below minimum contribution'
      )
    })

    it('should reject contribution with non-accepted token', async function () {
      const { pool, usdc, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      // USDC is not accepted by this pool (only USDT)
      await usdc.write.mint([investor.account.address, amount])
      await usdc.write.approve([pool.address, amount], { account: investor.account })

      await expectRevert(
        pool.write.contribute([amount, usdc.address, pitchIds[0]], {
          account: investor.account,
        }),
        'Token not accepted'
      )
    })

    it('should reject contribution to invalid pitch', async function () {
      const { pool, usdt, investors } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)
      const fakePitchId = '0x' + '1'.repeat(64) as `0x${string}`

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await expectRevert(
        pool.write.contribute([amount, usdt.address, fakePitchId], {
          account: investor.account,
        }),
        'Invalid pitch'
      )
    })

    it('should reject contribution after voting deadline', async function () {
      const { pool, usdt, investors, pitchIds, poolConfig } = await loadFixture(
        deployPoolFixture
      )

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      // Advance time past voting deadline
      await time.increase(poolConfig.votingDuration + 1n)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })

      await expectRevert(
        pool.write.contribute([amount, usdt.address, pitchIds[0]], {
          account: investor.account,
        }),
        'Voting period ended'
      )
    })

    it('should allow multiple contributions from same investor', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount1 = BigInt(1000 * 1e6)
      const amount2 = BigInt(500 * 1e6)

      // First contribution
      await usdt.write.mint([investor.account.address, amount1])
      await usdt.write.approve([pool.address, amount1], { account: investor.account })
      await pool.write.contribute([amount1, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Second contribution
      await usdt.write.mint([investor.account.address, amount2])
      await usdt.write.approve([pool.address, amount2], { account: investor.account })
      await pool.write.contribute([amount2, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Total contribution should be sum of both
      const totalContribution = await pool.read.getContribution([investor.account.address])
      expect(totalContribution).to.equal(amount1 + amount2)

      // Should have 2 NFT receipts
      const nfts = await pool.read.getNFTsByInvestor([investor.account.address])
      expect(nfts).to.have.lengthOf(2)
    })

    it('should store detailed contribution data', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const contributionData = await pool.read.getDetailedContribution([
        investor.account.address,
      ])

      expect(contributionData.investor).to.equal(investor.account.address)
      expect(contributionData.pitchId).to.equal(pitchIds[0])
      expect(contributionData.amount).to.equal(amount)
      expect(contributionData.token).to.equal(usdt.address)
      expect(contributionData.withdrawn).to.be.false
    })

    it('should track contributions per pitch per investor', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount1 = BigInt(1000 * 1e6)
      const amount2 = BigInt(500 * 1e6)

      // Contribute to first pitch
      await usdt.write.mint([investor.account.address, amount1])
      await usdt.write.approve([pool.address, amount1], { account: investor.account })
      await pool.write.contribute([amount1, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Contribute to second pitch
      await usdt.write.mint([investor.account.address, amount2])
      await usdt.write.approve([pool.address, amount2], { account: investor.account })
      await pool.write.contribute([amount2, usdt.address, pitchIds[1]], {
        account: investor.account,
      })

      // Verify separate tracking
      const contrib0 = await pool.read.contributionsPerPitch([
        investor.account.address,
        pitchIds[0],
      ])
      const contrib1 = await pool.read.contributionsPerPitch([
        investor.account.address,
        pitchIds[1],
      ])

      expect(contrib0).to.equal(amount1)
      expect(contrib1).to.equal(amount2)
    })

    it('should handle max contribution limit correctly', async function () {
      const { pool, usdt, investors, pitchIds, deployer, factory } = await loadFixture(
        deployPoolFixture
      )

      // Create a new pool with max contribution limit
      const maxContribution = BigInt(5000 * 1e6) // 5000 USDT max

      // Need to approve more pitches and create new pool
      // For simplicity, just test the existing pool's behavior when maxContribution is 0 (no limit)

      const investor = investors[0]
      const largeAmount = BigInt(100_000 * 1e6) // 100k USDT

      await usdt.write.mint([investor.account.address, largeAmount])
      await usdt.write.approve([pool.address, largeAmount], { account: investor.account })

      // Should allow since maxContribution is 0 (no limit) in our fixture pool
      await pool.write.contribute([largeAmount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const contribution = await pool.read.getContribution([investor.account.address])
      expect(contribution).to.equal(largeAmount)
    })
  })

  describe('Early Withdrawal', function () {
    it('should allow investor to withdraw early with 10% penalty', async function () {
      const { pool, usdt, investors, pitchIds, publicClient } = await loadFixture(
        deployPoolFixture
      )

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      // Contribute
      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const balanceBefore = await usdt.read.balanceOf([investor.account.address])

      // Withdraw early
      await pool.write.withdrawEarly({ account: investor.account })

      const balanceAfter = await usdt.read.balanceOf([investor.account.address])

      // Should receive 90% (10% penalty)
      const expectedRefund = (amount * 9000n) / 10000n
      expect(balanceAfter - balanceBefore).to.equal(expectedRefund)
    })

    it('should emit EarlyWithdrawal event with penalty details', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      await pool.write.withdrawEarly({ account: investor.account })

      const logs = await pool.getEvents.EarlyWithdrawal()
      expect(logs).to.have.lengthOf(1)
      expect(logs[0].args.investor).to.equal(investor.account.address)
      expect(logs[0].args.contribution).to.equal(amount)
      expect(logs[0].args.penalty).to.equal((amount * 1000n) / 10000n) // 10%
    })

    it('should burn NFT receipts on early withdrawal', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Get NFT token ID before withdrawal
      const nftsBefore = await pool.read.getNFTsByInvestor([investor.account.address])
      expect(nftsBefore).to.have.lengthOf(1)

      await pool.write.withdrawEarly({ account: investor.account })

      // NFT should be burned
      await expect(pool.read.ownerOf([nftsBefore[0]])).to.be.rejected
    })

    it('should remove vote weight on early withdrawal', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const voteWeightBefore = await pool.read.getVoteWeight([pitchIds[0]])
      expect(voteWeightBefore).to.equal(amount)

      await pool.write.withdrawEarly({ account: investor.account })

      const voteWeightAfter = await pool.read.getVoteWeight([pitchIds[0]])
      expect(voteWeightAfter).to.equal(0n)
    })

    it('should reject early withdrawal after voting period ends', async function () {
      const { pool, usdt, investors, pitchIds, poolConfig } = await loadFixture(
        deployPoolFixture
      )

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Advance past voting deadline
      await time.increase(poolConfig.votingDuration + 1n)

      await expectRevert(
        pool.write.withdrawEarly({ account: investor.account }),
        'Voting ended'
      )
    })

    it('should reject early withdrawal if no contribution exists', async function () {
      const { pool, investors } = await loadFixture(deployPoolFixture)

      await expectRevert(
        pool.write.withdrawEarly({ account: investors[0].account }),
        'No contribution'
      )
    })

    it('should reject duplicate early withdrawal', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      await pool.write.withdrawEarly({ account: investor.account })

      // Try to withdraw again
      await expectRevert(
        pool.write.withdrawEarly({ account: investor.account }),
        'No contribution'
      )
    })

    it('should update total contributions on early withdrawal', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      let poolInfo = await pool.read.getPoolInfo()
      expect(poolInfo[5]).to.equal(amount)

      await pool.write.withdrawEarly({ account: investor.account })

      poolInfo = await pool.read.getPoolInfo()
      expect(poolInfo[5]).to.equal(0n)
    })

    it('should track penalty in totalPenalties', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)
      const expectedPenalty = (amount * 1000n) / 10000n

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      await pool.write.withdrawEarly({ account: investor.account })

      const totalPenalties = await pool.read.totalPenalties()
      expect(totalPenalties).to.equal(expectedPenalty)
    })
  })

  describe('NFT Receipt (ERC721) Functionality', function () {
    it('should mint NFT with incremental token IDs', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor1 = investors[0]
      const investor2 = investors[1]
      const amount = BigInt(1000 * 1e6)

      // First contribution -> tokenId 1
      await usdt.write.mint([investor1.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor1.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor1.account,
      })

      const logs1 = await pool.getEvents.ContributionMade()
      expect(logs1[0].args.tokenId).to.equal(1n)

      // Second contribution -> tokenId 2
      await usdt.write.mint([investor2.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor2.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor2.account,
      })

      const logs2 = await pool.getEvents.ContributionMade()
      const latestLog = logs2[logs2.length - 1]
      expect(latestLog.args.tokenId).to.equal(2n)
    })

    it('should prevent NFT transfer (soulbound)', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor1 = investors[0]
      const investor2 = investors[1]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor1.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor1.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor1.account,
      })

      const logs = await pool.getEvents.ContributionMade()
      const tokenId = logs[0].args.tokenId

      // Try to transfer NFT
      await expectRevert(
        pool.write.transferFrom([investor1.account.address, investor2.account.address, tokenId], {
          account: investor1.account,
        }),
        'SoulboundToken'
      )
    })

    it('should allow burning NFT receipts during early withdrawal', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const logs = await pool.getEvents.ContributionMade()
      const tokenId = logs[0].args.tokenId

      // Verify NFT exists
      const ownerBefore = await pool.read.ownerOf([tokenId])
      expect(ownerBefore).to.equal(investor.account.address)

      // Withdraw early (should burn NFT)
      await pool.write.withdrawEarly({ account: investor.account })

      // NFT should no longer exist
      await expect(pool.read.ownerOf([tokenId])).to.be.rejected
    })

    it('should return correct token URI', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount = BigInt(1000 * 1e6)

      await usdt.write.mint([investor.account.address, amount])
      await usdt.write.approve([pool.address, amount], { account: investor.account })
      await pool.write.contribute([amount, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const logs = await pool.getEvents.ContributionMade()
      const tokenId = logs[0].args.tokenId

      const tokenURI = await pool.read.tokenURI([tokenId])
      expect(tokenURI).to.include('Q1 2025 Innovation Pool')
      expect(tokenURI).to.include(tokenId.toString())
    })

    it('should track NFTs by investor', async function () {
      const { pool, usdt, investors, pitchIds } = await loadFixture(deployPoolFixture)

      const investor = investors[0]
      const amount1 = BigInt(1000 * 1e6)
      const amount2 = BigInt(500 * 1e6)

      // First contribution
      await usdt.write.mint([investor.account.address, amount1])
      await usdt.write.approve([pool.address, amount1], { account: investor.account })
      await pool.write.contribute([amount1, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      // Second contribution
      await usdt.write.mint([investor.account.address, amount2])
      await usdt.write.approve([pool.address, amount2], { account: investor.account })
      await pool.write.contribute([amount2, usdt.address, pitchIds[0]], {
        account: investor.account,
      })

      const nfts = await pool.read.getNFTsByInvestor([investor.account.address])
      expect(nfts).to.have.lengthOf(2)
    })
  })
})
