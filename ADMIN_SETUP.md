# Admin Review System Setup Guide

This guide covers the setup and usage of the Admin Review System for managing pitch submissions.

## Prerequisites

1. PostgreSQL database (Neon recommended)
2. Resend API account for email notifications
3. Node.js and pnpm installed

## Required Packages

The following packages are required and should already be installed:

```bash
pnpm add @react-email/render @react-email/components
```

These packages are used by Resend to render React email components.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Database Connection (already configured)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Email Service - Resend API Key (REQUIRED for notifications)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Getting Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key and add it to `.env.local`

**Note**: For development, you can use Resend's test mode which doesn't send actual emails.

## Database Setup

### 1. Generate Migration Files

Run the following command to generate migration files for the new schema:

```bash
pnpm db:generate
```

This will create migration files in `src/db/migrations/` for:

- `pitch_actions` table
- `pitch_action` enum

### 2. Apply Database Changes

Push the schema changes to your database:

```bash
pnpm db:push
```

Or apply migrations in production:

```bash
pnpm db:migrate
```

### 3. Verify Database Setup

Open Drizzle Studio to verify the tables were created correctly:

```bash
pnpm db:studio
```

You should see:

- ✅ `users` table (existing)
- ✅ `pitches` table (existing)
- ✅ `pitch_actions` table (new)

## Email Template Branding

### CrowdVC Logo

The email templates reference a logo at `/public/images/crowdvc-logo.png`.

**To add your logo:**

1. Place your logo image at: `public/images/crowdvc-logo.png`
2. Recommended size: 200x50 pixels (or similar aspect ratio)
3. Format: PNG with transparent background preferred

The placeholder file currently exists as a reminder. Replace it with your actual logo.

## Admin Access

### Setting Up Admin Users

Admins are identified by the `userType` field in the `users` table.

To grant admin access to a user:

1. Open Drizzle Studio: `pnpm db:studio`
2. Navigate to the `users` table
3. Find the user you want to make an admin
4. Change their `userType` to `'admin'`

### Admin Routes

The admin dashboard is accessible at:

- Classic layout: `/admin`
- Modern layout: (not yet implemented)
- Minimal layout: (not yet implemented)
- Retro layout: (not yet implemented)

Currently, the admin dashboard uses the classic layout as specified in the implementation plan.

## Features

### 1. Admin Dashboard (`/admin`)

The main admin dashboard provides:

- **Stats Overview**: Total pitches, pending reviews, approved/rejected counts
- **Search & Filter**: Search by title, company, email, or submission ID
- **Status Filtering**: Filter by pending, under review, approved, or rejected
- **Sorting**: Sort by date, title, or funding amount

### 2. Pitch Review

For each pitch, admins can:

- View detailed pitch information
- Review company details, funding information, and uploaded media
- Approve or reject with customizable feedback
- Add custom notes that are included in email notifications

### 3. Rejection Reasons

When rejecting a pitch, admins must select a reason from:

- Incomplete Information
- Not Aligned with Investment Criteria
- Insufficient Market Validation
- Weak Team Background
- Unrealistic Financial Projections
- Other (requires custom notes)

### 4. Email Notifications

Automated email notifications are sent to startups when their pitch is:

- **Approved**: Includes next steps and congratulations message
- **Rejected**: Includes reason and constructive feedback

Emails are professionally styled with CrowdVC branding.

## Components

### UI Components Created

Located in `src/app/(classic)/admin/_components/`:

1. **pitch-review-card.tsx**: Card displaying pitch summary
2. **pitch-review-list.tsx**: Grid layout of pitch cards
3. **admin-toolbar.tsx**: Search, filter, and sort controls
4. **admin-stats-cards.tsx**: Dashboard statistics cards
5. **review-action-modal.tsx**: Modal for approving/rejecting pitches
6. **pitch-detail-drawer.tsx**: Slide-out drawer with full pitch details

### Backend Components

1. **API Routes**:
   - `GET /api/admin/pitches` - Fetch all pitches with user details
   - `GET /api/admin/pitches/[id]` - Fetch single pitch
   - `PATCH /api/admin/pitches/[id]` - Update pitch status
   - `POST /api/pitch-status` - Send status email notification

2. **Database Queries**:
   - `getPitchesWithUserDetails()` - Fetch pitches with user info
   - `getPitchWithUserDetails(id)` - Fetch single pitch with user info
   - `createPitchAction()` - Log admin review action
   - `getPitchActionsByPitchId()` - Get review history

3. **Services**:
   - `sendPitchStatusEmail()` - Send notification via Resend

## Security Considerations

### Current Implementation

- Admin routes check for `userType === 'admin'` in the database
- API routes include TODO comments for admin validation
- Email sending is server-side only

### TODO: Implement Full Authentication

The current implementation includes placeholder code for authentication. You should:

1. Integrate with your authentication system (e.g., NextAuth, Auth0, Clerk)
2. Implement `getAdminIdFromRequest()` in `src/lib/helpers/admin-auth.ts`
3. Uncomment admin validation in API routes
4. Add middleware to protect `/admin` routes

Example integration with NextAuth:

```typescript
// In src/lib/helpers/admin-auth.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getAdminIdFromRequest(
  request: Request,
): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}
```

## Testing

### Manual Testing Checklist

1. **Admin Access**:
   - [ ] Set a user's `userType` to `'admin'` in database
   - [ ] Navigate to `/admin`
   - [ ] Verify dashboard loads with stats

2. **Pitch Review**:
   - [ ] Click "Review" on a pending pitch
   - [ ] Try approving with optional notes
   - [ ] Try rejecting with required reason
   - [ ] Verify confirmation step appears

3. **Email Notifications**:
   - [ ] Approve a pitch
   - [ ] Check that email was sent (check Resend dashboard)
   - [ ] Reject a pitch with reason
   - [ ] Verify rejection email content

4. **Search & Filter**:
   - [ ] Search for pitches by title
   - [ ] Filter by status (pending, approved, rejected)
   - [ ] Sort by different criteria

### Email Testing

For development, use Resend's test mode or your own email address:

1. Create a test pitch with your email
2. Review and approve/reject it
3. Check your inbox for the notification email

## Troubleshooting

### Database Connection Issues

If you see "DATABASE_URL environment variable is not set":

1. Ensure `.env.local` file exists in project root
2. Verify `DATABASE_URL` is set correctly
3. Restart your development server

### Email Not Sending

If emails aren't being sent:

1. Verify `RESEND_API_KEY` is set in `.env.local`
2. Check Resend dashboard for API key status
3. Review server logs for email service errors
4. Ensure "from" email domain is verified in Resend

### Migration Issues

If migrations fail:

1. Check database connection string
2. Ensure database is accessible
3. Try running `pnpm db:push` directly
4. Review migration files in `src/db/migrations/`

## Next Steps

### Recommended Enhancements

1. **Authentication Integration**: Implement full admin authentication
2. **Bulk Actions**: Add ability to approve/reject multiple pitches at once
3. **Email History**: Create table to track sent emails
4. **Advanced Analytics**: Add review time tracking and analytics
5. **Role Permissions**: Implement granular permissions for different admin roles
6. **Audit Log**: Track all admin actions for compliance
7. **Email Templates**: Add more email templates for different scenarios

### Production Checklist

Before deploying to production:

- [ ] Set up production Resend API key
- [ ] Configure production database
- [ ] Implement full authentication
- [ ] Add admin route protection middleware
- [ ] Test email delivery with real addresses
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure email rate limiting
- [ ] Add admin activity logging
- [ ] Review and secure all API endpoints
- [ ] Add proper error boundaries in UI

## Support

For issues or questions:

1. Check this documentation
2. Review code comments in implementation files
3. Check Resend and Neon documentation
4. Review error logs in console/server

## File Structure

```
src/
├── app/
│   ├── (classic)/admin/
│   │   ├── page.tsx                    # Main admin dashboard
│   │   └── _components/
│   │       ├── pitch-review-card.tsx
│   │       ├── pitch-review-list.tsx
│   │       ├── admin-toolbar.tsx
│   │       ├── admin-stats-cards.tsx
│   │       ├── review-action-modal.tsx
│   │       └── pitch-detail-drawer.tsx
│   └── api/
│       ├── admin/pitches/
│       │   ├── route.ts               # GET all pitches
│       │   └── [id]/route.ts          # GET/PATCH single pitch
│       └── pitch-status/route.ts      # POST send email
├── components/emails/
│   └── pitch-status-email.tsx         # Email template
├── db/
│   ├── schema/
│   │   ├── pitch-actions.ts           # Pitch actions table
│   │   └── rejection-reasons.ts       # Rejection reasons
│   └── queries/
│       └── pitch-actions.ts           # Pitch action queries
├── hooks/
│   └── use-admin-pitches.ts           # React Query hooks
├── lib/
│   ├── services/
│   │   └── email-service.ts           # Email sending service
│   └── helpers/
│       └── admin-auth.ts              # Admin authentication helpers
└── public/images/
    └── crowdvc-logo.png               # Logo for emails (REPLACE THIS)
```
