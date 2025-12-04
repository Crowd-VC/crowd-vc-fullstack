# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrowdVC is a decentralized venture capital platform where investors fund industry-specific pools rather than individual startups. The platform operates in sequential phases: Funding/Submission → Voting → Distribution.

**Key Philosophy**: Blind/thematic investing where investors contribute to pools based on industry themes, then collectively vote to determine which startups receive funding.

## Development Commands

### Compilation

```bash
# Compile contracts
pnpm compile

# Clean and recompile
pnpm clean && pnpm compile
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific test file
npx hardhat test test/CrowdVCFactory.deployment.test.ts

# Run with gas reporting
REPORT_GAS=true pnpm test
```

### Deployment

```bash
# Deploy mock tokens (testnet only)
npx hardhat ignition deploy ignition/modules/MockTokens.ts --network sepolia

# Deploy factory to testnet
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network sepolia \
  --parameters ignition/parameters/sepolia.json

# Deploy to mainnet with verification
npx hardhat ignition deploy ignition/modules/Factory.ts \
  --network base \
  --parameters ignition/parameters/baseMainnet.json \
  --verify
```

## Architecture

### Core Contracts

**CrowdVCFactory** (`contracts/core/CrowdVCFactory.sol`)

- Main factory for pitch management and pool deployment
- Uses OpenZeppelin's AccessControl for role-based permissions (ADMIN_ROLE, USER_ROLE)
- Manages platform configuration (treasury, platform fees)
- Deploys pools using Minimal Proxy pattern (ERC-1167) for gas efficiency
- **Critical**: Contract is near 24KB size limit. Monitor contract size when making changes. Use `viaIR: true` optimizer setting.

**CrowdVCPool** (`contracts/core/CrowdVCPool.sol`)

- Individual investment pool with lifecycle: Active → VotingEnded → Funded → Closed (or Failed)
- Issues ERC721 NFT receipts for each contribution
- Weighted voting system (1 token = 1 vote unit) where investors can vote for up to 3 startups
- Top 3 winners selected based on votes, with automatic tie handling (can exceed 3 winners if tied)
- Milestone-based fund distribution with admin approval
- Early withdrawal with 10% penalty (penalty added to pool)
- Uses ReentrancyGuard and SafeERC20 for security

**CrowdVCTreasury** (`contracts/core/CrowdVCTreasury.sol`)

- Central treasury for receiving platform fees

### Deployment Pattern

The platform uses a **non-upgradeable factory** that deploys **minimal proxy clones** of pools:

```
CrowdVCFactory (Main Contract)
    ↓
Deploys Minimal Proxy (ERC-1167)
    ↓
CrowdVCPool Instance (Clone)
```

**Important**: Previously used TransparentUpgradeableProxy pattern but migrated to non-upgradeable. See `docs/MIGRATION_UUPS_TO_TRANSPARENT.md` for context.

### Phase Lifecycle

1. **Phase 1: Funding & Submission (Concurrent)**
   - Investors contribute USDT/USDC to pool (increases voting power)
   - Startups submit pitches during submission window
   - Admins approve/reject pitches

2. **Phase 2: Voting**
   - Begins after pitch submission deadline
   - Investors vote for approved pitches (up to 3 pitches)
   - Investors can continue contributing during voting to increase vote weight
   - Early withdrawal incurs 10% penalty

3. **Phase 3: Distribution**
   - Voting deadline passes
   - Top 3 winners selected (or more if tied)
   - Platform fee deducted and sent to treasury
   - Remaining funds allocated proportionally by vote weight
   - Funds distributed via milestone completion

## Testing Framework

Tests use **Hardhat 3.0 + Viem + node:test**:

```typescript
import { describe, it } from 'node:test';
import hre from 'hardhat';

const { viem, networkHelpers } = await hre.network.connect();

// Use loadFixture for efficient test setup
async function deployFixture() {
  const contract = await viem.deployContract('ContractName', [args]);
  return { contract };
}

it('should do something', async function () {
  const { contract } = await networkHelpers.loadFixture(deployFixture);
  // Test implementation
});
```

### Test Patterns

**Event Testing**:

```typescript
await viem.assertions.emitWithArgs(
  contract.write.functionName([args]),
  contract,
  'EventName',
  [expectedArg1, expectedArg2],
);
```

**Revert Testing**:

```typescript
await viem.assertions.revertWith(
  contract.write.functionName([args]),
  'Expected revert reason',
);
```

**Time Manipulation**:

```typescript
const deadline = BigInt(Math.floor(Date.now() / 1000)) + 86400n;
await networkHelpers.time.increaseTo(deadline + 1n);
```

**Account Impersonation**:

```typescript
const testAddr = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
await networkHelpers.impersonateAccount(testAddr);
await networkHelpers.setBalance(testAddr, 10n ** 18n);
```

### Helper Files

- `test/helpers/constants.ts` - Shared constants (ZERO_ADDRESS, role hashes, etc.)
- `test/helpers/fixtures.ts` - Reusable test fixtures
- `test/helpers/utils.ts` - Utility functions (time helpers, calculations)
- `test/helpers/index.ts` - Barrel exports

## Token Standards

- **USDT/USDC**: 6 decimals
- **Mock Tokens**: `MockUSDT.sol` and `MockUSDC.sol` for testing
- Use `parseUnits(amount, 6)` when working with these tokens
- Always use `SafeERC20` for token interactions (USDT doesn't return bool on transfer)

## Security Considerations

1. **Reentrancy**: All fund transfer functions use `nonReentrant` modifier
2. **Access Control**: Three-tier role system (DEFAULT_ADMIN_ROLE, ADMIN_ROLE, user roles)
3. **Integer Safety**: Solidity 0.8.28 has built-in overflow protection
4. **Pausable**: Factory and pools can be paused in emergencies
5. **Storage Layout**: No proxy pattern currently, but maintain storage layout discipline for potential future upgrades

## Important Constraints

- **Funding Goals**: MIN_FUNDING_GOAL (1000 USDC) to MAX_FUNDING_GOAL (10M USDC)
- **Voting Duration**: MIN_VOTING_DURATION (1 day) to MAX_VOTING_DURATION (30 days)
- **Platform Fee**: Maximum 1000 basis points (10%)
- **Early Withdrawal Penalty**: 10% of contribution
- **Max Winners**: 3 winners (can exceed if tied for 3rd place)
- **Vote Limit**: Investors can vote for up to 3 pitches

## Network Configuration

- **BASE Mainnet** (ChainID: 8453):
  - USDT: `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2`
  - USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

- **BASE Sepolia** (ChainID: 84532): Deploy mock tokens first

## Code Style

- Solidity version: `0.8.28`
- Optimizer enabled with `runs: 1` (due to contract size constraints)
- `viaIR: true` to handle complex contracts and avoid stack too deep errors
- Follow OpenZeppelin patterns for upgradeable contracts
- Use explicit imports from OpenZeppelin libraries

## Common Workflows

### Writing a New Test

1. Import test framework: `import { describe, it } from 'node:test'`
2. Create fixtures using `async function deployFixture()`
3. Use `networkHelpers.loadFixture()` in each test
4. Test happy path, reverts, events, state changes, and edge cases
5. Use BigInt literals (`1000n`) for all numeric values

### Adding a Pool Feature

1. Modify `CrowdVCPool.sol`
2. Update interface in `contracts/interfaces/ICrowdVCPool.sol`
3. Update tests in `test/CrowdVCPool.*.test.ts`
4. Ensure ReentrancyGuard is applied to fund transfer functions
5. Add events for all significant state changes

### Debugging Deployment Issues

1. Check if deployment failed: look in `ignition/deployments/<network>/`
2. Resume interrupted deployment: `npx hardhat ignition deploy --resume`
3. Use `scripts/proxyInfo.ts` to inspect deployed contracts
4. Verify contracts on block explorer: `npx hardhat verify --network <network> <address>`

## Documentation Resources

- **Deployment Guide**: `docs/DEPLOYMENT.md` - Comprehensive deployment procedures
- **Testing Plan**: `docs/TESTING_PLAN.md` - Full test coverage requirements
- **Architecture Recommendations**: `docs/ARCHITECTURE_RECOMMENDATIONS.md`
- **Security Review**: `docs/SECURITY_REVIEW.md`
- **Quick Start**: `docs/QUICK_START.md`

## Hardhat Configuration

- Uses Hardhat 3.0+ with viem plugins
- Network types: `edr-simulated` (local), `http` (remote)
- Chain types: `l1` (Ethereum), `op` (Optimism)
- Verification configured for Basescan API
