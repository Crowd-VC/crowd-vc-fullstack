/**
 * Utility to extract pitch ID from a PitchSubmitted event
 */

import { parseEventLogs, type TransactionReceipt } from 'viem';
import { CrowdVCFactoryABI } from '@crowd-vc/abis';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { wagmiAdapter } from '@/config/wagmi-config';

/**
 * Extract pitch ID from a transaction receipt
 * Parses the PitchSubmitted event logs to get the pitchId
 *
 * @param receipt - Transaction receipt containing logs
 * @returns The pitch ID as a hex string
 * @throws Error if PitchSubmitted event not found
 */
export function getPitchIdFromReceipt(receipt: TransactionReceipt): `0x${string}` {
  const logs = parseEventLogs({
    abi: CrowdVCFactoryABI,
    logs: receipt.logs,
    eventName: 'PitchSubmitted',
  });

  if (logs.length === 0) {
    throw new Error('PitchSubmitted event not found in transaction');
  }

  const eventLog = logs[0] as unknown as {
    args: { pitchId: `0x${string}` };
  };

  return eventLog.args.pitchId;
}

/**
 * Get pitch ID from a transaction hash
 * Waits for the transaction to be confirmed and extracts the pitch ID from the event
 *
 * @param txHash - Transaction hash
 * @returns The pitch ID as a hex string
 * @throws Error if transaction fails or PitchSubmitted event not found
 */
export async function getPitchId(txHash: `0x${string}`): Promise<`0x${string}`> {
  const receipt = await waitForTransactionReceipt(wagmiAdapter.wagmiConfig, {
    hash: txHash,
  });

  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted');
  }

  return getPitchIdFromReceipt(receipt);
}
