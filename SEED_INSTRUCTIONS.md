# 🌱 Database Seeding Instructions

This guide will help you seed your database with the initial pitch data.

## Prerequisites

Before seeding, make sure you have:

1. ✅ Installed Drizzle dependencies:

   ```bash
   pnpm add drizzle-orm
   pnpm add -D drizzle-kit
   ```

2. ✅ Configured your `.env.local` with `DATABASE_URL`

3. ✅ Pushed schema to database:
   ```bash
   pnpm db:push
   ```

## Install Seed Dependencies

Install `tsx` to run the TypeScript seed file:

```bash
pnpm add -D tsx
```

## Run the Seed Script

Execute the seed script to insert all pitches and create dummy users:

```bash
pnpm db:seed
```

This will:

- Create a dummy user for each pitch (with wallet address and email)
- Insert all 16 pitches from `src/data/static/pitches.ts`
- Skip any duplicate records (safe to run multiple times)

## What Gets Seeded

### Users Created

For each pitch, a startup user is created with:

- **Email**: `user{id}@{pitchname}.com`
- **Wallet Address**: `0x{id}` (padded to 40 characters)
- **Name**: `{Pitch Title} Founder`
- **User Type**: `startup`

### Pitches Inserted

All 16 pitches from your static data:

1. Project Phoenix
2. AstraYield
3. Mintopia
4. NeuroCore
5. Synaptek
6. VaultEdge
7. NexaFinance
8. PixelHaven
9. ArtLink
10. VitalPath
11. LearnSphere
12. e.hub
13. EcoRise
14. Mosaicx

## Verify the Data

After seeding, verify the data using Drizzle Studio:

```bash
pnpm db:studio
```

Or query directly in your app:

```typescript
import { getAllPitches } from '@/db/queries';

const pitches = await getAllPitches();
console.log(`Total pitches: ${pitches.length}`);
```

## Troubleshooting

### "Cannot find module 'tsx'"

**Solution:** Install tsx

```bash
pnpm add -D tsx
```

### "DATABASE_URL is not set"

**Solution:** Create `.env.local` with your Neon database URL

### Tables don't exist

**Solution:** Push schema first

```bash
pnpm db:push
```

### Duplicate key errors

The seed script uses `onConflictDoNothing()`, so it's safe to run multiple times. Existing records won't be duplicated or modified.

## Custom Seeding

To modify the seed data, edit `src/db/seed.ts` and run `pnpm db:seed` again.

---

**Happy Seeding! 🌱**
