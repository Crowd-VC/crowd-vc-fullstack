'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/shadcn/button';
import { Separator } from '@/components/ui/separator';
import type { Contribution } from '@/db/schema/contributions';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface ContributionHistoryProps {
  contributions: Contribution[];
  className?: string;
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    icon: Clock,
    label: 'Pending',
  },
  confirmed: {
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    icon: CheckCircle2,
    label: 'Confirmed',
  },
  failed: {
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: XCircle,
    label: 'Failed',
  },
};

export function ContributionHistory({
  contributions,
  className,
}: ContributionHistoryProps) {
  const totalContributed = contributions
    .filter((c) => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0);

  if (contributions.length === 0) {
    return (
      <Card className={className}>
        <div className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No Contributions Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Your contribution history will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Contribution History
            </h3>
            <p className="text-sm text-muted-foreground">
              {contributions.length} contribution
              {contributions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold text-foreground">
              ${totalContributed.toLocaleString()}
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-4">
          {contributions.map((contribution) => {
            const config = statusConfig[contribution.status];
            const Icon = config.icon;

            return (
              <div
                key={contribution.id}
                className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-lg font-semibold text-foreground">
                      ${contribution.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(
                        new Date(contribution.contributedAt),
                        'MMM dd, yyyy • h:mm a',
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1.5 ${config.color}`}
                  >
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>

                {/* Fee Breakdown */}
                <div className="mb-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Platform Fee:</span>
                    {/* <span>${contribution.platformFee.toLocaleString()}</span> */}
                    <span>$5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gas Fee:</span>
                    {/* <span>${contribution.gasFee.toLocaleString()}</span> */}
                    <span>$0.01</span>
                  </div>
                </div>

                {/* Transaction Hash */}
                {contribution.transactionHash && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Tx: {contribution.transactionHash.slice(0, 6)}...
                      {contribution.transactionHash.slice(-4)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      asChild
                    >
                      <Link
                        href={`https://etherscan.io/tx/${contribution.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
