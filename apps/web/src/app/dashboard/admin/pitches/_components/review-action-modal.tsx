'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { PitchWithUser, RejectionReason } from '@/db/types';
import { REJECTION_REASONS } from '@/db/types';
import { useInvokeTransaction } from '@/web3/useInvokeTransaction';

interface ReviewActionModalProps {
  pitch: PitchWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    action: 'approved' | 'rejected',
    reason?: string,
    customNotes?: string,
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ReviewActionModal({
  pitch,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ReviewActionModalProps) {
  const [activeTab, setActiveTab] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    invokeTransaction,
    isPending: isInvokingTransaction,
    isSuccess: isSuccessInvokingTransaction,
    error: errorInvokingTransaction,
  } = useInvokeTransaction();
  const handleConfirm = () => {
    if (activeTab === 'reject' && !rejectionReason) {
      return; // Require rejection reason
    }
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    await invokeTransaction();
    await onConfirm(
      activeTab === 'approve' ? 'approved' : 'rejected',
      activeTab === 'reject' ? rejectionReason : undefined,
      customNotes || undefined,
    );
    handleClose();
  };

  const handleClose = () => {
    setShowConfirm(false);
    setRejectionReason('');
    setCustomNotes('');
    setActiveTab('approve');
    onOpenChange(false);
  };

  if (!pitch) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {!showConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>Review Pitch</DialogTitle>
              <DialogDescription>
                Review and take action on this pitch submission
              </DialogDescription>
            </DialogHeader>

            {/* Pitch Summary */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="mb-2 font-semibold text-foreground">
                {pitch.title}
              </h4>
              <p className="mb-2 text-sm text-muted-foreground">
                {pitch.summary}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Industry: {pitch.industry}</span>
                <span>•</span>
                <span>Goal: ${pitch.fundingGoal.toLocaleString()}</span>
                <span>•</span>
                <span>Submitted by: {pitch.user.name || pitch.user.email}</span>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={activeTab === 'approve' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setActiveTab('approve')}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant={activeTab === 'reject' ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setActiveTab('reject')}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>

              {activeTab === 'approve' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                      <div>
                        <h5 className="mb-1 font-medium text-emerald-600 dark:text-emerald-400">
                          Approval Confirmation
                        </h5>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          This pitch will be approved and added to an investment
                          pool. The startup will be notified via email.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approve-notes">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="approve-notes"
                      placeholder="Add any notes or feedback for the startup..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      These notes will be included in the email notification.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'reject' && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                      <div>
                        <h5 className="mb-1 font-medium text-red-600 dark:text-red-400">
                          Rejection Notice
                        </h5>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This pitch will be rejected. Please provide a reason
                          to help the startup improve their submission.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejection-reason">
                      Rejection Reason <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={rejectionReason}
                      onValueChange={setRejectionReason}
                    >
                      <SelectTrigger id="rejection-reason">
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        {REJECTION_REASONS.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reject-notes">
                      Additional Feedback{' '}
                      {rejectionReason === 'Other' && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="reject-notes"
                      placeholder="Provide detailed feedback to help the startup improve..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This feedback will be shared with the startup.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={
                  isLoading ||
                  (activeTab === 'reject' && !rejectionReason) ||
                  (activeTab === 'reject' &&
                    rejectionReason === 'Other' &&
                    !customNotes)
                }
                className={
                  activeTab === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {activeTab === 'approve' ? 'Approve Pitch' : 'Reject Pitch'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Your Decision</DialogTitle>
              <DialogDescription>
                Please confirm that you want to{' '}
                {activeTab === 'approve' ? 'approve' : 'reject'} this pitch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="mb-2 font-medium text-foreground">
                  {pitch.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  By: {pitch.user.name || pitch.user.email}
                </p>
              </div>

              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-500" />
                  <div>
                    <h5 className="mb-1 font-medium text-yellow-600 dark:text-yellow-400">
                      This action cannot be undone
                    </h5>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      An email notification will be sent to the startup
                      immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
              >
                Go Back
              </Button>
              <Button
                onClick={handleFinalConfirm}
                disabled={isLoading}
                className={
                  activeTab === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isLoading ? 'Processing...' : 'Confirm Decision'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
