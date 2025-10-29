'use client';

import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: string;
  pitchTitle?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  submissionId,
  pitchTitle,
}: SuccessModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const displaySubmissionId = submissionId || '';
  const estimatedReviewDate = new Date();
  estimatedReviewDate.setDate(estimatedReviewDate.getDate() + 5);

  const copySubmissionId = async () => {
    try {
      await navigator.clipboard.writeText(displaySubmissionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleViewDashboard = () => {
    router.push('/dashboard/pitches');
    onClose();
  };

  const handleTrackSubmission = () => {
    router.push(`/dashboard/pitches/${displaySubmissionId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-[#2a2a2a] bg-[#181818] shadow-2xl duration-300 animate-in fade-in-0 zoom-in-95">
        <CardHeader className="pb-2 text-center">
          <div className="relative mb-6">
            <div className="animate-pulse-slow mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-[#F1F1F1]">
            Pitch Submitted Successfully!
          </h2>

          {pitchTitle && (
            <p className="text-sm text-[#A1A1A1]">
              "{pitchTitle}" is now under review
            </p>
          )}
        </CardHeader>

        <Separator className="bg-[#2a2a2a]" />

        <CardContent className="space-y-6 pb-4">
          {/* Submission Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#0F0F0F] p-4">
              <div>
                <p className="text-sm text-[#A1A1A1]">Submission ID</p>
                <p className="font-mono font-medium text-[#F1F1F1]">
                  {displaySubmissionId}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copySubmissionId}
                className="text-[#A1A1A1] hover:text-[#F1F1F1]"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-[#2a2a2a] bg-[#0F0F0F] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <p className="text-sm text-[#A1A1A1]">Review Timeline</p>
                </div>
                <p className="font-medium text-[#F1F1F1]">3-5 business days</p>
              </div>

              <div className="rounded-lg border border-[#2a2a2a] bg-[#0F0F0F] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-[#A1A1A1]">Expected By</p>
                </div>
                <p className="font-medium text-[#F1F1F1]">
                  {estimatedReviewDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="next-steps" className="border-[#2a2a2a]">
              <AccordionTrigger className="font-semibold text-[#F1F1F1] hover:text-[#F1F1F1] hover:no-underline">
                What happens next?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-sm text-[#A1A1A1]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                      <span className="text-xs font-bold text-blue-400">1</span>
                    </div>
                    <p>
                      Our investment team reviews your pitch deck and proposal
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
                      <span className="text-xs font-bold text-orange-400">
                        2
                      </span>
                    </div>
                    <p>Initial screening and compatibility assessment</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
                      <span className="text-xs font-bold text-green-400">
                        3
                      </span>
                    </div>
                    <p>You'll receive feedback and next steps via email</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleViewDashboard} className="w-full">
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleTrackSubmission}
                variant="outline"
                className="border-[#2a2a2a] bg-accent text-[#F1F1F1] hover:bg-primary"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Track Status
              </Button>

              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#2a2a2a] bg-accent text-[#F1F1F1] hover:bg-primary"
              >
                New Pitch
              </Button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-[#666]">
              💡 Tip: Bookmark this page or save your submission ID for easy
              tracking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
