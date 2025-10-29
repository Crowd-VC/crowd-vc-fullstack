import type { Pitch } from "@/lib/stores/pitches";

export const initialPitches: Pitch[] = [
    {
        id: "1",
        title: "Project Phoenix",
        summary:
            "Revolutionary AI platform that transforms raw data into actionable business insights, helping companies make data-driven decisions with unprecedented accuracy.",
        elevatorPitch:
            "We're the GPS for data - our AI turns complex analytics into simple decisions, boosting ROI by 40% for Fortune 500 companies.",
        status: "approved",
        fundingGoal: 100000,
        dateSubmitted: "2024-10-26",
        submissionId: "PITCH-001234-ABCD",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-10-28",

        // Company details
        industry: "Technology",
        companyStage: "Growth Stage",
        teamSize: "12",
        location: "San Francisco, CA",
        website: "https://projectphoenix.ai",
        oneKeyMetric: "40% ROI improvement across 50+ enterprise clients",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "3-6 months",
        expectedROI: "12+ months",

        // Media files
        pitchDeckUrl: "/demo-files/phoenix-deck.pdf",
        pitchVideoUrl: "/demo-files/phoenix-video.mp4",
        demoUrl: "https://demo.projectphoenix.ai",
        prototypeUrl: "https://beta.projectphoenix.ai",
        imageUrl: "/images/startups/projectphoenix.png",
    },
    {
        id: "2",
        title: "AstraYield",
        summary:
            "Automated yield farming protocol that maximizes returns across multiple DeFi platforms while minimizing risk through advanced algorithmic strategies.",
        elevatorPitch:
            "We're the autopilot for DeFi - our algorithms maximize yields while you sleep, delivering 15% higher returns than manual farming.",
        status: "pending",
        fundingGoal: 250000,
        dateSubmitted: "2024-11-01",
        submissionId: "PITCH-567890-EFGH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-01",

        // Company details
        industry: "Finance",
        companyStage: "Early Stage",
        teamSize: "8",
        location: "New York, NY",
        website: "https://defiyield.finance",
        oneKeyMetric: "15% higher yields than manual farming across $2M TVL",

        // Funding breakdown
        productDevelopment: "50",
        marketingSales: "25",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "1-3 months",
        expectedROI: "6-12 months",

        // Media files
        demoUrl: "https://app.defiyield.finance",
        imageUrl: "/images/startups/astrayield.png",
    },
    {
        id: "3",
        title: "Mintopia",
        summary:
            "Creator-first NFT platform with zero gas fees, built-in royalty management, and advanced discovery tools for digital artists and collectors.",
        elevatorPitch:
            "We're the Shopify for NFTs - creators keep 95% of sales with zero gas fees, while our AI helps collectors discover hidden gems.",
        status: "in-pool",
        fundingGoal: 150000,
        dateSubmitted: "2024-10-15",
        submissionId: "PITCH-111222-IJKL",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-10-20",

        // Company details
        industry: "Entertainment",
        companyStage: "MVP Development",
        teamSize: "6",
        location: "Austin, TX",
        website: "https://creativenft.market",
        oneKeyMetric: "95% creator revenue share vs 85% industry average",

        // Funding breakdown
        productDevelopment: "35",
        marketingSales: "40",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "6-12 months",
        expectedROI: "12+ months",

        // Media files
        pitchVideoUrl: "/demo-files/nft-marketplace-video.mp4",
        prototypeUrl: "https://beta.creativenft.market",
        imageUrl: "/images/startups/mintopia.png",
        featured: true,
        featuredImage: "/images/startups/mintopia-featured.png",
    },
    {
        id: "4",
        title: "NeuroCore",
        summary:
            "Advanced AI platform for neural network optimization and deep learning applications.",
        elevatorPitch:
            "We build the brains of tomorrow's AI, enabling faster, more efficient, and scalable deep learning solutions.",
        status: "pending",
        fundingGoal: 300000,
        dateSubmitted: "2024-11-05",
        submissionId: "PITCH-004-TECH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-05",

        // Company details
        industry: "Technology",
        companyStage: "Seed Stage",
        teamSize: "7",
        location: "Seattle, WA",
        website: "https://neurocore.ai",
        oneKeyMetric: "20% reduction in AI model training time for clients",

        // Funding breakdown
        productDevelopment: "60",
        marketingSales: "20",
        teamExpansion: "10",
        operations: "10",
        timeToRaise: "4-8 months",
        expectedROI: "18+ months",
        imageUrl: "/images/startups/neurocare.png",
    },
    {
        id: "6",
        title: "Synaptek",
        summary:
            "AI-powered cognitive enhancement platform for improved focus and productivity.",
        elevatorPitch:
            "Unlock your brain's full potential with personalized AI training for peak mental performance.",
        status: "in-pool",
        fundingGoal: 220000,
        dateSubmitted: "2024-11-12",
        submissionId: "PITCH-006-AI",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-12",

        // Company details
        industry: "Technology",
        companyStage: "Early Stage",
        teamSize: "9",
        location: "Boston, MA",
        website: "https://synaptek.ai",
        oneKeyMetric: "25% average increase in user productivity",

        // Funding breakdown
        productDevelopment: "50",
        marketingSales: "25",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "4-7 months",
        expectedROI: "12-18 months",
        imageUrl: "/images/startups/synaptek.png",
    },
    {
        id: "7",
        title: "VaultEdge",
        summary:
            "Secure decentralized finance (DeFi) vault for high-yield crypto investments.",
        elevatorPitch:
            "Safeguard and grow your digital assets with our institutional-grade DeFi vault technology.",
        status: "pending",
        fundingGoal: 400000,
        dateSubmitted: "2024-11-15",
        submissionId: "PITCH-007-DEFI",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-15",

        // Company details
        industry: "Finance",
        companyStage: "Growth Stage",
        teamSize: "15",
        location: "London, UK",
        website: "https://vaultedge.finance",
        oneKeyMetric: "$50M+ TVL secured with zero incidents",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "6-9 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/vaultedge.png",
    },

    {
        id: "9",
        title: "NexaFinance",
        summary:
            "Next-generation decentralized lending and borrowing protocol.",
        elevatorPitch:
            "Access liquidity and earn interest on your crypto assets with transparent and efficient decentralized finance.",
        status: "shortlisted",
        fundingGoal: 350000,
        dateSubmitted: "2024-11-20",
        submissionId: "PITCH-009-DEFI",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-20",

        // Company details
        industry: "Finance",
        companyStage: "Growth Stage",
        teamSize: "12",
        location: "Zug, Switzerland",
        website: "https://nexafinance.io",
        oneKeyMetric: "$100M+ in total value locked (TVL)",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "5-8 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/nexafinance.png",
    },
    {
        id: "10",
        title: "PixelHaven",
        summary:
            "Curated NFT marketplace for pixel art and retro gaming collectibles.",
        elevatorPitch:
            "Discover and trade unique pixel art NFTs in a community-driven marketplace for digital artists and collectors.",
        status: "in-pool",
        fundingGoal: 100000,
        dateSubmitted: "2024-11-22",
        submissionId: "PITCH-010-NFT",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-22",

        // Company details
        industry: "Entertainment",
        companyStage: "MVP Development",
        teamSize: "5",
        location: "Tokyo, Japan",
        website: "https://pixelhaven.art",
        oneKeyMetric: "10,000+ unique pixel art NFTs listed",

        // Funding breakdown
        productDevelopment: "35",
        marketingSales: "40",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "6-12 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/pixelhaven.png",
    },
    {
        id: "11",
        title: "ArtLink",
        summary:
            "Decentralized platform connecting NFT artists with collectors and patrons.",
        elevatorPitch:
            "Empowering digital artists to mint, showcase, and sell their creations directly to a global audience.",
        status: "approved",
        fundingGoal: 170000,
        dateSubmitted: "2024-11-25",
        submissionId: "PITCH-011-NFT",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-25",

        // Company details
        industry: "Entertainment",
        companyStage: "Early Stage",
        teamSize: "8",
        location: "Berlin, Germany",
        website: "https://artlink.xyz",
        oneKeyMetric: "500+ active artists on the platform",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "4-8 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/artlink.png",
    },
    {
        id: "12",
        title: "VitalPath",
        summary: "Personalized digital health and wellness coaching platform.",
        elevatorPitch:
            "Achieve your health goals with AI-driven personalized coaching and progress tracking.",
        status: "approved",
        fundingGoal: 200000,
        dateSubmitted: "2024-11-28",
        submissionId: "PITCH-012-HEALTH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-11-28",

        // Company details
        industry: "HealthTech",
        companyStage: "Growth Stage",
        teamSize: "10",
        location: "London, UK",
        website: "https://vitalpath.health",
        oneKeyMetric: "90% user retention rate for 6+ months",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "3-6 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/vitalpath.png",
    },
    {
        id: "15",
        title: "LearnSphere",
        summary:
            "Interactive online learning platform with gamified courses and AI tutors.",
        elevatorPitch:
            "Make learning fun and effective with personalized paths, engaging content, and intelligent AI assistance.",
        status: "approved",
        fundingGoal: 150000,
        dateSubmitted: "2024-12-05",
        submissionId: "PITCH-015-EDTECH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-12-05",

        // Company details
        industry: "EdTech",
        companyStage: "Growth Stage",
        teamSize: "10",
        location: "Berlin, Germany",
        website: "https://learnsphere.io",
        oneKeyMetric: "50,000+ active users with 95% course completion rate",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "3-6 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/learnsphere.png",
        featured: true,
        featuredImage: "/images/startups/learnsphere-featured.png",
    },
    {
        id: "17",
        title: "e.hub",
        summary:
            "Online coaching and mentorship platform for students and young professionals.",
        elevatorPitch:
            "Unlock your potential with personalized guidance from experienced mentors and coaches.",
        status: "under-review",
        fundingGoal: 120000,
        dateSubmitted: "2024-12-10",
        submissionId: "PITCH-017-EDTECH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-12-10",

        // Company details
        industry: "EdTech",
        companyStage: "MVP Development",
        teamSize: "6",
        location: "Toronto, Canada",
        website: "https://ehub.coach",
        oneKeyMetric: "92% student satisfaction rate",

        // Funding breakdown
        productDevelopment: "35",
        marketingSales: "40",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "6-12 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/ehub.png",
    },
    {
        id: "18",
        title: "EcoRise",
        summary:
            "Sustainable urban farming solutions for community and commercial use.",
        elevatorPitch:
            "Revolutionizing food production with eco-friendly, hyper-local urban farms.",
        status: "approved",
        fundingGoal: 200000,
        dateSubmitted: "2024-12-12",
        submissionId: "PITCH-018-GREENTECH",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-12-12",

        // Company details
        industry: "GreenTech",
        companyStage: "Growth Stage",
        teamSize: "10",
        location: "Copenhagen, Denmark",
        website: "https://ecorise.farm",
        oneKeyMetric:
            "30% reduction in water usage compared to traditional farming",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "30",
        teamExpansion: "20",
        operations: "10",
        timeToRaise: "3-6 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/ecorise.png",
        featured: true,
        featuredImage: "/images/startups/ecorise-featured.png",
    },
    {
        id: "21",
        title: "Mosaicx",
        summary:
            "A vibrant NFT marketplace for digital art, collectibles, and interactive experiences.",
        elevatorPitch:
            "We're curating the future of digital ownership, empowering artists and collectors with a seamless, immersive NFT experience.",
        status: "in-pool",
        fundingGoal: 180000,
        dateSubmitted: "2024-12-20",
        submissionId: "PITCH-021-NFT",
        reviewTimeline: "3-5 business days",
        lastUpdated: "2024-12-20",

        // Company details
        industry: "Entertainment",
        companyStage: "MVP Development",
        teamSize: "7",
        location: "Singapore",
        website: "https://mosaicx.art",
        oneKeyMetric: "1,000+ unique artists onboarded within first 3 months",

        // Funding breakdown
        productDevelopment: "40",
        marketingSales: "35",
        teamExpansion: "15",
        operations: "10",
        timeToRaise: "6-12 months",
        expectedROI: "12+ months",
        imageUrl: "/images/startups/mosaicx.png",
    },
];
