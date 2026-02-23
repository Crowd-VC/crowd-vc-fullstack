# CrowdVC Page Redesign Prompt

Use the following prompt with `/frontend-design` to redesign any page. Replace `{{PAGE_PATH}}`, `{{PAGE_NAME}}`, and `{{PAGE_PURPOSE}}` with the actual values.

---

```
FROM HERE ON OUT, TREAT THE {{XYZ}} SYNTAX AS A VARIABLE WHOSE DEFINITIONS ARE GIVEN ABOVE.
Redesign the page at '{{PAGE_PATH}}' as a single standalone HTML demo file. This is a static design mockup — no functionality needed. Output to a file named `{{PAGE_NAME}}-demo.html` in the project root.

## Execution Strategy: Use Agent Teams

### Teammate 1: Content Strategist
A senior product designer / content strategist. It's job:

1. **Read the existing page** at {{PAGE_PATH}} and every component it imports. Understand what data exists, what the user flows are, and what's missing.
2. **Audit the current content** — ask: Is this enough for a professional dashboard page? What sections are missing that users would expect? What information hierarchy makes sense?
3. **Plan the page sections** — produce a numbered list of every section the page needs, in scroll order. For each section, define:
   - Section name and purpose
   - What data/content it displays
   - Why it matters to the user (investor, startup founder, or admin)
   - Priority: above-the-fold vs. below-the-fold
4. **Define the content** — write out the actual text, labels, stat values, card contents, and placeholder data for every section. Use real startup names and realistic numbers. No lorem ipsum.

Output: A complete content map before any design or code begins.

Teammate 2: Layout & Design Architect
A senior UI/UX designer. Using the content map from Phase 1, your job:

1. **Choose the layout composition** for each section — grid vs. flex, column counts, card sizes, spacing. Consider:
   - Visual hierarchy: what should the eye hit first?
   - Density: balance information richness with breathing room
   - Rhythm: alternate between full-width sections, grids, and side-by-side layouts to avoid monotony
   - Responsiveness: how does each section collapse on smaller screens?
2. **Define the visual weight** — which sections get hero treatment (large, image-heavy), which are compact data displays, which are lists/tables.
3. **Plan interactions** — hover states, card elevations, scroll behavior, stagger animation order.
4. **Sketch the layout** — describe each section's structure in plain language (e.g., "3-column bento grid, first card spans 1.3fr, all cards 380px height, gap 16px").

Output: A section-by-section layout blueprint with exact grid/flex specs.

Teammate 3: Frontend Engineer
Now act as an expert frontend engineer. Using both the content map and layout blueprint, write the complete HTML file. Your job:

1. **Implement pixel-perfect** — follow the design system tokens exactly, no improvisation on colors/fonts/radii.
2. **Write clean, organized CSS in tailwind** — group styles by component, use CSS variables, comment section breaks.
3. **Ensure no layout bugs** — fixed heights where needed, proper overflow handling, object-fit cover on all images, no content clipping.
4. **Add polish** — stagger animations, hover micro-interactions, ambient background glows.
5. **Test mentally** — walk through the page at 1440px, 1024px, and 768px widths. Fix any responsive issues before outputting.

Output: The final HTML file.

---

## Design System — MUST follow exactly

### Fonts
- Display: 'Syne' (weights: 400–800) — all headings, stat values, card titles
- Body: 'DM Sans' (weights: 300–700) — all body text, labels, descriptions
- Load via: https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@400;500;600;700;800&display=swap

### Color Tokens
- --bg: #0A0A0A (page background)
- --bg-elevated: #111111 (sidebar, panels)
- --bg-card: #161616 (card backgrounds)
- --accent: #14B8A6 (teal — primary accent)
- --accent-glow: rgba(20,184,166,.15)
- --accent-dim: rgba(20,184,166,.08)
- --white: #FFFFFF
- --grey-100: #F5F5F5, --grey-200: #E5E5E5, --grey-400: #999, --grey-500: #666, --grey-600: #444, --grey-700: #2A2A2A, --grey-800: #1A1A1A
- Status colors: green #22c55e, yellow #f59e0b, blue #3b82f6, purple #8b5cf6, orange #f97316, red #ef4444
- All status colors are used at ~12% opacity for backgrounds, full saturation for text

### Border Radius
- --radius-sm: 8px, --radius-md: 16px, --radius-lg: 24px, --radius-xl: 32px, --radius-pill: 999px

### Layout Shell (include on every page)
- Fixed sidebar: 72px wide, #111111 bg, 1px right border rgba(255,255,255,.05)
  - Logo: 40x40px teal (#14B8A6) rounded-12px box with trend-line SVG icon
  - Nav items: 44x44px rounded-14px, icons 20px, grey-500 default, accent-dim + accent color when active, 3px left indicator bar
  - Bottom: settings icon + avatar circle (gradient: #f97316 to #ec4899)
- Fixed topbar: 64px tall, rgba(10,10,10,.8) bg, backdrop-filter blur(20px), 1px bottom border
  - Left: pill search input (280px, rounded-pill, glass style)
  - Center: "Crowd VC" logo text in Syne 700 with teal trend SVG
  - Right: notification bell (with teal dot), wallet icon, avatar
- Main content: margin-left 72px, padding-top 64px, padding 32px, max-width 1400px
- Copy the sidebar and topbar HTML exactly from `/Users/rahmanwolied/Documents/Work/CrowdVC/Criptic/dashboard-demo.html` — do not recreate them from scratch.

### Card Patterns
- All cards: bg-card, 1px border rgba(255,255,255,.06), rounded-xl (32px)
- Hover: border lightens to rgba(255,255,255,.12), translateY(-3px to -6px), box-shadow 0 12-16px 40-48px rgba(0,0,0,.4-.5)
- Top accent lines on cards: 3px height, linear-gradient(90deg, var(--accent), #0fd9c4) for active, #f59e0b→#f97316 for upcoming, grey for closed
- Progress bars: 3-4px height, rounded, bg rgba(255,255,255,.06), fill gradient accent→#0fd9c4

### Badge/Pill Patterns
- Tags: rounded-pill, ~.68rem font, 600 weight, uppercase with .04em letter-spacing
- Status badges: 3px 10px padding, .68rem, 600 weight, colored bg at 12% opacity
- Section labels: Syne .75rem, uppercase, .15em letter-spacing, grey-500

### Button Patterns
- Primary: bg accent, color #000, hover: bg #0fd9c4 + box-shadow glow
- Glass: bg rgba(255,255,255,.06), white text, 1px border rgba(255,255,255,.1), backdrop-filter blur(8px)
- All buttons: rounded-pill, .85rem, 600 weight, 10px 22px padding

### Image Cards (startup/pitch cards)
- Image wrapper with fixed height (180-200px), overflow hidden
- object-fit: cover, scale(1.05-1.06) on hover with .5-.6s cubic-bezier(.4,0,.2,1)
- Gradient overlay: linear-gradient(0deg, rgba(22,22,22,1) 0%, rgba(22,22,22,.15) 40%, transparent 70%)
- 3px progress bar at absolute bottom of image

### Section Headers
- Title: Syne 1.3rem 700, letter-spacing -.03em
- Subtitle: .85rem grey-500, margin-top 3px
- "View All" link: .85rem 500 grey-400, hover accent, arrow SVG slides right 3px

### Horizontal Scroll Carousels
- display: flex, gap 14-16px, overflow-x auto, hidden scrollbar
- Cards: min-width/max-width fixed (260-300px), flex-shrink 0

### Animations
- Page load: fadeUp (opacity 0→1, translateY 24px→0), .65s cubic-bezier(.4,0,.2,1)
- Stagger delays: .05s increments via .d1 through .d10 classes
- IntersectionObserver triggers at threshold 0.08
- Hover transitions: all .3s cubic-bezier(.4,0,.2,1)

### Ambient Background
- Two fixed radial gradient blobs (teal at 3-4% opacity), positioned top-right and bottom-left
- Creates subtle depth without distraction

### Available Images
All in `apps/web/public/images/startups/`:
artlink.png, astrayield.png, ecorise.png, ecorise-featured.png, ehub.png, learnsphere.png, learnsphere-featured.png, mintopia.png, mintopia-featured.png, mosaicx.png, neurocare.png, nexafinance.png, pixelhaven.png, projectphoenix.png, synaptek.png, vaultedge.png, vitalpath.png

Logo: `apps/web/public/images/crowdvc-logo.png`

### Page-Specific Content
{{PAGE_PURPOSE}}

Read the existing page component at {{PAGE_PATH}} and any components it imports to understand what data and sections currently exist. Redesign it following all the design tokens above. Keep the sidebar and topbar identical across all pages. Use real startup names and images from the available set.
```

---

## Example Usage

**Pools listing page:**

```
{{PAGE_PATH}} = apps/web/src/app/dashboard/pools/page.tsx
{{PAGE_NAME}} = pools
{{PAGE_PURPOSE}} = This page lists all investment pools. Show pool cards in a grid layout (not carousel) with filtering by status (active/upcoming/closed) and category. Include a hero stat bar showing total pools, total funding, and active investors. Each pool card should show name, category, status, description, funding progress, deadline, startup count, and vote count.
```

**Single pool detail page:**

```
{{PAGE_PATH}} = apps/web/src/app/dashboard/pools/[id]/page.tsx
{{PAGE_NAME}} = pool-detail
{{PAGE_PURPOSE}} = Detail view for a single investment pool. Show pool header with name, status, category, and description. Include funding progress (large bar), contribution form area, list of startups in the pool with voting UI, milestone timeline for funded startups, and pool activity feed.
```

**Pitches page:**

```
{{PAGE_PATH}} = apps/web/src/app/dashboard/pitches/page.tsx
{{PAGE_NAME}} = pitches
{{PAGE_PURPOSE}} = Browse and filter all startup pitches. Grid of pitch cards with status filtering (approved, pending, in-pool, etc.), industry filtering, and search. Include featured/trending section at top.
```
