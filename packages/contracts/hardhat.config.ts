import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import hardhatIgnitionViemPlugin from '@nomicfoundation/hardhat-ignition-viem';
import hardhatVerifyPlugin from '@nomicfoundation/hardhat-verify';
import { configVariable, defineConfig } from 'hardhat/config';
import { sepolia } from 'viem/chains';

export default defineConfig({
  plugins: [
    hardhatToolboxViemPlugin,
    hardhatIgnitionViemPlugin,
    hardhatVerifyPlugin,
  ],
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      viaIR: true, // Enable for complex contracts to avoid stack too deep
    },
  },
  verify: {
    etherscan: {
      apiKey: 'XJV78W6TGZVH8BMWT5AMQ542TXX2H46H8S',
    },
  },
  networks: {
    hardhat: {
      type: 'edr-simulated',
      chainType: 'l1',
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    hardhatMainnet: {
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url:
        process.env.SEPOLIA_RPC_URL ||
        'https://ethereum-sepolia-rpc.publicnode.com',
      accounts: [
        '0x599ddb68419a278cdb069223cf4af3dd7eea30c20c0fd60d402df6c7dd4502a5',
      ],
    },
  },
});
