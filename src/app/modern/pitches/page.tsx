'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import cn from '@/utils/cn';
import { usePitchesStore } from '@/lib/stores/pitches';
import { DataTable } from '@/components/ui/data-table';
import data from '@/data/pitches-data.json';

// Status configuration
const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: 'Pending Review',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
  'in-pool': {
    label: 'In Pool',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  'under-review': {
    label: 'Under Review',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  shortlisted: {
    label: 'Shortlisted',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  'conditional-approval': {
    label: 'Conditional Approval',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  'needs-more-info': {
    label: 'Needs More Info',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
};

export default function YourPitchesPage() {
  const { pitches, deletePitch } = usePitchesStore();
  const [showEmpty, setShowEmpty] = useState(false);
  const router = useRouter();

  const handleDelete = (pitchId: string) => {
    deletePitch(pitchId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayPitches = showEmpty ? [] : pitches;

  return (
    <div className="min-h-screen bg-light-dark p-6 dark:bg-dark">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">
              Your Pitches
            </h1>
            <p className="text-lg text-gray-400">
              Manage your funding proposals and track their status.
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/90"
            onClick={() => router.push('/pitches/submit-pitch')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add Pitch</span>
          </button>
        </div>

        {/* Demo Toggle Button */}
        <div className="mb-6">
          <button
            type="button"
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
            onClick={() => setShowEmpty(!showEmpty)}
          >
            {showEmpty ? 'Show Pitches' : 'Show Empty State'}
          </button>
        </div>

        {/* Empty State */}
        {displayPitches.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="w-full max-w-md rounded-lg bg-light-dark p-8 text-center dark:bg-[#0c0e12]">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="rounded-full bg-brand/10 p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-brand"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">
                    You haven't created any pitches yet.
                  </h2>
                  <p className="text-gray-400">
                    Start your fundraising journey by creating a compelling
                    pitch for our investors.
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-brand px-4 py-2 text-white transition-colors hover:bg-brand/90"
                  onClick={() => router.push('/pitches/submit-pitch')}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Add Pitch
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pitches Grid */}
        {displayPitches.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayPitches.map((pitch) => (
              // Using div with role="button" instead of <button> to avoid nested button hydration error
              <div
                key={pitch.id}
                role="button"
                tabIndex={0}
                className={cn(
                  'group relative rounded-lg bg-light-dark p-6 text-left transition-all hover:cursor-pointer hover:bg-light-dark/50 hover:shadow-lg dark:bg-[#0c0e12] dark:hover:bg-[#0c0e12]/50 w-full'
                )}
                onClick={() => router.push(`/pitches/${pitch.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/pitches/${pitch.id}`);
                  }
                }}
              >
                <div className="mb-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="pr-4 text-xl font-semibold leading-tight text-white">
                      {pitch.title}
                    </h3>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-1 text-xs',
                          statusConfig[pitch.status].color
                        )}
                      >
                        {statusConfig[pitch.status].label}
                      </span>
                      <div className="relative">
                        <button 
                          type="button" 
                          className="opacity-0 transition-opacity group-hover:opacity-100" 
                          aria-label="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add dropdown menu logic here
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mb-4 leading-relaxed text-gray-400">
                  {pitch.elevatorPitch}
                </p>

                <div className="space-y-3 border-t border-gray-700 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 flex-shrink-0 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-white">
                      <span className="font-medium">Funding Goal:</span>{' '}
                      {formatCurrency(pitch.fundingGoal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 flex-shrink-0 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-white">
                      <span className="font-medium">Submitted:</span>{' '}
                      {formatDate(pitch.dateSubmitted)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* <DataTable data={data} /> */}
      </div>
    </div>
  );
}
