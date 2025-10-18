'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/shadcn/button';
import type { Pitch } from '@/db/schema/pitches';
import { FileText, Video, ExternalLink, Download, Play } from 'lucide-react';
import Link from 'next/link';

interface MediaViewerProps {
  pitch: Pitch;
}

export function MediaViewer({ pitch }: MediaViewerProps) {
  const hasMedia =
    pitch.pitchDeckUrl ||
    pitch.pitchVideoUrl ||
    pitch.demoUrl ||
    pitch.prototypeUrl;

  if (!hasMedia) {
    return (
      <Card className="flex min-h-[300px] items-center justify-center p-8">
        <div className="text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No media files available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pitch Deck */}
      {pitch.pitchDeckUrl && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pitch Deck</h3>
                <p className="text-sm text-muted-foreground">
                  Download or view the full pitch deck
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={pitch.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={pitch.pitchDeckUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pitch Video */}
      {pitch.pitchVideoUrl && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <Video className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pitch Video</h3>
                <p className="text-sm text-muted-foreground">
                  Watch the video presentation
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={pitch.pitchVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch
              </Link>
            </Button>
          </div>

          {/* Video Player */}
          <div className="aspect-video bg-black">
            <video
              controls
              className="h-full w-full"
              poster={pitch.imageUrl || undefined}
            >
              <source src={pitch.pitchVideoUrl} type="video/mp4" />
              <track kind="captions" label="English" srcLang="en" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Card>
      )}

      {/* Demo URL */}
      {pitch.demoUrl && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ExternalLink className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Live Demo</h3>
                <p className="text-sm text-muted-foreground">
                  Try out the product demo
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={pitch.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Demo
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Prototype URL */}
      {pitch.prototypeUrl && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <ExternalLink className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prototype</h3>
                <p className="text-sm text-muted-foreground">
                  View the interactive prototype
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={pitch.prototypeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Prototype
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
