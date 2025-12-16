#!/usr/bin/env npx hardhat run
/**
 * Script to add supported tokens to the CrowdVCFactory contract
 * Run with: npx hardhat run scripts/addSupportedTokens.ts --network sepolia
 */

import { network } from "hardhat";

async function main() {
  const factoryAddress = "0x101848a3B850720345A6E239Ce33d25C296b43a4" as const;
  const mockUSDT = "0x557c5B8dA7F1B7091a0b6a7063384bc6fC9581Ca" as const;
  const mockUSDC = "0x4a61B10b50cBfc20c147B732dD38dF733508266A" as const;

  console.log("Connecting to network...");
  const connection = await network.connect();
  const viem = connection.viem;

  console.log("Getting factory contract...");
  const factory = await viem.getContractAt("CrowdVCFactory", factoryAddress);

  console.log("Adding MockUSDT as supported token...");
  const tx1 = await factory.write.addSupportedToken([mockUSDT]);
  console.log("  Transaction hash:", tx1);

  console.log("Adding MockUSDC as supported token...");
  const tx2 = await factory.write.addSupportedToken([mockUSDC]);
  console.log("  Transaction hash:", tx2);

  // Verify tokens are supported
  console.log("\nVerifying supported tokens:");
  const isUSDTSupported = await factory.read.supportedTokens([mockUSDT]);
  const isUSDCSupported = await factory.read.supportedTokens([mockUSDC]);
  console.log("  USDT supported:", isUSDTSupported);
  console.log("  USDC supported:", isUSDCSupported);

  console.log("\nDone! Token addresses for frontend configuration:");
  console.log("  USDT:", mockUSDT);
  console.log("  USDC:", mockUSDC);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
