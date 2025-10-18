import Link from 'next/link';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import routes from '@/config/routes';

export default function PitchNotFound() {
  return (
    <div className="container mx-auto flex min-h-[600px] items-center justify-center px-4">
      <Card className="max-w-md p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Pitch Not Found
        </h1>

        <p className="mb-6 text-muted-foreground">
          The pitch you're looking for doesn't exist or has been removed.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="default">
            <Link href={routes.pitches}>Browse All Pitches</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.home}>Go Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
