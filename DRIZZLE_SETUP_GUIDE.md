# 🚀 Drizzle Database Setup Guide

Complete setup guide for integrating Drizzle ORM with your Next.js dApp.

## 📦 Step 1: Install Dependencies

First, install the required Drizzle packages:

```bash
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

If you encounter pnpm virtual store issues, try:

```bash
pnpm install --force
```

## 🔐 Step 2: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Neon Database URL
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### Getting Your Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select an existing one
3. Copy your connection string from the dashboard
4. Paste it into your `.env.local` file

Example:

```env
DATABASE_URL=postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 🗄️ Step 3: Initialize Database

Push your schema to the database:

```bash
pnpm db:push
```

This will create the following tables:

- ✅ `users` - User accounts with wallet integration
- ✅ `pitches` - Startup pitch submissions

## 🎯 Step 4: Verify Setup

Open Drizzle Studio to browse your database:

```bash
pnpm db:studio
```

This will open a web interface where you can:

- View and edit table data
- Run queries
- Manage your database visually

## 📋 Database Schema Overview

### Users Table

```typescript
{
  id: string;              // Primary key
  email: string;           // Unique
  walletAddress: string;   // Unique Ethereum address
  name?: string;           // Optional
  userType: 'startup' | 'investor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Pitches Table

```typescript
{
  id: string; // Primary key
  userId: string; // Foreign key → users.id
  title: string;
  summary: string;
  elevatorPitch: string;
  status: PitchStatus; // pending, approved, rejected, etc.
  dateSubmitted: Date;
  industry: string;
  companyStage: string;
  teamSize: string;
  location: string;
  fundingGoal: number;
  // ... and many more fields
}
```

## 💡 Usage Examples

### Creating a User

```typescript
import { createUser } from '@/db/queries/users';

const user = await createUser({
  id: crypto.randomUUID(),
  email: 'founder@startup.com',
  walletAddress: '0x1234567890abcdef',
  name: 'Jane Founder',
  userType: 'startup',
});
```

### Creating a Pitch

```typescript
import { createPitch } from '@/db/queries/pitches';

const pitch = await createPitch({
  id: crypto.randomUUID(),
  userId: user.id,
  title: 'Revolutionary AI Platform',
  summary: 'AI-powered solution for businesses',
  elevatorPitch: 'We help companies leverage AI...',
  status: 'pending',
  industry: 'Technology',
  companyStage: 'Seed',
  teamSize: '1-5',
  location: 'San Francisco, CA',
  fundingGoal: 500000,
  oneKeyMetric: '1000 active users',
});
```

### Querying Data

```typescript
import {
  getUserByWallet,
  getPitchesByUserId,
  getAllPitches,
  updatePitchStatus,
} from '@/db/queries';

// Get user by wallet
const user = await getUserByWallet('0x1234...');

// Get all pitches for a user
const userPitches = await getPitchesByUserId(user.id);

// Get all approved pitches
const approvedPitches = await getAllPitches('approved');

// Update pitch status
await updatePitchStatus(
  'pitch_id',
  'approved',
  'Excellent pitch! Moving forward.',
);
```

## 🛠️ Available Scripts

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `pnpm db:generate` | Generate migration files from schema   |
| `pnpm db:push`     | Push schema directly to database (dev) |
| `pnpm db:migrate`  | Apply pending migrations (production)  |
| `pnpm db:studio`   | Open visual database browser           |

## 🔄 Development Workflow

### Making Schema Changes

1. Edit schema files in `src/db/schema/`
2. Run `pnpm db:push` to apply changes
3. Verify in Drizzle Studio

### Production Migrations

1. Edit schema files
2. Run `pnpm db:generate` to create migration
3. Review generated SQL in `src/db/migrations/`
4. Run `pnpm db:migrate` to apply

## 🏗️ Project Structure

```
src/db/
├── schema/
│   ├── users.ts          # User table schema
│   ├── pitches.ts        # Pitches table schema
│   └── index.ts          # Schema exports
├── queries/
│   ├── users.ts          # User CRUD operations
│   ├── pitches.ts        # Pitch CRUD operations
│   └── index.ts          # Query exports
├── migrations/           # Auto-generated migrations
├── index.ts             # DB client configuration
└── README.md            # Detailed documentation

drizzle.config.ts        # Drizzle Kit configuration
```

## 🔗 Integration with Existing Code

Your Zustand store (`src/lib/stores/pitches.ts`) can be enhanced to use the database:

```typescript
import { getAllPitches, createPitch as dbCreatePitch } from '@/db/queries';

export const usePitchesStore = create<PitchesStore>((set, get) => ({
  pitches: [],

  // Load from database
  loadPitches: async () => {
    const pitches = await getAllPitches();
    set({ pitches });
  },

  // Save to database
  addPitch: async (pitch) => {
    const newPitch = await dbCreatePitch(pitch);
    set((state) => ({ pitches: [...state.pitches, newPitch] }));
  },
}));
```

## 🎨 Drizzle Studio Features

Access at `http://localhost:4983` when running `pnpm db:studio`:

- 📊 Browse all tables
- ✏️ Edit records inline
- 🔍 Filter and search data
- 📈 View relationships
- 🗃️ Export data

## 🐛 Troubleshooting

### "Cannot find module 'drizzle-orm'"

**Solution:** Install dependencies

```bash
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

### "DATABASE_URL is not set"

**Solution:** Create `.env.local` with your database URL

### Connection Issues

**Solutions:**

- Verify DATABASE_URL is correct
- Check Neon dashboard for connection status
- Ensure `?sslmode=require` is in the URL

### Migration Conflicts

**Solution:**

```bash
# Reset development database
pnpm db:push --force
```

## 📚 Resources

- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Database Docs](https://neon.tech/docs)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Push schema to database
4. ✅ Open Drizzle Studio
5. 🚀 Start building with database operations!

---

**Need help?** Check the detailed README in `src/db/README.md`
