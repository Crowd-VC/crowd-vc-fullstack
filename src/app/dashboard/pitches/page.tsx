import type { Pitch } from '@/db/schema/pitches';
import { getPitchesByUserId } from '@/db/queries/pitches';
import { PitchesGrid } from './_components/pitch-grid';

// Main Page Component
export default async function PitchesPage() {
  const user = { id: 'user_2' };
  // Fetch pitches from database
  const pitches = await getPitchesByUserId(user.id as string);

  // Group pitches by industry
  const pitchesByIndustry = pitches.reduce(
    (acc, pitch) => {
      if (!acc[pitch.industry]) {
        acc[pitch.industry] = [];
      }
      acc[pitch.industry].push(pitch);
      return acc;
    },
    {} as Record<string, Pitch[]>,
  );

  return (
    <div className="min-h-screen">
      <main className="container space-y-12 px-4 py-8">
        {/* Industry Sections */}
        {Object.entries(pitchesByIndustry).map(
          ([industry, industryPitches]) => (
            <section key={industry} className="space-y-4">
              <PitchesGrid pitches={industryPitches} />
            </section>
          ),
        )}
      </main>
    </div>
  );
}
