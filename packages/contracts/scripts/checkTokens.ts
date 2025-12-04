import { network } from 'hardhat';

async function main() {
  const connection = await network.connect();
  const viem = connection.viem;
  const factory = await viem.getContractAt(
    'CrowdVCFactory',
    '0x101848a3B850720345A6E239Ce33d25C296b43a4',
  );

  const mockUSDT = '0xa6C579F2E8c98fd7458d8A51C107adB0101BfcD0' as const;
  const mockUSDC = '0x8e9F7D669fB17650472fa474eAF4dd0015725C00' as const;

  const isUSDTSupported = await factory.read.supportedTokens([mockUSDT]);
  const isUSDCSupported = await factory.read.supportedTokens([mockUSDC]);

  console.log('USDT supported:', isUSDTSupported);
  console.log('USDC supported:', isUSDCSupported);
}

main().catch(console.error);

