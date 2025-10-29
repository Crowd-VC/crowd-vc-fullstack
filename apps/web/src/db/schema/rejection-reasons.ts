// Predefined rejection reasons for pitch review
export const REJECTION_REASONS = [
    "Incomplete Information",
    "Not Aligned with Investment Criteria",
    "Insufficient Market Validation",
    "Weak Team Background",
    "Unrealistic Financial Projections",
    "Other",
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];
