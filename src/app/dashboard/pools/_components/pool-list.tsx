"use client"

import { PoolCard } from "../../../../components/pools/pool-card"
import type { Pool } from "@/lib/types"

interface PoolListProps {
  pools: Pool[]
  onContribute: (pool: Pool) => void
  onVote: (pool: Pool) => void
  onOpenDetail: (pool: Pool) => void
}

export function PoolList({ pools, onContribute, onVote, onOpenDetail }: PoolListProps) {
  if (pools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground mb-2">No pools found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pools.map((pool) => (
        <PoolCard key={pool.id} pool={pool} onContribute={onContribute} onVote={onVote} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  )
}
