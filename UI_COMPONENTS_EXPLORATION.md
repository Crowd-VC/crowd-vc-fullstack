# CrowdVC UI Components and Workflows - Comprehensive Exploration

This document provides a detailed overview of the main UI components, pages, and user workflows in the CrowdVC web application (apps/web/src).

---

## Table of Contents
1. [Application Structure](#application-structure)
2. [Landing Page & Entry Points](#landing-page--entry-points)
3. [Authentication Flows](#authentication-flows)
4. [Dashboard Layouts](#dashboard-layouts)
5. [Core User Workflows](#core-user-workflows)
6. [Admin Interfaces](#admin-interfaces)
7. [Key UI Components](#key-ui-components)
8. [State Management & Data Flow](#state-management--data-flow)

---

## Application Structure

### Directory Organization
```
apps/web/src/
├── app/                          # Next.js App Router (pages and routes)
│   ├── (landing)/                # Public landing page
│   ├── authentication/           # Auth flows (sign-in, sign-up)
│   ├── dashboard/                # Protected routes (investor/startup/admin)
│   │   ├── pitches/              # Pitch browsing
│   │   ├── pools/                # Investment pools
│   │   ├── admin/                # Admin management
│   │   ├── profile/              # User profiles
│   │   └── [other sections]/     # Trading, NFTs, etc.
│   └── api/                      # REST API endpoints
├── components/                   # Reusable UI components
│   ├── providers/                # Context/state providers (wallet, query, theme)
│   ├── screens/                  # Full-page components (landing views)
│   ├── submit-pitch/             # Multi-step pitch submission
│   ├── vote/                     # Voting components
│   ├── trading-bot/              # Investment tables
│   ├── landing/                  # Landing page sections
│   ├── ui/                       # Base UI components (shadcn/Radix)
│   ├── modal-views/              # Modal dialogs
│   └── [feature]/                # Feature-specific components
├── layouts/                      # Layout wrappers (header, sidebar)
├── hooks/                        # Custom React hooks
├── db/                           # Database layer
├── lib/                          # Utilities and helpers
└── web3/                         # Web3/blockchain utilities
```

---

## Landing Page & Entry Points

### Public Landing Page
**Location:** `/apps/web/src/app/(landing)/page.tsx`

**Components:**
- `OpeningPortal` - Animated intro portal animation
- `Navigation` - Navigation bar with CTA buttons
- `HeroSection` - Main headline and value proposition
- `FeaturesSection` - Platform features showcase
- `ProcessSection` - How the platform works
- `PoolsSection` - Current pools and investment opportunities
- `TechnologySection` - Tech stack showcase
- `TestimonialsSection` - User testimonials
- `FAQSection` - Frequently asked questions
- `CTASection` - Call-to-action for sign up
- `Footer` - Footer with links

**User Flow:**
1. Portal animation displays on first load
2. User sees animated hero section with value proposition
3. Section for browsing featured pitches and pools
4. FAQs and CTAs guide users to authentication

### Featured Pitches Dashboard
**Location:** `/apps/web/src/components/screens/classic-screen.tsx`

**Key Features:**
- **Hero Featured Card** - Large featured pitch with:
  - High-resolution image with funding progress bar overlay
  - Title, elevator pitch, and status badge
  - Days remaining and funding percentage
  - Hover expansion showing summary and tags
  - Click navigates to pitch detail page

- **Side Featured Cards** - 3 smaller featured pitches displayed in grid
  
- **Browse by Pools Section** - Carousel of investment pools showing:
  - Pool status badge (active/closed/upcoming)
  - Category tags
  - Pool name and description
  - Voting deadline
  - Startup count and vote count
  - Funding progress (on hover)
  
- **Industry Carousel Sections** - Horizontal scrollable carousels of pitches grouped by industry
  - Each carousel has left/right scroll buttons
  - Cards have smooth hover animations

**Pitch Card Variants:**
1. **Large Featured Card** (400px height)
   - Full pitch information visible
   - 3-column layout (2:1 split on desktop)

2. **Small Featured Card** (200px height)
   - Compact version of large card
   - Used for side-by-side display

3. **Regular Card** (carousel version, 320px width)
   - Standard card for horizontal scrolling
   - Shows pitch info with expandable hover content

4. **Pool Card** (320px width)
   - Gradient header background with pool name
   - Category and status badges
   - Stats: deadline, startups count, votes count
   - Funding progress (on hover)

---

## Authentication Flows

### Sign-In Page
**Location:** `/apps/web/src/app/authentication/page.tsx`

**Layout:** Split screen
- Left side: Form and authentication options (60%)
- Right side: Bitcoin image background (40%)

**Components:**
- Logo
- "Welcome Back!" heading
- **Google OAuth Button** - "Log in with Google"
- **Sign-In Form** (`SignInForm` component)
  - Email/username input
  - Password input
  - Remember me checkbox
  - Submit button
  - Forgot password link
- **Sign-up Link** - "Not member yet? Create an account"

**Related Pages:**
- `sign-up/page.tsx` - Sign-up form for new accounts
- `forget-password/page.tsx` - Password recovery flow
- `reset-pin/page.tsx` - PIN reset functionality

### Wallet Authentication
**Provider:** `WalletProvider` (Reown AppKit + SIWX)

Integrated in: `/apps/web/src/components/providers/wallet-provider.tsx`

**Features:**
- Web3 wallet connection via Reown AppKit
- Sign-In With Ethereum (SIWX) - ReownAuthentication
- Wagmi hooks for wallet state management
- Network support: Sepolia testnet (development)
- Metadata configured for wallet display

---

## Dashboard Layouts

### Main Layout Structure
**Location:** `/apps/web/src/layouts/classic/layout.tsx`

**Components:**
1. **ClassicHeader** - Top navigation bar
2. **SecondaryHeader** - Secondary nav elements
3. **Sidebar** - Expandable side navigation (hidden on mobile, visible on XL)
4. **Main Content Area** - Dynamic content based on route

**Layout Features:**
- Responsive: Full-width on mobile, sidebar on XL+
- Fixed left padding for sidebar on desktop
- Sticky positioning options for content

### Dashboard Home
**Location:** `/apps/web/src/app/dashboard/page.tsx`

**Displays:**
- Overview of recent activity
- Quick links to sections
- Recent pitches and pools

---

## Core User Workflows

### 1. BROWSE PITCHES WORKFLOW

#### Entry Points:
- Landing page → Featured Pitches section
- Dashboard → Pitches section
- Direct navigation to `/dashboard/pitches`

#### Main Component: Classic Screen
**File:** `apps/web/src/components/screens/classic-screen.tsx`

**Display Modes:**
- Featured section with hero card and side cards
- Carousels organized by industry
- Pools carousel for active investment opportunities

#### Pitch Detail View
**Location:** `/apps/web/src/app/dashboard/pitches/[id]/page.tsx`

**Components:**
1. **PitchDetailHeader** - Title, image, status badge, funding percentage
2. **PitchTabs** - Multi-tab interface:
   - **Overview** - Summary, industry, location, stage, team size
   - **Details** - Elevator pitch, key metric, website, additional info
   - **Funding** - Breakdown of funding sources and distribution
   - **Media** - Images, videos, pitch deck
   - **Timeline** - Submission timeline, review notes

3. **PitchInfoSidebar** - Right-side information and actions:
   - Funding goal and progress
   - Days remaining
   - Industry and stage badges
   - Team size and location
   - Website link
   - **Action Card** - Context-dependent buttons:
     - **For Admin:** Review, Approve, Reject buttons
     - **For Investor:** Vote for this Pitch (if in pool)
     - **For Startup Owner:** Edit Pitch (coming soon)
     - **For Public:** Sign In to Vote/Invest
   - **Contact Card** (Admin only) - Startup contact info

**Data Flow:**
- Server-side fetched via `getPitchById(id)`
- Pre-rendered with SEO metadata
- Displays based on user role

---

### 2. INVESTMENT POOL VOTING WORKFLOW

#### Pool Listing & Discovery
**Location:** `/apps/web/src/app/dashboard/pools/page.tsx`

**Features:**
- Grid/list view of active pools
- Filter panel (status, category, search)
- Pool cards with key metrics
- "Create Pool" button (admin only)

#### Pool Detail Page
**Location:** `/apps/web/src/app/dashboard/pools/[id]/page.tsx`

**Layout:** 2-column on desktop, stacked on mobile
- **Left Column (1/3):** Contribution Panel
- **Right Column (2/3):** Competing Startups

#### Left Column: Contribution Panel
**Component:** `ContributionPanel`

**Features:**
1. **Pool Progress Section:**
   - Funding percentage display
   - Progress bar showing funding goal progress
   - Current raised / remaining goal amounts
   - Conditional minimum/maximum contribution display

2. **Contribution Amount Input:**
   - Number input for USD amount
   - Minimum amount validation
   - Placeholder shows minimum required
   - Min/Max/Available amounts shown below

3. **Fee Breakdown (when amount > 0):**
   - Contribution amount display
   - Platform Fee: 2% of contribution
   - Est. Gas Fee: Fixed $15 estimate
   - **Total** in bold (Contribution + fees)

4. **Wallet Balance Alert:**
   - Displays connected wallet balance
   - Shows as info alert if connected

5. **Validation Error Alerts:**
   - "Minimum contribution is $X"
   - "Maximum available is $Y"
   - "Insufficient wallet balance"

6. **Action Buttons:**
   - If wallet connected: "Contribute $X" button
   - If wallet not connected: "Connect Wallet to Contribute" button

#### Contribution History
**Component:** `ContributionHistory`

**Displays:**
- Total contributed (confirmed contributions only)
- List of all contributions with:
  - Amount
  - Date and time
  - Status badge (Pending/Confirmed/Failed)
  - Platform and gas fees
  - Transaction hash (truncated) with link to etherscan
  - Sortable/filterable list

#### Right Column: Competing Startups
**Component:** Dynamically rendered startup cards

**For Each Startup Card:**
1. **Startup Information:**
   - Title (clickable to pitch detail)
   - Elevator pitch text
   - Badges: Industry, Funding Goal, Company Stage

2. **Vote Progress (if pool closed):**
   - Vote count
   - Vote percentage
   - Progress bar

3. **Interaction Buttons:**
   - **If user can vote (active pool, not voted, wallet connected):**
     - "Vote for this Startup" button → confirms vote in dialog
   - **If user has already voted for this startup:**
     - Green checkmark with "Your vote" text
   - **If wallet not connected:**
     - "Connect Wallet to Vote" button
   - **If voting closed/not started:**
     - Disabled vote button with reason

#### Voting Confirmation
**Component:** AlertDialog

**Flow:**
1. User clicks "Vote for this Startup"
2. Dialog displays: "Confirm Your Vote"
3. Message: "You can only vote once per pool and this action cannot be undone"
4. Options: Cancel or Confirm Vote
5. On confirm: Vote is cast, UI updates to show "Your vote" with checkmark

**State Management:**
- TanStack Query (`useCastVote` hook) handles mutation
- Success toast: "Vote cast successfully!"
- Error handling with user feedback

---

### 3. PITCH SUBMISSION WORKFLOW

#### Submit Pitch Form
**Location:** `/apps/web/src/components/submit-pitch/submit-pitch.tsx`

**Layout:** 3-column grid (2 cols form, 1 col preview)

**Form Fields:**

1. **Cover Image Upload**
   - File uploader for PNG/JPEG/GIF
   - Accepts images only
   - Preview area

2. **Pitch Deck Upload**
   - PDF file uploader
   - Right-side sidebar (hidden on mobile)
   - Shows preview card

3. **Project Title**
   - Text input
   - Placeholder: "Enter your price" (appears to be placeholder text)

4. **Description**
   - Textarea input
   - Help text: "The description will be included on the project's detail page..."
   - Larger text area for detailed description

5. **External Link**
   - URL input
   - Help text about including external links
   - Placeholder: "https://yoursite.io/item/123"

6. **Unlockable Content (Toggle)**
   - Toggle switch
   - Optional conditional textarea for unlockable content
   - Help text explains feature

7. **Explicit & Sensitive Content (Toggle)**
   - Toggle switch
   - Mark content as explicit if needed

8. **Supply**
   - Number input (pre-filled with 1, disabled)
   - For NFT minting

9. **Blockchain Selection**
   - Dropdown select
   - Options: Arbitrum, Flow
   - Shows icon for each network

10. **Submit Button**
    - Large "CREATE" button to submit form

**Current Status:**
- Template structure in place
- Some fields appear to be placeholder/legacy
- Integration with actual submission logic may be incomplete

---

## Admin Interfaces

### 1. ADMIN PITCH REVIEW DASHBOARD

**Location:** `/apps/web/src/app/dashboard/admin/pitches/page.tsx`

**Main Features:**

#### Header Section:
- Title: "Admin Dashboard"
- Subtitle: "Review and manage pitch submissions"

#### Stats Cards:
- Total pitches count
- Pending count
- Approved count
- Rejected count

#### Toolbar:
- **Search Box** - Search by title, summary, industry, submission ID, email, name
- **Status Filter Dropdown** - pending, all (shows only selected status)
- **Sort Dropdown** - Options:
  - Newest (default)
  - Oldest
  - Title A-Z
  - Title Z-A
  - Funding goal (high to low)
  - Funding goal (low to high)

#### Pitch Review List:
**Component:** `PitchReviewList`

**For Each Pitch Card:**
- Pitch title and summary
- Submission date
- Submitter name and email
- Industry and funding goal
- Status badge with icon
- **Action Buttons:**
  - "View Details" → Opens detail drawer
  - "Review" → Opens review/decision modal

#### Pitch Detail Drawer:
**Component:** `PitchDetailDrawer`

**Displays:**
- Full pitch information
- Submitter details
- All pitch metadata
- Contact information
- **Action Buttons:**
  - "Approve" → Opens decision modal
  - "Reject" → Opens decision modal

#### Review Action Modal:
**Component:** `ReviewActionModal`

**For Approval/Rejection:**
1. Modal title: "[Action] Pitch"
2. Pitch preview
3. **For Rejection Only:**
   - Dropdown for rejection reason:
     - Not aligned with mission
     - Team not ready
     - Market validation missing
     - Other (custom text)
   - Custom notes text area (optional)
4. Submit button: "Confirm [Action]"

**State Management:**
- Uses TanStack Query for mutations
- Updates pitch status in database
- Sends notification to startup
- Shows toast notifications

---

### 2. ADMIN POOL MANAGEMENT DASHBOARD

**Location:** `/apps/web/src/app/dashboard/admin/pools/page.tsx`

**Main Features:**

#### Header:
- Title: "Investment Pools"
- Subtitle: "Create and manage investment pools for startups"
- **Create Pool Button** - Opens create pool modal

#### Pool Cards Grid:
- 3-column layout on desktop
- 2-column on tablet
- 1-column on mobile

**For Each Pool Card:**
- Pool name and category
- Pool status badge with color coding
- Voting deadline
- Short description
- Stats: Startup count, Vote count

#### Pool Card Actions:
- **Status Dropdown** - Change status: upcoming → active → closed
- **Assign Startups Button** - Opens assign startups modal

#### Create Pool Modal:
**Component:** `CreatePoolModal`

**Form Fields:**
1. **Pool Name** (required)
   - Placeholder: "e.g., Q1 2024 FinTech Pool"
2. **Category** (required)
   - Select dropdown
   - Options: FinTech, HealthTech, EdTech, E-commerce, SaaS, AI/ML, Blockchain, Clean Energy, Biotech, Other
3. **Description** (required)
   - Textarea input
   - Help text: "Describe the focus and goals of this investment pool..."
4. **Voting Deadline** (required)
   - DateTime input (HTML5 datetime-local)
5. **Initial Status** (optional)
   - Select: upcoming, active, closed
   - Default: upcoming

**Actions:**
- Cancel button (closes modal)
- Create Pool button (submits form)

#### Assign Startups Modal:
**Component:** `AssignStartupsModal`

**Layout:** Tabbed interface

**Search Feature:**
- Search box at top
- Searches pitch title, industry, summary across both tabs

**Tabs:**
1. **Assigned Tab** - Shows currently assigned startups
   - Scrollable area (400px height)
   - For each startup:
     - Title, summary, industry, funding goal
     - Remove button (trash icon)
   - Shows count: "Assigned (X)"

2. **Available Tab** - Shows approved pitches not in pool
   - Scrollable area (400px height)
   - For each pitch:
     - Title, summary, industry, funding goal
     - Add button
   - Shows count: "Available (X)"
   - Only shows approved pitches not yet assigned

**Data Processing:**
- Filters to show only approved pitches
- Excludes already-assigned pitches from available list
- Search works across both tabs

---

## Key UI Components

### State Badges

**Pitch Status Badges:**
```
Approved    → Green (✓)
Pending     → Yellow (⏱)
Rejected    → Red (✗)
In Pool     → Blue (ℹ)
Under Review → Blue (🔍)
Shortlisted → Purple (★)
Conditional → Orange (⚠)
Needs Info  → Gray (ℹ)
```

**Pool Status Badges:**
```
Active      → Green
Closed      → Gray
Upcoming    → Blue
```

**Contribution Status Badges:**
```
Pending     → Yellow with Clock icon
Confirmed   → Green with CheckCircle2 icon
Failed      → Red with XCircle icon
```

### Navigation & Links
- Breadcrumb navigation with back buttons
- Feature links and "View All" links
- External links with ExternalLink icon
- Internal navigation with next/link

### Forms & Inputs
- Text inputs with validation
- Textarea for long content
- Number inputs with min/max
- DateTime-local inputs
- Select/dropdown inputs
- Toggle switches
- File uploaders
- Checkboxes and radio buttons

### Progress Indicators
- Progress bars for funding goals
- Status indicators and badges
- Loading states with spinners
- Toast notifications for success/error

### Tables & Lists
- Trading bot investment table with columns:
  - Time of investment
  - Investment amount (USDT)
  - Total profit
  - Transactions count
  - Amount per investment
  - Current price
  - Average buy price
  - Bought amount
  - Insufficient funds warning
  - Toggle on/off
  - Details button

---

## State Management & Data Flow

### Providers
**Location:** `/apps/web/src/components/providers/`

1. **WalletProvider** - Web3 wallet connection
   - Reown AppKit integration
   - SIWX authentication
   - Wagmi configuration

2. **QueryClientProvider** - Server state management
   - TanStack Query (React Query)
   - Handles API data fetching and caching

3. **JotaiProvider** - Global state
   - Atomic state management
   - For app-wide settings

4. **ThemeProvider** - Dark/light mode
   - Theme switching and persistence

### Custom Hooks

**Pool-related hooks:**
- `useInvestorPools()` - Fetch active pools for investor
- `usePoolDetails(poolId, userId)` - Get pool details and startups
- `useCastVote()` - Vote for startup mutation
- `useContribute()` - Contribute funds mutation
- `useUserContributions()` - Get user's contribution history
- `useAdminPools()` - Fetch pools (admin)
- `useCreatePool()` - Create new pool (admin)
- `useUpdatePoolStatus()` - Change pool status (admin)
- `usePoolStartups()` - Get startups in pool (admin)
- `useAssignStartup()` - Assign pitch to pool (admin)
- `useRemoveStartup()` - Remove pitch from pool (admin)

**Pitch-related hooks:**
- `useAdminPitches()` - Fetch all pitches with filters
- `useUpdatePitchStatus()` - Update pitch status (admin)

**Wallet hooks:**
- `useWallet()` - Get wallet connection status and address
- `useInvokeTransaction()` - Execute blockchain transaction

### Data Flow Pattern

1. **Data Fetching:**
   - Hooks use TanStack Query with caching
   - Server-side fetching for initial page load
   - Client-side mutations for actions

2. **State Updates:**
   - Optimistic updates with fallback
   - Query invalidation after mutations
   - Toast notifications for feedback

3. **User Feedback:**
   - Toast notifications (success, error, info)
   - Loading states during async operations
   - Confirmation dialogs for critical actions

### API Endpoints Called

**Pitch Endpoints:**
- `GET /api/pitches` - List pitches with filters
- `GET /api/pitches/[id]` - Get single pitch
- `PATCH /api/pitches/[id]` - Update pitch (admin)
- `GET /api/admin/pitches` - Admin list view
- `PATCH /api/admin/pitches/[id]` - Admin status update

**Pool Endpoints:**
- `GET /api/pools` - List active pools
- `GET /api/pools/[id]` - Get pool details
- `POST /api/pools/[id]/vote` - Cast vote
- `POST /api/admin/pools` - Create pool
- `GET /api/admin/pools` - Admin list
- `PATCH /api/admin/pools/[id]` - Update pool
- `POST /api/admin/pools/[id]/startups` - Assign startup
- `DELETE /api/admin/pools/[id]/startups/[pitchId]` - Remove startup

**Contribution Endpoints:**
- `GET /api/contributions` - List contributions
- `POST /api/contributions` - Create contribution
- `GET /api/contributions?poolId=X` - Filter by pool
- `GET /api/contributions?userId=X` - Filter by user

---

## Summary of Key Workflows

### For Investors:
1. Browse featured pitches on landing/dashboard
2. View pitch details and information
3. Discover investment pools
4. Connect wallet
5. Vote for preferred startups in active pool
6. Contribute funds to pool
7. View contribution history and status

### For Startups:
1. Sign up/authenticate
2. Submit pitch with all details
3. Wait for admin review
4. See pitch in "in-pool" status when added to pool
5. Compete for investor votes and funding

### For Admins:
1. Review submitted pitches with detailed info
2. Filter and search pitches efficiently
3. Approve, reject, or request more info
4. Create investment pools
5. Assign approved pitches to pools
6. Manage pool status and details
7. Monitor voting and contributions

---

## Notes

- UI uses shadcn/Radix components for consistency
- Tailwind CSS for styling
- Responsive design with mobile-first approach
- Web3 integration via Reown AppKit and Wagmi
- Database operations via Drizzle ORM
- Email notifications via Resend
- File uploads likely handled via Pinata (IPFS)
