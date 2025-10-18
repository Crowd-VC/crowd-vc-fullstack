'use client';

import type { Pitch } from '@/db/schema/pitches';
import type { PitchWithUser } from '@/db/types';
import { PitchDetailHeader } from './pitch-detail-header';
import { PitchInfoSidebar } from './pitch-info-sidebar';
import { PitchTabs } from './pitch-tabs';
import { useAccount } from 'wagmi';

interface PitchDetailViewProps {
  pitch: Pitch | PitchWithUser;
}

// Helper functions
function calculateFundingPercentage(
  fundingGoal: number,
  currentFunding = 0,
): number {
  if (fundingGoal === 0) return 0;
  return Math.min(100, Math.round((currentFunding / fundingGoal) * 100));
}

function calculateDaysLeft(
  dateSubmitted: Date,
  timeToRaise?: string | null,
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

export function PitchDetailView({ pitch }: PitchDetailViewProps) {
  // Calculate metrics
  const fundingPercentage = calculateFundingPercentage(pitch.fundingGoal, 0);
  const daysLeft = calculateDaysLeft(pitch.dateSubmitted, pitch.timeToRaise);
  const { address } = useAccount();

  // const userRole =
  //   address?.toLowerCase() ===
  //   '0xE26A74CD983D675032E098c1e8EC39175C96eEDA'.toLowerCase()
  //     ? 'owner'
  //     : 'investor';

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <PitchDetailHeader
          pitch={pitch}
          fundingPercentage={fundingPercentage}
        />

        {/* Main Content */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Left Column - Tabs */}
          <div className="flex-1 lg:w-2/3">
            <PitchTabs pitch={pitch} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-1/3">
            <div className="lg:sticky lg:top-6">
              <PitchInfoSidebar
                pitch={pitch}
                fundingPercentage={fundingPercentage}
                daysLeft={daysLeft}
                // userRole={userRole}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
