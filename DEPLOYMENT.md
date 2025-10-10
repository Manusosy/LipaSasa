# LipaSasa Deployment & Testing Guide

## 📋 Pre-Deployment Checklist

### 1. Database Verification

Verify all migrations are applied via Supabase dashboard or MCP:

```bash
# Check tables exist
✅ payment_links
✅ payment_methods (with bank_name, bank_account_number)
✅ transactions (with link_id)
✅ profiles
✅ invoices
✅ api_keys
✅ subscriptions
```

### 2. Environment Variables

Add these to your Supabase project settings → Edge Functions:

```bash
# Required for aggregator integration
AGGREGATOR_API_URL=https://api.lipia.online/v1
AGGREGATOR_API_KEY=your_key_here
AGGREGATOR_API_SECRET=your_secret_here

# Already set (verify)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy Edge Functions

From your terminal in the project root:

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-id

# Deploy payment link functions
npx supabase functions deploy payment-link-stk
npx supabase functions deploy payment-link-callback

# Verify deployment
npx supabase functions list
```

### 4. Build & Deploy Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to your hosting (Vercel/Netlify/etc)
# Example for Vercel:
npx vercel --prod
```

---

## 🧪 Testing Guide

### Test 1: Configure Payment Methods

1. **Login to Dashboard**: Navigate to `/auth` and sign in
2. **Go to Payment Methods**: Click "Payment Methods" in sidebar
3. **Configure M-Pesa Paybill**:
   - Enter: `123456`
   - Click "Save Paybill"
   - Verify green "Active" badge appears
4. **Configure Bank Account**:
   - Select "Equity Bank" from dropdown
   - Enter account number: `1234567890`
   - Click "Save Bank Details"
   - Verify green "Active" badge appears
5. **Success Criteria**: 
   - ✅ Both methods show "Active" status
   - ✅ Toast notifications appear on save
   - ✅ Page is responsive on mobile

### Test 2: Create Payment Link

1. **Go to Payment Links**: Click "Payment Links" in sidebar
2. **Click "Create Link"**:
   - If no methods configured, should show alert
   - Should redirect to Payment Methods page
3. **Create Link** (after methods configured):
   - Title: "Test Payment"
   - Description: "Testing payment link"
   - Method: Select "Equity Bank (1234567890)"
   - Minimum Amount: 100
   - Currency: KSH
   - Click "Create Link"
4. **Verify**:
   - Link appears in list
   - Shows correct method badge
   - Shows currency
5. **Copy Link**:
   - Click "Copy Link" button
   - Should show toast "Payment link copied"
6. **Success Criteria**:
   - ✅ Link created successfully
   - ✅ URL format: `https://your-domain.com/pay/link/pl_xxxxxxx`

### Test 3: Public Payment Page

1. **Open Payment Link**: Paste copied URL in incognito/private window
2. **Verify Page Loads**:
   - Shows payment link title and description
   - Shows payment method badge
   - Shows minimum amount
   - Shows security notice
3. **Test Form Validation**:
   - Try amount below minimum → Should show error
   - Try invalid phone (e.g., "123") → Should show error
   - Try valid phone (e.g., "254712345678") → Should accept
4. **Success Criteria**:
   - ✅ Page loads without authentication
   - ✅ Branding displays correctly
   - ✅ Form validation works
   - ✅ Mobile responsive

### Test 4: STK Push Flow (Sandbox)

**Prerequisites**: 
- Aggregator API credentials configured
- Phone number registered for Safaricom Sandbox

1. **Initiate Payment**:
   - Enter amount: 100
   - Enter phone: 254712345678 (use your sandbox number)
   - Click "Pay Now"
2. **Check Edge Function Logs**:
   ```bash
   npx supabase functions logs payment-link-stk
   ```
3. **Verify Database**:
   - Check Supabase dashboard → Table Editor → transactions
   - Should see new row with:
     - `status`: 'pending'
     - `link_id`: matching your payment link
     - `phone_number`: formatted correctly
     - `transaction_ref`: checkout request ID
4. **Check Phone**: 
   - Should receive STK Push prompt (sandbox may take 30-60s)
   - Enter PIN (sandbox PIN: 1234)
5. **Verify Callback**:
   ```bash
   npx supabase functions logs payment-link-callback
   ```
6. **Check Database Again**:
   - Transaction should update to:
     - `status`: 'completed'
     - `mpesa_receipt_number`: filled
     - `result_code`: '0'
7. **Success Criteria**:
   - ✅ STK Push received on phone
   - ✅ Transaction created in database
   - ✅ Callback updates transaction
   - ✅ No errors in Edge Function logs

### Test 5: Responsive Design

Test all dashboard pages on different screen sizes:

**Pages to test:**
- ✅ Dashboard overview
- ✅ Invoices
- ✅ Payment Links
- ✅ Transactions
- ✅ Payment Methods
- ✅ API & Integrations
- ✅ Subscription
- ✅ Settings

**Screen sizes:**
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

**Verify:**
- Mobile menu hamburger appears on small screens
- Sidebar collapses correctly
- Tables are scrollable on mobile
- Form inputs stack vertically on mobile
- Buttons are touch-friendly (min 44px height)

---

## 🐛 Troubleshooting

### Payment Link Returns 404

**Symptoms**: Payment page shows "Link Not Found"

**Solutions**:
1. Check database → payment_links table
2. Verify `link_slug` matches URL
3. Check `status` = 'active'
4. Check RLS policies allow public read

### STK Push Fails

**Symptoms**: Error "Failed to initiate payment"

**Solutions**:
1. Check Edge Function logs for specific error
2. Verify aggregator API credentials are correct
3. Check phone number format (254XXXXXXXXX)
4. Verify amount is integer (no decimals for M-Pesa)
5. Check aggregator API is reachable (not blocked by firewall)

### Callback Not Received

**Symptoms**: Transaction stays in 'pending' status

**Solutions**:
1. Verify callback URL is publicly accessible
2. Check aggregator dashboard for callback delivery status
3. Check Edge Function logs for callback errors
4. Verify transaction_ref matches in database

### Mobile Menu Not Opening

**Symptoms**: Hamburger icon doesn't show sidebar

**Solutions**:
1. Check `mobileMenuOpen` state is defined
2. Verify mobile overlay div exists
3. Check z-index values (overlay: 30, sidebar: 40)
4. Clear browser cache

---

## 📊 Monitoring

### Key Metrics to Track

1. **Payment Success Rate**:
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) as success_rate
   FROM transactions
   WHERE created_at > NOW() - INTERVAL '24 hours';
   ```

2. **Average Payment Time**:
   ```sql
   SELECT 
     AVG(updated_at - created_at) as avg_time
   FROM transactions
   WHERE status = 'completed'
   AND created_at > NOW() - INTERVAL '24 hours';
   ```

3. **Failed Payments by Error**:
   ```sql
   SELECT 
     result_code,
     result_desc,
     COUNT(*) as count
   FROM transactions
   WHERE status = 'failed'
   GROUP BY result_code, result_desc
   ORDER BY count DESC;
   ```

### Supabase Dashboard Checks

- **Database → Table Editor**: Check for new transactions
- **Edge Functions → Logs**: Monitor for errors
- **Auth → Users**: Verify merchant signups
- **Storage**: Check if logo uploads work (if implemented)

---

## 🚀 Go-Live Checklist

### Before Launch

- [ ] All tests passing (see above)
- [ ] Production aggregator credentials configured
- [ ] Edge Functions deployed and tested
- [ ] Database migrations applied
- [ ] Frontend deployed to production domain
- [ ] SSL certificate verified
- [ ] DNS configured correctly
- [ ] Analytics tracking added
- [ ] Error monitoring configured (Sentry/etc)
- [ ] Support email configured
- [ ] Terms of Service & Privacy Policy updated
- [ ] Contact page functional

### Launch Day

- [ ] Monitor Edge Function logs for first hour
- [ ] Test one real payment with small amount
- [ ] Verify callback received
- [ ] Check database transaction records
- [ ] Test from different devices/browsers
- [ ] Monitor error rates
- [ ] Announce to beta testers

### Post-Launch (Week 1)

- [ ] Daily monitoring of success rates
- [ ] Review failed payment reasons
- [ ] Gather user feedback
- [ ] Fix any reported bugs
- [ ] Optimize slow queries
- [ ] Add missing documentation
- [ ] Plan feature improvements

---

## 📞 Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Aggregator Support**: [Your aggregator's support contact]
- **Developer**: [Your contact info]

---

## 🔐 Security Notes

### API Keys

- Never commit `.env` files to git
- Rotate API keys every 90 days
- Use different keys for staging/production
- Monitor API key usage for anomalies

### Database Security

- RLS policies enabled on all tables
- Service role key kept secret
- Regular backups configured
- Audit logs reviewed weekly

### Payment Security

- Never log sensitive payment data (PINs, card numbers)
- Use HTTPS only in production
- Validate all inputs server-side
- Rate limit payment endpoints
- Monitor for fraud patterns

---

**Last Updated**: October 9, 2025
**Version**: 1.0.0
**Status**: Ready for Testing

