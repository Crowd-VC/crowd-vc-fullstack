// @ts-nocheck
'use client';

import { useState, useMemo } from 'react';
import {
  usePoolStartups,
  useAssignStartup,
  useRemoveStartup,
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
import { Search, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const { data: poolStartups = [], isLoading: loadingPoolStartups } =
    usePoolStartups(poolId);
  const { data: allPitches = [], isLoading: loadingPitches } =
    useAdminPitches();
  const assignStartup = useAssignStartup();
  const removeStartup = useRemoveStartup();

  const [searchQuery, setSearchQuery] = useState('');

  // Get approved pitches that are not in any pool or are in this pool
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

  const handleAssign = async (pitchId: string) => {
    try {
      await assignStartup.mutateAsync({ poolId, pitchId });
      toast.success('Startup assigned to pool');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to assign startup',
      );
    }
  };

  const handleRemove = async (pitchId: string) => {
    try {
      await removeStartup.mutateAsync({ poolId, pitchId });
      toast.success('Startup removed from pool');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove startup',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Pool Startups</DialogTitle>
          <DialogDescription>
            Assign approved startups to this investment pool
          </DialogDescription>
        </DialogHeader>

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
              {loadingPoolStartups ? (
                <div className="flex items-center justify-center py-8">
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
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline">{ps.pitch.industry}</Badge>
                          <Badge variant="outline">
                            ${(ps.pitch.fundingGoal / 1000).toFixed(0)}k
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(ps.pitch.id)}
                        disabled={removeStartup.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loadingPitches ? (
                <div className="flex items-center justify-center py-8">
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
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline">{pitch.industry}</Badge>
                          <Badge variant="outline">
                            ${(pitch.fundingGoal / 1000).toFixed(0)}k
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssign(pitch.id)}
                        disabled={assignStartup.isPending}
                      >
                        <Plus className="mr-1 h-4 w-4" />
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
