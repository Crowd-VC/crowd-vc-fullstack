import { z } from 'zod';
import {
  COMPANY_STAGES,
  INDUSTRIES,
  TIMELINE_OPTIONS,
  VALIDATION_RULES,
} from './constants';

// File validation helper
const fileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    'File size must be less than 10MB',
  );

const imageFileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    'Image size must be less than 10MB',
  )
  .refine(
    (file) => !file || file.type.startsWith('image/'),
    'File must be an image',
  );

const pdfFileSchema = z
  .instanceof(File)
  .optional()
  .refine(
    (file) => !file || file.type === 'application/pdf',
    'File must be a PDF',
  )
  .refine(
    (file) => !file || file.size <= 10 * 1024 * 1024,
    'File size must be less than 10MB',
  );

// Step 1: Basic Information Schema
export const basicInfoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  summary: z
    .string()
    .min(1, 'Summary is required')
    .max(
      VALIDATION_RULES.SUMMARY_MAX_LENGTH,
      `Summary must be less than ${VALIDATION_RULES.SUMMARY_MAX_LENGTH} characters`,
    ),
  oneKeyMetric: z
    .string()
    .min(1, 'Key metric is required')
    .max(
      VALIDATION_RULES.KEY_METRIC_MAX_LENGTH,
      `Key metric must be less than ${VALIDATION_RULES.KEY_METRIC_MAX_LENGTH} characters`,
    ),
  elevatorPitch: z
    .string()
    .min(1, 'Elevator pitch is required')
    .max(
      VALIDATION_RULES.ELEVATOR_PITCH_MAX_LENGTH,
      `Elevator pitch must be exactly ${VALIDATION_RULES.ELEVATOR_PITCH_MAX_LENGTH} characters or less`,
    ),
  industry: z.enum(INDUSTRIES, {
    message: 'Industry is required',
  }),
  companyStage: z.enum(COMPANY_STAGES, {
    message: 'Company stage is required',
  }),
  teamSize: z
    .string()
    .min(1, 'Team size is required')
    .refine(
      (val) => !Number.isNaN(Number(val)) && Number(val) > 0,
      'Team size must be a positive number',
    ),
  location: z
    .string()
    .min(1, 'Location is required')
    .max(100, 'Location must be less than 100 characters'),
  website: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      'Website must be a valid URL',
    ),
});

// Step 2: Media Upload Schema
export const mediaUploadSchema = z.object({
  pitchDeck: z.union([
    z
      .instanceof(File)
      .refine((file) => file.type === 'application/pdf', 'File must be a PDF')
      .refine(
        (file) => file.size <= 10 * 1024 * 1024,
        'File size must be less than 10MB',
      ),
    z.undefined(),
  ]),
  pitchImage: imageFileSchema,
  pitchVideoLink: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Video link must be a valid URL',
    ),
  demoUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Demo URL must be a valid URL',
    ),
  socialUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Social URL must be a valid URL',
    ),
});

// Step 3: Funding Goal Schema (base object without refinements)
const fundingGoalBaseSchema = z.object({
  fundingGoal: z.string().min(1, 'Funding goal is required'),
  customAmount: z.string().optional(),
  productDevelopment: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      'Must be a number between 0 and 100',
    ),
  marketingSales: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      'Must be a number between 0 and 100',
    ),
  teamExpansion: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      'Must be a number between 0 and 100',
    ),
  operations: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100),
      'Must be a number between 0 and 100',
    ),
  timeToRaise: z.enum(TIMELINE_OPTIONS).optional(),
  expectedROI: z.enum(TIMELINE_OPTIONS).optional(),
});

// Export funding goal schema with refinements for step validation
export const fundingGoalSchema = fundingGoalBaseSchema
  .refine(
    (data) => {
      if (data.fundingGoal === 'custom') {
        return (
          data.customAmount &&
          !Number.isNaN(Number(data.customAmount)) &&
          Number(data.customAmount) >= VALIDATION_RULES.MIN_FUNDING_GOAL
        );
      }
      return true;
    },
    {
      message: `Custom amount must be at least $${VALIDATION_RULES.MIN_FUNDING_GOAL.toLocaleString()}`,
      path: ['customAmount'],
    },
  )
  .refine(
    (data) => {
      const total = [
        data.productDevelopment,
        data.marketingSales,
        data.teamExpansion,
        data.operations,
      ].reduce((sum, val) => sum + (Number(val) || 0), 0);
      return total <= 100;
    },
    {
      message: 'Total allocation cannot exceed 100%',
      path: ['productDevelopment'],
    },
  );

// Complete form schema - merge base schemas then apply refinements
const completeBaseSchema = basicInfoSchema
  .merge(mediaUploadSchema)
  .merge(fundingGoalBaseSchema);

export const completeFormSchema = completeBaseSchema
  .refine(
    (data) => {
      if (data.fundingGoal === 'custom') {
        return (
          data.customAmount &&
          !Number.isNaN(Number(data.customAmount)) &&
          Number(data.customAmount) >= VALIDATION_RULES.MIN_FUNDING_GOAL
        );
      }
      return true;
    },
    {
      message: `Custom amount must be at least $${VALIDATION_RULES.MIN_FUNDING_GOAL.toLocaleString()}`,
      path: ['customAmount'],
    },
  )
  .refine(
    (data) => {
      const total = [
        data.productDevelopment,
        data.marketingSales,
        data.teamExpansion,
        data.operations,
      ].reduce((sum, val) => sum + (Number(val) || 0), 0);
      return total <= 100;
    },
    {
      message: 'Total allocation cannot exceed 100%',
      path: ['productDevelopment'],
    },
  );

// Type inference
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type MediaUploadFormData = z.infer<typeof mediaUploadSchema>;
export type FundingGoalFormData = z.infer<typeof fundingGoalSchema>;
export type CompleteFormData = z.infer<typeof completeFormSchema>;

// Step field keys (for validation)
export const stepFieldKeys = {
  1: [
    'title',
    'summary',
    'oneKeyMetric',
    'elevatorPitch',
    'industry',
    'companyStage',
    'teamSize',
    'location',
    'website',
  ] as const,
  2: [
    'pitchDeck',
    'pitchImage',
    'pitchVideoLink',
    'demoUrl',
    'socialUrl',
  ] as const,
  3: [
    'fundingGoal',
    'customAmount',
    'productDevelopment',
    'marketingSales',
    'teamExpansion',
    'operations',
    'timeToRaise',
    'expectedROI',
  ] as const,
} as const;

// Step validation helper
export const getStepSchema = (step: number) => {
  switch (step) {
    case 1:
      return basicInfoSchema;
    case 2:
      return mediaUploadSchema;
    case 3:
      return fundingGoalSchema;
    default:
      return completeFormSchema;
  }
};

// Get field keys for a specific step
export const getStepFields = (step: number): readonly string[] => {
  switch (step) {
    case 1:
      return stepFieldKeys[1];
    case 2:
      return stepFieldKeys[2];
    case 3:
      return stepFieldKeys[3];
    default:
      return [];
  }
};
