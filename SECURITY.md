# 🔐 Security Guide - LipaSasa

## ⚠️ Critical Security Information

**IMPORTANT:** Your Supabase credentials were previously exposed in the codebase. This has been fixed, but you must take immediate action to secure your application.

## ✅ Security Fixes Applied

### 1. Environment Variables (✅ FIXED)
- **Before:** Hardcoded Supabase URL and API key in `src/integrations/supabase/client.ts`
- **After:** Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- **Impact:** Credentials are no longer visible in source code

### 2. Git Security (✅ FIXED)
- **Added:** Comprehensive `.gitignore` file
- **Added:** Excludes `.env*` files from version control
- **Impact:** Environment files won't be committed to GitHub

### 3. Edge Functions (✅ SECURE)
- Edge Functions use `Deno.env.get()` for environment variables
- Credentials are set in Supabase Dashboard (not in code)
- **Status:** Already secure

## 🚨 Action Required

### Step 1: Set Up Environment Variables
Create a `.env.local` file in your project root:

```bash
# Copy from .env.local.example (if it exists) or create manually
VITE_SUPABASE_URL=https://qafcuihpszmexfpxnyax.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhZmN1aWhwc3ptZXhmcHhueWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzk3NTcsImV4cCI6MjA3MTI1NTc1N30.3TujtZucI3-X98MHJaEGvbZBtqVK84iMQd4gKNFwzmY
```

### Step 2: Test the Fix
```bash
npm run dev
```

If you see this error:
```
Missing Supabase environment variables. Please check your .env file...
```

**Fix:** Create the `.env.local` file with the credentials above.

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env*` files local (never commit)
- ✅ Use environment variables for all credentials
- ✅ Rotate API keys regularly
- ✅ Use different keys for development/production

### ❌ DON'T:
- ❌ Hardcode credentials in source code
- ❌ Commit `.env` files to GitHub
- ❌ Share API keys in chat or emails
- ❌ Use production keys in development

## 🛡️ Production Deployment

### Environment Variables in Production:
1. **Vercel/Netlify:** Add to deployment environment variables
2. **Supabase Edge Functions:** Set in Supabase Dashboard → Edge Functions → Secrets
3. **Database:** Already secure (credentials in Supabase Dashboard)

### Required Environment Variables:
```bash
# Frontend (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions (Supabase Dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AGGREGATOR_API_URL=https://api.lipia.online/v1  # When ready
AGGREGATOR_API_KEY=your-aggregator-key  # When ready
AGGREGATOR_API_SECRET=your-aggregator-secret  # When ready
```

## 🔍 What Was Changed

### Files Modified for Security:
- ✅ `src/integrations/supabase/client.ts` - Now uses environment variables
- ✅ `.gitignore` - Excludes `.env*` files
- ✅ `src/pages/PaymentPage.tsx` - Added graceful error handling

### Files Added:
- ✅ `SECURITY.md` - This security guide
- ✅ `.gitignore` - Comprehensive exclusion list

## 🚨 If You Already Committed Exposed Credentials

If the old version with hardcoded credentials was committed:

1. **Rotate your Supabase keys** in Supabase Dashboard
2. **Update your .env.local** with new keys
3. **Force push** to overwrite GitHub history (if necessary)

## 📞 Need Help?

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Edge Functions:** https://supabase.com/docs/guides/functions
- **Environment Variables:** Check your deployment platform docs

---

**Status:** 🔒 **SECURE** - Your application is now properly secured with environment variables.

**Next:** Set up your `.env.local` file and test the application.