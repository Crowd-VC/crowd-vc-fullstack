import { before, describe, it } from "node:test";
import { network } from "hardhat";
import { expectCustomError } from "./helpers/matchers";

/**
 * Comprehensive tests for ValidationLib library
 *
 * Tests cover:
 * - Address validation
 * - Amount validation
 * - String validation
 * - Duration validation
 * - Funding goal validation
 * - Deadline validation
 * - Array validation
 * - Pitch data validation
 * - Pool parameters validation
 * - Edge cases and error conditions
 */
describe("ValidationLib Library", () => {
  let viem: Awaited<ReturnType<typeof network.connect>>["viem"];
  let loadFixture: Awaited<
    ReturnType<typeof network.connect>
  >["networkHelpers"]["loadFixture"];

  before(async () => {
    const connection = await network.connect();
    viem = connection.viem;
    loadFixture = connection.networkHelpers.loadFixture;
  });

  /**
   * Deploy a test contract that exposes ValidationLib library functions
   */
  const deployValidationLibTestFixture = async () => {
    const [owner, user1, user2] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    // Deploy test harness contract that uses ValidationLib
    const ValidationLibTest = await viem.deployContract("ValidationLibTest");

    return {
      validationLib: ValidationLibTest,
      owner,
      user1,
      user2,
      publicClient,
    };
  };

  describe("Address Validation", () => {
    it("should accept valid non-zero address", async () => {
      const { validationLib, user1 } = await loadFixture(
        deployValidationLibTestFixture,
      );

      // Should not revert
      await validationLib.read.validateAddress([user1.account.address]);
    });

    it("should reject zero address", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const zeroAddress = "0x0000000000000000000000000000000000000000";

      await expectCustomError(
        validationLib.read.validateAddress([zeroAddress]),
        "InvalidAddress"
      );
    });
  });

  describe("Amount Validation", () => {
    it("should accept positive amounts", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      await validationLib.read.validateAmount([1n]);
      await validationLib.read.validateAmount([1000n]);
      await validationLib.read.validateAmount([BigInt(1e18)]);
    });

    it("should reject zero amount", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      await expectCustomError(
        validationLib.read.validateAmount([0n]),
        "InvalidAmount"
      );
    });
  });

  describe("String Validation", () => {
    it("should accept non-empty strings", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      await validationLib.read.validateString(["hello"]);
      await validationLib.read.validateString(["ipfs://QmHash..."]);
      await validationLib.read.validateString(["a"]); // Single character
    });

    it("should reject empty string", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      await expectCustomError(
        validationLib.read.validateString([""]),
        "InvalidString"
      );
    });

    it("should accept very long strings", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const longString = "a".repeat(1000);
      await validationLib.read.validateString([longString]);
    });
  });

  describe("Duration Validation", () => {
    it("should accept duration within valid range", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minDuration = 86400n; // 1 day
      const maxDuration = 2592000n; // 30 days

      // Test minimum boundary
      await validationLib.read.validateDuration([
        minDuration,
        minDuration,
        maxDuration,
      ]);

      // Test maximum boundary
      await validationLib.read.validateDuration([
        maxDuration,
        minDuration,
        maxDuration,
      ]);

      // Test middle value
      const midDuration = 604800n; // 7 days
      await validationLib.read.validateDuration([
        midDuration,
        minDuration,
        maxDuration,
      ]);
    });

    it("should reject duration below minimum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minDuration = 86400n; // 1 day
      const maxDuration = 2592000n; // 30 days
      const tooShort = 86399n; // 1 second less than min

      await expectCustomError(
        validationLib.read.validateDuration([
          tooShort,
          minDuration,
          maxDuration,
        ]),
        "InvalidDuration"
      );
    });

    it("should reject duration above maximum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minDuration = 86400n; // 1 day
      const maxDuration = 2592000n; // 30 days
      const tooLong = 2592001n; // 1 second more than max

      await expectCustomError(
        validationLib.read.validateDuration([
          tooLong,
          minDuration,
          maxDuration,
        ]),
        "InvalidDuration"
      );
    });

    it("should reject zero duration when min is non-zero", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      await expectCustomError(
        validationLib.read.validateDuration([0n, 1n, 1000n]),
        "InvalidDuration"
      );
    });
  });

  describe("Funding Goal Validation", () => {
    it("should accept goal within valid range", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minGoal = BigInt(1000 * 1e6); // 1,000 USDT
      const maxGoal = BigInt(10_000_000 * 1e6); // 10M USDT

      // Test minimum boundary
      await validationLib.read.validateFundingGoal([minGoal, minGoal, maxGoal]);

      // Test maximum boundary
      await validationLib.read.validateFundingGoal([maxGoal, minGoal, maxGoal]);

      // Test middle value
      const midGoal = BigInt(50_000 * 1e6); // 50k USDT
      await validationLib.read.validateFundingGoal([midGoal, minGoal, maxGoal]);
    });

    it("should reject goal below minimum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);
      const tooLow = BigInt(999 * 1e6);

      await expectCustomError(
        validationLib.read.validateFundingGoal([tooLow, minGoal, maxGoal]),
        "InvalidFundingGoal"
      );
    });

    it("should reject goal above maximum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);
      const tooHigh = BigInt(10_000_001 * 1e6);

      await expectCustomError(
        validationLib.read.validateFundingGoal([tooHigh, minGoal, maxGoal]),
        "InvalidFundingGoal"
      );
    });
  });

  describe("Deadline Validation", () => {
    it("should accept future deadline", async () => {
      const { validationLib, publicClient } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const currentBlock = await publicClient.getBlock();
      const currentTimestamp = currentBlock.timestamp;
      const futureDeadline = currentTimestamp + 86400n; // 1 day in future

      await validationLib.read.validateDeadline([futureDeadline]);
    });

    it("should reject past deadline", async () => {
      const { validationLib, publicClient } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const currentBlock = await publicClient.getBlock();
      const currentTimestamp = currentBlock.timestamp;
      const pastDeadline = currentTimestamp - 1n; // 1 second in past

      await expectCustomError(
        validationLib.read.validateDeadline([pastDeadline]),
        "DeadlineInPast"
      );
    });

    it("should reject deadline equal to current timestamp", async () => {
      const { validationLib, publicClient } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const currentBlock = await publicClient.getBlock();
      const currentTimestamp = currentBlock.timestamp;

      await expectCustomError(
        validationLib.read.validateDeadline([currentTimestamp]),
        "DeadlineInPast"
      );
    });

    it("should accept far future deadline", async () => {
      const { validationLib, publicClient } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const currentBlock = await publicClient.getBlock();
      const currentTimestamp = currentBlock.timestamp;
      const farFuture = currentTimestamp + BigInt(365 * 24 * 60 * 60); // 1 year

      await validationLib.read.validateDeadline([farFuture]);
    });
  });

  describe("Array Validation", () => {
    it("should accept non-empty array", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const array1 = ["0x" + "1".repeat(64)] as `0x${string}`[];
      const array3 = [
        "0x" + "1".repeat(64),
        "0x" + "2".repeat(64),
        "0x" + "3".repeat(64),
      ] as `0x${string}`[];

      await validationLib.read.validateNonEmptyArray([array1]);
      await validationLib.read.validateNonEmptyArray([array3]);
    });

    it("should reject empty array", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const emptyArray: `0x${string}`[] = [];

      await expectCustomError(
        validationLib.read.validateNonEmptyArray([emptyArray]),
        "EmptyArray"
      );
    });

    it("should accept large arrays", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const largeArray = Array(100).fill(
        "0x" + "1".repeat(64),
      ) as `0x${string}`[];

      await validationLib.read.validateNonEmptyArray([largeArray]);
    });
  });

  describe("Pitch Data Validation", () => {
    it("should accept valid pitch data", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const title = "AI-Powered Analytics Platform";
      const ipfsHash = "QmPitchHash123...";
      const fundingGoal = BigInt(50_000 * 1e6); // 50k USDT
      const minGoal = BigInt(1000 * 1e6); // 1k USDT
      const maxGoal = BigInt(10_000_000 * 1e6); // 10M USDT

      await validationLib.read.validatePitchData([
        title,
        ipfsHash,
        fundingGoal,
        minGoal,
        maxGoal,
      ]);
    });

    it("should reject pitch with empty title", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const emptyTitle = "";
      const ipfsHash = "QmPitchHash123...";
      const fundingGoal = BigInt(50_000 * 1e6);
      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);

      await expectCustomError(
        validationLib.read.validatePitchData([
          emptyTitle,
          ipfsHash,
          fundingGoal,
          minGoal,
          maxGoal,
        ]),
        "InvalidString"
      );
    });

    it("should reject pitch with empty IPFS hash", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const title = "Valid Title";
      const emptyIpfsHash = "";
      const fundingGoal = BigInt(50_000 * 1e6);
      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);

      await expectCustomError(
        validationLib.read.validatePitchData([
          title,
          emptyIpfsHash,
          fundingGoal,
          minGoal,
          maxGoal,
        ]),
        "InvalidString"
      );
    });

    it("should reject pitch with funding goal below minimum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const title = "Valid Title";
      const ipfsHash = "QmPitchHash123...";
      const fundingGoal = BigInt(500 * 1e6); // Below min
      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);

      await expectCustomError(
        validationLib.read.validatePitchData([
          title,
          ipfsHash,
          fundingGoal,
          minGoal,
          maxGoal,
        ]),
        "InvalidFundingGoal"
      );
    });

    it("should reject pitch with funding goal above maximum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const title = "Valid Title";
      const ipfsHash = "QmPitchHash123...";
      const fundingGoal = BigInt(11_000_000 * 1e6); // Above max
      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);

      await expectCustomError(
        validationLib.read.validatePitchData([
          title,
          ipfsHash,
          fundingGoal,
          minGoal,
          maxGoal,
        ]),
        "InvalidFundingGoal"
      );
    });
  });

  describe("Pool Parameters Validation", () => {
    it("should accept valid pool parameters", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const name = "Q1 2025 Innovation Pool";
      const fundingGoal = BigInt(150_000 * 1e6); // 150k USDT
      const votingDuration = BigInt(7 * 24 * 60 * 60); // 7 days
      const fundingDuration = BigInt(30 * 24 * 60 * 60); // 30 days
      const minContribution = BigInt(100 * 1e6); // 100 USDT
      const minPoolGoal = BigInt(10_000 * 1e6); // 10k min
      const maxPoolGoal = BigInt(50_000_000 * 1e6); // 50M max
      const minVotingDuration = BigInt(1 * 24 * 60 * 60); // 1 day
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60); // 30 days

      await validationLib.read.validatePoolParameters([
        name,
        fundingGoal,
        votingDuration,
        fundingDuration,
        minContribution,
        minPoolGoal,
        maxPoolGoal,
        minVotingDuration,
        maxVotingDuration,
      ]);
    });

    it("should reject pool with empty name", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const emptyName = "";
      const fundingGoal = BigInt(150_000 * 1e6);
      const votingDuration = BigInt(7 * 24 * 60 * 60);
      const fundingDuration = BigInt(30 * 24 * 60 * 60);
      const minContribution = BigInt(100 * 1e6);
      const minPoolGoal = BigInt(10_000 * 1e6);
      const maxPoolGoal = BigInt(50_000_000 * 1e6);
      const minVotingDuration = BigInt(1 * 24 * 60 * 60);
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60);

      await expectCustomError(
        validationLib.read.validatePoolParameters([
          emptyName,
          fundingGoal,
          votingDuration,
          fundingDuration,
          minContribution,
          minPoolGoal,
          maxPoolGoal,
          minVotingDuration,
          maxVotingDuration,
        ]),
        "InvalidString"
      );
    });

    it("should reject pool with funding goal below minimum", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const name = "Valid Pool Name";
      const fundingGoal = BigInt(5_000 * 1e6); // Below 10k min
      const votingDuration = BigInt(7 * 24 * 60 * 60);
      const fundingDuration = BigInt(30 * 24 * 60 * 60);
      const minContribution = BigInt(100 * 1e6);
      const minPoolGoal = BigInt(10_000 * 1e6);
      const maxPoolGoal = BigInt(50_000_000 * 1e6);
      const minVotingDuration = BigInt(1 * 24 * 60 * 60);
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60);

      await expectCustomError(
        validationLib.read.validatePoolParameters([
          name,
          fundingGoal,
          votingDuration,
          fundingDuration,
          minContribution,
          minPoolGoal,
          maxPoolGoal,
          minVotingDuration,
          maxVotingDuration,
        ]),
        "InvalidFundingGoal"
      );
    });

    it("should reject pool with voting duration too short", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const name = "Valid Pool Name";
      const fundingGoal = BigInt(150_000 * 1e6);
      const votingDuration = BigInt(12 * 60 * 60); // 12 hours (less than 1 day min)
      const fundingDuration = BigInt(30 * 24 * 60 * 60);
      const minContribution = BigInt(100 * 1e6);
      const minPoolGoal = BigInt(10_000 * 1e6);
      const maxPoolGoal = BigInt(50_000_000 * 1e6);
      const minVotingDuration = BigInt(1 * 24 * 60 * 60);
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60);

      await expectCustomError(
        validationLib.read.validatePoolParameters([
          name,
          fundingGoal,
          votingDuration,
          fundingDuration,
          minContribution,
          minPoolGoal,
          maxPoolGoal,
          minVotingDuration,
          maxVotingDuration,
        ]),
        "InvalidDuration"
      );
    });

    it("should reject pool with voting duration too long", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const name = "Valid Pool Name";
      const fundingGoal = BigInt(150_000 * 1e6);
      const votingDuration = BigInt(60 * 24 * 60 * 60); // 60 days (more than 30 day max)
      const fundingDuration = BigInt(30 * 24 * 60 * 60);
      const minContribution = BigInt(100 * 1e6);
      const minPoolGoal = BigInt(10_000 * 1e6);
      const maxPoolGoal = BigInt(50_000_000 * 1e6);
      const minVotingDuration = BigInt(1 * 24 * 60 * 60);
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60);

      await expectCustomError(
        validationLib.read.validatePoolParameters([
          name,
          fundingGoal,
          votingDuration,
          fundingDuration,
          minContribution,
          minPoolGoal,
          maxPoolGoal,
          minVotingDuration,
          maxVotingDuration,
        ]),
        "InvalidDuration"
      );
    });

    it("should reject pool with zero minimum contribution", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const name = "Valid Pool Name";
      const fundingGoal = BigInt(150_000 * 1e6);
      const votingDuration = BigInt(7 * 24 * 60 * 60);
      const fundingDuration = BigInt(30 * 24 * 60 * 60);
      const minContribution = 0n; // Invalid: zero
      const minPoolGoal = BigInt(10_000 * 1e6);
      const maxPoolGoal = BigInt(50_000_000 * 1e6);
      const minVotingDuration = BigInt(1 * 24 * 60 * 60);
      const maxVotingDuration = BigInt(30 * 24 * 60 * 60);

      await expectCustomError(
        validationLib.read.validatePoolParameters([
          name,
          fundingGoal,
          votingDuration,
          fundingDuration,
          minContribution,
          minPoolGoal,
          maxPoolGoal,
          minVotingDuration,
          maxVotingDuration,
        ]),
        "InvalidAmount"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle maximum uint256 values where appropriate", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const maxUint256 = BigInt(
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      );

      // Should accept very large amount
      await validationLib.read.validateAmount([maxUint256]);
    });

    it("should handle UTF-8 strings correctly", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const unicodeString = "🚀 Innovation Pool 2025 🌟";
      await validationLib.read.validateString([unicodeString]);
    });

    it("should handle boundary conditions precisely", async () => {
      const { validationLib } = await loadFixture(
        deployValidationLibTestFixture,
      );

      const minGoal = BigInt(1000 * 1e6);
      const maxGoal = BigInt(10_000_000 * 1e6);

      // Exact minimum should pass
      await validationLib.read.validateFundingGoal([minGoal, minGoal, maxGoal]);

      // One below minimum should fail
      await expectCustomError(
        validationLib.read.validateFundingGoal([
          minGoal - 1n,
          minGoal,
          maxGoal,
        ]),
        "InvalidFundingGoal"
      );

      // Exact maximum should pass
      await validationLib.read.validateFundingGoal([maxGoal, minGoal, maxGoal]);

      // One above maximum should fail
      await expectCustomError(
        validationLib.read.validateFundingGoal([
          maxGoal + 1n,
          minGoal,
          maxGoal,
        ]),
        "InvalidFundingGoal"
      );
    });
  });
});
