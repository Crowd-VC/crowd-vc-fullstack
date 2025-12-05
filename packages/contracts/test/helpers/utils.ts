/**
 * Test Utilities for CrowdVC Platform Tests
 *
 * This file contains helper functions for common test operations
 * such as event extraction, time manipulation, and assertions.
 *
 * Compatible with Hardhat 3.0 + node:test + viem
 */

import hre from 'hardhat';
import { getAddress, keccak256, encodePacked, parseUnits } from 'viem';
import assert from 'node:assert';
import {
  TOKEN_DECIMALS,
  ONE_DAY,
  UserType,
  PitchStatus,
  DEFAULT_METADATA_URI,
  DEFAULT_PITCH_TITLE,
  DEFAULT_PITCH_IPFS,
  DEFAULT_PITCH_FUNDING_GOAL,
  BASIS_POINTS,
  DEFAULT_PLATFORM_FEE,
  EARLY_WITHDRAWAL_PENALTY,
} from './constants.js';

// ============ TYPE DEFINITIONS ============

type Contract = Awaited<ReturnType<typeof hre.viem.deployContract>>;
type WalletClient = Awaited<ReturnType<typeof hre.viem.getWalletClients>>[number];

// ============ NETWORK HELPERS ============

/**
 * Advance time by a specified number of seconds.
 */
export async function advanceTime(seconds: bigint): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.time.increase(seconds);
}

/**
 * Advance time by a specified number of days.
 */
export async function advanceTimeByDays(days: number): Promise<void> {
  await advanceTime(BigInt(days) * ONE_DAY);
}

/**
 * Advance time to a specific timestamp.
 */
export async function advanceTimeTo(timestamp: bigint): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.time.increaseTo(timestamp);
}

/**
 * Get the current block timestamp.
 */
export async function getCurrentTimestamp(): Promise<bigint> {
  const { networkHelpers } = await hre.network.connect();
  return BigInt(await networkHelpers.time.latest());
}

/**
 * Mine a specific number of blocks.
 */
export async function mineBlocks(blocks: number): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.mine(blocks);
}

/**
 * Set the balance of an account.
 */
export async function setBalance(address: `0x${string}`, balance: bigint): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.setBalance(address, balance);
}

/**
 * Impersonate an account for testing.
 */
export async function impersonateAccount(address: `0x${string}`): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.impersonateAccount(address);
}

/**
 * Stop impersonating an account.
 */
export async function stopImpersonatingAccount(address: `0x${string}`): Promise<void> {
  const { networkHelpers } = await hre.network.connect();
  await networkHelpers.stopImpersonatingAccount(address);
}

// ============ EVENT HELPERS ============

/**
 * Extract pitch ID from PitchSubmitted event logs.
 */
export async function extractPitchId(
  factory: Contract,
  index = 0
): Promise<`0x${string}`> {
  const logs = await factory.getEvents.PitchSubmitted();
  if (logs.length <= index) {
    throw new Error(`No PitchSubmitted event found at index ${index}`);
  }
  return logs[index].args.pitchId as `0x${string}`;
}

/**
 * Extract pool address from PoolDeployed event logs.
 */
export async function extractPoolAddress(
  factory: Contract,
  index = 0
): Promise<`0x${string}`> {
  const logs = await factory.getEvents.PoolDeployed();
  if (logs.length <= index) {
    throw new Error(`No PoolDeployed event found at index ${index}`);
  }
  return logs[index].args.poolAddress as `0x${string}`;
}

/**
 * Extract token ID from ContributionMade event logs.
 */
export async function extractTokenId(
  pool: Contract,
  index = 0
): Promise<bigint> {
  const logs = await pool.getEvents.ContributionMade();
  if (logs.length <= index) {
    throw new Error(`No ContributionMade event found at index ${index}`);
  }
  return logs[index].args.tokenId as bigint;
}

// ============ USER REGISTRATION HELPERS ============

/**
 * Register a user as a startup.
 */
export async function registerStartup(
  factory: Contract,
  account: WalletClient,
  metadataURI = DEFAULT_METADATA_URI
): Promise<void> {
  await factory.write.registerUser([UserType.Startup, metadataURI], {
    account: account.account,
  });
}

/**
 * Register a user as an investor.
 */
export async function registerInvestor(
  factory: Contract,
  account: WalletClient,
  metadataURI = DEFAULT_METADATA_URI
): Promise<void> {
  await factory.write.registerUser([UserType.Investor, metadataURI], {
    account: account.account,
  });
}

// ============ PITCH HELPERS ============

/**
 * Submit a pitch and return its ID.
 */
export async function submitPitchAndGetId(
  factory: Contract,
  account: WalletClient,
  options: {
    title?: string;
    ipfsHash?: string;
    fundingGoal?: bigint;
  } = {}
): Promise<`0x${string}`> {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();

  const title = options.title ?? DEFAULT_PITCH_TITLE;
  const ipfsHash = options.ipfsHash ?? DEFAULT_PITCH_IPFS;
  const fundingGoal = options.fundingGoal ?? DEFAULT_PITCH_FUNDING_GOAL;

  const hash = await factory.write.submitPitch([title, ipfsHash, fundingGoal], {
    account: account.account,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  const logs = await factory.getEvents.PitchSubmitted();
  return logs[logs.length - 1].args.pitchId as `0x${string}`;
}

/**
 * Approve a pitch (admin only).
 */
export async function approvePitch(
  factory: Contract,
  pitchId: `0x${string}`,
  admin: WalletClient
): Promise<void> {
  await factory.write.updatePitchStatus([pitchId, PitchStatus.Approved], {
    account: admin.account,
  });
}

/**
 * Reject a pitch (admin only).
 */
export async function rejectPitch(
  factory: Contract,
  pitchId: `0x${string}`,
  admin: WalletClient
): Promise<void> {
  await factory.write.updatePitchStatus([pitchId, PitchStatus.Rejected], {
    account: admin.account,
  });
}

// ============ TOKEN HELPERS ============

/**
 * Mint tokens to an address.
 */
export async function mintTokens(
  token: Contract,
  to: `0x${string}`,
  amount: bigint,
  owner: WalletClient
): Promise<void> {
  await token.write.mint([to, amount], { account: owner.account });
}

/**
 * Approve token spending.
 */
export async function approveTokens(
  token: Contract,
  spender: `0x${string}`,
  amount: bigint,
  owner: WalletClient
): Promise<void> {
  await token.write.approve([spender, amount], { account: owner.account });
}

/**
 * Get token balance.
 */
export async function getTokenBalance(
  token: Contract,
  address: `0x${string}`
): Promise<bigint> {
  return token.read.balanceOf([address]) as Promise<bigint>;
}

/**
 * Parse token amount with correct decimals.
 */
export function parseTokenAmount(amount: string | number): bigint {
  return parseUnits(amount.toString(), TOKEN_DECIMALS);
}

/**
 * Format token amount for display.
 */
export function formatTokenAmount(amount: bigint): string {
  return (Number(amount) / 10 ** TOKEN_DECIMALS).toFixed(TOKEN_DECIMALS);
}

// ============ FEE CALCULATION HELPERS ============

/**
 * Calculate platform fee from an amount.
 */
export function calculatePlatformFee(
  amount: bigint,
  feePercent: bigint = DEFAULT_PLATFORM_FEE
): bigint {
  return (amount * feePercent) / BASIS_POINTS;
}

/**
 * Calculate net amount after platform fee.
 */
export function calculateNetAmount(
  amount: bigint,
  feePercent: bigint = DEFAULT_PLATFORM_FEE
): bigint {
  const fee = calculatePlatformFee(amount, feePercent);
  return amount - fee;
}

/**
 * Calculate early withdrawal penalty and refund.
 */
export function calculateEarlyWithdrawal(
  netAmount: bigint,
  penaltyPercent: bigint = EARLY_WITHDRAWAL_PENALTY
): { penalty: bigint; refund: bigint } {
  const penalty = (netAmount * penaltyPercent) / BASIS_POINTS;
  const refund = netAmount - penalty;
  return { penalty, refund };
}

/**
 * Calculate vote weight per pitch when votes are equally distributed.
 */
export function calculateVoteWeight(
  contribution: bigint,
  numPitchesVotedFor: number,
  feePercent: bigint = DEFAULT_PLATFORM_FEE
): bigint {
  const netAmount = calculateNetAmount(contribution, feePercent);
  return netAmount / BigInt(numPitchesVotedFor);
}

// ============ ASSERTION HELPERS ============

/**
 * Assert that a promise rejects with a specific error.
 */
export async function expectRevert(
  promise: Promise<unknown>,
  errorMessage: string
): Promise<void> {
  try {
    await promise;
    assert.fail('Expected promise to revert');
  } catch (error: unknown) {
    const errorString = (error as Error).message || String(error);
    assert.ok(
      errorString.includes(errorMessage),
      `Expected error containing "${errorMessage}" but got "${errorString}"`
    );
  }
}

/**
 * Assert that a value is approximately equal to another (for rounding tolerance).
 */
export function assertApproximatelyEqual(
  actual: bigint,
  expected: bigint,
  tolerance: bigint = 1n
): void {
  const diff = actual > expected ? actual - expected : expected - actual;
  assert.ok(
    diff <= tolerance,
    `Expected ${actual} to be approximately equal to ${expected} (tolerance: ${tolerance}), diff: ${diff}`
  );
}

/**
 * Check if an address has a specific role.
 */
export async function hasRole(
  contract: Contract,
  role: `0x${string}`,
  account: `0x${string}`
): Promise<boolean> {
  return contract.read.hasRole([role, account]) as Promise<boolean>;
}

// ============ POOL HELPERS ============

/**
 * Get a pool contract instance at a given address.
 */
export async function getPoolAt(address: `0x${string}`) {
  const { viem } = await hre.network.connect();
  return viem.getContractAt('CrowdVCPool', address);
}

/**
 * Create a contribution to a pool.
 */
export async function contribute(
  pool: Contract,
  amount: bigint,
  token: `0x${string}`,
  investor: WalletClient
): Promise<bigint> {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();

  const hash = await pool.write.contribute([amount, token], {
    account: investor.account,
  });
  await publicClient.waitForTransactionReceipt({ hash });

  // Return the token ID from the event
  const logs = await pool.getEvents.ContributionMade();
  return logs[logs.length - 1].args.tokenId as bigint;
}

/**
 * Vote for a pitch in a pool.
 */
export async function voteForPitch(
  pool: Contract,
  pitchId: `0x${string}`,
  investor: WalletClient
): Promise<void> {
  await pool.write.vote([pitchId], { account: investor.account });
}

/**
 * Vote for multiple pitches in a pool.
 */
export async function voteForPitches(
  pool: Contract,
  pitchIds: `0x${string}`[],
  investor: WalletClient
): Promise<void> {
  for (const pitchId of pitchIds) {
    await voteForPitch(pool, pitchId, investor);
  }
}

// ============ ADDRESS HELPERS ============

/**
 * Get checksummed address.
 */
export function checksumAddress(address: `0x${string}`): `0x${string}` {
  return getAddress(address);
}

/**
 * Compare two addresses (case-insensitive).
 */
export function addressesEqual(a: `0x${string}`, b: `0x${string}`): boolean {
  return getAddress(a) === getAddress(b);
}

// ============ HASH HELPERS ============

/**
 * Compute a pitch ID hash (simulating contract behavior).
 */
export function computePitchIdHash(
  startup: `0x${string}`,
  title: string,
  timestamp: bigint,
  nonce: bigint
): `0x${string}` {
  return keccak256(
    encodePacked(
      ['address', 'string', 'uint256', 'uint256'],
      [startup, title, timestamp, nonce]
    )
  );
}

/**
 * Compute a pool ID hash.
 */
export function computePoolIdHash(poolId: string): `0x${string}` {
  return keccak256(encodePacked(['string'], [poolId]));
}

// ============ RANDOM DATA GENERATORS ============

/**
 * Generate a random IPFS hash for testing.
 */
export function randomIpfsHash(): string {
  const randomHex = Math.random().toString(16).substring(2, 50);
  return `ipfs://Qm${randomHex}`;
}

/**
 * Generate a random pool ID.
 */
export function randomPoolId(): string {
  return `pool-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate a random pitch title.
 */
export function randomPitchTitle(): string {
  return `Test Pitch ${Date.now()}`;
}

// ============ SNAPSHOT HELPERS ============

/**
 * Take a snapshot of the current blockchain state.
 */
export async function takeSnapshot(): Promise<() => Promise<void>> {
  const { networkHelpers } = await hre.network.connect();
  return networkHelpers.takeSnapshot();
}

// ============ TREASURY HELPERS ============

/**
 * Get treasury contract instance.
 */
export async function getTreasuryAt(address: `0x${string}`) {
  const { viem } = await hre.network.connect();
  return viem.getContractAt('CrowdVCTreasury', address);
}

/**
 * Get treasury token balance.
 */
export async function getTreasuryTokenBalance(
  treasury: Contract,
  token: Contract
): Promise<bigint> {
  return token.read.balanceOf([treasury.address]) as Promise<bigint>;
}
