# Admin Review System - Deployment Checklist

Use this checklist to ensure everything is properly configured before going live.

## ✅ Pre-Deployment Checklist

### Database Setup

- [ ] Run `pnpm db:generate` to create migration files
- [ ] Run `pnpm db:push` to apply schema changes
- [ ] Verify `pitch_actions` table exists in database
- [ ] Run `pnpm db:studio` to visually confirm tables
- [ ] Test database connection from application

### Environment Variables

- [ ] `DATABASE_URL` is set in `.env.local`
- [ ] `RESEND_API_KEY` is set in `.env.local`
- [ ] Environment variables are also set in production environment
- [ ] Test Resend API key is valid (send test email)

### Admin Access

- [ ] At least one user has `user_type = 'admin'` in database
- [ ] Admin user can access `/admin` route
- [ ] Admin dashboard loads without errors
- [ ] Stats cards display correctly

### Logo & Branding

- [ ] Replace `public/images/crowdvc-logo.png` with actual logo
- [ ] Logo displays correctly in email preview
- [ ] Logo size is optimized (recommended 200x50px)

### Functionality Testing

- [ ] Can view all pitches in admin dashboard
- [ ] Search functionality works (by title, email, submission ID)
- [ ] Status filtering works (pending, approved, rejected)
- [ ] Sorting works (newest, oldest, title, funding)
- [ ] Can open pitch detail drawer
- [ ] Can click "Review" button on pending pitches
- [ ] Approval modal opens correctly
- [ ] Rejection modal requires reason selection
- [ ] "Other" rejection reason requires custom notes
- [ ] Confirmation step appears before final action

### Email Notifications

- [ ] Approval email sends successfully
- [ ] Rejection email sends successfully
- [ ] Email content displays correctly (test in multiple email clients)
- [ ] Logo appears in email
- [ ] Links in email work correctly
- [ ] Sender email is correct (`pitches@crowdvc.app` or your domain)
- [ ] Test with real email addresses
- [ ] Check spam folder if emails not received

### Database Logging

- [ ] Pitch status updates correctly in database
- [ ] `pitch_actions` table logs admin actions
- [ ] Action logs include admin ID, reason, and notes
- [ ] `lastUpdated` timestamp updates on pitches table

### Error Handling

- [ ] Test with invalid pitch ID
- [ ] Test with missing required fields
- [ ] Test email sending failure (disconnect API key temporarily)
- [ ] Verify error messages display to admin
- [ ] Check server logs for errors

## 🔐 Security Checklist

### Current Status (To Be Implemented)

- [ ] **TODO**: Implement full authentication system
- [ ] **TODO**: Add session management
- [ ] **TODO**: Implement `getAdminIdFromRequest()` function
- [ ] **TODO**: Uncomment admin validation in API routes
- [ ] **TODO**: Add route protection middleware
- [ ] **TODO**: Add CSRF protection
- [ ] **TODO**: Add rate limiting to API endpoints
- [ ] **TODO**: Validate and sanitize all inputs
- [ ] **TODO**: Add audit logging for admin actions

### Immediate Security Measures

- [ ] Only trusted users have admin access
- [ ] Database credentials are secure
- [ ] API keys are not committed to version control
- [ ] `.env.local` is in `.gitignore`

## 📧 Email Configuration

### Resend Setup

- [ ] Resend account created
- [ ] API key generated and tested
- [ ] Sender domain verified (for production)
- [ ] Email templates tested in Resend preview
- [ ] Delivery rate monitored

### Email Content

- [ ] Email copy reviewed for grammar and tone
- [ ] All dynamic content renders correctly
- [ ] Links point to correct URLs
- [ ] Contact email is correct (`support@crowdvc.app`)
- [ ] Unsubscribe link added (if required by law)

## 🧪 Testing Scenarios

### Happy Path

- [ ] Admin logs in
- [ ] Views dashboard with accurate stats
- [ ] Searches for specific pitch
- [ ] Reviews pitch details
- [ ] Approves pitch with notes
- [ ] Startup receives approval email
- [ ] Pitch status updates to "approved"
- [ ] Action logged in database

### Rejection Flow

- [ ] Admin selects pitch to review
- [ ] Chooses "Reject"
- [ ] Selects rejection reason
- [ ] Adds custom feedback
- [ ] Confirms rejection
- [ ] Startup receives rejection email with reason
- [ ] Pitch status updates to "rejected"
- [ ] Action logged with reason

### Edge Cases

- [ ] Test with very long pitch titles
- [ ] Test with missing optional fields
- [ ] Test with special characters in content
- [ ] Test with multiple rapid approvals/rejections
- [ ] Test with database connection failure
- [ ] Test with email service down

## 🚀 Production Deployment

### Before Deploying

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Database backup created
- [ ] Environment variables set in production
- [ ] Documentation reviewed

### Deployment Steps

1. [ ] Commit all changes to version control
2. [ ] Push to staging environment (if available)
3. [ ] Run migrations on staging database
4. [ ] Test thoroughly in staging
5. [ ] Deploy to production
6. [ ] Run migrations on production database
7. [ ] Verify production environment variables
8. [ ] Test in production (with real but test data first)

### Post-Deployment

- [ ] Monitor error logs for first 24 hours
- [ ] Check email delivery metrics in Resend
- [ ] Verify admin can access dashboard
- [ ] Test one approval and one rejection
- [ ] Monitor database for action logs
- [ ] Set up alerts for email failures

## 📊 Monitoring

### What to Monitor

- [ ] Email delivery rate (Resend dashboard)
- [ ] API response times
- [ ] Database query performance
- [ ] Error rates in server logs
- [ ] Admin activity (number of reviews per day)
- [ ] Pitch review turnaround time

### Set Up Alerts For

- [ ] Email delivery failures
- [ ] API endpoint errors (500s)
- [ ] Database connection issues
- [ ] Unusual admin activity patterns
- [ ] High volume of rejections

## 📝 Documentation

- [ ] `ADMIN_SETUP.md` reviewed and accurate
- [ ] `QUICK_START.md` tested by another person
- [ ] `IMPLEMENTATION_SUMMARY.md` reflects current state
- [ ] Inline code comments are clear
- [ ] API endpoints documented
- [ ] Database schema documented

## 👥 Team Onboarding

- [ ] Admin users trained on the system
- [ ] Review process documented
- [ ] Rejection reason guidelines established
- [ ] Email tone guidelines created
- [ ] Escalation process defined for edge cases

## 🔄 Maintenance Plan

### Regular Tasks

- [ ] Review admin activity logs weekly
- [ ] Monitor email delivery rates
- [ ] Check for failed email notifications
- [ ] Review rejection reasons for patterns
- [ ] Update email templates as needed
- [ ] Keep Resend API key secure and rotate regularly

### Future Enhancements

- [ ] Implement full authentication system
- [ ] Add bulk approval/rejection
- [ ] Create email history tracking
- [ ] Build analytics dashboard
- [ ] Add role-based permissions
- [ ] Implement advanced search filters

---

## ✨ Ready to Deploy?

Once all checkboxes are marked:

1. Create a database backup
2. Deploy to production
3. Run migrations
4. Test with real data
5. Monitor for 24 hours

**Good luck!** 🚀
