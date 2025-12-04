import { network } from "hardhat";
import hre from "hardhat";
import { Address, keccak256, toHex } from "viem";

// Get viem instance from network connection
const getViem = async () => {
  const connection = await network.connect();
  return connection.viem;
};

/**
 * Deploys mock USDT and USDC tokens for testing
 * @returns Mock token contract instances and addresses
 */
export async function deployMockTokensFixture() {
  const viem = await getViem();
  const usdt = await viem.deployContract("MockUSDT");
  const usdc = await viem.deployContract("MockUSDC");

  return {
    usdt,
    usdc,
    usdtAddress: usdt.address,
    usdcAddress: usdc.address,
  };
}

/**
 * Deploys the CrowdVCFactory contract with mock tokens
 * Initializes factory with treasury, platform fee, and supported tokens
 * @returns Factory contract, tokens, and relevant addresses
 */
export async function deployFactoryFixture() {
  const viem = await getViem();
  const [admin, treasury, ...others] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  // Deploy mock tokens
  const { usdt, usdc, usdtAddress, usdcAddress } =
    await deployMockTokensFixture();

  // Deploy CrowdVCFactory
  const factory = await viem.deployContract("CrowdVCFactory");

  // Initialize factory with treasury, platform fee (500 basis points = 5%), and supported tokens
  const platformFee = 500; // 5%
  await factory.write.initialize([
    treasury.account.address,
    platformFee,
    [usdtAddress, usdcAddress],
  ]);

  // Verify initialization
  const retrievedPlatformFee = await factory.read.platformFeePercent();
  const retrievedTreasury = await factory.read.treasury();
  const isUsdtSupported = await factory.read.isSupportedToken([usdtAddress]);
  const isUsdcSupported = await factory.read.isSupportedToken([usdcAddress]);

  if (retrievedPlatformFee !== BigInt(platformFee)) {
    throw new Error("Platform fee not set correctly");
  }
  if (retrievedTreasury !== treasury.account.address) {
    throw new Error("Treasury not set correctly");
  }
  if (!isUsdtSupported || !isUsdcSupported) {
    throw new Error("Tokens not registered correctly");
  }

  return {
    factory,
    usdt,
    usdc,
    usdtAddress,
    usdcAddress,
    admin,
    treasury,
    others,
    publicClient,
  };
}

/**
 * Registers multiple startup and investor users
 * Builds on deployFactoryFixture
 * @returns Factory, tokens, and arrays of registered user addresses
 */
export async function registerUsersFixture() {
  const fixtureData = await deployFactoryFixture();
  const { factory, others } = fixtureData;

  // Get test accounts for startups and investors
  const [startup1, startup2, startup3, investor1, investor2, investor3] =
    others;

  // Register startups (UserType.Startup = 1)
  const startupMetadataURI = "ipfs://QmStartupMetadata";
  await factory.write.registerUser(
    [1, startupMetadataURI],
    { account: startup1.account }
  );
  await factory.write.registerUser(
    [1, startupMetadataURI],
    { account: startup2.account }
  );
  await factory.write.registerUser(
    [1, startupMetadataURI],
    { account: startup3.account }
  );

  // Register investors (UserType.Investor = 2)
  const investorMetadataURI = "ipfs://QmInvestorMetadata";
  await factory.write.registerUser(
    [2, investorMetadataURI],
    { account: investor1.account }
  );
  await factory.write.registerUser(
    [2, investorMetadataURI],
    { account: investor2.account }
  );
  await factory.write.registerUser(
    [2, investorMetadataURI],
    { account: investor3.account }
  );

  // Verify roles are granted correctly
  const STARTUP_ROLE = await factory.read.STARTUP_ROLE();
  const INVESTOR_ROLE = await factory.read.INVESTOR_ROLE();

  const hasStartup1Role = await factory.read.hasRole([
    STARTUP_ROLE,
    startup1.account.address,
  ]);
  const hasInvestor1Role = await factory.read.hasRole([
    INVESTOR_ROLE,
    investor1.account.address,
  ]);

  if (!hasStartup1Role || !hasInvestor1Role) {
    throw new Error("Roles not granted correctly");
  }

  return {
    ...fixtureData,
    startups: [startup1, startup2, startup3],
    investors: [investor1, investor2, investor3],
  };
}

/**
 * Submits and approves pitches from registered startups
 * Builds on registerUsersFixture
 * @returns Factory, tokens, users, and array of approved pitch IDs
 */
export async function submitPitchesFixture() {
  const fixtureData = await registerUsersFixture();
  const { factory, admin, startups } = fixtureData;

  const pitchIds: `0x${string}`[] = [];

  // Startup 1 submits pitch
  const pitch1Title = "AI-Powered Analytics Platform";
  const pitch1IpfsHash = "QmPitch1Hash";
  const pitch1FundingGoal = BigInt(50000 * 1e6); // 50,000 USDT (6 decimals)

  const tx1 = await factory.write.submitPitch(
    [pitch1Title, pitch1IpfsHash, pitch1FundingGoal],
    { account: startups[0].account }
  );
  const receipt1 = await fixtureData.publicClient.waitForTransactionReceipt({
    hash: tx1,
  });
  // Get event topic by calculating keccak256 hash of the event signature
  const pitchSubmittedEventAbi = factory.abi.find((item: any) => item.name === "PitchSubmitted");
  const pitchSubmittedTopic = pitchSubmittedEventAbi
    ? keccak256(toHex(`${pitchSubmittedEventAbi.name}(${pitchSubmittedEventAbi.inputs.map((i: any) => i.type).join(',')})`))
    : undefined;
  const pitchSubmittedEvent1 = receipt1.logs.find(
    (log) => log.topics[0] === pitchSubmittedTopic
  );
  if (pitchSubmittedEvent1) {
    pitchIds.push(pitchSubmittedEvent1.topics[1] as `0x${string}`);
  }

  // Startup 2 submits pitch
  const pitch2Title = "Blockchain Supply Chain Solution";
  const pitch2IpfsHash = "QmPitch2Hash";
  const pitch2FundingGoal = BigInt(75000 * 1e6); // 75,000 USDT

  const tx2 = await factory.write.submitPitch(
    [pitch2Title, pitch2IpfsHash, pitch2FundingGoal],
    { account: startups[1].account }
  );
  const receipt2 = await fixtureData.publicClient.waitForTransactionReceipt({
    hash: tx2,
  });
  const pitchSubmittedEvent2 = receipt2.logs.find(
    (log) => log.topics[0] === pitchSubmittedTopic
  );
  if (pitchSubmittedEvent2) {
    pitchIds.push(pitchSubmittedEvent2.topics[1] as `0x${string}`);
  }

  // Startup 3 submits pitch
  const pitch3Title = "Green Energy Marketplace";
  const pitch3IpfsHash = "QmPitch3Hash";
  const pitch3FundingGoal = BigInt(60000 * 1e6); // 60,000 USDT

  const tx3 = await factory.write.submitPitch(
    [pitch3Title, pitch3IpfsHash, pitch3FundingGoal],
    { account: startups[2].account }
  );
  const receipt3 = await fixtureData.publicClient.waitForTransactionReceipt({
    hash: tx3,
  });
  const pitchSubmittedEvent3 = receipt3.logs.find(
    (log) => log.topics[0] === pitchSubmittedTopic
  );
  if (pitchSubmittedEvent3) {
    pitchIds.push(pitchSubmittedEvent3.topics[1] as `0x${string}`);
  }

  // Admin approves all pitches (PitchStatus.Approved = 2)
  for (const pitchId of pitchIds) {
    await factory.write.updatePitchStatus([pitchId, 2], {
      account: admin.account,
    });

    // Verify pitch status
    const isApproved = await factory.read.isPitchApproved([pitchId]);
    if (!isApproved) {
      throw new Error(`Pitch ${pitchId} not approved correctly`);
    }
  }

  return {
    ...fixtureData,
    pitchIds,
  };
}

/**
 * Creates a pool with approved pitches as candidates
 * Builds on submitPitchesFixture
 * @returns Factory, pool contract, tokens, users, and pitch IDs
 */
export async function deployPoolFixture() {
  const fixtureData = await submitPitchesFixture();
  const { factory, admin, usdtAddress, pitchIds, publicClient } = fixtureData;

  // Pool parameters
  const poolName = "Q1 2025 Innovation Pool";
  const category = "Technology";
  const fundingGoal = BigInt(150000 * 1e6); // 150,000 USDT (6 decimals)
  const votingDuration = BigInt(7 * 24 * 60 * 60); // 7 days in seconds
  const fundingDuration = BigInt(30 * 24 * 60 * 60); // 30 days in seconds
  const candidatePitches = pitchIds;
  const acceptedToken = usdtAddress;
  const minContribution = BigInt(100 * 1e6); // 100 USDT minimum

  // Admin creates pool
  const tx = await factory.write.createPool(
    [
      poolName,
      category,
      fundingGoal,
      votingDuration,
      fundingDuration,
      candidatePitches,
      acceptedToken,
      minContribution,
    ],
    { account: admin.account }
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

  // Extract pool address from PoolCreated event
  const poolCreatedEventAbi = factory.abi.find((item: any) => item.name === "PoolCreated");
  const poolCreatedTopic = poolCreatedEventAbi
    ? keccak256(toHex(`${poolCreatedEventAbi.name}(${poolCreatedEventAbi.inputs.map((i: any) => i.type).join(',')})`))
    : undefined;
  const poolCreatedEvent = receipt.logs.find(
    (log) => log.topics[0] === poolCreatedTopic
  );

  if (!poolCreatedEvent) {
    throw new Error("PoolCreated event not found");
  }

  const poolAddress = `0x${poolCreatedEvent.topics[1]?.slice(26)}` as Address;

  // Get pool contract instance
  const viem = await getViem();
  const pool = await viem.getContractAt("CrowdVCPool", poolAddress);

  // Verify pool is initialized
  const poolInfo = await pool.read.getPoolInfo();
  if (poolInfo[0] !== poolName) {
    throw new Error("Pool not initialized correctly");
  }

  // Verify pool status is Active (0)
  if (poolInfo[7] !== 0) {
    throw new Error("Pool status is not Active");
  }

  return {
    ...fixtureData,
    pool,
    poolAddress,
    poolConfig: {
      poolName,
      category,
      fundingGoal,
      votingDuration,
      fundingDuration,
      minContribution,
    },
  };
}

/**
 * Creates an active pool with contributions and votes
 * Builds on deployPoolFixture
 * @returns Factory, pool, tokens, users, pitches, and contribution details
 */
export async function createActivePoolFixture() {
  const fixtureData = await deployPoolFixture();
  const {
    pool,
    usdt,
    investors,
    pitchIds,
    poolConfig: { minContribution },
    publicClient,
  } = fixtureData;

  const contributions: Array<{
    investor: Address;
    amount: bigint;
    tokenId: bigint;
  }> = [];

  // Mint tokens to investors and have them contribute
  for (let i = 0; i < investors.length; i++) {
    const investor = investors[i];
    const amount = minContribution * BigInt(i + 2); // 2x, 3x, 4x min contribution

    // Mint tokens to investor
    await usdt.write.mint([investor.account.address, amount]);

    // Approve pool to spend tokens
    await usdt.write.approve([pool.address, amount], {
      account: investor.account,
    });

    // Contribute to pool (new signature: amount, token)
    const tx = await pool.write.contribute([amount, usdt.address], {
      account: investor.account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

    // Extract NFT token ID from event
    const contributionEventAbi = pool.abi.find((item: any) => item.name === "ContributionReceived");
    const contributionTopic = contributionEventAbi
      ? keccak256(toHex(`${contributionEventAbi.name}(${contributionEventAbi.inputs.map((i: any) => i.type).join(',')})`))
      : undefined;
    const contributionEvent = receipt.logs.find(
      (log) => log.topics[0] === contributionTopic
    );

    let tokenId = BigInt(0);
    if (contributionEvent) {
      // TokenId is typically the 3rd indexed parameter
      tokenId = BigInt(contributionEvent.topics[3] || 0);
    }

    contributions.push({
      investor: investor.account.address,
      amount,
      tokenId,
    });
  }

  // Have investors vote for different pitches
  const votes: Array<{ voter: Address; pitchId: `0x${string}` }> = [];

  // Investor 1 votes for pitch 1
  await pool.write.vote([pitchIds[0]], { account: investors[0].account });
  votes.push({ voter: investors[0].account.address, pitchId: pitchIds[0] });

  // Investor 2 votes for pitch 2
  await pool.write.vote([pitchIds[1]], { account: investors[1].account });
  votes.push({ voter: investors[1].account.address, pitchId: pitchIds[1] });

  // Investor 3 votes for pitch 1 (same as investor 1)
  await pool.write.vote([pitchIds[0]], { account: investors[2].account });
  votes.push({ voter: investors[2].account.address, pitchId: pitchIds[0] });

  return {
    ...fixtureData,
    contributions,
    votes,
  };
}

/**
 * Creates a pool where voting has ended
 * Builds on createActivePoolFixture and advances time past voting deadline
 * @returns Factory, pool, tokens, users, and all state data
 */
export async function createPoolWithVotingEndedFixture() {
  const fixtureData = await createActivePoolFixture();
  const {
    pool,
    admin,
    poolConfig: { votingDuration },
  } = fixtureData;

  // Advance time past voting deadline
  await hre.network.provider.send("evm_increaseTime", [
    Number(votingDuration) + 1,
  ]);
  await hre.network.provider.send("evm_mine");

  // Admin ends voting
  await pool.write.endVoting({ account: admin.account });

  // Verify pool status has transitioned
  const poolInfo = await pool.read.getPoolInfo();
  const status = poolInfo[7];

  // Status should be VotingEnded (1) or Funded (2) depending on whether funding goal was met
  if (status !== 1 && status !== 2) {
    throw new Error("Pool status did not transition correctly after ending voting");
  }

  return {
    ...fixtureData,
  };
}
