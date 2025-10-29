'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DollarSign, AlertCircle, Info, Wallet } from 'lucide-react';
import type { Pool } from '@/db/schema/pools';
import { toast } from 'sonner';

interface ContributionPanelProps {
  pool: Pool;
  walletBalance: number;
  isWalletConnected: boolean;
  onContribute: (amount: number) => Promise<void>;
  onConnectWallet: () => void;
}

export function ContributionPanel({
  pool,
  walletBalance,
  isWalletConnected,
  onContribute,
  onConnectWallet,
}: ContributionPanelProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const numAmount = Number.parseFloat(amount) || 0;
  const platformFee = numAmount * 0.02; // 2% platform fee
  const gasEstimate = 15; // Mock gas estimate
  const total = numAmount + platformFee + gasEstimate;

  const fundingPercentage =
    pool.fundingGoal > 0
      ? Math.min(100, (pool.currentFunding / pool.fundingGoal) * 100)
      : 0;
  const remaining = Math.max(0, pool.fundingGoal - pool.currentFunding);

  const isValid =
    numAmount >= pool.minContribution &&
    total <= walletBalance &&
    numAmount <= remaining;

  const handleContribute = async () => {
    if (!isValid || !isWalletConnected) return;

    setIsProcessing(true);
    try {
      await onContribute(numAmount);
      setAmount('');
    } catch (error) {
      toast.error('Contribution failed');
      console.error('Contribution failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Contribute to Pool
        </h3>
        <p className="text-sm text-muted-foreground">
          Help fund promising startups in this pool
        </p>
      </div>

      {/* Funding Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Pool Progress</span>
          <span className="font-semibold text-foreground">
            {fundingPercentage.toFixed(1)}% funded
          </span>
        </div>
        <Progress value={fundingPercentage} className="mb-2 h-2" />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${pool.currentFunding.toLocaleString()} raised</span>
          <span>${remaining.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4 space-y-2">
        <Label htmlFor="contribution-amount">Contribution Amount (USD)</Label>
        <Input
          id="contribution-amount"
          type="number"
          placeholder={`Min. $${pool.minContribution.toLocaleString()}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={pool.minContribution}
          step={100}
          disabled={!isWalletConnected}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: ${pool.minContribution.toLocaleString()}</span>
          {pool.maxContribution && (
            <span>Max: ${pool.maxContribution.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Fee Breakdown */}
      {numAmount > 0 && (
        <div className="mb-4 space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contribution</span>
            <span className="font-medium">${numAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (2%)</span>
            <span className="font-medium">${platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Est. Gas Fee</span>
            <span className="font-medium">${gasEstimate.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Wallet Balance */}
      {isWalletConnected && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Wallet Balance: ${walletBalance.toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
      {numAmount > 0 && isWalletConnected && !isValid && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {numAmount < pool.minContribution
              ? `Minimum contribution is $${pool.minContribution.toLocaleString()}`
              : numAmount > remaining
                ? `Maximum available is $${remaining.toLocaleString()}`
                : 'Insufficient wallet balance'}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      {isWalletConnected ? (
        <Button
          onClick={handleContribute}
          disabled={!isValid || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            'Processing...'
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Contribute ${numAmount > 0 ? numAmount.toLocaleString() : '0'}
            </>
          )}
        </Button>
      ) : (
        <Button onClick={onConnectWallet} variant="outline" className="w-full">
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet to Contribute
        </Button>
      )}
    </Card>
  );
}
