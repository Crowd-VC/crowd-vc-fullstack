'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminPools, useUpdatePoolStatus } from '@/hooks/use-admin-pools';
import { CreatePoolModal } from './_components/create-pool-modal';
import { PoolCard } from './_components/pool-card';
import { AssignStartupsModal } from './_components/assign-startups-modal';
import { Button } from '@/components/ui/shadcn/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const queryClient = new QueryClient();

function AdminPoolsContent() {
  const { data: pools = [], isLoading } = useAdminPools();
  const updatePoolStatus = useUpdatePoolStatus();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  const handleStatusChange = async (
    poolId: string,
    status: 'active' | 'closed' | 'upcoming',
  ) => {
    try {
      await updatePoolStatus.mutateAsync({ poolId, status });
      toast.success('Pool status updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update pool status',
      );
    }
  };

  const handleAssignStartups = (poolId: string) => {
    setSelectedPoolId(poolId);
    setAssignModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Investment Pools
          </h1>
          <p className="text-muted-foreground">
            Create and manage investment pools for startups
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Pool
        </Button>
      </div>

      {/* Pools Grid */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading pools...</div>
        </div>
      ) : pools.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <p className="mb-4 text-lg text-muted-foreground">
            No pools created yet
          </p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Pool
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              onStatusChange={handleStatusChange}
              onAssignStartups={handleAssignStartups}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreatePoolModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      {selectedPoolId && (
        <AssignStartupsModal
          poolId={selectedPoolId}
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
        />
      )}
    </div>
  );
}

export default function AdminPoolsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminPoolsContent />
    </QueryClientProvider>
  );
}
