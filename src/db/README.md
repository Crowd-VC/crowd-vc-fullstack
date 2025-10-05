# Database Setup with Drizzle ORM

This project uses [Drizzle ORM](https://orm.drizzle.team/) with PostgreSQL (Neon Database).

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your database connection string:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

Get your connection string from [Neon Console](https://console.neon.tech).

### 3. Generate Migrations

Generate migration files from your schema:

```bash
pnpm db:generate
```

### 4. Push to Database

Push your schema changes directly to the database (development):

```bash
pnpm db:push
```

Or apply migrations (production):

```bash
pnpm db:migrate
```

### 5. Drizzle Studio

Open Drizzle Studio to browse and manage your database:

```bash
pnpm db:studio
```

## Database Schema

### Users Table

- **id**: Primary key (text)
- **email**: Unique email address
- **walletAddress**: Unique wallet address
- **name**: Optional user name
- **userType**: Enum - "startup", "investor", or "admin"
- **createdAt**: Timestamp when user was created
- **updatedAt**: Timestamp when user was last updated

### Pitches Table

- **id**: Primary key (text)
- **userId**: Foreign key to users table
- **title**: Pitch title
- **summary**: Brief summary
- **elevatorPitch**: Elevator pitch description
- **status**: Pitch status (pending, approved, rejected, etc.)
- **dateSubmitted**: Submission timestamp
- **industry**: Company industry
- **companyStage**: Stage of the company
- **teamSize**: Size of the team
- **location**: Company location
- **fundingGoal**: Funding goal amount
- And many more fields for company details, funding info, and media URLs

## Usage Examples

### Users

```typescript
import { getUserById, createUser, updateUser } from '@/db/queries/users';

// Create a user
const newUser = await createUser({
  id: 'user_123',
  email: 'user@example.com',
  walletAddress: '0x123...',
  name: 'John Doe',
  userType: 'startup',
});

// Get a user
const user = await getUserById('user_123');

// Update a user
const updated = await updateUser('user_123', {
  name: 'Jane Doe',
});
```

### Pitches

```typescript
import {
  getPitchById,
  createPitch,
  updatePitchStatus,
  getAllPitches,
} from '@/db/queries/pitches';

// Create a pitch
const newPitch = await createPitch({
  id: 'pitch_123',
  userId: 'user_123',
  title: 'My Startup',
  summary: 'Revolutionary app',
  elevatorPitch: "We're building...",
  status: 'pending',
  industry: 'Technology',
  companyStage: 'Seed',
  teamSize: '1-5',
  location: 'San Francisco',
  fundingGoal: 100000,
  oneKeyMetric: '10k users',
});

// Get all pitches with a specific status
const approvedPitches = await getAllPitches('approved');

// Update pitch status
await updatePitchStatus('pitch_123', 'approved', 'Great pitch!');
```

## Database Scripts

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Apply migrations to the database
- `pnpm db:push` - Push schema changes directly (for development)
- `pnpm db:studio` - Open Drizzle Studio web interface

## File Structure

```
src/db/
├── schema/
│   ├── users.ts       # User schema definition
│   ├── pitches.ts     # Pitches schema definition
│   └── index.ts       # Schema exports
├── queries/
│   ├── users.ts       # User query functions
│   ├── pitches.ts     # Pitches query functions
│   └── index.ts       # Query exports
├── migrations/        # Generated migration files
├── index.ts          # Database client setup
└── README.md         # This file
```

## Migration Workflow

### Development

1. Make changes to your schema files
2. Run `pnpm db:push` to apply changes directly

### Production

1. Make changes to your schema files
2. Run `pnpm db:generate` to create migration files
3. Review the generated migrations
4. Run `pnpm db:migrate` to apply migrations

## Notes

- The project uses Neon's serverless driver for PostgreSQL
- All timestamps are handled automatically with `defaultNow()`
- Foreign keys use cascade delete for data integrity
- Use Drizzle Studio for a visual interface to manage your data
