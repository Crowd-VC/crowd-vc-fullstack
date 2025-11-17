# CrowdVC Smart Contracts - Deployment Guide

This guide covers deploying and managing the CrowdVC smart contracts using Hardhat Ignition.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Directory Structure](#directory-structure)
- [Deployment Scripts](#deployment-scripts)
- [Network Configuration](#network-configuration)
- [Deployment Workflows](#deployment-workflows)
- [Upgrading Contracts](#upgrading-contracts)
- [Utility Scripts](#utility-scripts)
- [Troubleshooting](#troubleshooting)

## Overview

The CrowdVC platform uses the **TransparentUpgradeableProxy** pattern from OpenZeppelin. This allows the contract logic to be upgraded while preserving state and contract addresses.

### Key Components

- **CrowdVCFactory**: Main factory contract for managing users, pitches, and pools
- **CrowdVCPool**: Individual pool contract (deployed via factory)
- **TransparentUpgradeableProxy**: Proxy contract that delegates calls to the implementation
- **ProxyAdmin**: Admin contract that manages proxy upgrades

## Prerequisites

### Required Software

- Node.js 20.16 or later
- pnpm (this project uses pnpm, not npm or yarn)
- Hardhat 3.0+

### Environment Variables

Create a `.env` file in `packages/contracts/`:

```bash
# Deployer wallet
PRIVATE_KEY=your_private_key_here

# Network RPC URLs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Block explorer API key (for contract verification)
BASESCAN_API_KEY=your_basescan_api_key

# Token addresses (BASE Mainnet)
USDT_ADDRESS_BASE=0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2
USDC_ADDRESS_BASE=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

# Platform configuration
TREASURY_ADDRESS=your_multisig_address
PLATFORM_FEE_PERCENT=500
```

### Funding Your Deployer Wallet

- **BASE Sepolia**: Get testnet ETH from [Coinbase Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- **BASE Mainnet**: Fund with real ETH

## Directory Structure

```
packages/contracts/
├── contracts/
│   ├── core/
│   │   ├── CrowdVCFactory.sol      # Main factory implementation
│   │   └── CrowdVCPool.sol         # Pool implementation
│   ├── interfaces/                  # Contract interfaces
│   ├── libraries/                   # Helper libraries
│   └── mocks/                       # Mock tokens for testing
├── ignition/
│   ├── modules/
│   │   ├── Factory.ts              # Main deployment module
│   │   ├── FactoryUpgrade.ts       # Upgrade module
│   │   └── MockTokens.ts           # Mock tokens deployment
│   └── parameters/
│       ├── baseSepolia.json        # BASE Sepolia parameters
│       ├── baseMainnet.json        # BASE Mainnet parameters
│       └── upgrade.example.json    # Upgrade parameters template
├── scripts/
│   └── proxyInfo.ts                # Utility to inspect deployed proxies
├── test/                           # Contract tests
└── hardhat.config.ts               # Hardhat configuration
```

## Deployment Scripts

### Ignition Modules

All deployments use **Hardhat Ignition**, which provides:

- Declarative deployment definitions
- Automatic error recovery
- Resume interrupted deployments
- Parallel transaction sending
- State persistence

#### 1. MockTokens Module (`ignition/modules/MockTokens.ts`)

Deploys mock USDT and USDC tokens for testing.

**Use case**: BASE Sepolia, local Hardhat network, or any testnet

**Deployed contracts**:
- MockUSDT (6 decimals, mintable)
- MockUSDC (6 decimals, mintable)

#### 2. Factory Module (`ignition/modules/Factory.ts`)

Main deployment module for the CrowdVC platform.

**Deployed contracts**:
1. ProxyAdmin - Manages proxy upgrades
2. CrowdVCFactory (Implementation) - Contract logic
3. TransparentUpgradeableProxy - Proxy contract

**Parameters** (configurable via JSON):
- `treasury`: Address to receive platform fees (defaults to deployer)
- `platformFee`: Fee in basis points (default: 500 = 5%)
- `usdt`: USDT token address
- `usdc`: USDC token address

#### 3. FactoryUpgrade Module (`ignition/modules/FactoryUpgrade.ts`)

Upgrades existing factory deployment to new implementation.

**Parameters** (REQUIRED):
- `proxyAddress`: Address of the existing proxy
- `proxyAdminAddress`: Address of the ProxyAdmin
- `needsReinitialize`: Set to `true` if new implementation has reinitializer (default: false)

## Network Configuration

The project is configured for the following networks in `hardhat.config.ts`:

- **hardhatMainnet**: Local simulated L1 network
- **hardhatOp**: Local simulated Optimism network
- **sepolia**: Ethereum Sepolia testnet
- **BASE Sepolia**: Configured via environment variables (ChainID: 84532)
- **BASE Mainnet**: Configured via environment variables (ChainID: 8453)

## Deployment Workflows

### Workflow 1: Deploy to BASE Sepolia (Testnet)

#### Step 1: Deploy Mock Tokens

```bash
cd packages/contracts

# Deploy mock tokens
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network sepolia
```

**Output**:
```
Deployed Addresses:
MockUSDT: 0x...
MockUSDC: 0x...
```

Save these addresses for the next step.

#### Step 2: Update Parameters File

Edit `ignition/parameters/baseSepolia.json`:

```json
{
  "FactoryModule": {
    "treasury": "0xYourTreasuryAddress",
    "platformFee": 500,
    "usdt": "0xMockUSDTAddress",
    "usdc": "0xMockUSDCAddress"
  }
}
```

#### Step 3: Deploy Factory

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/baseSepolia.json
```

**Output**:
```
Deployed Addresses:
ProxyAdmin: 0x...
CrowdVCFactory_Implementation: 0x...
CrowdVCFactory_Proxy: 0x...  ⭐ THIS IS YOUR MAIN CONTRACT ADDRESS
```

#### Step 4: Verify Contracts

```bash
# Verify ProxyAdmin
npx hardhat verify --network sepolia 0xProxyAdminAddress

# Verify Factory Implementation
npx hardhat verify --network sepolia 0xImplementationAddress

# Verify Proxy (more complex, see verification section)
```

#### Step 5: Mint Test Tokens

```bash
npx hardhat console --network sepolia
```

In the console:
```javascript
const MockUSDT = await ethers.getContractFactory("MockUSDT");
const usdt = MockUSDT.attach("0xMockUSDTAddress");
const [deployer] = await ethers.getSigners();

// Mint 1 million USDT to yourself
await usdt.mint(deployer.address, ethers.parseUnits("1000000", 6));

// Mint to another address
await usdt.mint("0xInvestorAddress", ethers.parseUnits("10000", 6));
```

### Workflow 2: Deploy to BASE Mainnet (Production)

#### Step 1: Update Parameters File

Edit `ignition/parameters/baseMainnet.json`:

```json
{
  "FactoryModule": {
    "treasury": "0xYourMultisigAddress",
    "platformFee": 500,
    "usdt": "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }
}
```

**IMPORTANT**:
- Use a multisig wallet for `treasury` (e.g., Gnosis Safe)
- Double-check token addresses
- Ensure deployer has sufficient ETH for gas

#### Step 2: Deploy Factory

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network base \
  --parameters ignition/parameters/baseMainnet.json \
  --verify
```

The `--verify` flag automatically verifies contracts on Basescan.

#### Step 3: Transfer ProxyAdmin Ownership

**CRITICAL SECURITY STEP**: Transfer ProxyAdmin ownership to multisig

```bash
npx hardhat console --network base
```

```javascript
const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
const proxyAdmin = ProxyAdmin.attach("0xProxyAdminAddress");

// Transfer ownership to multisig
await proxyAdmin.transferOwnership("0xMultisigAddress");
```

#### Step 4: Save Deployment Info

Save all addresses to your `.env` file and documentation:
- Factory Proxy Address (for frontend)
- ProxyAdmin Address
- Implementation Address
- Network: BASE Mainnet (ChainID: 8453)

### Workflow 3: Local Development

#### Step 1: Start Hardhat Node

```bash
# Terminal 1
npx hardhat node
```

#### Step 2: Deploy Mock Tokens

```bash
# Terminal 2
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network localhost
```

#### Step 3: Deploy Factory

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts --network localhost
```

Hardhat Ignition will use the deployed mock token addresses automatically if you configure parameters for localhost network.

## Upgrading Contracts

### When to Upgrade

Upgrade your contracts when you need to:
- Fix bugs in the logic
- Add new features
- Optimize gas usage
- Update business logic

**Important**: You can only upgrade the implementation, not the proxy. The proxy address remains constant.

### Upgrade Process

#### Step 1: Modify Contract

Make changes to `contracts/core/CrowdVCFactory.sol`.

**Storage Layout Rules**:
- ✅ Add new state variables at the END
- ✅ Add new functions
- ✅ Modify existing function logic
- ❌ Change order of existing state variables
- ❌ Change types of existing state variables
- ❌ Remove state variables

#### Step 2: Add Reinitializer (if needed)

If you added new state variables:

```solidity
function initializeV2() public reinitializer(2) {
    // Initialize new variables
    newVariable = someValue;
}
```

#### Step 3: Update Parameters File

Copy and edit the upgrade template:

```bash
cp ignition/parameters/upgrade.example.json ignition/parameters/upgrade-sepolia.json
```

Edit `upgrade-sepolia.json`:
```json
{
  "FactoryUpgradeModule": {
    "proxyAddress": "0xYourProxyAddress",
    "proxyAdminAddress": "0xYourProxyAdminAddress",
    "needsReinitialize": false
  }
}
```

Set `needsReinitialize` to `true` if you added a reinitializer function.

#### Step 4: Run Upgrade

```bash
npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts \
  --network sepolia \
  --parameters ignition/parameters/upgrade-sepolia.json
```

#### Step 5: Verify New Implementation

```bash
npx hardhat verify --network sepolia 0xNewImplementationAddress
```

#### Step 6: Test Upgrade

```bash
npx hardhat console --network sepolia
```

```javascript
const Factory = await ethers.getContractFactory("CrowdVCFactory");
const factory = Factory.attach("0xProxyAddress");

// Verify version increased (if you have a version variable)
const version = await factory.getVersion();
console.log("Version:", version.toString());

// Test new functionality
// ...
```

### Upgrade with Multisig

If ProxyAdmin is owned by a multisig:

1. Deploy new implementation using Ignition (it will fail at upgrade step)
2. Get the new implementation address from deployment logs
3. Create multisig transaction calling `ProxyAdmin.upgrade(proxyAddress, newImplementationAddress)`
4. Collect signatures and execute

## Utility Scripts

### proxyInfo.ts

Inspect deployed proxy contracts to view:
- Implementation address
- ProxyAdmin address
- ProxyAdmin owner
- Factory state (version, treasury, platform fee, pools, etc.)
- Admin roles

**Usage**:

```bash
PROXY_ADDRESS=0xYourProxyAddress npx hardhat run scripts/proxyInfo.ts --network sepolia
```

**Output**:
```
🔍 Proxy Information
════════════════════════════════════════════════════════════
Proxy Address: 0x...
════════════════════════════════════════════════════════════

📝 Implementation Address: 0x...
👤 Admin Address: 0x...
👑 ProxyAdmin Owner: 0x...

📊 Factory State:
────────────────────────────────────────────────────────────
Version: 1
Treasury: 0x...
Platform Fee: 500 basis points (5%)
Pool Implementation: 0x...
Total Pools Deployed: 3

🏊 Deployed Pools:
  1. pool-001 - 0x...
  2. pool-002 - 0x...
  3. pool-003 - 0x...

🔐 Roles:
────────────────────────────────────────────────────────────
Your Address: 0x...
  - DEFAULT_ADMIN_ROLE: ✅ Yes
  - ADMIN_ROLE: ✅ Yes

🔗 Useful Links:
────────────────────────────────────────────────────────────
Proxy: https://sepolia.basescan.org/address/0x...
Implementation: https://sepolia.basescan.org/address/0x...
Admin: https://sepolia.basescan.org/address/0x...

✅ Done!
```

## Troubleshooting

### Deployment Failed

If deployment fails, Hardhat Ignition can resume:

```bash
# Resume the last deployment
npx hardhat ignition deploy ignition/modules/Factory.ts --network sepolia --resume
```

### Gas Price Too Low

Manually set gas price:

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --gas-price 20000000000  # 20 gwei
```

### Contract Size Too Large

The CrowdVCFactory contract may exceed the 24KB limit. Solutions:

1. **viaIR optimizer** (already enabled in `hardhat.config.ts`)
2. **Reduce optimizer runs**: Edit `hardhat.config.ts`:
   ```typescript
   optimizer: {
     enabled: true,
     runs: 100  // Reduce from 200
   }
   ```
3. **Split contracts**: Move logic to libraries

### Verification Failed

If automatic verification fails:

```bash
# Verify manually
npx hardhat verify --network sepolia 0xContractAddress constructorArg1 constructorArg2

# For proxies, verify implementation only
npx hardhat verify --network sepolia 0xImplementationAddress
```

### Transaction Stuck

If a transaction is stuck:

1. Check status on block explorer
2. If stuck: send a 0 ETH transaction to yourself with the same nonce and higher gas price
3. Hardhat Ignition will auto-detect and handle nonce issues on resume

### Storage Layout Issues After Upgrade

If you violated storage layout rules:

1. **DO NOT DEPLOY TO MAINNET**
2. Revert changes to contract
3. Add new variables at the end only
4. Test on testnet first
5. Use OpenZeppelin's storage layout checker:
   ```bash
   npx hardhat clean
   npx hardhat compile
   # Check warnings for storage layout conflicts
   ```

## Best Practices

### Security

1. **Never deploy to mainnet without testnet testing**
2. **Always use multisig for ProxyAdmin owner on mainnet**
3. **Verify all contracts on block explorer**
4. **Test upgrades on testnet first**
5. **Use hardware wallet for mainnet deployments**
6. **Audit contracts before production deployment**

### Deployment Checklist

Before deploying to mainnet:

- [ ] All tests passing
- [ ] Contracts audited
- [ ] Deployed to testnet and tested
- [ ] Environment variables verified
- [ ] Multisig wallet set up for treasury and ProxyAdmin
- [ ] Deployer wallet funded with sufficient ETH
- [ ] Parameter file reviewed (correct token addresses, treasury, fee)
- [ ] Team ready to verify deployment
- [ ] Rollback plan prepared

### Upgrade Checklist

Before upgrading:

- [ ] Storage layout compatible
- [ ] New implementation tested on testnet
- [ ] Upgrade script tested on testnet
- [ ] ProxyAdmin owner has access to execute upgrade
- [ ] Team notified of upgrade
- [ ] Monitoring in place to detect issues
- [ ] Rollback plan prepared (deploy previous implementation)

## Additional Resources

- [Hardhat Ignition Documentation](https://hardhat.org/ignition/docs/getting-started)
- [OpenZeppelin Upgrades Documentation](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
- [OpenZeppelin Transparent Proxy Pattern](https://docs.openzeppelin.com/contracts/4.x/api/proxy#TransparentUpgradeableProxy)
- [BASE Network Documentation](https://docs.base.org/)
- [Basescan Block Explorer](https://basescan.org/)

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Hardhat Ignition logs in `ignition/deployments/`
3. Check transaction details on block explorer
4. Consult the team's internal documentation
5. Reach out to the development team

---

**Last Updated**: November 2024
**Maintained By**: CrowdVC Development Team
