import { keccak256, encodePacked, Address } from "viem";
import { network } from "hardhat";
import hre from "hardhat";

// Get network helpers
const getNetworkHelpers = async () => {
  const connection = await network.connect();
  return connection.networkHelpers;
};

/**
 * Time Manipulation Functions
 */

/**
 * Advances blockchain time by the specified number of seconds
 * @param seconds Number of seconds to advance
 * @returns The new timestamp after increase
 */
export async function increaseTime(seconds: number): Promise<number> {
  const { time } = await getNetworkHelpers();
  await time.increase(seconds);
  return await time.latest();
}

/**
 * Mines the specified number of blocks
 * @param blocks Number of blocks to mine
 */
export async function mineBlocks(blocks: number): Promise<void> {
  const { time } = await getNetworkHelpers();
  for (let i = 0; i < blocks; i++) {
    await time.increase(1);
  }
}

/**
 * Gets the latest block timestamp
 * @returns Current block timestamp
 */
export async function getLatestBlockTimestamp(): Promise<number> {
  const { time } = await getNetworkHelpers();
  return await time.latest();
}

/**
 * Sets the timestamp for the next block
 * @param timestamp The timestamp to set
 */
export async function setNextBlockTimestamp(timestamp: number): Promise<void> {
  const { time } = await getNetworkHelpers();
  await time.setNextBlockTimestamp(timestamp);
}

/**
 * ID Calculation Functions
 */

/**
 * Calculates pitch ID using the same logic as CrowdVCFactory.submitPitch()
 * @param startup Address of the startup submitting the pitch
 * @param title Title of the pitch
 * @param timestamp Timestamp of submission
 * @returns The calculated pitch ID as bytes32
 */
export function calculatePitchId(
  startup: Address,
  title: string,
  timestamp: number
): `0x${string}` {
  return keccak256(
    encodePacked(
      ["address", "string", "uint256"],
      [startup, title, BigInt(timestamp)]
    )
  );
}

/**
 * Token Deployment Helpers
 */

/**
 * Deploys a MockUSDT contract
 * @returns The deployed MockUSDT contract instance
 */
export async function deployMockUSDT() {
  return await hre.viem.deployContract("MockUSDT");
}

/**
 * Deploys a MockUSDC contract
 * @returns The deployed MockUSDC contract instance
 */
export async function deployMockUSDC() {
  return await hre.viem.deployContract("MockUSDC");
}

/**
 * Conversion Helpers
 */

/**
 * Converts human-readable token amounts to contract amounts
 * @param amount The human-readable amount
 * @param decimals Token decimals (default: 6 for USDT/USDC)
 * @returns BigInt value suitable for contract calls
 */
export function toTokenAmount(amount: number, decimals: number = 6): bigint {
  return BigInt(amount) * BigInt(10 ** decimals);
}

/**
 * Converts contract token amounts to human-readable numbers
 * @param amount The contract amount as BigInt
 * @param decimals Token decimals (default: 6 for USDT/USDC)
 * @returns Human-readable number
 */
export function fromTokenAmount(amount: bigint, decimals: number = 6): number {
  return Number(amount) / 10 ** decimals;
}

/**
 * Calculation Helpers
 */

/**
 * Calculates platform fee using the same logic as FeeCalculator.calculatePlatformFee()
 * @param amount The amount to calculate fee on
 * @param feePercent Fee percentage in basis points (e.g., 500 = 5%)
 * @returns The calculated fee amount
 */
export function calculateExpectedFee(
  amount: bigint,
  feePercent: number
): bigint {
  return (amount * BigInt(feePercent)) / BigInt(10000);
}

/**
 * Calculates early withdrawal penalty and refund amount
 * @param amount The original contribution amount
 * @param penaltyPercent Penalty percentage in basis points (e.g., 1000 = 10%)
 * @returns Object containing penalty and refund amounts
 */
export function calculateExpectedPenalty(
  amount: bigint,
  penaltyPercent: number
): { penalty: bigint; refund: bigint } {
  const penalty = (amount * BigInt(penaltyPercent)) / BigInt(10000);
  const refund = amount - penalty;
  return { penalty, refund };
}

/**
 * Calculates the net amount after platform fee deduction
 * @param amount The gross amount
 * @param feePercent Fee percentage in basis points
 * @returns Net amount after fee deduction
 */
export function calculateNetAmount(
  amount: bigint,
  feePercent: number
): bigint {
  const fee = calculateExpectedFee(amount, feePercent);
  return amount - fee;
}

/**
 * Calculates allocation percentage for a pitch based on vote weight
 * @param pitchVoteWeight Vote weight for the specific pitch
 * @param totalVoteWeight Total vote weight across all pitches
 * @returns Allocation percentage in basis points
 */
export function calculateAllocationPercent(
  pitchVoteWeight: bigint,
  totalVoteWeight: bigint
): number {
  if (totalVoteWeight === BigInt(0)) {
    return 0;
  }
  return Number((pitchVoteWeight * BigInt(10000)) / totalVoteWeight);
}

/**
 * Calculates the amount to be allocated to a pitch based on percentage
 * @param totalAmount Total pool amount to distribute
 * @param allocationPercent Allocation percentage in basis points
 * @returns Amount allocated to the pitch
 */
export function calculateAllocatedAmount(
  totalAmount: bigint,
  allocationPercent: number
): bigint {
  return (totalAmount * BigInt(allocationPercent)) / BigInt(10000);
}
