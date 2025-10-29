'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/shadcn/button';
import type { Pitch } from '@/db/schema/pitches';
import type { PitchWithUser } from '@/db/types';
import {
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Calendar,
  Hash,
  Mail,
  User,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import routes from '@/config/routes';

interface PitchInfoSidebarProps {
  pitch: Pitch | PitchWithUser;
  fundingPercentage: number;
  daysLeft: number;
  // userRole?: 'admin' | 'investor' | 'owner' | 'public';
}

export function PitchInfoSidebar({
  pitch,
  fundingPercentage,
  daysLeft,
  // userRole = 'public',
}: PitchInfoSidebarProps) {
  const pitchWithUser = pitch as PitchWithUser;
  const hasUserInfo = 'user' in pitch && pitch.user;
  const userRole = pitch.userId === 'user_2' ? 'owner' : 'investor';

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Pitch Information
        </h3>

        <div className="space-y-4">
          {/* Funding Goal */}
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Funding Goal</p>
            <p className="text-2xl font-bold text-foreground">
              ${pitch.fundingGoal.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fundingPercentage}% funded
            </p>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            {/* Days Left */}
            {pitch.timeToRaise && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {daysLeft} days remaining
                </span>
              </div>
            )}

            {/* Submission ID */}
            {pitch.submissionId && (
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-muted-foreground">
                  {pitch.submissionId}
                </span>
              </div>
            )}

            {/* Industry */}
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{pitch.industry}</Badge>
            </div>

            {/* Company Stage */}
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{pitch.companyStage}</Badge>
            </div>

            {/* Team Size */}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {pitch.teamSize} team members
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{pitch.location}</span>
            </div>

            {/* Website */}
            {pitch.website && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={pitch.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Visit Website
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Card */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Take Action
        </h3>

        <div className="space-y-3">
          {userRole === 'admin' && (
            <>
              <Button className="w-full" variant="default">
                Review Pitch
              </Button>
              <Button className="w-full" variant="outline">
                Approve
              </Button>
              <Button className="w-full" variant="outline">
                Reject
              </Button>
            </>
          )}

          {userRole === 'investor' && (
            <>
              {pitch.status === 'in-pool' ? (
                <>
                  <Button className="w-full" variant="default" asChild>
                    <Link href={routes.pools}>Vote for this Pitch</Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link href={routes.pools}>View in Pool</Link>
                  </Button>
                </>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  Not in Active Pool
                </Button>
              )}
              <Button className="w-full" variant="outline" disabled>
                Add to Watchlist
              </Button>
            </>
          )}

          {userRole === 'owner' && (
            <Button className="w-full" variant="default" disabled>
              Edit Pitch (Coming Soon)
            </Button>
          )}

          {userRole === 'public' && (
            <>
              {pitch.status === 'in-pool' ? (
                <Button className="w-full" variant="default" asChild>
                  <Link href={routes.signIn}>Sign In to Vote</Link>
                </Button>
              ) : (
                <Button className="w-full" variant="default" asChild>
                  <Link href={routes.signIn}>Sign In to Invest</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Contact Card (Admin Only) */}
      {userRole === 'admin' && hasUserInfo && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Contact Information
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {pitchWithUser.user.name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${pitchWithUser.user.email}`}
                className="text-primary hover:underline"
              >
                {pitchWithUser.user.email}
              </a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
