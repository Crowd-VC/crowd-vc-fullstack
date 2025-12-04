# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrowdVC is a decentralized venture capital platform built as a **Turborepo monorepo**. It combines a Next.js 15 web application with Hardhat smart contracts. The platform enables startups to submit pitches, investors to vote and contribute funds, with all core logic implemented both on-chain (smart contracts) and off-chain (database) for redundancy and UI performance.

## Monorepo Structure

This is a Turborepo monorepo with the following structure:

```
crowd-vc-fullstack/
├── apps/
│   └── web/              # Next.js 15 application (@crowd-vc/web)
├── packages/
│   ├── contracts/        # Hardhat smart contracts (@crowd-vc/contracts)
│   └── abis/             # Contract ABIs (@crowd-vc/abis)
├── pnpm-workspace.yaml   # PNPM workspace configuration
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json with workspace scripts
```

**Important**: The contracts are in `packages/contracts/`,

## Development Commands

### Monorepo Commands (from root)

```bash
pnpm install              # Install all dependencies (pnpm required, not npm/yarn)
pnpm dev                  # Run all apps in development mode (uses Turborepo)
pnpm build                # Build all apps
pnpm lint                 # Lint all apps
pnpm test                 # Run all tests
pnpm clean                # Clean all build artifacts
```

### Web App Commands (from root)

```bash
pnpm web:dev              # Run Next.js dev server only
pnpm web:build            # Build web app only
pnpm db:generate          # Generate Drizzle migrations from schema changes
pnpm db:migrate           # Apply migrations to database
pnpm db:push              # Push schema directly to database (skip migrations)
pnpm db:studio            # Open Drizzle Studio (database GUI)
pnpm db:seed              # Seed database with test data
```

### Smart Contract Commands (from root)

```bash
# Primary commands (run from root)
pnpm hardhat:build        # Compile Solidity contracts
pnpm hardhat:test         # Run Hardhat tests
pnpm hardhat:node         # Start local Hardhat node
pnpm hardhat:clean        # Clean artifacts and cache
pnpm hardhat:verify       # Verify contracts on Basescan
pnpm generate:addresses   # Generate contract address TypeScript files
pnpm ignition:deploy      # Deploy using Hardhat Ignition to BASE
pnpm ignition:upgrade     # Upgrade factory contract via Ignition
```

### Working in Individual Packages

```bash
# For web app
cd apps/web
pnpm dev                  # Run Next.js dev server

# For contracts
cd packages/contracts
pnpm compile              # Compile contracts
pnpm test                 # Run tests
pnpm deploy:baseSepolia   # Deploy to BASE Sepolia with mock tokens
pnpm deploy:baseMainnet   # Deploy to BASE mainnet
pnpm deploy:baseMainnet:verify  # Deploy and verify on BASE mainnet
pnpm full-deploy          # Clean compile and deploy
```

## Required Environment Variables

### Web App (`apps/web/.env.local`)

Create `.env.local` from `.env.local.example`:

```bash
DATABASE_URL=                        # Neon PostgreSQL connection string (required)
NEXT_PUBLIC_CRYPTO_PROJECT_ID=      # Reown AppKit project ID (REQUIRED - app will error without this)
RESEND_API_KEY=                      # Email service API key (if using email features)
NEXT_PUBLIC_REST_API_ENDPOINT=       # External API endpoint (optional)
```

**Critical**: `NEXT_PUBLIC_CRYPTO_PROJECT_ID` is mandatory. Get it from [Reown Docs](https://docs.reown.com/appkit/next/core/installation).

### Smart Contracts (`packages/contracts/.env`)

Create `.env` in `packages/contracts/`:

```bash
PRIVATE_KEY=                         # Deployer wallet private key
BASE_RPC_URL=                        # BASE mainnet RPC (https://mainnet.base.org)
BASE_SEPOLIA_RPC_URL=                # BASE Sepolia testnet RPC
BASESCAN_API_KEY=                    # Basescan API key for contract verification
USDT_ADDRESS_BASE=                   # USDT token address on BASE (after deployment)
USDC_ADDRESS_BASE=                   # USDC token address on BASE (after deployment)
CROWDVC_FACTORY_ADDRESS=             # Deployed factory address
TREASURY_ADDRESS=                    # Multisig treasury address
PLATFORM_FEE_PERCENT=500             # Platform fee in basis points (500 = 5%)
```

## Architecture Overview

### Tech Stack

**Web App (`apps/web`)**:

- **Framework**: Next.js 15 (App Router, React 19, TypeScript 5.7)
- **Database**: PostgreSQL (Neon serverless) + Drizzle ORM
- **Web3**: Reown AppKit, Wagmi, Viem, Ethers.js
- **State Management**: Jotai (global), TanStack Query (server), Zustand (stores)
- **Styling**: Tailwind CSS + Radix UI components
- **Forms**: React Hook Form + Zod validation

**Smart Contracts (`packages/contracts`)**:

- **Framework**: Hardhat 3.0
- **Language**: Solidity 0.8.28
- **Libraries**: OpenZeppelin Contracts v5.4 (standard + upgradeable)
- **Testing**: Viem + Chai + node:test (via hardhat-node-test-runner)
- **Target Chain**: BASE (mainnet and Sepolia testnet)
- **Compiler**: Uses viaIR for complex contracts, optimizer runs=1

### Web App Structure (`apps/web/src/`)

```
src/
├── app/                          # Next.js App Router
│   ├── (landing)/                # Public landing page (route group)
│   ├── authentication/           # Sign-in/sign-up flows
│   ├── dashboard/                # Protected dashboard routes
│   ├── api/                      # REST API endpoints
│   └── shared/                   # Shared configs (wagmi, etc.)
├── components/
│   ├── providers/                # Context providers (wallet, query, theme, jotai)
│   ├── ui/                       # Reusable UI components (shadcn/Radix)
│   ├── submit-pitch/             # Multi-step pitch submission forms
│   ├── modal-views/              # Modal dialogs
│   ├── drawer-views/             # Drawer/sidebar components
│   └── [feature]/                # Feature-specific components
├── db/
│   ├── schema/                   # Drizzle schema definitions
│   ├── queries/                  # Database query functions
│   ├── migrations/               # SQL migration files
│   └── seed.ts                   # Database seeding script
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
└── assets/                       # Static assets (images, fonts, css)
```

### Smart Contracts Structure (`packages/contracts/`)

```
contracts/
├── interfaces/                   # Contract interfaces
│   ├── ICrowdVCFactory.sol      # Factory interface
│   └── ICrowdVCPool.sol         # Pool interface
├── libraries/                    # Helper libraries
│   ├── FeeCalculator.sol        # Fee and distribution calculations
│   └── ValidationLib.sol        # Input validation helpers
├── core/                         # Core contracts
│   ├── CrowdVCFactory.sol       # Main upgradeable factory (UUPS)
│   ├── CrowdVCPool.sol          # Pool contract with NFT receipts
│   └── CrowdVCTreasury.sol      # Treasury contract containing platform fees and penalties
└── mocks/                        # Test contracts
    ├── MockUSDT.sol             # Test USDT token
    └── MockUSDC.sol             # Test USDC token

scripts/                          # Deployment scripts
test/                             # Contract tests (using node:test)
├── helpers/                      # Test utilities and fixtures
│   ├── fixtures.ts              # Deployment fixtures
│   ├── constants.ts             # Test constants
│   └── utils.ts                 # Test helpers
├── CrowdVCFactory.deployment.test.ts
├── CrowdVCFactory.users.test.ts
├── CrowdVCFactory.pitches.test.ts
└── CrowdVCFactory.pools.test.ts
```

### Database Schema

**Core Tables:**

- `users` - User accounts with wallet addresses and roles (startup/investor/admin)
- `pitches` - Startup pitch submissions with status workflow
- `pools` - Investment pools with voting deadlines and funding goals
- `votes` - Voting records (poolId, pitchId, userId, walletAddress)
- `contributions` - Investment contributions with transaction hashes
- `pool_startups` - Many-to-many relationship between pools and pitches
- `pitch_actions` - Audit trail for pitch status changes
- `rejection_reasons` - Admin feedback for rejected pitches

**Important Enums:**

- `user_type`: `startup`, `investor`, `admin`
- `pitch_status`: `pending`, `under-review`, `shortlisted`, `conditional-approval`, `needs-more-info`, `approved`, `rejected`, `in-pool`
- `pool_status`: `upcoming`, `active`, `closed`
- `contribution_status`: `pending`, `confirmed`, `failed`

All schemas are in `src/db/schema/` and exported from `src/db/schema/index.ts`.

### Web3 Integration

**Wallet Connection:**

- Configured in `src/components/providers/wallet-provider.tsx`
- Uses Reown AppKit with WagmiAdapter
- Supports Ethereum Mainnet and Arbitrum networks
- ReownAuthentication (SIWX) for Sign-In With Ethereum

**Wagmi Config:**

- Located in `src/app/config/wagmi-config.tsx`
- Project metadata defined for wallet display
- Network configurations for supported chains

**Key Components:**

- Use `useAccount()`, `useConnect()`, `useDisconnect()` from wagmi for wallet state
- Transaction hashes stored in `contributions` table for on-chain verification
- Wallet addresses are unique identifiers for users

### API Routes

All API routes follow REST conventions in `src/app/api/`:

**Pitches** (`/api/pitches`):

- `GET` - List pitches (filter by status with `?status=`)
- `POST` - Create pitch (requires userId, title, summary, etc.)
- `GET /api/pitches/[id]` - Get single pitch
- `PATCH /api/pitches/[id]` - Update pitch
- `DELETE /api/pitches/[id]` - Delete pitch

**Pools** (`/api/pools`):

- `GET` - List active pools with contribution counts
- `POST` - Create pool (admin only)
- `GET /api/pools/[id]` - Get pool details with startups
- `POST /api/pools/[id]/vote` - Submit vote (requires walletAddress, pitchId)

**Contributions** (`/api/contributions`):

- `GET` - List contributions (filter by `?poolId=` or `?userId=`)
- `POST` - Create contribution (amount, walletAddress, transactionHash required)
- Platform fee is hardcoded at 5 (see `src/app/api/contributions/route.ts`)

**Admin** (`/api/admin/*`):

- `/admin/pitches` - Manage all pitches
- `/admin/pitches/[id]` - Update pitch status with review notes
- `/admin/pools` - Manage pools
- `/admin/pools/[id]/startups` - Link startups to pools

### State Management Patterns

**Global State (Jotai):**

- Atomic state stored in atoms (see `src/store/` or inline atoms)
- Provider wraps app in `src/components/providers/index.tsx`

**Server State (TanStack Query):**

- Use for data fetching from API routes
- Custom hooks in `src/hooks/` (e.g., `use-pools.ts`, `use-admin-pitches.ts`)
- Configure QueryClient in providers

**Forms:**

- React Hook Form with Zod validation schemas
- Multi-step forms use form wizard pattern (see `src/components/submit-pitch/`)

### Smart Contract Architecture

**Core Contracts:**

1. **CrowdVCFactory.sol** (`packages/contracts/contracts/core/`)
   - Pitch submission and approval workflow
   - Factory pattern: deploys new CrowdVCPool contracts
   - Platform configuration (fees, supported tokens, treasury)
   - OpenZeppelin AccessControl for permissions

2. **CrowdVCPool.sol** (`packages/contracts/contracts/core/`)
   - Individual pool contract (one per investment pool)
   - ERC721 for NFT receipts issued to investors
   - USDT/USDC contribution handling with SafeERC20
   - Weighted voting: vote power = contribution amount
   - Top 3 winner selection with tie handling
   - Milestone-based fund distribution
   - Early withdrawal with 10% penalty
   - Automatic refunds if funding goal not met
   - ReentrancyGuard for security

**Supporting Contracts:**

- **Libraries** (`packages/contracts/contracts/libraries/`)
  - `FeeCalculator.sol`: Fee calculations, proportional distributions
  - `ValidationLib.sol`: Input validation helpers

- **Interfaces** (`packages/contracts/contracts/interfaces/`)
  - `ICrowdVCFactory.sol`: Factory interface
  - `ICrowdVCPool.sol`: Pool interface

- **Mocks** (`packages/contracts/contracts/mocks/`)
  - `MockUSDT.sol`: Test USDT token (6 decimals)
  - `MockUSDC.sol`: Test USDC token (6 decimals)

**Key Design Decisions:**

1. **Chain**: BASE (not Arbitrum)
2. **Tokens**: USDT and USDC only
3. **Distribution**: Proportional split among top 3 winners (more if tie)
4. **Max Winners**: 3 (or more in case of tie)
5. **Admin Powers**: Pool creation, startup approval, platform fee updates
6. **Voting Period**: Fixed duration set at pool creation
7. **Min Contribution**: Admin-settable per pool
8. **Early Withdrawal**: Allowed with 10% penalty before voting ends
9. **NFT Receipts**: ERC721 tokens issued for each contribution
10. **Compiler**: viaIR enabled to handle complex contracts

**Contract Size Warning:**

- CrowdVCFactory exceeds 24KB limit (warning during compilation)
- Before mainnet deployment: optimize storage, split contracts, or lower optimizer runs

## Key Development Patterns

### Working with Smart Contracts

**Testing Framework:**

- Uses Hardhat 3.0 with node:test runner (NOT Mocha)
- Test framework: `node:test` via `@nomicfoundation/hardhat-node-test-runner`
- Assertions: Viem + Chai via `@nomicfoundation/hardhat-viem-assertions`
- Test organization: Fixtures using `loadFixture` for snapshot-based isolation
- Test helpers in `test/helpers/`: `fixtures.ts`, `constants.ts`, `utils.ts`

**Compilation:**

```bash
# From root
pnpm hardhat:build

# From packages/contracts
pnpm compile
```

**Testing:**

```bash
# Run all tests
pnpm hardhat:test

# Run specific test file
cd packages/contracts
npx hardhat test test/CrowdVCFactory.deployment.test.ts

# Run with gas reporting
REPORT_GAS=true pnpm hardhat:test
```

**Deployment:**

1. Configure network in `packages/contracts/hardhat.config.ts`
2. Set environment variables in `packages/contracts/.env`
3. Use deployment scripts in `packages/contracts/scripts/`
4. Run: `pnpm ignition:deploy` (from root) or deployment scripts directly

**Contract Interaction:**

- Use Viem in Next.js app for contract calls
- Import contract ABIs from `packages/abis/`
- ABIs are auto-generated from compiled contracts

### Monorepo Patterns

**Adding New Package:**

1. Create directory in `packages/` or `apps/`
2. Add `package.json` with unique name (e.g., `@crowd-vc/shared`)
3. Add to `pnpm-workspace.yaml` if not matching existing pattern
4. Run `pnpm install` from root
5. Reference in other packages via workspace protocol: `"@crowd-vc/shared": "workspace:*"`

**Turborepo Task Dependencies:**

- Defined in `turbo.json`
- Use `dependsOn` to ensure tasks run in order
- Example: `test` depends on `compile` for contracts
- Database tasks (`db:generate`, `db:migrate`, etc.) have `cache: false`

**Important Monorepo Rules:**

- Always run `pnpm install` from root
- Use workspace commands from root: `pnpm web:dev`, `pnpm hardhat:test`
- Each app/package has its own `package.json`, `tsconfig.json`, and `.env` file
- Shared dependencies go in root `package.json` as devDependencies
- Contracts are in `packages/contracts/`, NOT `apps/contracts/`

### Adding New Database Tables (Web App)

1. Navigate to web app: `cd apps/web`
2. Create schema in `src/db/schema/[table-name].ts`
3. Export from `src/db/schema/index.ts`
4. Run `pnpm db:generate` (from root or web directory) to create migration
5. Review migration in `src/db/migrations/`
6. Run `pnpm db:migrate` to apply
7. Create query functions in `src/db/queries/[table-name].ts`

### Creating API Endpoints (Web App)

1. Navigate to `apps/web/src/app/api/`
2. Create route handler in `[endpoint]/route.ts`
3. Export async `GET`, `POST`, `PATCH`, `DELETE` functions
4. Use `NextRequest` and return `NextResponse.json()`
5. Import database queries from `src/db/queries/`
6. Add proper error handling with try-catch
7. Validate request body with Zod schemas

### Using TypeScript Path Aliases

- **Web App**: `@/*` maps to `apps/web/src/*` (configured in `apps/web/tsconfig.json`)
- Example: `import { Button } from '@/components/ui/button'`
- **Contracts**: No path aliases, use relative imports

### Pitch Status Workflow

Pitches follow this status flow:

1. `pending` - Initial submission
2. `under-review` - Admin reviewing
3. `shortlisted` OR `needs-more-info` OR `conditional-approval` - Review states
4. `approved` - Accepted for pool
5. `in-pool` - Added to investment pool
6. `rejected` - Declined (with rejection reason)

When updating pitch status, create corresponding entries in `pitch_actions` table.

### Working with Wallet Addresses

- Wallet addresses are stored as `VARCHAR` in database
- Store checksummed addresses from `getAddress()` (viem/ethers)
- Wallet address is the primary user identifier
- Votes and contributions require `walletAddress` field

## Important Notes

### Authentication

- Web3 wallet authentication via ReownAuthentication is integrated
- Traditional email/password forms exist but may be placeholder implementations
- User records are keyed by wallet addresses
- API routes currently lack visible authentication middleware (this may need implementation)

### Platform Fees

- Platform fee for contributions is hardcoded at 5 in `src/app/api/contributions/route.ts`
- Gas fees are tracked separately in contributions table

### File Storage

- Pinata (IPFS) integration for pitch decks and media files
- File upload implementation may be in progress

### Build Configuration

- TypeScript and ESLint errors are ignored in production builds (see `next.config.js`)
- This should be addressed before production deployment

### Network Support

- Currently supports Ethereum Mainnet and Arbitrum
- Add networks in `src/app/shared/wagmi-config.tsx` and wallet provider

### Hardhat Configuration

- Uses Hardhat 3.0 with EDR (Ethereum Development Runtime)
- Network type: `edr-simulated` for local testing
- Test runner: node:test (NOT Mocha)
- Compiler: viaIR enabled, optimizer runs=1
- allowUnlimitedContractSize: true for development
