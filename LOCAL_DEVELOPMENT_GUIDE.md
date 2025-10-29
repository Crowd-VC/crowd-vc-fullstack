# Local Development Guide - CrowdVC Web3 Integration

Complete guide for developing and testing CrowdVC Web3 features locally using a Hardhat local node.

## Overview

Instead of deploying to BASE Sepolia testnet for every change, you can develop and test locally using:

- **Hardhat Local Node** - Fast, deterministic blockchain running on your machine
- **Localhost Network** - Chain ID: 31337, RPC: `http://127.0.0.1:8545`
- **Instant Transactions** - No gas costs, instant block mining
- **Easy Debugging** - Console logs, stack traces, and detailed error messages

## Prerequisites

- Node.js 20.16 or later
- pnpm installed
- Hardhat installed (already in `apps/contracts`)
- MetaMask or another Web3 wallet

## Setup Steps

### 1. Start the Hardhat Local Node

Open a terminal and start the Hardhat node:

```bash
cd apps/contracts
npx hardhat node
```

This will:
- Start a local Ethereum node on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys
- Mine blocks instantly when transactions are sent

**Important:** Keep this terminal window open while developing!

Example output:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

...
```

### 2. Deploy Contracts to Local Node

In a **new terminal**, deploy your contracts to the local node:

```bash
cd apps/contracts

# Deploy MockUSDT
npx hardhat run scripts/deploy-mock-usdt.ts --network localhost

# Deploy MockUSDC
npx hardhat run scripts/deploy-mock-usdc.ts --network localhost

# Deploy CrowdVCFactory
npx hardhat run scripts/deploy-factory.ts --network localhost
```

**Save the deployed contract addresses!** You'll need them in the next step.

Example output:
```
MockUSDT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
MockUSDC deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
CrowdVCFactory deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 3. Configure Environment Variables

Update `apps/web/.env.local` with your deployed contract addresses:

```bash
# Local Development (Hardhat Node)
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_FACTORY_ADDRESS_LOCAL=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_USDT_ADDRESS_LOCAL=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_USDC_ADDRESS_LOCAL=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Other networks (leave as is)
NEXT_PUBLIC_CRYPTO_PROJECT_ID=your_reown_project_id
```

### 4. Import Test Account to MetaMask

1. Open MetaMask
2. Click the account icon → "Import Account"
3. Select "Import using Secret Recovery Phrase" or "Private Key"
4. Paste one of the private keys from Hardhat (e.g., the first account)
5. Name it something like "Hardhat Test #0"

**Security Note:** Only use these test accounts for local development. Never send real funds to them!

### 5. Add Localhost Network to MetaMask

1. Open MetaMask → Networks → "Add Network"
2. Click "Add a network manually"
3. Enter the following:

```
Network Name: Localhost 8545
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

4. Click "Save"
5. Switch to the "Localhost 8545" network

### 6. Start the Next.js Development Server

In a **third terminal**:

```bash
# From project root
pnpm web:dev

# Or from web app directory
cd apps/web
pnpm dev
```

The app will automatically detect you're in development mode and use the localhost network!

### 7. Test the Integration

1. Open your browser to `http://localhost:3000`
2. Connect your MetaMask wallet
3. Select the "Localhost 8545" network in the wallet modal
4. Connect using the imported Hardhat test account
5. Try the Web3 features:
   - Register as a user
   - Submit a pitch
   - Check token balances
   - Approve token spending

## Development Workflow

### Typical Development Session

1. **Terminal 1:** Hardhat node running
   ```bash
   cd apps/contracts && npx hardhat node
   ```

2. **Terminal 2:** Deploy/redeploy contracts as needed
   ```bash
   cd apps/contracts
   npx hardhat run scripts/deploy-factory.ts --network localhost
   ```

3. **Terminal 3:** Next.js dev server
   ```bash
   pnpm web:dev
   ```

4. **Browser:** Test your features with MetaMask

### Resetting State

If you need to reset the blockchain state:

1. Stop the Hardhat node (Ctrl+C in Terminal 1)
2. Restart it with `npx hardhat node`
3. Redeploy all contracts (Terminal 2)
4. Update environment variables with new addresses
5. Restart Next.js dev server (Ctrl+C and restart in Terminal 3)

### Testing Different Scenarios

#### Testing as Different Users

Use different Hardhat accounts to test multi-user scenarios:

1. In MetaMask, import multiple accounts (Account #0, #1, #2, etc.)
2. Switch between accounts to test:
   - Startup user flow (register, submit pitch)
   - Investor user flow (register, check balances, approve tokens)
   - Admin user flow (approve pitches, create pools)

#### Testing Token Operations

Mock USDT/USDC tokens are already deployed with large supplies:

```typescript
// Each account automatically has tokens
// You can mint more if needed:

// In Hardhat console
npx hardhat console --network localhost

const USDT = await ethers.getContractAt("MockUSDT", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
await USDT.mint("0xYourAddress", ethers.parseUnits("10000", 6))
```

#### Testing Transactions

All transactions are instant on localhost:
- No gas costs
- No waiting for confirmations
- Instant block mining

Perfect for rapid testing!

## Debugging

### Console Logging in Contracts

Hardhat supports `console.log` in Solidity:

```solidity
import "hardhat/console.sol";

function registerUser(UserType userType, string memory metadataURI) external {
    console.log("Registering user:", msg.sender);
    console.log("User type:", uint256(userType));
    // ... rest of function
}
```

Logs appear in the Hardhat node terminal!

### Common Issues

#### Issue: MetaMask shows wrong nonce

**Solution:** Reset your account in MetaMask:
1. Settings → Advanced → Clear activity tab data
2. Or: Settings → Advanced → Reset Account (for the test account only)

#### Issue: Contract addresses changed after restarting Hardhat

**Solution:** Hardhat always deploys to the same addresses in the same order if you:
1. Deploy in the same order
2. Start with a fresh node each time

**Tip:** Create a deployment script that deploys all contracts and outputs addresses:

```bash
# apps/contracts/scripts/deploy-all-local.ts
# Deploy USDT, USDC, Factory in one script
```

#### Issue: Transaction fails with "unknown account"

**Solution:** Make sure:
1. Hardhat node is running
2. You're connected to the Localhost network in MetaMask
3. You're using an imported Hardhat account

#### Issue: Next.js can't connect to localhost node

**Solution:** Check that:
1. `NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545` in `.env.local`
2. Hardhat node is running
3. No firewall blocking port 8545

## Advanced: Using Hardhat Console

For direct contract interaction:

```bash
cd apps/contracts
npx hardhat console --network localhost
```

Then you can interact with contracts directly:

```javascript
// Get contract instance
const Factory = await ethers.getContractAt(
  "CrowdVCFactory",
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
)

// Call functions
const [signer] = await ethers.getSigners()
await Factory.registerUser(1, "ipfs://...") // 1 = Startup

// Check state
const profile = await Factory.getUserProfile(signer.address)
console.log(profile)
```

## Switching to Testnet

When you're ready to test on BASE Sepolia testnet:

1. Set `NODE_ENV=production` or deploy a production build
2. Update `.env.local` with BASE Sepolia contract addresses
3. Switch MetaMask to BASE Sepolia network
4. Use real testnet ETH (get from faucet)

The Web3 integration automatically switches networks based on `NODE_ENV`.

## Performance Tips

- **Instant Mining:** Hardhat mines blocks instantly by default
- **No Rate Limits:** Unlimited RPC calls to your local node
- **Parallel Testing:** Run multiple local nodes on different ports if needed
- **Snapshots:** Use Hardhat snapshots to reset to specific states

## Security Reminders

- ✅ **DO** use Hardhat accounts for local testing
- ✅ **DO** keep the Hardhat node terminal visible for debugging
- ❌ **DON'T** send real funds to Hardhat test accounts
- ❌ **DON'T** use Hardhat private keys on real networks
- ❌ **DON'T** commit `.env.local` with contract addresses

## Troubleshooting Checklist

Before asking for help, verify:

- [ ] Hardhat node is running (`Terminal 1`)
- [ ] Contracts are deployed to localhost (`Terminal 2`)
- [ ] Environment variables are set correctly (`.env.local`)
- [ ] Next.js dev server is running (`Terminal 3`)
- [ ] MetaMask is connected to "Localhost 8545"
- [ ] Using an imported Hardhat test account
- [ ] NODE_ENV is set to "development"

## Next Steps

Once local development is working:

1. Test all user flows locally
2. Fix any bugs or issues
3. Deploy to BASE Sepolia testnet
4. Test with real testnet
5. Deploy to BASE mainnet for production

## Resources

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Hardhat Network](https://hardhat.org/hardhat-network/)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Viem Documentation](https://viem.sh/)
- [Wagmi Documentation](https://wagmi.sh/)

Happy local development! 🚀
