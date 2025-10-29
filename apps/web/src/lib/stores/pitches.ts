import { create } from "zustand";
import { initialPitches } from "@/data/static/pitches";

interface PitchesStore {
    pitches: Pitch[];
    addPitch: (pitch: Pitch) => void;
    updatePitch: (pitch: Pitch) => void;
    updatePitchStatus: (
        id: string,
        status: Pitch["status"],
        notes?: string,
    ) => void;
    deletePitch: (id: string) => void;
    setPitches: (pitches: Pitch[]) => void;
    getPitchById: (id: string) => Pitch | undefined;
    getPitchBySubmissionId: (submissionId: string) => Pitch | undefined;
}

export const usePitchesStore = create<PitchesStore>((set, get) => ({
    pitches: initialPitches,
    addPitch: (pitch) =>
        set((state) => ({ pitches: [...state.pitches, pitch] })),
    updatePitch: (pitch) =>
        set((state) => ({
            pitches: state.pitches.map((p) => p.id === pitch.id ? pitch : p),
        })),
    updatePitchStatus: (id, status, notes) =>
        set((state) => ({
            pitches: state.pitches.map((p) =>
                p.id === id
                    ? {
                        ...p,
                        status,
                        lastUpdated: new Date().toISOString(),
                        reviewNotes: notes,
                    }
                    : p
            ),
        })),
    deletePitch: (id) =>
        set((state) => ({ pitches: state.pitches.filter((p) => p.id !== id) })),
    setPitches: (pitches) => set({ pitches }),
    getPitchById: (id) => get().pitches.find((p) => p.id === id),
    getPitchBySubmissionId: (submissionId) =>
        get().pitches.find((p) => p.submissionId === submissionId),
}));

export interface Pitch {
    // Core identification
    id: string;
    title: string;
    summary: string;
    elevatorPitch: string;

    // Status and tracking
    status:
        | "pending"
        | "approved"
        | "rejected"
        | "in-pool"
        | "under-review"
        | "shortlisted"
        | "conditional-approval"
        | "needs-more-info";
    dateSubmitted: string;
    submissionId?: string;
    reviewTimeline?: string;
    lastUpdated?: string;
    reviewNotes?: string;

    // Company details
    industry: string;
    companyStage: string;
    teamSize: string;
    location: string;
    website?: string;
    oneKeyMetric: string;

    // Funding information
    fundingGoal: number;
    customAmount?: string;
    productDevelopment?: string;
    marketingSales?: string;
    teamExpansion?: string;
    operations?: string;
    timeToRaise?: string;
    expectedROI?: string;

    // Media and files
    pitchDeckUrl?: string; // Stored file URL
    pitchVideoUrl?: string; // Stored file URL
    demoUrl?: string;
    prototypeUrl?: string;
    imageUrl?: string; // New property for cover photo
    featured?: boolean;
    featuredImage?: string;
}
