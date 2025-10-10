# LipaSasa Platform - Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Migrations
- [ ] Run all pending migrations in Supabase dashboard
- [ ] Verify tables created successfully:
  - `admin_settings`
  - `system_health_checks`
  - `system_incidents`
  - `security_config_status`
- [ ] Check RLS policies are enabled on all tables
- [ ] Verify indexes are created

### 2. Supabase Configuration

#### Authentication Settings
- [ ] Enable Google OAuth Provider
  - Go to: Authentication > Providers > Google
  - Add Client ID and Client Secret from Google Cloud Console
  - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
  
- [ ] Configure OTP Settings
  - Go to: Authentication > Email Auth
  - Set OTP expiry: 600 seconds (10 minutes)
  - Enable "Sign up enabled"
  
- [ ] Enable Leaked Password Protection
  - Go to: Authentication > Policies
  - Toggle "Leaked password protection" ON

#### Database Settings
- [ ] Upgrade Postgres to latest version
  - Go to: Database > Settings
  - Click "Upgrade Database"
  - Follow prompts

#### API Settings
- [ ] Set API rate limits (if available in your plan)
- [ ] Configure CORS origins for production domain

### 3. Edge Functions Deployment

Deploy all Edge Functions:
```bash
# M-Pesa subscription payment
supabase functions deploy subscription-mpesa

# M-Pesa callback
supabase functions deploy subscription-mpesa-callback

# PayPal subscription payment
supabase functions deploy subscription-paypal

# PayPal webhook
supabase functions deploy subscription-paypal-webhook

# Email OTP
supabase functions deploy send-email-otp
supabase functions deploy verify-email-otp

# Health check
supabase functions deploy health-check
```

### 4. Environment Variables

Set the following secrets for Edge Functions:
```bash
# Supabase
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
supabase secrets set SUPABASE_ANON_KEY=your_anon_key

# Site URL
supabase secrets set SITE_URL=https://lipasasa.online

# Email service (if using Resend)
supabase secrets set RESEND_API_KEY=your_resend_key
```

### 5. Admin User Setup

Create the first admin user:
```sql
-- Run this in Supabase SQL Editor
-- Replace 'your-user-id' with actual user UUID from auth.users table

INSERT INTO public.user_roles (user_id, role)
VALUES ('your-user-id', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### 6. Financial Configuration

After admin login, configure payment gateways:
- [ ] Navigate to `/admin/financial-settings`
- [ ] Configure M-Pesa credentials:
  - Consumer Key
  - Consumer Secret
  - Shortcode (Till/Paybill)
  - Passkey
  - Environment (production)
- [ ] Configure PayPal credentials:
  - Client ID
  - Client Secret
  - Mode (live)
- [ ] Add bank account details for settlements

### 7. Frontend Deployment (Vercel)

#### First-Time Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Environment Variables on Vercel
Set in Vercel Dashboard > Settings > Environment Variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

#### Domain Configuration
- [ ] Add custom domain in Vercel: `lipasasa.online`
- [ ] Configure DNS records:
  - A record: points to Vercel IP
  - CNAME: `www` points to `cname.vercel-dns.com`
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Verify SSL certificate

### 8. DNS & Domain

Update DNS records:
```
Type    Name    Value                           TTL
A       @       76.76.21.21                    Auto
CNAME   www     cname.vercel-dns.com           Auto
TXT     @       v=spf1 include:_spf.mx...     Auto
```

### 9. Google OAuth Setup

#### Google Cloud Console
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Configure authorized redirect URIs:
  - `https://your-project.supabase.co/auth/v1/callback`
  - `http://localhost:5173/auth/callback` (for local dev)
- [ ] Copy Client ID and Client Secret
- [ ] Add to Supabase Auth > Providers > Google

### 10. M-Pesa Production Setup

#### Safaricom Daraja Portal
- [ ] Register for Daraja production account
- [ ] Create app for production
- [ ] Get production credentials:
  - Consumer Key
  - Consumer Secret
  - Passkey (from Safaricom support)
- [ ] Register callback URL:
  - `https://your-project.supabase.co/functions/v1/subscription-mpesa-callback`
- [ ] Test with small amount
- [ ] Go live

### 11. PayPal Production Setup

#### PayPal Developer Portal
- [ ] Switch to live environment
- [ ] Create live app
- [ ] Get production credentials:
  - Client ID
  - Client Secret
- [ ] Configure webhooks:
  - Webhook URL: `https://your-project.supabase.co/functions/v1/subscription-paypal-webhook`
  - Events: CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED
- [ ] Verify webhook signature
- [ ] Test with small transaction

### 12. Monitoring & Alerts

#### Supabase Dashboard
- [ ] Set up email alerts for:
  - Database errors
  - High memory usage
  - Function failures
  
#### External Monitoring
- [ ] Set up UptimeRobot or similar:
  - Monitor: `https://lipasasa.online`
  - Monitor: `https://lipasasa.online/status`
  - Monitor: API endpoints
- [ ] Configure alert contacts

#### Health Check Automation
- [ ] Set up cron job to call health-check function every 5 minutes:
  ```
  */5 * * * * curl -X POST https://your-project.supabase.co/functions/v1/health-check
  ```
- [ ] Or use Vercel Cron Jobs or GitHub Actions

### 13. SEO Configuration

- [ ] Submit sitemap to Google Search Console:
  - `https://lipasasa.online/sitemap.xml`
- [ ] Verify domain ownership
- [ ] Submit to Bing Webmaster Tools
- [ ] Check robots.txt is accessible:
  - `https://lipasasa.online/robots.txt`
- [ ] Test with Google Rich Results Test
- [ ] Add Google Analytics (optional)

### 14. Testing Checklist

#### Authentication
- [ ] Google OAuth sign-in works
- [ ] Email/password sign-in works
- [ ] OTP verification email is received
- [ ] OTP verification works
- [ ] Resend OTP works with cooldown
- [ ] Password reset works
- [ ] Session persistence works

#### Payments
- [ ] M-Pesa STK Push initiates correctly
- [ ] M-Pesa callback updates subscription status
- [ ] PayPal order creation works
- [ ] PayPal webhook receives events
- [ ] Subscription activation updates user plan
- [ ] Transaction records are created

#### Admin Features
- [ ] Admin can access `/admin` dashboard
- [ ] Admin can view user list
- [ ] Admin can search users
- [ ] Admin can access `/admin/financial-settings`
- [ ] Admin can save payment credentials
- [ ] Non-admin users cannot access admin routes

#### System Status
- [ ] Health check function runs
- [ ] Status page displays real data
- [ ] Services show correct status
- [ ] Response times are displayed
- [ ] Incidents display correctly (if any)

#### API Documentation
- [ ] Documentation page loads
- [ ] Code examples are readable
- [ ] Copy-to-clipboard works
- [ ] Navigation sidebar works
- [ ] All sections are accessible

#### Mobile Responsiveness
- [ ] Navigation menu works on mobile
- [ ] All pages are readable on mobile
- [ ] Forms are usable on mobile
- [ ] Tables are scrollable
- [ ] Images load correctly

### 15. Security Audit

- [ ] All API routes require authentication
- [ ] Admin routes check for admin role
- [ ] RLS policies prevent unauthorized data access
- [ ] API keys are not exposed in client code
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (React default escaping)
- [ ] CSRF protection (Supabase handles this)

### 16. Performance Optimization

- [ ] Enable Vercel Edge Network
- [ ] Configure caching headers
- [ ] Optimize images (already using lazy loading)
- [ ] Minify JavaScript (Vite handles this)
- [ ] Enable Brotli compression
- [ ] Test with Google PageSpeed Insights (target: >90)
- [ ] Test with GTmetrix

### 17. Backup & Recovery

- [ ] Enable Supabase automatic backups
- [ ] Document recovery procedures
- [ ] Test database restore process
- [ ] Export critical data regularly
- [ ] Store backups in separate location

### 18. Legal & Compliance

- [ ] Review Terms of Service
- [ ] Review Privacy Policy
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Ensure PCI DSS compliance for payment handling
- [ ] Add cookie consent (if not already present)
- [ ] Document data retention policy

### 19. Documentation

- [ ] Update README.md with production info
- [ ] Document environment setup
- [ ] Document deployment process
- [ ] Document admin procedures
- [ ] Create runbook for common issues
- [ ] Document API changes

### 20. Launch Communications

- [ ] Announce on social media
- [ ] Email existing users (if any)
- [ ] Update marketing materials
- [ ] Press release (optional)
- [ ] Product Hunt launch (optional)

---

## Post-Deployment Monitoring (First 48 Hours)

### Hour 1-4: Critical Monitoring
- [ ] Monitor error logs every 15 minutes
- [ ] Check system status page
- [ ] Test critical user flows
- [ ] Monitor payment transactions
- [ ] Check email delivery

### Hour 4-24: Active Monitoring
- [ ] Monitor error logs every hour
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Review user feedback
- [ ] Check social media mentions

### Hour 24-48: Routine Monitoring
- [ ] Monitor error logs every 4 hours
- [ ] Review analytics
- [ ] Check conversion rates
- [ ] Monitor payment success rates
- [ ] Review support tickets

---

## Rollback Plan

If critical issues are detected:

1. **Immediate Actions**:
   - Put up maintenance page
   - Disable new signups temporarily
   - Disable payment processing if needed

2. **Database Rollback**:
   ```sql
   -- Restore from latest backup
   -- Contact Supabase support if needed
   ```

3. **Frontend Rollback**:
   ```bash
   # In Vercel Dashboard
   # Go to Deployments
   # Click on previous working deployment
   # Click "Promote to Production"
   ```

4. **Edge Functions Rollback**:
   ```bash
   # Re-deploy previous version
   supabase functions deploy function-name --version previous
   ```

5. **Communication**:
   - Update status page
   - Email affected users
   - Post on social media
   - Provide ETA for resolution

---

## Support Contacts

- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **Safaricom Daraja**: apicare@safaricom.co.ke
- **PayPal Support**: developer.paypal.com/support

---

## Final Checklist Before Go-Live

- [ ] All items above completed
- [ ] Backup created
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Support ready
- [ ] Marketing materials ready
- [ ] Rollback plan tested

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Sign Off**: _______________

---

## Quick Command Reference

```bash
# Deploy all functions
supabase functions deploy subscription-mpesa
supabase functions deploy subscription-mpesa-callback
supabase functions deploy subscription-paypal
supabase functions deploy subscription-paypal-webhook
supabase functions deploy send-email-otp
supabase functions deploy verify-email-otp
supabase functions deploy health-check

# Deploy frontend
vercel --prod

# Check function logs
supabase functions logs function-name --project-ref your-ref

# Database migrations
supabase db push

# Link to project
supabase link --project-ref your-ref
```

Good luck with your deployment! 🚀

