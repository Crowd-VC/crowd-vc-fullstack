# Pitch Submission Form

This is a multi-step form for submitting pitches to investors, built with modern React patterns and best practices.

## Technology Stack

- **React Hook Form** - For form state management and performance optimization
- **Zod** - For schema validation and type safety
- **shadcn/ui Form Components** - For consistent UI and accessibility
- **TypeScript** - For type safety throughout the application

## Architecture

### 📁 File Structure

```
submit-pitch/
├── components/
│   ├── steps/
│   │   ├── BasicInfoStep.tsx      # Step 1: Project details
│   │   ├── MediaUploadStep.tsx    # Step 2: File uploads
│   │   ├── FundingGoalStep.tsx    # Step 3: Funding information
│   │   └── index.ts               # Barrel exports
│   ├── FileUploadArea.tsx         # Reusable file upload component
│   ├── FundingAmountSelector.tsx  # Funding amount selection
│   ├── StepIndicator.tsx          # Progress indicator
│   └── success-modal.tsx          # Success confirmation
├── hooks/
│   ├── useFormState.ts            # Form state management with RHF
│   └── index.ts                   # Barrel exports
├── constants.ts                   # Form constants and options
├── types.ts                       # TypeScript type definitions
├── validation.ts                  # Zod schemas for validation
└── page.tsx                       # Main form page component
```

### 🎯 Key Features

#### 1. **Type-Safe Validation**
- Zod schemas for runtime validation
- TypeScript integration for compile-time safety
- Step-specific validation rules
- Custom validation for file uploads and URLs

#### 2. **Multi-Step Form Flow**
- 3-step wizard interface
- Step validation before progression
- Progress indicator with completion status
- Form state persistence across steps

#### 3. **File Upload Handling**
- Drag and drop support
- File type and size validation
- Visual feedback for upload states
- Separate handling for PDF and video files

#### 4. **Accessibility**
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Form validation messages

#### 5. **User Experience**
- Real-time validation feedback
- Loading states during submission
- Success modal with confirmation
- Draft saving capability

## Validation Rules

### Step 1: Basic Information
- **Title**: Required, max 100 characters
- **Summary**: Required, max 500 characters with counter
- **Industry**: Required selection from predefined list
- **Company Stage**: Required selection
- **Team Size**: Required positive number
- **Location**: Required, max 100 characters
- **Website**: Optional, must be valid URL format

### Step 2: Media Upload
- **Pitch Deck**: Required PDF file, max 10MB
- **Pitch Video**: Optional video file, max 100MB
- **Demo URL**: Optional, must be valid URL
- **Prototype URL**: Optional, must be valid URL

### Step 3: Funding Goal
- **Funding Amount**: Required selection or custom amount
- **Custom Amount**: Min $1,000 if custom selected
- **Budget Allocation**: Optional percentages (max 100% total)
- **Timeline**: Optional selections for fundraising and ROI

## Usage Example

```tsx
import { useFormState } from "./hooks";
import { BasicInfoStep, MediaUploadStep, FundingGoalStep } from "./components/steps";

export default function SubmitPitchPage() {
  const { form, currentStep, nextStep, previousStep } = useFormState();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {currentStep === 1 && <BasicInfoStep form={form} />}
        {currentStep === 2 && <MediaUploadStep form={form} />}
        {currentStep === 3 && <FundingGoalStep form={form} />}
      </form>
    </Form>
  );
}
```

## Benefits of This Architecture

1. **Maintainability**: Modular components and clear separation of concerns
2. **Type Safety**: End-to-end type safety from validation to UI
3. **Performance**: React Hook Form optimizes re-renders and validation
4. **Accessibility**: Built-in accessibility features from shadcn/ui
5. **Developer Experience**: Clear APIs and TypeScript integration
6. **User Experience**: Smooth multi-step flow with proper validation

## Form State Management

The form uses React Hook Form with Zod validation for optimal performance:

- **Uncontrolled inputs** for better performance
- **Granular re-renders** only when necessary
- **Built-in validation** with custom error handling
- **Step-based validation** to prevent progression with errors
- **File handling** with proper validation and state management

This architecture provides a solid foundation for complex forms while maintaining excellent user experience and developer productivity.
