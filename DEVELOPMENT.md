# LipaSasa Development Guide

This document explains the updated no-custody architecture, current implementation status, and the next steps for delivering a complete payment aggregator platform.

## Overview

- **No custody:** LipaSasa never holds merchant funds. Payments go directly to merchant destinations (M-Pesa Paybill/Till or Bank).
- **Revenue model:** Subscription-based SaaS only.
- **Core features:** Payment Methods (destination config), Invoices, Payment Links, Real-time STK status, Webhooks, Merchant APIs.
- **Target market:** East Africa (Kenya, Uganda, Tanzania, Rwanda)

Reference: [Lipia Online Documentation](https://lipia-online-docs.vercel.app/)

---

## ✅ Completed Implementation

### Database Schema

**Applied via MCP:**
- ✅ `payment_links` table created with:
  - `method_type` (mpesa_paybill/mpesa_till/bank)
  - `method_value` (settlement destination)
  - `min_amount`, `currency`, `link_slug`, `status`
  - Full RLS policies for user isolation
- ✅ `transactions.link_id` foreign key added for payment link tracking
- ✅ `payment_methods` extended with:
  - `bank_name` (Kenyan banks dropdown)
  - `bank_account_number`

### Frontend Dashboard (All Responsive)

**Payment Methods (`dashboard/PaymentMethods.tsx`):**
- ✅ Configure M-Pesa Paybill with number input
- ✅ Configure M-Pesa Till with number input
- ✅ Configure Airtel Money
- ✅ Configure Bank Account with:
  - Kenya banks dropdown (Equity, KCB, NCBA, Co-op, ABSA, Stanbic, DTB, etc.)
  - Account number input
- ✅ Enable/disable card payments toggle
- ✅ Validation and save functionality
- ✅ Active/Inactive status badges

**Payment Links (`dashboard/PaymentLinks.tsx`):**
- ✅ List all payment links
- ✅ Create new payment link dialog:
  - Validates that at least one payment method is configured
  - Only shows configured methods in dropdown
  - Link title, description, minimum amount, currency
  - Auto-generates shareable slug
- ✅ Copy link to clipboard functionality
- ✅ Links use format: `/pay/link/{slug}`

**Other Dashboard Pages:**
- ✅ All pages now mobile-responsive with:
  - Mobile menu hamburger icon
  - Mobile overlay
  - Responsive padding (`p-4 lg:p-6`)
  - Responsive text sizes (`text-lg lg:text-xl`)
- ✅ Pages verified: Dashboard, Invoices, Transactions, API & Integrations, Subscription, Settings

### Public Payment Page

**Payment Page (`PaymentPage.tsx`):**
- ✅ Accessible at `/pay/link/:slug`
- ✅ Fetches payment link details from Supabase
- ✅ Beautiful gradient UI with logo/branding support
- ✅ Payment form with:
  - Amount input (validates against minimum)
  - Phone number input (East African formats)
  - Payment method badge display
  - Bank transfer details for bank links
- ✅ STK Push initiation via Edge Function
- ✅ Success state with instructions
- ✅ Security notice and "Powered by LipaSasa" footer
- ✅ Error handling and validation

### Edge Functions (Aggregator Model)

**Payment Link STK Push (`payment-link-stk`):**
- ✅ Public-facing function (no auth required)
- ✅ Validates payment link, amount, phone number
- ✅ Formats East African phone numbers (254, 255, 256, 250)
- ✅ Prepared for aggregator API integration:
  - Placeholder for Lipia Online or custom aggregator
  - Callback URL configuration
  - Settlement destination mapping
- ✅ Records transaction in database with `link_id`

**Payment Link Callback (`payment-link-callback`):**
- ✅ Receives callbacks from aggregator
- ✅ Finds transaction by `checkout_request_id`
- ✅ Updates transaction status (completed/failed)
- ✅ Stores M-Pesa receipt number
- ✅ Prepared for merchant webhook delivery

---

## 🚧 Next Steps (Priority Order)

### 1. Aggregator Integration (CRITICAL)

**Action Items:**
- [ ] Choose aggregator provider:
  - Option A: Lipia Online
  - Option B: Custom Safaricom Daraja wrapper
  - Option C: Other East African aggregator
- [ ] Add environment variables to Supabase:
  ```bash
  AGGREGATOR_API_URL=https://api.lipia.online/v1
  AGGREGATOR_API_KEY=your_key_here
  AGGREGATOR_API_SECRET=your_secret_here
  ```
- [ ] Uncomment aggregator API call in `payment-link-stk/index.ts`
- [ ] Update callback handler to match aggregator payload format
- [ ] Test with sandbox/test credentials

**Files to modify:**
- `supabase/functions/payment-link-stk/index.ts` (lines 103-128)
- `supabase/functions/payment-link-callback/index.ts` (payload parsing)

### 2. Merchant API Endpoints

**Create new Edge Functions:**
- [ ] `api/v1/stk-push` - Initiate STK Push (authenticated)
- [ ] `api/v1/invoices` - Create invoice with payment link
- [ ] `api/v1/transactions/:id` - Get transaction status
- [ ] `api/v1/webhooks` - Register webhook URL

**Authentication:**
- [ ] Implement API key authentication using `api_keys` table
- [ ] Add `X-API-Key` and `X-API-Secret` header validation
- [ ] Add `Idempotency-Key` support for retries

**Rate Limiting:**
- [ ] Implement basic rate limiting (e.g., 100 requests/minute per API key)
- [ ] Store rate limit counters in Supabase or Redis

### 3. Webhook System

**Merchant Webhooks:**
- [ ] Add `webhooks` table:
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
- [ ] Implement HMAC-SHA256 signature for webhook security
- [ ] Add retry logic (3 attempts with exponential backoff)
- [ ] Create webhook delivery log table for debugging

### 4. Security Hardening

**Critical Items:**
- [ ] Add request validation middleware
- [ ] Implement CORS properly (whitelist domains in production)
- [ ] Add request logging for audit trail
- [ ] Implement brute force protection on payment endpoints
- [ ] Add transaction amount limits per merchant tier
- [ ] Validate phone numbers against known carrier ranges

### 5. Public API Documentation

**Create documentation page:**
- [ ] Authentication guide
- [ ] STK Push API reference
- [ ] Invoice creation API reference
- [ ] Transaction status API reference
- [ ] Webhook setup guide
- [ ] Code examples (Node.js, Python, PHP, cURL)
- [ ] Postman collection

**Files to create:**
- `src/pages/docs/api/authentication.tsx`
- `src/pages/docs/api/stk-push.tsx`
- `src/pages/docs/api/invoices.tsx`
- `src/pages/docs/api/webhooks.tsx`

### 6. Testing & QA

**End-to-End Testing:**
- [ ] Test payment link creation flow
- [ ] Test public payment page with various amounts
- [ ] Test phone number formats (254, 255, 256, 250)
- [ ] Test STK Push in sandbox
- [ ] Test callback handling (success & failure scenarios)
- [ ] Test multi-currency support (KSH, UGX, TZS, RWF)

**Error Scenarios:**
- [ ] Expired/deleted payment links
- [ ] Amount below minimum
- [ ] Invalid phone numbers
- [ ] Network timeouts
- [ ] Duplicate transactions (idempotency)

---

## 🗂️ File Structure

```
LipaSasa/
├── src/
│   ├── pages/
│   │   ├── dashboard/
│   │   │   ├── PaymentMethods.tsx         ✅ Bank + M-Pesa config
│   │   │   ├── PaymentLinks.tsx           ✅ Create/manage links
│   │   │   ├── SellerDashboard.tsx        ✅ Responsive
│   │   │   ├── Invoices.tsx               ✅ Responsive
│   │   │   ├── Transactions.tsx           ✅ Responsive
│   │   │   ├── ApiIntegrations.tsx        ✅ Responsive
│   │   │   ├── Subscription.tsx           ✅ Responsive
│   │   │   └── Settings.tsx               ✅ Responsive
│   │   └── PaymentPage.tsx                ✅ Public payment UI
│   └── App.tsx                            ✅ Routes updated
├── supabase/
│   ├── functions/
│   │   ├── payment-link-stk/              ✅ Aggregator STK Push
│   │   ├── payment-link-callback/         ✅ Callback handler
│   │   ├── mpesa-stk-push/                🚧 Legacy (to be deprecated)
│   │   └── mpesa-callback/                🚧 Legacy (to be deprecated)
│   └── migrations/
│       └── 20251009121500_payment_links_and_bank.sql  ✅ Applied via MCP
├── DEVELOPMENT.md                         ✅ This file
└── README.md                              ✅ Updated for no-custody model
```

---

## 🚀 Deployment Checklist

### Environment Variables (Supabase Dashboard)

```bash
# Aggregator API
AGGREGATOR_API_URL=https://api.lipia.online/v1
AGGREGATOR_API_KEY=your_production_key
AGGREGATOR_API_SECRET=your_production_secret

# Edge Function URLs
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database

- [x] Payment links table created
- [x] Payment methods extended with bank fields
- [x] Transactions linked to payment links
- [ ] Webhooks table created
- [ ] Indexes optimized for common queries

### Edge Functions

- [ ] Deploy `payment-link-stk`
- [ ] Deploy `payment-link-callback`
- [ ] Deploy merchant API functions
- [ ] Configure function secrets

### Frontend

- [x] Payment page responsive
- [x] All dashboard pages responsive
- [ ] Error boundaries added
- [ ] Loading states optimized
- [ ] Analytics tracking added

### Security

- [ ] API key authentication live
- [ ] Rate limiting enabled
- [ ] Webhook signatures verified
- [ ] CORS configured for production domain
- [ ] SSL certificates verified

### Monitoring

- [ ] Supabase logs configured
- [ ] Error tracking (Sentry/similar)
- [ ] Uptime monitoring
- [ ] Transaction success rate dashboard

---

## 📞 Support & Resources

- **Lipia Online Docs:** https://lipia-online-docs.vercel.app/
- **Safaricom Daraja:** https://developer.safaricom.co.ke/
- **Supabase Docs:** https://supabase.com/docs
- **East African Mobile Money:**
  - Kenya: Safaricom M-Pesa, Airtel Money
  - Uganda: MTN Mobile Money, Airtel Money
  - Tanzania: Vodacom M-Pesa, Airtel Money, Tigo Pesa
  - Rwanda: MTN Mobile Money, Airtel Money

---

## 🎯 Success Metrics

**MVP Goals:**
- Merchants can create payment links in < 2 minutes
- Payment success rate > 95%
- STK Push delivery < 5 seconds
- Zero custody transactions (direct settlement)
- Support for 3+ East African countries

---

**Last Updated:** October 9, 2025
