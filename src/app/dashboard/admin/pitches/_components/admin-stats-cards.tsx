'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface AdminStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageReviewTime?: string;
  };
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const pendingPercentage = stats.total
    ? ((stats.pending / stats.total) * 100).toFixed(1)
    : '0';
  const approvedPercentage = stats.total
    ? ((stats.approved / stats.total) * 100).toFixed(1)
    : '0';
  const rejectedPercentage = stats.total
    ? ((stats.rejected / stats.total) * 100).toFixed(1)
    : '0';

  const cards = [
    {
      title: 'Total Pitches',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'All submissions',
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      description: `${pendingPercentage}% of total`,
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      description: `${approvedPercentage}% of total`,
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      description: `${rejectedPercentage}% of total`,
    },
    {
      title: 'Avg Review Time',
      value: stats.averageReviewTime || '2.5 days',
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Coming soon',
      isComingSoon: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="border-border/50 bg-card transition-all hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
