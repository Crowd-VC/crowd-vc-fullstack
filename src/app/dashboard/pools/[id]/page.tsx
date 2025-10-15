'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { usePoolDetails, useCastVote } from '@/hooks/use-investor-pools';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, TrendingUp, CheckCircle2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

const queryClient = new QueryClient();

function PoolDetailsContent() {
  const params = useParams();
  const poolId = params.id as string;

  // TODO: Get actual user ID from auth context
  const userId = 'user_2'; // Placeholder for investor user

  const { data, isLoading } = usePoolDetails(poolId, userId);
  const castVote = useCastVote();

  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    null,
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Loading pool details...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Pool not found</p>
      </div>
    );
  }

  const { pool, startups, userVoted, userVote } = data;
  const totalVotes = startups.reduce(
    (sum, startup) => sum + startup.voteCount,
    0,
  );
  const canVote = pool.status === 'active' && !userVoted;

  const handleVoteClick = (pitchId: string) => {
    setSelectedStartupId(pitchId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedStartupId) return;

    try {
      await castVote.mutateAsync({
        poolId,
        pitchId: selectedStartupId,
        userId,
      });

      toast.success('Vote cast successfully!', {
        description: 'Thank you for participating in this investment pool.',
      });

      setConfirmDialogOpen(false);
      setSelectedStartupId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to cast vote',
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/pools" className="mb-6 inline-flex items-center text-sm">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Pools
      </Link>

      {/* Pool Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {pool.name}
            </h1>
            <Badge variant="outline" className="mb-2">
              {pool.category}
            </Badge>
          </div>
          <Badge className={getStatusColor(pool.status)}>{pool.status}</Badge>
        </div>

        <p className="mb-4 text-muted-foreground">{pool.description}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Ends: {format(new Date(pool.votingDeadline), 'PPPp')}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>{totalVotes} total votes</span>
          </div>
          {userVoted && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>You have voted</span>
            </div>
          )}
        </div>
      </div>

      {/* Voting Status */}
      {!canVote && (
        <div className="mb-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            {userVoted
              ? 'You have already cast your vote in this pool. Thank you for participating!'
              : pool.status === 'closed'
                ? 'Voting has closed for this pool.'
                : 'Voting is not open yet for this pool.'}
          </p>
        </div>
      )}

      {/* Startups List */}
      <div className="mb-4">
        <h2 className="mb-4 text-2xl font-bold">
          Competing Startups ({startups.length})
        </h2>
        {canVote && (
          <p className="mb-4 text-sm text-muted-foreground">
            Select a startup to cast your vote
          </p>
        )}
      </div>

      {startups.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            No startups assigned to this pool yet
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {startups.map((startup) => {
            const votePercentage =
              totalVotes > 0 ? (startup.voteCount / totalVotes) * 100 : 0;
            const isUserVote = userVote?.pitchId === startup.pitch.id;

            return (
              <Card
                key={startup.pitch.id}
                className={`max-w-md p-6 ${isUserVote ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">
                      {startup.pitch.title}
                    </h3>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="outline">{startup.pitch.industry}</Badge>
                      <Badge variant="outline">
                        ${(startup.pitch.fundingGoal / 1000).toFixed(0)}k goal
                      </Badge>
                      <Badge variant="outline">
                        {startup.pitch.companyStage}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {startup.pitch.elevatorPitch}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {startup.pitch.summary}
                    </p>
                  </div>
                </div>

                {/* Vote Progress */}
                {pool.status === 'closed' && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {startup.voteCount} votes
                      </span>
                      <span className="font-medium">
                        {votePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={votePercentage} />
                  </div>
                )}

                {/* Vote Button */}
                {canVote && (
                  <Button
                    onClick={() => handleVoteClick(startup.pitch.id)}
                    className="w-full"
                  >
                    Vote for this Startup
                  </Button>
                )}

                {isUserVote && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Your vote</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to vote for this startup? You can only vote
              once per pool and this action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVote}
              disabled={castVote.isPending}
            >
              {castVote.isPending ? 'Casting Vote...' : 'Confirm Vote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function PoolDetailsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PoolDetailsContent />
    </QueryClientProvider>
  );
}
