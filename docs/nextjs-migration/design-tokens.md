# CrowdVC Design Tokens & Configuration

This document provides the exact Tailwind CSS configuration and CSS custom property declarations needed to implement the CrowdVC design system in a Next.js + shadcn/ui project.

---

## 1. Tailwind Configuration (`tailwind.config.ts`)

The following `theme.extend` block should be placed inside your `tailwind.config.ts`. It extends (not replaces) Tailwind defaults.

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // ========================================
      // COLORS
      // ========================================
      colors: {
        // shadcn/ui semantic colors (reference CSS variables)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // CrowdVC brand colors (direct hex for utility usage)
        teal: {
          DEFAULT: "#14B8A6",
          50: "rgba(20, 184, 166, 0.08)",
          100: "rgba(20, 184, 166, 0.15)",
          400: "#0FD9C4",
          500: "#14B8A6",
          600: "#0D9488",
        },

        // Gray scale matching prototypes
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#999999",
          500: "#666666",
          600: "#444444",
          700: "#2A2A2A",
          800: "#1A1A1A",
          900: "#111111",
          950: "#0A0A0A",
        },

        // Semantic status colors
        success: {
          DEFAULT: "#10B981",
          bright: "#22C55E",
          dim: "rgba(34, 197, 94, 0.1)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          dim: "rgba(245, 158, 11, 0.12)",
        },
        error: {
          DEFAULT: "#EF4444",
          dim: "rgba(239, 68, 68, 0.1)",
        },
        info: {
          DEFAULT: "#3B82F6",
          dim: "rgba(59, 130, 246, 0.08)",
        },
        purple: {
          DEFAULT: "#8B5CF6",
          dim: "rgba(139, 92, 246, 0.08)",
        },
        orange: {
          DEFAULT: "#F97316",
          dim: "rgba(249, 115, 22, 0.08)",
        },
      },

      // ========================================
      // FONT FAMILIES
      // ========================================
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      // ========================================
      // FONT SIZES
      // ========================================
      fontSize: {
        // Display / Hero
        "display": ["clamp(2.8rem, 5.8vw, 4.8rem)", { lineHeight: "1.08", letterSpacing: "-0.04em", fontWeight: "800" }],
        // Headings
        "h1": ["clamp(2rem, 4vw, 3.2rem)", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "700" }],
        "h2": ["1.8rem", { lineHeight: "1.2", letterSpacing: "-0.03em", fontWeight: "700" }],
        "h3": ["1.3rem", { lineHeight: "1.3", letterSpacing: "-0.03em", fontWeight: "700" }],
        "h4": ["1.05rem", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "700" }],
        // Body
        "body-lg": ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body": ["0.92rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.88rem", { lineHeight: "1.5", fontWeight: "400" }],
        // Utility
        "caption": ["0.78rem", { lineHeight: "1.4", fontWeight: "500" }],
        "label": ["0.75rem", { lineHeight: "1", letterSpacing: "0.15em", fontWeight: "600" }],
        "overline": ["0.72rem", { lineHeight: "1", letterSpacing: "0.04em", fontWeight: "600" }],
        // Stats
        "stat-lg": ["1.6rem", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "800" }],
        "stat-md": ["1.15rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "stat-sm": ["0.88rem", { lineHeight: "1", fontWeight: "700" }],
        // Meta / Micro
        "meta": ["0.7rem", { lineHeight: "1.4", fontWeight: "400" }],
        "micro": ["0.65rem", { lineHeight: "1", fontWeight: "400" }],
      },

      // ========================================
      // SPACING (extends Tailwind's default scale)
      // ========================================
      spacing: {
        "4.5": "1.125rem",  // 18px — sidebar width (72px = 18*4)
        "13": "3.25rem",    // 52px — phase icon size
        "15": "3.75rem",    // 60px
        "18": "4.5rem",     // 72px — sidebar width
        "22": "5.5rem",     // 88px
        "35": "8.75rem",    // 140px — homepage section padding
        "sidebar": "72px",
        "topbar": "64px",
      },

      // ========================================
      // BORDER RADIUS
      // ========================================
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // CrowdVC specific
        "card": "32px",
        "panel": "24px",
        "button": "16px",
        "badge": "999px",
        "pill": "999px",
      },

      // ========================================
      // BOX SHADOW
      // ========================================
      boxShadow: {
        "sm": "0 4px 20px rgba(0, 0, 0, 0.3)",
        "md": "0 8px 32px rgba(255, 255, 255, 0.1)",
        "lg": "0 12px 40px rgba(0, 0, 0, 0.4)",
        "xl": "0 16px 48px rgba(0, 0, 0, 0.4)",
        "glow": "0 0 24px rgba(20, 184, 166, 0.3)",
        "glow-lg": "0 0 30px rgba(20, 184, 166, 0.3)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
      },

      // ========================================
      // KEYFRAMES
      // ========================================
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up-subtle": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(16px)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "progress-fill": {
          from: { width: "0%" },
          to: { width: "var(--progress-target, 100%)" },
        },
        "spin": {
          to: { transform: "rotate(360deg)" },
        },
        // shadcn/ui accordion
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      // ========================================
      // ANIMATIONS
      // ========================================
      animation: {
        "fade-up": "fade-up 0.65s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-up-subtle": "fade-up-subtle 0.65s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
        "slide-down": "slide-down 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
        "slide-in-right": "slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "progress-fill": "progress-fill 2.5s ease both",
        "spin": "spin 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      // ========================================
      // TRANSITION TIMING FUNCTION
      // ========================================
      transitionTimingFunction: {
        "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // ========================================
      // TRANSITION DURATION
      // ========================================
      transitionDuration: {
        "fast": "150ms",
        "normal": "300ms",
        "slow": "500ms",
        "entrance": "650ms",
      },

      // ========================================
      // BACKDROP BLUR
      // ========================================
      backdropBlur: {
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "20px",
      },

      // ========================================
      // MAX WIDTH
      // ========================================
      maxWidth: {
        "content": "1400px",
        "content-narrow": "1280px",
        "hero-text": "820px",
        "subtitle": "560px",
        "subtitle-sm": "480px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 2. Global CSS (`globals.css`)

This file declares all CSS custom properties that shadcn/ui components consume, plus CrowdVC-specific custom tokens.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================================
   GOOGLE FONTS
   ============================================================ */
/* Import in layout.tsx using next/font/google instead:
   import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
   This CSS import is a fallback only. */

/* ============================================================
   CSS CUSTOM PROPERTIES — LIGHT MODE (default)
   ============================================================ */
@layer base {
  :root {
    /* --- shadcn/ui required variables (HSL format) --- */
    --background: 0 0% 100%;
    --foreground: 0 0% 4%;

    --card: 0 0% 100%;
    --card-foreground: 0 0% 4%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 4%;

    --primary: 170 77% 39%;
    --primary-foreground: 0 0% 0%;

    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 4%;

    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 40%;

    --accent: 170 77% 39% / 0.08;
    --accent-foreground: 170 77% 39%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 0% / 0.08;
    --input: 0 0% 0% / 0.08;
    --ring: 170 77% 39% / 0.3;

    /* shadcn/ui radius */
    --radius: 0.5rem;

    /* --- CrowdVC brand tokens --- */
    --crowdvc-bg: #FFFFFF;
    --crowdvc-bg-elevated: #F5F5F5;
    --crowdvc-bg-card: #FFFFFF;
    --crowdvc-bg-card-hover: #FAFAFA;
    --crowdvc-accent: #14B8A6;
    --crowdvc-accent-hover: #0FD9C4;
    --crowdvc-accent-glow: rgba(20, 184, 166, 0.15);
    --crowdvc-accent-dim: rgba(20, 184, 166, 0.08);
    --crowdvc-border: rgba(0, 0, 0, 0.08);
    --crowdvc-border-hover: rgba(0, 0, 0, 0.15);

    /* --- Typography --- */
    --font-display: 'Syne', ui-sans-serif, system-ui, sans-serif;
    --font-body: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, monospace;

    /* --- Transition --- */
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-fast: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);

    /* --- Layout --- */
    --sidebar-width: 72px;
    --topbar-height: 64px;

    /* --- Semantic status --- */
    --success: #10B981;
    --success-bright: #22C55E;
    --warning: #F59E0B;
    --danger: #EF4444;
    --info: #3B82F6;
    --purple: #8B5CF6;
    --orange: #F97316;
  }

  /* ============================================================
     CSS CUSTOM PROPERTIES — DARK MODE
     ============================================================ */
  .dark {
    --background: 0 0% 4%;
    --foreground: 0 0% 100%;

    --card: 0 0% 9%;
    --card-foreground: 0 0% 100%;

    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 100%;

    --primary: 170 77% 39%;
    --primary-foreground: 0 0% 0%;

    --secondary: 0 0% 7%;
    --secondary-foreground: 0 0% 100%;

    --muted: 0 0% 10%;
    --muted-foreground: 0 0% 60%;

    --accent: 170 77% 39% / 0.08;
    --accent-foreground: 170 77% 39%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 100% / 0.06;
    --input: 0 0% 100% / 0.06;
    --ring: 170 77% 39% / 0.3;

    /* --- CrowdVC brand tokens (dark) --- */
    --crowdvc-bg: #0A0A0A;
    --crowdvc-bg-elevated: #111111;
    --crowdvc-bg-card: #161616;
    --crowdvc-bg-card-hover: #1C1C1C;
    --crowdvc-accent: #14B8A6;
    --crowdvc-accent-hover: #0FD9C4;
    --crowdvc-accent-glow: rgba(20, 184, 166, 0.15);
    --crowdvc-accent-dim: rgba(20, 184, 166, 0.08);
    --crowdvc-border: rgba(255, 255, 255, 0.06);
    --crowdvc-border-hover: rgba(255, 255, 255, 0.12);
  }
}

/* ============================================================
   BASE STYLES
   ============================================================ */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Scrollbar styling (matches prototypes) */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #2A2A2A;
    border-radius: 3px;
  }
  .dark ::-webkit-scrollbar-thumb {
    background: #2A2A2A;
  }
  :root ::-webkit-scrollbar-thumb {
    background: #D4D4D4;
  }
}

/* ============================================================
   UTILITY CLASSES
   ============================================================ */
@layer utilities {
  /* Glass surface utilities */
  .glass {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
  }

  .glass-strong {
    background: rgba(10, 10, 10, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
  }

  /* Ambient glow backgrounds */
  .ambient-glow {
    position: fixed;
    pointer-events: none;
    z-index: 0;
  }
  .ambient-glow-tr {
    top: -20%;
    right: -10%;
    width: 60%;
    height: 70%;
    background: radial-gradient(
      ellipse 60% 50% at 70% 30%,
      rgba(20, 184, 166, 0.04) 0%,
      transparent 60%
    );
  }
  .ambient-glow-bl {
    bottom: -30%;
    left: -15%;
    width: 50%;
    height: 60%;
    background: radial-gradient(
      ellipse 50% 50% at 30% 70%,
      rgba(20, 184, 166, 0.03) 0%,
      transparent 60%
    );
  }

  /* Gradient text (CTA banner title effect) */
  .text-gradient {
    background: linear-gradient(180deg, #fff 50%, rgba(255, 255, 255, 0.5) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Progress bar gradient */
  .gradient-accent {
    background: linear-gradient(90deg, #14B8A6, #0FD9C4);
  }

  /* Stagger delay utilities for fade-up animations */
  .delay-1 { animation-delay: 0.05s; }
  .delay-2 { animation-delay: 0.10s; }
  .delay-3 { animation-delay: 0.15s; }
  .delay-4 { animation-delay: 0.20s; }
  .delay-5 { animation-delay: 0.25s; }
  .delay-6 { animation-delay: 0.30s; }
  .delay-7 { animation-delay: 0.35s; }
  .delay-8 { animation-delay: 0.40s; }
  .delay-9 { animation-delay: 0.45s; }
  .delay-10 { animation-delay: 0.50s; }
}
```

---

## 3. Next.js Font Setup (`layout.tsx` font imports)

Use `next/font/google` for optimized font loading:

```typescript
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

// Apply to <html> element:
// className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
```

---

## 4. HSL Value Reference

For convenience, here are the HSL conversions of all key colors:

| Color | Hex | HSL |
|-------|-----|-----|
| `#14B8A6` (teal/primary) | — | `170 77% 39%` |
| `#0FD9C4` (teal hover) | — | `173 85% 45%` |
| `#0A0A0A` (bg dark) | — | `0 0% 4%` |
| `#111111` (elevated dark) | — | `0 0% 7%` |
| `#161616` (card dark) | — | `0 0% 9%` |
| `#1A1A1A` (muted dark) | — | `0 0% 10%` |
| `#1C1C1C` (card hover dark) | — | `0 0% 11%` |
| `#2A2A2A` (grey-700) | — | `0 0% 16%` |
| `#444444` (grey-600) | — | `0 0% 27%` |
| `#666666` (grey-500) | — | `0 0% 40%` |
| `#999999` (grey-400) | — | `0 0% 60%` |
| `#E5E5E5` (grey-200) | — | `0 0% 90%` |
| `#F5F5F5` (grey-100) | — | `0 0% 96%` |
| `#EF4444` (error/red) | — | `0 84% 60%` |
| `#22C55E` (success green) | — | `142 71% 45%` |
| `#10B981` (success) | — | `160 60% 39%` |
| `#F59E0B` (warning) | — | `38 92% 50%` |
| `#3B82F6` (info blue) | — | `217 91% 60%` |
| `#8B5CF6` (purple) | — | `258 90% 66%` |
| `#F97316` (orange) | — | `25 95% 53%` |
