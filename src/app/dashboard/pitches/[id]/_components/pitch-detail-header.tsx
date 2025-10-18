'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Pitch } from '@/db/schema/pitches';
import { cn } from '@/lib/utils';
import {
  Check,
  Clock,
  X,
  Search,
  Star,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface PitchDetailHeaderProps {
  pitch: Pitch;
  fundingPercentage: number;
}

const statusConfig = {
  approved: {
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: Check,
    label: 'Approved',
  },
  pending: {
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: Clock,
    label: 'Pending Review',
  },
  rejected: {
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: X,
    label: 'Rejected',
  },
  'in-pool': {
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Info,
    label: 'In Pool',
  },
  'under-review': {
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Search,
    label: 'Under Review',
  },
  shortlisted: {
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: Star,
    label: 'Shortlisted',
  },
  'conditional-approval': {
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    icon: AlertTriangle,
    label: 'Conditional Approval',
  },
  'needs-more-info': {
    color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    icon: Info,
    label: 'More Info Needed',
  },
} as const;

export function PitchDetailHeader({
  pitch,
  fundingPercentage,
}: PitchDetailHeaderProps) {
  const config = statusConfig[pitch.status];
  const Icon = config.icon;

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg">
      {/* Hero Image */}
      <div className="relative h-[400px] w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        {pitch.imageUrl || pitch.featuredImage ? (
          <Image
            src={pitch.imageUrl || pitch.featuredImage || ''}
            alt={pitch.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
              <span className="text-6xl font-bold text-white">
                {pitch.title.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge Overlay */}
        <div className="absolute right-4 top-4">
          <Badge
            variant="outline"
            className={cn(
              'flex items-center gap-2 border px-3 py-1.5',
              config.color,
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{config.label}</span>
          </Badge>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
            {pitch.title}
          </h1>
          <p className="text-lg text-gray-200 drop-shadow-md">
            {pitch.elevatorPitch}
          </p>
        </div>
      </div>

      {/* Funding Progress Bar */}
      <div className="bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Funding Progress</span>
          <span className="font-semibold text-foreground">
            {fundingPercentage}% funded
          </span>
        </div>
        <Progress value={fundingPercentage} className="h-2" />
      </div>
    </div>
  );
}
