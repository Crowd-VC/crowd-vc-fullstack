'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface FundingProgressProps {
  currentFunding: number;
  fundingGoal: number;
  contributorsCount: number;
  className?: string;
}

export function FundingProgress({
  currentFunding,
  fundingGoal,
  contributorsCount,
  className,
}: FundingProgressProps) {
  const percentage =
    fundingGoal > 0 ? Math.min(100, (currentFunding / fundingGoal) * 100) : 0;
  const averageContribution =
    contributorsCount > 0 ? currentFunding / contributorsCount : 0;
  const remaining = Math.max(0, fundingGoal - currentFunding);

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Funding Progress
          </h3>
          <div className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}% funded
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={percentage} className="h-3" />
        </div>

        {/* Funding Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              ${currentFunding.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              of ${fundingGoal.toLocaleString()} goal
            </div>
          </div>
          {remaining > 0 && (
            <div className="text-right">
              <div className="text-lg font-semibold text-muted-foreground">
                ${remaining.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">remaining</div>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {contributorsCount}
              </div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                ${averageContribution.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Avg. Amount</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function FundingProgressCompact({
  currentFunding,
  fundingGoal,
  className,
}: Omit<FundingProgressProps, 'contributorsCount'>) {
  const percentage =
    fundingGoal > 0 ? Math.min(100, (currentFunding / fundingGoal) * 100) : 0;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Funding</span>
        <span className="font-semibold text-foreground">
          ${currentFunding.toLocaleString()} / ${fundingGoal.toLocaleString()}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="mt-1 text-xs text-muted-foreground">
        {percentage.toFixed(1)}% funded
      </div>
    </div>
  );
}
