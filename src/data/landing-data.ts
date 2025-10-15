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

export const testimonials: Testimonial[] = [
    {
        quote:
            "CrowdVC has completely transformed how we invest in startups. The AI scoring system and transparent governance make it easy to make informed decisions with confidence.",
        name: "Sarah Chen",
        title: "Angel Investor",
    },
    {
        quote:
            "As a startup founder, the speed of capital deployment through CrowdVC was incredible. From pitch submission to funding in just 48 hours. Truly revolutionary.",
        name: "Marcus Rodriguez",
        title: "CEO, TechFlow",
    },
    {
        quote:
            "The diversified pool approach removes the complexity of individual startup evaluation. I can invest across multiple vetted companies with a single transaction.",
        name: "Dr. Emily Watson",
        title: "Portfolio Manager",
    },
    {
        quote:
            "DAO governance ensures every voice matters. The platform's transparency and security features are unmatched in the venture capital space.",
        name: "James Park",
        title: "Crypto Fund Manager",
    },
    {
        quote:
            "I've been investing in startups for 15 years, and CrowdVC's institutional-grade infrastructure is the most sophisticated platform I've encountered. Highly recommended.",
        name: "Alexandra Novak",
        title: "Venture Partner",
    },
];

export const statistics: Statistic[] = [
    {
        value: "$2.5M+",
        label: "Assets Under Management",
    },
    {
        value: "150+",
        label: "Funded Startups",
    },
    {
        value: "3,200+",
        label: "Global Investors",
    },
    {
        value: "89%",
        label: "Success Rate",
    },
];

export const features: Feature[] = [
    {
        icon: "🛡️",
        title: "DAO Governance",
        description:
            "Decentralized decision-making powered by transparent smart contracts. Every vote recorded on-chain, immutable and auditable.",
        gradient: "from-blue-900/20 to-purple-900/20",
    },
    {
        icon: "📈",
        title: "AI-Powered Scoring",
        description:
            "Proprietary algorithm analyzing 127 data points across team, traction, market, and financials. Objective evaluation at scale.",
        gradient: "from-emerald-900/20 to-teal-900/20",
    },
    {
        icon: "⚡",
        title: "Instant Settlement",
        description:
            "Smart contract automation enables millisecond fund deployment post-voting. No intermediaries, no delays, no friction.",
        gradient: "from-amber-900/20 to-orange-900/20",
    },
    {
        icon: "💎",
        title: "Portfolio Diversification",
        description:
            "Automated risk distribution across multiple vetted startups. Single investment, diversified exposure across sectors.",
        gradient: "from-pink-900/20 to-rose-900/20",
    },
    {
        icon: "🌍",
        title: "Global Infrastructure",
        description:
            "Multi-region deployment with localized compliance. Arbitrum Layer-2 for low-cost, high-speed transactions at scale.",
        gradient: "from-cyan-900/20 to-blue-900/20",
    },
    {
        icon: "🔒",
        title: "Bank-Grade Security",
        description:
            "Multi-sig wallets, smart contract audits, and institutional custody. Your capital protected by battle-tested protocols.",
        gradient: "from-violet-900/20 to-purple-900/20",
    },
];

export const processSteps: ProcessStep[] = [
    {
        number: "01",
        title: "Connect Wallet",
        description:
            "Secure MetaMask integration with KYC verification for regulatory compliance and institutional custody options.",
    },
    {
        number: "02",
        title: "Browse Pools",
        description:
            "AI-scored startups across sectors with transparent metrics, verified traction, and comprehensive due diligence.",
    },
    {
        number: "03",
        title: "Deploy Capital",
        description:
            "Allocate funds to investment pools with voting rights proportional to capital committed and real-time tracking.",
    },
    {
        number: "04",
        title: "Automated Distribution",
        description:
            "Smart contracts execute fund transfers to winning startups with equity tokens distributed instantly to wallets.",
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
