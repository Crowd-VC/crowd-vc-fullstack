import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Pool {
    id: string;
    name: string;
    description: string;
    category: string;
    votingDeadline: Date;
    status: "active" | "closed" | "upcoming";
    startupCount: number;
    voteCount: number;
    fundingGoal?: number;
    currentFunding?: number;
    minContribution?: number;
    maxContribution?: number;
}

interface CastVoteData {
    poolId: string;
    pitchId: string;
    userId: string;
    walletAddress: string;
}

interface ContributeData {
    poolId: string;
    userId: string;
    walletAddress: string;
    amount: number;
    platformFee: number;
    gasFee?: number;
}

/**
 * Hook to fetch all active pools for investors
 */
export function useInvestorPools() {
    return useQuery<Pool[]>({
        queryKey: ["investor-pools"],
        queryFn: async () => {
            const response = await fetch("/api/pools");
            if (!response.ok) {
                throw new Error("Failed to fetch pools");
            }
            return response.json();
        },
    });
}

/**
 * Hook to fetch a single pool with startups and votes
 */
export function usePoolDetails(poolId: string, userId?: string) {
    return useQuery({
        queryKey: ["pool-details", poolId, userId],
        queryFn: async () => {
            const url = userId
                ? `/api/pools/${poolId}?userId=${userId}`
                : `/api/pools/${poolId}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch pool details");
            }
            return response.json();
        },
        enabled: !!poolId,
    });
}

/**
 * Hook to cast a vote
 */
export function useCastVote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            { poolId, pitchId, userId, walletAddress }: CastVoteData,
        ) => {
            const response = await fetch(`/api/pools/${poolId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pitchId, userId, walletAddress }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to cast vote");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["pool-details", variables.poolId],
            });
            queryClient.invalidateQueries({ queryKey: ["investor-pools"] });
        },
    });
}

/**
 * Hook to contribute to a pool
 */
export function useContribute() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ContributeData) => {
            const response = await fetch("/api/contributions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to contribute");
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["pool-details", variables.poolId],
            });
            queryClient.invalidateQueries({ queryKey: ["investor-pools"] });
            queryClient.invalidateQueries({
                queryKey: ["user-contributions", variables.userId],
            });
        },
    });
}

/**
 * Hook to fetch pool funding information
 */
export function usePoolFunding(poolId: string) {
    return useQuery({
        queryKey: ["pool-funding", poolId],
        queryFn: async () => {
            const response = await fetch(`/api/pools/${poolId}/funding`);
            if (!response.ok) {
                throw new Error("Failed to fetch pool funding");
            }
            return response.json();
        },
        enabled: !!poolId,
    });
}

/**
 * Hook to fetch user's contributions
 */
export function useUserContributions(poolId?: string, userId?: string) {
    return useQuery({
        queryKey: ["user-contributions", poolId, userId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (poolId) params.append("poolId", poolId);
            if (userId) params.append("userId", userId);

            const response = await fetch(`/api/contributions?${params}`);
            if (!response.ok) {
                throw new Error("Failed to fetch contributions");
            }
            return response.json();
        },
        enabled: !!(poolId || userId),
    });
}
