# CrowdVC Design System Specification

## Overview

This document defines the complete design system for the CrowdVC decentralized venture crowdfunding platform, derived from analysis of four HTML prototypes (homepage, dashboard, pools browse, and pool detail). Every decision is grounded in the visual language already established in those prototypes and optimized for implementation with Next.js, Tailwind CSS, and shadcn/ui.

---

## 1. Color Palette

### 1.1 Brand / Primary Colors

The primary accent is teal/turquoise, chosen because it conveys trust, technology, and financial growth -- appropriate for a Web3 investment platform. The dark background establishes a premium, data-dense aesthetic common in fintech and crypto dashboards.

| Token | Hex (Dark Mode) | Usage |
|-------|-----------------|-------|
| `primary` | `#14B8A6` | Main CTA buttons, active states, links, accent highlights |
| `primary-foreground` | `#000000` | Text on primary buttons |
| `primary-hover` | `#0FD9C4` | Hover state for primary buttons |
| `primary-glow` | `rgba(20,184,166,0.15)` | Glow/shadow effects on accent elements |
| `primary-dim` | `rgba(20,184,166,0.08)` | Subtle tinted backgrounds (active sidebar, badges) |

**Rationale**: `#14B8A6` is the exact teal used consistently across all four prototypes in `--accent`. The hover state `#0FD9C4` appears in every `.pill-btn--primary:hover` rule.

### 1.2 Background / Surface Colors

| Token | Hex (Dark Mode) | Hex (Light Mode) | Usage |
|-------|-----------------|------------------|-------|
| `background` | `#0A0A0A` | `#FFFFFF` | Page background |
| `foreground` | `#FFFFFF` | `#0A0A0A` | Default text color |
| `card` | `#161616` | `#FFFFFF` | Card backgrounds |
| `card-foreground` | `#FFFFFF` | `#0A0A0A` | Text on cards |
| `popover` | `#161616` | `#FFFFFF` | Popover/dropdown background |
| `popover-foreground` | `#FFFFFF` | `#0A0A0A` | Text in popovers |
| `muted` | `#1A1A1A` | `#F5F5F5` | Muted backgrounds, disabled areas |
| `muted-foreground` | `#999999` | `#666666` | Secondary text, labels |
| `secondary` | `#111111` | `#F5F5F5` | Elevated surfaces (sidebar, topbar) |
| `secondary-foreground` | `#FFFFFF` | `#0A0A0A` | Text on secondary surfaces |
| `accent` | `rgba(20,184,166,0.08)` | `rgba(20,184,166,0.08)` | Tinted highlight areas |
| `accent-foreground` | `#14B8A6` | `#14B8A6` | Text/icon on accent backgrounds |

**Rationale**: The dark mode values (`#0A0A0A`, `#111111`, `#161616`) map directly to `--bg`, `--bg-elevated`, and `--bg-card` from the prototypes. Light mode values are logical inverses maintaining equivalent contrast ratios.

### 1.3 Neutral / Gray Scale

The gray scale uses a progression from near-white to near-black, matching the exact hex values from the prototype CSS variables.

| Token | Hex | CSS Variable Origin |
|-------|-----|---------------------|
| `gray-50` | `#FAFAFA` | (extrapolated) |
| `gray-100` | `#F5F5F5` | `--grey-100` |
| `gray-200` | `#E5E5E5` | `--grey-200` |
| `gray-300` | `#D4D4D4` | (extrapolated) |
| `gray-400` | `#999999` | `--grey-400` |
| `gray-500` | `#666666` | `--grey-500` |
| `gray-600` | `#444444` | `--grey-600` |
| `gray-700` | `#2A2A2A` | `--grey-700` |
| `gray-800` | `#1A1A1A` | `--grey-800` |
| `gray-900` | `#111111` | `--bg-elevated` |
| `gray-950` | `#0A0A0A` | `--bg` |

### 1.4 Semantic Colors

These map to status indicators and feedback colors used throughout the pool cards, badges, activity feeds, and alerts.

| Token | Hex | Usage | Prototype Source |
|-------|-----|-------|------------------|
| `success` | `#10B981` | Wallet connected, approved milestones, funded status | `--success` in pool-detail |
| `success-bright` | `#22C55E` | Activity feed success, trend-up indicators | `--green` in pools-demo |
| `warning` | `#F59E0B` | Upcoming pools, pending status, amber indicators | `--warning` / `--amber` |
| `error` | `#EF4444` | Urgent/closing pools, danger alerts, failed states | `--danger` / `--red` |
| `info` | `#3B82F6` | Upcoming pool badges, info buttons, blue accents | `--blue` |
| `purple` | `#8B5CF6` | Voting icons, completed/funded pool badges | `--purple` |
| `orange` | `#F97316` | Trending badges, join activity icons | `--orange` |

**Rationale**: Each semantic color appears in status badges, activity feed icons, and stat card icon backgrounds across the prototypes. The dual success values (`#10B981` and `#22C55E`) reflect the two different greens used: the former for wallet connection chips, the latter for trend indicators.

### 1.5 Border & Input Colors

| Token | Value (Dark Mode) | Value (Light Mode) | Usage |
|-------|-------------------|--------------------| ------|
| `border` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` | Card borders, dividers, separators |
| `border-hover` | `rgba(255,255,255,0.12)` | `rgba(0,0,0,0.15)` | Hovered card/element borders |
| `input` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` | Input field borders |
| `ring` | `rgba(20,184,166,0.3)` | `rgba(20,184,166,0.3)` | Focus ring (search focus-within) |
| `destructive` | `#EF4444` | `#EF4444` | Destructive action buttons |
| `destructive-foreground` | `#FFFFFF` | `#FFFFFF` | Text on destructive buttons |

---

## 2. Typography

### 2.1 Font Families

| Token | Font Stack | Usage | Source |
|-------|-----------|-------|--------|
| `font-display` | `'Syne', ui-sans-serif, system-ui, sans-serif` | Headings, titles, large numbers, section labels | Google Fonts -- used for all `font-family: var(--font-display)` |
| `font-body` | `'DM Sans', ui-sans-serif, system-ui, sans-serif` | Body text, descriptions, buttons, inputs | Google Fonts -- used for `font-family: var(--font-body)` |
| `font-mono` | `'JetBrains Mono', ui-monospace, monospace` | Wallet addresses, code, technical values | Google Fonts -- used in pool-detail for `--font-mono` |

**Rationale**: Syne is a slightly geometric, modern display face with strong personality at large sizes -- perfect for the bold, futuristic brand feel. DM Sans is clean and highly legible at small sizes, making it ideal for data-dense dashboards. JetBrains Mono provides clear monospace rendering for blockchain addresses and numerical data.

### 2.2 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Rarely used; available in DM Sans |
| Regular | 400 | Body text, descriptions, meta text |
| Medium | 500 | Nav links, badges, labels |
| Semibold | 600 | Buttons, section labels, card titles |
| Bold | 700 | Headings h1-h4, card names, stat values |
| Extrabold | 800 | Hero titles, large display numbers |

### 2.3 Typography Scale

| Level | Font | Size (rem) | Weight | Line Height | Letter Spacing | Usage |
|-------|------|-----------|--------|-------------|----------------|-------|
| `display` | Syne | `clamp(2.8rem, 5.8vw, 4.8rem)` | 800 | 1.08 | `-0.04em` | Homepage hero title |
| `h1` | Syne | `clamp(2rem, 4vw, 3.2rem)` | 700 | 1.15 | `-0.03em` | Section headings (How It Works, Benefits) |
| `h2` | Syne | `1.8rem` | 700 | 1.2 | `-0.03em` | Page titles (dashboard, pools) |
| `h3` | Syne | `1.3rem` | 700 | 1.3 | `-0.03em` | Section titles, card group headers |
| `h4` | Syne | `1.05rem` | 700 | 1.3 | `-0.02em` | Card titles, pool names |
| `body-lg` | DM Sans | `1rem` | 400 | 1.7 | `0` | Hero subtitle, long descriptions |
| `body` | DM Sans | `0.92rem` | 400 | 1.5 | `0` | Standard body text, descriptions |
| `body-sm` | DM Sans | `0.88rem` | 400 | 1.5 | `0` | Smaller body, button text |
| `caption` | DM Sans | `0.78rem` | 400-500 | 1.4 | `0` | Stat labels, timestamps, secondary info |
| `label` | Syne | `0.75rem` | 600 | 1 | `0.15em` | Section labels (uppercase), filter labels |
| `overline` | DM Sans | `0.72rem` | 600 | 1 | `0.04em` | Badge text, tag text (uppercase) |
| `stat-lg` | Syne | `1.6rem` | 800 | 1 | `-0.03em` | Large stat card values |
| `stat-md` | Syne | `1.15rem` | 700 | 1 | `-0.02em` | Medium stat values, funding amounts |
| `stat-sm` | Syne | `0.88rem` | 700 | 1 | `0` | Small stat values in cards |
| `meta` | DM Sans | `0.7rem` | 400-500 | 1.4 | `0` | Timestamps, small metadata |
| `micro` | DM Sans | `0.65rem` | 400 | 1 | `0` | Chart axis labels, smallest text |

**Rationale**: The scale is extracted directly from font-size values found across all four prototypes. The display/h1 levels use `clamp()` for fluid scaling, matching the homepage CSS. Negative letter-spacing on display fonts creates the tight, modern look seen in the prototypes.

---

## 3. Spacing Scale

Base unit: **4px**. All spacing values are multiples of 4px, following a practical scale that covers the range of padding, margin, and gap values found in the prototypes.

| Token | Value (px) | Value (rem) | Common Usage |
|-------|-----------|-------------|--------------|
| `0.5` | 2 | 0.125 | Micro gaps (milestone step name margin) |
| `1` | 4 | 0.25 | Small gaps (tag gaps, progress bar margin) |
| `1.5` | 6 | 0.375 | Badge padding-y, icon gaps |
| `2` | 8 | 0.5 | Gap between nav items, sidebar icon spacing |
| `3` | 12 | 0.75 | Card internal gaps, badge padding-x |
| `4` | 16 | 1 | Grid gaps (card grids), card padding, section margins |
| `5` | 20 | 1.25 | Card padding (large), sidebar padding, content padding (mobile) |
| `6` | 24 | 1.5 | Section inner padding, card content padding |
| `8` | 32 | 2 | Content area padding, page header margin, topbar padding |
| `10` | 40 | 2.5 | Section bottom margins, featured card padding |
| `12` | 48 | 3 | Large section padding |
| `16` | 64 | 4 | Topbar height |
| `18` | 72 | 4.5 | Sidebar width |
| `20` | 80 | 5 | Section spacing between groups |
| `24` | 96 | 6 | Large section padding on homepage |
| `35` | 140 | 8.75 | Homepage section vertical padding |

**Rationale**: The homepage uses `140px` section padding, the app pages use `32px` content padding, and cards use `20-24px` internal padding. These values are codified directly from the measured CSS.

---

## 4. Border Radius Tokens

| Token | Value | CSS Variable | Usage |
|-------|-------|-------------|-------|
| `none` | `0px` | -- | Sharp corners (dividers, separators) |
| `sm` | `8px` | `--radius-sm` | Small buttons, mini badges, input fields, KPI cells |
| `md` | `16px` | `--radius-md` | Cards, panels, alert banners, phase icons |
| `lg` | `24px` | `--radius-lg` | Large cards, identity icon, modals |
| `xl` | `32px` | `--radius-xl` | Primary cards (pool cards, stat cards, featured cards) |
| `2xl` | `40px` | -- | Extra-large containers (extrapolated) |
| `full` | `999px` | `--radius-pill` | Buttons, badges, progress bars, search inputs, avatars |

**Rationale**: The prototypes use five explicit radius values. `32px` (`--radius-xl`) is the dominant card radius across all pages. `999px` (`--radius-pill`) is used for all buttons and badges, creating the signature pill-shaped interactive elements.

---

## 5. Shadow / Elevation Levels

The prototypes rely primarily on border-color transitions and subtle glow effects rather than heavy box-shadows. This creates a sleek, flat-with-depth aesthetic.

| Level | Name | `box-shadow` Value | Usage |
|-------|------|-------------------|-------|
| 0 | `none` | `none` | Default state for most elements |
| 1 | `sm` | `0 4px 20px rgba(0,0,0,0.3)` | Chat bubble, small floating elements |
| 2 | `md` | `0 8px 32px rgba(255,255,255,0.1)` | Hovered white buttons |
| 3 | `lg` | `0 12px 40px rgba(0,0,0,0.4)` | Hovered cards (pool cards, startup cards) |
| 4 | `xl` | `0 16px 48px rgba(0,0,0,0.4)` | Hovered featured cards |
| 5 | `glow` | `0 0 24px rgba(20,184,166,0.3)` | Primary button hover glow, accent emphasis |

Additionally, accent-specific glow shadows:

| Name | Value | Usage |
|------|-------|-------|
| `glow-accent` | `0 0 30px rgba(20,184,166,0.3)` | Primary button hover (homepage) |
| `glow-red` | `0 0 20px rgba(239,68,68,0.3)` | Red/danger button hover |

**Rationale**: The prototypes achieve depth primarily through `border-color` transitions on hover (e.g., `rgba(255,255,255,.06)` to `rgba(255,255,255,.12)`) plus `translateY` transforms rather than shadows. The shadow values listed are the explicit `box-shadow` properties found in the CSS.

---

## 6. Motion & Animation Principles

### 6.1 Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | `150ms` | Quick feedback: border-color, opacity toggles (`--transition-fast`) |
| `normal` | `300ms` | Standard interactions: hover states, card transforms (`--transition`) |
| `slow` | `500ms` | Reveal animations, scroll-triggered entrances |
| `entrance` | `650ms` | Page-load stagger animations (`fadeUp`) |
| `emphasis` | `1000ms` | Progress bar fills, pulse animations |
| `ambient` | `2000-4000ms` | Background animations (pulse-dot, beam pulses) |

### 6.2 Easing Curves

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Primary easing for all UI transitions. Standard Material ease-out. |
| `ease-in` | `ease-in` | Exit animations |
| `ease-out` | `ease` | Simple opacity fades |
| `ease-in-out` | `ease-in-out` | Looping animations (pulse, beams) |

**Rationale**: `cubic-bezier(0.4, 0, 0.2, 1)` is used in every `--transition` declaration across all four prototypes. It provides a natural deceleration that feels responsive.

### 6.3 Animation Principles

1. **Staggered entrances**: Elements animate in with `fadeUp` (0 -> 24px Y, 0 -> 1 opacity) using `.d1` through `.d10` delay classes at 50ms increments. This creates a cascading reveal effect on page load.

2. **Hover feedback**: Cards lift (`translateY(-2px to -5px)`), borders brighten, and glow shadows appear. Arrow icons shift right (`translateX(3px)`). All hover transitions use 300ms.

3. **Scroll reveals**: Elements start with `opacity: 0; transform: translateY(40px)` and transition to visible when they enter the viewport via IntersectionObserver.

4. **Ambient motion**: Background elements (pulse dots on badges, radial beams, canvas textures) use long-duration looping animations to create visual interest without distracting from content.

5. **Expand/collapse**: Accordion content uses `max-height` transition. Toggle icons rotate 45deg.

6. **Progress**: Bars fill with `linear-gradient` using 1-2.5s ease timing.

### 6.4 Which Interactions Animate

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Page load | fadeUp stagger | 650ms + 50ms increments |
| Scroll into view | translateY(40px->0) + opacity | 500-700ms |
| Card hover | translateY(-2 to -5px) + border brighten + shadow | 300ms |
| Button hover | Background brighten + glow shadow | 300ms |
| Arrow icon hover | translateX(3px) | 200ms |
| Image hover (featured cards) | scale(1.05-1.06) | 600ms |
| Badge dot | pulse opacity | 2000ms loop |
| Progress bar fill | width 0->target | 1000-2500ms |
| FAQ toggle | max-height + rotate(45deg) | 400ms |
| Navbar scroll | Background blur + border appear | 300ms |

---

## 7. Iconography

### 7.1 Icon Library

**Recommended**: `lucide-react`

**Rationale**: All SVG icons in the prototypes use the same stroke-based style with:
- `stroke-width="2"` (or `2.5` for emphasis)
- `stroke-linecap="round"`
- `stroke-linejoin="round"`
- `fill="none"`

This is the exact default style of Lucide icons, which is the recommended icon library for shadcn/ui. The prototype icons are direct matches or near-matches of Lucide icon names.

### 7.2 Icon Mapping from Prototypes

| Prototype Icon | Lucide Icon Name |
|----------------|-----------------|
| Chart trend line (logo) | `TrendingUp` |
| Home | `Home` |
| Columns/Pools | `Columns3` |
| Checkmark circle | `CheckCircle` |
| Thumbs up | `ThumbsUp` |
| Pie chart | `PieChart` |
| Credit card | `CreditCard` |
| Settings gear | `Settings` |
| Search | `Search` |
| Bell | `Bell` |
| Arrow right | `ArrowRight` |
| Arrow up-right | `ArrowUpRight` |
| External link | `ExternalLink` |
| Plus | `Plus` |
| Chevron left | `ChevronLeft` |
| Dollar sign | `DollarSign` |
| Shield | `Shield` |
| Lock | `Lock` |
| Clock | `Clock` |
| Users | `Users` |
| Vote/check | `CheckCircle2` |
| Chat/message | `MessageSquare` |

### 7.3 Icon Sizes

| Token | Size | Usage |
|-------|------|-------|
| `xs` | `10px` | Inside small badges, tag icons |
| `sm` | `14px` | Meta items, breadcrumb, inline icons |
| `md` | `16px` | Toolbar buttons, search icons, activity feed |
| `lg` | `18px` | Topbar icons, stat card icons, sidebar items |
| `xl` | `20px` | Sidebar nav items |
| `2xl` | `24px` | Phase icons, feature icons |
| `3xl` | `44px` | Identity visualization icon |

### 7.4 Icon Usage Rules

1. **Always use stroke style**, never filled icons. This matches the prototype aesthetic.
2. **Default stroke-width is 2**. Use 2.5 for emphasized icons (logo, badges).
3. **Icon color inherits** from parent `color` property (via `currentColor`).
4. **Icon containers**: When icons sit in colored backgrounds (stat cards, activity feed), use a rounded-square container (`border-radius: 10-14px`) with a tinted background matching the icon color at 8-12% opacity.
5. **Interactive icons**: In buttons, icons appear before or after text with an 8px gap. Arrow icons animate `translateX(3px)` on hover.

---

## 8. Glassmorphism & Backdrop Effects

A key design motif throughout the prototypes is glassmorphism -- semi-transparent surfaces with blur.

### 8.1 Glass Surfaces

| Surface | Background | Border | Blur |
|---------|-----------|--------|------|
| Glass button | `rgba(255,255,255,0.06)` | `1px solid rgba(255,255,255,0.1)` | `blur(8px)` |
| Scrolled navbar | `rgba(10,10,10,0.85)` | `1px solid rgba(255,255,255,0.05)` | `blur(20px)` |
| Topbar | `rgba(10,10,10,0.8)` | `1px solid rgba(255,255,255,0.05)` | `blur(20px)` |
| Badge | `rgba(255,255,255,0.07)` | `1px solid rgba(255,255,255,0.1)` | `blur(12px)` |
| Mountain label | -- | `1px solid rgba(20,184,166,0.2)` | `blur(6px)` |
| Breadcrumb bar | `rgba(10,10,10,0.92)` | -- | `blur(12px)` |

### 8.2 Ambient Glow Effects

Large, fixed-position radial gradients create subtle teal ambient lighting:

- **Top-right glow**: `radial-gradient(ellipse 60% 50% at 70% 30%, rgba(20,184,166,0.04), transparent 60%)`
- **Bottom-left glow**: `radial-gradient(ellipse 50% 50% at 30% 70%, rgba(20,184,166,0.03), transparent 60%)`

These are `position: fixed` with `pointer-events: none` and `z-index: 0`, creating a persistent atmospheric effect behind all content.

---

## 9. Layout System

### 9.1 Page Layouts

| Layout | Pages | Structure |
|--------|-------|-----------|
| Marketing | Homepage | Full-width, no sidebar, max-width 1280px content |
| Application | Dashboard, Pools, Pool Detail | Fixed sidebar (72px) + Fixed topbar (64px) + Scrollable main |

### 9.2 Grid Patterns

| Grid | Columns | Gap | Usage |
|------|---------|-----|-------|
| Stats row | 4 (responsive -> 2 -> 1) | 16px | KPI stat cards |
| Pool cards | 3 (responsive -> 2 -> 1) | 16-20px | Pool grid browsing |
| Featured bento | 1.3fr 1fr 1fr | 16px | Dashboard featured section |
| Middle row | 1fr 380px | 24px | Pools + Activity side-by-side |
| Portfolio | 3 (responsive -> 2 -> 1) | 16px | Portfolio cards |
| How it works | 3 (responsive -> 1) | 2px | Phase cards |
| Benefits | 3 (responsive -> 1) | 0 (separated by borders) | Benefits columns |
| Hero pool | 1fr 340px | 0 (border divider) | Featured pool card |
| Pool detail | Sticky sidebar + Main | -- | Dual-column with sticky left |

### 9.3 Container Widths

| Container | Max Width |
|-----------|-----------|
| Marketing content | 1280px |
| App content | 1400px |
| Pool detail content | 1280px |
| Hero text | 820px (centered) |
| Subtitle text | 480-560px |

---

## 10. Responsive Breakpoints

| Breakpoint | Value | Tailwind Class | Key Changes |
|-----------|-------|----------------|-------------|
| Mobile | `< 768px` | Default | Sidebar hidden, 1-col layouts, reduced padding |
| Tablet | `768px - 1023px` | `md:` | 2-col grids, compact topbar |
| Desktop | `1024px - 1199px` | `lg:` | Featured bento restructure, 2-col stats |
| Wide | `>= 1200px` | `xl:` | Full 3-4 col grids, side panels |

---

## 11. Z-Index Scale

| Level | Value | Usage |
|-------|-------|-------|
| Base | 0 | Ambient glow backgrounds |
| Content | 1 | Page content, canvas backgrounds |
| Cards | 2-10 | Cards, panels, overlays |
| Topbar | 90 | Fixed top navigation |
| Sidebar | 100 | Fixed side navigation |
| Modal overlay | 900 | (Reserved) Modal backdrop |
| Modal | 1000 | (Reserved) Modal content |
| Toast | 1100 | (Reserved) Toast notifications |

**Rationale**: The z-index values are taken directly from the prototype CSS (`z-index: 90` for topbar, `z-index: 100` for sidebar). Higher values are reserved for UI patterns not yet in the prototypes but expected in the full application (modals, toasts).

---

## 12. Accessibility Considerations

### Contrast Ratios

- White text (`#FFFFFF`) on `#0A0A0A` background: **21:1** (exceeds AAA)
- White text on `#161616` card: **14.7:1** (exceeds AAA)
- Teal accent (`#14B8A6`) on `#0A0A0A`: **8.6:1** (exceeds AA)
- Grey-400 (`#999`) on `#0A0A0A`: **7.4:1** (exceeds AA)
- Grey-500 (`#666`) on `#0A0A0A`: **4.7:1** (meets AA for normal text)
- Grey-600 (`#444`) on `#0A0A0A`: **2.8:1** (below AA -- use only for decorative/large text)

### Recommendations

1. Avoid using `grey-600` for informational text smaller than 18px. Use `grey-500` minimum.
2. All interactive elements must have visible focus rings using `ring` color (`rgba(20,184,166,0.3)`).
3. Badge colors on dark backgrounds all exceed AA contrast.
4. Ensure semantic color pairings (error red on dark, success green on dark) maintain at least 4.5:1 contrast.
