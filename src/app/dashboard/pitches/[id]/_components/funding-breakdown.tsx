'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Pitch } from '@/db/schema/pitches';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface FundingBreakdownProps {
  pitch: Pitch;
}

export function FundingBreakdown({ pitch }: FundingBreakdownProps) {
  const breakdown = [
    {
      id: 'product-dev',
      label: 'Product Development',
      value: pitch.productDevelopment,
      color: 'bg-blue-500',
    },
    {
      id: 'marketing-sales',
      label: 'Marketing & Sales',
      value: pitch.marketingSales,
      color: 'bg-green-500',
    },
    {
      id: 'team-expansion',
      label: 'Team Expansion',
      value: pitch.teamExpansion,
      color: 'bg-purple-500',
    },
    {
      id: 'operations',
      label: 'Operations',
      value: pitch.operations,
      color: 'bg-orange-500',
    },
  ].filter((item) => item.value);

  const totalPercentage = breakdown.reduce((sum, item) => {
    const value = Number.parseFloat(item.value || '0');
    return sum + value;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Funding Goal */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Funding Goal</p>
            <p className="text-2xl font-bold text-foreground">
              ${pitch.fundingGoal.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Fund Allocation
          </h3>
          <div className="space-y-4">
            {breakdown.map((item) => {
              const percentage = Number.parseFloat(item.value || '0');
              return (
                <div key={item.id}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">
                      {percentage}%
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={item.color}
                  />
                </div>
              );
            })}

            {totalPercentage !== 100 && (
              <p className="text-xs text-muted-foreground">
                Total allocation: {totalPercentage}%
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pitch.expectedROI && (
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Expected ROI</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {pitch.expectedROI}
            </p>
          </Card>
        )}

        {pitch.timeToRaise && (
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Time to Raise</p>
            </div>
            <p className="text-xl font-semibold text-foreground">
              {pitch.timeToRaise} days
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
