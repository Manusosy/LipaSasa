# LipaSasa Development TODO

## ✅ Completed
- [x] Database schema (invoices, transactions, subscriptions, api_keys, mpesa_credentials, payment_methods, profiles)
- [x] Dashboard UI pages (Seller Dashboard, Invoices, Transactions, M-PESA Setup, API Integrations, Subscription, Settings)
- [x] Authentication flow (sign up, login, logout)
- [x] Row Level Security policies
- [x] Dashboard navigation and routing
- [x] Create Invoice Dialog UI

---

## 🚨 PHASE 1: Core M-PESA Payment Integration (CRITICAL - IN PROGRESS)

### 1.1 M-PESA STK Push Edge Function
- [x] Create `supabase/functions/mpesa-stk-push/index.ts`
  - [x] Fetch merchant M-PESA credentials from database
  - [x] Get OAuth token from Safaricom API
  - [x] Generate STK Push password (Base64: shortcode + passkey + timestamp)
  - [x] Send STK Push request to Safaricom
  - [x] Store CheckoutRequestID in transactions table
  - [x] Handle errors (invalid credentials, network issues)
  - [x] Add comprehensive logging

### 1.2 M-PESA Callback Handler
- [x] Create `supabase/functions/mpesa-callback/index.ts`
  - [x] Receive Safaricom callback payload
  - [x] Validate callback signature/authenticity
  - [x] Parse payment result (success/failure)
  - [x] Update invoice status (paid/failed)
  - [x] Update transaction with M-PESA receipt number
  - [x] Handle duplicate callbacks (idempotency)
  - [x] Add error logging

### 1.3 Customer Payment Page
- [x] Create `src/pages/pay/[invoiceId].tsx`
  - [x] Fetch invoice details from database
  - [x] Display invoice information (amount, merchant, description)
  - [x] Phone number input (validate 254 format)
  - [x] "Pay Now" button to trigger STK Push
  - [x] Real-time payment status polling
  - [x] Success/failure UI states
  - [x] Handle expired invoices

### 1.4 Connect M-PESA Setup Test Button
- [x] Update `src/pages/dashboard/MpesaSetup.tsx`
  - [x] Implement `handleTest()` function
  - [x] Call mpesa-stk-push with 1 KES test payment
  - [x] Display test results
  - [x] Show validation errors

### 1.5 Invoice Payment Flow Integration
- [x] Update `src/components/dashboard/CreateInvoiceDialog.tsx`
  - [x] Generate proper payment links
  - [x] Add "Copy Link" and "Send to Customer" buttons
  - [x] Validate payment methods are configured before invoice creation
- [x] Dashboard Payment Methods Section
  - [x] Make setup buttons functional (clickable to open payment methods dialog)
  - [x] Improve UX for payment method configuration
- [x] Notification System
  - [x] Create NotificationBell component
  - [x] Real-time payment notifications
  - [x] Transaction status updates
  - [x] Unread count indicator
- [ ] Update `src/pages/dashboard/Invoices.tsx`
  - [ ] Add "Send Payment Link" action
  - [ ] Show real-time payment status updates

---

## 🔐 PHASE 2: Security Hardening (HIGH PRIORITY)

### 2.1 Encrypt M-PESA Credentials
- [ ] Research Supabase Vault or pgcrypto
- [ ] Implement encryption for mpesa_credentials table
- [ ] Update edge functions to decrypt credentials
- [ ] Migration script for existing data
- **NOTE**: M-PESA credentials should be encrypted using Supabase Vault. This requires manual setup in production.

### 2.2 Admin Roles & Permissions
- [x] Create `app_role` enum (admin, merchant, user)
- [x] Create `user_roles` table with RLS
- [x] Create `has_role()` security definer function
- [x] Update RLS policies to use role checks
- [x] Assign 'merchant' role by default on user signup
- [ ] Seed initial admin user (requires manual SQL: `INSERT INTO user_roles (user_id, role) VALUES ('<admin_user_id>', 'admin')`)

### 2.3 Input Validation
- [x] Add Zod schemas for all forms
- [x] Validate phone numbers (254 format)
- [x] Sanitize user inputs (trim, max length)
- [x] Add validation to CreateInvoiceDialog
- [x] Add validation to MpesaSetup form
- [x] Add validation to payment page
- [ ] Add rate limiting to edge functions (requires Supabase Edge Function rate limiting configuration)

### 2.4 Fix Auth Security Warnings
- [ ] Update OTP expiry settings in Supabase dashboard (https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/auth)
- [ ] Enable leaked password protection (https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/auth)
- [ ] Upgrade Postgres version (https://supabase.com/dashboard/project/qafcuihpszmexfpxnyax/settings/infrastructure)

### 2.5 Webhook Security
- [x] Add request origin logging to mpesa-callback
- [ ] Implement IP whitelist for Safaricom callback IPs (production requirement)
- [ ] Add signature verification for callbacks (optional, Safaricom-specific)

---

## 💳 PHASE 3: Subscription Payment System

### 3.1 Subscription Payment Edge Function
- [ ] Create `supabase/functions/subscription-payment/index.ts`
  - [ ] Use LipaSasa's Paybill/Till (not merchant's)
  - [ ] Calculate pro-rated amounts for mid-month upgrades
  - [ ] Trigger STK Push to merchant's phone
  - [ ] Update profile.selected_plan on success
  - [ ] Create subscription record

### 3.2 Connect Subscription UI
- [ ] Update `src/pages/dashboard/Subscription.tsx`
  - [ ] Implement `handleUpgrade()` function
  - [ ] Show payment status modal
  - [ ] Handle payment failures with retry
  - [ ] Display subscription history

---

## 📊 PHASE 4: Invoice Limits & Enforcement

### 4.1 Invoice Limit Logic
- [ ] Create `get_invoice_count()` database function
- [ ] Update `CreateInvoiceDialog.tsx` to check limits
- [ ] Block creation if limit reached
- [ ] Show upgrade prompt modal

### 4.2 Dashboard Notifications
- [ ] Add notification system component
- [ ] Show warnings at 80%, 90%, 100% of limit
- [ ] Add notification bell to dashboard header

---

## 🔌 PHASE 5: Merchant API Implementation

### 5.1 API Endpoints
- [ ] Create `supabase/functions/api-create-invoice/index.ts`
  - [ ] Verify API key and secret from headers
  - [ ] Check invoice limits
  - [ ] Create invoice
  - [ ] Return invoice with payment link
- [ ] Create `supabase/functions/api-check-payment/index.ts`
  - [ ] Verify API credentials
  - [ ] Return payment status
  - [ ] Return transaction details

### 5.2 API Key Management
- [ ] Update `src/pages/dashboard/ApiIntegrations.tsx`
  - [ ] Implement "Regenerate Keys" button
  - [ ] Update code examples with real endpoints
  - [ ] Add API usage statistics
  - [ ] Show rate limit status

---

## 👨‍💼 PHASE 6: Admin Dashboard

### 6.1 Admin Interface
- [ ] Complete `src/pages/dashboard/AdminDashboard.tsx`
  - [ ] Platform-wide KPIs (revenue, users, transactions)
  - [ ] Charts for daily/weekly/monthly trends
  - [ ] Recent transactions across all merchants
  - [ ] System health indicators

### 6.2 User Management
- [ ] Create admin user management page
  - [ ] List all merchants
  - [ ] View merchant details
  - [ ] Suspend/activate accounts
  - [ ] Reset passwords
  - [ ] View merchant transactions

### 6.3 Subscription Management
- [ ] Admin view of all subscriptions
- [ ] Manually upgrade/downgrade plans
- [ ] Refund/cancel subscriptions
- [ ] View payment history

---

## 📧 PHASE 7: Notifications (Optional Enhancement)

### 7.1 Email Notifications
- [ ] Set up Resend integration
- [ ] Create `supabase/functions/send-invoice-email/index.ts`
- [ ] Email templates (invoice created, payment received, subscription expiring)
- [ ] Add email preferences to settings

### 7.2 SMS Notifications
- [ ] Set up Africa's Talking integration
- [ ] Create `supabase/functions/send-sms/index.ts`
- [ ] SMS for payment links
- [ ] SMS for payment confirmations

### 7.3 WhatsApp Integration
- [ ] Research WhatsApp Business API options
- [ ] Implement payment link sharing via WhatsApp

---

## 🧪 PHASE 8: Testing & Polish

### 8.1 End-to-End Testing
- [ ] Test merchant onboarding flow
- [ ] Test M-PESA setup and credential validation
- [ ] Test invoice creation and payment
- [ ] Test subscription upgrade flow
- [ ] Test API endpoints
- [ ] Test admin dashboard
- [ ] Test error scenarios

### 8.2 Error Handling Improvements
- [ ] Proper error messages for failed payments
- [ ] Retry mechanisms for API calls
- [ ] Graceful fallbacks for network issues
- [ ] User-friendly error pages

### 8.3 Performance Optimization
- [ ] Add loading skeletons
- [ ] Optimize database queries
- [ ] Add proper indexes
- [ ] Implement data pagination
- [ ] Add caching where appropriate

### 8.4 UI/UX Polish
- [ ] Mobile responsiveness testing
- [ ] Dark mode consistency
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Loading states for all actions
- [ ] Success/error toast notifications
- [ ] Consistent error handling

---

## 📝 PHASE 9: Documentation

### 9.1 Developer Documentation
- [ ] API documentation
- [ ] Setup guide for local development
- [ ] M-PESA integration guide
- [ ] Deployment guide

### 9.2 User Documentation
- [ ] Merchant onboarding guide
- [ ] How to get Daraja credentials
- [ ] FAQ section
- [ ] Troubleshooting guide

---

## 🚀 PHASE 10: Production Readiness

### 10.1 Environment Configuration
- [ ] Set up production Supabase project
- [ ] Configure production M-PESA credentials
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### 10.2 Compliance
- [ ] Privacy policy
- [ ] Terms of service
- [ ] GDPR compliance (data export/deletion)
- [ ] PCI compliance review

### 10.3 Launch Checklist
- [ ] Security audit
- [ ] Performance testing
- [ ] Load testing
- [ ] Staging environment testing
- [ ] Production deployment plan
- [ ] Rollback strategy

---

## 📈 Future Enhancements (Backlog)

- [ ] Multi-currency support
- [ ] Airtel Money integration
- [ ] Card payments via Flutterwave/Paystack
- [ ] Recurring invoices/subscriptions
- [ ] Customer portal
- [ ] Invoice templates customization
- [ ] Bulk invoice creation
- [ ] Export reports (PDF, CSV)
- [ ] Mobile app
- [ ] Multi-country expansion

---

**Current Focus**: Phase 1 - M-PESA Payment Integration
**Next Up**: Phase 2 - Security Hardening
