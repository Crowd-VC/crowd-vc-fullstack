# CrowdVC Component Library Specification

This document defines all UI components needed to implement the CrowdVC Next.js application. Components are organized into two sections: shadcn/ui components to install and custom components to build.

---

## Section 1 — shadcn/ui Components to Install

### 1. Button

```bash
npx shadcn@latest add button
```

**Used on**: All pages — every primary action, secondary action, glass action, and danger action.

**Variants needed**:
- `default` — teal/accent fill, black text (primary CTA)
- `outline` — transparent background, white border (homepage hero CTAs)
- `ghost` — transparent background, white text (icon buttons, nav items)
- `destructive` — red background (closing pool alerts, danger actions)
- `secondary` — glass style (secondary actions alongside primary)

**Custom class extensions**: Add `glass` variant via `buttonVariants` — `bg-white/[.06] border border-white/10 backdrop-blur-sm`.

---

### 2. Badge

```bash
npx shadcn@latest add badge
```

**Used on**: Pool cards, pitch cards, pool detail hero, pool browse page toolbar.

**Variants needed**:
- `default` — teal/accent fill (active status)
- `secondary` — grey fill (category labels, closed status)
- `destructive` — red fill (urgent/closing soon)
- `outline` — border only (supplementary info badges)

**Custom variants**: `info` (blue), `success` (green), `warning` (amber), `purple` (completed pools).

---

### 3. Card

```bash
npx shadcn@latest add card
```

**Used on**: Pool cards, stat tiles, portfolio cards, activity panel, contribution panel.

**Props needed**: `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` — all standard shadcn exports.

**Styling overrides**: Dark background `bg-[#161616]`, border `border-white/[.06]`, rounded `rounded-2xl`, hover `hover:bg-[#1C1C1C]`.

---

### 4. Progress

```bash
npx shadcn@latest add progress
```

**Used on**: Pool funding progress (pool cards, pool detail, featured cards), voting allocation bars, milestone completion bars.

**Variants needed**: Standard `value` prop (0–100). Custom gradient fill via CSS override: `bg-gradient-to-r from-accent to-teal-400`.

**Height variants**: `h-1.5` (slim, in list views), `h-2` (standard, in cards), `h-3` (prominent, in hero cards).

---

### 5. Tabs

```bash
npx shadcn@latest add tabs
```

**Used on**: Pools browse page — "All / Active / Upcoming / Closed" filter tabs. Pool detail page — content section tabs (Startups, Milestones, Contributors).

**Props needed**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.

**Styling overrides**: Active trigger: `bg-[#161616] border border-accent/20 text-white`. Inactive trigger: `text-gray-500`.

---

### 6. Input

```bash
npx shadcn@latest add input
```

**Used on**: Search bar in topbar, contribution amount input in pool detail, pool browse search.

**Styling overrides**: `bg-transparent border-0 text-white placeholder:text-gray-600 focus-visible:ring-0` — parent wrapper provides border/glass styling.

---

### 7. Select

```bash
npx shadcn@latest add select
```

**Used on**: Pool browse sort dropdown ("Sort by: Latest"), category filters.

**Props needed**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`.

**Styling overrides**: `bg-[#161616] border-white/[.06] text-gray-200`.

---

### 8. Separator

```bash
npx shadcn@latest add separator
```

**Used on**: Sidebar between nav items and settings area, section dividers in pool detail, activity feed item separators.

---

### 9. Avatar

```bash
npx shadcn@latest add avatar
```

**Used on**: Topbar user avatar, startup/company avatars in pitch cards, investor avatars in contribution rows, pool card startup avatars.

**Props needed**: `Avatar`, `AvatarImage`, `AvatarFallback`.

**Custom behavior**: Gradient fallback colors per startup (cycle through predefined gradient pairs).

---

### 10. Tooltip

```bash
npx shadcn@latest add tooltip
```

**Used on**: AddressDisplay component (full address on hover), icon buttons in topbar, sidebar nav items (label on hover in collapsed state).

---

### 11. Dialog

```bash
npx shadcn@latest add dialog
```

**Used on**: Wallet connect modal, transaction confirmation dialogs, contribute confirmation.

**Props needed**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.

---

### 12. Accordion

```bash
npx shadcn@latest add accordion
```

**Used on**: Homepage FAQ section, milestone expansion in pool detail.

**Props needed**: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.

---

### 13. Alert

```bash
npx shadcn@latest add alert
```

**Used on**: Pool browse page closing-soon alert banner, error states, transaction status notifications.

**Props needed**: `Alert`, `AlertTitle`, `AlertDescription`.

**Variants needed**: `default`, `destructive` (red, for urgent pool closing alerts).

---

### 14. Skeleton

```bash
npx shadcn@latest add skeleton
```

**Used on**: Loading states for all card grids, stat tiles, activity feed, and page headers.

---

### 15. Breadcrumb

```bash
npx shadcn@latest add breadcrumb
```

**Used on**: Pool detail page navigation bar (Back to Pools > Pool Name).

**Props needed**: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`, `BreadcrumbPage`.

---

### 16. Toggle Group

```bash
npx shadcn@latest add toggle-group
```

**Used on**: Pool browse page view switcher (grid view / list view icons).

---

### 17. Scroll Area

```bash
npx shadcn@latest add scroll-area
```

**Used on**: Pool carousel horizontal scroll (dashboard), startup card lists in pool detail sidebar, activity feed panel.

---

### 18. Sheet

```bash
npx shadcn@latest add sheet
```

**Used on**: Mobile navigation drawer (sidebar replacement on small screens).

---

### 19. Dropdown Menu

```bash
npx shadcn@latest add dropdown-menu
```

**Used on**: Topbar user avatar menu (profile, settings, disconnect wallet), sort options on pool browse.

---

### 20. Toast (Sonner)

```bash
npx shadcn@latest add sonner
```

**Used on**: Transaction confirmation toasts, wallet connect success/error, contribution submitted, vote recorded.

---

## Section 2 — Custom Components to Build

All custom components live under `src/components/<category>/`. Each file exports one default component and its TypeScript props interface as a named export.

---

### Web3 Components

#### WalletButton

- **File**: `src/components/web3/WalletButton.tsx`
- **Classification**: wraps shadcn/button
- **TypeScript props interface**:

```typescript
export interface WalletButtonProps {
  address?: string           // Ethereum address (0x...), undefined = not connected
  isConnecting?: boolean     // Show spinner during wallet connect handshake
  chainName?: string         // Display name of connected chain e.g. "Ethereum"
  onConnect: () => void      // Trigger wallet connect flow
  onDisconnect: () => void   // Trigger wallet disconnect
  className?: string
}
```

- **Visual/behavior description**: When disconnected, renders a glass-style pill button with a wallet icon and "Connect Wallet" text. When connecting, shows a spinner. When connected, renders a green status dot followed by the truncated address (e.g., `0x7f3a...e2c1`) and the chain name in smaller muted text, all inside a pill-shaped glass container. Clicking while connected opens a dropdown with "Copy Address", "View on Explorer", and "Disconnect" options. Hover state brightens the glass fill slightly.
- **Pages**: Pool detail breadcrumb, topbar (all app pages).

---

#### TxStatusBadge

- **File**: `src/components/web3/TxStatusBadge.tsx`
- **Classification**: wraps shadcn/badge
- **TypeScript props interface**:

```typescript
export type TxStatus = "pending" | "confirmed" | "failed" | "idle"

export interface TxStatusBadgeProps {
  status: TxStatus
  txHash?: string            // If provided, badge is clickable (opens explorer)
  label?: string             // Override default label text
  className?: string
}
```

- **Visual/behavior description**: A compact pill badge that color-codes transaction state. `pending` renders amber with a spinning loader icon. `confirmed` renders green with a checkmark icon. `failed` renders red with an X icon. `idle` renders transparent/muted grey. Label defaults to the status name but can be overridden. If `txHash` is provided, wraps in an anchor tag opening a block explorer URL in a new tab.
- **Pages**: Contribution panel in pool detail, confirmation modals, toast notifications.

---

#### AddressDisplay

- **File**: `src/components/web3/AddressDisplay.tsx`
- **Classification**: wraps shadcn/tooltip
- **TypeScript props interface**:

```typescript
export interface AddressDisplayProps {
  address: string            // Full Ethereum address
  truncate?: boolean         // Default true — shows first 4 + last 4 chars
  mono?: boolean             // Default true — uses JetBrains Mono font
  copyable?: boolean         // Default false — show copy icon on hover
  className?: string
}
```

- **Visual/behavior description**: Displays a blockchain address with automatic truncation (`0x7f3a...e2c1`). Uses monospace font. When `truncate` is true, wraps the display in a Tooltip that shows the full address on hover. When `copyable` is true, a clipboard icon appears on hover; clicking copies the full address to clipboard and briefly shows a "Copied!" tooltip. Text color is muted grey by default, inheriting from parent when used in activity feed items.
- **Pages**: Activity feed, contribution rows, topbar wallet display, pool detail breadcrumb.

---

#### TokenAmount

- **File**: `src/components/web3/TokenAmount.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface TokenAmountProps {
  amount: number             // Raw amount value
  symbol?: string            // Token symbol e.g. "ETH", "USDC" — omit for USD
  decimals?: number          // Token decimals for formatting, default 18
  displayDecimals?: number   // How many decimal places to show, default 2
  format?: "compact" | "full" // compact: $1.2M, full: $1,230,000
  size?: "sm" | "md" | "lg" // Controls font size
  className?: string
}
```

- **Visual/behavior description**: Renders a formatted monetary or token amount with the currency symbol or token symbol. In `compact` format, uses suffixes (K, M, B). In `full` format, uses locale-aware comma separators. Size `sm` renders in body text size with muted grey color. Size `md` renders at 1.4rem in Syne font. Size `lg` renders at 1.6–2rem in Syne bold, accent color — used in stat tiles and KPI strips. No interactive behavior.
- **Pages**: All stat tiles, pool cards, pool detail KPI strip, contribution panel, portfolio cards.

---

#### NetworkBadge

- **File**: `src/components/web3/NetworkBadge.tsx`
- **Classification**: wraps shadcn/badge
- **TypeScript props interface**:

```typescript
export interface NetworkBadgeProps {
  chainId: number            // EVM chain ID
  chainName: string          // Display name e.g. "Ethereum", "Arbitrum"
  showIcon?: boolean         // Default true — show chain logo icon
  className?: string
}
```

- **Visual/behavior description**: A pill badge showing the connected blockchain network. Displays a small chain-specific icon (or generic blockchain icon) alongside the chain name. Background is a semi-transparent dark glass, with a colored left border accent whose color matches the chain's brand (e.g., purple for Ethereum, blue for Arbitrum). Used in the topbar to indicate active network.
- **Pages**: Topbar (all app pages).

---

### Pool Components

#### PoolCard

- **File**: `src/components/pool/PoolCard.tsx`
- **Classification**: wraps shadcn/card
- **TypeScript props interface**:

```typescript
export interface PoolCardProps {
  pool: {
    id: string
    name: string
    description: string
    category: string
    status: "active" | "upcoming" | "closed"
    fundingGoal: number
    fundingRaised: number
    deadline: Date
    startupCount: number
    voteCount: number
    startupsAvatars?: string[] // First 3–4 startup avatar URLs/initials
  }
  variant?: "grid" | "carousel" | "hero" | "list" // Layout variant
  urgent?: boolean           // Red accent, closing soon styling
  className?: string
  onClick?: () => void
}
```

- **Visual/behavior description**: A dark glass card (`bg-[#161616]`, 1px white/6% border, 16px radius) displaying a pool's key information. In `grid` variant: status badge top-left, pool title in Syne bold, truncated description (2 lines), funding progress bar with percentage, and meta row (startups count, votes count, deadline). Stacked vertically. In `carousel` variant: 260px fixed width with a colored top status bar (teal=active, amber=upcoming, grey=closed). In `hero` variant: 2-column layout with title and description left, startup avatar previews and countdown right. In `list` variant: horizontal row with name, status badge, category badge, funding bar, and percentage. All variants lift on hover (`translateY(-2px)`), darken the border to accent/20, and have a cursor pointer.
- **Pages**: Pools browse grid, pools browse carousel on dashboard, dashboard pools carousel.

---

#### PoolHeader

- **File**: `src/components/pool/PoolHeader.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface PoolHeaderProps {
  pool: {
    id: string
    name: string
    description: string
    category: string
    status: "active" | "upcoming" | "closed"
    fundingGoal: number
    fundingRaised: number
    startupCount: number
    voteCount: number
    deadline: Date
    openDate: Date
    closeDate: Date
  }
  className?: string
}
```

- **Visual/behavior description**: Full-width hero section for the pool detail page. Two-column grid: left column holds a cluster of status+category+outline badges, a large 40px Syne 800 title, and a capped-width (560px) description. Right column shows a 2×2 stat grid with labels in small caps and large Syne numbers — Total Goal, Raised, Remaining, Contributors. Each stat cell may have an accent color on the value. On screens below 1024px, stacks vertically with left column first.
- **Pages**: Pool detail page (`/pools/[id]`).

---

#### PoolStatsGrid

- **File**: `src/components/pool/PoolStatsGrid.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface StatItem {
  label: string
  value: string | number
  accentColor?: string       // CSS color value for the value text
  progressValue?: number     // 0–100, if set renders a mini progress bar
}

export interface PoolStatsGridProps {
  stats: StatItem[]          // Exactly 4 items for the 4-column KPI strip
  gap?: boolean              // Default true — 1px gaps showing grid background
  className?: string
}
```

- **Visual/behavior description**: A full-width horizontal 4-column grid used as the KPI strip beneath the pool hero section. Each cell has no card background — the 1px gap between cells reveals the page background, creating a grid-line effect. Inside each cell: a small-caps label in muted grey at top, a large display number below (1.4–1.6rem Syne 800), and optionally a tiny 3px accent-gradient progress bar at the bottom of each cell. No hover effects; purely informational.
- **Pages**: Pool detail page (`/pools/[id]`).

---

#### PoolProgressBar

- **File**: `src/components/pool/PoolProgressBar.tsx`
- **Classification**: wraps shadcn/progress
- **TypeScript props interface**:

```typescript
export interface PoolProgressBarProps {
  value: number              // Current raised amount
  max: number                // Funding goal
  showLabel?: boolean        // Default true — shows "X% funded" text
  showAmounts?: boolean      // Default false — shows "raised / goal" amounts
  size?: "sm" | "md" | "lg" // Bar height: 2px / 4px / 8px
  animate?: boolean          // Default true — animates fill on mount
  className?: string
}
```

- **Visual/behavior description**: A teal gradient progress bar (left: `#14B8A6`, right: `#0fd9c4`) on a dark track (`rgba(255,255,255,.06)`). When `showLabel` is true, displays the percentage to the right of the bar in a small muted-text label. When `showAmounts` is true, shows "raised / goal" below the bar in secondary text. The `animate` prop triggers a CSS transition from 0% to the target value over 1 second on component mount using a cubic-bezier easing.
- **Pages**: Pool cards, pool detail hero, featured pool card on pools browse, dashboard featured pitches.

---

#### PoolStatusBadge

- **File**: `src/components/pool/PoolStatusBadge.tsx`
- **Classification**: wraps shadcn/badge
- **TypeScript props interface**:

```typescript
export type PoolStatus = "active" | "upcoming" | "closed" | "urgent"

export interface PoolStatusBadgeProps {
  status: PoolStatus
  pulse?: boolean            // Default: true for "active" and "urgent" statuses
  label?: string             // Override default status label
  className?: string
}
```

- **Visual/behavior description**: A pill-shaped badge encoding pool lifecycle state with color. `active` renders teal fill with a pulsing green dot (CSS `animate-pulse`) before the label. `upcoming` renders blue fill (blue/12 background, blue text, blue/20 border) — no pulse. `closed` renders grey fill with muted text. `urgent` renders red fill with a pulsing red dot — used for "Closing Soon" pools. Label defaults to the capitalized status name. Padding is 4px vertical, 10px horizontal.
- **Pages**: Pool cards (all variants), pool detail breadcrumb area, pools browse hero card.

---

### Pitch Components

#### PitchCard

- **File**: `src/components/pitch/PitchCard.tsx`
- **Classification**: wraps shadcn/card
- **TypeScript props interface**:

```typescript
export interface PitchCardProps {
  startup: {
    id: string
    name: string
    description: string
    status: "approved" | "pending" | "in-pool" | "funded"
    votes: number
    totalVotes: number        // For calculating vote share percentage
    image?: string            // Background image URL
    avatarGradient?: string   // CSS gradient for avatar fallback
    poolName?: string         // Parent pool name
    backers?: number
    daysLeft?: number
    fundingPercent?: number
  }
  variant?: "grid" | "bento" | "featured" // Layout variant
  badge?: "featured" | "trending"          // Overlay badge style
  className?: string
  onClick?: () => void
}
```

- **Visual/behavior description**: In `grid` variant: a dark card with avatar circle (gradient fallback), startup name, pool name in muted text, status badge, a VotingBar showing vote percentage, and a 2-line description. In `bento` variant: a tall card with a full-bleed background image (or gradient), a dark-to-transparent gradient overlay from bottom, and content (badge, title, description, stats) anchored to the bottom-left. In `featured` variant: similar to bento but taller with a "Featured" or "Trending" badge in the top-left with a colored dot. All variants lift on hover and scale the background image to 1.05.
- **Pages**: Pool detail startup grid, dashboard featured pitches bento, dashboard industry carousels.

---

#### PitchList

- **File**: `src/components/pitch/PitchList.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface PitchListProps {
  startups: Array<{
    id: string
    name: string
    votes: number
    totalVotes: number
    rank?: number            // 1–3 for top ranked display
    avatarGradient?: string
  }>
  maxItems?: number          // Default: show all
  showRanks?: boolean        // Default true
  className?: string
}
```

- **Visual/behavior description**: A vertically stacked list of startup entries used in the pool browse hero card's right panel (Top 3 Startups by Votes). Each entry is a horizontal flex row: rank number in muted small text (or absent if `showRanks` is false), a small 28px avatar circle, startup name, and a vote share bar filling the remaining width. Entries have minimal padding (10px vertical) and a thin bottom border on all but the last item. No hover behavior — purely informational.
- **Pages**: Pool browse hero card (right panel), pool detail sidebar voting summary.

---

#### PitchDetailPanel

- **File**: `src/components/pitch/PitchDetailPanel.tsx`
- **Classification**: wraps shadcn/card
- **TypeScript props interface**:

```typescript
export interface PitchDetailPanelProps {
  startup: {
    id: string
    name: string
    description: string
    status: "approved" | "pending" | "in-pool" | "funded"
    votes: number
    totalVotes: number
    avatarGradient?: string
    poolName: string
    milestones: Array<{
      id: string
      name: string
      amount: number
      status: "pending" | "in-review" | "approved" | "completed"
    }>
    metrics: {
      fundingGoal: number
      fundingRaised: number
      backers: number
    }
  }
  onVote?: (startupId: string, voteCount: number) => void
  userVotingPower?: number   // How many votes the user has available
  className?: string
}
```

- **Visual/behavior description**: An expanded view card for a single startup shown within the pool detail page's startup grid. Occupies full width of its grid column. Header row: large avatar (48px), startup name in Syne bold, pool name in muted text, status badge. Below: description paragraph. VotingBar showing current votes with accent gradient fill. If `onVote` is provided and `userVotingPower > 0`, a VoteButton renders below the bar. Milestones section at bottom: a mini timeline list of milestone names and statuses with step indicators.
- **Pages**: Pool detail page startup grid section.

---

### Contribution Components

#### ContributionRow

- **File**: `src/components/contribution/ContributionRow.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface ContributionRowProps {
  contribution: {
    id: string
    contributorAddress: string
    amount: number
    votingPower: number
    timestamp: Date
    poolName?: string
  }
  showPool?: boolean         // Default false — show pool name column
  className?: string
}
```

- **Visual/behavior description**: A single horizontal table row used within a contributions list. Left: a small Avatar with gradient fallback, beside an AddressDisplay component (truncated address). Middle columns: formatted amount via TokenAmount, voting power as a number, and relative timestamp ("3 hrs ago"). Optional pool name column shows a small pool badge. Row has a bottom border in `rgba(255,255,255,.04)` and a subtle hover background `rgba(255,255,255,.02)`. No interactive behavior beyond hover.
- **Pages**: Pool detail contributions tab, user portfolio cards (expanded state).

---

#### ContributionTable

- **File**: `src/components/contribution/ContributionTable.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface ContributionTableProps {
  contributions: Array<{
    id: string
    contributorAddress: string
    amount: number
    votingPower: number
    timestamp: Date
    poolName?: string
  }>
  showPool?: boolean
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}
```

- **Visual/behavior description**: A full table component rendering a list of ContributionRows beneath a header row. Header row has small-caps column labels in muted grey (`Contributor`, `Amount`, `Voting Power`, `Time`, optionally `Pool`) with a bottom border. When `isLoading` is true, renders 5 Skeleton rows of equal height. When contributions array is empty, renders the `emptyMessage` centered in muted text. No sorting interaction in v1.
- **Pages**: Pool detail contributors tab (within the right content area).

---

### Voting Components

#### VotingBar

- **File**: `src/components/voting/VotingBar.tsx`
- **Classification**: wraps shadcn/progress
- **TypeScript props interface**:

```typescript
export interface VotingBarProps {
  votes: number              // Current vote count for this startup
  totalVotes: number         // Total votes across all startups in the pool
  label?: boolean            // Default true — show "X votes (Y%)" label
  size?: "sm" | "md"        // sm: 4px height, md: 6px height
  className?: string
}
```

- **Visual/behavior description**: A visual bar showing a startup's share of the total vote pool. The bar track is dark (`rgba(255,255,255,.06)`), fill is the teal accent gradient. Above or beside the bar (depending on `label` prop and size), shows the raw vote count and percentage. Derives percentage as `(votes / totalVotes) * 100`. Animates to the target value on mount. Used inside PitchCard and PitchDetailPanel.
- **Pages**: Pool detail startup cards, pool browse hero card startup list, pitch list items.

---

#### VoteButton

- **File**: `src/components/voting/VoteButton.tsx`
- **Classification**: wraps shadcn/button
- **TypeScript props interface**:

```typescript
export interface VoteButtonProps {
  startupId: string
  startupName: string
  availableVotes: number     // User's remaining voting power
  currentAllocation: number  // How many votes user has already assigned here
  onVote: (startupId: string, voteCount: number) => Promise<void>
  disabled?: boolean
  className?: string
}
```

- **Visual/behavior description**: A composite interactive element. In compact state: a glass-style pill button with a thumbs-up icon and "Vote" label, plus a small badge showing the current user allocation. When clicked, expands inline (or opens a popover) with a numeric stepper (minus / count / plus) to set vote count from 0 to `availableVotes`. A "Confirm" button triggers the `onVote` async callback, during which the button shows a TxStatusBadge in `pending` state and is disabled. On success, collapses back to compact state with updated allocation badge. On error, shows red error text.
- **Pages**: Pool detail startup cards, pool detail voting panel.

---

#### VoteResults

- **File**: `src/components/voting/VoteResults.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface VoteResultEntry {
  startupId: string
  startupName: string
  votes: number
  avatarGradient?: string
}

export interface VoteResultsProps {
  results: VoteResultEntry[]
  totalVotes: number
  showTopN?: number          // Default: show all, set to 3 for compact view
  className?: string
}
```

- **Visual/behavior description**: A ranked leaderboard-style list of startups sorted by vote count descending. Each entry shows rank number, avatar, startup name, a VotingBar, and the raw vote count. The top entry optionally gets a subtle teal glow or highlighted border. Used in the pool detail's right panel to show community voting standings. When `showTopN` is set, only the top N entries are shown with a "Show all" text link below.
- **Pages**: Pool detail page sidebar voting panel, pool browse hero card right panel.

---

### Dashboard Components

#### DashboardStats

- **File**: `src/components/dashboard/DashboardStats.tsx`
- **Classification**: wraps shadcn/card
- **TypeScript props interface**:

```typescript
export interface StatCardData {
  label: string
  value: string | number
  trend?: number             // Percentage change (positive or negative)
  icon: React.ReactNode      // Icon element (e.g., from lucide-react)
  iconColor?: string         // CSS color for icon background accent
}

export interface DashboardStatsProps {
  stats: StatCardData[]      // Exactly 4 items
  isLoading?: boolean
  className?: string
}
```

- **Visual/behavior description**: A 4-column grid of stat cards. Each card has a small icon in the top-right wrapped in a colored circle (teal, blue, purple, orange per card position). Large display number in Syne 800 font below the label. If `trend` is provided, renders a small row with an up/down arrow icon and percentage text in green (positive) or red (negative). Cards have the standard dark glass background. On loading, renders 4 skeleton cards. Responsive: collapses to 2 columns at 1024px, 1 column at 640px.
- **Pages**: Dashboard page stats row, pools browse page stats row.

---

#### ActivityFeed

- **File**: `src/components/dashboard/ActivityFeed.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface ActivityFeedProps {
  events: Array<{
    id: string
    type: "fund" | "vote" | "pitch" | "milestone" | "join"
    actor: string            // Wallet address or display name
    targetPool?: string
    targetStartup?: string
    metadata: {
      amount?: number
      votes?: number
      milestoneId?: string
    }
    timestamp: Date
  }>
  maxItems?: number          // Default 10
  isLoading?: boolean
  className?: string
}
```

- **Visual/behavior description**: A scrollable vertical list of activity events. Each item is a horizontal flex row: a colored icon circle on the left (teal for fund, purple for vote, orange for pitch, blue for milestone, green for join) with a matching icon inside. To the right: a short natural-language description ("0x7f3a...e2c1 funded HealthTech Q1 2026 with $500") with the address wrapped in AddressDisplay. Relative timestamp in muted small text at the far right. Items are separated by thin 1px borders. The outer container has a fixed max-height with a ScrollArea from shadcn for overflow. When loading, shows skeleton rows.
- **Pages**: Dashboard page right column activity panel.

---

#### QuickActions

- **File**: `src/components/dashboard/QuickActions.tsx`
- **Classification**: wraps shadcn/button
- **TypeScript props interface**:

```typescript
export interface QuickAction {
  label: string
  icon: React.ReactNode
  href?: string              // Internal Next.js route
  onClick?: () => void       // For modal-triggering actions
  variant?: "primary" | "glass" // Button style
}

export interface QuickActionsProps {
  actions: QuickAction[]
  heading?: string           // Optional section heading
  className?: string
}
```

- **Visual/behavior description**: A horizontal row of action buttons displayed in the dashboard welcome section. Primary actions use the teal/accent Button variant. Glass actions use the semi-transparent glass Button variant. Each button shows an icon followed by the label text. If `href` is provided, wraps in a Next.js `<Link>`. If `onClick` is provided, triggers the handler (e.g., opens a submit pitch modal). No hover animations beyond the standard button hover defined in the Button component.
- **Pages**: Dashboard welcome section, potentially pool detail contribution area.

---

### Layout Components

#### AppShell

- **File**: `src/components/layout/AppShell.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface AppShellProps {
  children: React.ReactNode
  showSidebar?: boolean      // Default true for app pages
  showTopbar?: boolean       // Default true for app pages
}
```

- **Visual/behavior description**: The root layout wrapper for all authenticated application pages (dashboard, pools, pool detail). Renders a fixed 72px Sidebar on the left, a fixed 64px TopBar at the top (offset by the sidebar width on desktop), and a scrollable main content area with `padding-left: 72px` and `padding-top: 64px`. On screens below 768px, the sidebar is hidden and a MobileNav Sheet is used instead. Background is `#0A0A0A`. All layout slots are implemented as separate components.
- **Pages**: Applied at the Next.js layout level for `src/app/(app)/layout.tsx` — wraps all app routes.

---

#### Sidebar

- **File**: `src/components/layout/Sidebar.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface SidebarNavItem {
  icon: React.ReactNode
  label: string
  href: string
  badge?: number             // Notification count badge
}

export interface SidebarProps {
  navItems: SidebarNavItem[]
  bottomItems?: SidebarNavItem[] // Settings, profile, etc.
  currentPath: string        // Active route for highlight
}
```

- **Visual/behavior description**: A fixed left-side navigation rail, 72px wide and full-height. Background is `#111111` (slightly lighter than the page background). At the top: a 40px square logo mark (teal gradient square with chart icon). Below: a vertical stack of icon-only nav item buttons at 44px height each, vertically centered. The active item has a teal/accent left border and teal icon color; inactive items use grey icons. Each item is wrapped in a Tooltip (shadcn) showing the label on hover (since the sidebar is icon-only). At the bottom: separator, Settings gear icon, user Avatar. A thin right border (`rgba(255,255,255,.06)`) separates it from the main content.
- **Pages**: All app pages via AppShell.

---

#### TopBar

- **File**: `src/components/layout/TopBar.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface TopBarProps {
  showSearch?: boolean       // Default true
  title?: string             // Center branding text, default "Crowd VC"
  onSearch?: (query: string) => void
}
```

- **Visual/behavior description**: A fixed top navigation bar, 64px tall, spanning from the sidebar right edge to the viewport right edge (left offset by 72px). Background is `#111111` with a thin bottom border. Three zones: Left — a glass-styled search input (280px wide on desktop, 160px on mobile) with a search icon inside. Center — "Crowd VC" text in Syne 600. Right — a horizontal flex row: notification bell icon button with a small accent dot for unread items, NetworkBadge, WalletButton (connected/disconnected state), and user Avatar with DropdownMenu. The search input triggers `onSearch` on change with debouncing.
- **Pages**: All app pages via AppShell.

---

#### PageHeader

- **File**: `src/components/layout/PageHeader.tsx`
- **Classification**: custom (no shadcn base)
- **TypeScript props interface**:

```typescript
export interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode  // Slot for action buttons (right side)
  className?: string
}
```

- **Visual/behavior description**: A horizontal section at the top of each page's main content area (below the TopBar padding). Left side: page title in `clamp(2rem, 4vw, 3.2rem)` Syne 700, and optionally a description in body text below. Right side: the `actions` slot renders whatever buttons are passed — commonly "Export Report" (glass) and "Browse Active" (primary). The component has 32px vertical padding and acts as a visual anchor for the page. It is not sticky — it scrolls with the page content.
- **Pages**: Pools browse page, dashboard page, potentially others.

---

#### MobileNav

- **File**: `src/components/layout/MobileNav.tsx`
- **Classification**: wraps shadcn/sheet
- **TypeScript props interface**:

```typescript
export interface MobileNavProps {
  navItems: SidebarNavItem[]
  bottomItems?: SidebarNavItem[]
  currentPath: string
  trigger?: React.ReactNode  // Custom trigger element (hamburger icon)
}
```

- **Visual/behavior description**: A Sheet (drawer) that slides in from the left on mobile screens. The trigger is a hamburger icon button shown in the TopBar only when the viewport is below 768px. The sheet background matches the Sidebar background (`#111111`). Inside: the same logo, nav items, and bottom items as the Sidebar, but displayed with icon + label side by side (not icon-only). Active item highlighted with accent left border and teal text. Closes when a nav item is tapped.
- **Pages**: All app pages via AppShell on mobile.

---

## Summary

| Category | shadcn installs | Custom components |
|----------|----------------|-------------------|
| Base UI | button, badge, card, progress, tabs, input, select, separator, avatar, tooltip, dialog, accordion, alert, skeleton, breadcrumb, toggle-group, scroll-area, sheet, dropdown-menu, sonner (20) | — |
| Web3 | — | WalletButton, TxStatusBadge, AddressDisplay, TokenAmount, NetworkBadge (5) |
| Pool | — | PoolCard, PoolHeader, PoolStatsGrid, PoolProgressBar, PoolStatusBadge (5) |
| Pitch | — | PitchCard, PitchList, PitchDetailPanel (3) |
| Contribution | — | ContributionRow, ContributionTable (2) |
| Voting | — | VotingBar, VoteButton, VoteResults (3) |
| Dashboard | — | DashboardStats, ActivityFeed, QuickActions (3) |
| Layout | — | AppShell, Sidebar, TopBar, PageHeader, MobileNav (5) |

**Total**: 20 shadcn components + 26 custom components = 46 components.
