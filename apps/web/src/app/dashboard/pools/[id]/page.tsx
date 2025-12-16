'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  usePoolDetails,
  useUserContributions,
} from '@/hooks/use-investor-pools';
import { useContribute, useVote } from '@/lib/web3/hooks/pool';
import { useWallet } from '@/hooks/use-wallet';
import { useAppKit } from '@reown/appkit/react';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ContributionPanel } from './_components/contribution-panel';
import { ContributionHistory } from './_components/contribution-history';
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
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  ArrowLeft,
  Wallet,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const queryClient = new QueryClient();

interface StartupWithVotes {
  pitch: {
    id: string;
    title: string;
    industry: string;
    fundingGoal: number;
    companyStage: string;
    elevatorPitch: string;
    summary: string;
  };
  voteCount: number;
}

function PoolDetailsContent() {
  const params = useParams();
  const poolId = params.id as string;
  const { wallet } = useWallet();
  const { open: openWalletModal } = useAppKit();

  // TODO: Get actual user ID from auth context
  const userId = wallet.address;

  const { data, isLoading } = usePoolDetails(poolId, userId);

  // Get contract address from pool data (not the database ID!)
  const poolContractAddress = data?.pool?.contractAddress as `0x${string}` | undefined;

  const castVote = useVote(poolContractAddress as `0x${string}`, () => {
    queryClient.invalidateQueries({ queryKey: ['pools'] });
    setConfirmDialogOpen(false);
    setSelectedStartupId(null);
  });

  const contribute = useContribute(poolContractAddress as `0x${string}`, () => {
    queryClient.invalidateQueries({ queryKey: ['pools'] });
    queryClient.invalidateQueries({ queryKey: ['user-contributions'] });
  });

  const { data: userContributions = [] } = useUserContributions(poolId, userId);

  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    null,
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleConnectWallet = () => {
    openWalletModal();
  };

  // Updated to accept bigint amount and token address from ContributionPanel
  const handleContribute = async (amount: bigint, token: `0x${string}`) => {
    try {
      await contribute.contribute({ amount, token });
    } catch (error) {
      // Error handling is now done by the hook with better UX
      console.error('Contribution error:', error);
    }
  };

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
  const totalVotes = (startups as StartupWithVotes[]).reduce(
    (sum: number, startup: StartupWithVotes) => sum + startup.voteCount,
    0,
  );

  // Only show voted status if wallet is connected AND has voted
  const hasVoted = wallet.isConnected && userVoted;
  const canVote = pool.status === 'active' && wallet.isConnected && !userVoted;

  const handleVoteClick = (pitchId: string) => {
    setSelectedStartupId(pitchId);
    setConfirmDialogOpen(true);
  };

  // Updated: vote hook now handles bytes32 conversion and error display internally
  const handleConfirmVote = async () => {
    if (!selectedStartupId || !wallet.address) return;
    // The hook now handles pool address validation internally

    try {
      await castVote.vote(selectedStartupId);
    } catch (error) {
      // Error handling is now done by the hook with better UX
      console.error('Vote error:', error);
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
      <Link
        href="/dashboard/pools"
        className="mb-6 inline-flex items-center text-sm"
      >
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
          {wallet.isConnected && (
            <div className="flex items-center text-blue-500">
              <Wallet className="mr-2 h-4 w-4" />
              <span>
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </span>
            </div>
          )}
          {hasVoted && (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>You have voted</span>
            </div>
          )}
        </div>
      </div>

      {/* Voting Status */}
      {!canVote && wallet.isConnected && (
        <div className="mb-6 rounded-lg border bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            {hasVoted
              ? 'You have already cast your vote in this pool. Thank you for participating!'
              : pool.status === 'closed'
                ? 'Voting has closed for this pool.'
                : 'Voting is not open yet for this pool.'}
          </p>
        </div>
      )}

      {!wallet.isConnected && (
        <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-500">
            Connect your wallet to vote for startups in this pool
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {/* Left side - Contribution Panel */}
        <div className="lg:col-span-1">
          <ContributionPanel
            pool={{
              ...pool,
              fundingGoal: pool.fundingGoal || 1000000,
              currentFunding: pool.currentFunding || 0,
              minContribution: pool.minContribution || 1000,
              maxContribution: pool.maxContribution,
            }}
            walletAddress={wallet.address}
            isWalletConnected={wallet.isConnected}
            onContribute={handleContribute}
            onConnectWallet={handleConnectWallet}
          />

          {/* Contribution History */}
          {wallet.isConnected && userContributions.length > 0 && (
            <div className="mt-6">
              <ContributionHistory contributions={userContributions} />
            </div>
          )}
        </div>

        {/* Right side - Startups List */}
        <div className="lg:col-span-2">
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
              {(startups as StartupWithVotes[]).map(
                (startup: StartupWithVotes) => {
                  const votePercentage =
                    totalVotes > 0 ? (startup.voteCount / totalVotes) * 100 : 0;
                  const isUserVote = userVote?.pitchId === startup.pitch.id;

                  return (
                    <Card
                      key={startup.pitch.id}
                      className={`p-6 ${isUserVote ? 'border-green-500 ring-2 ring-green-500/20' : ''}`}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold">
                            {startup.pitch.title}
                          </h3>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <Badge variant="outline">
                              {startup.pitch.industry}
                            </Badge>
                            <Badge variant="outline">
                              ${(startup.pitch.fundingGoal / 1000).toFixed(0)}k
                              goal
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
                      {canVote &&
                        (wallet.isConnected ? (
                          <Button
                            onClick={() => handleVoteClick(startup.pitch.id)}
                            className="w-full"
                            disabled={
                              startup.pitch.title ===
                              'AI-Powered Supply Chain Optimizer'
                            }
                          >
                            Vote for this Startup
                          </Button>
                        ) : (
                          <Button
                            onClick={handleConnectWallet}
                            variant="outline"
                            className="w-full"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            Connect Wallet to Vote
                          </Button>
                        ))}

                      {isUserVote && (
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Your vote</span>
                        </div>
                      )}
                    </Card>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

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
