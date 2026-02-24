# CrowdVC Component Build Prompt

Next.js project is already initialized with TypeScript, Tailwind CSS, and shadcn/ui configured. `globals.css` and `tailwind.config.ts` already contain all design tokens. Build all components below in order.

---

### 1. Directory Structure

```
packages/ui/src/
├── components/                    # shadcn auto-generated (do not hand-edit)
│   └── button, badge, card, progress, tabs, input, select, separator,
│       avatar, tooltip, dialog, accordion, alert, skeleton, breadcrumb,
│       toggle-group, scroll-area, sheet, dropdown-menu, sonner
│
├── primitives/            # atomic custom wrappers (no domain logic)
│
├── features/
│   ├── pool/              PoolCard, PoolHeader, PoolStatsGrid, PoolProgressBar, PoolStatusBadge
│   ├── pitch/             PitchCard, PitchList, PitchDetailPanel
│   ├── wallet/            WalletButton, TxStatusBadge, AddressDisplay, TokenAmount, NetworkBadge
│   ├── contribution/      ContributionRow, ContributionTable
│   ├── voting/            VotingBar, VoteButton, VoteResults
│   └── dashboard/         DashboardStats, ActivityFeed, QuickActions
│
└── layouts/               AppShell, Sidebar, TopBar, PageHeader, MobileNav
```

> Spec uses flat paths like `src/components/pool/`, `src/components/web3/` — use whichever convention your project already has.

---

### 2. shadcn Installs

```bash
npx shadcn@latest add button badge card progress tabs input select separator avatar tooltip dialog accordion alert skeleton breadcrumb toggle-group scroll-area sheet dropdown-menu sonner
```

---

### 3. Storybook Setup

```bash
npx storybook@latest init
```

`.storybook/preview.ts`:

```typescript
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#0A0A0A" }] },
  },
};

export default preview;
```

---

### 4. Build Order

1. TokenAmount — `src/components/web3/TokenAmount.tsx` — formats monetary/token amounts with compact or full notation.
2. AddressDisplay — `src/components/web3/AddressDisplay.tsx` — truncates Ethereum addresses with tooltip and optional copy.
3. TxStatusBadge — `src/components/web3/TxStatusBadge.tsx` — color-coded badge for pending/confirmed/failed tx state.
4. NetworkBadge — `src/components/web3/NetworkBadge.tsx` — pill showing EVM chain name with branded color accent.
5. WalletButton — `src/components/web3/WalletButton.tsx` — connect/disconnect wallet pill with address display and dropdown.
6. VotingBar — `src/components/voting/VotingBar.tsx` — teal gradient bar showing a startup's share of total votes.
7. VoteButton — `src/components/voting/VoteButton.tsx` — stepper widget to allocate and submit votes on-chain.
8. VoteResults — `src/components/voting/VoteResults.tsx` — ranked leaderboard list of startups sorted by vote count.
9. PoolStatusBadge — `src/components/pool/PoolStatusBadge.tsx` — pulsing pill encoding active/upcoming/closed/urgent state.
10. PoolProgressBar — `src/components/pool/PoolProgressBar.tsx` — animated teal gradient progress bar for funding progress.
11. PoolStatsGrid — `src/components/pool/PoolStatsGrid.tsx` — 4-column KPI strip with grid-line gap effect.
12. PoolHeader — `src/components/pool/PoolHeader.tsx` — full-width 2-column pool detail hero with badge cluster and stat grid.
13. PoolCard — `src/components/pool/PoolCard.tsx` — multi-variant dark glass card for pool listings.
14. PitchList — `src/components/pitch/PitchList.tsx` — compact ranked list of startups with vote share bars.
15. PitchCard — `src/components/pitch/PitchCard.tsx` — multi-variant startup card (grid, bento, featured).
16. PitchDetailPanel — `src/components/pitch/PitchDetailPanel.tsx` — expanded startup card with voting and milestones.
17. ContributionRow — `src/components/contribution/ContributionRow.tsx` — single table row showing contributor, amount, voting power, timestamp.
18. ContributionTable — `src/components/contribution/ContributionTable.tsx` — labeled table of ContributionRows with loading/empty states.
19. DashboardStats — `src/components/dashboard/DashboardStats.tsx` — 4-column stat card grid with icons and trend indicators.
20. ActivityFeed — `src/components/dashboard/ActivityFeed.tsx` — scrollable live event feed with colored type icons.
21. QuickActions — `src/components/dashboard/QuickActions.tsx` — horizontal row of primary/glass action buttons.
22. PageHeader — `src/components/layout/PageHeader.tsx` — page-level title, description, and right-side action slot.
23. MobileNav — `src/components/layout/MobileNav.tsx` — Sheet drawer replacing Sidebar on mobile.
24. Sidebar — `src/components/layout/Sidebar.tsx` — fixed 72px icon-only nav rail with tooltips and active state.
25. TopBar — `src/components/layout/TopBar.tsx` — fixed 64px bar with search, network badge, wallet button, user avatar.
26. AppShell — `src/components/layout/AppShell.tsx` — root layout composing Sidebar + TopBar + scrollable main content.

---

### 5. Per-Component Spec

## TokenAmount
File: `src/components/web3/TokenAmount.tsx`
Props:
```typescript
interface TokenAmountProps {
  amount: number;
  symbol?: string;           // e.g. "ETH", "USDC"; omit for USD
  decimals?: number;         // token decimals, default 18
  displayDecimals?: number;  // decimal places shown, default 2
  format?: "compact" | "full"; // compact: $1.2M, full: $1,230,000
  size?: "sm" | "md" | "lg";
  className?: string;
}
```
Description: Renders a formatted amount. `compact` uses K/M/B suffixes; `full` uses locale comma separators. `sm` — body text, muted grey. `md` — 1.4rem Syne font. `lg` — 1.6–2rem Syne 800, teal accent color. No interactivity.

## AddressDisplay
File: `src/components/web3/AddressDisplay.tsx`
Props:
```typescript
interface AddressDisplayProps {
  address: string;           // full 0x... address
  truncate?: boolean;        // default true — first 6 + last 4 chars
  mono?: boolean;            // default true — JetBrains Mono font
  copyable?: boolean;        // default false — clipboard icon on hover
  className?: string;
}
```
Description: Shows `0x7f3a...e2c1`. When `truncate` is true, wraps in shadcn Tooltip showing the full address on hover. When `copyable` is true, a clipboard icon appears on hover; clicking copies the full address and briefly shows "Copied!" tooltip. Default color is muted grey.

## TxStatusBadge
File: `src/components/web3/TxStatusBadge.tsx`
Props:
```typescript
type TxStatus = "pending" | "confirmed" | "failed" | "idle";

interface TxStatusBadgeProps {
  status: TxStatus;
  txHash?: string;           // if provided, badge links to block explorer
  label?: string;            // override default status label
  className?: string;
}
```
Description: Pill badge color-coding transaction state. `pending` — amber background, spinning loader icon. `confirmed` — green, checkmark icon. `failed` — red, X icon. `idle` — transparent muted grey. When `txHash` is provided, wraps in `<a target="_blank">` to block explorer.

## NetworkBadge
File: `src/components/web3/NetworkBadge.tsx`
Props:
```typescript
interface NetworkBadgeProps {
  chainId: number;
  chainName: string;         // e.g. "Ethereum", "Arbitrum"
  showIcon?: boolean;        // default true
  className?: string;
}
```
Description: Semi-transparent dark glass pill showing chain name. Left border accent color matches chain brand (purple for Ethereum chain ID 1, blue for Arbitrum chain ID 42161, etc.; fall back to teal for unknown chains). Small chain icon left of the text when `showIcon` is true.

## WalletButton
File: `src/components/web3/WalletButton.tsx`
Props:
```typescript
interface WalletButtonProps {
  address?: string;          // undefined = not connected
  isConnecting?: boolean;
  chainName?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}
```
Description: Disconnected — glass pill with wallet icon and "Connect Wallet" text, calls `onConnect` on click. Connecting — shows spinner. Connected — green status dot, truncated address via AddressDisplay, chain name in muted small text; clicking opens a shadcn DropdownMenu with "Copy Address", "View on Explorer", "Disconnect" items. Hover brightens the glass fill slightly.

## VotingBar
File: `src/components/voting/VotingBar.tsx`
Props:
```typescript
interface VotingBarProps {
  votes: number;
  totalVotes: number;
  label?: boolean;           // default true — show "X votes (Y%)" text
  size?: "sm" | "md";       // sm: 4px height, md: 6px height
  className?: string;
}
```
Description: Derives percentage as `(votes / totalVotes) * 100`. Track is dark (`rgba(255,255,255,.06)`), fill is teal gradient (`#14B8A6` → `#0FD9C4`). Animates to target value on mount. Shows raw vote count and percentage when `label` is true.

## VoteButton
File: `src/components/voting/VoteButton.tsx`
Props:
```typescript
interface VoteButtonProps {
  startupId: string;
  startupName: string;
  availableVotes: number;    // user's remaining voting power
  currentAllocation: number; // votes already assigned here
  onVote: (startupId: string, voteCount: number) => Promise<void>;
  disabled?: boolean;
  className?: string;
}
```
Description: Compact state — glass pill with thumbs-up icon, "Vote" label, badge showing current allocation. On click, expands inline (or popover) with a minus/count/plus stepper capped at `availableVotes`. "Confirm" triggers `onVote`; during the call the button shows TxStatusBadge `pending` and is disabled. On success, collapses back with updated badge. On error, shows red error text below.

## VoteResults
File: `src/components/voting/VoteResults.tsx`
Props:
```typescript
interface VoteResultEntry {
  startupId: string;
  startupName: string;
  votes: number;
  avatarGradient?: string;
}

interface VoteResultsProps {
  results: VoteResultEntry[];
  totalVotes: number;
  showTopN?: number;         // default: all; set 3 for compact view
  className?: string;
}
```
Description: Ranked list sorted by vote count descending. Each row: rank number, avatar circle, startup name, VotingBar, raw vote count. Top entry gets subtle teal highlighted border. When `showTopN` is set, only that many entries are shown with a "Show all" text link beneath.

## PoolStatusBadge
File: `src/components/pool/PoolStatusBadge.tsx`
Props:
```typescript
type PoolStatus = "active" | "upcoming" | "closed" | "urgent";

interface PoolStatusBadgeProps {
  status: PoolStatus;
  pulse?: boolean;           // default true for "active" and "urgent"
  label?: string;
  className?: string;
}
```
Description: `active` — teal fill, pulsing green dot via `animate-pulse`. `upcoming` — blue/12 background, blue text, blue/20 border. `closed` — grey fill, muted text. `urgent` — red fill, pulsing red dot. Padding 4px vertical, 10px horizontal.

## PoolProgressBar
File: `src/components/pool/PoolProgressBar.tsx`
Props:
```typescript
interface PoolProgressBarProps {
  value: number;             // raised amount
  max: number;               // funding goal
  showLabel?: boolean;       // default true — shows "X% funded"
  showAmounts?: boolean;     // default false — shows "raised / goal"
  size?: "sm" | "md" | "lg"; // bar height: 2px / 4px / 8px
  animate?: boolean;         // default true — animates fill on mount
  className?: string;
}
```
Description: Wraps shadcn Progress. Teal gradient fill (`#14B8A6` → `#0FD9C4`) via `[&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-teal-400`. Dark track `rgba(255,255,255,.06)`. `animate` — fills 0→target over 1s cubic-bezier on mount. `showLabel` — percentage right of bar. `showAmounts` — "raised / goal" below.

## PoolStatsGrid
File: `src/components/pool/PoolStatsGrid.tsx`
Props:
```typescript
interface StatItem {
  label: string;
  value: string | number;
  accentColor?: string;      // CSS color for value text
  progressValue?: number;    // 0–100, renders 3px accent bar at bottom
}

interface PoolStatsGridProps {
  stats: StatItem[];         // exactly 4 items
  gap?: boolean;             // default true — 1px gap between cells
  className?: string;
}
```
Description: Full-width 4-column grid used as the KPI strip below the pool hero. Cells have no card background — 1px gap reveals the page background creating a grid-line effect. Each cell: small-caps muted label at top, large display number in 1.4–1.6rem Syne 800, optional 3px accent gradient bar at cell bottom. No hover effects.

## PoolHeader
File: `src/components/pool/PoolHeader.tsx`
Props:
```typescript
interface PoolHeaderProps {
  pool: {
    id: string;
    name: string;
    description: string;
    category: string;
    status: "active" | "upcoming" | "closed";
    fundingGoal: number;
    fundingRaised: number;
    startupCount: number;
    voteCount: number;
    deadline: Date;
    openDate: Date;
    closeDate: Date;
  };
  className?: string;
}
```
Description: `lg:grid-cols-2`. Left: PoolStatusBadge + category badge + outline badge cluster, Syne 800 40px title, description capped at `max-w-[560px]`. Right: 2×2 stat grid (Total Goal, Raised, Remaining, Contributors) with small-caps labels and large Syne numbers. Stacks single column below 1024px.

## PoolCard
File: `src/components/pool/PoolCard.tsx`
Props:
```typescript
interface PoolCardProps {
  pool: {
    id: string;
    name: string;
    description: string;
    category: string;
    status: "active" | "upcoming" | "closed";
    fundingGoal: number;
    fundingRaised: number;
    deadline: Date;
    startupCount: number;
    voteCount: number;
    startupsAvatars?: string[];
  };
  variant?: "grid" | "carousel" | "hero" | "list";
  urgent?: boolean;
  className?: string;
  onClick?: () => void;
}
```
Description: `bg-[#161616] border border-white/[.06] rounded-2xl`. Hover: `translateY(-2px)`, border → `accent/20`. `grid` — vertical: status badge, Syne title, 2-line description, PoolProgressBar, meta row. `carousel` — 260px fixed, colored status bar top, progress bar, stats grid. `hero` — 2-column: left body + right panel (PitchList + countdown). `list` — horizontal: name, badges, PoolProgressBar, percentage.

## PitchList
File: `src/components/pitch/PitchList.tsx`
Props:
```typescript
interface PitchListProps {
  startups: Array<{
    id: string;
    name: string;
    votes: number;
    totalVotes: number;
    rank?: number;
    avatarGradient?: string;
  }>;
  maxItems?: number;
  showRanks?: boolean;       // default true
  className?: string;
}
```
Description: Vertically stacked list of startup rows. Each row (10px vertical padding): rank number in muted small text (if `showRanks`), 28px avatar circle with gradient fallback, startup name, VotingBar filling remaining width. Thin bottom border on all but last item. No hover behavior. Used in pool hero card right panel and pool detail sidebar.

## PitchCard
File: `src/components/pitch/PitchCard.tsx`
Props:
```typescript
interface PitchCardProps {
  startup: {
    id: string;
    name: string;
    description: string;
    status: "approved" | "pending" | "in-pool" | "funded";
    votes: number;
    totalVotes: number;
    image?: string;
    avatarGradient?: string;
    poolName?: string;
    backers?: number;
    daysLeft?: number;
    fundingPercent?: number;
  };
  variant?: "grid" | "bento" | "featured";
  badge?: "featured" | "trending";
  className?: string;
  onClick?: () => void;
}
```
Description: `grid` — avatar circle, startup name, pool name (muted), status badge, VotingBar, 2-line description. `bento` — tall card with full-bleed background image (or CSS gradient), dark-to-transparent gradient overlay from bottom, content (badge, title, description, stats) anchored bottom-left. `featured` — like bento but taller with colored dot badge top-left. All variants lift on hover and scale background image to 1.05.

## PitchDetailPanel
File: `src/components/pitch/PitchDetailPanel.tsx`
Props:
```typescript
interface PitchDetailPanelProps {
  startup: {
    id: string;
    name: string;
    description: string;
    status: "approved" | "pending" | "in-pool" | "funded";
    votes: number;
    totalVotes: number;
    avatarGradient?: string;
    poolName: string;
    milestones: Array<{
      id: string;
      name: string;
      amount: number;
      status: "pending" | "in-review" | "approved" | "completed";
    }>;
    metrics: {
      fundingGoal: number;
      fundingRaised: number;
      backers: number;
    };
  };
  onVote?: (startupId: string, voteCount: number) => void;
  userVotingPower?: number;
  className?: string;
}
```
Description: Full-width card for pool detail startup grid. Header: 48px avatar, Syne bold name, muted pool name, status badge. Description paragraph. VotingBar below. VoteButton renders when `onVote` provided and `userVotingPower > 0`. Milestones at bottom: mini timeline with step indicators (checkmark done / circle pending).

## ContributionRow
File: `src/components/contribution/ContributionRow.tsx`
Props:
```typescript
interface ContributionRowProps {
  contribution: {
    id: string;
    contributorAddress: string;
    amount: number;
    votingPower: number;
    timestamp: Date;
    poolName?: string;
  };
  showPool?: boolean;        // default false
  className?: string;
}
```
Description: Horizontal flex table row. Left: 28px Avatar with gradient fallback + AddressDisplay (truncated). Middle: TokenAmount formatted amount, votingPower number, relative timestamp ("3 hrs ago"). Optional pool name badge when `showPool` is true. Bottom border `rgba(255,255,255,.04)`, hover background `rgba(255,255,255,.02)`.

## ContributionTable
File: `src/components/contribution/ContributionTable.tsx`
Props:
```typescript
interface ContributionTableProps {
  contributions: Array<{
    id: string;
    contributorAddress: string;
    amount: number;
    votingPower: number;
    timestamp: Date;
    poolName?: string;
  }>;
  showPool?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}
```
Description: Header row with small-caps column labels in muted grey (Contributor, Amount, Voting Power, Time, optional Pool) and bottom border. Renders ContributionRows below. When `isLoading` is true, renders 5 Skeleton rows. When empty, renders centered `emptyMessage` in muted text.

## DashboardStats
File: `src/components/dashboard/DashboardStats.tsx`
Props:
```typescript
interface StatCardData {
  label: string;
  value: string | number;
  trend?: number;            // % change; positive = green up-arrow, negative = red down-arrow
  icon: React.ReactNode;
  iconColor?: string;        // CSS color for icon circle background
}

interface DashboardStatsProps {
  stats: StatCardData[];     // exactly 4 items
  isLoading?: boolean;
  className?: string;
}
```
Description: 4-column responsive grid (2-col at 1024px, 1-col at 640px). Each card: colored icon circle top-right, large Syne 800 display number, label text below. When `trend` is provided: small up/down arrow icon + percentage in green or red. Dark glass card background. When `isLoading`, renders 4 Skeleton cards.

## ActivityFeed
File: `src/components/dashboard/ActivityFeed.tsx`
Props:
```typescript
interface ActivityFeedProps {
  events: Array<{
    id: string;
    type: "fund" | "vote" | "pitch" | "milestone" | "join";
    actor: string;           // wallet address or display name
    targetPool?: string;
    targetStartup?: string;
    metadata: {
      amount?: number;
      votes?: number;
      milestoneId?: string;
    };
    timestamp: Date;
  }>;
  maxItems?: number;         // default 10
  isLoading?: boolean;
  className?: string;
}
```
Description: ScrollArea (max-h-[400px]) list. Each item: colored icon circle left (teal=fund, purple=vote, orange=pitch, blue=milestone, green=join), natural-language description with AddressDisplay actor, relative timestamp far right in muted text. 1px border between items. Skeleton rows when `isLoading`.

## QuickActions
File: `src/components/dashboard/QuickActions.tsx`
Props:
```typescript
interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;             // Next.js route
  onClick?: () => void;      // for modal-opening actions
  variant?: "primary" | "glass";
}

interface QuickActionsProps {
  actions: QuickAction[];
  heading?: string;
  className?: string;
}
```
Description: Horizontal flex row of buttons. `primary` variant uses teal accent Button. `glass` variant uses `bg-white/[.06] border border-white/10 backdrop-blur-sm` Button. Each button shows icon + label. `href` items wrapped in Next.js `<Link>`. `onClick` items trigger the handler directly.

## PageHeader
File: `src/components/layout/PageHeader.tsx`
Props:
```typescript
interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode; // right-side action buttons slot
  className?: string;
}
```
Description: Horizontal flex section at the top of page content. Left: title in `clamp(2rem, 4vw, 3.2rem)` Syne 700; optional description in body text below. Right: `actions` slot. 32px vertical padding. Not sticky — scrolls with page content.

## MobileNav
File: `src/components/layout/MobileNav.tsx`
Props:
```typescript
interface MobileNavProps {
  navItems: SidebarNavItem[];
  bottomItems?: SidebarNavItem[];
  currentPath: string;
  trigger?: React.ReactNode; // custom trigger (hamburger icon)
}
```
Description: shadcn Sheet sliding from the left. Trigger is a hamburger icon shown in TopBar on viewports below 768px. Sheet background `#111111`. Inside: same logo, nav items, and bottom items as Sidebar but displayed with icon + label side by side (not icon-only). Active item has teal left border accent and teal text. Closes on nav item tap.

## Sidebar
File: `src/components/layout/Sidebar.tsx`
Props:
```typescript
interface SidebarNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  navItems: SidebarNavItem[];
  bottomItems?: SidebarNavItem[];
  currentPath: string;
}
```
Description: Fixed left nav rail, 72px wide, full viewport height. Background `#111111`. Top: 40px teal gradient square logo mark. Below: vertical stack of 44px icon-only nav buttons; active item gets teal accent left border and teal icon; inactive items grey icons. Each item wrapped in shadcn Tooltip showing label on hover. Bottom: Separator, settings gear, user Avatar. Right border `rgba(255,255,255,.06)`.

## TopBar
File: `src/components/layout/TopBar.tsx`
Props:
```typescript
interface TopBarProps {
  showSearch?: boolean;      // default true
  title?: string;            // center text, default "Crowd VC"
  onSearch?: (query: string) => void;
}
```
Description: Fixed bar, 64px tall, `left-[72px]`. Background `#111111`, thin bottom border. Left: glass search input (280px / 160px mobile), debounced `onSearch`. Center: "Crowd VC" Syne 600. Right: notification bell (accent dot for unreads), NetworkBadge, WalletButton, Avatar with DropdownMenu. Hamburger icon shown on mobile below 768px.

## AppShell
File: `src/components/layout/AppShell.tsx`
Props:
```typescript
interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;     // default true
  showTopbar?: boolean;      // default true
}
```
Description: Root layout wrapper for all authenticated pages. Renders fixed 72px Sidebar on left, fixed 64px TopBar at top (left-offset by sidebar width), and scrollable main content with `pl-[72px] pt-[64px]`. On screens below 768px, Sidebar is hidden and MobileNav Sheet is used instead. Background `#0A0A0A`. Includes ambient glow divs (`aria-hidden`, `pointer-events-none`, `fixed`, `z-0`) for the teal radial gradient backgrounds (`.ambient-glow-tr` and `.ambient-glow-bl`).
