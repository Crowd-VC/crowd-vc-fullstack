/**
 * Pitch ID Utilities
 * Helpers for converting between database and on-chain pitch IDs
 */

import { keccak256, toHex, stringToBytes } from 'viem';

/**
 * Convert a database pitch ID to bytes32 format
 * Uses keccak256 hash of the ID for deterministic conversion
 *
 * Note: This is a fallback for when we don't have the actual on-chain pitchId.
 * Ideally, the on-chain pitchId should be stored in the database when a pitch
 * is submitted on-chain.
 */
export function databaseIdToBytes32(databaseId: string): `0x${string}` {
  return keccak256(toHex(databaseId));
}

/**
 * Check if a value is a valid bytes32 hex string
 */
export function isValidBytes32(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

/**
 * Pad a short hex string to bytes32
 */
export function padToBytes32(hexString: string): `0x${string}` {
  if (!hexString.startsWith('0x')) {
    hexString = '0x' + hexString;
  }
  // Remove 0x prefix, pad to 64 chars, add 0x back
  const cleanHex = hexString.slice(2);
  const padded = cleanHex.padStart(64, '0');
  return `0x${padded}` as `0x${string}`;
}

/**
 * Get pitch ID as bytes32 - uses the value directly if it's valid bytes32,
 * otherwise converts using hash
 */
export function getPitchIdAsBytes32(pitchId: string): `0x${string}` {
  if (isValidBytes32(pitchId)) {
    return pitchId;
  }
  return databaseIdToBytes32(pitchId);
}
