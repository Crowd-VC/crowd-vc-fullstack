'use client';

import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Info, Wallet, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Pool } from '@/lib/types';
import { TransactionStepper } from '../../../../components/pools/transaction-stepper';
import { useTokenBalance } from '@/lib/web3/hooks/tokens/useTokenBalance';
import { useGetPlatformFee } from '@/lib/web3/hooks/factory/useGetPlatformFee';
import { usePoolInfo } from '@/lib/web3/hooks/pool/usePoolInfo';
import { useEstimateContributeGas } from '@/lib/web3/hooks/pool/useEstimateContributeGas';
import { getTokenSymbolFromAddress } from '@/lib/web3/utils/tokenSymbol';
import { gasWeiToUSD, calculatePlatformFee } from '@/lib/web3/utils/gasCalculations';
import { DECIMALS } from '@/lib/web3/utils/constants';

interface ContributeModalProps {
  pool: Pool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: bigint, token: `0x${string}`) => Promise<void>;
  walletAddress?: string;
  isWalletConnected: boolean;
}

export function ContributeModal({
  pool,
  open,
  onOpenChange,
  onConfirm,
  walletAddress,
  isWalletConnected,
}: ContributeModalProps) {
  const { open: openWalletModal } = useAppKit();
  const chainId = useChainId();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  // Get pool info from contract to get acceptedToken
  const { poolInfo, isLoading: poolInfoLoading } = usePoolInfo(
    pool?.contractAddress as `0x${string}` | undefined
  );

  // Get platform fee from factory contract
  const { feeBasisPoints, feePercentage, isLoading: feeLoading } = useGetPlatformFee();

  // Determine accepted token and symbol
  const acceptedToken = poolInfo?.acceptedToken;
  const tokenSymbol = acceptedToken
    ? getTokenSymbolFromAddress(acceptedToken, chainId)
    : 'UNKNOWN';

  // Get user's token balance for the pool's accepted token
  const {
    balance: tokenBalance,
    formattedBalance,
    isLoading: balanceLoading,
  } = useTokenBalance(
    walletAddress as `0x${string}` | undefined,
    tokenSymbol !== 'UNKNOWN' ? tokenSymbol : undefined
  );

  // Calculate amounts (USDT/USDC use 6 decimals)
  const numAmount = Number.parseFloat(amount) || 0;
  const amountInTokenUnits = amount && numAmount > 0
    ? parseUnits(amount, DECIMALS.USDT) // Both USDT and USDC use 6 decimals
    : 0n;

  // Calculate platform fee using actual fee from contract
  const platformFeeAmount = feeBasisPoints && amountInTokenUnits > 0n
    ? calculatePlatformFee(amountInTokenUnits, feeBasisPoints)
    : 0n;
  const platformFeeUSD = platformFeeAmount > 0n
    ? parseFloat(formatUnits(platformFeeAmount, DECIMALS.USDT))
    : 0;

  // Estimate gas cost (assume ETH price ~$3000 for BASE network)
  const ETH_PRICE_USD = 3000;
  const { gasCostWei, isLoading: gasLoading } = useEstimateContributeGas(
    pool?.pool_address as `0x${string}` | undefined,
    amountInTokenUnits > 0n ? amountInTokenUnits : undefined,
    acceptedToken,
    walletAddress as `0x${string}` | undefined
  );
  const gasEstimateUSD = gasCostWei > 0n
    ? parseFloat(gasWeiToUSD(gasCostWei, ETH_PRICE_USD))
    : 0;

  const total = numAmount + platformFeeUSD + gasEstimateUSD;

  // Get wallet balance as number for comparison
  const walletBalanceNum = tokenBalance
    ? parseFloat(formatUnits(tokenBalance, DECIMALS.USDT))
    : 0;

  if (!pool) return null;

  const isValid =
    numAmount >= pool.min_ticket &&
    total <= walletBalanceNum &&
    acceptedToken &&
    tokenSymbol !== 'UNKNOWN';
  const remaining = pool.goal - pool.current_size;

  const handleContribute = async () => {
    if (!isValid || !acceptedToken) return;

    setIsProcessing(true);
    setTransactionStatus('pending');

    try {
      await onConfirm(amountInTokenUnits, acceptedToken);
      setTransactionStatus('success');
      setTimeout(() => {
        onOpenChange(false);
        setAmount('');
        setTransactionStatus('idle');
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      setTransactionStatus('error');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setAmount('');
      setTransactionStatus('idle');
    }
  };

  const isLoadingData = poolInfoLoading || feeLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contribute to Pool</DialogTitle>
          <DialogDescription>
            {pool.title}
            {walletAddress && (
              <span className="ml-2 text-xs">
                ({walletAddress.slice(0, 6)}...{walletAddress.slice(-4)})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {transactionStatus !== 'idle' ? (
          <TransactionStepper status={transactionStatus} />
        ) : isLoadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading pool info...</span>
          </div>
        ) : tokenSymbol === 'UNKNOWN' ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to determine accepted token for this pool. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount ({tokenSymbol})</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Min. $${pool.min_ticket.toLocaleString()}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={pool.min_ticket}
                step={100}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Min: ${pool.min_ticket.toLocaleString()}</span>
                <span>Available: ${remaining.toLocaleString()}</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            {numAmount > 0 && (
              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contribution</span>
                  <span className="font-medium">
                    ${numAmount.toLocaleString()} {tokenSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Platform Fee ({feePercentage?.toFixed(1) ?? '...'}%)
                  </span>
                  <span className="font-medium">${platformFeeUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Est. Gas Fee {gasLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                  </span>
                  <span className="font-medium">${gasEstimateUSD.toFixed(2)}</span>
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
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {tokenSymbol} Balance: ${formattedBalance}
                {balanceLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
              </AlertDescription>
            </Alert>

            {/* Validation Errors */}
            {numAmount > 0 && !isValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {numAmount < pool.min_ticket
                    ? `Minimum contribution is $${pool.min_ticket.toLocaleString()}`
                    : 'Insufficient wallet balance'}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="transparent"
                onClick={handleClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              {isWalletConnected ? (
                <Button
                  onClick={handleContribute}
                  disabled={!isValid || isProcessing}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Confirm Contribution
                </Button>
              ) : (
                <Button
                  onClick={() => openWalletModal()}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
