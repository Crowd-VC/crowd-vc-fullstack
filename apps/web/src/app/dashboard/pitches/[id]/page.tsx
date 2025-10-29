import { notFound } from 'next/navigation';
import { getPitchById } from '@/db/queries/pitches';
import { PitchDetailView } from './_components/pitch-detail-view';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pitch = await getPitchById(id);

  if (!pitch) {
    return {
      title: 'Pitch Not Found - CrowdVC',
    };
  }

  return {
    title: `${pitch.title} - CrowdVC`,
    description: pitch.summary,
    openGraph: {
      title: pitch.title,
      description: pitch.summary,
      images: pitch.imageUrl ? [pitch.imageUrl] : [],
    },
  };
}

export default async function PitchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pitch = await getPitchById(id);

  if (!pitch) {
    notFound();
  }

  return <PitchDetailView pitch={pitch} />;
}
