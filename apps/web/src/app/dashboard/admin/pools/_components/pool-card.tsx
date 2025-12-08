'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Loader2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { PoolStatus } from '@crowd-vc/abis';
import { usePoolInfo, useEndVoting } from '@/lib/web3/hooks';
import { toast } from 'sonner';

interface Pool {
  id: string;
  name: string;
  description: string;
  category: string;
  votingDeadline: Date;
  status: 'active' | 'closed' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
  contractAddress?: string | null;
}

interface PoolCardProps {
  pool: Pool;
  onStatusChange: (
    poolId: string,
    status: 'active' | 'closed' | 'upcoming',
  ) => void;
  onAssignStartups: (poolId: string) => void;
}

const onChainStatusColors: Record<PoolStatus, string> = {
  [PoolStatus.Active]: 'bg-green-500/10 text-green-500',
  [PoolStatus.VotingEnded]: 'bg-yellow-500/10 text-yellow-500',
  [PoolStatus.Funded]: 'bg-purple-500/10 text-purple-500',
  [PoolStatus.Closed]: 'bg-gray-500/10 text-gray-500',
  [PoolStatus.Failed]: 'bg-red-500/10 text-red-500',
};

const onChainStatusLabels: Record<PoolStatus, string> = {
  [PoolStatus.Active]: 'Active',
  [PoolStatus.VotingEnded]: 'Voting Ended',
  [PoolStatus.Funded]: 'Funded',
  [PoolStatus.Closed]: 'Closed',
  [PoolStatus.Failed]: 'Failed',
};

export function PoolCard({
  pool,
  onStatusChange,
  onAssignStartups,
}: PoolCardProps) {
  const poolAddress = pool.contractAddress as `0x${string}` | undefined;

  // Fetch on-chain pool info
  const {
    poolInfo,
    isLoading: isLoadingPoolInfo,
    refetch: refetchPoolInfo,
  } = usePoolInfo(poolAddress);

  // On-chain actions
  const { endVoting, isLoading: isEndingVoting } = useEndVoting();

  const handleEndVoting = async () => {
    if (!poolAddress) return;

    try {
      await endVoting(poolAddress);
      toast.success('Voting ended successfully');
      refetchPoolInfo();
      // Update database status as well
      onStatusChange(pool.id, 'closed');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to end voting',
      );
    }
  };

  const isOnChainActive = poolInfo?.status === PoolStatus.Active;
  const canEndVoting =
    isOnChainActive && new Date() >= new Date(pool.votingDeadline);

  return (
    <Card className="flex h-full flex-col p-6">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-xl font-semibold">{pool.name}</h3>
            <Badge variant="outline" className="mb-2">
              {pool.category}
            </Badge>
          </div>
          <div className="flex flex-col items-end gap-1">
            {poolInfo ? (
              <Badge className={onChainStatusColors[poolInfo.status]}>
                On-chain: {onChainStatusLabels[poolInfo.status]}
              </Badge>
            ) : isLoadingPoolInfo ? (
              <Badge variant="secondary" className="animate-pulse">
                Loading...
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-muted-foreground">
                No contract
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {pool.description}
        </p>

        <div className="mb-4 space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Voting ends: {format(new Date(pool.votingDeadline), 'PPP')}
            </span>
          </div>
          {poolInfo && (
            <div className="text-muted-foreground">
              <span className="text-xs">
                Contributions: $
                {(
                  Number(poolInfo.totalContributions) / 1_000_000
                ).toLocaleString()}{' '}
                / ${(Number(poolInfo.fundingGoal) / 1_000_000).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* End Voting button - only show when voting deadline has passed */}
        {canEndVoting && (
          <div className="mb-4">
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleEndVoting}
              disabled={isEndingVoting}
            >
              {isEndingVoting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending Voting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  End Voting
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto p-0 pt-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onAssignStartups(pool.id)}
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Startups
        </Button>
      </CardFooter>
    </Card>
  );
}
