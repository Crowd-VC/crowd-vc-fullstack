# CrowdVC - Decentralized Venture Capital Platform

A full-stack decentralized venture capital platform built as a Turborepo monorepo, combining Next.js 15 for the web application and Hardhat for Solidity smart contracts.

## 🏗️ Project Structure

```
crowd-vc-fullstack/
├── apps/
│   ├── web/                    # Next.js 15 web application
│   │   ├── src/                # Application source code
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React components
│   │   │   ├── db/            # Drizzle ORM & database
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── lib/           # Utility functions
│   │   ├── public/            # Static assets
│   │   └── package.json       # Web app dependencies
│   │
│   └── contracts/              # Solidity smart contracts
│       ├── contracts/         # Solidity source files
│       │   ├── core/          # Core contracts (Factory, Pool)
│       │   ├── interfaces/    # Contract interfaces
│       │   ├── libraries/     # Helper libraries
│       │   └── mocks/         # Test tokens (USDT, USDC)
│       ├── scripts/           # Deployment scripts
│       ├── test/              # Contract tests
│       └── package.json       # Contract dependencies
│
├── packages/                   # Shared packages (future)
├── pnpm-workspace.yaml        # PNPM workspace config
├── turbo.json                 # Turborepo config
└── package.json               # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.16.0
- pnpm >= 10.0.0
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Install all dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
# Edit apps/web/.env.local with your values
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run only web app
pnpm web:dev

# Run database studio
pnpm db:studio
```

### Smart Contracts

```bash
# Compile contracts
pnpm contracts:compile

# Run contract tests
pnpm contracts:test

# Deploy contracts (configure network first)
pnpm contracts:deploy
```

## 📦 Available Commands

### Root Commands
- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm test` - Run all tests
- `pnpm clean` - Clean all build artifacts and node_modules

### Web App Commands
- `pnpm web:dev` - Run Next.js dev server
- `pnpm web:build` - Build Next.js app
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with test data

### Smart Contract Commands
- `pnpm contracts:compile` - Compile Solidity contracts
- `pnpm contracts:test` - Run Hardhat tests
- `pnpm contracts:deploy` - Deploy contracts
- `pnpm contracts:deploy:base` - Deploy to BASE network

## 🔧 Technology Stack

### Web Application (`apps/web`)
- **Framework**: Next.js 15 (App Router, React 19)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Jotai, TanStack Query, Zustand
- **Web3**: Reown AppKit, Wagmi, Viem
- **Forms**: React Hook Form + Zod

### Smart Contracts (`apps/contracts`)
- **Framework**: Hardhat 3.0
- **Language**: Solidity 0.8.28
- **Libraries**: OpenZeppelin Contracts (v5.4)
- **Testing**: Viem + Chai
- **Target Chain**: BASE

## 📝 Smart Contract Architecture

### Core Contracts

1. **CrowdVCFactory** (Upgradeable via UUPS)
   - User registration with roles (Startup, Investor, Admin)
   - Pitch submission and approval workflow
   - Pool factory (deploys new pool contracts)
   - Platform configuration (fees, treasury)

2. **CrowdVCPool** (Individual pool contracts)
   - USDT/USDC contribution handling
   - NFT receipts (ERC721) for investors
   - Weighted voting system (vote power = contribution)
   - Top 3 winner selection with tie handling
   - Milestone-based fund distribution
   - Early withdrawal with 10% penalty
   - Automatic refunds if funding goal not met

### Key Features
- ✅ Upgradeable factory pattern (UUPS)
- ✅ Multi-token support (USDT & USDC)
- ✅ NFT receipts for contributions
- ✅ Proportional distribution among top 3 winners
- ✅ Milestone-based vesting
- ✅ Admin-controlled pool creation
- ✅ Early withdrawal mechanism
- ✅ Platform fee collection

## 🌐 Environment Variables

### Web App (`apps/web/.env.local`)
```bash
# Database
DATABASE_URL=                        # Neon PostgreSQL connection string

# Web3
NEXT_PUBLIC_CRYPTO_PROJECT_ID=      # Reown AppKit project ID (REQUIRED)

# Email (optional)
RESEND_API_KEY=                      # Email service API key

# API (optional)
NEXT_PUBLIC_REST_API_ENDPOINT=       # External API endpoint
```

### Smart Contracts (`apps/contracts/.env`)
```bash
# Deployment
PRIVATE_KEY=                         # Deployer wallet private key
BASE_RPC_URL=                        # BASE mainnet RPC
BASE_SEPOLIA_RPC_URL=                # BASE Sepolia testnet RPC

# Verification
BASESCAN_API_KEY=                    # Basescan API key

# Contract Addresses (after deployment)
USDT_ADDRESS_BASE=                   # USDT on BASE
USDC_ADDRESS_BASE=                   # USDC on BASE
CROWDVC_FACTORY_ADDRESS=             # Deployed factory address
TREASURY_ADDRESS=                    # Multisig treasury

# Configuration
PLATFORM_FEE_PERCENT=500             # 5% = 500 basis points
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run web app tests
pnpm web:test

# Run contract tests
pnpm contracts:test

# Run contract tests with gas reporting
REPORT_GAS=true pnpm contracts:test
```

## 📚 Documentation

- [Smart Contract Plan](./SMART_CONTRACT_PLAN.md) - Detailed architecture and design decisions
- [CLAUDE.md](./CLAUDE.md) - Development guidance for AI assistants
- [Drizzle Setup Guide](./apps/web/DRIZZLE_SETUP_GUIDE.md) - Database setup instructions

## 🚢 Deployment

### Web Application

```bash
# Build for production
pnpm web:build

# Deploy to Vercel (recommended)
vercel deploy
```

### Smart Contracts

```bash
# Compile contracts
pnpm contracts:compile

# Deploy to BASE Sepolia (testnet)
cd apps/contracts
npx hardhat run scripts/deploy.ts --network baseSepolia

# Deploy to BASE mainnet
npx hardhat run scripts/deploy.ts --network base

# Verify contracts
npx hardhat verify --network base <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## ⚠️ Important Notes

### Contract Size Optimization
The CrowdVCFactory contract currently exceeds the 24KB size limit. Before mainnet deployment:
- Enable optimizer with lower runs value (e.g., `runs: 100`)
- Consider splitting into multiple contracts
- Review and optimize storage patterns

### Security Considerations
- Smart contracts have NOT been audited
- Conduct thorough security audit before mainnet deployment
- Use multisig wallet for admin operations
- Test extensively on testnet before mainnet

### Development Tips
- Use `pnpm dev` from root to run all apps concurrently
- Turborepo caches build outputs for faster rebuilds
- Contract compilation is cached - only recompiles on changes
- Database migrations are NOT cached - always run fresh

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm test`
4. Submit a pull request

## 📄 License

This project is private and proprietary.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [BASE Network](https://base.org)
