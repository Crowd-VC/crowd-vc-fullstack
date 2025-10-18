import { useCallback, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    type CompleteFormData,
    completeFormSchema,
    getStepFields,
    getStepSchema,
} from "../validation";
import type { FileUploadType } from "../types";
import { usePitchesStore } from "@/lib/stores/pitches";
import { DEFAULT_VALUES } from "../constants";
import { toast } from "sonner";

const initialFormData: CompleteFormData = {
    title: DEFAULT_VALUES.TITLE,
    summary: DEFAULT_VALUES.SUMMARY,
    oneKeyMetric: DEFAULT_VALUES.KEY_METRIC,
    elevatorPitch: DEFAULT_VALUES.ELEVATOR_PITCH,
    industry: DEFAULT_VALUES.INDUSTRY,
    companyStage: DEFAULT_VALUES.COMPANY_STAGE,
    teamSize: DEFAULT_VALUES.TEAM_SIZE,
    location: DEFAULT_VALUES.LOCATION,
    website: DEFAULT_VALUES.WEBSITE,
    pitchDeck: undefined,
    pitchVideo: undefined,
    demoUrl: "",
    socialUrl: "",
    fundingGoal: DEFAULT_VALUES.FUNDING_GOAL,
    customAmount: "",
    productDevelopment: DEFAULT_VALUES.PRODUCT_DEVELOPMENT,
    marketingSales: DEFAULT_VALUES.MARKETING_SALES,
    teamExpansion: DEFAULT_VALUES.TEAM_EXPANSION,
    operations: DEFAULT_VALUES.OPERATIONS,
    timeToRaise: undefined,
    expectedROI: undefined,
};

export const useFormState = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submissionId, setSubmissionId] = useState<string>("");
    const [dragActive, setDragActive] = useState<string | null>(null);
    const { addPitch } = usePitchesStore();

    const form = useForm<CompleteFormData>({
        resolver: zodResolver(completeFormSchema),
        defaultValues: initialFormData,
        mode: "onChange",
    });

    const { handleSubmit, reset, setValue, getValues, trigger, formState } =
        form;

    // Helper to get current form data
    const formData = getValues();

    // Step navigation
    const nextStep = useCallback(async () => {
        const fields = getStepFields(currentStep);
        const isValid = await trigger(
            [...fields] as (keyof CompleteFormData)[],
        );

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, 4));
        }
        return isValid;
    }, [currentStep, trigger]);

    const previousStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);

    const goToStep = useCallback((step: number) => {
        setCurrentStep(Math.max(1, Math.min(step, 4)));
    }, []);

    // File upload handlers
    const handleFileUpload = useCallback((file: File, type: FileUploadType) => {
        if (type === "pitch_deck") {
            setValue("pitchDeck", file, { shouldValidate: true });
        } else if (type === "pitch_video") {
            setValue("pitchVideo", file, { shouldValidate: true });
        }
    }, [setValue]);

    const handleFileRemove = useCallback((type: FileUploadType) => {
        if (type === "pitch_deck") {
            setValue("pitchDeck", undefined, { shouldValidate: true });
        } else if (type === "pitch_video") {
            setValue("pitchVideo", undefined, { shouldValidate: true });
        }
    }, [setValue]);

    // Form submission
    const handleFormSubmit = useCallback(async (data: CompleteFormData) => {
        setIsSubmitting(true);
        try {
            // Prepare pitch data for API submission
            const pitchPayload = {
                // TODO: Get actual user ID from session/auth
                userId: "user_2", // Placeholder for now

                // Core details
                title: data.title,
                summary: data.summary,
                elevatorPitch: data.elevatorPitch,

                // Company details
                industry: data.industry,
                companyStage: data.companyStage,
                teamSize: data.teamSize,
                location: data.location,
                website: data.website,
                oneKeyMetric: data.oneKeyMetric,

                // Funding information
                fundingGoal: data.fundingGoal,
                customAmount: data.customAmount,
                productDevelopment: data.productDevelopment,
                marketingSales: data.marketingSales,
                teamExpansion: data.teamExpansion,
                operations: data.operations,
                timeToRaise: data.timeToRaise,
                expectedROI: data.expectedROI,

                // Media URLs (in production, files would be uploaded first)
                pitchDeckUrl: data.pitchDeck
                    ? `/uploads/pitch-deck-${Date.now()}.pdf`
                    : undefined,
                pitchVideoUrl: data.pitchVideo
                    ? `/uploads/pitch-video-${Date.now()}.mp4`
                    : undefined,
                demoUrl: data.demoUrl,
                prototypeUrl: data.socialUrl,
            };

            // Submit to API
            const response = await fetch("/api/pitches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(pitchPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to submit pitch");
                throw new Error(errorData.message || "Failed to submit pitch");
            }

            const result = await response.json();
            const createdPitch = result.data;

            // Store in local state for immediate UI update
            addPitch({
                id: createdPitch.id,
                title: createdPitch.title,
                summary: createdPitch.summary,
                elevatorPitch: createdPitch.elevatorPitch,
                status: createdPitch.status,
                fundingGoal: createdPitch.fundingGoal,
                dateSubmitted: createdPitch.dateSubmitted ||
                    new Date().toISOString(),
                submissionId: createdPitch.submissionId,
                reviewTimeline: createdPitch.reviewTimeline,
                lastUpdated: createdPitch.lastUpdated ||
                    new Date().toISOString(),

                // Company details
                industry: createdPitch.industry,
                companyStage: createdPitch.companyStage,
                teamSize: createdPitch.teamSize,
                location: createdPitch.location,
                website: createdPitch.website,
                oneKeyMetric: createdPitch.oneKeyMetric,

                // Funding breakdown
                customAmount: createdPitch.customAmount,
                productDevelopment: createdPitch.productDevelopment,
                marketingSales: createdPitch.marketingSales,
                teamExpansion: createdPitch.teamExpansion,
                operations: createdPitch.operations,
                timeToRaise: createdPitch.timeToRaise,
                expectedROI: createdPitch.expectedROI,

                // Media files
                pitchDeckUrl: createdPitch.pitchDeckUrl,
                pitchVideoUrl: createdPitch.pitchVideoUrl,
                demoUrl: createdPitch.demoUrl,
                prototypeUrl: createdPitch.prototypeUrl,
            });

            // Set submission ID for success modal
            setSubmissionId(createdPitch.submissionId);

            // Log successful submission
            console.log("Pitch submitted successfully:", createdPitch);

            setShowSuccess(true);
        } catch (error) {
            console.error("Error submitting pitch:", error);
            // TODO: Show error toast/notification to user
            toast.error("Failed to submit pitch");
            throw error; // Re-throw to allow parent components to handle
        } finally {
            setIsSubmitting(false);
        }
    }, [addPitch]);

    // Reset form
    const resetForm = useCallback(() => {
        reset(initialFormData);
        setCurrentStep(1);
        setIsSubmitting(false);
        setShowSuccess(false);
        setSubmissionId("");
        setDragActive(null);
    }, [reset]);

    // Validate current step
    const validateCurrentStep = useCallback(async () => {
        const fields = getStepFields(currentStep);
        return await trigger(
            [...fields] as (keyof CompleteFormData)[],
        );
    }, [currentStep, trigger]);

    // Success modal handlers
    const handleSuccessClose = useCallback(() => {
        setShowSuccess(false);
        resetForm();
    }, [resetForm]);

    return {
        // Form instance
        form,

        // Form data and state
        formData,
        errors: formState.errors,

        // Step management
        currentStep,
        nextStep,
        previousStep,
        goToStep,
        validateCurrentStep,

        // Submission state
        isSubmitting,
        showSuccess,
        submissionId,
        handleFormSubmit: handleSubmit(handleFormSubmit),
        submitFormData: handleFormSubmit, // Raw submission function
        handleSuccessClose,

        // File upload
        dragActive,
        setDragActive,
        handleFileUpload,
        handleFileRemove,

        // Form utilities
        resetForm,
        setValue,
        getValues,
        setIsSubmitting,
        setShowSuccess,
    } as const;
};
