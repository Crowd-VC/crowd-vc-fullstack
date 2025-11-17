# Quick Start Guide - CrowdVC Contracts Deployment

This is a condensed quick reference for deploying CrowdVC contracts. For detailed information, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Prerequisites

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file in packages/contracts/
cp .env.example .env

# 3. Add your private key and RPC URLs to .env
PRIVATE_KEY=your_private_key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key
```

## Testnet Deployment (5 Minutes)

### Step 1: Deploy Mock Tokens

```bash
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network sepolia
```

Copy the deployed addresses.

### Step 2: Update Parameters

Edit `ignition/parameters/baseSepolia.json`:

```json
{
  "FactoryModule": {
    "treasury": "0xYourAddress",
    "platformFee": 500,
    "usdt": "0xMockUSDTAddress",
    "usdc": "0xMockUSDCAddress"
  }
}
```

### Step 3: Deploy Factory

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/baseSepolia.json
```

### Step 4: Save Proxy Address

The output will show:
```
CrowdVCFactory_Proxy: 0x...  ⭐ USE THIS ADDRESS
```

Save this address - it's your main contract address for the frontend.

## Production Deployment (BASE Mainnet)

### Step 1: Update Parameters

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

### Step 2: Deploy with Verification

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network base \
  --parameters ignition/parameters/baseMainnet.json \
  --verify
```

### Step 3: Transfer ProxyAdmin to Multisig

```bash
npx hardhat console --network base
```

```javascript
const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
const proxyAdmin = ProxyAdmin.attach("0xProxyAdminAddress");
await proxyAdmin.transferOwnership("0xMultisigAddress");
```

## Upgrading Contracts

### Step 1: Create Upgrade Parameters

```bash
cp ignition/parameters/upgrade.example.json ignition/parameters/upgrade-sepolia.json
```

Edit with your deployed addresses:

```json
{
  "FactoryUpgradeModule": {
    "proxyAddress": "0xYourProxyAddress",
    "proxyAdminAddress": "0xYourProxyAdminAddress",
    "needsReinitialize": false
  }
}
```

### Step 2: Deploy Upgrade

```bash
npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts \
  --network sepolia \
  --parameters ignition/parameters/upgrade-sepolia.json
```

## Useful Commands

### Inspect Deployed Proxy

```bash
PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network sepolia
```

### Compile Contracts

```bash
pnpm contracts:compile
```

### Run Tests

```bash
pnpm contracts:test
```

### Verify Contract

```bash
npx hardhat verify --network sepolia 0xContractAddress
```

## Common Issues

### "Deployment already exists"

Resume the deployment:
```bash
npx hardhat ignition deploy ignition/modules/Factory.ts --network sepolia --resume
```

### "Insufficient funds"

Get testnet ETH:
- BASE Sepolia: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Contract size too large

Already configured with `viaIR` optimizer. If still too large, reduce optimizer runs in `hardhat.config.ts`.

## Directory Reference

```
packages/contracts/
├── ignition/
│   ├── modules/
│   │   ├── Factory.ts              # Main deployment
│   │   ├── FactoryUpgrade.ts       # Upgrade existing
│   │   └── MockTokens.ts           # Test tokens
│   └── parameters/
│       ├── baseSepolia.json        # Testnet params
│       ├── baseMainnet.json        # Mainnet params
│       └── upgrade.example.json    # Upgrade template
├── scripts/
│   └── proxyInfo.ts                # Inspect deployed proxy
└── docs/
    ├── DEPLOYMENT.md               # Full guide
    └── QUICK_START.md              # This file
```

## Need More Help?

- **Full Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Changes**: [CHANGES.md](CHANGES.md)
- **Hardhat Ignition**: https://hardhat.org/ignition/docs/getting-started
- **OpenZeppelin Proxies**: https://docs.openzeppelin.com/contracts/5.x/api/proxy

---

**Remember**: Always test on testnet before deploying to mainnet!
