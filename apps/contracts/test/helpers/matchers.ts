import { expect } from "chai";
import { Address, decodeEventLog } from "viem";

/**
 * Event Assertion Helpers
 */

/**
 * Asserts that an event was emitted in a transaction receipt
 * @param receipt Transaction receipt
 * @param contractAbi Contract ABI containing event definitions
 * @param eventName Name of the event to check for
 * @param expectedArgs Optional object with expected event arguments
 * @returns The matched event log
 */
export function expectEvent(
  receipt: any,
  contractAbi: any[],
  eventName: string,
  expectedArgs?: Record<string, any>
): any {
  const eventAbi = contractAbi.find(
    (item) => item.type === "event" && item.name === eventName
  );

  if (!eventAbi) {
    throw new Error(`Event ${eventName} not found in contract ABI`);
  }

  const matchingLog = receipt.logs.find((log: any) => {
    try {
      const decoded = decodeEventLog({
        abi: contractAbi,
        data: log.data,
        topics: log.topics,
      });
      return decoded.eventName === eventName;
    } catch {
      return false;
    }
  });

  expect(matchingLog, `Event ${eventName} not found in transaction logs`).to
    .not.be.undefined;

  if (expectedArgs && matchingLog) {
    const decoded = decodeEventLog({
      abi: contractAbi,
      data: matchingLog.data,
      topics: matchingLog.topics,
    });

    for (const [key, value] of Object.entries(expectedArgs)) {
      expect(
        decoded.args[key],
        `Event ${eventName} argument ${key} does not match expected value`
      ).to.equal(value);
    }
  }

  return matchingLog;
}

/**
 * Asserts that an event was emitted with custom validation for arguments
 * @param receipt Transaction receipt
 * @param contractAbi Contract ABI
 * @param eventName Name of the event
 * @param argChecks Object with custom validation functions for each argument
 * @returns The matched event log
 */
export function expectEventWithArgs(
  receipt: any,
  contractAbi: any[],
  eventName: string,
  argChecks: Record<string, (value: any) => boolean>
): any {
  const matchingLog = expectEvent(receipt, contractAbi, eventName);

  const decoded = decodeEventLog({
    abi: contractAbi,
    data: matchingLog.data,
    topics: matchingLog.topics,
  });

  for (const [key, checkFn] of Object.entries(argChecks)) {
    expect(
      checkFn(decoded.args[key]),
      `Event ${eventName} argument ${key} failed custom validation`
    ).to.be.true;
  }

  return matchingLog;
}

/**
 * Asserts that a specific event was NOT emitted in a transaction
 * @param receipt Transaction receipt
 * @param contractAbi Contract ABI
 * @param eventName Name of the event that should not be present
 */
export function expectNoEvent(
  receipt: any,
  contractAbi: any[],
  eventName: string
): void {
  const matchingLog = receipt.logs.find((log: any) => {
    try {
      const decoded = decodeEventLog({
        abi: contractAbi,
        data: log.data,
        topics: log.topics,
      });
      return decoded.eventName === eventName;
    } catch {
      return false;
    }
  });

  expect(matchingLog, `Event ${eventName} should not be emitted`).to.be
    .undefined;
}

/**
 * Revert Assertion Helpers
 */

/**
 * Asserts that a promise rejects with an optional error message or pattern
 * @param promise Promise that should reject
 * @param expectedError Optional error message string or RegExp pattern
 */
export async function expectRevert(
  promise: Promise<any>,
  expectedError?: string | RegExp
): Promise<void> {
  try {
    await promise;
    expect.fail("Expected transaction to revert, but it succeeded");
  } catch (error: any) {
    if (expectedError) {
      if (typeof expectedError === "string") {
        expect(
          error.message,
          `Expected error message to contain "${expectedError}"`
        ).to.include(expectedError);
      } else {
        expect(
          error.message,
          `Expected error message to match pattern ${expectedError}`
        ).to.match(expectedError);
      }
    }
  }
}

/**
 * Asserts that a promise rejects with a specific Solidity custom error
 * @param promise Promise that should reject
 * @param errorName Name of the custom error (e.g., "InvalidAddress")
 */
export async function expectCustomError(
  promise: Promise<any>,
  errorName: string
): Promise<void> {
  await expectRevert(promise, new RegExp(errorName));
}

/**
 * Asserts that a promise rejects with an AccessControl error
 * @param promise Promise that should reject
 * @param account Account address that was denied access
 * @param role Role identifier that was required
 */
export async function expectAccessControlRevert(
  promise: Promise<any>,
  account: Address,
  role: string
): Promise<void> {
  try {
    await promise;
    expect.fail("Expected AccessControl revert, but transaction succeeded");
  } catch (error: any) {
    expect(error.message).to.satisfy(
      (msg: string) =>
        msg.includes("AccessControl") ||
        msg.includes(account) ||
        msg.includes(role),
      `Expected AccessControl error for account ${account} and role ${role}`
    );
  }
}

/**
 * Value Comparison Helpers
 */

/**
 * Compares two BigInt values for equality
 * @param actual Actual BigInt value
 * @param expected Expected BigInt value
 * @param message Optional custom error message
 */
export function expectBigIntEqual(
  actual: bigint,
  expected: bigint,
  message?: string
): void {
  expect(actual, message || `Expected ${actual} to equal ${expected}`).to.equal(
    expected
  );
}

/**
 * Asserts that a BigInt value is within a delta of an expected value
 * @param actual Actual BigInt value
 * @param expected Expected BigInt value
 * @param delta Maximum allowed difference
 * @param message Optional custom error message
 */
export function expectBigIntCloseTo(
  actual: bigint,
  expected: bigint,
  delta: bigint,
  message?: string
): void {
  const diff = actual > expected ? actual - expected : expected - actual;
  expect(
    diff <= delta,
    message ||
      `Expected ${actual} to be within ${delta} of ${expected}, but difference is ${diff}`
  ).to.be.true;
}

/**
 * Deep equality check for arrays
 * @param actual Actual array
 * @param expected Expected array
 * @param message Optional custom error message
 */
export function expectArrayEqual(
  actual: any[],
  expected: any[],
  message?: string
): void {
  expect(actual, message || "Arrays do not match").to.deep.equal(expected);
}

/**
 * State Assertion Helpers
 */

/**
 * Asserts that a role is granted to an account
 * @param contract Contract instance with hasRole function
 * @param role Role identifier (bytes32)
 * @param account Account address to check
 */
export async function expectRoleGranted(
  contract: any,
  role: `0x${string}`,
  account: Address
): Promise<void> {
  const hasRole = await contract.read.hasRole([role, account]);
  expect(hasRole, `Expected account ${account} to have role ${role}`).to.be
    .true;
}

/**
 * Asserts that a role is NOT granted to an account
 * @param contract Contract instance with hasRole function
 * @param role Role identifier (bytes32)
 * @param account Account address to check
 */
export async function expectRoleRevoked(
  contract: any,
  role: `0x${string}`,
  account: Address
): Promise<void> {
  const hasRole = await contract.read.hasRole([role, account]);
  expect(hasRole, `Expected account ${account} to NOT have role ${role}`).to.be
    .false;
}

/**
 * Asserts that a pool has a specific status
 * @param pool Pool contract instance
 * @param expectedStatus Expected PoolStatus enum value (0=Active, 1=VotingEnded, 2=Funded, 3=Closed, 4=Failed)
 */
export async function expectPoolStatus(
  pool: any,
  expectedStatus: number
): Promise<void> {
  const poolInfo = await pool.read.getPoolInfo();
  const actualStatus = poolInfo[7]; // Status is the 8th field in PoolInfo struct

  const statusNames = ["Active", "VotingEnded", "Funded", "Closed", "Failed"];
  const actualStatusName = statusNames[actualStatus] || "Unknown";
  const expectedStatusName = statusNames[expectedStatus] || "Unknown";

  expect(
    actualStatus,
    `Expected pool status to be ${expectedStatusName} (${expectedStatus}), but got ${actualStatusName} (${actualStatus})`
  ).to.equal(expectedStatus);
}

/**
 * Asserts that a pitch has a specific status
 * @param factory Factory contract instance
 * @param pitchId Pitch ID
 * @param expectedStatus Expected PitchStatus enum value (0=Pending, 1=UnderReview, 2=Approved, 3=Rejected, 4=InPool, 5=Funded)
 */
export async function expectPitchStatus(
  factory: any,
  pitchId: `0x${string}`,
  expectedStatus: number
): Promise<void> {
  const pitchData = await factory.read.getPitchById([pitchId]);
  const actualStatus = pitchData[5]; // Status is the 6th field in PitchData struct

  const statusNames = [
    "Pending",
    "UnderReview",
    "Approved",
    "Rejected",
    "InPool",
    "Funded",
  ];
  const actualStatusName = statusNames[actualStatus] || "Unknown";
  const expectedStatusName = statusNames[expectedStatus] || "Unknown";

  expect(
    actualStatus,
    `Expected pitch status to be ${expectedStatusName} (${expectedStatus}), but got ${actualStatusName} (${actualStatus})`
  ).to.equal(expectedStatus);
}

/**
 * Asserts that a user has a specific user type
 * @param factory Factory contract instance
 * @param userAddress User address
 * @param expectedUserType Expected UserType enum value (0=None, 1=Startup, 2=Investor, 3=Admin)
 */
export async function expectUserType(
  factory: any,
  userAddress: Address,
  expectedUserType: number
): Promise<void> {
  const userProfile = await factory.read.getUserProfile([userAddress]);
  const actualUserType = userProfile[0]; // UserType is the 1st field in UserProfile struct

  const userTypeNames = ["None", "Startup", "Investor", "Admin"];
  const actualUserTypeName = userTypeNames[actualUserType] || "Unknown";
  const expectedUserTypeName = userTypeNames[expectedUserType] || "Unknown";

  expect(
    actualUserType,
    `Expected user type to be ${expectedUserTypeName} (${expectedUserType}), but got ${actualUserTypeName} (${actualUserType})`
  ).to.equal(expectedUserType);
}
