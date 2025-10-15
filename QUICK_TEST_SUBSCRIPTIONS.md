# Quick Test Guide - Subscriptions & Limits

## 🎯 What You Need to Test Now

### Test 1: Signup Flow (1 min)
```bash
# Steps:
1. Visit /auth/signup
2. Enter business details
3. Click Next
4. Should go straight to Review step (NO plan selection)
5. Complete signup
6. Login to dashboard
7. Check profile: should be on "free" plan
```

**Expected**: 2-step signup, auto-assigned to Free plan

---

### Test 2: Invoice Limit Enforcement (5 mins)
```bash
# Steps:
1. Login as merchant (Free plan)
2. Go to Invoices → Create Invoice (repeat 10 times)
3. Create 11th invoice
4. Should see error toast: "Invoice Limit Reached"
5. After 2 seconds, auto-redirected to /dashboard/subscription
```

**Expected**: 10 invoice limit enforced, upgrade prompt shown

---

### Test 3: M-Pesa Subscription (5 mins)

**Prerequisites**:
- Admin must configure M-Pesa in admin Settings first
- Admin login: `/admin/auth`
- Settings → M-Pesa tab → Enter Daraja credentials → Save → Enable

```bash
# Steps:
1. Login as merchant
2. Go to Subscription page
3. Select "Professional" plan
4. Choose "Monthly" billing
5. Payment method: M-Pesa
6. Enter phone: 254XXXXXXXXX
7. Click "Subscribe"
8. Complete STK Push on phone
9. Wait 30 seconds
10. Page should show "Subscription Activated"
11. Create 11th invoice → Should work now!
```

**Expected**: Plan upgraded, invoice limit removed

**Debug**:
- Check Edge Function logs: `subscription-mpesa` and `subscription-mpesa-callback`
- Check `subscriptions` table: should see new row with `status: 'active'`
- Check `profiles` table: `selected_plan` should be 'professional'

---

### Test 4: PayPal Subscription (5 mins)

**Prerequisites**:
- Admin must configure PayPal in admin Settings first
- Admin login: `/admin/auth`
- Settings → PayPal tab → Enter credentials → Save → Enable

```bash
# Steps:
1. Login as merchant
2. Go to Subscription page
3. Select "Enterprise" plan
4. Choose "Annual" billing (17% discount shown)
5. Payment method: PayPal
6. Click "Subscribe"
7. Redirected to PayPal
8. Login with PayPal sandbox account
9. Complete payment
10. Redirected back to /dashboard/subscription?status=success
11. Verify plan shows "Enterprise"
```

**Expected**: PayPal payment flow works, plan activated

**Debug**:
- Check Edge Function logs: `subscription-paypal` and `subscription-paypal-webhook`
- Check `subscriptions` table: `payment_method: 'paypal'`, `status: 'active'`
- If webhook doesn't fire, manually trigger it via PayPal webhook simulator

---

### Test 5: Payment Link Logo (2 mins)
```bash
# Steps:
1. Login as merchant
2. Go to Payment Links
3. Create new payment link (min amount: 10)
4. Copy link
5. Open in incognito tab
6. Verify LipaSasa logo appears at top (not "T" placeholder)
```

**Expected**: Professional logo displayed

---

## 🔧 Admin Setup (Do This First!)

### Configure PayPal (Required for Test 4)
```
1. Visit /admin/auth
2. Login as admin
3. Go to Settings
4. Click "PayPal" tab
5. Enter:
   - Client ID: <from PayPal Developer Portal>
   - Client Secret: <from PayPal Developer Portal>
   - Mode: "sandbox"
6. Click "Save Settings"
7. Toggle "Enable PayPal" to ON
```

### Configure M-Pesa (Required for Test 3)
```
1. Visit /admin/auth
2. Login as admin
3. Go to Settings
4. Click "M-Pesa" tab
5. Enter:
   - Consumer Key: <from Safaricom Daraja>
   - Consumer Secret: <from Safaricom Daraja>
   - Shortcode: 174379 (sandbox)
   - Passkey: <from Safaricom Daraja>
   - Environment: "sandbox"
6. Click "Save Settings"
7. Toggle "Enable M-Pesa" to ON
```

---

## 🐛 Troubleshooting

### Issue: "Invoice Limit Reached" not showing
**Check**:
```sql
-- In Supabase SQL Editor:
SELECT * FROM pricing_tiers WHERE name = 'free';
-- Verify max_invoices = 10
```

### Issue: Subscription not activating (M-Pesa)
**Check**:
1. Edge Function logs: `subscription-mpesa-callback`
2. Look for errors in callback processing
3. Verify admin M-Pesa settings are saved
4. Check `admin_payment_settings` table:
```sql
SELECT * FROM admin_payment_settings WHERE payment_gateway = 'mpesa';
```

### Issue: PayPal redirect fails
**Check**:
1. Admin PayPal settings saved correctly
2. `subscription-paypal` Edge Function logs
3. PayPal credentials are sandbox credentials (not live)

### Issue: Payment completed but plan not updated
**Check**:
```sql
-- Check subscriptions table:
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;

-- Check if profile updated:
SELECT user_id, selected_plan FROM profiles WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 Expected Database State After Tests

### After Test 2 (Invoice Limit)
```sql
-- Should have 10 invoices:
SELECT COUNT(*) FROM invoices WHERE user_id = 'YOUR_USER_ID';
-- Result: 10
```

### After Test 3 (M-Pesa Subscription)
```sql
-- Active subscription:
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID' AND status = 'active';

-- Plan updated:
SELECT selected_plan FROM profiles WHERE user_id = 'YOUR_USER_ID';
-- Result: "professional"

-- Can create more invoices:
SELECT COUNT(*) FROM invoices WHERE user_id = 'YOUR_USER_ID';
-- Result: 11+ (no limit on Professional plan)
```

### After Test 4 (PayPal Subscription)
```sql
-- PayPal subscription:
SELECT * FROM subscriptions WHERE user_id = 'YOUR_USER_ID' AND payment_method = 'paypal';

-- Plan updated to enterprise:
SELECT selected_plan FROM profiles WHERE user_id = 'YOUR_USER_ID';
-- Result: "enterprise"
```

---

## ✅ Success Criteria

- [ ] Signup doesn't show plan selection screen
- [ ] Free plan users hit 10 invoice limit
- [ ] M-Pesa subscription payment completes
- [ ] Plan activates after M-Pesa payment
- [ ] PayPal payment redirects correctly
- [ ] Plan activates after PayPal payment
- [ ] Payment links show LipaSasa logo
- [ ] No console errors during flows

---

## 🚀 Ready to Deploy

Once all tests pass:
1. Build frontend: `npm run build`
2. Deploy to Vercel/Netlify
3. Update PayPal webhook URL in PayPal Dashboard
4. Switch PayPal/M-Pesa to production mode
5. Test with real payments (small amounts first!)

---

**All systems operational!** 🎉

