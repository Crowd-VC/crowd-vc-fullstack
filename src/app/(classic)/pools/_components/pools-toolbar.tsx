"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/shadcn/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PoolsToolbarProps {
	onSearchChange: (search: string) => void;
	onTabChange: (tab: string) => void;
	onSortChange: (sort: string) => void;
	onToggleFilters: () => void;
}

export function PoolsToolbar({
	onSearchChange,
	onTabChange,
	onSortChange,
	onToggleFilters,
}: PoolsToolbarProps) {
	const [search, setSearch] = useState("");
	const [activeTab, setActiveTab] = useState("all");

	const handleSearchChange = (value: string) => {
		setSearch(value);
		onSearchChange(value);
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		onTabChange(tab);
	};

	const tabs = [
		{ value: "all", label: "All Pools" },
		{ value: "active", label: "Active" },
		{ value: "closing", label: "Closing Soon" },
	];

	return (
		<div className="space-y-4">
			{/* Search and Filters */}
			<div className="flex gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search pools..."
						value={search}
						onChange={(e) => handleSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Button variant="outline" onClick={onToggleFilters}>
					<SlidersHorizontal className="h-4 w-4 mr-2" />
					Filters
				</Button>
			</div>

			{/* Tabs and Sort */}
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					{tabs.map((tab) => (
						<button
							key={tab.value}
							onClick={() => handleTabChange(tab.value)}
							className={cn(
								"px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
								"border border-neutral-700",
								activeTab === tab.value
									? "bg-neutral-800 text-foreground border-neutral-700"
									: "bg-transparent text-neutral-400 hover:text-foreground hover:border-neutral-600",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>

				<Select defaultValue="trending" onValueChange={onSortChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="trending">Trending</SelectItem>
						<SelectItem value="newest">Newest</SelectItem>
						<SelectItem value="funded">Most Funded</SelectItem>
						<SelectItem value="deadline">Deadline</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
