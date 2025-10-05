// Re-export the Zod-inferred types
export type {
    BasicInfoFormData,
    CompleteFormData,
    FundingGoalFormData,
    MediaUploadFormData,
} from "./validation";

// For backwards compatibility, alias the complete form data
export type FormData = {
    title: string;
    summary: string;
    oneKeyMetric: string;
    elevatorPitch: string;
    industry: string;
    companyStage: string;
    teamSize: string;
    location: string;
    website?: string;
    pitchDeck?: File;
    pitchVideo?: File;
    demoUrl?: string;
    prototypeUrl?: string;
    fundingGoal: string;
    customAmount?: string;
    productDevelopment?: string;
    marketingSales?: string;
    teamExpansion?: string;
    operations?: string;
    timeToRaise?: string;
    expectedROI?: string;
};

// Form errors will be handled by React Hook Form + Zod
export interface FormErrors {
    [key: string]: string | undefined;
}

export interface FundingAmount {
    amount: string;
    description: string;
    value: string;
}

export interface StepInfo {
    step: number;
    title: string;
    subtitle: string;
}

export type FileUploadType = "pitch_deck" | "pitch_video";
