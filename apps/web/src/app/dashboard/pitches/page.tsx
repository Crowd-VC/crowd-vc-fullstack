'use client';

import { useEffect, useState } from 'react';
import type { Pitch } from '@/db/schema/pitches';
import {
  PitchesGrid,
  LargeFeaturedCard,
  SmallFeaturedCard,
} from './_components/pitch-grid';
import { useAccount } from 'wagmi';
import { FileText, Plus, Rocket, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import Link from 'next/link';
import routes from '@/config/routes';

export default function PitchesPage() {
  const { address, isConnected } = useAccount();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPitches() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/pitches/user/${address}`);
        const result = await response.json();

        if (result.success) {
          setPitches(result.data);
        } else {
          setError(result.error || 'Failed to fetch pitches');
        }
      } catch (err) {
        setError('Failed to fetch pitches');
        console.error('Error fetching pitches:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPitches();
  }, [address]);

  // Get featured pitch (first one) and side pitches
  const mainFeatured = pitches[0];
  const sideFeatured = pitches.slice(1, 4);
  const remainingPitches = pitches.slice(4);

  // Group remaining pitches by industry
  const pitchesByIndustry = remainingPitches.reduce(
    (acc, pitch) => {
      if (!acc[pitch.industry]) {
        acc[pitch.industry] = [];
      }
      acc[pitch.industry].push(pitch);
      return acc;
    },
    {} as Record<string, Pitch[]>,
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen">
        <main className="container px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-foreground">Your Pitches</h1>
            <p className="text-muted-foreground">
              Manage and track all your submitted pitches.
            </p>
          </div>

          {/* Connect Wallet State */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-16">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <Wallet className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Connect Your Wallet
            </h2>
            <p className="mb-8 max-w-md text-center text-muted-foreground">
              Connect your wallet to view and manage your pitches. Your wallet
              address is used to identify your submissions and track your
              fundraising progress.
            </p>
            <w3m-button />
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <main className="container px-4 py-8">
          <p className="text-center text-gray-500">Loading pitches...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <main className="container px-4 py-8">
          <p className="text-center text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="min-h-screen">
        <main className="container px-4 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-foreground">Your Pitches</h1>
            <p className="text-muted-foreground">
              Manage and track all your submitted pitches.
            </p>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-16">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              No pitches yet
            </h2>
            <p className="mb-8 max-w-md text-center text-muted-foreground">
              You haven&apos;t submitted any pitches yet. Start your fundraising
              journey by creating your first pitch and connecting with
              investors.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={routes.submitPitch}>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Your First Pitch
                </Button>
              </Link>
              <Link href={routes.pools}>
                <Button size="lg" variant="outline" className="gap-2">
                  <Rocket className="h-5 w-5" />
                  Explore Pools
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container space-y-12 px-4 py-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Pitches</h1>
          <p className="text-muted-foreground">
            Manage and track all your submitted pitches.
          </p>
        </div>

        {/* Hero Section - Featured Layout */}
        {mainFeatured && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LargeFeaturedCard pitch={mainFeatured} />
            </div>
            {sideFeatured.length > 0 && (
              <div className="space-y-4">
                {sideFeatured.map((pitch) => (
                  <SmallFeaturedCard key={pitch.id} pitch={pitch} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Industry Sections */}
        {Object.entries(pitchesByIndustry).map(
          ([industry, industryPitches]) => (
            <section key={industry} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">{industry}</h2>
              <PitchesGrid pitches={industryPitches} />
            </section>
          ),
        )}
      </main>
    </div>
  );
}
