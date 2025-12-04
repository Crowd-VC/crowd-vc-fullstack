# Contract Deployment Scripts

This directory contains scripts for deploying and managing CrowdVC smart contracts.

## Scripts Overview

### 🚀 deploy-and-update.ts (Main Deployment Script)

**Purpose:** Comprehensive deployment orchestrator that handles compilation, deployment, and address generation.

**Features:**
- ✅ Compiles contracts
- ✅ Deploys to any configured network
- ✅ Supports mock token deployment for testing
- ✅ Verifies contracts on Etherscan
- ✅ Auto-generates TypeScript address exports
- ✅ Colored console output with progress indicators
- ✅ Comprehensive error handling

**Usage:**
```bash
# Via npm scripts (recommended)
pnpm deploy-and-update --network sepolia

# Direct execution
tsx scripts/deploy-and-update.ts --network sepolia --verify

# See all options
tsx scripts/deploy-and-update.ts --help
```

**Options:**
- `--network, -n`: Target network (hardhat, sepolia, baseSepolia, baseMainnet)
- `--with-mocks, -m`: Deploy mock USDT/USDC tokens
- `--verify, -v`: Verify contracts on Etherscan
- `--clean, -c`: Clean build artifacts before compiling
- `--parameters, -p`: Custom parameters file path
- `--help, -h`: Show help message

---

### 🐚 deploy.sh (Bash Wrapper)

**Purpose:** Simple bash script wrapper for the TypeScript deployment script.

**Features:**
- ✅ Easy-to-use command-line interface
- ✅ Colored output for better readability
- ✅ Error handling and validation
- ✅ Cross-platform compatibility

**Usage:**
```bash
# Make executable (first time only)
chmod +x scripts/deploy.sh

# Deploy to network
./scripts/deploy.sh sepolia

# With options
./scripts/deploy.sh baseSepolia --with-mocks --verify

# Show help
./scripts/deploy.sh --help
```

---

### 📝 generateAddresses.ts (Address Generator)

**Purpose:** Generates TypeScript address exports from Hardhat Ignition deployment artifacts.

**Features:**
- ✅ Scans all deployment artifacts
- ✅ Generates type-safe address exports
- ✅ Includes helper functions for address lookup
- ✅ Supports multiple networks

**Usage:**
```bash
# Via npm script (recommended)
pnpm generate:addresses

# Direct execution
tsx scripts/generateAddresses.ts
```

**Output:**
Generates `packages/abis/src/addresses.ts` with:
- Contract addresses organized by chain ID
- Helper functions (`getFactoryAddress`, `isDeployedOnChain`, etc.)
- TypeScript types for type safety

---

### 🪙 addSupportedTokens.ts (Token Management)

**Purpose:** Adds supported tokens to the deployed CrowdVCFactory contract.

**Features:**
- ✅ Batch token addition
- ✅ Network-specific configuration
- ✅ Transaction confirmation

**Usage:**
```bash
tsx scripts/addSupportedTokens.ts
```

---

### 🔍 checkTokens.ts (Token Verification)

**Purpose:** Verifies which tokens are supported by the factory contract.

**Features:**
- ✅ Checks token support status
- ✅ Displays token information
- ✅ Validates factory configuration

**Usage:**
```bash
tsx scripts/checkTokens.ts
```

---

### ℹ️ proxyInfo.ts (Proxy Information)

**Purpose:** Displays information about deployed proxy contracts.

**Features:**
- ✅ Shows implementation address
- ✅ Displays admin address
- ✅ Checks proxy configuration

**Usage:**
```bash
tsx scripts/proxyInfo.ts
```

---

## Common Workflows

### 1. First Deployment to Testnet

```bash
# Step 1: Deploy mock tokens
pnpm deploy-and-update --network baseSepolia --with-mocks

# Step 2: Note the token addresses from output

# Step 3: Update parameters file
nano ignition/parameters/baseSepolia.json

# Step 4: Deploy factory
pnpm deploy-and-update --network baseSepolia
```

### 2. Mainnet Deployment

```bash
# Full clean deployment with verification
pnpm deploy-and-update --network baseMainnet --clean --verify
```

### 3. Local Development

```bash
# Terminal 1: Start local node
pnpm node

# Terminal 2: Deploy contracts
pnpm deploy-and-update --network hardhat
```

### 4. Update Addresses Only

```bash
# If you deployed manually or need to refresh
pnpm generate:addresses
```

## File Dependencies

```
scripts/
├── deploy-and-update.ts    (main script)
│   ├── Uses: hardhat compile
│   ├── Uses: hardhat ignition deploy
│   └── Calls: generateAddresses.ts
│
├── deploy.sh               (bash wrapper)
│   └── Calls: deploy-and-update.ts
│
├── generateAddresses.ts    (address generator)
│   ├── Reads: ignition/deployments/*/deployed_addresses.json
│   └── Writes: packages/abis/src/addresses.ts
│
├── addSupportedTokens.ts   (token management)
│   └── Reads: packages/abis/src/addresses.ts
│
├── checkTokens.ts          (token verification)
│   └── Reads: packages/abis/src/addresses.ts
│
└── proxyInfo.ts            (proxy info)
    └── Reads: ignition/deployments/
```

## Environment Variables

Required for network deployments:

```bash
# .env file
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

## Adding a New Network

1. **Add network to `hardhat.config.ts`:**
```typescript
networks: {
  newNetwork: {
    type: 'http',
    chainType: 'l1',
    url: process.env.NEW_NETWORK_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
  },
}
```

2. **Create parameters file:**
```bash
cp ignition/parameters/sepolia.json ignition/parameters/newNetwork.json
# Edit with network-specific values
```

3. **Update `deploy-and-update.ts`:**
```typescript
function getChainId(network: string): number {
  const chainIds: Record<string, number> = {
    // ... existing networks
    newNetwork: 12345, // Add your chain ID
  };
  return chainIds[network] || 0;
}
```

4. **Deploy:**
```bash
pnpm deploy-and-update --network newNetwork
```

## Best Practices

1. ✅ **Always test on testnets first**
2. ✅ **Use `--clean` flag when in doubt**
3. ✅ **Verify contracts on block explorers**
4. ✅ **Keep deployment artifacts in version control**
5. ✅ **Use environment variables for sensitive data**
6. ✅ **Review parameters files before mainnet deployment**
7. ✅ **Test deployments on a fork before mainnet**

## Troubleshooting

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for detailed troubleshooting steps.

## Related Documentation

- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Comprehensive deployment documentation
- [Quick Reference](../DEPLOYMENT_QUICK_REFERENCE.md) - Common commands
- [Hardhat Config](../hardhat.config.ts) - Network configuration
- [Ignition Modules](../ignition/modules/) - Deployment modules


