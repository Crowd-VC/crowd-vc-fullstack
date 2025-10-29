"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { X, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersPanelProps {
	open: boolean;
	onClose: () => void;
}

export function FiltersPanel({ open, onClose }: FiltersPanelProps) {
	return (
		<div
			className={cn(
				"fixed inset-y-0 left-0 z-50 w-80 bg-neutral-900 border-r border-neutral-800 shadow-xl transition-transform duration-300 overflow-y-auto",
				open ? "translate-x-0" : "-translate-x-full",
			)}
		>
			<div className="p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-lg font-semibold text-foreground">Filters</h2>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<Card className="p-4 mb-6 bg-neutral-800 border-neutral-700">
					<div className="flex items-start gap-3">
						<div className="p-2 rounded-lg bg-emerald-500/10">
							<TrendingUp className="h-5 w-5 text-emerald-500" />
						</div>
						<div>
							<h3 className="text-sm font-medium text-foreground mb-1">
								Your Portfolio
							</h3>
							<p className="text-lg font-bold text-foreground">
								$12.4K invested
							</p>
							<p className="text-xs text-neutral-400 mt-1">3 active pools</p>
						</div>
					</div>
				</Card>

				<div className="space-y-6">
					{/* Risk Level */}
					<div>
						<h3 className="font-medium text-foreground mb-3">Risk Level</h3>
						<div className="space-y-2">
							{["Low", "Medium", "High"].map((risk) => (
								<div key={risk} className="flex items-center space-x-2">
									<Checkbox id={`risk-${risk}`} />
									<Label
										htmlFor={`risk-${risk}`}
										className="cursor-pointer text-sm"
									>
										{risk}
									</Label>
								</div>
							))}
						</div>
					</div>

					<Separator className="bg-neutral-800" />

					{/* Industry */}
					<div>
						<h3 className="font-medium text-foreground mb-3">Industry</h3>
						<div className="space-y-2">
							{[
								"AI/ML",
								"Climate Tech",
								"FinTech",
								"Healthcare",
								"Infrastructure",
							].map((industry) => (
								<div key={industry} className="flex items-center space-x-2">
									<Checkbox id={`industry-${industry}`} />
									<Label
										htmlFor={`industry-${industry}`}
										className="cursor-pointer text-sm"
									>
										{industry}
									</Label>
								</div>
							))}
						</div>
					</div>

					<Separator className="bg-neutral-800" />

					{/* Stage */}
					<div>
						<h3 className="font-medium text-foreground mb-3">Stage</h3>
						<div className="space-y-2">
							{["Pre-Seed", "Seed", "Series A", "Series B"].map((stage) => (
								<div key={stage} className="flex items-center space-x-2">
									<Checkbox id={`stage-${stage}`} />
									<Label
										htmlFor={`stage-${stage}`}
										className="cursor-pointer text-sm"
									>
										{stage}
									</Label>
								</div>
							))}
						</div>
					</div>

					<Separator className="bg-neutral-800" />

					{/* Min Ticket */}
					<div>
						<h3 className="font-medium text-foreground mb-3">
							Min. Ticket Size
						</h3>
						<div className="space-y-2">
							{["< $10K", "$10K - $25K", "$25K - $50K", "> $50K"].map(
								(ticket) => (
									<div key={ticket} className="flex items-center space-x-2">
										<Checkbox id={`ticket-${ticket}`} />
										<Label
											htmlFor={`ticket-${ticket}`}
											className="cursor-pointer text-sm"
										>
											{ticket}
										</Label>
									</div>
								),
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex gap-3">
					<Button
						variant="outline"
						className="flex-1 bg-transparent border-neutral-700 hover:bg-neutral-800"
					>
						Clear All
					</Button>
					<Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
						Apply
					</Button>
				</div>
			</div>
		</div>
	);
}
