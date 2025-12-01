'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Calendar, DollarSign, Building2, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PitchWithUser } from '@/db/types';
import { format } from 'date-fns';
import Link from 'next/link';
import routes from '@/config/routes';

interface PitchReviewCardProps {
  pitch: PitchWithUser;
  onReview: (pitch: PitchWithUser) => void;
  onViewDetails: (pitch: PitchWithUser) => void;
}

export function PitchReviewCard({
  pitch,
  onReview,
  onViewDetails,
}: PitchReviewCardProps) {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-900 text-yellow-300 border-yellow-900',
      label: 'Pending Review',
    },
    'under-review': {
      color: 'bg-blue-900 text-blue-300 border-blue-900',
      label: 'Under Review',
    },
    approved: {
      color: 'bg-emerald-900 text-emerald-300 border-emerald-900',
      label: 'Approved',
    },
    rejected: {
      color: 'bg-red-900 text-red-300 border-red-900',
      label: 'Rejected',
    },
    'in-pool': {
      color: 'bg-purple-900 text-purple-300 border-purple-900',
      label: 'In Pool',
    },
    shortlisted: {
      color: 'bg-indigo-900 text-indigo-300 border-indigo-900',
      label: 'Shortlisted',
    },
    'conditional-approval': {
      color: 'bg-amber-900 text-amber-300 border-amber-900',
      label: 'Conditional',
    },
    'needs-more-info': {
      color: 'bg-orange-900 text-orange-300 border-orange-900',
      label: 'Needs Info',
    },
  };

  const config = statusConfig[pitch.status];
  const submittedDate = pitch.dateSubmitted
    ? format(new Date(pitch.dateSubmitted), 'MMM dd, yyyy')
    : 'N/A';

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/40">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('border text-xs', config.color)}
              >
                {config.label}
              </Badge>
              {pitch.submissionId && (
                <span className="font-mono text-xs text-muted-foreground">
                  {pitch.submissionId}
                </span>
              )}
            </div>
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
              {pitch.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {pitch.summary}
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-4 space-y-2 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{pitch.industry}</span>
            <span className="text-border">•</span>
            <span>{pitch.companyStage}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium text-foreground">
              ${pitch.fundingGoal.toLocaleString()}
            </span>
            <span>funding goal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Submitted {submittedDate}</span>
          </div>
        </div>

        {/* Submitter Info */}
        <div className="mb-4 space-y-1 border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {pitch.user.name || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pitch.user.email}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="default"
            onClick={() => onReview(pitch)}
            disabled={
              pitch.status === 'approved' || pitch.status === 'rejected'
            }
          >
            Review
          </Button>
          <Button variant="outline" className="border-neutral-700" asChild>
            <Link href={routes.pitchDetails(pitch.id)}>
              Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
