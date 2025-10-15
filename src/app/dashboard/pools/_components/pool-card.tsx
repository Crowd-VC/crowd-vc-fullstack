'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/shadcn/avatar';
import { Clock, TrendingUp, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Pool } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PoolCardProps {
  pool: Pool;
  onContribute: (pool: Pool) => void;
  onVote: (pool: Pool) => void;
  onOpenDetail: (pool: Pool) => void;
}

export function PoolCard({
  pool,
  onContribute,
  onVote,
  onOpenDetail,
}: PoolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = (pool.current_size / pool.goal) * 100;
  const daysLeft = Math.ceil(
    (new Date(pool.deadline_utc).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24),
  );

  const riskColors = {
    low: 'bg-emerald-900 text-emerald-300 border-emerald-900',
    medium: 'bg-amber-900 text-amber-300 border-amber-900',
    high: 'bg-red-900 text-red-300 border-red-900',
  };

  const contributorAvatars = [
    { id: 1, name: 'Alice', avatar: '/placeholder.svg?height=32&width=32' },
    { id: 2, name: 'Bob', avatar: '/placeholder.svg?height=32&width=32' },
    { id: 3, name: 'Charlie', avatar: '/placeholder.svg?height=32&width=32' },
  ];
  const remainingContributors =
    pool.contributors_count - contributorAvatars.length;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onOpenDetail(pool);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${pool.title}`}
    >
      <Card className="duration-180 relative cursor-pointer overflow-visible border-border/50 bg-card transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/40">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'border text-xs font-medium',
                    riskColors[pool.metadata.risk_level],
                  )}
                >
                  {pool.metadata.risk_level.toUpperCase()} RISK
                </Badge>
                <Badge
                  variant="secondary"
                  className="border-neutral-800 bg-neutral-800 text-xs text-neutral-300"
                >
                  {pool.status.toUpperCase()}
                </Badge>
              </div>
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
                {pool.title}
              </h3>
              <p className="line-clamp-2 text-sm text-neutral-400">
                {pool.summary}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">
                ${(pool.current_size / 1000000).toFixed(2)}M
              </span>
              <span className="text-sm text-neutral-400">
                of ${(pool.goal / 1000000).toFixed(1)}M goal
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-neutral-800" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {contributorAvatars.map((contributor) => (
                  <Avatar
                    key={contributor.id}
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="h-6 w-6 border-2 border-card"
                  />
                ))}
              </div>
              <span>+{remainingContributors} contributors</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>

          {/* Manager */}
          <div className="mt-4 flex items-center gap-2 border-t border-neutral-800 pt-4">
            <Avatar className="h-6 w-6">
              <AvatarImage src={pool.manager.avatar || '/placeholder.svg'} />
              <AvatarFallback>{pool.manager.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-neutral-400">
              Managed by {pool.manager.name}
            </span>
            {pool.manager.verified && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </div>
        </div>
      </Card>

      {/* Hover Overlay - NO LAYOUT SHIFT */}
      <div
        className={cn(
          'duration-180 pointer-events-none absolute inset-0 transition-all',
          'ease-[cubic-bezier(0.2,0.9,0.2,1)]',
          isHovered ? 'z-10 scale-[1.02] opacity-100' : 'scale-100 opacity-0',
        )}
        style={{
          transformOrigin: 'center center',
        }}
      >
        <Card className="pointer-events-auto h-full border-primary/50 bg-card shadow-lg shadow-black/40">
          <div className="flex h-full flex-col p-6">
            {/* Compact Header */}
            <div className="mb-4">
              <h3 className="mb-1 line-clamp-1 text-lg font-semibold text-foreground">
                {pool.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'border text-xs font-medium',
                    riskColors[pool.metadata.risk_level],
                  )}
                >
                  {pool.metadata.risk_level.toUpperCase()}
                </Badge>
                <span className="text-xs text-neutral-400">
                  Min. ${(pool.min_ticket / 1000).toFixed(0)}K
                </span>
              </div>
            </div>

            <div className="mb-4 flex-1">
              <h4 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Top Startups
              </h4>
              <div className="space-y-2">
                {pool.allocation.slice(0, 3).map((item) => (
                  <div
                    key={item.startup_id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={item.logo || '/placeholder.svg'} />
                        <AvatarFallback className="text-xs">
                          {item.startup_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {item.startup_name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-500">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {pool.voting.length > 0 && (
              <div className="mb-4 border-t border-neutral-800 pb-4">
                <div className="flex items-center justify-between pt-4 text-sm">
                  <span className="text-neutral-400">Active Vote</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 border border-neutral-700 text-xs hover:bg-neutral-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVote(pool);
                    }}
                  >
                    Cast Vote
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onContribute(pool);
                }}
              >
                Contribute
              </Button>
              <Button
                variant="outline"
                className="border-neutral-700 bg-transparent hover:bg-neutral-800"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(pool);
                }}
              >
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
