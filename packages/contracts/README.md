# CrowdVC Smart Contracts

This package contains the smart contracts for the CrowdVC decentralized venture capital platform.

## Overview

CrowdVC enables startups to submit pitches and investors to contribute funds to pools. The platform uses upgradeable smart contracts deployed on BASE network with support for USDT and USDC tokens.

### Core Contracts

- **CrowdVCFactory**: Main factory contract for managing users, pitches, and pool deployments
- **CrowdVCPool**: Individual pool contract for voting and fund distribution
- **TransparentUpgradeableProxy**: Upgradeable proxy pattern for contract logic
- **ProxyAdmin**: Admin contract for managing proxy upgrades

### Key Features

- **Upgradeable Architecture**: Uses OpenZeppelin's TransparentUpgradeableProxy pattern
- **Role-Based Access**: Separate roles for Admins, Startups, and Investors
- **Weighted Voting**: Vote power proportional to contribution amount
- **Multi-Token Support**: USDT and USDC on BASE network
- **NFT Receipts**: ERC721 tokens issued for each contribution
- **Milestone Distribution**: Funds distributed to winners based on milestones
- **Emergency Controls**: Pause and emergency withdrawal functions

## Directory Structure

```
packages/contracts/
├── contracts/              # Solidity smart contracts
│   ├── core/              # Core contracts (Factory, Pool)
│   ├── interfaces/        # Contract interfaces
│   ├── libraries/         # Helper libraries
│   └── mocks/             # Mock tokens for testing
├── ignition/              # Hardhat Ignition deployment modules
│   ├── modules/           # Deployment scripts
│   └── parameters/        # Network-specific parameters
├── scripts/               # Utility scripts
├── test/                  # Contract tests
└── docs/                  # Documentation
    └── DEPLOYMENT.md      # Comprehensive deployment guide
```

## Quick Start

### Installation

From the monorepo root:

```bash
pnpm install
```

From this package:

```bash
cd packages/contracts
pnpm install
```

### Compile Contracts

```bash
# From monorepo root
pnpm contracts:compile

# From this directory
pnpm compile
```

### Run Tests

```bash
# From monorepo root
pnpm contracts:test

# From this directory
pnpm test
```

## Deployment

### Prerequisites

1. Create a `.env` file with required environment variables:

```bash
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_api_key
TREASURY_ADDRESS=your_multisig_address
PLATFORM_FEE_PERCENT=500
```

2. Fund your deployer wallet with ETH on the target network

### Deploy to Testnet (BASE Sepolia)

#### Step 1: Deploy Mock Tokens

```bash
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network sepolia
```

#### Step 2: Update Parameters

Edit `ignition/parameters/baseSepolia.json` with mock token addresses.

#### Step 3: Deploy Factory

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/baseSepolia.json
```

### Deploy to Production (BASE Mainnet)

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network base \
  --parameters ignition/parameters/baseMainnet.json \
  --verify
```

**IMPORTANT**: After deployment, transfer ProxyAdmin ownership to a multisig wallet!

### Full Deployment Guide

For detailed deployment instructions, upgrade procedures, and troubleshooting, see:

📚 **[Complete Deployment Guide](docs/DEPLOYMENT.md)**

## Available Scripts

### From Monorepo Root

```bash
pnpm contracts:compile    # Compile contracts
pnpm contracts:test       # Run tests
pnpm contracts:deploy     # Deploy to configured network
```

### From This Directory

```bash
pnpm compile              # Compile contracts
pnpm test                 # Run all tests
pnpm deploy               # Deploy using Ignition
pnpm verify               # Verify contracts on block explorer
```

## Network Configuration

Configured networks in `hardhat.config.ts`:

- **hardhatMainnet**: Local simulated L1 network
- **hardhatOp**: Local simulated Optimism network
- **sepolia**: Ethereum Sepolia testnet
- **BASE Sepolia**: BASE testnet (ChainID: 84532)
- **BASE Mainnet**: BASE mainnet (ChainID: 8453)

## Ignition Modules

### MockTokens Module

Deploys mock USDT and USDC tokens for testing.

```bash
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network sepolia
```

### Factory Module

Main deployment module for the CrowdVC platform.

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/baseSepolia.json
```

### FactoryUpgrade Module

Upgrades existing factory deployment to new implementation.

```bash
npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts \
  --network sepolia \
  --parameters ignition/parameters/upgrade-sepolia.json
```

## Utility Scripts

### proxyInfo.ts

Inspect deployed proxy contracts:

```bash
PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network sepolia
```

Displays:
- Implementation and ProxyAdmin addresses
- Factory state (version, treasury, platform fee, pools)
- Admin roles
- Deployed pools
- Block explorer links

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/FactoryProxy.test.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

## Contract Verification

Verify contracts on Basescan after deployment:

```bash
# Verify implementation
npx hardhat verify --network base 0xImplementationAddress

# Verify with constructor arguments
npx hardhat verify --network base 0xContractAddress "Constructor" "Arguments"
```

## Security

### Audit Status

**⚠️ Contracts have not been audited yet. Do not use in production without a professional audit.**

### Security Features

- Role-based access control (OpenZeppelin AccessControl)
- Reentrancy guards (OpenZeppelin ReentrancyGuard)
- Pausable for emergency stops
- Upgradeable for bug fixes
- SafeERC20 for token interactions

### Important Notes

1. **ProxyAdmin Ownership**: Always transfer to multisig on mainnet
2. **Storage Layout**: Never violate storage layout rules when upgrading
3. **Test First**: Always test on testnet before mainnet deployment
4. **Gas Limits**: CrowdVCFactory is near 24KB limit, monitor contract size

## Technology Stack

- **Solidity**: 0.8.28
- **Hardhat**: 3.0+
- **OpenZeppelin Contracts**: 5.4 (standard + upgradeable)
- **Viem**: For contract interactions and testing
- **Hardhat Ignition**: Declarative deployment system

## Architecture

### Proxy Pattern

The project uses **TransparentUpgradeableProxy** pattern:

```
User → TransparentUpgradeableProxy → CrowdVCFactory (Implementation)
         ↑
    ProxyAdmin (can upgrade)
```

### Pool Deployment

The Factory deploys pools using the **Minimal Proxy (ERC-1167)** pattern for gas efficiency:

```
CrowdVCFactory → Clone → CrowdVCPool Instance
                  ↓
            Pool Implementation
```

## Contributing

1. Make changes to contracts
2. Add/update tests
3. Run tests: `pnpm test`
4. Compile: `pnpm compile`
5. Test deployment on local network
6. Test deployment on testnet
7. Document changes

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat Ignition Guide](https://hardhat.org/ignition/docs/getting-started)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)
- [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
- [BASE Network Docs](https://docs.base.org/)
- [Viem Documentation](https://viem.sh/)

## License

MIT

---

**For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**
