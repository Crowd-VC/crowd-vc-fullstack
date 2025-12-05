/**
 * Test Fixtures for CrowdVC Platform Tests
 *
 * This file contains reusable fixtures for deploying contracts
 * and setting up test state. Uses Hardhat 3.0's networkHelpers.loadFixture
 * for snapshot-based test isolation.
 *
 * Compatible with Hardhat 3.0 + node:test + viem
 */

import hre from 'hardhat';
import { getAddress } from 'viem';
import {
  DEFAULT_PLATFORM_FEE,
  DEFAULT_METADATA_URI,
  DEFAULT_PITCH_TITLE,
  DEFAULT_PITCH_IPFS,
  DEFAULT_PITCH_FUNDING_GOAL,
  DEFAULT_POOL_NAME,
  DEFAULT_POOL_CATEGORY,
  DEFAULT_POOL_ID,
  DEFAULT_POOL_FUNDING_GOAL,
  DEFAULT_VOTING_DURATION,
  DEFAULT_FUNDING_DURATION,
  DEFAULT_MIN_CONTRIBUTION,
  DEFAULT_MAX_CONTRIBUTION,
  MINT_AMOUNT,
  MEDIUM_CONTRIBUTION,
  LARGE_CONTRIBUTION,
  UserType,
  PitchStatus,
  ONE_DAY,
  BASIS_POINTS,
} from './constants.js';

// ============ TYPE DEFINITIONS ============

export type WalletClient = Awaited<ReturnType<typeof hre.viem.getWalletClients>>[number];
export type PublicClient = Awaited<ReturnType<typeof hre.viem.getPublicClient>>;
export type Contract = Awaited<ReturnType<typeof hre.viem.deployContract>>;

export interface FixtureResult {
  factory: Contract;
  poolImplementation: Contract;
  treasury: Contract;
  usdt: Contract;
  usdc: Contract;
  owner: WalletClient;
  admin: WalletClient;
  startup1: WalletClient;
  startup2: WalletClient;
  startup3: WalletClient;
  investor1: WalletClient;
  investor2: WalletClient;
  investor3: WalletClient;
  treasuryWallet: WalletClient;
  unauthorized: WalletClient;
  publicClient: PublicClient;
}

// ============ BASE FIXTURE ============

/**
 * Base fixture that deploys all contracts with default configuration.
 * This is the foundation for all other fixtures.
 */
export async function deployFactoryFixture(): Promise<FixtureResult> {
  const { viem } = await hre.network.connect();

  // Get wallet clients (test accounts)
  const walletClients = await viem.getWalletClients();
  const [
    owner,
    admin,
    startup1,
    startup2,
    startup3,
    investor1,
    investor2,
    investor3,
    treasuryWallet,
    unauthorized,
  ] = walletClients;

  // Get public client for reading state
  const publicClient = await viem.getPublicClient();

  // Deploy Treasury contract
  const treasury = await viem.deployContract('CrowdVCTreasury', [
    getAddress(treasuryWallet.account.address),
  ]);

  // Deploy mock tokens
  const usdt = await viem.deployContract('MockUSDT');
  const usdc = await viem.deployContract('MockUSDC');

  // Deploy pool implementation (used for cloning)
  const poolImplementation = await viem.deployContract('CrowdVCPool');

  // Deploy factory with treasury contract address
  const factory = await viem.deployContract('CrowdVCFactory', [
    poolImplementation.address,
    treasury.address,
    DEFAULT_PLATFORM_FEE,
    usdt.address,
    usdc.address,
  ]);

  return {
    factory,
    poolImplementation,
    treasury,
    usdt,
    usdc,
    owner,
    admin,
    startup1,
    startup2,
    startup3,
    investor1,
    investor2,
    investor3,
    treasuryWallet,
    unauthorized,
    publicClient,
  };
}

// ============ FIXTURE WITH REGISTERED USERS ============

export interface FixtureWithUsersResult extends FixtureResult {
  startup1Address: `0x${string}`;
  startup2Address: `0x${string}`;
  investor1Address: `0x${string}`;
  investor2Address: `0x${string}`;
}

/**
 * Fixture with pre-registered users (startups and investors).
 */
export async function fixtureWithUsers(): Promise<FixtureWithUsersResult> {
  const base = await deployFactoryFixture();
  const { factory, startup1, startup2, investor1, investor2 } = base;

  // Register startup1
  await factory.write.registerUser([UserType.Startup, DEFAULT_METADATA_URI], {
    account: startup1.account,
  });

  // Register startup2
  await factory.write.registerUser([UserType.Startup, DEFAULT_METADATA_URI], {
    account: startup2.account,
  });

  // Register investor1
  await factory.write.registerUser([UserType.Investor, DEFAULT_METADATA_URI], {
    account: investor1.account,
  });

  // Register investor2
  await factory.write.registerUser([UserType.Investor, DEFAULT_METADATA_URI], {
    account: investor2.account,
  });

  return {
    ...base,
    startup1Address: getAddress(startup1.account.address),
    startup2Address: getAddress(startup2.account.address),
    investor1Address: getAddress(investor1.account.address),
    investor2Address: getAddress(investor2.account.address),
  };
}

// ============ FIXTURE WITH PITCHES ============

export interface FixtureWithPitchesResult extends FixtureWithUsersResult {
  pitch1Id: `0x${string}`;
  pitch2Id: `0x${string}`;
  pitch3Id: `0x${string}`;
}

/**
 * Fixture with registered users and submitted pitches.
 */
export async function fixtureWithPitches(): Promise<FixtureWithPitchesResult> {
  const base = await fixtureWithUsers();
  const { factory, startup1, startup2, startup3, publicClient } = base;

  // Register startup3
  await factory.write.registerUser([UserType.Startup, DEFAULT_METADATA_URI], {
    account: startup3.account,
  });

  // Submit pitch from startup1
  const hash1 = await factory.write.submitPitch(
    [DEFAULT_PITCH_TITLE, DEFAULT_PITCH_IPFS, DEFAULT_PITCH_FUNDING_GOAL],
    { account: startup1.account }
  );
  const receipt1 = await publicClient.waitForTransactionReceipt({ hash: hash1 });
  const logs1 = await factory.getEvents.PitchSubmitted(
    {},
    { fromBlock: receipt1.blockNumber, toBlock: receipt1.blockNumber }
  );
  const pitch1Id = logs1[0].args.pitchId as `0x${string}`;

  // Submit pitch from startup2
  const hash2 = await factory.write.submitPitch(
    ['Second Startup Pitch', 'ipfs://QmSecondPitch', DEFAULT_PITCH_FUNDING_GOAL],
    { account: startup2.account }
  );
  const receipt2 = await publicClient.waitForTransactionReceipt({ hash: hash2 });
  const logs2 = await factory.getEvents.PitchSubmitted(
    {},
    { fromBlock: receipt2.blockNumber, toBlock: receipt2.blockNumber }
  );
  const pitch2Id = logs2[0].args.pitchId as `0x${string}`;

  // Submit pitch from startup3
  const hash3 = await factory.write.submitPitch(
    ['Third Startup Pitch', 'ipfs://QmThirdPitch', DEFAULT_PITCH_FUNDING_GOAL],
    { account: startup3.account }
  );
  const receipt3 = await publicClient.waitForTransactionReceipt({ hash: hash3 });
  const logs3 = await factory.getEvents.PitchSubmitted(
    {},
    { fromBlock: receipt3.blockNumber, toBlock: receipt3.blockNumber }
  );
  const pitch3Id = logs3[0].args.pitchId as `0x${string}`;

  return {
    ...base,
    pitch1Id,
    pitch2Id,
    pitch3Id,
  };
}

// ============ FIXTURE WITH APPROVED PITCHES ============

/**
 * Fixture with pitches that have been approved by admin.
 */
export async function fixtureWithApprovedPitches(): Promise<FixtureWithPitchesResult> {
  const base = await fixtureWithPitches();
  const { factory, owner, pitch1Id, pitch2Id, pitch3Id } = base;

  // Approve pitch1 (owner is admin by default)
  await factory.write.updatePitchStatus([pitch1Id, PitchStatus.Approved], {
    account: owner.account,
  });

  // Approve pitch2
  await factory.write.updatePitchStatus([pitch2Id, PitchStatus.Approved], {
    account: owner.account,
  });

  // Approve pitch3
  await factory.write.updatePitchStatus([pitch3Id, PitchStatus.Approved], {
    account: owner.account,
  });

  return base;
}

// ============ FIXTURE WITH POOL ============

export interface FixtureWithPoolResult extends FixtureWithPitchesResult {
  poolAddress: `0x${string}`;
  pool: Contract;
}

/**
 * Fixture with an active pool containing approved pitches.
 */
export async function fixtureWithPool(): Promise<FixtureWithPoolResult> {
  const base = await fixtureWithApprovedPitches();
  const {
    factory,
    owner,
    usdt,
    pitch1Id,
    pitch2Id,
    pitch3Id,
    publicClient,
    startup1,
    startup2,
    startup3,
  } = base;

  const { viem } = await hre.network.connect();

  // Create pool WITHOUT candidate pitches - we'll add them via addStartupToPool
  // This allows us to properly set wallet addresses for each pitch
  const poolParams = {
    poolId: DEFAULT_POOL_ID,
    name: DEFAULT_POOL_NAME,
    category: DEFAULT_POOL_CATEGORY,
    fundingGoal: DEFAULT_POOL_FUNDING_GOAL,
    votingDuration: DEFAULT_VOTING_DURATION,
    fundingDuration: DEFAULT_FUNDING_DURATION,
    candidatePitches: [] as `0x${string}`[],
    acceptedToken: usdt.address,
    minContribution: DEFAULT_MIN_CONTRIBUTION,
    maxContribution: DEFAULT_MAX_CONTRIBUTION,
  };

  const hash = await factory.write.createPool([poolParams], {
    account: owner.account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const logs = await factory.getEvents.PoolDeployed(
    {},
    { fromBlock: receipt.blockNumber, toBlock: receipt.blockNumber }
  );
  const poolAddress = logs[0].args.poolAddress as `0x${string}`;

  // Get pool contract instance
  const pool = await viem.getContractAt('CrowdVCPool', poolAddress);

  // Add startups to pool with their wallet addresses
  await factory.write.addStartupToPool(
    [poolAddress, pitch1Id, getAddress(startup1.account.address)],
    { account: owner.account }
  );

  await factory.write.addStartupToPool(
    [poolAddress, pitch2Id, getAddress(startup2.account.address)],
    { account: owner.account }
  );

  await factory.write.addStartupToPool(
    [poolAddress, pitch3Id, getAddress(startup3.account.address)],
    { account: owner.account }
  );

  return {
    ...base,
    poolAddress,
    pool,
  };
}

// ============ FIXTURE WITH FUNDED INVESTORS ============

/**
 * Fixture with a pool and investors who have tokens minted and approved.
 */
export async function fixtureWithFundedInvestors(): Promise<FixtureWithPoolResult> {
  const base = await fixtureWithPool();
  const { usdt, investor1, investor2, investor3, poolAddress, owner } = base;

  // Mint tokens to investors
  await usdt.write.mint([getAddress(investor1.account.address), MINT_AMOUNT], {
    account: owner.account,
  });
  await usdt.write.mint([getAddress(investor2.account.address), MINT_AMOUNT], {
    account: owner.account,
  });
  await usdt.write.mint([getAddress(investor3.account.address), MINT_AMOUNT], {
    account: owner.account,
  });

  // Approve pool to spend tokens
  await usdt.write.approve([poolAddress, MINT_AMOUNT], {
    account: investor1.account,
  });
  await usdt.write.approve([poolAddress, MINT_AMOUNT], {
    account: investor2.account,
  });
  await usdt.write.approve([poolAddress, MINT_AMOUNT], {
    account: investor3.account,
  });

  return base;
}

// ============ FIXTURE WITH CONTRIBUTIONS ============

export interface FixtureWithContributionsResult extends FixtureWithPoolResult {
  investor1TokenId: bigint;
  investor2TokenId: bigint;
  investor3TokenId: bigint;
  investor1Contribution: bigint;
  investor2Contribution: bigint;
  investor3Contribution: bigint;
}

/**
 * Fixture with a pool where investors have already contributed.
 */
export async function fixtureWithContributions(): Promise<FixtureWithContributionsResult> {
  const base = await fixtureWithFundedInvestors();
  const { pool, usdt, investor1, investor2, investor3, publicClient } = base;

  // Define contribution amounts
  const investor1Contribution = LARGE_CONTRIBUTION; // 10,000 USDC
  const investor2Contribution = MEDIUM_CONTRIBUTION; // 1,000 USDC
  const investor3Contribution = MEDIUM_CONTRIBUTION; // 1,000 USDC

  // Investor1 contributes
  const hash1 = await pool.write.contribute([investor1Contribution, usdt.address], {
    account: investor1.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  const logs1 = await pool.getEvents.ContributionMade();
  const investor1TokenId = logs1[0].args.tokenId as bigint;

  // Investor2 contributes
  const hash2 = await pool.write.contribute([investor2Contribution, usdt.address], {
    account: investor2.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  const logs2 = await pool.getEvents.ContributionMade();
  const investor2TokenId = logs2[1].args.tokenId as bigint;

  // Investor3 contributes
  const hash3 = await pool.write.contribute([investor3Contribution, usdt.address], {
    account: investor3.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash3 });
  const logs3 = await pool.getEvents.ContributionMade();
  const investor3TokenId = logs3[2].args.tokenId as bigint;

  return {
    ...base,
    investor1TokenId,
    investor2TokenId,
    investor3TokenId,
    investor1Contribution,
    investor2Contribution,
    investor3Contribution,
  };
}

// ============ FIXTURE WITH VOTES ============

export interface FixtureWithVotesResult extends FixtureWithContributionsResult {}

/**
 * Fixture with a pool where investors have contributed and voted.
 */
export async function fixtureWithVotes(): Promise<FixtureWithVotesResult> {
  const base = await fixtureWithContributions();
  const { pool, investor1, investor2, investor3, pitch1Id, pitch2Id, pitch3Id } = base;

  // Investor1 votes for pitch1 and pitch2
  await pool.write.vote([pitch1Id], { account: investor1.account });
  await pool.write.vote([pitch2Id], { account: investor1.account });

  // Investor2 votes for pitch1
  await pool.write.vote([pitch1Id], { account: investor2.account });

  // Investor3 votes for pitch3
  await pool.write.vote([pitch3Id], { account: investor3.account });

  return base;
}

// ============ FIXTURE WITH VOTING ENDED ============

export interface FixtureWithVotingEndedResult extends FixtureWithVotesResult {
  winners: readonly any[];
}

/**
 * Fixture with voting ended and winners determined.
 */
export async function fixtureWithVotingEnded(): Promise<FixtureWithVotingEndedResult> {
  const base = await fixtureWithVotes();
  const { pool, factory, publicClient } = base;
  const { networkHelpers } = await hre.network.connect();

  // Fast forward past voting deadline
  const votingDeadline = await pool.read.votingDeadline();
  await networkHelpers.time.increaseTo(votingDeadline + 1n);

  // End voting (called via factory's admin role on pool)
  await pool.write.endVoting({ account: base.owner.account });

  // Get winners
  const winners = await pool.read.getWinners();

  return {
    ...base,
    winners,
  };
}

// ============ HELPER FUNCTIONS FOR FIXTURES ============

/**
 * Create pool parameters with custom overrides.
 */
export function createPoolParams(
  overrides: Partial<{
    poolId: string;
    name: string;
    category: string;
    fundingGoal: bigint;
    votingDuration: bigint;
    fundingDuration: bigint;
    candidatePitches: `0x${string}`[];
    acceptedToken: `0x${string}`;
    minContribution: bigint;
    maxContribution: bigint;
  }> = {}
) {
  return {
    poolId: overrides.poolId ?? DEFAULT_POOL_ID,
    name: overrides.name ?? DEFAULT_POOL_NAME,
    category: overrides.category ?? DEFAULT_POOL_CATEGORY,
    fundingGoal: overrides.fundingGoal ?? DEFAULT_POOL_FUNDING_GOAL,
    votingDuration: overrides.votingDuration ?? DEFAULT_VOTING_DURATION,
    fundingDuration: overrides.fundingDuration ?? DEFAULT_FUNDING_DURATION,
    candidatePitches: overrides.candidatePitches ?? [],
    acceptedToken:
      overrides.acceptedToken ??
      ('0x0000000000000000000000000000000000000000' as `0x${string}`),
    minContribution: overrides.minContribution ?? DEFAULT_MIN_CONTRIBUTION,
    maxContribution: overrides.maxContribution ?? DEFAULT_MAX_CONTRIBUTION,
  };
}

/**
 * Create milestone parameters for testing.
 */
export function createMilestones(
  count: number = 3,
  deadline: bigint = BigInt(Math.floor(Date.now() / 1000)) + 30n * ONE_DAY
) {
  const milestones = [];
  const percentPerMilestone = Math.floor(10000 / count);
  let totalPercent = 0;

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const percent = isLast ? 10000 - totalPercent : percentPerMilestone;
    totalPercent += percent;

    milestones.push({
      description: `Milestone ${i + 1}`,
      fundingPercent: BigInt(percent),
      deadline: deadline + BigInt(i) * ONE_DAY,
      completed: false,
      disputed: false,
      evidenceURI: '',
      approvalCount: 0n,
      approvalsNeeded: 0n,
    });
  }

  return milestones;
}

/**
 * Get a pool contract instance at a given address.
 */
export async function getPoolContract(address: `0x${string}`) {
  const { viem } = await hre.network.connect();
  return viem.getContractAt('CrowdVCPool', address);
}

/**
 * Get the network helpers for time manipulation etc.
 */
export async function getNetworkHelpers() {
  const { networkHelpers } = await hre.network.connect();
  return networkHelpers;
}
