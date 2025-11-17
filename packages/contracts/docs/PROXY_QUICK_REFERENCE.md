# TransparentUpgradeableProxy Quick Reference

## 🚀 Quick Start

### Deploy Initial Version
```bash
npx hardhat ignition deploy ignition/modules/Factory.ts --network base
```

### Check Proxy Info
```bash
PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network base
```

### Upgrade to New Version
```bash
PROXY_ADDRESS=0x... PROXY_ADMIN_ADDRESS=0x... \
npx hardhat run scripts/upgradeFactory.ts --network base
```

## 📋 Key Addresses

After deployment, save these addresses:

```
PROXY_ADDRESS=0x...           # ← Users interact with this
PROXY_ADMIN_ADDRESS=0x...     # ← Admin contract
IMPLEMENTATION_ADDRESS=0x...   # ← Logic contract (changes on upgrade)
```

## ✅ Safe Upgrade Checklist

Before upgrading:

- [ ] ✅ New variables added at the END only
- [ ] ✅ No changes to existing variable order
- [ ] ✅ No changes to existing variable types
- [ ] ✅ Storage gap updated if adding variables
- [ ] ✅ Added `reinitializer(N)` if needed
- [ ] ✅ Tested on local/testnet
- [ ] ✅ Run `npx hardhat test`
- [ ] ✅ Admin has ProxyAdmin ownership
- [ ] ✅ Multisig ready if using multisig

## 🔐 Contract Hierarchy

```
User/Frontend
     ↓ (calls)
TransparentUpgradeableProxy (0xAAA...)
     ↓ (delegatecall)
CrowdVCFactory Implementation (0xBBB...)

ProxyAdmin (0xCCC...) ← Controls upgrades
     ↓ (owned by)
Admin EOA/Multisig
```

## 💾 Storage Layout Rules

### ✅ SAFE:
```solidity
// V1
uint256 public version;      // slot 0
address public treasury;     // slot 1
uint256[48] private __gap;   // slots 2-49

// V2
uint256 public version;      // slot 0 (same)
address public treasury;     // slot 1 (same)
uint256 public newFeature;   // slot 2 (was gap)
uint256[47] private __gap;   // slots 3-49
```

### ❌ UNSAFE:
```solidity
// V1
uint256 public version;
address public treasury;

// V2 - DON'T DO THIS!
address public treasury;     // ❌ Order changed
uint256 public version;      // ❌ Order changed
uint256 public newFeature;

// V2 - DON'T DO THIS!
bytes32 public version;      // ❌ Type changed
address public treasury;

// V2 - DON'T DO THIS!
address public treasury;     // ❌ Variable removed
uint256 public newFeature;
```

## 🔄 Version Numbers

```solidity
// V1
function initialize(...) public initializer { 
    // version = 1 (implicit)
}

// V2
function initializeV2(...) public reinitializer(2) {
    // New features
}

// V3
function initializeV3(...) public reinitializer(3) {
    // More new features
}
```

## 📦 Import Statements

For upgradeable contracts:

```solidity
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
```

For proxy deployment:

```solidity
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
```

## 🧪 Testing Upgrades

```typescript
import { ethers, upgrades } from 'hardhat';

// Deploy with proxy
const Factory = await ethers.getContractFactory('CrowdVCFactory');
const proxy = await upgrades.deployProxy(
  Factory, 
  [treasury, fee, usdt, usdc],
  { kind: 'transparent' }
);

// Upgrade
const FactoryV2 = await ethers.getContractFactory('CrowdVCFactoryV2');
const upgraded = await upgrades.upgradeProxy(proxy.address, FactoryV2);

// Validate storage layout compatibility
await upgrades.validateUpgrade(Factory, FactoryV2);
```

## 🛠️ Admin Operations

### Transfer ProxyAdmin Ownership
```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
await proxyAdmin.transferOwnership(newOwnerAddress);
```

### Get Current Implementation
```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
const currentImpl = await proxyAdmin.getProxyImplementation(proxyAddress);
console.log('Current implementation:', currentImpl);
```

### Upgrade Without Reinitializer
```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
await proxyAdmin.upgrade(proxyAddress, newImplementationAddress);
```

### Upgrade With Reinitializer
```typescript
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
const newImpl = await ethers.getContractAt('CrowdVCFactory', newImplementationAddress);
const data = newImpl.interface.encodeFunctionData('initializeV2', [params]);
await proxyAdmin.upgradeAndCall(proxyAddress, newImplementationAddress, data);
```

## 🔗 Verify Contracts

### Verify Implementation
```bash
npx hardhat verify --network base <IMPLEMENTATION_ADDRESS>
```

### Verify Proxy (usually auto-verified)
The proxy contract is typically auto-verified since it's a standard OpenZeppelin contract.

## 🚨 Emergency Procedures

### Pause Contract
```typescript
const factory = await ethers.getContractAt('CrowdVCFactory', proxyAddress);
await factory.pause(); // Requires ADMIN_ROLE
```

### Rollback Upgrade
```typescript
// Deploy old implementation again or use previous address
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
await proxyAdmin.upgrade(proxyAddress, oldImplementationAddress);
```

## 📚 Files Reference

- `contracts/core/CrowdVCFactory.sol` - Main implementation
- `ignition/modules/Factory.ts` - Initial deployment
- `ignition/modules/FactoryUpgrade.ts` - Upgrade deployment
- `scripts/proxyInfo.ts` - View proxy information
- `scripts/upgradeFactory.ts` - Perform upgrade
- `PROXY_UPGRADE_GUIDE.md` - Full documentation

## 🔍 Troubleshooting

### "Already initialized"
```solidity
// Use reinitializer with incremented version
function initializeV2() public reinitializer(2) { }
```

### "Storage layout incompatible"
```bash
# Check storage layout differences
npx hardhat test
```

### "Not authorized"
```typescript
// Check ProxyAdmin owner
const proxyAdmin = await ethers.getContractAt('ProxyAdmin', proxyAdminAddress);
const owner = await proxyAdmin.owner();
console.log('Owner:', owner);
```

### Function not found after upgrade
```typescript
// Verify implementation was updated
const IMPL_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
const impl = await ethers.provider.getStorage(proxyAddress, IMPL_SLOT);
console.log('Current implementation:', ethers.getAddress('0x' + impl.slice(-40)));
```

## 🌐 Network Configurations

### BASE Mainnet
```typescript
const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
```

### BASE Sepolia Testnet
```typescript
// Deploy mock tokens or use testnet addresses
```

## ⚡ Common Commands

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy (initial)
npx hardhat ignition deploy ignition/modules/Factory.ts --network base

# Get proxy info
PROXY_ADDRESS=0x... npx hardhat run scripts/proxyInfo.ts --network base

# Upgrade
PROXY_ADDRESS=0x... PROXY_ADMIN_ADDRESS=0x... \
npx hardhat run scripts/upgradeFactory.ts --network base

# Verify
npx hardhat verify --network base <ADDRESS>

# Clean
npx hardhat clean
```

## 📞 Support

- [OpenZeppelin Docs](https://docs.openzeppelin.com/contracts/5.x/api/proxy)
- [OpenZeppelin Forum](https://forum.openzeppelin.com/)
- [Hardhat Docs](https://hardhat.org/docs)

---

**Remember**: Always test upgrades on testnet first! 🧪


