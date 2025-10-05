import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "../constants";

interface StepIndicatorProps {
	currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
	return (
		<div className="flex items-center justify-center mt-8 mb-8">
			<div className="flex items-center space-x-8">
				{STEPS.map(({ step, title, subtitle }) => (
					<div key={step} className="flex items-center">
						{step !== 4 && (
							<div className="flex gap-2 justify-center items-center">
								<div
									className={cn(
										"w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-colors mb-2",
										step === currentStep
											? "bg-slate-500 text-primary-foreground"
											: step < currentStep
												? "bg-slate-500 text-primary-foreground"
												: "bg-slate-900 text-muted-foreground",
									)}
								>
									{step < currentStep ? (
										<CheckCircle className="h-6 w-6" />
									) : (
										step
									)}
								</div>
								<div className="text-left">
									<div
										className={cn(
											"text-sm font-medium",
											step === currentStep
												? "text-primary"
												: step < currentStep
													? "text-primary"
													: "text-muted-foreground",
										)}
									>
										{title}
									</div>
									<div className="text-xs text-muted-foreground mt-1">
										{subtitle}
									</div>
								</div>
							</div>
						)}
						{step < 3 && (
							<div
								className={cn(
									"w-20 h-0.5 mx-6 mt-[-20px]",
									step < currentStep ? "bg-primary" : "bg-muted",
								)}
							/>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
