'use client';

import { useState, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DollarSign, AlertCircle, Info, Wallet, Loader2, CheckCircle2, Shield } from 'lucide-react';
import type { Pool } from '@/db/schema/pools';
import { toast } from 'sonner';
import { useTokenBalance } from '@/lib/web3/hooks/tokens/useTokenBalance';
import { useTokenAllowanceByAddress } from '@/lib/web3/hooks/tokens/useTokenAllowance';
import { useTokenApproval } from '@/lib/web3/hooks/tokens/useTokenApproval';
import { useGetPlatformFee } from '@/lib/web3/hooks/factory/useGetPlatformFee';
import { usePoolInfo } from '@/lib/web3/hooks/pool/usePoolInfo';
import { PoolStatus } from '@crowd-vc/abis';
import { useEstimateContributeGas } from '@/lib/web3/hooks/pool/useEstimateContributeGas';
import { getTokenSymbolFromAddress } from '@/lib/web3/utils/tokenSymbol';
import { gasWeiToUSD, calculatePlatformFee } from '@/lib/web3/utils/gasCalculations';
import { DECIMALS } from '@/lib/web3/utils/constants';

interface ContributionPanelProps {
  pool: Pool;
  walletAddress?: string;
  isWalletConnected: boolean;
  onContribute: (amount: bigint, token: `0x${string}`) => Promise<void>;
  onConnectWallet: () => void;
}

export function ContributionPanel({
  pool,
  walletAddress,
  isWalletConnected,
  onContribute,
  onConnectWallet,
}: ContributionPanelProps) {
  const chainId = useChainId();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get pool info from contract to get acceptedToken and real-time totalContributions
  const { poolInfo, isLoading: poolInfoLoading, refetch: refetchPoolInfo } = usePoolInfo(
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

  // Check token allowance using direct token address from pool contract
  const {
    hasSufficientAllowance,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useTokenAllowanceByAddress(
    acceptedToken, // Use the actual token address from the pool
    walletAddress as `0x${string}` | undefined,
    pool?.contractAddress as `0x${string}` | undefined
  );

  // Token approval hook
  const {
    approveByAddress,
    isPending: isApproving,
    isConfirming: isApprovalConfirming,
    isSuccess: approvalSuccess,
    error: approvalError,
    reset: resetApproval,
  } = useTokenApproval();

  // Calculate amounts (USDT/USDC use 6 decimals)
  const numAmount = Number.parseFloat(amount) || 0;
  const amountInTokenUnits = amount && numAmount > 0
    ? parseUnits(amount, DECIMALS.USDT)
    : 0n;

  // Check if user has sufficient allowance for the contribution amount
  const needsApproval = amountInTokenUnits > 0n && !hasSufficientAllowance(amountInTokenUnits);

  // Calculate platform fee using actual fee from contract
  const platformFeeAmount = feeBasisPoints && amountInTokenUnits > 0n
    ? calculatePlatformFee(amountInTokenUnits, feeBasisPoints)
    : 0n;
  const platformFeeUSD = platformFeeAmount > 0n
    ? Number.parseFloat(formatUnits(platformFeeAmount, DECIMALS.USDT))
    : 0;

  // Estimate gas cost (assume ETH price ~$3000 for BASE network)
  const ETH_PRICE_USD = 3000;
  const { gasCostWei, isLoading: gasLoading } = useEstimateContributeGas(
    pool?.contractAddress as `0x${string}` | undefined,
    amountInTokenUnits > 0n ? amountInTokenUnits : undefined,
    acceptedToken,
    walletAddress as `0x${string}` | undefined
  );
  const gasEstimateUSD = gasCostWei > 0n
    ? Number.parseFloat(gasWeiToUSD(gasCostWei, ETH_PRICE_USD))
    : 0;

  const total = numAmount + platformFeeUSD + gasEstimateUSD;

  // Get wallet balance as number for comparison
  const walletBalanceNum = tokenBalance
    ? Number.parseFloat(formatUnits(tokenBalance, DECIMALS.USDT))
    : 0;

  // Use on-chain data for real-time progress (convert from token units to display)
  const onChainFunding = poolInfo?.totalContributions
    ? Number(formatUnits(poolInfo.totalContributions, DECIMALS.USDT))
    : pool.currentFunding;
  const onChainGoal = poolInfo?.fundingGoal
    ? Number(formatUnits(poolInfo.fundingGoal, DECIMALS.USDT))
    : pool.fundingGoal;

  const fundingPercentage =
    onChainGoal > 0
      ? Math.min(100, (onChainFunding / onChainGoal) * 100)
      : 0;
  const remaining = Math.max(0, onChainGoal - onChainFunding);

  // Pool status checks
  const isPoolActive = poolInfo?.status === PoolStatus.Active;
  const votingDeadlineTimestamp = poolInfo?.votingDeadline ? Number(poolInfo.votingDeadline) : 0;
  const isVotingEnded = votingDeadlineTimestamp > 0 && Date.now() / 1000 >= votingDeadlineTimestamp;
  const poolStatusIssue = !isPoolActive
    ? `Pool is not active (status: ${poolInfo?.status})`
    : isVotingEnded
      ? 'Voting period has ended'
      : null;

  const isValid =
    numAmount >= pool.minContribution &&
    total <= walletBalanceNum &&
    numAmount <= remaining &&
    acceptedToken &&
    tokenSymbol !== 'UNKNOWN' &&
    isPoolActive &&
    !isVotingEnded;

  // Refetch allowance after successful approval
  useEffect(() => {
    if (approvalSuccess) {
      toast.success('Token approved successfully!', {
        description: 'You can now contribute to the pool.',
      });
      refetchAllowance();
      resetApproval();
    }
  }, [approvalSuccess, refetchAllowance, resetApproval]);

  // Handle approval errors
  useEffect(() => {
    if (approvalError) {
      toast.error('Approval failed', {
        description: approvalError,
      });
    }
  }, [approvalError]);

  const handleApprove = async () => {
    if (!acceptedToken || !pool?.contractAddress) {
      toast.error('Cannot approve: Pool token not available');
      return;
    }

    try {
      // Use approveByAddress to approve the exact token the pool accepts
      // This bypasses symbol resolution which could cause mismatches
      await approveByAddress({
        tokenAddress: acceptedToken,
        spender: pool.contractAddress as `0x${string}`,
        amount: BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935'), // MAX_UINT256
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleContribute = async () => {
    if (!isValid || !isWalletConnected || !acceptedToken) return;

    setIsProcessing(true);
    try {
      await onContribute(amountInTokenUnits, acceptedToken);
      setAmount('');
      // Refetch pool info to update the progress bar with new on-chain data
      await refetchPoolInfo();
    } catch (error) {
      console.error('Contribution failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoadingData = poolInfoLoading || feeLoading;
  const isApprovalInProgress = isApproving || isApprovalConfirming;

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
          <span>${onChainFunding.toLocaleString()} raised</span>
          <span>${remaining.toLocaleString()} remaining</span>
        </div>
      </div>

      {isLoadingData ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : tokenSymbol === 'UNKNOWN' ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to determine accepted token for this pool.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Amount Input */}
          <div className="mb-4 space-y-2">
            <Label htmlFor="contribution-amount">Contribution Amount ({tokenSymbol})</Label>
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
          {isWalletConnected && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {tokenSymbol} Balance: ${formattedBalance}
                {balanceLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
              </AlertDescription>
            </Alert>
          )}

          {/* Allowance Status */}
          {isWalletConnected && numAmount > 0 && (
            <div className="mb-4">
              {allowanceLoading ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking allowance...
                </div>
              ) : needsApproval ? (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <Shield className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    You need to approve {tokenSymbol} spending before contributing.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {tokenSymbol} approved for spending
                </div>
              )}
            </div>
          )}

          {/* Pool Status Issues */}
          {poolStatusIssue && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {poolStatusIssue}
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Errors */}
          {numAmount > 0 && isWalletConnected && !isValid && !poolStatusIssue && (
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

          {/* Action Buttons */}
          {isWalletConnected ? (
            <div className="space-y-3">
              {/* Approve Button - shown when approval is needed */}
              {needsApproval && isValid && (
                <Button
                  onClick={handleApprove}
                  disabled={isApprovalInProgress}
                  variant="outline"
                  className="w-full"
                >
                  {isApprovalInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isApproving ? 'Approving...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Approve {tokenSymbol}
                    </>
                  )}
                </Button>
              )}

              {/* Contribute Button */}
              <Button
                onClick={handleContribute}
                disabled={!isValid || isProcessing || needsApproval}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Contribute ${numAmount > 0 ? numAmount.toLocaleString() : '0'}
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={onConnectWallet} variant="outline" className="w-full">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet to Contribute
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
