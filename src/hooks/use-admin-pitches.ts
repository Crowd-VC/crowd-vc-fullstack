import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PitchWithUser } from "@/db/types";
import { toast } from "sonner";

/**
 * Fetch all pitches with user details
 */
export function useAdminPitches() {
    return useQuery({
        queryKey: ["admin-pitches"],
        queryFn: async (): Promise<PitchWithUser[]> => {
            const response = await fetch("/api/admin/pitches");
            if (!response.ok) {
                throw new Error("Failed to fetch pitches");
            }
            const data = await response.json();
            return data.pitches;
        },
    });
}

/**
 * Fetch single pitch with user details
 */
export function useAdminPitch(pitchId: string) {
    return useQuery({
        queryKey: ["admin-pitch", pitchId],
        queryFn: async (): Promise<PitchWithUser> => {
            const response = await fetch(`/api/admin/pitches/${pitchId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch pitch");
            }
            const data = await response.json();
            return data.pitch;
        },
        enabled: !!pitchId,
    });
}

interface UpdatePitchStatusParams {
    pitchId: string;
    status: "approved" | "rejected";
    reason?: string;
    customNotes?: string;
    adminId: string;
}

/**
 * Update pitch status (approve/reject)
 */
export function useUpdatePitchStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            pitchId,
            status,
            reason,
            customNotes,
            adminId,
        }: UpdatePitchStatusParams) => {
            const response = await fetch(`/api/admin/pitches/${pitchId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    reason,
                    customNotes,
                    adminId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update pitch status");
            }

            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch pitches
            queryClient.invalidateQueries({ queryKey: ["admin-pitches"] });
            queryClient.invalidateQueries({ queryKey: ["admin-pitch"] });
        },
        onError: (error) => {
            console.error("Failed to update pitch status:", error);
            toast.error("Failed to update pitch status");
        },
    });
}

/**
 * Fetch pitch action history
 */
export function usePitchActions(pitchId: string) {
    return useQuery({
        queryKey: ["pitch-actions", pitchId],
        queryFn: async () => {
            const response = await fetch(
                `/api/admin/pitches/${pitchId}/actions`,
            );
            if (!response.ok) {
                throw new Error("Failed to fetch pitch actions");
            }
            const data = await response.json();
            return data.actions;
        },
        enabled: !!pitchId,
    });
}
