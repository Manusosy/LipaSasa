# 🔑 Environment Variables for Vercel Deployment

## Required Variables (Copy & Paste)

You only need **2 environment variables** for the frontend deployment:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📍 How to Get Your Values

### Step 1: Go to Supabase Dashboard
Visit: https://app.supabase.com

### Step 2: Select Your Project
Click on your LipaSasa project

### Step 3: Navigate to API Settings
**Settings** → **API**

### Step 4: Copy the Values

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `VITE_SUPABASE_URL` | **Project URL** section | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | **Project API keys** → `anon` `public` | Long string starting with `eyJ...` |

---

## 📋 How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to your project on Vercel
2. Click **Settings**
3. Click **Environment Variables**
4. For each variable:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** Paste your value
   - **Environments:** Select **all** (Production, Preview, Development)
   - Click **Add**
5. Repeat for `VITE_SUPABASE_ANON_KEY`
6. **Redeploy** your application

### Method 2: Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
# Paste your value when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your value when prompted
```

---

## 🔒 Important Notes

### ✅ DO:
- Use these exact variable names (they must start with `VITE_`)
- Add to all environments (Production, Preview, Development)
- Keep your anon key safe (but it's designed to be public)
- Redeploy after adding variables

### ❌ DON'T:
- Don't commit these to Git (already in .gitignore)
- Don't use your Service Role Key here (it's only for backend/Edge Functions)
- Don't change the variable names
- Don't skip any environment in Vercel

---

## 🧪 Testing Your Setup

After deployment, test that environment variables are working:

1. Open browser console on your deployed site
2. The app should connect to Supabase
3. You should be able to sign up/sign in
4. Check for any "Supabase client error" messages

If you see connection errors:
- Double-check variable names (must be exactly as shown)
- Verify values are correct (no extra spaces)
- Ensure you redeployed after adding variables

---

## 🎯 Quick Copy Template

```env
# Copy this template and replace with your actual values

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Your Project Ref:** Found in Supabase URL (the random string before `.supabase.co`)

---

## 📦 What About Other Keys?

### Supabase Service Role Key
- **Not needed for frontend deployment** ✅
- Only used in Edge Functions (already configured in Supabase)
- Never expose this publicly

### M-Pesa Credentials
- **Not needed for Vercel** ✅
- Configured by merchants in the dashboard
- Stored securely in Supabase database

### PayPal Credentials
- **Not needed for Vercel** ✅
- Configured by admin in admin settings
- Stored in Supabase `admin_payment_settings` table

### Database Credentials
- **Not needed!** ✅
- Handled automatically by Supabase client

---

## ✅ Checklist

Before deploying, ensure:

- [ ] I have my Supabase Project URL
- [ ] I have my Supabase Anon Key
- [ ] I've added both variables to Vercel
- [ ] I've selected all environments
- [ ] I've redeployed my application
- [ ] I've tested the deployment works

---

**That's it!** Your LipaSasa application only needs these 2 environment variables to run on Vercel.

All other sensitive credentials (M-Pesa, PayPal, Service Role Key) are managed either:
- In Supabase Edge Function Secrets
- In the database (encrypted/secure)
- Configured by users through the dashboard

🚀 **You're ready to deploy!**

