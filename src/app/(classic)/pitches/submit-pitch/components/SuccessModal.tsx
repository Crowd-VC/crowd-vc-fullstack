"use client";

import {
	CheckCircle,
	Sparkles,
	ArrowRight,
	Copy,
	ExternalLink,
	Calendar,
	Clock,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	submissionId?: string;
	pitchTitle?: string;
}

export function SuccessModal({
	isOpen,
	onClose,
	submissionId,
	pitchTitle,
}: SuccessModalProps) {
	const router = useRouter();
	const [copied, setCopied] = useState(false);

	if (!isOpen) return null;

	const displaySubmissionId = submissionId || "";
	const estimatedReviewDate = new Date();
	estimatedReviewDate.setDate(estimatedReviewDate.getDate() + 5);

	const copySubmissionId = async () => {
		try {
			await navigator.clipboard.writeText(displaySubmissionId);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const handleViewDashboard = () => {
		router.push("/dashboard");
		onClose();
	};

	const handleTrackSubmission = () => {
		router.push(`/dashboard/pitches/${displaySubmissionId}`);
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<Card className="bg-[#181818] border-[#2a2a2a] shadow-2xl max-w-lg w-full animate-in fade-in-0 zoom-in-95 duration-300">
				<CardHeader className="text-center pb-2">
					<div className="relative mb-6">
						<div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
							<CheckCircle className="h-10 w-10 text-white" />
						</div>
					</div>

					<h2 className="text-2xl font-bold text-[#F1F1F1] mb-2">
						Pitch Submitted Successfully!
					</h2>

					{pitchTitle && (
						<p className="text-[#A1A1A1] text-sm">
							"{pitchTitle}" is now under review
						</p>
					)}
				</CardHeader>

				<Separator className="bg-[#2a2a2a]" />

				<CardContent className=" pb-4 space-y-6">
					{/* Submission Details */}
					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 bg-[#0F0F0F] rounded-lg border border-[#2a2a2a]">
							<div>
								<p className="text-[#A1A1A1] text-sm">Submission ID</p>
								<p className="text-[#F1F1F1] font-mono font-medium">
									{displaySubmissionId}
								</p>
							</div>
							<Button
								variant="ghost"
								size="small"
								onClick={copySubmissionId}
								className="text-[#A1A1A1] hover:text-[#F1F1F1]"
							>
								{copied ? (
									<CheckCircle className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-[#0F0F0F] rounded-lg border border-[#2a2a2a]">
								<div className="flex items-center gap-2 mb-2">
									<Clock className="h-4 w-4 text-blue-400" />
									<p className="text-[#A1A1A1] text-sm">Review Timeline</p>
								</div>
								<p className="text-[#F1F1F1] font-medium">3-5 business days</p>
							</div>

							<div className="p-4 bg-[#0F0F0F] rounded-lg border border-[#2a2a2a]">
								<div className="flex items-center gap-2 mb-2">
									<Calendar className="h-4 w-4 text-green-400" />
									<p className="text-[#A1A1A1] text-sm">Expected By</p>
								</div>
								<p className="text-[#F1F1F1] font-medium">
									{estimatedReviewDate.toLocaleDateString()}
								</p>
							</div>
						</div>
					</div>

					{/* Next Steps Accordion */}
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="next-steps" className="border-[#2a2a2a]">
							<AccordionTrigger className="text-[#F1F1F1] font-semibold hover:text-[#F1F1F1] hover:no-underline">
								What happens next?
							</AccordionTrigger>
							<AccordionContent>
								<div className="space-y-3 text-sm text-[#A1A1A1]">
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-blue-400 text-xs font-bold">1</span>
										</div>
										<p>
											Our investment team reviews your pitch deck and proposal
										</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-orange-400 text-xs font-bold">
												2
											</span>
										</div>
										<p>Initial screening and compatibility assessment</p>
									</div>
									<div className="flex items-start gap-3">
										<div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
											<span className="text-green-400 text-xs font-bold">
												3
											</span>
										</div>
										<p>You'll receive feedback and next steps via email</p>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					{/* Action Buttons */}
					<div className="space-y-3">
						<Button onClick={handleViewDashboard} className="w-full">
							View Dashboard
							<ArrowRight className="h-4 w-4 ml-2" />
						</Button>

						<div className="grid grid-cols-2 gap-3">
							<Button
								onClick={handleTrackSubmission}
								variant="ghost"
								className="bg-transparent border-[#2a2a2a] text-[#F1F1F1] hover:bg-[#2a2a2a]"
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								Track Status
							</Button>

							<Button
								variant="ghost"
								onClick={onClose}
								className="bg-transparent border-[#2a2a2a] text-[#F1F1F1] hover:bg-[#2a2a2a]"
							>
								New Pitch
							</Button>
						</div>
					</div>

					<div className="text-center pt-2">
						<p className="text-[#666] text-xs">
							💡 Tip: Bookmark this page or save your submission ID for easy
							tracking
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
