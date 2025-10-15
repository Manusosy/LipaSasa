# ⚠️ M-Pesa Configuration Required for Subscriptions

## Error: "Checkout Failed - Edge Function returned a non-2xx status code"

This error occurs when merchants try to subscribe because **M-Pesa credentials haven't been configured in the Admin Settings**.

---

## 🔧 How to Fix (Admin Only)

### Step 1: Log in as Admin
1. Go to `/admin/auth`
2. Sign in with your admin account (`@kazinikazi.co.ke` email)

### Step 2: Configure M-Pesa Credentials
1. Navigate to **Settings** → **Payment Gateways**
2. Click on the **M-Pesa** tab
3. Fill in your Daraja API credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Shortcode** (Paybill number)
   - **Passkey**
   - **Environment**: Select `Sandbox` for testing or `Production` for live
4. Toggle **Enable M-Pesa** ON
5. Click **Save Settings**

### Step 3: Get M-Pesa Daraja Credentials

#### For Sandbox (Testing):
1. Go to https://developer.safaricom.co.ke
2. Sign up for a developer account
3. Create a new app
4. Copy your credentials:
   - Consumer Key
   - Consumer Secret
   - Test Paybill: `174379`
   - Passkey (provided in sandbox docs)

#### For Production (Live):
1. Contact Safaricom Business Support
2. Apply for Daraja API access
3. Provide your Paybill number
4. Receive your production credentials

---

## ✅ What Happens After Configuration

Once M-Pesa is configured in Admin Settings:

1. **Merchants can subscribe** using M-Pesa STK Push
2. **Subscription Edge Function** reads credentials from `admin_payment_settings` table
3. **Payments are processed** through your configured Paybill
4. **Callbacks update** subscription status automatically

---

## 🔒 Security Note

M-Pesa credentials are stored in the `admin_payment_settings` table with these security measures:

- Only admins can view/edit settings
- Credentials are masked in the UI (show as `••••••••`)
- RLS policies protect the table
- Service Role Key required for Edge Functions to read

**Recommendation for Production:**
- Use Supabase Vault for encryption
- Rotate credentials regularly
- Monitor API usage

---

## 📊 Alternative: Merchant-Specific M-Pesa

If you want each merchant to have their own M-Pesa integration:

1. Enable the `MpesaDarajaSetup` component in `PaymentMethods.tsx`
2. Merchants configure their own Daraja credentials
3. Modify subscription Edge Functions to check merchant's `mpesa_credentials` table first
4. Fall back to admin credentials if merchant hasn't configured their own

---

## 🧪 Testing Subscriptions

After configuring M-Pesa:

1. Log in as a merchant
2. Go to **Subscription** page
3. Select a plan (e.g., Professional)
4. Choose **M-Pesa (Kenya)** as payment method
5. Enter test phone number: `254708374149` (sandbox)
6. Click **Pay**
7. Check console for STK Push prompt (in sandbox, it auto-completes)

---

## ❌ Common Issues

### "M-Pesa payment gateway not configured"
- **Solution**: Admin hasn't enabled M-Pesa in Settings

### "M-Pesa configuration incomplete"
- **Solution**: Missing one or more credentials (Consumer Key, Secret, Shortcode, or Passkey)

### "Failed to authenticate with M-Pesa"
- **Solution**: Invalid Consumer Key/Secret or wrong environment (sandbox vs production)

### "Invalid phone number format"
- **Solution**: Use format `254XXXXXXXXX` (Kenyan numbers only)

---

## 📞 Need Help?

1. Check Supabase Edge Function logs: `supabase functions logs subscription-mpesa`
2. Verify admin settings are saved: Check `admin_payment_settings` table
3. Test M-Pesa OAuth separately: Use Postman to verify credentials work
4. Review Safaricom Daraja documentation

---

**Quick Fix for Now:**

If you just want to test the system without M-Pesa, consider:
- Using PayPal instead (configure PayPal credentials in Admin Settings)
- Or implementing a "free trial" bypass for testing

