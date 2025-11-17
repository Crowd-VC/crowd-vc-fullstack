# TransparentUpgradeableProxy Pattern Guide

## Overview

The CrowdVC Factory contract uses the **TransparentUpgradeableProxy** pattern from OpenZeppelin. This allows you to upgrade the contract logic while maintaining the same contract address and preserving all state data.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Users interact with this address (never changes)│
│                                                 │
│         TransparentUpgradeableProxy             │
│              (Proxy Contract)                   │
│                                                 │
│  - Stores all state variables                  │
│  - Delegates calls to implementation           │
│  - Address: 0x...                              │
│                                                 │
└────────────┬────────────────────────────────────┘
             │ delegatecall
             ▼
┌────────────────────────────────────────────────┐
│        CrowdVCFactory (Implementation)         │
│           (Logic Contract V1)                  │
│                                                │
│  - Contains business logic                     │
│  - No state storage (uses proxy's storage)    │
│  - Can be replaced                            │
│  - Address: 0x...                             │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              ProxyAdmin                        │
│         (Admin Contract)                       │
│                                                │
│  - Owns the proxy                             │
│  - Can upgrade implementation                 │
│  - Managed by admin account                  │
│  - Address: 0x...                            │
└────────────────────────────────────────────────┘
```

## Components

### 1. TransparentUpgradeableProxy
- **Purpose**: The proxy contract that users interact with
- **Address**: Fixed and never changes
- **Storage**: Holds all contract state
- **Upgradeability**: Can point to different implementations

### 2. CrowdVCFactory (Implementation)
- **Purpose**: Contains the business logic
- **Address**: Changes with each upgrade
- **Storage**: Uses proxy's storage via delegatecall
- **Upgradeability**: Can be replaced entirely

### 3. ProxyAdmin
- **Purpose**: Manages proxy upgrades
- **Owner**: Admin account
- **Functions**: 
  - `upgrade(proxy, newImplementation)` - Simple upgrade
  - `upgradeAndCall(proxy, newImplementation, data)` - Upgrade with initialization

## Key Features

### Transparent Proxy Pattern
- **Admin vs User Segregation**: Admin calls go to proxy admin functions, user calls go to implementation
- **Prevents Function Clashes**: Admin functions are completely separate from implementation functions
- **Built-in Safety**: Admin cannot call implementation functions directly through proxy

### vs UUPS Pattern
The TransparentUpgradeableProxy differs from UUPS:

| Feature | TransparentUpgradeableProxy | UUPS |
|---------|---------------------------|------|
| Upgrade logic location | In proxy | In implementation |
| Gas cost (deployment) | Higher | Lower |
| Gas cost (calls) | Slightly higher | Lower |
| Flexibility | Less flexible | More flexible |
| Safety | Very safe | Can be locked if implemented incorrectly |
| Remove upgradeability | Cannot | Can |

## Deployment

### Initial Deployment

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts --network base
```

This will deploy:
1. ProxyAdmin contract
2. CrowdVCFactory implementation
3. TransparentUpgradeableProxy
4. Automatically initialize the proxy

### Deployment Parameters

You can customize deployment with parameters:

```bash
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network base \
  --parameters '{"FactoryModule":{"treasury":"0x...","platformFee":"500","usdt":"0x...","usdc":"0x..."}}'
```

Parameters:
- `treasury`: Address to receive platform fees (defaults to deployer)
- `platformFee`: Fee in basis points (default: 500 = 5%)
- `usdt`: USDT token address (default: BASE mainnet USDT)
- `usdc`: USDC token address (default: BASE mainnet USDC)

## Upgrading the Contract

### Step 1: Modify the Implementation

Make changes to `CrowdVCFactory.sol`:

```solidity
// CrowdVCFactory.sol

contract CrowdVCFactory is
    ICrowdVCFactory,
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable
{
    // Existing state variables...
    uint256 public version;
    
    // NEW: Add storage gap BEFORE adding new variables
    uint256[50] private __gap;
    
    // NEW: Add new state variables AFTER the gap
    uint256 public newFeature;
    
    // Existing functions...
    
    // NEW: Add reinitializer for new version
    function initializeV2(uint256 _newFeature) public reinitializer(2) {
        newFeature = _newFeature;
        version = 2;
    }
}
```

### Step 2: Deploy New Implementation

Deploy only the new implementation:

```bash
npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts \
  --network base \
  --parameters '{
    "FactoryUpgradeModule": {
      "proxyAddress": "0x...",
      "proxyAdminAddress": "0x...",
      "needsReinitialize": false
    }
  }'
```

### Step 3: Verify the Upgrade

```typescript
// scripts/verifyUpgrade.ts
import { ethers } from 'hardhat';

async function main() {
  const proxyAddress = '0x...'; // Your proxy address
  
  const factory = await ethers.getContractAt('CrowdVCFactory', proxyAddress);
  const version = await factory.getVersion();
  
  console.log('Current version:', version);
}

main();
```

## Storage Layout

⚠️ **CRITICAL**: Never modify the order or type of existing state variables!

### Safe Upgrades ✅
```solidity
// V1
uint256 public version;
address public treasury;

// V2 - Adding new variables at the end
uint256 public version;
address public treasury;
uint256 public newVariable;  // ✅ SAFE
```

### Unsafe Upgrades ❌
```solidity
// V1
uint256 public version;
address public treasury;

// V2 - WRONG! Changed order
address public treasury;      // ❌ UNSAFE - order changed
uint256 public version;
uint256 public newVariable;

// V2 - WRONG! Changed type
bytes32 public version;       // ❌ UNSAFE - type changed
address public treasury;

// V2 - WRONG! Removed variable
address public treasury;      // ❌ UNSAFE - version removed
```

### Using Storage Gaps

Storage gaps reserve space for future variables:

```solidity
contract CrowdVCFactory {
    uint256 public version;
    address public treasury;
    
    // Reserve 50 slots for future upgrades
    uint256[50] private __gap;
}

// In V2, use gap slots:
contract CrowdVCFactory {
    uint256 public version;
    address public treasury;
    
    // New variable uses first gap slot
    uint256 public newFeature;
    
    // Gap is now 49 slots
    uint256[49] private __gap;
}
```

## Reinitialization

When upgrading, you may need to initialize new features:

```solidity
/**
 * @dev Initialize V2 features
 * @notice Can only be called once per version
 */
function initializeV2(uint256 _newFeature) public reinitializer(2) {
    newFeature = _newFeature;
    version = 2;
}
```

Version numbers:
- V1: Uses `initializer` modifier (version 1)
- V2: Uses `reinitializer(2)` modifier
- V3: Uses `reinitializer(3)` modifier
- etc.

## Admin Operations

### Get Current Implementation

```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
const currentImpl = await proxyAdmin.getProxyImplementation(proxyAddress);
console.log('Current implementation:', currentImpl);
```

### Transfer ProxyAdmin Ownership

```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
await proxyAdmin.transferOwnership(newOwner);
```

### Change Proxy Admin

```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
await proxyAdmin.changeProxyAdmin(proxyAddress, newAdmin);
```

## Security Considerations

### 1. Storage Collisions
- ✅ Always add new variables at the end
- ✅ Use storage gaps
- ✅ Test upgrades on testnet first
- ❌ Never change variable order
- ❌ Never change variable types

### 2. Initialization
- ✅ Always use `initializer` or `reinitializer` modifiers
- ✅ Protect initialization functions from being called multiple times
- ✅ Call parent initializers (`__AccessControl_init()`, etc.)
- ❌ Never use constructors in upgradeable contracts

### 3. Admin Key Management
- ✅ Use multisig for ProxyAdmin owner
- ✅ Consider timelock for upgrades
- ✅ Separate admin and user accounts
- ❌ Don't use EOA for production ProxyAdmin owner

### 4. Selfdestruct and Delegatecall
- ❌ Never use `selfdestruct` in implementation
- ❌ Be careful with `delegatecall` to untrusted contracts

## Testing Upgrades

```typescript
// test/FactoryUpgrade.test.ts
import { expect } from 'chai';
import { ethers, upgrades } from 'hardhat';

describe('Factory Upgrades', () => {
  it('should upgrade and preserve state', async () => {
    // Deploy V1
    const FactoryV1 = await ethers.getContractFactory('CrowdVCFactory');
    const proxy = await upgrades.deployProxy(FactoryV1, [treasury, fee, usdt, usdc], {
      kind: 'transparent'
    });
    
    // Set some state
    await proxy.updatePlatformFee(600);
    const feeV1 = await proxy.platformFeePercent();
    
    // Upgrade to V2
    const FactoryV2 = await ethers.getContractFactory('CrowdVCFactoryV2');
    const upgraded = await upgrades.upgradeProxy(proxy.address, FactoryV2);
    
    // Verify state preserved
    const feeV2 = await upgraded.platformFeePercent();
    expect(feeV2).to.equal(feeV1);
    
    // Test new features
    await upgraded.initializeV2(newFeatureValue);
    const newFeature = await upgraded.newFeature();
    expect(newFeature).to.equal(newFeatureValue);
  });
  
  it('should validate storage layout', async () => {
    const FactoryV1 = await ethers.getContractFactory('CrowdVCFactory');
    const FactoryV2 = await ethers.getContractFactory('CrowdVCFactoryV2');
    
    // This will throw if storage layout is incompatible
    await upgrades.validateUpgrade(FactoryV1, FactoryV2);
  });
});
```

## Useful Commands

```bash
# Deploy initial version
npx hardhat ignition deploy ignition/modules/Factory.ts --network base

# Verify implementation on Basescan
npx hardhat verify --network base <IMPLEMENTATION_ADDRESS>

# Deploy upgrade
npx hardhat ignition deploy ignition/modules/FactoryUpgrade.ts --network base \
  --parameters upgrade-params.json

# Check current implementation
npx hardhat run scripts/getImplementation.ts --network base

# Validate upgrade locally
npx hardhat test test/FactoryUpgrade.test.ts
```

## Troubleshooting

### "Contract has already been initialized"
- You're trying to call `initialize()` twice
- Solution: Use `reinitializer(2)` for upgrades

### "Implementation is not UUPS"
- Wrong error - you're using Transparent, not UUPS
- Check imports in your contract

### Storage Layout Mismatch
- You modified existing variables
- Solution: Revert changes, add new variables at end only

### "Function not found" after upgrade
- Proxy might not be updated
- Check implementation address
- Verify upgrade transaction succeeded

## Resources

- [OpenZeppelin Proxy Documentation](https://docs.openzeppelin.com/contracts/5.x/api/proxy#TransparentUpgradeableProxy)
- [OpenZeppelin Upgrades Plugins](https://docs.openzeppelin.com/upgrades-plugins/)
- [Writing Upgradeable Contracts](https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable)
- [Proxy Patterns](https://blog.openzeppelin.com/the-state-of-smart-contract-upgrades)

## Summary

The TransparentUpgradeableProxy pattern provides:
- ✅ Safe, battle-tested upgradeability
- ✅ Clear separation between admin and users
- ✅ State preservation across upgrades
- ✅ Prevention of common upgrade pitfalls
- ✅ OpenZeppelin's security guarantees

Always test upgrades thoroughly on testnet before deploying to production!


