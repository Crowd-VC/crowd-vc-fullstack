"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Pool, ContributionData, VoteData } from "@/lib/types"

// Mock API functions - replace with actual API calls
const fetchPools = async (): Promise<Pool[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return [
    {
      id: "1",
      title: "AI Infrastructure Fund Q1 2025",
      summary:
        "Diversified portfolio of early-stage AI infrastructure companies building the next generation of ML tools and platforms.",
      goal: 5000000,
      current_size: 3250000,
      min_ticket: 10000,
      contributors_count: 47,
      deadline_utc: "2025-03-31T23:59:59Z",
      allocation: [
        { startup_id: "s1", startup_name: "VectorDB", percentage: 25, logo: "/database-concept.png" },
        { startup_id: "s2", startup_name: "ModelOps", percentage: 20, logo: "/abstract-ai-network.png" },
        { startup_id: "s3", startup_name: "InferenceAI", percentage: 18, logo: "/single-potato-chip.png" },
        { startup_id: "s4", startup_name: "DataPipe", percentage: 15, logo: "/industrial-pipeline.png" },
      ],
      voting: [{ proposal_id: "v1", title: "Add CloudML to portfolio", votes: 32, total_votes: 47 }],
      status: "active",
      metadata: {
        risk_level: "medium",
        industry: ["AI/ML", "Infrastructure", "Developer Tools"],
        stage: ["Seed", "Series A"],
      },
      created_at: "2025-01-15T00:00:00Z",
      manager: {
        name: "Sarah Chen",
        avatar: "/diverse-group.png",
      },
    },
    {
      id: "2",
      title: "Climate Tech Pioneers",
      summary:
        "High-impact climate technology startups focused on carbon capture, renewable energy, and sustainable materials.",
      goal: 8000000,
      current_size: 6400000,
      min_ticket: 25000,
      contributors_count: 89,
      deadline_utc: "2025-04-15T23:59:59Z",
      allocation: [
        { startup_id: "s5", startup_name: "CarbonZero", percentage: 30, logo: "/single-autumn-leaf.png" },
        { startup_id: "s6", startup_name: "SolarGrid", percentage: 28, logo: "/glowing-sun.png" },
        { startup_id: "s7", startup_name: "BioMaterials", percentage: 22, logo: "/molecule.jpg" },
      ],
      voting: [],
      status: "active",
      metadata: {
        risk_level: "high",
        industry: ["Climate Tech", "Energy", "Materials"],
        stage: ["Series A", "Series B"],
      },
      created_at: "2025-01-20T00:00:00Z",
      manager: {
        name: "Marcus Johnson",
        avatar: "/diverse-avatars.png",
      },
    },
    {
      id: "3",
      title: "FinTech Innovation Pool",
      summary: "Next-generation financial services platforms revolutionizing payments, lending, and wealth management.",
      goal: 3000000,
      current_size: 1800000,
      min_ticket: 5000,
      contributors_count: 62,
      deadline_utc: "2025-05-01T23:59:59Z",
      allocation: [
        { startup_id: "s8", startup_name: "PayFlow", percentage: 35, logo: "/digital-payment-methods.png" },
        { startup_id: "s9", startup_name: "LendTech", percentage: 30, logo: "/scattered-currency.png" },
        { startup_id: "s10", startup_name: "WealthAI", percentage: 25, logo: "/data-analysis-chart.png" },
      ],
      voting: [{ proposal_id: "v2", title: "Increase PayFlow allocation", votes: 45, total_votes: 62 }],
      status: "active",
      metadata: {
        risk_level: "low",
        industry: ["FinTech", "Payments", "Banking"],
        stage: ["Seed", "Series A"],
      },
      created_at: "2025-02-01T00:00:00Z",
      manager: {
        name: "Emily Rodriguez",
        avatar: "/diverse-woman-portrait.png",
      },
    },
  ]
}

const contributeToPool = async (data: ContributionData): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log("[v0] Contributing to pool:", data)
}

const voteOnProposal = async (data: VoteData): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log("[v0] Voting on proposal:", data)
}

export function usePools() {
  return useQuery({
    queryKey: ["pools"],
    queryFn: fetchPools,
    staleTime: 30000,
  })
}

export function useContribute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: contributeToPool,
    onMutate: async (newContribution) => {
      await queryClient.cancelQueries({ queryKey: ["pools"] })
      const previousPools = queryClient.getQueryData<Pool[]>(["pools"])

      queryClient.setQueryData<Pool[]>(["pools"], (old) => {
        if (!old) return old
        return old.map((pool) =>
          pool.id === newContribution.pool_id
            ? {
                ...pool,
                current_size: pool.current_size + newContribution.amount,
                contributors_count: pool.contributors_count + 1,
              }
            : pool,
        )
      })

      return { previousPools }
    },
    onError: (err, newContribution, context) => {
      if (context?.previousPools) {
        queryClient.setQueryData(["pools"], context.previousPools)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pools"] })
    },
  })
}

export function useVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: voteOnProposal,
    onMutate: async (newVote) => {
      await queryClient.cancelQueries({ queryKey: ["pools"] })
      const previousPools = queryClient.getQueryData<Pool[]>(["pools"])

      queryClient.setQueryData<Pool[]>(["pools"], (old) => {
        if (!old) return old
        return old.map((pool) =>
          pool.id === newVote.pool_id
            ? {
                ...pool,
                voting: pool.voting.map((v) =>
                  v.proposal_id === newVote.proposal_id ? { ...v, votes: v.votes + 1 } : v,
                ),
              }
            : pool,
        )
      })

      return { previousPools }
    },
    onError: (err, newVote, context) => {
      if (context?.previousPools) {
        queryClient.setQueryData(["pools"], context.previousPools)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pools"] })
    },
  })
}
