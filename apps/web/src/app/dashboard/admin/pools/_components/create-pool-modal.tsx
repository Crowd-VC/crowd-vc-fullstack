'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCreatePool, type CreatePoolContractParams } from '@/lib/web3/hooks/factory';
import { useAccount, useChainId } from 'wagmi';
import { parseUnits } from 'viem';
import { nanoid } from 'nanoid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { getUSDTAddress, getUSDCAddress } from '@/lib/web3/config/contracts';
import { Loader2, Wallet, AlertCircle } from 'lucide-react';
import { DECIMALS } from '@/lib/web3/utils/constants';

interface CreatePoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'E-commerce',
  'SaaS',
  'AI/ML',
  'Blockchain',
  'Clean Energy',
  'Biotech',
  'Other',
];

// Token decimals for USDT/USDC
const TOKEN_DECIMALS = DECIMALS.USDC;

// Minimum funding goal from contract (10,000 USDT/USDC)
const MIN_FUNDING_GOAL = 10000;
// Maximum funding goal from contract (50,000,000 USDT/USDC)
const MAX_FUNDING_GOAL = 50000000;

// Voting duration constraints from contract
const MIN_VOTING_DURATION_DAYS = 1;
const MAX_VOTING_DURATION_DAYS = 30;

export function CreatePoolModal({ open, onOpenChange }: CreatePoolModalProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    votingDeadline: '',
    status: 'upcoming' as 'active' | 'upcoming',
    // Smart contract fields
    fundingGoal: '',
    fundingDurationDays: '30',
    minContribution: '100',
    maxContribution: '',
    acceptedToken: 'USDT' as 'USDT' | 'USDC',
  });

  // Generate a stable pool ID for the form session
  const [poolId] = useState(() => nanoid());

  // Get token address based on selection
  const getTokenAddress = (): `0x${string}` => {
    try {
      return formData.acceptedToken === 'USDT'
        ? getUSDTAddress(chainId)
        : getUSDCAddress(chainId);
    } catch {
      // Return zero address if token not configured for chain
      return '0x0000000000000000000000000000000000000001' as `0x${string}`;
    }
  };

  // Calculate voting duration in seconds from deadline
  const calculateVotingDuration = (): bigint => {
    if (!formData.votingDeadline) return BigInt(0);
    const deadlineTimestamp = new Date(formData.votingDeadline).getTime();
    const now = Date.now();
    const durationMs = deadlineTimestamp - now;
    return BigInt(Math.max(0, Math.floor(durationMs / 1000)));
  };

  // Check if form has minimum required data for simulation
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const isFormValidForSimulation = useMemo(() => {
    const fundingGoal = Number(formData.fundingGoal);
    const minContribution = Number(formData.minContribution);
    const votingDuration = calculateVotingDuration();

    return (
      isConnected &&
      formData.name.length > 0 &&
      formData.category.length > 0 &&
      fundingGoal >= MIN_FUNDING_GOAL &&
      fundingGoal <= MAX_FUNDING_GOAL &&
      minContribution > 0 &&
      votingDuration > BigInt(0) &&
      Number(formData.fundingDurationDays) >= 1
    );
  }, [formData, isConnected]);

  // Build contract params for simulation
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const contractParams: CreatePoolContractParams | undefined = useMemo(() => {
    if (!isFormValidForSimulation) return undefined;

    try {
      const tokenAddress = getTokenAddress();
      const fundingGoalUnits = parseUnits(formData.fundingGoal, TOKEN_DECIMALS);
      const minContributionUnits = parseUnits(formData.minContribution, TOKEN_DECIMALS);
      const maxContributionUnits = formData.maxContribution
        ? parseUnits(formData.maxContribution, TOKEN_DECIMALS)
        : BigInt(0);
      const fundingDurationSeconds = BigInt(Number(formData.fundingDurationDays) * 86400);
      const votingDuration = calculateVotingDuration();

      return {
        poolId,
        name: formData.name,
        category: formData.category,
        fundingGoal: fundingGoalUnits,
        votingDuration,
        fundingDuration: fundingDurationSeconds,
        candidatePitches: [] as `0x${string}`[],
        acceptedToken: tokenAddress,
        minContribution: minContributionUnits,
        maxContribution: maxContributionUnits,
      };
    } catch {
      return undefined;
    }
  }, [formData, isFormValidForSimulation, poolId, chainId]);

  // Use the hook - simulation is triggered manually on form submit
  const {
    createPoolFromSimulation,
    triggerSimulation,
    hash,
    isConfirming,
    isCreatingDb,
    isLoading,
    isSuccess,
    isSimulating,
    simulationTriggered,
    simulationError,
    error,
    errorAction,
    isUserRejection,
    reset,
  } = useCreatePool({
    contractParams,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      votingDeadline: '',
      status: 'upcoming',
      fundingGoal: '',
      fundingDurationDays: '30',
      minContribution: '100',
      maxContribution: '',
      acceptedToken: 'USDT',
    });
    reset();
  };

  // Handle success - close modal and reset form
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (isSuccess) {
      toast.success('Pool created successfully!');
      onOpenChange(false);
      resetForm();
    }
  }, [isSuccess]);

  // Handle errors (write errors, receipt errors, db errors)
  useEffect(() => {
    if (error) {
      // Don't show toast for user rejections (they cancelled intentionally)
      if (isUserRejection) {
        toast.info('Transaction cancelled');
        return;
      }

      // Show error with optional action suggestion
      if (errorAction) {
        toast.error(error, {
          description: errorAction,
          duration: 6000,
        });
      } else {
        toast.error(error);
      }
    }
  }, [error, errorAction, isUserRejection]);

  // Simulation errors are now handled in handleSubmit, not via useEffect
  // This prevents premature error messages while the user is still filling the form

  const validateForm = (): string | null => {
    if (!isConnected) {
      return 'Please connect your wallet first';
    }

    if (!formData.name || !formData.description || !formData.category) {
      return 'Please fill in all required fields';
    }

    if (!formData.votingDeadline) {
      return 'Please set a voting deadline';
    }

    const votingDuration = calculateVotingDuration();
    const votingDurationDays = Number(votingDuration) / 86400;

    if (votingDurationDays < MIN_VOTING_DURATION_DAYS) {
      return `Voting deadline must be at least ${MIN_VOTING_DURATION_DAYS} day(s) in the future`;
    }

    if (votingDurationDays > MAX_VOTING_DURATION_DAYS) {
      return `Voting deadline must be within ${MAX_VOTING_DURATION_DAYS} days`;
    }

    const fundingGoal = Number(formData.fundingGoal);
    if (!fundingGoal || fundingGoal < MIN_FUNDING_GOAL) {
      return `Funding goal must be at least $${MIN_FUNDING_GOAL.toLocaleString()}`;
    }

    if (fundingGoal > MAX_FUNDING_GOAL) {
      return `Funding goal cannot exceed $${MAX_FUNDING_GOAL.toLocaleString()}`;
    }

    const minContribution = Number(formData.minContribution);
    if (!minContribution || minContribution <= 0) {
      return 'Minimum contribution must be greater than 0';
    }

    if (formData.maxContribution) {
      const maxContribution = Number(formData.maxContribution);
      if (maxContribution < minContribution) {
        return 'Maximum contribution must be greater than minimum contribution';
      }
    }

    const fundingDurationDays = Number(formData.fundingDurationDays);
    if (!fundingDurationDays || fundingDurationDays < 1) {
      return 'Funding duration must be at least 1 day';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const tokenAddress = getTokenAddress();

    // Database parameters
    const databaseParams = {
      id: poolId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      votingDeadline: new Date(formData.votingDeadline),
      status: formData.status,
      fundingGoal: Number(formData.fundingGoal),
      minContribution: Number(formData.minContribution),
      maxContribution: formData.maxContribution ? Number(formData.maxContribution) : undefined,
      fundingDuration: Number(formData.fundingDurationDays) * 86400,
      acceptedToken: tokenAddress,
    };

    try {
      // Step 1: Trigger simulation on form submit
      const simulationResult = await triggerSimulation();

      // Step 2: Check if simulation was successful
      if (simulationResult.error) {
        toast.error(`Transaction would fail: ${simulationResult.error.message}`);
        return;
      }

      if (!simulationResult.data?.request) {
        toast.error('Transaction validation failed. Please check your inputs.');
        return;
      }

      // Step 3: Execute the validated transaction (database insertion happens after tx confirmation)
      createPoolFromSimulation(databaseParams);
    } catch (err) {
      // Error handling is done via the hook's error state
      console.error('Pool creation failed:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const getButtonContent = () => {
    if (!isConnected) {
      return (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      );
    }

    // Show simulating state first (happens on form submit)
    if (isSimulating) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Simulating contract...
        </>
      );
    }

    if (isLoading) {
      if (isConfirming) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirming Transaction...
          </>
        );
      }
      if (isCreatingDb) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving to Database...
          </>
        );
      }
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Pool...
        </>
      );
    }

    return 'Create Pool';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Investment Pool</DialogTitle>
          <DialogDescription>
            Create a new investment pool on-chain for startups to compete for funding.
            Startups can be assigned after pool creation.
          </DialogDescription>
        </DialogHeader>

        {!isConnected && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            Please connect your wallet to create a pool
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Pool Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Q1 2024 FinTech Pool"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as 'active' | 'upcoming',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the focus and goals of this investment pool..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          {/* Funding Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Funding Configuration</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fundingGoal">Funding Goal (USD) *</Label>
                <Input
                  id="fundingGoal"
                  type="number"
                  placeholder="e.g., 100000"
                  min={MIN_FUNDING_GOAL}
                  max={MAX_FUNDING_GOAL}
                  value={formData.fundingGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, fundingGoal: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Min: ${MIN_FUNDING_GOAL.toLocaleString()} | Max: ${MAX_FUNDING_GOAL.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acceptedToken">Accepted Token *</Label>
                <Select
                  value={formData.acceptedToken}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      acceptedToken: value as 'USDT' | 'USDC',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minContribution">Min Contribution (USD) *</Label>
                <Input
                  id="minContribution"
                  type="number"
                  placeholder="e.g., 100"
                  min={1}
                  value={formData.minContribution}
                  onChange={(e) =>
                    setFormData({ ...formData, minContribution: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxContribution">Max Contribution (USD)</Label>
                <Input
                  id="maxContribution"
                  type="number"
                  placeholder="No limit"
                  min={1}
                  value={formData.maxContribution}
                  onChange={(e) =>
                    setFormData({ ...formData, maxContribution: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">Leave empty for no limit</p>
              </div>
            </div>
          </div>

          {/* Timeline Configuration Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Timeline Configuration</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="votingDeadline">Voting Deadline *</Label>
                <Input
                  id="votingDeadline"
                  type="datetime-local"
                  value={formData.votingDeadline}
                  onChange={(e) =>
                    setFormData({ ...formData, votingDeadline: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {MIN_VOTING_DURATION_DAYS}-{MAX_VOTING_DURATION_DAYS} days from now
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingDurationDays">Funding Duration (days) *</Label>
                <Input
                  id="fundingDurationDays"
                  type="number"
                  placeholder="e.g., 30"
                  min={1}
                  max={365}
                  value={formData.fundingDurationDays}
                  onChange={(e) =>
                    setFormData({ ...formData, fundingDurationDays: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Duration for investment collection after voting ends
                </p>
              </div>
            </div>
          </div>

          {/* Simulation Error Display */}
          {simulationError && isFormValidForSimulation && !isSimulating && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">Transaction would fail</p>
                <p className="mt-1 text-xs opacity-80 break-words">{simulationError}</p>
              </div>
            </div>
          )}

          {/* Transaction Hash Display */}
          {hash && (
            <div className="rounded-lg border bg-muted/50 p-3 text-xs">
              <p className="font-medium">Transaction Hash:</p>
              <p className="mt-1 break-all font-mono text-muted-foreground">
                {hash}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || isLoading || isSimulating}
            >
              {getButtonContent()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
