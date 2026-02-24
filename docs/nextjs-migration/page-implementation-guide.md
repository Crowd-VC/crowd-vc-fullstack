# CrowdVC Page Implementation Guide

This document provides step-by-step build instructions for each of the four CrowdVC pages. Each page section covers the Next.js file location, data fetching strategy, component assembly order, and all interactive behaviors.

---

## Homepage — `/`

- **Next.js file**: `src/app/page.tsx`
- **Data fetching**: RSC (server component). The homepage is marketing content — stats like "Total Platform Funding" and "Active Pools" can be fetched server-side at build time or with ISR. No wallet-gated data. Revalidate every 60 seconds (`revalidate = 60`) to keep platform stats fresh.

### Layout components

No AppShell on this page. The homepage uses a dedicated marketing layout.

- `src/app/(marketing)/layout.tsx` — wraps homepage and any future marketing pages
- `src/components/layout/MarketingNav.tsx` — sticky navbar (not Sidebar/TopBar)
- `src/components/layout/Footer.tsx` — simple copyright/links footer

### Step-by-step build

1. **Create route group and layout**
   - Create `src/app/(marketing)/layout.tsx`.
   - Import `Syne`, `DM_Sans`, `JetBrains_Mono` from `next/font/google`, apply font CSS variables to `<html>`.
   - Add `dark` class to `<html>` to activate dark mode tokens.
   - Render `<MarketingNav />` above `{children}`, `<Footer />` below.

2. **Build `MarketingNav`** (`src/components/layout/MarketingNav.tsx`)
   - `"use client"` — needs `useEffect`/`useState` for scroll detection.
   - Track `scrolled` boolean state with a `scroll` event listener.
   - When `scrolled`, apply `backdrop-blur-lg bg-gray-950/85 border-b border-white/5` to the nav container.
   - Left: `<TrendingUp />` icon + "CrowdVC" text in Syne.
   - Center: nav links ("How It Works", "Benefits", "Safety", "FAQ") as `<a>` hash-links with smooth-scroll.
   - Right: "Launch App" glass Button (`href="/dashboard"`), "Start Investing" primary Button (`href="/pools"`).

3. **Build homepage page component** (`src/app/(marketing)/page.tsx` or `src/app/page.tsx`)
   - Mark as RSC (no `"use client"`).
   - Fetch platform-level stats: `const stats = await fetchPlatformStats()`.
   - Return a single `<main>` containing each section component in order.

4. **Build `HeroSection`** (`src/components/marketing/HeroSection.tsx`)
   - `"use client"` — needs `useEffect` to init canvas animation (dash-matrix).
   - Render animated badge: teal dot + "Decentralized Venture Funding" text.
   - `<h1 className="text-display font-display">` for the main hero title.
   - Subtitle paragraph capped at `max-w-subtitle-sm` centered.
   - Two outline Buttons: "Explore Pools" + "View Startups".
   - Fixed-position ambient glow divs (`.ambient-glow-tr`, `.ambient-glow-bl`).
   - `<canvas>` for dash-matrix background, initialized in `useEffect`.

5. **Build `HowItWorksSection`** (`src/components/marketing/HowItWorksSection.tsx`)
   - RSC.
   - 3-column grid with 16px gap, responsive to 1 column at `md:`.
   - Each phase card: large watermark number (`text-[5rem] opacity-5 font-display`), icon in a rounded square, title, description, tag badge.

6. **Build `BenefitsSection`** (`src/components/marketing/BenefitsSection.tsx`)
   - `"use client"` — mountain bar chart needs JS animation.
   - 3-column grid separated by 1px vertical dividers (use CSS `divide-x divide-white/6`).
   - Col 1: animated mountain bar chart (`<canvas>` or CSS bar animation).
   - Col 2: shield/identity icon + progress bar.
   - Col 3: dot-matrix grid of filled/empty circles.

7. **Build `MilestoneSection`** (`src/components/marketing/MilestoneSection.tsx`)
   - RSC.
   - 2-column layout: left (feature text blocks with icons), right (milestone card demo).
   - Milestone card: header with "2 of 4 Released" badge, step list (checkmark done / circle pending), amount labels, `<PoolProgressBar value={40} max={100} size="md" />`.

8. **Build `FAQSection`** (`src/components/marketing/FAQSection.tsx`)
   - `"use client"` — accordion state management.
   - White background section (`bg-gray-100 dark:bg-white`).
   - Left: contact card with email/social links.
   - Right: shadcn `<Accordion type="single" collapsible>` with 5 Q&A items.

9. **Build `CTASection`** (`src/components/marketing/CTASection.tsx`)
   - `"use client"` — canvas chart animation.
   - Gradient text headline using `.text-gradient` utility class.
   - 2-column grid: left (content + CTA button), right (glass candlestick chart with hover 3D effect).

10. **Build `Footer`** (`src/components/layout/Footer.tsx`)
    - RSC.
    - Single row: copyright text left, links right.

### Loading state

The homepage uses ISR, so there is no loading skeleton. The page is pre-rendered. If needed, individual sections can use React `<Suspense>` with a minimal height placeholder.

### Empty state

N/A — homepage content is static. If platform stats fetch fails, fall back to hard-coded placeholder numbers.

### Error boundary

Wrap the homepage `<main>` in an `error.tsx` sibling that renders a simple "Something went wrong" message with a "Refresh" link. Stats fetch errors should be caught in the server component and return `null` for the stats section.

### Key interactions requiring `use client`

- `MarketingNav`: scroll detection for glass blur effect
- `HeroSection`: canvas dash-matrix animation, smooth-scroll anchor links
- `BenefitsSection`: mountain bar chart animation
- `FAQSection`: accordion expand/collapse state
- `CTASection`: canvas chart, 3D hover perspective on candle elements

---

## Pools Browse Page — `/pools`

- **Next.js file**: `src/app/(app)/pools/page.tsx`
- **Data fetching**: RSC with `"use client"` child components for filtering/search. The initial pool list is fetched server-side (fast first paint, SEO-friendly). Client-side tab switching and search use React state with client-side filtering of the pre-fetched data. On-chain data (live contribution amounts) is fetched client-side via wagmi hooks in individual PoolCards.

### Layout components

- `src/components/layout/AppShell.tsx` — provided by `src/app/(app)/layout.tsx`
- `src/components/layout/Sidebar.tsx` — auto-included by AppShell
- `src/components/layout/TopBar.tsx` — auto-included by AppShell
- `src/components/layout/PageHeader.tsx` — page-level title + action buttons

### Step-by-step build

1. **Create app route group layout** (`src/app/(app)/layout.tsx`)
   - RSC.
   - Render `<AppShell>` wrapping `{children}`.
   - This layout applies to `/pools`, `/pools/[id]`, and `/dashboard`.

2. **Fetch initial data** in `src/app/(app)/pools/page.tsx`
   - `const pools = await fetchAllPools()` — returns `Pool[]` sorted by status (active first, then upcoming, then closed).
   - `const platformStats = await fetchPlatformStats()` — 4 KPI numbers.
   - Both are RSC fetches (no `"use client"` on the page file).
   - Pass data as props to `<PoolsBrowseClient />`.

3. **Build `PoolsBrowseClient`** (`src/app/(app)/pools/_components/PoolsBrowseClient.tsx`)
   - `"use client"`.
   - Accepts `pools: Pool[]` and `stats: PlatformStats` as props.
   - Manages `activeTab: "all" | "active" | "upcoming" | "closed"`, `searchQuery: string`, `sortOrder: string` in `useState`.
   - Derives `filteredPools` via `useMemo` from `pools`, `activeTab`, `searchQuery`, and `sortOrder`.
   - Renders all sub-sections in order (see steps 4–10).

4. **Render `<PageHeader>`**
   - `title="Investment Pools"`
   - `description="Browse curated pools of vetted startups..."`
   - `actions={<><Button variant="outline">Export Report</Button><Button>Browse Active</Button></>}`

5. **Render urgent `<Alert>`** (conditional)
   - Check if any pool has `status === "active"` and `deadline < now + 3 days`.
   - If found, render shadcn `<Alert variant="destructive">` with the pool name and a "Vote Now" Button linking to that pool's detail page.

6. **Render `<DashboardStats>`**
   - Pass the 4 platform stats: Total Platform Funding, Active Pools, Total Investors, Startups Funded.
   - Each stat needs an icon and `iconColor` (teal, blue, purple, orange respectively).

7. **Render hero `<PoolCard>`** (featured pool)
   - Pass the most urgent/featured active pool with `variant="hero"`.
   - This card renders the 2-column layout: left body + right startup list panel.
   - Right panel contains `<PitchList showRanks startups={pool.topStartups} maxItems={3} />` and a `<CountdownTimer deadline={pool.deadline} />`.

8. **Build `PoolsToolbar`** (`src/app/(app)/pools/_components/PoolsToolbar.tsx`)
   - `"use client"` (already inside PoolsBrowseClient).
   - shadcn `<Tabs>` for All / Active / Upcoming / Closed — triggers `setActiveTab`.
   - `<Input>` for search — triggers `setSearchQuery` with `onChange`.
   - shadcn `<Select>` for sort order — triggers `setSortOrder`.
   - shadcn `<ToggleGroup type="single">` for grid/list view icon toggle.

9. **Render pool grid sections** (inside PoolsBrowseClient, below toolbar)
   - **Active pools**: 3-column responsive grid of `<PoolCard variant="grid" />`. Any pool with `urgent` gets `urgent={true}` and spans full width.
   - **Upcoming pools**: 2-column grid of `<PoolCard variant="grid" />` with "Notify Me When Open" and "Preview" actions.
   - **Completed pools**: `<PoolCard variant="list" />` rendered as a vertical list.
   - Wrap each section in a `<section>` with a heading (only shown when `activeTab === "all"`).

10. **Render pagination**
    - Simple pagination row: "Showing N of M pools" text, Previous / page number / Next buttons.
    - Client state: `currentPage` with page size 9.

### Loading state

In `src/app/(app)/pools/loading.tsx`:
- Render `<PageHeader>` skeleton (2 skeleton bars).
- Render 4 `<Skeleton className="h-28 rounded-card">` for stats row.
- Render 3 `<Skeleton className="h-48 rounded-card">` in a 3-column grid for pool cards.

### Empty state

When `filteredPools.length === 0` after filtering:
- Render a centered box with a muted `<Columns3 />` icon, "No pools found" heading, and "Try adjusting your filters" subtext.
- Show a "Clear Filters" Button that resets `activeTab`, `searchQuery`, `sortOrder` to defaults.

### Error boundary

In `src/app/(app)/pools/error.tsx`:
- Render a `<Alert variant="destructive">` with "Failed to load pools" message.
- Provide a "Try again" Button that calls `reset()` from the error boundary props.

### Key interactions requiring `use client`

- `PoolsBrowseClient`: tab filtering, search, sort, view mode toggle, pagination
- `MarketingNav`: scroll detection (not on this page)
- `TopBar`: search input for global search
- `PoolCard` (hero variant): countdown timer tick (if rendered client-side)
- Any pool card with live on-chain data (contribution amounts via wagmi)

---

## Pool Detail Page — `/pools/[id]`

- **Next.js file**: `src/app/(app)/pools/[id]/page.tsx`
- **Data fetching**: RSC for static pool metadata (name, description, milestones, startup list). Client components (`"use client"`) for all on-chain real-time data: live funding amount, user's contribution balance, user's voting power, live vote counts. Split the page into a RSC shell that renders layout and passes static data, and client "islands" that handle wallet-gated or live data.

### Layout components

- `src/components/layout/AppShell.tsx` — from parent layout
- `src/components/pool/PoolHeader.tsx` — full-width hero for this pool
- `src/components/pool/PoolStatsGrid.tsx` — 4-column KPI strip
- `src/components/layout/PageHeader.tsx` replaced by a `<BreadcrumbBar />` on this page

### Step-by-step build

1. **Define route params** in `src/app/(app)/pools/[id]/page.tsx`
   - Props: `{ params: { id: string } }`.
   - Optionally `generateStaticParams()` for known pool IDs to enable SSG.

2. **Fetch pool data** (RSC)
   - `const pool = await fetchPoolById(params.id)`.
   - If `!pool`, call `notFound()` to render the 404 page.
   - Pass `pool` as props to child components.

3. **Render `<BreadcrumbBar>`** (`src/app/(app)/pools/[id]/_components/BreadcrumbBar.tsx`)
   - `"use client"` — needs WalletButton.
   - Left: shadcn `<Breadcrumb>` — "Investment Pools" link + separator + current pool name.
   - Right: `<WalletButton>` (connected shows address chip, disconnected shows connect prompt).

4. **Render `<PoolHeader pool={pool} />`**
   - RSC-safe (pure display component).
   - Full-width 2-column hero: badges cluster + title + description | 2×2 stat grid.

5. **Render `<CountdownSection>`** (`src/app/(app)/pools/[id]/_components/CountdownSection.tsx`)
   - `"use client"` — countdown ticks every second via `setInterval` in `useEffect`.
   - Left: countdown units (Days : Hours : Min : Sec) with pulsing colon.
   - Right: key dates list (Open Date, Close Date, Distribution Date) as key-value pairs.
   - Container: accent left border, `bg-teal-50` (dark: `bg-teal-50/[0.05]`).

6. **Render `<PoolStatsGrid>`**
   - Pass 4 KPI stats derived from pool data: Total Goal, Funding Raised, Participants, Days Left.
   - Pure display RSC-safe component.

7. **Render dual-column zone** (large `<div className="grid grid-cols-[340px_1fr] gap-0">`)

   **Left panel** (sticky, `position: sticky, top: 64px`):

   7a. **`<ContributionPanel>`** (`src/app/(app)/pools/[id]/_components/ContributionPanel.tsx`)
   - `"use client"` — wallet interaction, tx state.
   - Shows pool funding progress via `<PoolProgressBar>`.
   - Amount input (shadcn `<Input>`) for contribution.
   - "Contribute" Button — on click calls wagmi write hook, shows `<TxStatusBadge>`.
   - Reads user's current contribution balance via wagmi read hook.

   7b. **`<VotingPanel>`** (`src/app/(app)/pools/[id]/_components/VotingPanel.tsx`)
   - `"use client"` — reads user's voting power from contract.
   - Shows total voting power and how many have been allocated.
   - Lists current user's vote allocations per startup as `<VotingBar>` items.

   7c. **`<MilestonesPanel>`** — static from pool data
   - RSC-safe.
   - Timeline list: milestone name, amount, status indicator (checkmark or circle icon), due date.

   **Right content** (scrollable main):

   7d. **`<StartupGrid>`** (`src/app/(app)/pools/[id]/_components/StartupGrid.tsx`)
   - `"use client"` — contains VoteButton which needs wallet.
   - Maps `pool.startups` to `<PitchDetailPanel>` components.
   - 2-column grid responsive to 1-column at `lg:`.
   - Each `<PitchDetailPanel>` receives an `onVote` handler that calls the voting contract.

   7e. **`<MilestonesDetail>`** — detailed milestone breakdown
   - RSC-safe.
   - Section heading + expandable list of milestones with status, amount, description.

   7f. **`<ContributionTable>`**
   - `"use client"` — fetches contributors from contract or API.
   - Wrapped in `<Suspense fallback={<Skeleton />}>`.

### Loading state

In `src/app/(app)/pools/[id]/loading.tsx`:
- Skeleton breadcrumb bar (1 skeleton bar, full width).
- Skeleton pool header: 2-column grid with text skeletons left, 4 boxes right.
- Skeleton KPI strip: 4 equal skeleton bars in a row.
- Skeleton dual-column: left panel (3 stacked skeleton cards), right (2-column grid of 4 skeleton cards).

### Empty state

If `pool.startups.length === 0`:
- In the StartupGrid area, render a muted message: "No startups have been assigned to this pool yet."

If `contributions` fetch returns empty:
- In ContributionTable, show "No contributions yet. Be the first to contribute."

### Error boundary

In `src/app/(app)/pools/[id]/error.tsx`:
- Render an `<Alert variant="destructive">` with "Failed to load pool details".
- Show the pool ID for debugging.
- "Go Back" Button using `router.back()` from `useRouter`.

### Key interactions requiring `use client`

- `BreadcrumbBar`: WalletButton state
- `CountdownSection`: `setInterval` tick
- `ContributionPanel`: wagmi `useWriteContract`, `useReadContract`, `useAccount`
- `VotingPanel`: wagmi `useReadContract` for voting power
- `StartupGrid`: VoteButton expand/collapse, wagmi write for voting
- `ContributionTable`: wagmi or API fetch for contributor list

---

## Dashboard Page — `/dashboard`

- **Next.js file**: `src/app/(app)/dashboard/page.tsx`
- **Data fetching**: Mixed. Platform-level stats and featured pitches are RSC (fast paint, server-rendered). User-specific data (portfolio cards, personal activity) are client components that fetch after wallet connection is detected. The page is accessible without a connected wallet — user-specific sections show a "Connect wallet to see your portfolio" prompt when disconnected.

### Layout components

- `src/components/layout/AppShell.tsx` — from parent layout
- `src/components/layout/PageHeader.tsx` — welcome section (title + quick actions)
- `src/components/dashboard/DashboardStats.tsx` — 4-column stat row
- `src/components/dashboard/ActivityFeed.tsx` — right column feed
- `src/components/dashboard/QuickActions.tsx` — welcome section buttons

### Step-by-step build

1. **Fetch server-side data** in `src/app/(app)/dashboard/page.tsx`
   - `const platformStats = await fetchPlatformStats()` — 4 KPI values.
   - `const featuredPitches = await fetchFeaturedPitches({ limit: 3 })` — bento cards.
   - `const activePools = await fetchPools({ status: "active", limit: 5 })` — carousel pools.
   - `const recentActivity = await fetchRecentActivity({ limit: 10 })` — global activity.
   - Pass all as props to `<DashboardClient />`.

2. **Build `DashboardClient`** (`src/app/(app)/dashboard/_components/DashboardClient.tsx`)
   - `"use client"`.
   - Accepts all server-fetched data as props.
   - Reads wallet connection state via `useAccount()` wagmi hook.
   - Conditionally renders user-specific sections based on `isConnected`.

3. **Render welcome section** (inside DashboardClient)
   - `<PageHeader title={<>Welcome back, <span className="text-teal-500">{userName}</span></>} />`
   - When not connected: generic "Welcome to CrowdVC" title.
   - `<QuickActions actions={[{ label: "Explore Pools", href: "/pools", variant: "primary" }, { label: "Submit Pitch", onClick: openPitchModal, variant: "glass" }]} />`

4. **Render `<DashboardStats>`**
   - Total Platform Funding (teal `DollarSign` icon), Active Pools (blue `BarChart3` icon), Total Investors (purple `Users` icon), Startups Funded (orange `CheckCircle` icon).
   - Pass `isLoading={false}` since data is pre-fetched server-side.

5. **Build `FeaturedPitchesSection`** (`src/app/(app)/dashboard/_components/FeaturedPitchesSection.tsx`)
   - RSC-safe (pure display).
   - CSS Grid: `grid-cols-[1.3fr_1fr_1fr]`, responsive to `grid-cols-1` at `lg:`.
   - First `<PitchCard variant="bento" badge="featured">` spans a slightly wider column.
   - Second and third cards: `<PitchCard variant="bento" badge="trending">`.
   - Each card shows: badge, title, short description, stats (countdown, funding %, backers count), `<PoolProgressBar>` at bottom.

6. **Render middle row** (2-column: pools carousel + activity feed)

   6a. **`<PoolsCarousel>`** (`src/app/(app)/dashboard/_components/PoolsCarousel.tsx`)
   - `"use client"` — uses `<ScrollArea>` for horizontal scroll.
   - Heading: "Active Pools" with a right-aligned "View All" link to `/pools`.
   - `<ScrollArea orientation="horizontal">` wrapping a horizontal flex of `<PoolCard variant="carousel">` at 260px fixed width.
   - Each card shows status color bar at top, tags, title, description, progress bar, stats grid (Deadline, Startups, Votes).

   6b. **`<ActivityFeed events={recentActivity} />`**
   - Client component wrapped in the parent DashboardClient.
   - 380px fixed width, fixed right column.
   - Heading: "Recent Activity" with `<BarChart3>` icon.
   - `<ScrollArea className="max-h-[400px]">` wrapping the event list.

7. **Render portfolio section** (conditional on wallet connection)
   - If not connected: render a glass card with "Connect your wallet to view your portfolio" and a `<WalletButton>`.
   - If connected: `<PortfolioSection address={account.address} />`.

8. **Build `PortfolioSection`** (`src/app/(app)/dashboard/_components/PortfolioSection.tsx`)
   - `"use client"`.
   - `useEffect` on `address` to fetch user's portfolio from contract or API.
   - Loading: show `<DashboardStats isLoading />` skeleton style.
   - 3-column grid responsive to 2→1.
   - Each portfolio card: Avatar + startup name + pool name + `<PoolStatusBadge>` + stats row (contribution amount, share %, votes) + `<PoolProgressBar size="sm">`.

9. **Render industry carousels** (horizontal scroll sections per category)
   - RSC-safe.
   - Multiple `<ScrollArea orientation="horizontal">` sections, one per startup category (HealthTech, EdTech, FinTech, etc.).
   - Each section: category heading + horizontal scroll of `<PitchCard variant="featured">` cards.
   - Cards: image with gradient overlay, startup name, status badge, description, backers + days left.

### Loading state

In `src/app/(app)/dashboard/loading.tsx`:
- Welcome section: 2 skeleton bars (title + subtitle).
- Stats row: 4 equal skeleton cards.
- Featured bento: 3 skeleton cards in a `1.3fr 1fr 1fr` grid, each 280px tall.
- Middle row: left skeleton 1fr, right skeleton 380px.
- Portfolio section: 3 skeleton cards in a 3-column grid.

### Empty state

- **Portfolio (connected but no contributions)**: "You haven't invested in any pools yet." + "Explore Pools" Button.
- **Activity feed (no activity)**: "No recent activity. Start by exploring pools." with a subtle icon.
- **Industry carousels (no startups in category)**: Omit the section entirely if the startup array is empty.

### Error boundary

In `src/app/(app)/dashboard/error.tsx`:
- Show an `<Alert variant="destructive">` with "Failed to load dashboard data".
- Provide a "Try again" Button calling `reset()`.
- The page should degrade gracefully — platform stats failure should not prevent the portfolio section from loading (they are independent fetches in separate components).

### Key interactions requiring `use client`

- `DashboardClient`: `useAccount` for wallet connection state, conditional rendering
- `PortfolioSection`: `useEffect` for portfolio fetch, `useAccount`
- `PoolsCarousel`: `<ScrollArea>` horizontal scroll
- `ActivityFeed`: `<ScrollArea>` vertical scroll
- `QuickActions`: "Submit Pitch" opens a modal (`useDisclosure` or Dialog state)
- `TopBar` (inside AppShell): search, wallet button, notification badge

---

## Shared Implementation Notes

### AppShell and route group layout

Create `src/app/(app)/layout.tsx` as the shared layout for all three app pages:

```typescript
// src/app/(app)/layout.tsx
import { AppShell } from "@/components/layout/AppShell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
```

### Font setup (root layout)

In `src/app/layout.tsx`:

```typescript
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google"

const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["400","500","600","700","800"], display: "swap" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["300","400","500","600","700"], display: "swap" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500"], display: "swap" })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Wagmi provider setup

Wrap the root layout body in a `<WagmiProvider>` and `<QueryClientProvider>`. Create `src/providers/Web3Provider.tsx` as a `"use client"` component:

```typescript
// src/providers/Web3Provider.tsx
"use client"
import { WagmiProvider, createConfig } from "wagmi"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const queryClient = new QueryClient()
// Configure wagmi chains and connectors...

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

Import and render `<Web3Provider>` in `src/app/layout.tsx` wrapping the body.

### Data fetching conventions

- **Server fetches**: Plain `async` functions in `src/lib/api/` that call the backend API or read from a subgraph.
- **Client on-chain reads**: Use `useReadContract` from wagmi for live contract state.
- **Client on-chain writes**: Use `useWriteContract` from wagmi, track `isPending` / `isSuccess` / `isError` to update `TxStatusBadge`.

### Ambient glow backgrounds

Add to `AppShell` and the marketing layout:

```tsx
<div className="ambient-glow ambient-glow-tr" aria-hidden />
<div className="ambient-glow ambient-glow-bl" aria-hidden />
```

These are `position: fixed`, `pointer-events: none`, `z-index: 0` as defined in `globals.css`.

### Animation convention

All page content sections should enter with the `animate-fade-up` class. Use `.delay-1` through `.delay-5` on staggered children for cascading entrance effects. Apply via Tailwind utilities: `className="animate-fade-up delay-2"`.

---

## Page Component Import Summary

| Component | Import Path |
|-----------|-------------|
| `AppShell` | `@/components/layout/AppShell` |
| `Sidebar` | `@/components/layout/Sidebar` |
| `TopBar` | `@/components/layout/TopBar` |
| `PageHeader` | `@/components/layout/PageHeader` |
| `MobileNav` | `@/components/layout/MobileNav` |
| `WalletButton` | `@/components/web3/WalletButton` |
| `TxStatusBadge` | `@/components/web3/TxStatusBadge` |
| `AddressDisplay` | `@/components/web3/AddressDisplay` |
| `TokenAmount` | `@/components/web3/TokenAmount` |
| `NetworkBadge` | `@/components/web3/NetworkBadge` |
| `PoolCard` | `@/components/pool/PoolCard` |
| `PoolHeader` | `@/components/pool/PoolHeader` |
| `PoolStatsGrid` | `@/components/pool/PoolStatsGrid` |
| `PoolProgressBar` | `@/components/pool/PoolProgressBar` |
| `PoolStatusBadge` | `@/components/pool/PoolStatusBadge` |
| `PitchCard` | `@/components/pitch/PitchCard` |
| `PitchList` | `@/components/pitch/PitchList` |
| `PitchDetailPanel` | `@/components/pitch/PitchDetailPanel` |
| `ContributionRow` | `@/components/contribution/ContributionRow` |
| `ContributionTable` | `@/components/contribution/ContributionTable` |
| `VotingBar` | `@/components/voting/VotingBar` |
| `VoteButton` | `@/components/voting/VoteButton` |
| `VoteResults` | `@/components/voting/VoteResults` |
| `DashboardStats` | `@/components/dashboard/DashboardStats` |
| `ActivityFeed` | `@/components/dashboard/ActivityFeed` |
| `QuickActions` | `@/components/dashboard/QuickActions` |
