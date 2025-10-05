'use client';
import type { Pitch } from '@/db/schema/pitches';
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
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRef, useState } from 'react';
import { usePitchesStore } from '@/lib/stores/pitches';
import Image from 'next/image';

// Animation constants
const ANIMATION_DURATION = '300ms';
const ANIMATION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

// Status configuration
const statusConfig = {
  approved: { color: 'bg-green-500', icon: Check, label: 'Approved' },
  pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
  rejected: { color: 'bg-red-500', icon: X, label: 'Rejected' },
  'in-pool': { color: 'bg-blue-400', icon: Info, label: 'In Pool' },
  'under-review': { color: 'bg-blue-500', icon: Search, label: 'Under Review' },
  shortlisted: { color: 'bg-purple-500', icon: Star, label: 'Shortlisted' },
  'conditional-approval': {
    color: 'bg-orange-500',
    icon: AlertTriangle,
    label: 'Conditional',
  },
  'needs-more-info': {
    color: 'bg-gray-500',
    icon: Info,
    label: 'More Info Needed',
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
function StatusBadge({ status }: { status: Pitch['status'] }) {
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
        className={`${config.color} flex items-center gap-1.5 border-0 px-2 py-1 text-white`}
        style={{
          transition: `all ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
        }}
      >
        <span
          className="overflow-hidden whitespace-nowrap text-xs font-medium"
          style={{
            maxWidth: isHovered ? '200px' : '0',
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
      className="relative cursor-pointer overflow-visible pt-0"
      style={{
        transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: isHovered ? 10 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image section with progress bar at bottom */}
      <CardHeader className="p-0">
        <div className="relative h-[400px] overflow-hidden rounded-t-lg">
          <Image
            src={pitch.imageUrl || '/placeholder.svg'}
            alt={pitch.title}
            className="h-full w-full object-cover"
            style={{
              transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
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
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
            <span className="text-xl font-bold text-white">
              {pitch.title.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-foreground">
                {pitch.title}
              </h2>
              <StatusBadge status={pitch.status} />
            </div>
            <p className="line-clamp-1 text-muted-foreground">
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
            top: '100%',
            maxHeight: isHovered ? '1000px' : '0',
            opacity: isHovered ? 1 : 0,
            transition: `max-height ${ANIMATION_DURATION} ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
            boxShadow: isHovered
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              : 'none',
          }}
        >
          <p className="text-sm leading-relaxed text-foreground">
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
      className="relative cursor-pointer overflow-visible rounded-lg pt-0"
      style={{
        transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
        boxShadow: isHovered
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        zIndex: isHovered ? 10 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image section with progress bar at bottom */}
      <div className="relative h-auto max-h-[200px] overflow-hidden rounded-t-lg">
        <Image
          src={pitch.imageUrl || '/placeholder.svg'}
          alt={pitch.title}
          className="h-full w-full rounded-t-lg object-cover hover:rounded-t-none"
          style={{
            transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
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
      <div className="relative space-y-2 px-3 pb-3">
        {/* Profile icon, title, and badge */}
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
            <span className="text-sm font-bold text-white">
              {pitch.title.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center justify-between gap-1">
              <h3 className="truncate text-sm font-bold text-foreground">
                {pitch.title}
              </h3>
              <StatusBadge status={pitch.status} />
            </div>
            <p className="line-clamp-1 text-xs text-muted-foreground">
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
    <div className="relative w-[320px] flex-shrink-0">
      <Card
        className="cursor-pointer overflow-visible pt-0"
        style={{
          transition: `box-shadow ${ANIMATION_DURATION} ${ANIMATION_EASING}, transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
          boxShadow: isHovered
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          zIndex: isHovered ? 20 : 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image section with progress bar at bottom */}
        <div className="relative h-[200px] overflow-hidden rounded-t-lg">
          <Image
            src={pitch.imageUrl || '/placeholder.svg'}
            alt={pitch.title}
            className="h-full w-full rounded-t-lg object-cover"
            style={{
              transition: `transform ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
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
        <div className="relative space-y-3 px-4 pb-4">
          {/* Profile icon, title, and badge */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
              <span className="font-bold text-white">
                {pitch.title.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {pitch.title}
                </h3>
                <StatusBadge status={pitch.status} />
              </div>
              <p className="line-clamp-1 text-sm text-muted-foreground">
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
            className="left-0 right-0 space-y-3 overflow-hidden rounded-b-lg px-4 pb-4"
            style={{
              top: '100%',
              maxHeight: isHovered ? '500px' : '0',
              opacity: isHovered ? 1 : 0,
              transition: `max-height ${ANIMATION_DURATION} ${ANIMATION_EASING}, opacity ${ANIMATION_DURATION} ${ANIMATION_EASING}`,
              boxShadow: isHovered
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                : 'none',
            }}
          >
            <p className="text-sm leading-relaxed text-foreground">
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="group relative -mx-12">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex h-auto gap-4 scroll-smooth px-12 py-4"
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
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
export default function ClassicScreen({ pitches }: { pitches: Pitch[] }) {
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
    <div className="min-h-screen">
      <main className="container space-y-12 px-4 py-8">
        {/* Hero Section */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
