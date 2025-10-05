import {
	FileText,
	Building2,
	TrendingUp,
	Users,
	MapPin,
	Globe,
	Target,
	Megaphone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { INDUSTRIES, COMPANY_STAGES, VALIDATION_RULES } from "../../constants";
import type { CompleteFormData } from "../../validation";
import type { UseFormReturn } from "react-hook-form";

interface BasicInfoStepProps {
	form: UseFormReturn<CompleteFormData>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
	return (
		<div className="space-y-8">
			<FormField
				control={form.control}
				name="title"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Project Title
						</FormLabel>
						<FormControl>
							<Input
								placeholder="Enter your project name"
								className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary "
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
									}
								}}
								{...field}
							/>
						</FormControl>
						<FormDescription>
							Choose a compelling name that captures your project's essence
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="summary"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Project Summary
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Describe your project, the problem it solves, and your unique solution..."
								className="min-h-[120px] bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
								maxLength={VALIDATION_RULES.SUMMARY_MAX_LENGTH}
								{...field}
							/>
						</FormControl>
						<FormDescription className="flex justify-between items-center">
							<span>
								Provide a clear and concise overview of your business idea
							</span>
							<span>
								{field.value.length}/{VALIDATION_RULES.SUMMARY_MAX_LENGTH}{" "}
								characters
							</span>
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="oneKeyMetric"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<Target className="h-5 w-5 text-primary" />
							Key Metric
						</FormLabel>
						<FormControl>
							<Input
								placeholder="e.g., 10K+ monthly active users, 50% month-over-month growth, $100K ARR"
								className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
								maxLength={VALIDATION_RULES.KEY_METRIC_MAX_LENGTH}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
									}
								}}
								{...field}
							/>
						</FormControl>
						<FormDescription>
							Single most important metric that demonstrates your traction or
							progress
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="elevatorPitch"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<Megaphone className="h-5 w-5 text-primary" />
							Elevator Pitch
						</FormLabel>
						<FormControl>
							<Textarea
								placeholder="Craft a compelling 200-character pitch that hooks investors instantly..."
								className="min-h-[100px] bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
								maxLength={VALIDATION_RULES.ELEVATOR_PITCH_MAX_LENGTH}
								{...field}
							/>
						</FormControl>
						<FormDescription className="flex justify-between items-center">
							<span>
								Craft a compelling 200-character pitch that hooks investors
								instantly
							</span>
							<span>
								{field.value.length}/
								{VALIDATION_RULES.ELEVATOR_PITCH_MAX_LENGTH} characters
							</span>
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="industry"
				render={({ field }) => (
					<FormItem>
						<FormLabel className="flex items-center gap-2">
							<Building2 className="h-5 w-5 text-primary" />
							Industry
						</FormLabel>
						<Select onValueChange={field.onChange} defaultValue={field.value}>
							<FormControl>
								<SelectTrigger className="w-full bg-card border-border text-foreground focus:border-primary focus:ring-primary ">
									<SelectValue placeholder="Select your industry" />
								</SelectTrigger>
							</FormControl>
							<SelectContent className="bg-popover border-border">
								{INDUSTRIES.map((industry) => (
									<SelectItem
										key={industry}
										value={industry}
										className="text-foreground focus:bg-accent"
									>
										{industry}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<FormDescription>
							This helps us connect you with relevant investors
						</FormDescription>
						<FormMessage />
					</FormItem>
				)}
			/>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={form.control}
					name="companyStage"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-primary" />
								Company Stage
							</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full bg-card border-border text-foreground focus:border-primary focus:ring-primary ">
										<SelectValue placeholder="Select stage" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="bg-popover border-border">
									{COMPANY_STAGES.map((stage) => (
										<SelectItem
											key={stage}
											value={stage}
											className="text-foreground focus:bg-accent"
										>
											{stage}
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
					name="teamSize"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<Users className="h-5 w-5 text-primary" />
								Team Size
							</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Number of team members"
									className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
										}
									}}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FormField
					control={form.control}
					name="location"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<MapPin className="h-5 w-5 text-primary" />
								Location
							</FormLabel>
							<FormControl>
								<Input
									placeholder="City, Country"
									className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary "
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
										}
									}}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="website"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="flex items-center gap-2">
								<Globe className="h-5 w-5 text-primary" />
								Website (Optional)
							</FormLabel>
							<FormControl>
								<Input
									placeholder="https://yourwebsite.com"
									className="bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary "
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
										}
									}}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</div>
	);
}
