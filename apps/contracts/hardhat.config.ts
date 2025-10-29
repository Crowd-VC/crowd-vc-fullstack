import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-viem';
import '@nomicfoundation/hardhat-verify';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test/hardhat',
    cache: './cache/hardhat',
    artifacts: './artifacts',
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseSepolia: {
      type: 'http' as const,
      url: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [
            '0x599ddb68419a278cdb069223cf4af3dd7eea30c20c0fd60d402df6c7dd4502a5',
          ],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      arbitrumOne: process.env.ARBISCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
    },
  },
};

export default config;
