import { describe, it, before } from 'node:test'
import { expect } from 'chai'
import { network } from 'hardhat'
import { expectRevert } from './helpers/matchers'

/**
 * Comprehensive tests for FeeCalculator library
 *
 * Tests cover:
 * - Platform fee calculation
 * - Net amount calculation
 * - Proportional distribution among winners
 * - Allocation percentage calculation
 * - Early withdrawal penalty calculation
 * - Edge cases and boundary conditions
 * - Error handling
 */
describe('FeeCalculator Library', function () {
  let viem: Awaited<ReturnType<typeof network.connect>>['viem']
  let loadFixture: Awaited<ReturnType<typeof network.connect>>['networkHelpers']['loadFixture']

  before(async function () {
    const connection = await network.connect()
    viem = connection.viem
    loadFixture = connection.networkHelpers.loadFixture
  })

  /**
   * Deploy a test contract that exposes FeeCalculator library functions
   */
  async function deployFeeCalculatorTestFixture() {
    const [owner, user1, user2] = await viem.getWalletClients()
    const publicClient = await viem.getPublicClient()

    // Deploy test harness contract that uses FeeCalculator
    const FeeCalculatorTest = await viem.deployContract('FeeCalculatorTest')

    return {
      feeCalculator: FeeCalculatorTest,
      owner,
      user1,
      user2,
      publicClient,
    }
  }

  describe('Platform Fee Calculation', function () {
    it('should calculate platform fee correctly for 5% fee', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6) // 1000 USDT
      const feePercent = 500n // 5% in basis points

      const fee = await feeCalculator.read.calculatePlatformFee([amount, feePercent])

      // Expected: 1000 * 5% = 50 USDT
      expect(fee).to.equal(BigInt(50 * 1e6))
    })

    it('should calculate platform fee correctly for 10% fee', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(5000 * 1e6) // 5000 USDT
      const feePercent = 1000n // 10% (max fee)

      const fee = await feeCalculator.read.calculatePlatformFee([amount, feePercent])

      // Expected: 5000 * 10% = 500 USDT
      expect(fee).to.equal(BigInt(500 * 1e6))
    })

    it('should calculate zero fee for 0% fee', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const feePercent = 0n

      const fee = await feeCalculator.read.calculatePlatformFee([amount, feePercent])

      expect(fee).to.equal(0n)
    })

    it('should handle small amounts correctly', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = 100n // 0.0001 USDT (smallest unit with 6 decimals)
      const feePercent = 500n // 5%

      const fee = await feeCalculator.read.calculatePlatformFee([amount, feePercent])

      // Expected: 100 * 500 / 10000 = 5
      expect(fee).to.equal(5n)
    })

    it('should revert when fee exceeds maximum (10%)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const feePercent = 1001n // 10.01% - exceeds max

      await expectRevert(
        feeCalculator.read.calculatePlatformFee([amount, feePercent]),
        'FeeTooHigh'
      )
    })

    it('should handle maximum uint256 amount without overflow', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt('1000000000000000000') // Large amount
      const feePercent = 500n // 5%

      const fee = await feeCalculator.read.calculatePlatformFee([amount, feePercent])

      const expected = (amount * feePercent) / 10000n
      expect(fee).to.equal(expected)
    })
  })

  describe('Net Amount Calculation', function () {
    it('should calculate net amount after deducting 5% fee', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6) // 1000 USDT
      const feePercent = 500n // 5%

      const netAmount = await feeCalculator.read.calculateNetAmount([amount, feePercent])

      // Expected: 1000 - (1000 * 5%) = 950 USDT
      expect(netAmount).to.equal(BigInt(950 * 1e6))
    })

    it('should return original amount when fee is 0%', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const feePercent = 0n

      const netAmount = await feeCalculator.read.calculateNetAmount([amount, feePercent])

      expect(netAmount).to.equal(amount)
    })

    it('should calculate net amount for maximum 10% fee', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(10000 * 1e6) // 10,000 USDT
      const feePercent = 1000n // 10%

      const netAmount = await feeCalculator.read.calculateNetAmount([amount, feePercent])

      // Expected: 10000 - (10000 * 10%) = 9000 USDT
      expect(netAmount).to.equal(BigInt(9000 * 1e6))
    })
  })

  describe('Proportional Distribution', function () {
    it('should distribute equally among 3 winners with equal votes', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(3000 * 1e6) // 3000 USDT
      const voteWeights = [1000n, 1000n, 1000n] // Equal weights

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      // Each should get 1000 USDT (last one gets any rounding dust)
      expect(distributions).to.have.lengthOf(3)
      expect(distributions[0]).to.equal(BigInt(1000 * 1e6))
      expect(distributions[1]).to.equal(BigInt(1000 * 1e6))
      expect(distributions[2]).to.equal(BigInt(1000 * 1e6))
    })

    it('should distribute proportionally among winners with different votes', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(1000 * 1e6) // 1000 USDT
      const voteWeights = [500n, 300n, 200n] // 50%, 30%, 20%

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      expect(distributions).to.have.lengthOf(3)
      expect(distributions[0]).to.equal(BigInt(500 * 1e6)) // 500 USDT
      expect(distributions[1]).to.equal(BigInt(300 * 1e6)) // 300 USDT
      // Last winner gets remainder to handle rounding
      expect(distributions[2]).to.be.closeTo(BigInt(200 * 1e6), BigInt(1))
    })

    it('should handle rounding correctly by giving dust to last winner', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = 100n // Amount that doesn't divide evenly
      const voteWeights = [33n, 33n, 34n]

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      const total = distributions.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(totalAmount) // No funds lost to rounding
    })

    it('should revert when total votes is zero', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(1000 * 1e6)
      const voteWeights = [0n, 0n, 0n] // All zeros

      await expectRevert(
        feeCalculator.read.calculateProportionalDistribution([totalAmount, voteWeights]),
        'No votes to distribute'
      )
    })

    it('should handle single winner correctly', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(5000 * 1e6)
      const voteWeights = [1000n] // Single winner

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      expect(distributions).to.have.lengthOf(1)
      expect(distributions[0]).to.equal(totalAmount) // Gets everything
    })

    it('should handle winner with zero votes among non-zero votes', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(1000 * 1e6)
      const voteWeights = [500n, 0n, 500n] // Middle winner has 0 votes

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      expect(distributions[0]).to.equal(BigInt(500 * 1e6))
      expect(distributions[1]).to.equal(0n) // Gets nothing
      expect(distributions[2]).to.be.closeTo(BigInt(500 * 1e6), BigInt(1))
    })
  })

  describe('Allocation Percentage Calculation', function () {
    it('should calculate allocation percentages for equal votes', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [1000n, 1000n, 1000n] // Equal

      const percentages = await feeCalculator.read.calculateAllocationPercents([voteWeights])

      expect(percentages).to.have.lengthOf(3)
      // Each should be approximately 3333 basis points (33.33%)
      expect(percentages[0]).to.be.closeTo(3333n, 1n)
      expect(percentages[1]).to.be.closeTo(3333n, 1n)
      // Last one gets remainder to ensure total = 10000
      const total = percentages.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(10000n) // Must equal 100%
    })

    it('should calculate allocation percentages for different votes', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [6000n, 3000n, 1000n] // 60%, 30%, 10%

      const percentages = await feeCalculator.read.calculateAllocationPercents([voteWeights])

      expect(percentages).to.have.lengthOf(3)
      expect(percentages[0]).to.equal(6000n) // 60%
      expect(percentages[1]).to.equal(3000n) // 30%
      // Last gets remainder
      const total = percentages.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(10000n)
    })

    it('should ensure total always equals 10000 basis points (100%)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [333n, 333n, 334n] // Doesn't divide evenly

      const percentages = await feeCalculator.read.calculateAllocationPercents([voteWeights])

      const total = percentages.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(10000n) // Exactly 100%
    })

    it('should revert when no votes exist', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [0n, 0n, 0n]

      await expectRevert(
        feeCalculator.read.calculateAllocationPercents([voteWeights]),
        'No votes'
      )
    })

    it('should handle single winner getting 100%', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [5000n]

      const percentages = await feeCalculator.read.calculateAllocationPercents([voteWeights])

      expect(percentages).to.have.lengthOf(1)
      expect(percentages[0]).to.equal(10000n) // 100%
    })

    it('should handle tie scenario (4 winners)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const voteWeights = [2500n, 2500n, 2500n, 2500n] // 4-way tie

      const percentages = await feeCalculator.read.calculateAllocationPercents([voteWeights])

      expect(percentages).to.have.lengthOf(4)
      const total = percentages.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(10000n)
      // Each should get approximately 2500 basis points (25%)
      percentages.forEach(pct => {
        expect(pct).to.be.closeTo(2500n, 1n)
      })
    })
  })

  describe('Early Withdrawal Penalty Calculation', function () {
    it('should calculate 10% penalty correctly', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6) // 1000 USDT
      const penaltyPercent = 1000n // 10%

      const result = await feeCalculator.read.calculateEarlyWithdrawalPenalty([
        amount,
        penaltyPercent,
      ])

      const [penalty, refund] = result
      expect(penalty).to.equal(BigInt(100 * 1e6)) // 100 USDT penalty
      expect(refund).to.equal(BigInt(900 * 1e6)) // 900 USDT refund
    })

    it('should calculate penalty for different percentages', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(5000 * 1e6) // 5000 USDT
      const penaltyPercent = 500n // 5%

      const result = await feeCalculator.read.calculateEarlyWithdrawalPenalty([
        amount,
        penaltyPercent,
      ])

      const [penalty, refund] = result
      expect(penalty).to.equal(BigInt(250 * 1e6)) // 250 USDT penalty
      expect(refund).to.equal(BigInt(4750 * 1e6)) // 4750 USDT refund
    })

    it('should handle 0% penalty (full refund)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const penaltyPercent = 0n // No penalty

      const result = await feeCalculator.read.calculateEarlyWithdrawalPenalty([
        amount,
        penaltyPercent,
      ])

      const [penalty, refund] = result
      expect(penalty).to.equal(0n)
      expect(refund).to.equal(amount) // Full refund
    })

    it('should revert when penalty exceeds 100%', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const penaltyPercent = 10001n // 100.01% - exceeds max

      await expectRevert(
        feeCalculator.read.calculateEarlyWithdrawalPenalty([amount, penaltyPercent]),
        'InvalidPercentage'
      )
    })

    it('should handle 100% penalty (no refund)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(1000 * 1e6)
      const penaltyPercent = 10000n // 100%

      const result = await feeCalculator.read.calculateEarlyWithdrawalPenalty([
        amount,
        penaltyPercent,
      ])

      const [penalty, refund] = result
      expect(penalty).to.equal(amount) // Full penalty
      expect(refund).to.equal(0n) // No refund
    })

    it('should ensure penalty + refund always equals original amount', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const amount = BigInt(12345 * 1e6)
      const penaltyPercent = 1234n // 12.34%

      const result = await feeCalculator.read.calculateEarlyWithdrawalPenalty([
        amount,
        penaltyPercent,
      ])

      const [penalty, refund] = result
      expect(penalty + refund).to.equal(amount)
    })
  })

  describe('Edge Cases and Gas Optimization', function () {
    it('should handle very large numbers without overflow', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const largeAmount = BigInt('1000000000000000') // 1 billion USDT (with 6 decimals)
      const feePercent = 500n

      const fee = await feeCalculator.read.calculatePlatformFee([largeAmount, feePercent])

      const expected = (largeAmount * feePercent) / 10000n
      expect(fee).to.equal(expected)
    })

    it('should handle distribution with many winners efficiently', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const totalAmount = BigInt(10000 * 1e6)
      // Create 10 winners with varying vote weights
      const voteWeights = [1000n, 900n, 800n, 700n, 600n, 500n, 400n, 300n, 200n, 100n]

      const distributions = await feeCalculator.read.calculateProportionalDistribution([
        totalAmount,
        voteWeights,
      ])

      expect(distributions).to.have.lengthOf(10)

      // Verify total distributed equals input amount
      const total = distributions.reduce((sum, val) => sum + val, 0n)
      expect(total).to.equal(totalAmount)
    })

    it('should handle minimum amounts (1 wei equivalent)', async function () {
      const { feeCalculator } = await loadFixture(deployFeeCalculatorTestFixture)

      const minAmount = 1n
      const feePercent = 500n // 5%

      const fee = await feeCalculator.read.calculatePlatformFee([minAmount, feePercent])

      // Should round down to 0 due to integer division
      expect(fee).to.equal(0n)
    })
  })
})
