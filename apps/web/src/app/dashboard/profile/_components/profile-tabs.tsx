'use client';

import { Suspense } from 'react';
import cn from '@/utils/cn';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import type { Pitch } from '@/db/schema/pitches';
import Loader from '@/components/ui/loader';
import { PitchesGrid } from '@/app/dashboard/pitches/_components/pitch-grid';
import { FileText, BarChart3, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import routes from '@/config/routes';

const tabMenu = [
  {
    title: 'My Pitches',
    path: 'pitches',
  },
  {
    title: 'Activity',
    path: 'activity',
  },
  {
    title: 'Stats',
    path: 'stats',
  },
];

interface ProfileTabsProps {
  pitches: Pitch[];
  isLoading: boolean;
}

// Status icon mapping
const statusIcons = {
  approved: CheckCircle,
  pending: Clock,
  rejected: XCircle,
  'in-pool': BarChart3,
  'under-review': Clock,
  shortlisted: CheckCircle,
  'conditional-approval': AlertCircle,
  'needs-more-info': AlertCircle,
};

const statusColors = {
  approved: 'text-green-500',
  pending: 'text-yellow-500',
  rejected: 'text-red-500',
  'in-pool': 'text-blue-500',
  'under-review': 'text-blue-400',
  shortlisted: 'text-purple-500',
  'conditional-approval': 'text-orange-500',
  'needs-more-info': 'text-gray-500',
};

export default function ProfileTabs({ pitches, isLoading }: ProfileTabsProps) {
  // Calculate stats
  const statusCounts = pitches.reduce(
    (acc, pitch) => {
      acc[pitch.status] = (acc[pitch.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const industryCounts = pitches.reduce(
    (acc, pitch) => {
      acc[pitch.industry] = (acc[pitch.industry] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalFunding = pitches.reduce((sum, p) => sum + p.fundingGoal, 0);
  const avgFunding = pitches.length > 0 ? totalFunding / pitches.length : 0;

  // Create activity timeline from pitches
  const activities = pitches
    .map((pitch) => ({
      id: pitch.id,
      title: pitch.title,
      status: pitch.status,
      date: pitch.lastUpdated || pitch.dateSubmitted,
      type: 'pitch' as const,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader variant="blink" />
      </div>
    );
  }

  return (
    <Suspense fallback={<Loader variant="blink" />}>
      <ParamTab tabMenu={tabMenu}>
        {/* My Pitches Tab */}
        <TabPanel className="focus:outline-none">
          {pitches.length > 0 ? (
            <PitchesGrid pitches={pitches} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 dark:border-gray-700">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No pitches yet
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Create your first pitch to start fundraising
              </p>
              <Link
                href={routes.submitPitch}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Create Pitch
              </Link>
            </div>
          )}
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel className="focus:outline-none">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const StatusIcon = statusIcons[activity.status] || Clock;
                const statusColor = statusColors[activity.status] || 'text-gray-500';

                return (
                  <Link
                    key={activity.id}
                    href={routes.pitchDetails(activity.id)}
                    className="block"
                  >
                    <div className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800',
                          statusColor
                        )}
                      >
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {activity.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn('capitalize', statusColor)}
                          >
                            {activity.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Last updated{' '}
                          {format(new Date(activity.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 dark:border-gray-700">
              <Clock className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                No activity yet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your pitch activity will appear here
              </p>
            </div>
          )}
        </TabPanel>

        {/* Stats Tab */}
        <TabPanel className="focus:outline-none">
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pitches.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Pitches
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-500">
                  {statusCounts['approved'] || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Approved
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-2xl font-bold text-blue-500">
                  {statusCounts['in-pool'] || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  In Pool
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-2xl font-bold text-yellow-500">
                  {statusCounts['pending'] || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </div>
              </div>
            </div>

            {/* Funding Stats */}
            <div>
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                Funding Overview
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalFunding.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Funding Goal
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${Math.round(avgFunding).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Average per Pitch
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Breakdown */}
            {Object.keys(industryCounts).length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                  Industries
                </h3>
                <div className="space-y-3">
                  {Object.entries(industryCounts).map(([industry, count]) => (
                    <div
                      key={industry}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {industry}
                      </span>
                      <Badge variant="outline">{count} pitches</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Breakdown */}
            {Object.keys(statusCounts).length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-900 dark:text-white">
                  Status Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const StatusIcon =
                      statusIcons[status as keyof typeof statusIcons] || Clock;
                    const color =
                      statusColors[status as keyof typeof statusColors] ||
                      'text-gray-500';

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <span
                          className={cn(
                            'flex items-center gap-2 font-medium capitalize',
                            color
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {status.replace('-', ' ')}
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {pitches.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 dark:border-gray-700">
                <BarChart3 className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No stats available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create pitches to see your statistics
                </p>
              </div>
            )}
          </div>
        </TabPanel>
      </ParamTab>
    </Suspense>
  );
}
