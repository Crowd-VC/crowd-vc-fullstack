export interface Pool {
  id: string
  title: string
  summary: string
  goal: number
  current_size: number
  min_ticket: number
  contributors_count: number
  deadline_utc: string
  allocation: { startup_id: string; startup_name: string; percentage: number; logo?: string }[]
  voting: { proposal_id: string; title: string; votes: number; total_votes: number }[]
  status: "active" | "closed" | "funded"
  metadata: {
    risk_level: "low" | "medium" | "high"
    industry: string[]
    stage: string[]
    pitch_video_url?: string
  }
  created_at: string
  manager: {
    name: string
    avatar?: string
    verified?: boolean // added verified field for manager verification badge
  }
}

export interface WalletInfo {
  address: string
  balance: number
  connected: boolean
}

export interface ContributionData {
  pool_id: string
  amount: number
  wallet_address: string
}

export interface VoteData {
  pool_id: string
  proposal_id: string
  choice: string
  weight?: number
}
