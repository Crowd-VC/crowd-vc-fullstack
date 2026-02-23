# Modern Next.js & Hardhat Web3 Architecture Proposal

This document outlines the target architecture for the application, designed by prioritizing clean code, separation of concerns, and optimized performance. It transitions to a streamlined, scalable monorepo design using Turborepo to efficiently manage both the Next.js frontend and Hardhat smart contracts.

## 1. Core Principles

- **Streamlined Monorepo (Turborepo + pnpm):** The application will be structured as a monorepo to cleanly separate the Next.js frontend (`apps/web`) from the Hardhat smart contracts (`packages/contracts`), allowing for shared configurations and types without tooling overhead.
- **App Router First:** Fully adopt the Next.js App Router (`app/` directory) with React Server Components (RSCs) and Server Actions for optimized data fetching and rendering in the web app.
- **Type Safety & Validation:** Strict TypeScript usage across the board. Every form and API boundary must be validated using Zod schemas.
- **Modular State Management:** Global state will be managed by Zustand using the "Slices Pattern" to keep stores maintainable and isolated.
- **Decoupled Web3 Logic:** Web3 hooks and Reown configuration will be centralized and abstracted away from UI components.

## 2. Recommended Directory Structure

```text
/
├── apps/
│   └── web/                    # Next.js Frontend Application
│       ├── src/
│       │   ├── app/            # Next.js App Router (Pages, Layouts, Routes)
│       │   │   ├── (auth)/     # Route groups for logical separation
│       │   │   ├── (dashboard)/
│       │   │   ├── layout.tsx  # Root layout with Providers
│       │   │   └── page.tsx    # Entry point
│       │   ├── components/     # Reusable UI Components
│       │   │   ├── ui/         # Dumb/Stateless components (e.g., shadcn/ui)
│       │   │   ├── forms/      # Form components bound to Zod
│       │   │   └── web3/       # Web3 specific components (WalletButton, etc.)
│       │   ├── config/         # Global configuration (e.g., web3.config.ts)
│       │   │   ├── web3.config.ts
│       │   │   └── site.config.ts
│       │   ├── hooks/          # Custom React Hooks (web3, ui)
│       │   │   ├── web3/
│       │   │   └── ui/
│       │   ├── lib/            # Utility functions and helpers
│       │   │   ├── utils.ts
│       │   │   └── constants.ts
│       │   ├── schemas/        # Zod validation schemas
│       │   │   └── forms.schema.ts
│       │   ├── stores/         # Zustand global state (slices pattern)
│       │   │   ├── index.ts    # Bound store (combining slices)
│       │   │   └── slices/     # Individual state slices
│       │   └── types/          # Global TypeScript type definitions
│       ├── public/             # Static assets
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── contracts/              # Hardhat Smart Contracts Development Environment
│       ├── contracts/          # Solidity source files (.sol)
│       ├── ignition/           # Hardhat Ignition deployment modules
│       ├── scripts/            # Custom automation scripts
│       ├── test/               # TypeScript integration tests
│       ├── hardhat.config.ts   # Main Hardhat configuration
│       └── package.json
├── turbo.json                  # Turborepo configuration for cached builds
├── package.json                # Root package.json (workspaces)
└── pnpm-workspace.yaml         # Workspace configuration
```

## 3. Web3 & Wallet Connect Architecture (Wagmi + Reown)

The integration of Web3 involves setting up **Reown AppKit** alongside **Wagmi** and **React Query** for seamless wallet connections and blockchain interactions.

### Centralized Configuration (`apps/web/src/config/web3.config.ts`)

Avoid scattering provider logic. Centralize the Wagmi Adapter and AppKit setup:

### Context Provider (`apps/web/src/components/providers/Web3Provider.tsx`)

Create a single provider to wrap the application in `app/layout.tsx`:

### Custom Web3 Hooks (`apps/web/src/hooks/web3/useWalletConnection.ts`)

Instead of calling Wagmi hooks directly inside UI components, abstract them into custom hooks to separate concerns and handle business logic. For example, use the updated `useAccountEffect` for handling connection callbacks gracefully without bloating your components.

## 4. State Management: Zustand Slices Pattern

For scalable state management, implement Zustand using the **Slices Pattern**. This prevents a massive, unmaintainable monolithic store file and naturally separates domains.

### Slices Setup (`apps/web/src/stores/slices/userSlice.ts`)

```typescript
import { StateCreator } from 'zustand';

export interface UserSlice {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  walletAddress: null,
  setWalletAddress: (address) => set({ walletAddress: address }),
});
```

### Bound Store (`apps/web/src/stores/index.ts`)

(example only)

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createUserSlice, type UserSlice } from './slices/userSlice';
import { createUISlice, type UISlice } from './slices/uiSlice';

type BoundStore = UserSlice & UISlice;

export const useStore = create<BoundStore>()(
  devtools((...a) => ({
    ...createUserSlice(...a),
    ...createUISlice(...a),
  })),
);
```

## 5. Form Validation & Data Integrity (Zod)

All forms and API endpoints must use **Zod** for schema declaration and validation. Combine Zod with `react-hook-form` to ensure strict type safety and optimized re-renders without reinventing the wheel.

### Zod Schema Definition (`apps/web/src/schemas/transaction.schema.ts`)

(example only)

```typescript
import { z } from 'zod';

export const transactionSchema = z.object({
  recipient: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z.number().positive('Amount must be greater than zero'),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
```

### Form Component Usage (`apps/web/src/components/forms/TransactionForm.tsx`)

(example only)

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  transactionSchema,
  type TransactionFormValues,
} from '@/schemas/transaction.schema';

export function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  const onSubmit = (data: TransactionFormValues) => {
    // Process typed, validated data seamlessly
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('recipient')} placeholder="0x..." />
      {errors.recipient && <span>{errors.recipient.message}</span>}

      <input
        type="number"
        step="0.01"
        {...register('amount', { valueAsNumber: true })}
      />
      {errors.amount && <span>{errors.amount.message}</span>}

      <button type="submit">Send</button>
    </form>
  );
}
```

## Summary

By decoupling the application into a streamlined monorepo (e.g., Turborepo) with domain-specific modules—separating the Next.js frontend from Hardhat smart contracts—and rigorously enforcing data schemas (Zod) alongside modular state (Zustand slices) and clean Web3 patterns (Reown AppKit + custom Wagmi hooks), the codebase will be significantly more maintainable, scalable, and resilient.
