import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Pool {
    id: string;
    name: string;
    description: string;
    category: string;
    votingDeadline: Date;
    status: "active" | "closed" | "upcoming";
    createdAt: Date;
    updatedAt: Date;
}

interface CreatePoolData {
    name: string;
    description: string;
    category: string;
    votingDeadline: Date;
    status?: "active" | "closed" | "upcoming";
}

interface UpdatePoolStatusData {
    poolId: string;
    status: "active" | "closed" | "upcoming";
}

interface AssignStartupData {
    poolId: string;
    pitchId: string;
}

interface RemoveStartupData {
    poolId: string;
    pitchId: string;
}

/**
 * Hook to fetch all pools (admin)
 */
export function useAdminPools() {
    return useQuery<Pool[]>({
        queryKey: ["admin-pools"],
        queryFn: async () => {
            const response = await fetch("/api/admin/pools");
            if (!response.ok) {
                throw new Error("Failed to fetch pools");
            }
            return response.json();
        },
    });
}

/**
 * Hook to create a new pool
 */
export function useCreatePool() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePoolData) => {
            const response = await fetch("/api/admin/pools", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create pool");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pools"] });
        },
    });
}

/**
 * Hook to update pool status
 */
export function useUpdatePoolStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ poolId, status }: UpdatePoolStatusData) => {
            const response = await fetch(`/api/admin/pools/${poolId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update pool status");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-pools"] });
        },
    });
}

/**
 * Hook to get startups in a pool
 */
export function usePoolStartups(poolId: string) {
    return useQuery({
        queryKey: ["pool-startups", poolId],
        queryFn: async () => {
            const response = await fetch(`/api/admin/pools/${poolId}/startups`);
            if (!response.ok) {
                throw new Error("Failed to fetch pool startups");
            }
            return response.json();
        },
        enabled: !!poolId,
    });
}

/**
 * Hook to assign a startup to a pool
 */
export function useAssignStartup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ poolId, pitchId }: AssignStartupData) => {
            const response = await fetch(
                `/api/admin/pools/${poolId}/startups`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pitchId }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || "Failed to assign startup to pool",
                );
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["pool-startups", variables.poolId],
            });
            queryClient.invalidateQueries({ queryKey: ["admin-pitches"] });
        },
    });
}

/**
 * Hook to remove a startup from a pool
 */
export function useRemoveStartup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ poolId, pitchId }: RemoveStartupData) => {
            const response = await fetch(
                `/api/admin/pools/${poolId}/startups?pitchId=${pitchId}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || "Failed to remove startup from pool",
                );
            }

            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["pool-startups", variables.poolId],
            });
            queryClient.invalidateQueries({ queryKey: ["admin-pitches"] });
        },
    });
}
