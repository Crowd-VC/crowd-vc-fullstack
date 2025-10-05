"use client";

import {
	FileText,
	Building2,
	TrendingUp,
	Users,
	MapPin,
	Globe,
	Target,
	Megaphone,
	Upload,
	Play,
	Link,
	DollarSign,
	PieChart,
	Clock,
	Percent,
	Edit3,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { INDUSTRIES, COMPANY_STAGES, TIMELINE_OPTIONS } from "../../constants";
import type { CompleteFormData } from "../../validation";
import type { UseFormReturn } from "react-hook-form";

interface PreviewStepProps {
	form: UseFormReturn<CompleteFormData>;
	onEditStep: (step: number) => void;
}

export function PreviewStep({ form, onEditStep }: PreviewStepProps) {
	const formData = form.getValues();

	const formatCurrency = (amount: string) => {
		if (amount === "custom") {
			return `$${Number(formData.customAmount || 0).toLocaleString()}`;
		}
		return `$${Number(amount).toLocaleString()}`;
	};

	const getFundingBreakdown = () => {
		const breakdown = [
			{ label: "Product Development", value: formData.productDevelopment },
			{ label: "Marketing & Sales", value: formData.marketingSales },
			{ label: "Team Expansion", value: formData.teamExpansion },
			{ label: "Operations", value: formData.operations },
		].filter((item) => item.value && Number(item.value) > 0);

		return breakdown;
	};

	return (
		<div className="space-y-6">
			{/* Step 1: Basic Information */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5 text-primary" />
							Basic Information
						</CardTitle>
						<Button
							variant="solid"
							size="small"
							onClick={() => onEditStep(1)}
							className="flex items-center gap-2"
						>
							<Edit3 className="h-4 w-4" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1">
								Project Title
							</h4>
							<p className="text-foreground">
								{formData.title || "Not provided"}
							</p>
						</div>
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1">
								Industry
							</h4>
							<Badge variant="secondary">{formData.industry}</Badge>
						</div>
					</div>
					<div>
						<h4 className="font-medium text-sm text-muted-foreground mb-1">
							Project Summary
						</h4>
						<p className="text-foreground text-sm leading-relaxed">
							{formData.summary || "Not provided"}
						</p>
					</div>
					<div>
						<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
							<Target className="h-4 w-4" />
							Key Metric
						</h4>
						<p className="text-foreground font-medium">
							{formData.oneKeyMetric || "Not provided"}
						</p>
					</div>

					<div>
						<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
							<Megaphone className="h-4 w-4" />
							Elevator Pitch
						</h4>
						<p className="text-foreground text-sm italic">
							"{formData.elevatorPitch || "Not provided"}"
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<TrendingUp className="h-4 w-4" />
								Company Stage
							</h4>
							<p className="text-foreground">{formData.companyStage}</p>
						</div>
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<Users className="h-4 w-4" />
								Team Size
							</h4>
							<p className="text-foreground">
								{formData.teamSize || "Not provided"} members
							</p>
						</div>
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Location
							</h4>
							<p className="text-foreground">
								{formData.location || "Not provided"}
							</p>
						</div>
					</div>

					{formData.website && (
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<Globe className="h-4 w-4" />
								Website
							</h4>
							<a
								href={formData.website}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								{formData.website}
							</a>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Step 2: Media Uploads */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Upload className="h-5 w-5 text-primary" />
							Media Uploads
						</CardTitle>
						<Button
							variant="solid"
							size="small"
							onClick={() => onEditStep(2)}
							className="flex items-center gap-2"
						>
							<Edit3 className="h-4 w-4" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
								<FileText className="h-4 w-4" />
								Pitch Deck
							</h4>
							{formData.pitchDeck ? (
								<div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
									<FileText className="h-4 w-4 text-green-500" />
									<span className="text-sm">{formData.pitchDeck.name}</span>
									<Badge variant="outline" className="text-xs">
										{(formData.pitchDeck.size / 1024 / 1024).toFixed(1)} MB
									</Badge>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									No pitch deck uploaded
								</p>
							)}
						</div>

						<div className="space-y-2">
							<h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
								<Play className="h-4 w-4" />
								Pitch Video
							</h4>
							{formData.pitchVideo ? (
								<div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
									<Play className="h-4 w-4 text-blue-500" />
									<span className="text-sm">{formData.pitchVideo.name}</span>
									<Badge variant="outline" className="text-xs">
										{(formData.pitchVideo.size / 1024 / 1024).toFixed(1)} MB
									</Badge>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									No pitch video uploaded
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<Link className="h-4 w-4" />
								Demo URL
							</h4>
							{formData.demoUrl ? (
								<a
									href={formData.demoUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline text-sm"
								>
									{formData.demoUrl}
								</a>
							) : (
								<p className="text-muted-foreground text-sm">
									No demo URL provided
								</p>
							)}
						</div>

						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
								<Link className="h-4 w-4" />
								Prototype URL
							</h4>
							{formData.prototypeUrl ? (
								<a
									href={formData.prototypeUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary hover:underline text-sm"
								>
									{formData.prototypeUrl}
								</a>
							) : (
								<p className="text-muted-foreground text-sm">
									No prototype URL provided
								</p>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Step 3: Funding Goal */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<DollarSign className="h-5 w-5 text-primary" />
							Funding Goal
						</CardTitle>
						<Button
							variant="solid"
							size="small"
							onClick={() => onEditStep(3)}
							className="flex items-center gap-2"
						>
							<Edit3 className="h-4 w-4" />
							Edit
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h4 className="font-medium text-sm text-muted-foreground mb-2">
							Investment Target
						</h4>
						<div className="text-2xl font-bold text-primary">
							{formatCurrency(formData.fundingGoal)}
						</div>
					</div>

					{getFundingBreakdown().length > 0 && (
						<div>
							<h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
								<PieChart className="h-4 w-4" />
								Funding Breakdown
							</h4>
							<div className="space-y-2">
								{getFundingBreakdown().map((item) => (
									<div
										key={item.label}
										className="flex justify-between items-center"
									>
										<span className="text-sm">{item.label}</span>
										<div className="flex items-center gap-2">
											<div className="w-20 bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full"
													style={{ width: `${item.value}%` }}
												/>
											</div>
											<span className="text-sm font-medium w-8">
												{item.value}%
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{formData.timeToRaise && (
							<div>
								<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
									<Clock className="h-4 w-4" />
									Time to Raise
								</h4>
								<p className="text-foreground">{formData.timeToRaise}</p>
							</div>
						)}

						{formData.expectedROI && (
							<div>
								<h4 className="font-medium text-sm text-muted-foreground mb-1 flex items-center gap-2">
									<Percent className="h-4 w-4" />
									Expected ROI Timeline
								</h4>
								<p className="text-foreground">{formData.expectedROI}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Summary Card */}
			<Card className="border-primary/20 bg-primary/5">
				<CardContent className="p-6">
					<div className="text-center space-y-3">
						<h3 className="text-lg font-semibold">Ready to Submit?</h3>
						<p className="text-muted-foreground text-sm">
							Review all the information above. Once submitted, your pitch will
							be reviewed by our investment team.
						</p>
						<div className="flex justify-center gap-2 text-xs text-muted-foreground">
							<span>
								📊{" "}
								{formData.pitchDeck ? "Pitch deck included" : "No pitch deck"}
							</span>
							<span>•</span>
							<span>
								🎥 {formData.pitchVideo ? "Video included" : "No video"}
							</span>
							<span>•</span>
							<span>💰 {formatCurrency(formData.fundingGoal)} target</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
