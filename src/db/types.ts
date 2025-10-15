/**
 * Database Types
 *
 * Re-export all database types for convenient importing throughout the application
 */

// User types
export type { NewUser, User } from "./schema/users";
export { userTypeEnum } from "./schema/users";

// Pitch types
export type { NewPitch, Pitch } from "./schema/pitches";
export { pitchStatusEnum } from "./schema/pitches";
export { pitchActionEnum } from "./schema/pitch-actions";
export { REJECTION_REASONS } from "./schema/rejection-reasons";
export type { RejectionReason } from "./schema/rejection-reasons";

// Pool types
export type { NewPool, Pool } from "./schema/pools";
export { poolStatusEnum } from "./schema/pools";
export type { NewPoolStartup, PoolStartup } from "./schema/pool-startups";
export type { NewVote, Vote } from "./schema/votes";

// Type helpers
export type UserType = "startup" | "investor" | "admin";

export type PitchStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-pool"
  | "under-review"
  | "shortlisted"
  | "conditional-approval"
  | "needs-more-info";

export type PitchActionType = "approved" | "rejected";

export type PoolStatus = "active" | "closed" | "upcoming";

// Re-export PitchWithUser from queries
export type { PitchWithUser } from "./queries/pitches";
