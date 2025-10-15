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
}

interface CastVoteData {
    poolId: string;
    pitchId: string;
    userId: string;
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
        mutationFn: async ({ poolId, pitchId, userId }: CastVoteData) => {
            const response = await fetch(`/api/pools/${poolId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pitchId, userId }),
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
