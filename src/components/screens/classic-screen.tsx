"use client";
import type { Pitch } from "@/lib/stores/pitches";
import {
	ChevronLeft,
	ChevronRight,
	Check,
	Clock,
	X,
	Search,
	Star,
	AlertTriangle,
	Info,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRef, useState } from "react";
import { usePitchesStore } from "@/lib/stores/pitches";
import Image from "next/image";

// Animation constants
const ANIMATION_DURATION = "300ms";
const ANIMATION_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

// Status configuration
const statusConfig = {
	approved: { color: "bg-green-500", icon: Check, label: "Approved" },
	pending: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
	rejected: { color: "bg-red-500", icon: X, label: "Rejected" },
	"in-pool": { color: "bg-blue-400", icon: Info, label: "In Pool" },
	"under-review": { color: "bg-blue-500", icon: Search, label: "Under Review" },
	shortlisted: { color: "bg-purple-500", icon: Star, label: "Shortlisted" },
	"conditional-approval": {
		color: "bg-orange-500",
		icon: AlertTriangle,
		label: "Conditional",
	},
	"needs-more-info": {
		color: "bg-gray-500",
		icon: Info,
		label: "More Info Needed",
	},
} as const;

// Calculate days left
function calculateDaysLeft(
	dateSubmitted: string,
	timeToRaise?: string,
): number {
	if (!timeToRaise) return 0;
	const submitted = new Date(dateSubmitted);
	const deadline = new Date(submitted);
	deadline.setDate(deadline.getDate() + Number.parseInt(timeToRaise));
	const today = new Date();
	const diffTime = deadline.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return Math.max(0, diffDays);
}

// Calculate funding percentage
function calculateFundingPercentage(
	fundingGoal: number,
	currentFunding = 23000,
): number {
	return Math.min(100, Math.round((currentFunding / fundingGoal) * 100));
}

// Status Badge Component with hover expansion
function StatusBadge({ status }: { status: Pitch["status"] }) {
	const [isHovered, setIsHovered] = useState(false);
	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<div
			className="relative"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Badge
				className={`${config.color} text-white border-0 flex items-center gap-1.5 px-2 py-1`}
				style={{
					transition: `all ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
				}}
			>
				<span
					className="text-xs font-medium whitespace-nowrap overflow-hidden"
					style={{
						maxWidth: isHovered ? "200px" : "0",
						opacity: isHovered ? 1 : 0,
						transition: `max-width ${ANIMATION_DURATION} ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
					}}
				>
					{config.label}
				</span>
				<Icon className="h-3 w-3 flex-shrink-0" />
			</Badge>
		</div>
	);
}

// Large Featured Card Component
function LargeFeaturedCard({ pitch }: { pitch: Pitch }) {
	const [isHovered, setIsHovered] = useState(false);
	const fundingPercentage = calculateFundingPercentage(pitch.fundingGoal);
	const daysLeft = calculateDaysLeft(pitch.dateSubmitted, pitch.timeToRaise);

	return (
		<Card
			className="relative overflow-visible cursor-pointer pt-0"
			style={{
				transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
				boxShadow: isHovered
					? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
					: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
				zIndex: isHovered ? 10 : 1,
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Image section with progress bar at bottom */}
			<CardHeader className="p-0">
				<div className="relative h-[400px] overflow-hidden rounded-t-lg">
					<Image
						src={pitch.imageUrl || "/placeholder.svg"}
						alt={pitch.title}
						className="w-full h-full object-cover"
						style={{
							transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
							transform: isHovered ? "scale(1.05)" : "scale(1)",
						}}
						width={768}
						height={768}
					/>
					<div className="absolute bottom-0 left-0 right-0">
						<Progress
							value={fundingPercentage}
							className="h-2 rounded-none bg-black/20"
						/>
					</div>
				</div>
			</CardHeader>

			{/* Content section below image - fixed height to prevent layout shift */}
			<CardContent className="space-y-4">
				{/* Profile icon, title, and badge */}
				<div className="flex items-start gap-3">
					<div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center">
						<span className="text-white text-xl font-bold">
							{pitch.title.charAt(0)}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-2 mb-1">
							<h2 className="text-2xl font-bold text-foreground">
								{pitch.title}
							</h2>
							<StatusBadge status={pitch.status} />
						</div>
						<p className="text-muted-foreground line-clamp-1">
							{pitch.elevatorPitch}
						</p>
					</div>
				</div>

				{/* Time and funding info */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Clock className="h-4 w-4" />
					<span>
						{daysLeft} days left • {fundingPercentage}% funded
					</span>
				</div>

				{/* Expanded content - absolutely positioned to overlay below content */}
				<div
					className="space-y-3 overflow-hidden rounded-b-lg"
					style={{
						top: "100%",
						maxHeight: isHovered ? "1000px" : "0",
						opacity: isHovered ? 1 : 0,
						transition: `max-height ${ANIMATION_DURATION} ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
						boxShadow: isHovered
							? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
							: "none",
					}}
				>
					<p className="text-sm text-foreground leading-relaxed">
						{pitch.summary}
					</p>
					<div className="flex flex-wrap gap-2">
						<Badge variant="outline">{pitch.industry}</Badge>
						<Badge variant="outline">{pitch.location}</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Small Featured Card Component
function SmallFeaturedCard({ pitch }: { pitch: Pitch }) {
	const [isHovered, setIsHovered] = useState(false);
	const fundingPercentage = calculateFundingPercentage(pitch.fundingGoal);
	const daysLeft = calculateDaysLeft(pitch.dateSubmitted, pitch.timeToRaise);

	return (
		<Card
			className="relative overflow-visible cursor-pointer pt-0 rounded-lg"
			style={{
				transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
				boxShadow: isHovered
					? "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
					: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
				zIndex: isHovered ? 10 : 1,
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Image section with progress bar at bottom */}
			<div className="relative h-auto max-h-[200px] overflow-hidden rounded-t-lg">
				<Image
					src={pitch.imageUrl || "/placeholder.svg"}
					alt={pitch.title}
					className="w-full h-full object-cover rounded-t-lg hover:rounded-t-none"
					style={{
						transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
						transform: isHovered ? "scale(1.05)" : "scale(1)",
					}}
					width={320}
					height={120}
				/>
				<div className="absolute bottom-0 left-0 right-0">
					<Progress
						value={fundingPercentage}
						className="h-1.5 rounded-none bg-black/20"
					/>
				</div>
			</div>

			{/* Content section below image - fixed height */}
			<div className="relative px-3 pb-3 space-y-2">
				{/* Profile icon, title, and badge */}
				<div className="flex items-start gap-2">
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center">
						<span className="text-white text-sm font-bold">
							{pitch.title.charAt(0)}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-1 mb-0.5">
							<h3 className="text-sm font-bold text-foreground truncate">
								{pitch.title}
							</h3>
							<StatusBadge status={pitch.status} />
						</div>
						<p className="text-xs text-muted-foreground line-clamp-1">
							{pitch.elevatorPitch}
						</p>
					</div>
				</div>

				{/* Time and funding info */}
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Clock className="h-3 w-3" />
					<span>
						{daysLeft} days left • {fundingPercentage}% funded
					</span>
				</div>
			</div>
		</Card>
	);
}

// Regular Card Component (for carousels)
function PitchCard({ pitch }: { pitch: Pitch }) {
	const [isHovered, setIsHovered] = useState(false);
	const fundingPercentage = calculateFundingPercentage(pitch.fundingGoal);
	const daysLeft = calculateDaysLeft(pitch.dateSubmitted, pitch.timeToRaise);

	return (
		<div className="relative flex-shrink-0 w-[320px]">
			<Card
				className="cursor-pointer overflow-visible pt-0 "
				style={{
					transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}, transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
					boxShadow: isHovered
						? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
						: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
					transform: isHovered ? "translateY(-8px)" : "translateY(0)",
					zIndex: isHovered ? 20 : 1,
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Image section with progress bar at bottom */}
				<div className="relative h-[200px] overflow-hidden rounded-t-lg">
					<Image
						src={pitch.imageUrl || "/placeholder.svg"}
						alt={pitch.title}
						className="w-full h-full object-cover rounded-t-lg"
						style={{
							transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
							transform: isHovered ? "scale(1.05)" : "scale(1)",
						}}
						width={320}
						height={200}
					/>
					<div className="absolute bottom-0 left-0 right-0">
						<Progress
							value={fundingPercentage}
							className="h-2 rounded-none bg-black/20"
						/>
					</div>
				</div>

				{/* Content section below image - fixed height to prevent layout shift */}
				<div className="relative px-4 pb-4 space-y-3">
					{/* Profile icon, title, and badge */}
					<div className="flex items-start gap-3">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0 flex items-center justify-center">
							<span className="text-white font-bold">
								{pitch.title.charAt(0)}
							</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-2 mb-1">
								<h3 className="text-lg font-bold text-foreground">
									{pitch.title}
								</h3>
								<StatusBadge status={pitch.status} />
							</div>
							<p className="text-sm text-muted-foreground line-clamp-1">
								{pitch.elevatorPitch}
							</p>
						</div>
					</div>

					{/* Time and funding info */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Clock className="h-4 w-4" />
						<span>
							{daysLeft} days left • {fundingPercentage}% funded
						</span>
					</div>

					{/* Expanded content - absolutely positioned to overlay below content */}
					<div
						className="left-0 right-0  px-4 pb-4 space-y-3 overflow-hidden rounded-b-lg"
						style={{
							top: "100%",
							maxHeight: isHovered ? "500px" : "0",
							opacity: isHovered ? 1 : 0,
							transition: `max-height ${ANIMATION_DURATION} ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
							boxShadow: isHovered
								? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
								: "none",
						}}
					>
						<p className="text-sm text-foreground leading-relaxed">
							{pitch.summary}
						</p>
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">{pitch.industry}</Badge>
							<Badge variant="outline">{pitch.location}</Badge>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}

// Carousel Component
export function IndustryCarousel({ pitches }: { pitches: Pitch[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = 340;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="relative group -mx-12 ">
			<div
				ref={scrollRef}
				className="flex gap-4 scroll-smooth py-4 px-12 scrollbar-hide h-auto"
				style={{
					overflowX: "auto",
					overflowY: "visible",
				}}
			>
				{pitches.map((pitch) => (
					<PitchCard key={pitch.id} pitch={pitch} />
				))}
			</div>
		</div>
	);
}

// Main Page Component
export default function KickstarterPage() {
	const pitches = usePitchesStore((state) => state.pitches);

	// Get featured pitches
	const featuredPitches = pitches.filter((p) => p.featured);
	const mainFeatured = featuredPitches[0];
	const sideFeatured = featuredPitches.slice(1, 4);

	// Group pitches by industry
	const pitchesByIndustry = pitches.reduce(
		(acc, pitch) => {
			if (!acc[pitch.industry]) {
				acc[pitch.industry] = [];
			}
			acc[pitch.industry].push(pitch);
			return acc;
		},
		{} as Record<string, Pitch[]>,
	);

	return (
		<div className="min-h-screen ">
			<main className="container px-4 py-8 space-y-12">
				{/* Hero Section */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						{mainFeatured && <LargeFeaturedCard pitch={mainFeatured} />}
					</div>
					<div className="space-y-4">
						{sideFeatured.map((pitch) => (
							<SmallFeaturedCard key={pitch.id} pitch={pitch} />
						))}
					</div>
				</section>

				{/* Industry Sections */}
				{Object.entries(pitchesByIndustry).map(
					([industry, industryPitches]) => (
						<section key={industry} className="space-y-4">
							<h2 className="text-3xl font-bold text-foreground">{industry}</h2>
							<IndustryCarousel pitches={industryPitches} />
						</section>
					),
				)}
			</main>
		</div>
	);
}
