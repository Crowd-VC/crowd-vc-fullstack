"use client";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, TrendingUp, Target } from "lucide-react";
import type { Pool } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PoolDetailDrawerProps {
	pool: Pool | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onContribute: (pool: Pool) => void;
	onVote: (pool: Pool) => void;
}

export function PoolDetailDrawer({
	pool,
	open,
	onOpenChange,
	onContribute,
	onVote,
}: PoolDetailDrawerProps) {
	if (!pool) return null;

	const progress = (pool.current_size / pool.goal) * 100;
	const daysLeft = Math.ceil(
		(new Date(pool.deadline_utc).getTime() - Date.now()) /
			(1000 * 60 * 60 * 24),
	);

	const riskColors = {
		low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
		medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
		high: "bg-red-500/10 text-red-500 border-red-500/20",
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
				<SheetHeader>
					<div className="flex items-center gap-2 mb-2">
						<Badge
							variant="outline"
							className={cn(
								"text-xs font-medium border",
								riskColors[pool.metadata.risk_level],
							)}
						>
							{pool.metadata.risk_level.toUpperCase()} RISK
						</Badge>
						<Badge variant="secondary" className="text-xs">
							{pool.status.toUpperCase()}
						</Badge>
					</div>
					<SheetTitle className="text-left">{pool.title}</SheetTitle>
					<SheetDescription className="text-left">
						{pool.summary}
					</SheetDescription>
				</SheetHeader>

				<div className="mt-6 space-y-6">
					{/* Progress */}
					<div>
						<div className="flex justify-between items-baseline mb-2">
							<span className="text-3xl font-bold text-foreground">
								${(pool.current_size / 1000000).toFixed(2)}M
							</span>
							<span className="text-sm text-muted-foreground">
								of ${(pool.goal / 1000000).toFixed(1)}M
							</span>
						</div>
						<Progress value={progress} className="h-3 mb-4" />
						<div className="grid grid-cols-2 gap-4">
							<div className="flex items-center gap-2 text-sm">
								<Users className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									{pool.contributors_count} contributors
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Clock className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									{daysLeft} days left
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Target className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									Min. ${(pool.min_ticket / 1000).toFixed(0)}K
								</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">
									{progress.toFixed(0)}% funded
								</span>
							</div>
						</div>
					</div>

					<Separator />

					{/* Portfolio Allocation */}
					<div>
						<h3 className="font-semibold text-foreground mb-4">
							Portfolio Allocation
						</h3>
						<div className="space-y-3">
							{pool.allocation.map((item) => (
								<div
									key={item.startup_id}
									className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
								>
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={item.logo || "/placeholder.svg"} />
											<AvatarFallback>{item.startup_name[0]}</AvatarFallback>
										</Avatar>
										<span className="font-medium text-foreground">
											{item.startup_name}
										</span>
									</div>
									<span className="text-lg font-semibold text-primary">
										{item.percentage}%
									</span>
								</div>
							))}
						</div>
					</div>

					<Separator />

					{/* Industries & Stage */}
					<div>
						<h3 className="font-semibold text-foreground mb-3">Focus Areas</h3>
						<div className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground mb-2">Industries</p>
								<div className="flex flex-wrap gap-2">
									{pool.metadata.industry.map((industry) => (
										<Badge key={industry} variant="secondary">
											{industry}
										</Badge>
									))}
								</div>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-2">Stage</p>
								<div className="flex flex-wrap gap-2">
									{pool.metadata.stage.map((stage) => (
										<Badge key={stage} variant="secondary">
											{stage}
										</Badge>
									))}
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Manager */}
					<div>
						<h3 className="font-semibold text-foreground mb-3">Pool Manager</h3>
						<div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
							<Avatar className="h-12 w-12">
								<AvatarImage src={pool.manager.avatar || "/placeholder.svg"} />
								<AvatarFallback>{pool.manager.name[0]}</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-medium text-foreground">
									{pool.manager.name}
								</p>
								<p className="text-sm text-muted-foreground">
									Verified Manager
								</p>
							</div>
						</div>
					</div>

					{/* Active Voting */}
					{pool.voting.length > 0 && (
						<>
							<Separator />
							<div>
								<h3 className="font-semibold text-foreground mb-3">
									Active Proposals
								</h3>
								{pool.voting.map((vote) => (
									<div
										key={vote.proposal_id}
										className="p-4 rounded-lg border border-border/50 bg-muted/30"
									>
										<p className="font-medium text-foreground mb-2">
											{vote.title}
										</p>
										<div className="flex items-center justify-between text-sm mb-3">
											<span className="text-muted-foreground">
												{vote.votes} / {vote.total_votes} votes
											</span>
											<span className="text-muted-foreground">
												{((vote.votes / vote.total_votes) * 100).toFixed(0)}%
												support
											</span>
										</div>
										<Progress
											value={(vote.votes / vote.total_votes) * 100}
											className="h-2 mb-3"
										/>
										<Button
											variant="outline"
											size="sm"
											className="w-full bg-transparent"
											onClick={() => onVote(pool)}
										>
											Cast Your Vote
										</Button>
									</div>
								))}
							</div>
						</>
					)}

					{/* Actions */}
					<div className="sticky bottom-0 bg-background pt-4 pb-2 border-t border-border/50">
						<Button
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
							size="lg"
							onClick={() => onContribute(pool)}
						>
							Contribute to Pool
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
