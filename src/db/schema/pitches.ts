import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const pitchStatusEnum = pgEnum('pitch_status', [
  'pending',
  'approved',
  'rejected',
  'in-pool',
  'under-review',
  'shortlisted',
  'conditional-approval',
  'needs-more-info',
]);

export const pitches = pgTable('pitches', {
  // Core identification
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  elevatorPitch: text('elevator_pitch').notNull(),

  // Status and tracking
  status: pitchStatusEnum('status').notNull().default('pending'),
  dateSubmitted: timestamp('date_submitted').notNull().defaultNow(),
  submissionId: text('submission_id'),
  reviewTimeline: text('review_timeline'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  reviewNotes: text('review_notes'),

  // Company details
  industry: text('industry').notNull(),
  companyStage: text('company_stage').notNull(),
  teamSize: text('team_size').notNull(),
  location: text('location').notNull(),
  website: text('website'),
  oneKeyMetric: text('one_key_metric').notNull(),

  // Funding information
  fundingGoal: integer('funding_goal').notNull(),
  customAmount: text('custom_amount'),
  productDevelopment: text('product_development'),
  marketingSales: text('marketing_sales'),
  teamExpansion: text('team_expansion'),
  operations: text('operations'),
  timeToRaise: text('time_to_raise'),
  expectedROI: text('expected_roi'),

  // Media and files
  pitchDeckUrl: text('pitch_deck_url'),
  pitchVideoUrl: text('pitch_video_url'),
  demoUrl: text('demo_url'),
  prototypeUrl: text('prototype_url'),
  imageUrl: text('image_url'),
  featured: boolean('featured').default(false),
  featuredImage: text('featured_image'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Pitch = typeof pitches.$inferSelect;
export type NewPitch = typeof pitches.$inferInsert;
