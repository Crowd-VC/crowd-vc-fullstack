import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const viem = connection.viem;
  const factory = await viem.getContractAt(
    "CrowdVCFactory",
    "0x101848a3B850720345A6E239Ce33d25C296b43a4",
  );

  const mockUSDT = "0x557c5B8dA7F1B7091a0b6a7063384bc6fC9581Ca" as const;
  const mockUSDC = "0x4a61B10b50cBfc20c147B732dD38dF733508266A" as const;

  const isUSDTSupported = await factory.read.supportedTokens([mockUSDT]);
  const isUSDCSupported = await factory.read.supportedTokens([mockUSDC]);

  console.log("USDT supported:", isUSDTSupported);
  console.log("USDC supported:", isUSDCSupported);
}

main().catch(console.error);
