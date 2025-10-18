'use client';

import { Suspense } from 'react';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Pitch } from '@/db/schema/pitches';
import type { PitchWithUser } from '@/db/types';
import {
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Target,
  ExternalLink,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Loader from '@/components/ui/loader';
import { FundingBreakdown } from './funding-breakdown';
import { MediaViewer } from './media-viewer';

interface PitchTabsProps {
  pitch: Pitch | PitchWithUser;
}

export function PitchTabs({ pitch }: PitchTabsProps) {
  return (
    <Suspense fallback={<Loader variant="blink" />}>
      <ParamTab
        tabMenu={[
          {
            title: 'Overview',
            path: 'overview',
          },
          {
            title: 'Details',
            path: 'details',
          },
          {
            title: 'Funding',
            path: 'funding',
          },
          {
            title: 'Media',
            path: 'media',
          },
          {
            title: 'Timeline',
            path: 'timeline',
          },
        ]}
      >
        {/* Overview Tab */}
        <TabPanel className="focus:outline-none">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">
                Summary
              </h3>
              <p className="leading-relaxed text-foreground">{pitch.summary}</p>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Industry
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {pitch.industry}
                </p>
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {pitch.location}
                </p>
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Company Stage
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {pitch.companyStage}
                </p>
              </Card>

              <Card className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Team Size
                  </p>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {pitch.teamSize}
                </p>
              </Card>
            </div>
          </div>
        </TabPanel>

        {/* Details Tab */}
        <TabPanel className="focus:outline-none">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">
                Elevator Pitch
              </h3>
              <p className="leading-relaxed text-foreground">
                {pitch.elevatorPitch}
              </p>
            </Card>

            {pitch.oneKeyMetric && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Key Metric
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      The most important success indicator
                    </p>
                  </div>
                </div>
                <p className="leading-relaxed text-foreground">
                  {pitch.oneKeyMetric}
                </p>
              </Card>
            )}

            {pitch.website && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      Company Website
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Visit the official website
                    </p>
                  </div>
                  <Link
                    href={pitch.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            )}

            {pitch.customAmount && (
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Additional Information
                </h3>
                <p className="leading-relaxed text-foreground">
                  {pitch.customAmount}
                </p>
              </Card>
            )}
          </div>
        </TabPanel>

        {/* Funding Tab */}
        <TabPanel className="focus:outline-none">
          <FundingBreakdown pitch={pitch} />
        </TabPanel>

        {/* Media Tab */}
        <TabPanel className="focus:outline-none">
          <MediaViewer pitch={pitch} />
        </TabPanel>

        {/* Timeline Tab */}
        <TabPanel className="focus:outline-none">
          <div className="space-y-4">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Submission Timeline
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track the pitch review process
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Pitch Submitted
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(pitch.dateSubmitted), 'PPP')} at{' '}
                      {format(new Date(pitch.dateSubmitted), 'p')}
                    </p>
                  </div>
                </div>

                {pitch.lastUpdated && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Last Updated
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(pitch.lastUpdated), 'PPP')} at{' '}
                        {format(new Date(pitch.lastUpdated), 'p')}
                      </p>
                    </div>
                  </div>
                )}

                {pitch.reviewTimeline && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                      <Clock className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Review Timeline
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {pitch.reviewTimeline}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {pitch.reviewNotes && (
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Review Notes
                  </h3>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {pitch.reviewNotes}
                </p>
              </Card>
            )}
          </div>
        </TabPanel>
      </ParamTab>
    </Suspense>
  );
}
