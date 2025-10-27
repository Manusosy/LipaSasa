# LipaSasa Development TODO

**Last Updated:** January 27, 2025  
**Status:** Production-Ready Core, Security & API Enhancements Needed

---

## 🚨 CRITICAL - Week 1 (Security & Configuration)

### Security Fixes
- [ ] Fix database functions with mutable search_path (8 functions)
  - `assign_default_merchant_role`
  - `is_user_admin`
  - `is_user_merchant`
  - `update_updated_at_column`
  - `calculate_usd_price`
  - `calculate_annual_price`
  - `update_subscription_status`
  - `expire_subscriptions`
  - **Fix:** Add `SET search_path = public, pg_temp;` to each function

### Auth Configuration (Manual via Supabase Dashboard)
- [ ] Reduce OTP expiry to 10 minutes (currently > 1 hour)
  - Location: Authentication → Email Auth → OTP Expiry
- [ ] Enable leaked password protection (HaveIBeenPwned)
  - Location: Authentication → Policies
- [ ] Upgrade Postgres to latest version
  - Location: Database → Settings → Upgrade

### Admin Setup (Required for Subscriptions)
- [ ] Configure Platform M-Pesa credentials
  - Login at `/admin/auth`
  - Go to Settings → M-Pesa tab
  - Enter Daraja API credentials (Consumer Key, Secret, Shortcode, Passkey)
  - Test connection
  - Enable M-Pesa payments
- [ ] Configure PayPal credentials
  - Go to Settings → PayPal tab
  - Enter Client ID and Client Secret (sandbox first)
  - Set mode to "sandbox"
  - Test subscription flow
  - Switch to "live" for production

### Testing
- [ ] Test subscription payment via M-Pesa
- [ ] Test subscription payment via PayPal
- [ ] Test invoice creation and payment
- [ ] Test payment link creation and payment
- [ ] Verify transaction records in database

---

## 🔧 HIGH PRIORITY - Week 2-3 (API Implementation)

### Merchant API Endpoints
- [ ] Create Edge Function: `api/v1/create-invoice`
  - Input: customer_name, customer_email, amount, description
  - Output: invoice_id, payment_link
  - Auth: API key + secret validation
  - Rate limit: 100 requests/min
- [ ] Create Edge Function: `api/v1/stk-push`
  - Input: phone_number, amount, invoice_id
  - Output: checkout_request_id, transaction_id
  - Auth: API key validation
- [ ] Create Edge Function: `api/v1/transaction-status`
  - Input: transaction_id or checkout_request_id
  - Output: status, amount, mpesa_receipt_number
  - Auth: API key validation
- [ ] Create Edge Function: `api/v1/register-webhook`
  - Input: webhook_url, events[]
  - Output: webhook_id, secret
  - Auth: API key validation

### API Infrastructure
- [ ] Implement API key authentication middleware
  - Validate X-API-Key and X-API-Secret headers
  - Hash API keys before storage (use SHA-256)
  - Show key only once on creation
- [ ] Implement rate limiting
  - Use Supabase or Redis for counter storage
  - Return 429 Too Many Requests when exceeded
- [ ] Add Idempotency-Key support
  - Prevent duplicate transactions
  - Store processed idempotency keys for 24 hours

### API Documentation
- [ ] Create `/docs/api` page with interactive docs
- [ ] Add code examples (Node.js, Python, PHP, cURL)
- [ ] Create Postman collection
- [ ] Document error codes and responses
- [ ] Add webhook setup guide

---

## 🔔 MEDIUM PRIORITY - Week 4 (Webhooks & Notifications)

### Webhook System
- [ ] Create `webhooks` table
  ```sql
  CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    url TEXT NOT NULL,
    secret TEXT NOT NULL,
    events TEXT[] NOT NULL, -- ['payment.success', 'payment.failed']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Implement webhook delivery system
  - Trigger on transaction status change
  - Send POST request to registered webhook URLs
  - Include HMAC-SHA256 signature in headers
- [ ] Add retry logic
  - Retry 3 times with exponential backoff (1s, 5s, 25s)
  - Mark webhook as failed after 3 retries
- [ ] Create webhook delivery log table
  ```sql
  CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY,
    webhook_id UUID REFERENCES webhooks(id),
    event TEXT,
    payload JSONB,
    response_code INT,
    response_body TEXT,
    delivered_at TIMESTAMPTZ,
    error TEXT
  );
  ```

### Email Notifications
- [ ] Configure email provider (Resend or SendGrid)
- [ ] Create email templates
  - Invoice created
  - Payment received
  - Payment failed
  - Subscription expiring (7 days before)
  - Subscription expired
- [ ] Create Edge Function: `send-email`
- [ ] Add email preferences to user settings

### WhatsApp Integration (Optional)
- [ ] Research WhatsApp Business API providers
- [ ] Implement payment link sharing via WhatsApp
- [ ] Add WhatsApp notification preferences

---

## 📊 MEDIUM PRIORITY - Month 2 (Production Readiness)

### Audit & Monitoring
- [ ] Create audit_logs table
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    action TEXT,
    resource TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
  );
  ```
- [ ] Log all admin actions (user suspend, plan change, etc.)
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure uptime monitoring (Pingdom, UptimeRobot)
- [ ] Create transaction success rate dashboard

### Error Handling & UX
- [ ] Add error boundaries to React components
- [ ] Improve loading states across all pages
- [ ] Add retry mechanisms for failed API calls
- [ ] Create user-friendly error pages
- [ ] Add contextual help tooltips

### Performance Optimization
- [ ] Add database indexes for common queries
  - `invoices.user_id`
  - `transactions.user_id`
  - `transactions.invoice_id`
  - `subscriptions.user_id`
- [ ] Implement pagination for large datasets
- [ ] Add caching for frequently accessed data
- [ ] Optimize Edge Function cold starts

### Documentation
- [ ] Create merchant onboarding guide
- [ ] Write "How to get Daraja credentials" tutorial
- [ ] Create FAQ section
- [ ] Write troubleshooting guide
- [ ] Create video tutorials (invoice creation, payment setup)

---

## 🚀 FUTURE ENHANCEMENTS - Month 3+

### Payment Gateway Expansion
- [ ] Integrate Airtel Money
  - STK Push flow
  - Callback handling
- [ ] Add card payments via Flutterwave
  - Hosted checkout page
  - Webhook integration
- [ ] Add card payments via Paystack
  - Alternative to Flutterwave
- [ ] Support Uganda mobile money (MTN, Airtel)
- [ ] Support Tanzania mobile money (Vodacom, Airtel, Tigo)
- [ ] Support Rwanda mobile money (MTN, Airtel)

### Advanced Features
- [ ] Recurring invoices
  - Weekly, Monthly, Quarterly, Annual
  - Auto-send on schedule
- [ ] Invoice templates
  - Custom branding
  - Logo upload
  - Color scheme customization
- [ ] PDF receipt generation
  - Auto-generate on payment success
  - Email to customer
  - Download from dashboard
- [ ] Bulk invoice creation
  - CSV upload
  - Template-based creation
- [ ] Customer portal
  - Customer login
  - View all invoices
  - Payment history
  - Download receipts

### Subscription Management
- [ ] Subscription cancellation flow
  - Cancel at end of billing period
  - Immediate cancellation with refund
- [ ] Auto-renewal reminders
  - Email 7 days before renewal
  - SMS notification
- [ ] Proration for mid-cycle upgrades
  - Calculate prorated refund
  - Charge difference for new plan
- [ ] Usage-based billing
  - Pay per transaction
  - Volume discounts

### Business Intelligence
- [ ] Advanced analytics dashboard
  - Revenue trends
  - Customer acquisition cost
  - Lifetime value
- [ ] Revenue forecasting
  - Predict next month revenue
  - Subscription churn rate
- [ ] Customer segmentation
  - High-value customers
  - At-risk customers
- [ ] Export reports
  - PDF export
  - CSV export
  - Excel export
  - Scheduled reports

### Multi-Country Expansion
- [ ] Add currency support (UGX, TZS, RWF, NGN)
- [ ] Implement real-time currency conversion
- [ ] Add country-specific payment methods
- [ ] Localize UI (Swahili, French)
- [ ] Add country-specific tax handling

### Mobile App
- [ ] React Native app for merchants
  - Create invoices on-the-go
  - View payments in real-time
  - Push notifications
- [ ] Customer mobile app
  - View invoices
  - Make payments
  - Receipt downloads

### Compliance & Security
- [ ] PCI-DSS compliance audit
- [ ] GDPR compliance
  - Data export functionality
  - Data deletion workflow
  - Cookie consent
- [ ] 2FA/MFA authentication
  - SMS-based OTP
  - Authenticator app support
- [ ] IP allowlisting for admin
- [ ] Webhook signature verification (HMAC)
- [ ] API request signing
- [ ] SOC 2 Type II certification

---

## ✅ COMPLETED

### Core Features
- [x] User signup/login (merchant + admin)
- [x] Invoice creation with payment links
- [x] M-Pesa STK Push integration (merchant credentials)
- [x] M-Pesa callback handling
- [x] Payment link creation and sharing
- [x] Payment link STK Push
- [x] Transaction tracking
- [x] Subscription payment via M-Pesa (platform credentials)
- [x] Subscription payment via PayPal
- [x] PayPal webhook handling
- [x] Plan limit enforcement (Free plan = 10 invoices)
- [x] Admin dashboard (users, analytics, reports)
- [x] Merchant dashboard (invoices, transactions, settings)
- [x] API key generation
- [x] Payment method configuration (Paybill/Till/Bank)
- [x] M-Pesa Daraja setup UI
- [x] Notification system (basic)
- [x] Responsive design (mobile-friendly)
- [x] RLS policies for all tables
- [x] Admin domain restriction (@kazinikazi.co.ke)
- [x] Environment support (sandbox/production)

### Infrastructure
- [x] Database schema (17 tables)
- [x] 8 Edge Functions deployed
- [x] Frontend deployed to Vercel
- [x] Backend on Supabase
- [x] 49 shadcn/ui components
- [x] Role-based access control
- [x] Pricing tiers (Free, Professional, Enterprise)

### Documentation
- [x] README.md
- [x] PRD.md
- [x] DEVELOPMENT.md
- [x] SECURITY_AUDIT_REPORT.md
- [x] CODEBASE_COMPREHENSIVE_ANALYSIS.md
- [x] Cleaned up 12 redundant MD files

---

## 📝 Notes

### Current Blockers
1. **Admin must configure M-Pesa** for subscriptions to work
2. **Admin must configure PayPal** for PayPal subscriptions to work
3. **Merchants must configure Daraja credentials** for invoice payments to work

### Known Limitations
- No subscription cancellation flow
- No auto-renewal
- No proration for mid-cycle upgrades
- No merchant API endpoints (keys exist but no functions)
- No webhook delivery system
- No email notifications
- No Airtel Money integration
- Only Kenya (KES) fully supported

### Success Metrics (Track Monthly)
- Active merchants
- Invoices created
- Successful payments
- Paid subscriptions (MRR)
- Payment success rate
- Average STK Push delivery time
- API request volume

---

**Next Review:** After Week 1 security fixes  
**Priority:** Security → API → Webhooks → Features
