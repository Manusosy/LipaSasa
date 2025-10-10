# Quick Deploy Guide - Edge Functions

## 🚀 Deploy Edge Functions (5 minutes)

Your payment link is working, but the Edge Functions need to be deployed to enable real M-PESA payments.

### Prerequisites
- Supabase CLI installed
- Supabase project linked

### Step 1: Install Supabase CLI (if not installed)

**Windows (PowerShell):**
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
npx supabase login
```

This will open your browser. Login with your Supabase account.

### Step 3: Link Your Project

```bash
npx supabase link --project-ref your-project-id
```

**To find your project ID:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Look at the URL: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID`

### Step 4: Deploy Edge Functions

```bash
# Deploy payment link STK Push function
npx supabase functions deploy payment-link-stk

# Deploy payment link callback function
npx supabase functions deploy payment-link-callback
```

### Step 5: Verify Deployment

```bash
npx supabase functions list
```

You should see:
- ✅ payment-link-stk
- ✅ payment-link-callback

### Step 6: Test Your Payment Link

1. Go to your payment link (e.g., `https://your-domain.com/pay/link/pl_xxxxxxx`)
2. Enter amount and phone number
3. Click "Pay Now"
4. You should now see: **"Payment Initiated"** (instead of the error)

---

## 🔧 Alternative: Test Mode (Current State)

**Good News:** Your payment link UI is fully functional!

The app is currently in **Test Mode**, which means:
- ✅ Payment links work
- ✅ Form validation works
- ✅ UI/UX is complete
- ⚠️ Actual STK Push requires Edge Functions deployed

**What happens now:**
- When you click "Pay Now", you'll see: **"Payment Initiated (Test Mode)"**
- This confirms the UI is working
- Once Edge Functions are deployed, real M-PESA STK Push will work

---

## 📋 What's Next

### For Production:

1. **Deploy Edge Functions** (see steps above)
2. **Add Aggregator Credentials** (Supabase Dashboard → Edge Functions → Secrets):
   ```
   AGGREGATOR_API_URL=https://api.lipia.online/v1
   AGGREGATOR_API_KEY=your_key
   AGGREGATOR_API_SECRET=your_secret
   ```
3. **Update aggregator code** in `payment-link-stk/index.ts` (line 103-128)
4. **Test with real phone number** in sandbox mode

### For Testing (Current):

You can continue testing the UI:
- ✅ Create payment links
- ✅ Configure payment methods
- ✅ Test payment form
- ✅ Verify validation
- ✅ Check responsive design

---

## 🆘 Troubleshooting

### Error: "Supabase CLI not found"
```bash
npm install -g supabase
```

### Error: "Project not linked"
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Function deployment failed"
Check that you're in the project root directory:
```bash
cd C:\Users\ADMIN\Desktop\LIPA\LipaSasa
npx supabase functions deploy payment-link-stk
```

### Still getting errors?
The test mode fallback will work, showing:
- "Payment Initiated (Test Mode)"
- This confirms your UI is working perfectly

---

## 📞 Need Help?

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- Edge Functions Docs: https://supabase.com/docs/guides/functions

---

**Your payment link system is working! Deploy Edge Functions when ready for production.** 🎉

