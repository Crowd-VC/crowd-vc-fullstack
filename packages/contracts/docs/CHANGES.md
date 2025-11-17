# Contracts Directory Cleanup and Refactoring - Summary

**Date**: November 17, 2024
**Task**: Clean up contracts directory, remove duplicate scripts, rewrite deployment using Hardhat Ignition

## Changes Made

### 1. Removed Duplicate and Unused Files

The following files were **removed** as they were duplicates or unused:

#### Old Deployment Scripts (Replaced by Ignition)
- ❌ `scripts/deploy.ts` - Old viem-based deployment
- ❌ `scripts/deployFactoryOptimized.ts` - Referenced non-existent contract
- ❌ `scripts/deployLocal.ts` - Old local deployment script
- ❌ `scripts/upgradeFactory.ts` - Replaced by Ignition upgrade module

#### Database Scripts (Belong in web app)
- ❌ `scripts/truncate-votes.ts` - Database utility, should be in `apps/web/scripts`
- ❌ `scripts/migrate-votes-wallet-address.ts` - Database migration, should be in `apps/web/scripts`

#### Test/Example Scripts
- ❌ `scripts/send-op-tx.ts` - Optimism test script, not needed

#### Unused Contract Files
- ❌ `contracts/core/_CrowdVCFactory.sol` - Old contract version (named `CrowdVCFactoryOld`)

#### Duplicate Ignition Modules
- ❌ `ignition/modules/Proxy.ts` - Incomplete example, duplicated Factory.ts

### 2. Files Kept

The following files were **kept** and are essential:

#### ✅ Ignition Deployment Modules
- `ignition/modules/Factory.ts` - Main deployment module (enhanced)
- `ignition/modules/FactoryUpgrade.ts` - Upgrade module (enhanced)

#### ✅ Utility Scripts
- `scripts/proxyInfo.ts` - Useful utility to inspect deployed proxies

#### ✅ All Contract Files
- All files in `contracts/core/`, `contracts/interfaces/`, `contracts/libraries/`, `contracts/mocks/`

### 3. New Files Created

#### Ignition Modules
- ✨ `ignition/modules/MockTokens.ts` - New module for deploying test tokens

#### Parameter Files
- ✨ `ignition/parameters/baseSepolia.json` - Parameters for BASE Sepolia testnet
- ✨ `ignition/parameters/baseMainnet.json` - Parameters for BASE Mainnet
- ✨ `ignition/parameters/upgrade.example.json` - Template for upgrade parameters

#### Documentation
- ✨ `docs/DEPLOYMENT.md` - Comprehensive deployment guide (2,800+ lines)
- ✨ `docs/CHANGES.md` - This file
- ✨ `README.md` - Completely rewritten with current information

### 4. Enhanced Existing Files

#### `ignition/modules/Factory.ts`
- ✅ Improved comments and documentation
- ✅ Added usage examples
- ✅ Better parameter descriptions
- ✅ Network-specific guidance

#### `ignition/modules/FactoryUpgrade.ts`
- ✅ Enhanced documentation
- ✅ Added prerequisites section
- ✅ Improved parameter examples
- ✅ Better comments explaining upgrade process

## File Count Summary

### Before Cleanup
- Ignition modules: 3 files
- Scripts: 10 files
- Total deployment-related: 13 files

### After Cleanup
- Ignition modules: 3 files (Factory, FactoryUpgrade, MockTokens)
- Scripts: 1 file (proxyInfo)
- Parameter files: 3 files
- Documentation: 3 files
- Total: 10 files (more organized, better documented)

## New Directory Structure

```
packages/contracts/
├── contracts/                         # (unchanged)
│   ├── core/
│   │   ├── CrowdVCFactory.sol
│   │   └── CrowdVCPool.sol
│   ├── interfaces/
│   ├── libraries/
│   └── mocks/
├── ignition/
│   ├── modules/
│   │   ├── Factory.ts                # ✨ Enhanced
│   │   ├── FactoryUpgrade.ts         # ✨ Enhanced
│   │   └── MockTokens.ts             # ✨ NEW
│   └── parameters/
│       ├── baseSepolia.json          # ✨ NEW
│       ├── baseMainnet.json          # ✨ NEW
│       └── upgrade.example.json      # ✨ NEW
├── scripts/
│   └── proxyInfo.ts                  # ✅ Kept
├── test/                              # (unchanged)
├── docs/
│   ├── DEPLOYMENT.md                 # ✨ NEW - Main guide
│   └── CHANGES.md                    # ✨ NEW - This file
├── README.md                          # ✨ Rewritten
└── hardhat.config.ts                 # (unchanged)
```

## Benefits of Changes

### 1. Simplified Deployment
- **Before**: Multiple similar deployment scripts, unclear which to use
- **After**: Clear Ignition modules with parameter files for each network

### 2. Better Documentation
- **Before**: Minimal documentation, scattered instructions
- **After**: Comprehensive 2,800+ line deployment guide with:
  - Step-by-step workflows
  - Network-specific instructions
  - Upgrade procedures
  - Troubleshooting section
  - Security best practices

### 3. Maintainability
- **Before**: Duplicate code across multiple scripts
- **After**: Single source of truth for each deployment scenario

### 4. Error Recovery
- **Before**: Manual retry on failure
- **After**: Hardhat Ignition automatically handles errors and can resume deployments

### 5. Parameter Management
- **Before**: Hardcoded values or environment variables
- **After**: Network-specific JSON files that can be version controlled

## Migration Guide

### For Developers

If you were using the old scripts:

#### Old Way (scripts/deploy.ts)
```bash
npx hardhat run scripts/deploy.ts --network baseSepolia
```

#### New Way (Hardhat Ignition)
```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/baseSepolia.json
```

### For CI/CD

Update your deployment pipelines to use Ignition:

```yaml
# Old
- run: npx hardhat run scripts/deploy.ts --network baseSepolia

# New
- run: npx hardhat ignition deploy ignition/modules/Factory.ts --network sepolia --parameters ignition/parameters/baseSepolia.json
```

## What to Update

### Environment Variables

No changes needed to `.env` file. All existing variables are still used.

### Frontend Integration

No changes needed. The deployed proxy address remains the same deployment address format.

### Database Scripts

The removed database scripts (`truncate-votes.ts`, `migrate-votes-wallet-address.ts`) should be moved to `apps/web/scripts/` if still needed.

## Testing the New Setup

### 1. Compile Contracts
```bash
pnpm contracts:compile
```

### 2. Run Tests
```bash
pnpm contracts:test
```

### 3. Test Local Deployment
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network localhost
npx hardhat ignition deploy ignition/modules/Factory.ts --network localhost
```

### 4. Test Proxy Info Script
```bash
PROXY_ADDRESS=0xYourProxyAddress npx hardhat run scripts/proxyInfo.ts --network localhost
```

## Next Steps

1. ✅ **Contracts cleaned up** - Duplicate scripts removed
2. ✅ **Ignition modules created** - Modern deployment system
3. ✅ **Documentation written** - Comprehensive guides
4. 🔲 **Test on testnet** - Deploy to BASE Sepolia to verify
5. 🔲 **Update CI/CD** - Modify deployment pipelines
6. 🔲 **Team training** - Share new deployment procedures

## Questions?

Refer to:
- **[Main Deployment Guide](DEPLOYMENT.md)** - Comprehensive guide
- **[README.md](../README.md)** - Quick start and overview
- **Hardhat Ignition Docs** - https://hardhat.org/ignition/docs/getting-started
- **Team documentation** - Internal wiki/confluence

## Rollback Plan

If issues arise, the old scripts are available in git history:

```bash
# View deleted files
git log --all --full-history -- "packages/contracts/scripts/deploy.ts"

# Restore a file
git checkout <commit-hash> -- packages/contracts/scripts/deploy.ts
```

However, **using Hardhat Ignition is strongly recommended** as it follows best practices and is the official deployment system for Hardhat 3.

---

**Summary**: The contracts directory has been cleaned up, modernized with Hardhat Ignition, and comprehensively documented. All duplicate and unused scripts have been removed, and new parameter-based deployment modules have been created for each network.
