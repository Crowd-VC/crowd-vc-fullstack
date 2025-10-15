'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  Globe,
  TrendingUp,
  FileText,
  Video,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Mail,
  MapPin,
} from 'lucide-react';
import type { PitchWithUser } from '@/db/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PitchDetailDrawerProps {
  pitch: PitchWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (pitch: PitchWithUser) => void;
  onReject: (pitch: PitchWithUser) => void;
}

export function PitchDetailDrawer({
  pitch,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: PitchDetailDrawerProps) {
  if (!pitch) return null;

  const statusConfig = {
    pending: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Pending' },
    'under-review': {
      color: 'bg-blue-500/10 text-blue-500',
      label: 'Under Review',
    },
    approved: {
      color: 'bg-emerald-500/10 text-emerald-500',
      label: 'Approved',
    },
    rejected: { color: 'bg-red-500/10 text-red-500', label: 'Rejected' },
    'in-pool': { color: 'bg-purple-500/10 text-purple-500', label: 'In Pool' },
    shortlisted: {
      color: 'bg-indigo-500/10 text-indigo-500',
      label: 'Shortlisted',
    },
    'conditional-approval': {
      color: 'bg-amber-500/10 text-amber-500',
      label: 'Conditional',
    },
    'needs-more-info': {
      color: 'bg-orange-500/10 text-orange-500',
      label: 'Needs Info',
    },
  };

  const config = statusConfig[pitch.status];
  const isActionable =
    pitch.status !== 'approved' && pitch.status !== 'rejected';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{pitch.title}</SheetTitle>
              <SheetDescription className="mt-2">
                Submitted on{' '}
                {format(new Date(pitch.dateSubmitted), 'MMMM dd, yyyy')}
              </SheetDescription>
            </div>
            <Badge className={cn('border', config.color)}>{config.label}</Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Submission ID */}
          {pitch.submissionId && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Submission ID
              </p>
              <p className="font-mono text-sm text-foreground">
                {pitch.submissionId}
              </p>
            </div>
          )}

          {/* Elevator Pitch */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="h-5 w-5" />
              Elevator Pitch
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {pitch.elevatorPitch}
            </p>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Summary
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {pitch.summary}
            </p>
          </div>

          <Separator />

          {/* Company Details */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Company Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Industry
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.industry}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Stage</p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.companyStage}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Team Size
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.teamSize}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Location
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.location}
                  </p>
                </div>
              </div>
              {pitch.website && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Globe className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Website
                    </p>
                    <a
                      href={pitch.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {pitch.website}
                    </a>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 sm:col-span-2">
                <TrendingUp className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Key Metric
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.oneKeyMetric}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Funding Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Funding Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Funding Goal
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${pitch.fundingGoal.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Funding Breakdown */}
              {(pitch.productDevelopment ||
                pitch.marketingSales ||
                pitch.teamExpansion ||
                pitch.operations) && (
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">
                    Fund Allocation
                  </p>
                  <div className="space-y-2">
                    {pitch.productDevelopment && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Product Development
                        </span>
                        <span className="font-medium text-foreground">
                          {pitch.productDevelopment}%
                        </span>
                      </div>
                    )}
                    {pitch.marketingSales && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Marketing & Sales
                        </span>
                        <span className="font-medium text-foreground">
                          {pitch.marketingSales}%
                        </span>
                      </div>
                    )}
                    {pitch.teamExpansion && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Team Expansion
                        </span>
                        <span className="font-medium text-foreground">
                          {pitch.teamExpansion}%
                        </span>
                      </div>
                    )}
                    {pitch.operations && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Operations
                        </span>
                        <span className="font-medium text-foreground">
                          {pitch.operations}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pitch.timeToRaise && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Time to Raise
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pitch.timeToRaise}
                    </p>
                  </div>
                </div>
              )}

              {pitch.expectedROI && (
                <div className="flex items-start gap-3">
                  <TrendingUp className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Expected ROI Timeline
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pitch.expectedROI}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Media & Files */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Media & Resources
            </h3>
            <div className="space-y-3">
              {pitch.pitchDeckUrl && (
                <a
                  href={pitch.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Pitch Deck
                    </p>
                    <p className="text-xs text-muted-foreground">View PDF</p>
                  </div>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {pitch.pitchVideoUrl && (
                <a
                  href={pitch.pitchVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Pitch Video
                    </p>
                    <p className="text-xs text-muted-foreground">Watch video</p>
                  </div>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {pitch.demoUrl && (
                <a
                  href={pitch.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Demo</p>
                    <p className="text-xs text-muted-foreground">
                      View live demo
                    </p>
                  </div>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {pitch.prototypeUrl && (
                <a
                  href={pitch.prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <LinkIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Prototype
                    </p>
                    <p className="text-xs text-muted-foreground">
                      View prototype
                    </p>
                  </div>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Submitter Information */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Submitter Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {pitch.user.name || 'Not provided'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <a
                    href={`mailto:${pitch.user.email}`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {pitch.user.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          {pitch.reviewNotes && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Review Notes
                </h3>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    {pitch.reviewNotes}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {isActionable && (
          <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-border bg-background pt-4">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onApprove(pitch)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onReject(pitch)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
