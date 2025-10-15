'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvestorPools } from '@/hooks/use-investor-pools';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const queryClient = new QueryClient();

function InvestorPoolsContent() {
  const { data: pools = [], isLoading } = useInvestorPools();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'closed':
        return 'bg-gray-500/10 text-gray-500';
      case 'upcoming':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Investment Pools
        </h1>
        <p className="text-muted-foreground">
          Browse active investment pools and vote for your favorite startups
        </p>
      </div>

      {/* Pools Grid */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-muted-foreground">Loading pools...</div>
        </div>
      ) : pools.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <p className="text-lg text-muted-foreground">
            No active pools at the moment
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check back soon for new investment opportunities
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <Card key={pool.id} className="flex flex-col p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-xl font-semibold">{pool.name}</h3>
                  <Badge variant="outline" className="mb-2">
                    {pool.category}
                  </Badge>
                </div>
                <Badge className={getStatusColor(pool.status)}>
                  {pool.status}
                </Badge>
              </div>

              <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                {pool.description}
              </p>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Ends: {format(new Date(pool.votingDeadline), 'PPP')}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{pool.startupCount} startups</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>{pool.voteCount} votes cast</span>
                </div>
              </div>

              <Link href={`/pools/${pool.id}`} className="w-full">
                <Button className="w-full">
                  {pool.status === 'active' ? 'View & Vote' : 'View Results'}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InvestorPoolsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InvestorPoolsContent />
    </QueryClientProvider>
  );
}
