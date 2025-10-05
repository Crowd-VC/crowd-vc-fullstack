'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, HelpCircle } from 'lucide-react';
import { PoolList } from './_components/pool-list';
import { PoolsToolbar } from './_components/pools-toolbar';
import { FiltersPanel } from './_components/filters-panel';
import { ContributeModal } from './_components/contribute-modal';
import { VoteModal } from './_components/vote-modal';
import { PoolDetailDrawer } from './_components/pool-detail-drawer';
import { usePools, useContribute, useVote } from '@/hooks/use-pools';
import { useWallet } from '@/hooks/use-wallet';
import type { Pool } from '@/lib/types';

const queryClient = new QueryClient();

function PoolsPageContent() {
  const { data: pools = [], isLoading } = usePools();
  const { wallet } = useWallet();
  const contributeMutation = useContribute();
  const voteMutation = useVote();

  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const platformStats = {
    activePools: pools.filter((p) => p.status === 'active').length,
    totalRaised: pools.reduce((sum, p) => sum + p.current_size, 0),
    totalContributors: pools.reduce((sum, p) => sum + p.contributors_count, 0),
  };

  const handleContribute = (pool: Pool) => {
    setSelectedPool(pool);
    setContributeModalOpen(true);
  };

  const handleVote = (pool: Pool) => {
    setSelectedPool(pool);
    setVoteModalOpen(true);
  };

  const handleOpenDetail = (pool: Pool) => {
    setSelectedPool(pool);
    setDetailDrawerOpen(true);
  };

  const handleConfirmContribution = async (amount: number) => {
    if (!selectedPool) return;
    await contributeMutation.mutateAsync({
      pool_id: selectedPool.id,
      amount,
      wallet_address: wallet.address || '',
    });
  };

  const handleConfirmVote = async (proposalId: string, choice: string) => {
    if (!selectedPool) return;
    await voteMutation.mutateAsync({
      pool_id: selectedPool.id,
      proposal_id: proposalId,
      choice,
    });
  };

  return (
    <>
      <div>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Investment Pools
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Discover and invest in curated startup portfolios
              </p>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{platformStats.activePools} Active Pools</span>
                <span>•</span>
                <span>
                  ${(platformStats.totalRaised / 1000000).toFixed(1)}M Raised
                </span>
                <span>•</span>
                <span>
                  {platformStats.totalContributors.toLocaleString()}{' '}
                  Contributors
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Badge variant="outline" className="gap-2 px-3 py-2">
                <Wallet className="h-4 w-4" />
                <span className="font-mono">{wallet.address}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold">
                  ${wallet.balance.toLocaleString()}
                </span>
              </Badge>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Pool
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <PoolsToolbar
          onSearchChange={(search) => console.log('[v0] Search:', search)}
          onTabChange={(tab) => console.log('[v0] Tab:', tab)}
          onSortChange={(sort) => console.log('[v0] Sort:', sort)}
          onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        />

        <div className="mt-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading pools...
                </p>
              </div>
            </div>
          ) : (
            <PoolList
              pools={pools}
              onContribute={handleContribute}
              onVote={handleVote}
              onOpenDetail={handleOpenDetail}
            />
          )}
        </div>
      </main>

      {/* Modals and Drawers */}
      <FiltersPanel open={filtersOpen} onClose={() => setFiltersOpen(false)} />

      <ContributeModal
        pool={selectedPool}
        open={contributeModalOpen}
        onOpenChange={setContributeModalOpen}
        onConfirm={handleConfirmContribution}
        walletBalance={wallet.balance as number}
      />

      <VoteModal
        pool={selectedPool}
        open={voteModalOpen}
        onOpenChange={setVoteModalOpen}
        onConfirm={handleConfirmVote}
      />

      <PoolDetailDrawer
        pool={selectedPool}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onContribute={handleContribute}
        onVote={handleVote}
      />

      {/* Overlay for filters */}
      {filtersOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </>
  );
}

export default function PoolsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PoolsPageContent />
    </QueryClientProvider>
  );
}
