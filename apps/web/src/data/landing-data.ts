export interface Testimonial {
    quote: string;
    name: string;
    title: string;
}

export interface Statistic {
    value: string;
    label: string;
}

export interface Feature {
    icon: string;
    title: string;
    description: string;
    gradient: string;
}

export interface ProcessStep {
    number: string;
    title: string;
    description: string;
}

export interface TechItem {
    icon: string;
    name: string;
    description: string;
}

export interface Pool {
    id: string;
    title: string;
    description: string;
    badge: {
        label: string;
        variant: 'trending' | 'halal' | 'new';
    };
    progress: {
        current: string;
        target: string;
        percentage: number;
    };
    stats: {
        minInvestment: string;
        investors: number;
        timeLeft: string;
    };
}

export interface FAQ {
    question: string;
    answer: string;
}

export const testimonials: Testimonial[] = [
    {
        quote:
            "CrowdVC democratized my access to startups I'd never reach as a retail investor. The AI scoring gave me confidence to invest $50K across 10 companies.",
        name: "Ahmed Khalil",
        title: "Angel Investor, Dubai",
    },
    {
        quote:
            "Raised $200K in 48 hours through CrowdVC. The DAO voting gave us 200+ engaged investors who became brand ambassadors. Game-changing.",
        name: "Sarah Parker",
        title: "CEO, HealthTech Startup",
    },
    {
        quote:
            "Finally, Shariah-compliant VC access. The halal certification and transparent governance make this the first platform I trust with my family's capital.",
        name: "Omar Al-Rashid",
        title: "Private Investor, Riyadh",
    },
];

export const statistics: Statistic[] = [
    {
        value: "$2.4M",
        label: "Capital Deployed",
    },
    {
        value: "47",
        label: "Funded Startups",
    },
    {
        value: "1,234",
        label: "Active Investors",
    },
];

export const features: Feature[] = [
    {
        icon: "ai-scoring",
        title: "AI-Powered Scoring",
        description:
            "Proprietary algorithm analyzing 127 data points across team, traction, market, and financials. Each startup scored 0-100 for transparent evaluation.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
    {
        icon: "smart-contract",
        title: "Smart Contract Automation",
        description:
            "Ethereum-based escrow with automated fund distribution. Voting closes, funds deploy instantly. Zero intermediaries, zero manual delays.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
    {
        icon: "diversified",
        title: "Diversified Investment Pools",
        description:
            "Pre-curated baskets of 5-10 startups per pool. One transaction diversifies across sectors, stages, and geographies. Risk-managed from day one.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
    {
        icon: "transparent",
        title: "Transparent DAO Voting",
        description:
            "Your capital, your voice. Vote for startups you believe in. Voting power proportional to investment. All decisions recorded on-chain, immutable and public.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
    {
        icon: "global",
        title: "Global Access",
        description:
            "Invest from anywhere in UAE, MENA, EU, US, and Southeast Asia. One platform, endless opportunities.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
    {
        icon: "security",
        title: "Bank-Grade Security",
        description:
            "Multi-sig wallets, audited smart contracts, and institutional custody. Your capital is fortress-protected.",
        gradient: "from-slate-900/10 to-slate-800/10",
    },
];

export const processSteps: ProcessStep[] = [
    {
        number: "1",
        title: "Connect Wallet & Verify",
        description:
            "Secure MetaMask integration with optional KYC verification for institutional-grade compliance. Multi-sig wallet support available for large allocations. Your keys, your control.",
    },
    {
        number: "2",
        title: "Browse AI-Scored Investment Pools",
        description:
            "Explore curated pools with startups scored 0-100 by our proprietary AI. Review pitch decks, traction metrics, team backgrounds, and market analysis. Filter by industry, region, or Shariah compliance.",
    },
    {
        number: "3",
        title: "Deploy Capital & Vote",
        description:
            "Allocate funds to your chosen pools with voting rights proportional to investment size. Smart contracts escrow your capital securely. Cast votes for your preferred startups in transparent, on-chain governance.",
    },
    {
        number: "4",
        title: "Automated Distribution & Equity Tokens",
        description:
            "When voting closes, smart contracts automatically transfer funds to winning startups. Equity tokens representing your ownership stake appear instantly in your wallet. Track performance and await liquidity events.",
    },
];

export const techStack: TechItem[] = [
    {
        icon: "⚡",
        name: "Arbitrum",
        description: "Layer 2 Scaling",
    },
    {
        icon: "📜",
        name: "Smart Contracts",
        description: "Audited Code",
    },
    {
        icon: "🦊",
        name: "MetaMask",
        description: "Secure Custody",
    },
    {
        icon: "🤖",
        name: "AI Engine",
        description: "Scoring Algorithm",
    },
    {
        icon: "💾",
        name: "IPFS",
        description: "Decentralized Storage",
    },
];

export const pools: Pool[] = [
    {
        id: "ai-ml-startups",
        title: "AI & Machine Learning Startups",
        description: "5 pre-vetted AI startups with proven traction. Average AI score: 87/100.",
        badge: {
            label: "🔥 TRENDING",
            variant: "trending",
        },
        progress: {
            current: "$156K",
            target: "$200K",
            percentage: 78,
        },
        stats: {
            minInvestment: "$10K",
            investors: 142,
            timeLeft: "3 Days",
        },
    },
    {
        id: "shariah-fintech",
        title: "Shariah-Compliant FinTech",
        description: "4 Islamic finance startups transforming MENA banking. Fully halal-certified.",
        badge: {
            label: "✓ HALAL",
            variant: "halal",
        },
        progress: {
            current: "$45K",
            target: "$100K",
            percentage: 45,
        },
        stats: {
            minInvestment: "$5K",
            investors: 67,
            timeLeft: "7 Days",
        },
    },
    {
        id: "climate-tech",
        title: "Climate Tech Innovators",
        description: "6 sustainability startups solving carbon, energy, and waste challenges.",
        badge: {
            label: "✨ NEW",
            variant: "new",
        },
        progress: {
            current: "$34K",
            target: "$150K",
            percentage: 23,
        },
        stats: {
            minInvestment: "$8K",
            investors: 38,
            timeLeft: "12 Days",
        },
    },
];

export const faqs: FAQ[] = [
    {
        question: "What's the minimum investment amount?",
        answer: "Minimum investment varies by pool, typically $5K-$10K. This allows meaningful diversification while keeping entry barriers low for retail investors.",
    },
    {
        question: "How does the AI scoring work?",
        answer: "Our proprietary algorithm analyzes 127 data points including team backgrounds, traction metrics, market size, competitive landscape, financial projections, and historical performance. Each startup receives a 0-100 score updated in real-time.",
    },
    {
        question: "Are Shariah-compliant pools really halal?",
        answer: "Yes. All Shariah-compliant pools are certified by independent Islamic scholars. We exclude startups in prohibited sectors (alcohol, gambling, interest-based finance) and ensure equity-based structures comply with Musharakah principles.",
    },
    {
        question: "When do I receive equity tokens?",
        answer: "Equity tokens (ERC-20 compatible) are distributed immediately after voting closes and funds are deployed to winning startups. Tokens appear in your connected wallet within minutes and represent legal ownership rights.",
    },
    {
        question: "What if a startup fails?",
        answer: "Venture capital is high-risk. Our diversified pools mitigate single-startup failure. If one company fails, your other investments can offset losses. Historically, 1-2 winners per pool generate returns that cover all losses.",
    },
    {
        question: "Can I trade my equity tokens?",
        answer: "Not yet. Equity tokens represent real ownership in private companies, subject to securities laws. We're building a secondary marketplace for accredited investors. Until then, tokens remain non-transferable until liquidity events (acquisition, IPO).",
    },
];

export const navigationLinks = [
    { href: "#platform", label: "Platform" },
    { href: "#process", label: "Process" },
    { href: "#technology", label: "Technology" },
    { href: "#about", label: "About" },
];

export const footerLinks = {
    platform: [
        { href: "/investors", label: "For Investors" },
        { href: "/startups", label: "For Startups" },
        { href: "/pools", label: "Investment Pools" },
        { href: "/api", label: "API Access" },
    ],
    resources: [
        { href: "/docs", label: "Documentation" },
        { href: "/whitepaper", label: "Whitepaper" },
        { href: "/audits", label: "Security Audits" },
        { href: "/blog", label: "Blog" },
    ],
    company: [
        { href: "/about", label: "About" },
        { href: "/careers", label: "Careers" },
        { href: "/legal", label: "Legal" },
        { href: "/contact", label: "Contact" },
    ],
};

export const socialLinks = [
    { href: "https://twitter.com/crowdvc", label: "Twitter", icon: "𝕏" },
    {
        href: "https://linkedin.com/company/crowdvc",
        label: "LinkedIn",
        icon: "in",
    },
    { href: "https://t.me/crowdvc", label: "Telegram", icon: "TG" },
];
