// Common CSS classes for landing page components
export const landingStyles = {
    // Container styles
    container: "container mx-auto px-6 lg:px-10",

    // Section styles
    section: "py-28 lg:py-36",
    sectionCompact: "py-20 lg:py-28",

    // Text styles
    heading: {
        large:
            "text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[64px]",
        medium:
            "text-5xl font-black leading-[1.1] tracking-[-0.04em] text-foreground lg:text-[56px]",
        small: "text-xl font-bold tracking-tight text-foreground",
    },

    paragraph: {
        large:
            "text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[21px]",
        medium:
            "text-lg font-normal leading-relaxed tracking-tight text-muted-foreground lg:text-[19px]",
        small:
            "text-sm font-normal leading-[1.65] tracking-tight text-muted-foreground",
    },

    // Card styles
    card: {
        base:
            "rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-border/80 hover:bg-card",
        padded: "px-8 py-10",
        compact: "px-6 py-9",
    },

    // Button styles
    button: {
        primary:
            "py-4.5 rounded-[10px] bg-foreground px-9 text-base font-bold tracking-tight text-background shadow-sm transition-all hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-lg",
        secondary:
            "border-1.5 py-4.5 rounded-[10px] border-border bg-transparent px-9 text-base font-bold tracking-tight text-foreground transition-all hover:border-border/80 hover:bg-card/50",
    },

    // Grid styles
    grid: {
        features: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3",
        stats: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
        process: "grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4",
        tech: "grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5",
        footer:
            "grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-20",
    },

    // Icon styles
    icon: {
        large:
            "flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card text-[26px]",
        small:
            "flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-base",
    },

    // Layout styles
    centerContent: "mx-auto max-w-[900px] text-center",
    centerContentLarge: "mx-auto max-w-[1100px] text-center",
    centerContentWide: "mx-auto max-w-[1200px]",

    // Badge styles
    badge:
        "px-4.5 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/50 py-2 backdrop-blur-sm",

    // Logo styles
    logo: {
        container:
            "flex h-11 w-11 items-center justify-center rounded-[10px] border border-border bg-gradient-to-br from-muted to-card text-lg font-extrabold tracking-tight text-foreground",
        text: "text-[22px] font-extrabold tracking-tight text-foreground",
    },
} as const;
