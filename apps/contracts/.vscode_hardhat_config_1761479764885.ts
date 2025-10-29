import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";
import "@nomicfoundation/hardhat-verify";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test/hardhat",
    cache: "./cache/hardhat",
    artifacts: "./artifacts",
  },
  networks: {
    // Uncomment and configure for deployment
    // base: {
    //   url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    //   chainId: 8453,
    // },
    // baseSepolia: {
    //   url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    //   chainId: 84532,
    // },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
    },
  },
};

export default config;
