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
            // Generate submission ID
            const newSubmissionId = `PITCH-${Date.now().toString().slice(-6)}-${
                Math.random().toString(36).substr(2, 4).toUpperCase()
            }`;
            setSubmissionId(newSubmissionId);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            addPitch({
                id: newSubmissionId,
                title: data.title,
                summary: data.summary,
                elevatorPitch: data.elevatorPitch,
                status: "pending",
                fundingGoal: Number(
                    data.fundingGoal === "custom"
                        ? data.customAmount || "0"
                        : data.fundingGoal || "0",
                ),
                dateSubmitted: new Date().toISOString(),
                submissionId: newSubmissionId,
                reviewTimeline: "3-5 business days",
                lastUpdated: new Date().toISOString(),

                // Company details
                industry: data.industry,
                companyStage: data.companyStage,
                teamSize: data.teamSize,
                location: data.location,
                website: data.website,
                oneKeyMetric: data.oneKeyMetric,

                // Funding breakdown
                customAmount: data.customAmount,
                productDevelopment: data.productDevelopment,
                marketingSales: data.marketingSales,
                teamExpansion: data.teamExpansion,
                operations: data.operations,
                timeToRaise: data.timeToRaise,
                expectedROI: data.expectedROI,

                // Media files (mock URLs for demo - in real app these would be upload URLs)
                pitchDeckUrl: data.pitchDeck
                    ? `/uploads/${newSubmissionId}-deck.pdf`
                    : undefined,
                pitchVideoUrl: data.pitchVideo
                    ? `/uploads/${newSubmissionId}-video.mp4`
                    : undefined,
                demoUrl: data.demoUrl,
                prototypeUrl: data.socialUrl,
            });

            // Log the complete form data including new fields
            console.log("Complete pitch submission:", {
                submissionId: newSubmissionId,
                ...data,
                oneKeyMetric: data.oneKeyMetric,
                elevatorPitch: data.elevatorPitch,
            });

            setShowSuccess(true);
        } catch (error) {
            console.error("Error submitting pitch:", error);
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
