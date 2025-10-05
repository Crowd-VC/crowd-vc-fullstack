/**
 * Database Types
 *
 * Re-export all database types for convenient importing throughout the application
 */

// User types
export type { User, NewUser } from './schema/users';
export { userTypeEnum } from './schema/users';

// Pitch types
export type { Pitch, NewPitch } from './schema/pitches';
export { pitchStatusEnum } from './schema/pitches';

// Type helpers
export type UserType = 'startup' | 'investor' | 'admin';

export type PitchStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in-pool'
  | 'under-review'
  | 'shortlisted'
  | 'conditional-approval'
  | 'needs-more-info';
