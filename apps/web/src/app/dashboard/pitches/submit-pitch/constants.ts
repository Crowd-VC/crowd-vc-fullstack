import type { FundingAmount, StepInfo } from "./types";

export const INDUSTRIES = [
    "Technology",
    "Healthcare",
    "Finance",
    "E-commerce",
    "Education",
    "Entertainment",
    "Real Estate",
    "Manufacturing",
    "Agriculture",
    "Energy",
] as const;

export const COMPANY_STAGES = [
    "Idea Stage",
    "MVP Development",
    "Early Stage",
    "Growth Stage",
    "Expansion",
    "Scale-up",
] as const;

export const FUNDING_AMOUNTS: FundingAmount[] = [
    { amount: "$10K", description: "Seed funding", value: "10000" },
    { amount: "$25K", description: "Early stage", value: "25000" },
    { amount: "$50K", description: "Growth ready", value: "50000" },
    { amount: "$100K", description: "Scale up", value: "100000" },
    { amount: "$250K", description: "Series A ready", value: "250000" },
    { amount: "$500K", description: "Expansion", value: "500000" },
    { amount: "$1M", description: "Major round", value: "1000000" },
    { amount: "Custom", description: "Set your own", value: "custom" },
];

export const TIMELINE_OPTIONS = [
    "1-3 months",
    "3-6 months",
    "6-12 months",
    "12+ months",
] as const;

export const STEPS: StepInfo[] = [
    {
        step: 1,
        title: "Pitch Details",
        subtitle: "Basic information",
    },
    {
        step: 2,
        title: "Media Uploads",
        subtitle: "Deck & video",
    },
    {
        step: 3,
        title: "Funding Goal",
        subtitle: "Investment target",
    },
    {
        step: 4,
        title: "Preview & Submit",
        subtitle: "Review & confirm",
    },
];

export const FILE_CONSTRAINTS = {
    PITCH_DECK: {
        maxSize: 10 * 1024 * 1024, // 10MB
        acceptedTypes: ["application/pdf"],
        acceptAttribute: ".pdf",
    },
    PITCH_VIDEO: {
        maxSize: 100 * 1024 * 1024, // 100MB
        acceptedTypes: ["video/*"],
        acceptAttribute: "video/*",
    },
} as const;

export const VALIDATION_RULES = {
    SUMMARY_MAX_LENGTH: 500,
    KEY_METRIC_MAX_LENGTH: 100,
    ELEVATOR_PITCH_MAX_LENGTH: 200,
    MIN_FUNDING_GOAL: 1000,
    MAX_ALLOCATION_PERCENTAGE: 100,
} as const;

export const DEFAULT_VALUES = {
    TITLE: "AI-Powered Supply Chain Optimizer",
    SUMMARY:
        "Our AI platform revolutionizes supply chain management by predicting demand fluctuations, optimizing inventory levels, and reducing waste by up to 40%. We solve the $1.2 trillion global problem of supply chain inefficiencies that cost businesses millions annually. Our proprietary machine learning algorithms analyze real-time data from multiple sources including weather patterns, market trends, and historical sales to provide actionable insights. ",
    KEY_METRIC:
        "40% reduction in supply chain waste across 150+ enterprise clients",
    ELEVATOR_PITCH:
        "We're the GPS for supply chains - our AI predicts what your customers want before they know it, cutting waste by 40% and boosting profits by 30% for Fortune 500 companies.",
    INDUSTRY: "Technology" as const,
    COMPANY_STAGE: "Growth Stage" as const,
    TEAM_SIZE: "15",
    LOCATION: "San Francisco, CA",
    FUNDING_GOAL: "100000",
    PRODUCT_DEVELOPMENT: "55",
    MARKETING_SALES: "25",
    TEAM_EXPANSION: "5",
    OPERATIONS: "10",
    WEBSITE: "https://www.supplychain-ai.com",
};
