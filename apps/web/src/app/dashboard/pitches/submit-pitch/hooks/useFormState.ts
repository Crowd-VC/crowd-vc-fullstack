import { useCallback, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type CompleteFormData,
  completeFormSchema,
  getStepFields,
  getStepSchema,
} from '../validation';
import type { FileUploadType } from '../types';
import { usePitchesStore } from '@/lib/stores/pitches';
import { DEFAULT_VALUES } from '../constants';
import { toast } from 'sonner';
import { useWallet } from '@/hooks/use-wallet';
import { usePinataUpload } from '@/hooks/use-pinata-upload';
import { useSubmitPitch } from '@/lib/web3/hooks/factory/useSubmitPitch';

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
  pitchImage: undefined,
  pitchVideoLink: '',
  demoUrl: '',
  socialUrl: '',
  fundingGoal: DEFAULT_VALUES.FUNDING_GOAL,
  customAmount: '',
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
  const [submissionId, setSubmissionId] = useState<string>('');
  const [dragActive, setDragActive] = useState<string | null>(null);
  const { addPitch } = usePitchesStore();
  const { submitPitch } = useSubmitPitch();

  const form = useForm<CompleteFormData>({
    resolver: zodResolver(completeFormSchema),
    defaultValues: initialFormData,
    mode: 'onChange',
  });

  const { handleSubmit, reset, setValue, getValues, trigger, formState } = form;

  // Helper to get current form data
  const formData = getValues();

  // Step navigation
  const nextStep = useCallback(async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger([...fields] as (keyof CompleteFormData)[]);

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
  const handleFileUpload = useCallback(
    (file: File, type: FileUploadType) => {
      if (type === 'pitch_deck') {
        setValue('pitchDeck', file, { shouldValidate: true });
      } else if (type === 'pitch_image') {
        setValue('pitchImage', file, { shouldValidate: true });
      }
    },
    [setValue],
  );

  const handleFileRemove = useCallback(
    (type: FileUploadType) => {
      if (type === 'pitch_deck') {
        setValue('pitchDeck', undefined, { shouldValidate: true });
      } else if (type === 'pitch_image') {
        setValue('pitchImage', undefined, { shouldValidate: true });
      }
    },
    [setValue],
  );

  const { wallet } = useWallet();
  const { uploadToPinata } = usePinataUpload();

  // Form submission
  const handleFormSubmit = useCallback(
    async (data: CompleteFormData) => {
      // 1. Validate Prerequisites
      if (!wallet.address) {
        toast.error('Please connect your wallet to submit a pitch');
        return;
      }

      if (!data.pitchDeck) {
        toast.error('Pitch deck is required');
        return;
      }

      setIsSubmitting(true);
      try {
        // 2. IPFS Upload (Pinata)
        // We prepare metadata excluding the actual File objects
        const metadata = {
          ...data,
          walletAddress: wallet.address,
          pitchDeck: undefined,
          pitchImage: undefined,
          submittedAt: new Date().toISOString(),
        };

        const pinataResult = await uploadToPinata(
          data.pitchDeck,
          metadata,
          data.pitchImage || undefined,
        );

        if (
          !pinataResult.success ||
          !pinataResult.metadataCid ||
          !pinataResult.imageCid
        ) {
          throw new Error(
            pinataResult.error || 'Failed to upload pitch data to IPFS',
          );
        }

        const { fileCid, metadataCid, imageCid } = pinataResult;

        // 3. Blockchain Submission
        // Submit the IPFS CID (metadata hash) to the factory contract
        const txHash = await submitPitch({
          title: data.title,
          ipfsHash: metadataCid,
          fundingGoal: data.fundingGoal, // Hook handles conversion to BigInt
        });

        if (!txHash) {
          throw new Error('Transaction failed: No hash returned');
        }

        // 4. API Submission (Backend)
        const pitchPayload = {
          userId: wallet.address,
          transactionHash: txHash, // Store the TX hash for verification

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

          // Media & Metadata
          pitchDeckUrl: fileCid
            ? `https://gateway.pinata.cloud/ipfs/${fileCid}`
            : undefined,
          imageUrl: imageCid
            ? `https://gateway.pinata.cloud/ipfs/${imageCid}`
            : undefined,
          pitchVideoUrl: data.pitchVideoLink || undefined,
          metadataCid: metadataCid,
          demoUrl: data.demoUrl,
          prototypeUrl: data.socialUrl,
        };

        const response = await fetch('/api/pitches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pitchPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 'Failed to save pitch to database',
          );
        }

        const result = await response.json();
        const createdPitch = result.data;

        // 5. Update Local State
        addPitch({
          ...createdPitch,
          // Ensure strictly typed fields if API returns loose types
          status: createdPitch.status || 'pending',
          fundingGoal: createdPitch.fundingGoal || data.fundingGoal,
        });

        setSubmissionId(createdPitch.submissionId || createdPitch.id);
        console.log('Pitch submitted successfully:', createdPitch);
        setShowSuccess(true);
      } catch (error: unknown) {
        console.error('Error submitting pitch:', error);

        // User friendly error mapping
        let message = 'Failed to submit pitch';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            message = 'Transaction rejected by user';
          } else if (error.message.includes('insufficient funds')) {
            message = 'Insufficient funds for transaction';
          } else if (error.message) {
            message = error.message;
          }
        }

        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [addPitch, wallet.address, uploadToPinata, submitPitch],
  );

  // Reset form
  const resetForm = useCallback(() => {
    reset(initialFormData);
    setCurrentStep(1);
    setIsSubmitting(false);
    setShowSuccess(false);
    setSubmissionId('');
    setDragActive(null);
  }, [reset]);

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    const fields = getStepFields(currentStep);
    return await trigger([...fields] as (keyof CompleteFormData)[]);
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
