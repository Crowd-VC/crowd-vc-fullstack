# CrowdVC Web3 Integration

Complete Web3 integration library for the CrowdVC platform using Wagmi and Viem.

## Structure

```
web3/
├── config/                 # Configuration files
│   ├── chains.ts          # BASE network configuration
│   ├── contracts.ts       # Contract addresses by network
│   └── tokens.ts          # USDT/USDC token configuration
├── hooks/                 # React hooks for contract interactions
│   ├── factory/          # CrowdVCFactory contract hooks
│   └── tokens/           # ERC20 token hooks
├── utils/                # Utility functions
│   ├── formatters.ts     # Format addresses, amounts, timestamps
│   ├── validators.ts     # Input validation helpers
│   ├── errors.ts         # Error parsing and handling
│   └── constants.ts      # Web3 constants
├── types/                # TypeScript type definitions
└── index.ts              # Main export file
```

## Quick Start

### 1. Environment Setup

Add the following to `apps/web/.env.local`:

```bash
# Network RPC URLs
NEXT_PUBLIC_LOCAL_RPC_URL=http://127.0.0.1:8545          # Local Hardhat node (default)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Contract Addresses - Localhost (for local development)
NEXT_PUBLIC_FACTORY_ADDRESS_LOCAL=0x...                   # Deployed to local Hardhat node
NEXT_PUBLIC_USDT_ADDRESS_LOCAL=0x...
NEXT_PUBLIC_USDC_ADDRESS_LOCAL=0x...

# Contract Addresses - BASE Sepolia (for testnet)
NEXT_PUBLIC_FACTORY_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_USDT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_USDC_ADDRESS_SEPOLIA=0x...

# Contract Addresses - BASE Mainnet (for production)
NEXT_PUBLIC_FACTORY_ADDRESS_BASE=0x...
NEXT_PUBLIC_USDT_ADDRESS_BASE=0x...
NEXT_PUBLIC_USDC_ADDRESS_BASE=0x...
```

**Note:** In development mode (`NODE_ENV=development`), the app automatically uses the localhost network (Hardhat local node on port 8545).

### 2. Import and Use

```typescript
import {
  useRegisterUser,
  useSubmitPitch,
  useGetUserProfile,
  useTokenBalance
} from '@/lib/web3'
```

## Available Hooks

### Factory Hooks

#### User Management
- **useRegisterUser** - Register as Startup or Investor
- **useGetUserProfile** - Get user profile data

```typescript
// Register a new user
const { registerUser, isPending, isSuccess } = useRegisterUser()

await registerUser({
  userType: UserType.Investor,
  metadataURI: 'ipfs://...'
})

// Get user profile
const { userProfile, isStartup, isInvestor } = useGetUserProfile(address)
```

#### Pitch Management
- **useSubmitPitch** - Submit a new pitch
- **useGetPitchData** - Get pitch details
- **useGetUserPitches** - Get user's pitch IDs
- **useIsPitchApproved** - Check pitch approval status

```typescript
// Submit a pitch
const { submitPitch, isPending } = useSubmitPitch()

await submitPitch({
  title: 'My Startup',
  ipfsHash: 'Qm...',
  fundingGoal: '100000' // $100,000
})

// Get pitch data
const { pitchData, isLoading } = useGetPitchData(pitchId)
```

#### Factory Views
- **useGetAllPools** - Get all pool addresses
- **useGetPlatformFee** - Get platform fee percentage

```typescript
const { pools, count } = useGetAllPools()
const { feePercentage } = useGetPlatformFee()
```

### Token Hooks

- **useTokenBalance** - Get token balance
- **useTokenAllowance** - Check spending allowance
- **useTokenApproval** - Approve token spending

```typescript
// Get USDT balance
const { balance, formattedBalance } = useTokenBalance(address, 'USDT')

// Check allowance
const { allowance, hasSufficientAllowance } = useTokenAllowance(
  ownerAddress,
  spenderAddress,
  'USDT'
)

// Approve spending
const { approve, isPending } = useTokenApproval()

await approve({
  spender: poolAddress,
  amount: '1000',
  token: 'USDT',
  isUnlimited: false // Set true for unlimited approval
})
```

## Utility Functions

### Formatters

```typescript
import {
  formatAddress,
  formatTokenAmount,
  formatTimestamp,
  formatTimeRemaining
} from '@/lib/web3'

formatAddress('0x1234567890abcdef1234567890abcdef12345678')
// => "0x1234...5678"

formatTokenAmount(1000000n, 6, 2)
// => "1.00"

formatTimeRemaining(deadline)
// => "3 days" or "5 hours"
```

### Validators

```typescript
import {
  validateAddress,
  validateAmount,
  validateBalance
} from '@/lib/web3'

const result = validateAmount('100', '10', '1000', 6)
if (!result.valid) {
  console.error(result.error)
}
```

### Error Handling

```typescript
import { parseContractError } from '@/lib/web3'

try {
  await registerUser(params)
} catch (error) {
  const userFriendlyMessage = parseContractError(error)
  toast.error(userFriendlyMessage)
}
```

## Configuration

### Supported Networks

- **Localhost** (local development) - Chain ID: 31337
  - Hardhat local node running on `http://127.0.0.1:8545`
  - Automatically enabled in development mode
- **BASE Sepolia** (testnet) - Chain ID: 84532
- **BASE Mainnet** (production) - Chain ID: 8453

### Supported Tokens

- **USDT** - 6 decimals
- **USDC** - 6 decimals

### Gas Limits

Pre-configured gas limits for all operations:
- User registration: 200,000
- Pitch submission: 250,000
- Token approval: 100,000
- Pool creation: 5,000,000

See `utils/constants.ts` for all limits.

## Type Safety

All hooks and utilities are fully typed using TypeScript and types from `@crowd-vc/abis`:

```typescript
import type {
  UserProfile,
  PitchData,
  PoolInfo,
  VoteResult
} from '@/lib/web3'
```

## Error Handling

All write hooks return user-friendly error messages:

```typescript
const {
  registerUser,
  error // Pre-parsed, user-friendly error message
} = useRegisterUser()

if (error) {
  toast.error(error) // Already user-friendly
}
```

## Transaction States

All write hooks provide consistent transaction states:

```typescript
const {
  writeFunction,    // The write function
  hash,            // Transaction hash
  isPending,       // Transaction being submitted
  isConfirming,    // Transaction being confirmed
  isSuccess,       // Transaction confirmed
  isLoading,       // isPending || isConfirming
  error,           // User-friendly error message
  reset            // Reset the hook state
} = useWriteHook()
```

## Best Practices

1. **Always check network**: Use `useChainId()` to ensure user is on correct network
2. **Validate inputs**: Use validators before submitting transactions
3. **Handle errors**: Use `parseContractError()` for user-friendly messages
4. **Show loading states**: Use `isLoading` to show transaction progress
5. **Cache data**: Read hooks automatically cache data (see `CACHE_DURATIONS`)
6. **Gas estimation**: Gas limits are pre-configured but may need adjustment

## Next Steps

This is the MVP (Phase 1-3) implementation. Future phases will add:

- **Phase 4**: Pool contract hooks (contribute, vote, withdraw)
- **Phase 5**: Milestone system hooks
- **Phase 6**: Event listening and real-time updates
- **Phase 7**: Production deployment and security audit

## Deployment Checklist

Before deploying to production:

1. ✅ Deploy contracts to BASE Sepolia testnet
2. ✅ Update environment variables with contract addresses
3. ✅ Test all hooks with real transactions on testnet
4. ⏳ Deploy contracts to BASE mainnet
5. ⏳ Update production environment variables
6. ⏳ Security audit of contracts and frontend integration
7. ⏳ Monitor transaction success rates and gas usage

## Support

For issues or questions about Web3 integration, check:
- Contract documentation in `/apps/contracts/`
- ABI package documentation in `/packages/abis/`
- Main project documentation in `/CLAUDE.md`
