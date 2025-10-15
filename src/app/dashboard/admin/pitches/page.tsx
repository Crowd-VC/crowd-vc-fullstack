'use client';

import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminStatsCards } from './_components/admin-stats-cards';
import { AdminToolbar } from './_components/admin-toolbar';
import { PitchReviewList } from './_components/pitch-review-list';
import { ReviewActionModal } from './_components/review-action-modal';
import { PitchDetailDrawer } from './_components/pitch-detail-drawer';
import {
  useAdminPitches,
  useUpdatePitchStatus,
} from '@/hooks/use-admin-pitches';
import type { PitchWithUser } from '@/db/types';
import { toast } from 'sonner';

const queryClient = new QueryClient();

function AdminDashboardContent() {
  const { data: allPitches = [], isLoading } = useAdminPitches();
  const updatePitchStatus = useUpdatePitchStatus();

  const [selectedPitch, setSelectedPitch] = useState<PitchWithUser | null>(
    null,
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortOrder, setSortOrder] = useState('newest');

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: allPitches.length,
      pending: allPitches.filter((p) => p.status === 'pending').length,
      approved: allPitches.filter((p) => p.status === 'approved').length,
      rejected: allPitches.filter((p) => p.status === 'rejected').length,
    };
  }, [allPitches]);

  // Filter and sort pitches
  const filteredPitches = useMemo(() => {
    let filtered = allPitches;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pitch) =>
          pitch.title.toLowerCase().includes(query) ||
          pitch.summary.toLowerCase().includes(query) ||
          pitch.industry.toLowerCase().includes(query) ||
          pitch.submissionId?.toLowerCase().includes(query) ||
          pitch.user.email.toLowerCase().includes(query) ||
          pitch.user.name?.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((pitch) => pitch.status === statusFilter);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortOrder) {
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.dateSubmitted).getTime() -
            new Date(a.dateSubmitted).getTime(),
        );
        break;
      case 'oldest':
        sorted.sort(
          (a, b) =>
            new Date(a.dateSubmitted).getTime() -
            new Date(b.dateSubmitted).getTime(),
        );
        break;
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'funding-high':
        sorted.sort((a, b) => b.fundingGoal - a.fundingGoal);
        break;
      case 'funding-low':
        sorted.sort((a, b) => a.fundingGoal - b.fundingGoal);
        break;
    }

    return sorted;
  }, [allPitches, searchQuery, statusFilter, sortOrder]);

  // Handlers
  const handleReview = (pitch: PitchWithUser) => {
    setSelectedPitch(pitch);
    setReviewModalOpen(true);
  };

  const handleViewDetails = (pitch: PitchWithUser) => {
    setSelectedPitch(pitch);
    setDetailDrawerOpen(true);
  };

  const handleApproveFromDrawer = (pitch: PitchWithUser) => {
    setDetailDrawerOpen(false);
    setSelectedPitch(pitch);
    setReviewModalOpen(true);
  };

  const handleRejectFromDrawer = (pitch: PitchWithUser) => {
    setDetailDrawerOpen(false);
    setSelectedPitch(pitch);
    setReviewModalOpen(true);
  };

  const handleConfirmAction = async (
    action: 'approved' | 'rejected',
    reason?: string,
    customNotes?: string,
  ) => {
    if (!selectedPitch) return;

    try {
      // TODO: Get actual admin ID from auth context
      const adminId = 'user_1';

      await updatePitchStatus.mutateAsync({
        pitchId: selectedPitch.id,
        status: action,
        reason,
        customNotes,
        adminId,
      });

      toast.success(`Pitch ${action}`, {
        description: `The pitch has been ${action} and the startup has been notified.`,
      });

      setReviewModalOpen(false);
      setSelectedPitch(null);
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update pitch status',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Review and manage pitch submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <AdminStatsCards stats={stats} />
      </div>

      {/* Toolbar */}
      <div className="mb-6">
        <AdminToolbar
          onSearchChange={setSearchQuery}
          onStatusFilter={setStatusFilter}
          onSortChange={setSortOrder}
          stats={stats}
        />
      </div>

      {/* Pitch List */}
      <PitchReviewList
        pitches={filteredPitches}
        onReview={handleReview}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Modals and Drawers */}
      <ReviewActionModal
        pitch={selectedPitch}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onConfirm={handleConfirmAction}
        isLoading={updatePitchStatus.isPending}
      />

      <PitchDetailDrawer
        pitch={selectedPitch}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onApprove={handleApproveFromDrawer}
        onReject={handleRejectFromDrawer}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboardContent />
    </QueryClientProvider>
  );
}
