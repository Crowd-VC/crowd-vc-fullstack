'use client';

import { useState, useMemo } from 'react';
import {
  usePoolStartups,
  useAssignStartup,
  useRemoveStartup,
  usePool,
} from '@/hooks/use-admin-pools';
import { useAdminPitches } from '@/hooks/use-admin-pitches';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAddStartupToPool,
  useRemoveStartupFromPool,
  usePoolCandidatePitches,
} from '@/lib/web3/hooks';
import { getPitchIdAsBytes32 } from '@/lib/web3/utils/pitchId';
import { useQueryClient } from '@tanstack/react-query';
import type { Pitch } from '@/db/types';

interface PoolStartup {
  pitch: Pitch;
  user: {
    id: string;
    email: string;
    name: string | null;
    walletAddress: string | null;
  };
  assignedAt: Date;
}

interface AssignStartupsModalProps {
  poolId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignStartupsModal({
  poolId,
  open,
  onOpenChange,
}: AssignStartupsModalProps) {
  const queryClient = useQueryClient();

  // Database hooks
  const { data: pool, isLoading: loadingPool } = usePool(poolId);
  const { data: rawPoolStartups = [], isLoading: loadingPoolStartups } =
    usePoolStartups(poolId);
  const poolStartups = rawPoolStartups as PoolStartup[];
  const { data: allPitches = [], isLoading: loadingPitches } =
    useAdminPitches();
  const assignStartupDb = useAssignStartup();
  const removeStartupDb = useRemoveStartup();

  // On-chain hooks
  const poolAddress = pool?.contractAddress as `0x${string}` | undefined;
  const {
    pitchIds: onChainPitchIds,
    isLoading: loadingOnChainPitches,
    refetch: refetchOnChainPitches,
  } = usePoolCandidatePitches(poolAddress);

  const {
    addStartupToPool,
    isLoading: isAddingOnChain,
    error: addOnChainError,
  } = useAddStartupToPool();

  const {
    removeStartupFromPool,
    isLoading: isRemovingOnChain,
    error: removeOnChainError,
  } = useRemoveStartupFromPool();

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingPitchId, setPendingPitchId] = useState<string | null>(null);

  // Get approved pitches that are not in any pool
  const availableStartups = useMemo(() => {
    const assignedPitchIds = new Set(poolStartups.map((ps) => ps.pitch.id));

    return allPitches.filter(
      (pitch) => pitch.status === 'approved' && !assignedPitchIds.has(pitch.id),
    );
  }, [allPitches, poolStartups]);

  // Filter startups based on search
  const filteredAvailable = useMemo(() => {
    if (!searchQuery) return availableStartups;

    const query = searchQuery.toLowerCase();
    return availableStartups.filter(
      (pitch) =>
        pitch.title.toLowerCase().includes(query) ||
        pitch.industry.toLowerCase().includes(query) ||
        pitch.summary.toLowerCase().includes(query),
    );
  }, [availableStartups, searchQuery]);

  const filteredAssigned = useMemo(() => {
    if (!searchQuery) return poolStartups;

    const query = searchQuery.toLowerCase();
    return poolStartups.filter(
      (ps) =>
        ps.pitch.title.toLowerCase().includes(query) ||
        ps.pitch.industry.toLowerCase().includes(query) ||
        ps.pitch.summary.toLowerCase().includes(query),
    );
  }, [poolStartups, searchQuery]);

  const handleAssign = async (pitchId: string, walletAddress: string) => {
    if (!poolAddress) {
      toast.error('Pool contract address not found');
      return;
    }

    setPendingPitchId(pitchId);

    try {
      // Convert pitch ID to bytes32 for on-chain
      const pitchIdBytes32 = getPitchIdAsBytes32(pitchId);

      // First, assign on-chain
      await addStartupToPool({
        poolAddress,
        pitchId: pitchIdBytes32,
        startupWallet: walletAddress as `0x${string}`,
      });

      // Then, update database
      await assignStartupDb.mutateAsync({ poolId, pitchId });

      // Refetch on-chain pitches
      refetchOnChainPitches();

      toast.success('Startup assigned to pool on-chain and in database');
    } catch (error) {
      console.error('Error assigning startup:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to assign startup',
      );
    } finally {
      setPendingPitchId(null);
    }
  };

  const handleRemove = async (pitchId: string) => {
    if (!poolAddress) {
      toast.error('Pool contract address not found');
      return;
    }

    setPendingPitchId(pitchId);

    try {
      // Convert pitch ID to bytes32 for on-chain
      const pitchIdBytes32 = getPitchIdAsBytes32(pitchId);

      // First, remove on-chain
      await removeStartupFromPool({
        poolAddress,
        pitchId: pitchIdBytes32,
      });

      // Then, update database
      await removeStartupDb.mutateAsync({ poolId, pitchId });

      // Refetch on-chain pitches
      refetchOnChainPitches();

      toast.success('Startup removed from pool on-chain and in database');
    } catch (error) {
      console.error('Error removing startup:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove startup',
      );
    } finally {
      setPendingPitchId(null);
    }
  };

  const isLoading = loadingPoolStartups || loadingPitches || loadingPool;
  const hasContractAddress = !!poolAddress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Pool Startups</DialogTitle>
          <DialogDescription>
            Assign approved startups to this investment pool (on-chain)
          </DialogDescription>
        </DialogHeader>

        {!hasContractAddress && !loadingPool && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <span>
              This pool has no contract address. On-chain operations disabled.
            </span>
          </div>
        )}

        {hasContractAddress && (
          <div className="mb-4 text-xs text-muted-foreground">
            On-chain pitches: {loadingOnChainPitches ? 'Loading...' : onChainPitchIds.length}
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="assigned" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned">
              Assigned ({poolStartups.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableStartups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : filteredAssigned.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No startups match your search'
                      : 'No startups assigned yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssigned.map((ps) => (
                    <div
                      key={ps.pitch.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{ps.pitch.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {ps.pitch.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{ps.pitch.industry}</Badge>
                          <Badge variant="outline">
                            ${(ps.pitch.fundingGoal / 1000).toFixed(0)}k
                          </Badge>
                          {ps.user?.walletAddress && (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {ps.user.walletAddress.slice(0, 6)}...
                              {ps.user.walletAddress.slice(-4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(ps.pitch.id)}
                        disabled={
                          !hasContractAddress ||
                          isRemovingOnChain ||
                          pendingPitchId === ps.pitch.id
                        }
                      >
                        {pendingPitchId === ps.pitch.id && isRemovingOnChain ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No startups match your search'
                      : 'No approved startups available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailable.map((pitch) => (
                    <div
                      key={pitch.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{pitch.title}</h4>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {pitch.summary}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{pitch.industry}</Badge>
                          <Badge variant="outline">
                            ${(pitch.fundingGoal / 1000).toFixed(0)}k
                          </Badge>
                          {pitch.user?.walletAddress && (
                            <Badge variant="secondary" className="font-mono text-xs">
                              {pitch.user.walletAddress.slice(0, 6)}...
                              {pitch.user.walletAddress.slice(-4)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAssign(
                            pitch.id,
                            pitch.user?.walletAddress || '',
                          )
                        }
                        disabled={
                          !hasContractAddress ||
                          !pitch.user?.walletAddress ||
                          isAddingOnChain ||
                          pendingPitchId === pitch.id
                        }
                      >
                        {pendingPitchId === pitch.id && isAddingOnChain ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-1 h-4 w-4" />
                        )}
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
