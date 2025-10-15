"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn/radio-group";
import { Progress } from "@/components/ui/progress";
import type { Pool } from "@/lib/types";

interface VoteModalProps {
	pool: Pool | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (proposalId: string, choice: string) => Promise<void>;
}

export function VoteModal({
	pool,
	open,
	onOpenChange,
	onConfirm,
}: VoteModalProps) {
	const [selectedChoice, setSelectedChoice] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!pool || pool.voting.length === 0) return null;

	const proposal = pool.voting[0];
	const votePercentage = (proposal.votes / proposal.total_votes) * 100;

	const handleVote = async () => {
		if (!selectedChoice) return;

		setIsSubmitting(true);
		try {
			await onConfirm(proposal.proposal_id, selectedChoice);
			onOpenChange(false);
			setSelectedChoice("");
		} catch (error) {
			console.error("Vote failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Cast Your Vote</DialogTitle>
					<DialogDescription>{pool.title}</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Proposal */}
					<div className="space-y-3">
						<h4 className="font-medium text-foreground">{proposal.title}</h4>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Current Support</span>
								<span className="font-medium">
									{proposal.votes} / {proposal.total_votes} votes
								</span>
							</div>
							<Progress value={votePercentage} className="h-2" />
						</div>
					</div>

					{/* Vote Options */}
					<div className="space-y-3">
						<Label>Your Vote</Label>
						<RadioGroup
							value={selectedChoice}
							onValueChange={setSelectedChoice}
						>
							<div className="flex items-center space-x-2 rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors">
								<RadioGroupItem value="approve" id="approve" />
								<Label htmlFor="approve" className="flex-1 cursor-pointer">
									Approve
								</Label>
							</div>
							<div className="flex items-center space-x-2 rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors">
								<RadioGroupItem value="reject" id="reject" />
								<Label htmlFor="reject" className="flex-1 cursor-pointer">
									Reject
								</Label>
							</div>
							<div className="flex items-center space-x-2 rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors">
								<RadioGroupItem value="abstain" id="abstain" />
								<Label htmlFor="abstain" className="flex-1 cursor-pointer">
									Abstain
								</Label>
							</div>
						</RadioGroup>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleVote}
							disabled={!selectedChoice || isSubmitting}
							className="flex-1 bg-primary hover:bg-primary/90"
						>
							{isSubmitting ? "Submitting..." : "Submit Vote"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
