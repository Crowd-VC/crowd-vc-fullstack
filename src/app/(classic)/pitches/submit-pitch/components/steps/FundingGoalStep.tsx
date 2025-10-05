import { DollarSign, Target, PieChart, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { FundingAmountSelector } from "../FundingAmountSelector";
import { TIMELINE_OPTIONS, VALIDATION_RULES } from "../../constants";
import type { CompleteFormData } from "../../validation";
import type { UseFormReturn } from "react-hook-form";

interface FundingGoalStepProps {
	form: UseFormReturn<CompleteFormData>;
	totalAllocation: number;
	onFundingAmountSelect: (value: string) => void;
}

export function FundingGoalStep({
	form,
	totalAllocation,
	onFundingAmountSelect,
}: FundingGoalStepProps) {
	const fundingGoal = form.watch("fundingGoal");

	return (
		<div className="space-y-8">
			<FormField
				control={form.control}
				name="fundingGoal"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-primary" />
							Select Funding Amount
						</FormLabel>
						<FormControl>
							<div>
								<FundingAmountSelector
									selectedValue={field.value}
									onSelect={(value) => {
										field.onChange(value);
										onFundingAmountSelect(value);
									}}
									error={form.formState.errors.fundingGoal?.message}
								/>
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			{fundingGoal === "custom" && (
				<FormField
					control={form.control}
					name="customAmount"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<Target className="h-5 w-5 text-primary" />
								Custom Funding Amount
							</FormLabel>
							<FormControl>
								<div className="relative">
									<DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
									<Input
										type="number"
										placeholder="Enter custom amount"
										className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-12"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</div>
							</FormControl>
							<FormDescription>
								Minimum funding goal is $
								{VALIDATION_RULES.MIN_FUNDING_GOAL.toLocaleString()}
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}

			<div className="space-y-6">
				<div className="flex items-center gap-2 mb-4">
					<PieChart className="h-5 w-5 text-primary" />
					<span className="text-sm font-medium text-foreground">
						How will you use the funding?
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<FormField
						control={form.control}
						name="productDevelopment"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Product Development (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="30"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
										max="100"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormDescription className="text-right">
									$
									{(
										(Number.parseInt(form.watch("fundingGoal")) *
											Number.parseInt(field.value || "0")) /
										100
									).toLocaleString()}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="marketingSales"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Marketing & Sales (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="25"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
										max="100"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormDescription className="text-right">
									$
									{(
										(Number.parseInt(form.watch("fundingGoal")) *
											Number.parseInt(field.value || "0")) /
										100
									).toLocaleString()}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="teamExpansion"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Team Expansion (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="25"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
										max="100"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormDescription className="text-right">
									$
									{(
										(Number.parseInt(form.watch("fundingGoal")) *
											Number.parseInt(field.value || "0")) /
										100
									).toLocaleString()}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="operations"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Operations (%)</FormLabel>
								<FormControl>
									<Input
										type="number"
										placeholder="20"
										className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
										max="100"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
											}
										}}
										{...field}
									/>
								</FormControl>
								<FormDescription className="text-right">
									$
									{(
										(Number.parseInt(form.watch("fundingGoal")) *
											Number.parseInt(field.value || "0")) /
										100
									).toLocaleString()}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border border-border">
					<span className="text-sm font-medium text-foreground">
						Total Allocation:
					</span>
					<span
						className={cn(
							"text-lg font-semibold",
							totalAllocation === 100
								? "text-emerald-600"
								: totalAllocation > 100
									? "text-destructive"
									: "text-muted-foreground",
						)}
					>
						{totalAllocation}%
					</span>
				</div>
			</div>

			<div className="space-y-6">
				<div className="flex items-center gap-2 mb-4">
					<Calendar className="h-5 w-5 text-primary" />
					<span className="text-sm font-medium text-foreground">
						Expected Timeline
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<FormField
						control={form.control}
						name="timeToRaise"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Time to raise funds</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full bg-background border-border text-foreground focus:border-primary focus:ring-primary h-12">
											<SelectValue placeholder="Select timeline" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="bg-popover border-border">
										{TIMELINE_OPTIONS.map((timeline) => (
											<SelectItem
												key={timeline}
												value={timeline}
												className="text-foreground focus:bg-accent"
											>
												{timeline}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="expectedROI"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Expected ROI timeline</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger className="w-full bg-background border-border text-foreground focus:border-primary focus:ring-primary h-12">
											<SelectValue placeholder="Select timeline" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="bg-popover border-border">
										{TIMELINE_OPTIONS.map((timeline) => (
											<SelectItem
												key={timeline}
												value={timeline}
												className="text-foreground focus:bg-accent"
											>
												{timeline}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
