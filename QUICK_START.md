# Admin System Quick Start Guide

Get the Admin Review System up and running in 5 minutes.

## Step 0: Install Dependencies (if needed)

If you get module errors, ensure these packages are installed:

```bash
pnpm add @react-email/render @react-email/components
```

## Step 1: Environment Setup

Create or update `.env.local` in the project root:

```env
# Your existing database URL
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# NEW: Add your Resend API key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Get Resend API Key**: Sign up at [resend.com](https://resend.com) → API Keys → Create new key

## Step 2: Database Migration

Run these commands in order:

```bash
# Generate migration files from new schema
pnpm db:generate

# Push changes to database
pnpm db:push

# (Optional) Verify tables in Drizzle Studio
pnpm db:studio
```

**Expected result**: New `pitch_actions` table created in your database.

## Step 3: Create Admin User

1. Open Drizzle Studio: `pnpm db:studio`
2. Go to `users` table
3. Find your user or create a new one
4. Set `user_type` field to `'admin'`
5. Save changes

## Step 4: Replace Logo (Optional but Recommended)

Replace the placeholder logo file:

- Location: `public/images/crowdvc-logo.png`
- Recommended size: 200x50 pixels
- Format: PNG with transparent background

## Step 5: Start Development Server

```bash
pnpm dev
```

Navigate to: [http://localhost:3000/admin](http://localhost:3000/admin)

## Quick Test

1. Go to `/admin` in your browser
2. You should see the admin dashboard with stats
3. Click "Review" on any pending pitch
4. Try approving or rejecting with feedback
5. Check your email (or Resend dashboard) for the notification

## Troubleshooting

### "Database connection failed"

- Check `DATABASE_URL` in `.env.local`
- Ensure database is accessible

### "Email sending failed"

- Check `RESEND_API_KEY` in `.env.local`
- Verify API key is valid in Resend dashboard

### "Can't access /admin"

- Ensure your user has `user_type = 'admin'`
- Check database with `pnpm db:studio`

### "No pitches showing"

- Ensure there are pitches in the database
- Check they have associated users (foreign key constraint)

## What's Next?

- Read `ADMIN_SETUP.md` for detailed configuration
- Review `IMPLEMENTATION_SUMMARY.md` for full feature list
- Implement authentication (currently using TODO placeholders)
- Customize email templates in `src/components/emails/`

## Support

If you encounter issues:

1. Check the console for error messages
2. Review `ADMIN_SETUP.md` troubleshooting section
3. Verify all environment variables are set
4. Ensure database migrations completed successfully

---

**Ready to go!** 🚀

The admin system is now set up and ready to manage pitch submissions.
