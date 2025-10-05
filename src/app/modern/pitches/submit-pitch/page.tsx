"use client";

import { useCallback } from "react";
import Button  from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ChevronLeft, ChevronRight, Send, Save } from "lucide-react";

import { SuccessModal } from "./components/SuccessModal";
import { StepIndicator } from "./components/StepIndicator";
import {
	BasicInfoStep,
	MediaUploadStep,
	FundingGoalStep,
	PreviewStep,
} from "./components/steps";
import { useFormState } from "./hooks";
import { FILE_CONSTRAINTS } from "./constants";
import type { FileUploadType } from "./types";
import { Separator } from "@/components/ui/separator";

export default function SubmitPitchPage() {
	const {
		form,
		formData,
		currentStep,
		nextStep,
		previousStep,
		goToStep,
		isSubmitting,
		showSuccess,
		submissionId,
		handleFormSubmit,
		submitFormData,
		handleSuccessClose,
		dragActive,
		setDragActive,
		handleFileUpload,
		handleFileRemove,
	} = useFormState();

	const handleNext = useCallback(
		async (e?: React.MouseEvent) => {
			e?.preventDefault();
			await nextStep();
		},
		[nextStep],
	);

	const handleFormSubmitClick = useCallback(async () => {
		// Explicitly handle form submission only when submit button is clicked
		const formData = form.getValues();
		await submitFormData(formData);
	}, [submitFormData, form]);

	const handleFundingAmountSelect = useCallback(
		(value: string) => {
			form.setValue("fundingGoal", value, { shouldValidate: true });
		},
		[form],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent, type: FileUploadType) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(null);

			const files = e.dataTransfer.files;
			if (files?.[0]) {
				const file = files[0];
				const constraints =
					FILE_CONSTRAINTS[type.toUpperCase() as keyof typeof FILE_CONSTRAINTS];
				const isValidType = constraints.acceptedTypes.some((acceptedType) =>
					acceptedType === "video/*"
						? file.type.startsWith("video/")
						: file.type === acceptedType,
				);
				if (isValidType) {
					handleFileUpload(file, type);
				}
			}
		},
		[handleFileUpload, setDragActive],
	);

	const getStepTitle = useCallback(() => {
		switch (currentStep) {
			case 1:
				return "Pitch Details";
			case 2:
				return "Media Uploads";
			case 3:
				return "Funding Goal";
			case 4:
				return "Preview & Submit";
			default:
				return "";
		}
	}, [currentStep]);

	const getStepSubtitle = useCallback(() => {
		switch (currentStep) {
			case 1:
				return "Tell us about your innovative project and what makes it unique in the market.";
			case 2:
				return "Upload your pitch deck and video to showcase your project effectively to potential investors.";
			case 3:
				return "Set your investment target and specify how you plan to use the funding to grow your business.";
			case 4:
				return "Review all your information and submit your pitch for investor consideration.";
			default:
				return "";
		}
	}, [currentStep]);

	// Calculate total allocation for funding breakdown
	const totalAllocation = [
		form.watch("productDevelopment"),
		form.watch("marketingSales"),
		form.watch("teamExpansion"),
		form.watch("operations"),
	].reduce((sum, value) => sum + (Number.parseInt(value || "0") || 0), 0);

	return (
		<>
			<div className="min-h-screen bg-background text-foreground relative">
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

				<div className="relative container mx-auto px-4 py-8 max-w-4xl">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold mb-4 text-balance">
							Create Your Pitch
						</h1>
						<p className="text-muted-foreground text-lg text-pretty leading-relaxed max-w-2xl mx-auto">
							Transform your innovative idea into a compelling pitch that
							captures investor attention and drives funding success.
						</p>

						<StepIndicator currentStep={currentStep} />
					</div>

					<Form {...form}>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								// Prevent any automatic form submission
							}}
						>
							<Card className="bg-card border-border shadow-2xl backdrop-blur-sm">
								<CardHeader>
									<h2 className="text-2xl font-semibold text-foreground">
										{getStepTitle()}
									</h2>
									<p className="text-muted-foreground text-pretty leading-relaxed">
										{getStepSubtitle()}
									</p>
								</CardHeader>
								<Separator />
								<CardContent className="px-8 py-6">
									{currentStep === 1 && <BasicInfoStep form={form} />}

									{currentStep === 2 && (
										<MediaUploadStep
											form={form}
											dragActive={dragActive}
											onFileUpload={handleFileUpload}
											onFileRemove={handleFileRemove}
											onDragStart={setDragActive}
											onDragEnd={() => setDragActive(null)}
											onDrop={handleDrop}
										/>
									)}

									{currentStep === 3 && (
										<FundingGoalStep
											form={form}
											totalAllocation={totalAllocation}
											onFundingAmountSelect={handleFundingAmountSelect}
										/>
									)}

									{currentStep === 4 && (
										<PreviewStep form={form} onEditStep={goToStep} />
									)}
								</CardContent>

								<CardFooter className="flex justify-between pt-6 border-t border-border">
									<div className="flex gap-3">
										{/* <Button
											type="button"
											variant="outline"
											className="bg-transparent border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
										>
											<Save className="h-4 w-4 mr-2" />
											Save Draft
										</Button> */}
										{currentStep > 1 && (
											<Button
												type="button"
												variant="outline"
												onClick={previousStep}
												className="bg-transparent border-border text-foreground hover:bg-accent"
											>
												<ChevronLeft className="h-4 w-4 mr-2" />
												Previous Step
											</Button>
										)}
									</div>

									<div className="flex items-center gap-4">
										<span className="text-sm text-muted-foreground">
											Step {currentStep} of 4
										</span>
										{currentStep < 4 ? (
											<Button
												type="button"
												onClick={handleNext}
												className="bg-primary hover:bg-primary/90 text-primary-foreground"
											>
												Next Step
												<ChevronRight className="h-4 w-4 ml-2" />
											</Button>
										) : (
											<Button
												type="button"
												onClick={handleFormSubmitClick}
												disabled={isSubmitting}
												className="bg-primary hover:bg-primary/90 text-primary-foreground"
											>
												{isSubmitting ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
														Submitting...
													</>
												) : (
													<>
														Submit Pitch for Review
														<Send className="h-4 w-4 ml-2" />
													</>
												)}
											</Button>
										)}
									</div>
								</CardFooter>
							</Card>
						</form>
					</Form>
				</div>
			</div>

			<SuccessModal
				isOpen={showSuccess}
				onClose={handleSuccessClose}
				submissionId={submissionId}
				pitchTitle={form.getValues("title")}
			/>
		</>
	);
}
