'use client';

import { PitchReviewCard } from './pitch-review-card';
import type { PitchWithUser } from '@/db/types';

interface PitchReviewListProps {
  pitches: PitchWithUser[];
  onReview: (pitch: PitchWithUser) => void;
  onViewDetails: (pitch: PitchWithUser) => void;
  isLoading?: boolean;
}

export function PitchReviewList({
  pitches,
  onReview,
  onViewDetails,
  isLoading,
}: PitchReviewListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-sm text-muted-foreground">Loading pitches...</p>
        </div>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-label="No pitches found"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="mb-2 text-lg text-foreground">No pitches found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {pitches.map((pitch) => (
        <PitchReviewCard
          key={pitch.id}
          pitch={pitch}
          onReview={onReview}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
