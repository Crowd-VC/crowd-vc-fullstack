'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/shadcn/button';
import { TrendingUp, Users, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import routes from '@/config/routes';

interface VoteProgressProps {
  pitchId: string;
  poolId: string;
  poolName: string;
  voteCount: number;
  totalPoolVotes: number;
  poolStatus: 'active' | 'closed' | 'upcoming';
}

export function VoteProgress({
  pitchId,
  poolId,
  poolName,
  voteCount,
  totalPoolVotes,
  poolStatus,
}: VoteProgressProps) {
  const votePercentage =
    totalPoolVotes > 0 ? (voteCount / totalPoolVotes) * 100 : 0;

  const statusConfig = {
    active: {
      color: 'bg-green-500/10 text-green-500',
      label: 'Active Pool',
    },
    closed: {
      color: 'bg-gray-500/10 text-gray-500',
      label: 'Pool Closed',
    },
    upcoming: {
      color: 'bg-blue-500/10 text-blue-500',
      label: 'Upcoming Pool',
    },
  };

  const config = statusConfig[poolStatus];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            Voting Status
          </h3>
          <p className="text-sm text-muted-foreground">{poolName}</p>
        </div>
        <Badge variant="outline" className={config.color}>
          {config.label}
        </Badge>
      </div>

      {/* Vote Stats */}
      <div className="mb-6 space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Votes Received</span>
            <span className="font-semibold text-foreground">
              {voteCount} of {totalPoolVotes}
            </span>
          </div>
          <Progress value={votePercentage} className="h-2" />
          <div className="mt-1 text-xs text-muted-foreground">
            {votePercentage.toFixed(1)}% of pool votes
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {voteCount}
              </div>
              <div className="text-xs text-muted-foreground">Votes</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                #{votePercentage > 0 ? '1-3' : 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Ranking</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button variant="outline" className="w-full" asChild>
        <Link href={`${routes.pools}/${poolId}`}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Pool
        </Link>
      </Button>
    </Card>
  );
}
