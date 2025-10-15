# LipaSasa Vercel Deployment Guide

## Required Environment Variables for Vercel

When deploying to Vercel, you need to configure the following environment variables in your Vercel project settings:

### 1. Supabase Configuration

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get these values:**
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the Project URL → Use as `VITE_SUPABASE_URL`
5. Copy the `anon` `public` key → Use as `VITE_SUPABASE_ANON_KEY`

---

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes to Git:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add each variable from above
   - Make sure to select all environments (Production, Preview, Development)

5. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

---

## Post-Deployment Checklist

### Supabase Configuration

1. **Update Auth Redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Site URL": `https://your-app.vercel.app`
   - Add to "Redirect URLs":
     - `https://your-app.vercel.app/dashboard`
     - `https://your-app.vercel.app/admin`
     - `https://your-app.vercel.app/auth/callback`

2. **Edge Functions are already deployed** ✅
   All payment Edge Functions are live on Supabase and ready to use.

3. **Database Migrations are applied** ✅
   All schema changes have been applied.

---

## Testing Your Deployment

### 1. Test Public Pages
- Visit `https://your-app.vercel.app`
- Verify homepage loads
- Check pricing page
- Test navigation

### 2. Test Merchant Signup
- Go to `/auth` or click "Get Started"
- Create a test merchant account
- Verify email works
- Check dashboard access

### 3. Test Admin Portal
- Go to `/admin/auth`
- Sign in with admin account (`@kazinikazi.co.ke` email)
- Verify all admin pages:
  - Dashboard
  - Users Management
  - Pricing Management
  - Subscriptions
  - Analytics
  - Transactions
  - Notifications
  - Settings

### 4. Test Payment Flow
- As merchant: Create an invoice
- Configure M-Pesa credentials (Payment Methods → M-Pesa Daraja Setup)
- Share payment link
- Test STK Push payment

---

## Important Security Notes

### Production Checklist

1. **Never commit `.env` files** - Already in .gitignore ✅
2. **Use environment variables** - Configured in Vercel ✅
3. **Enable RLS on all tables** - Already enabled ✅
4. **Use HTTPS only** - Vercel provides free SSL ✅
5. **Regular backups** - Enable Supabase backups

### Admin Access

- Only emails ending with `@kazinikazi.co.ke` can create admin accounts
- Change this domain in `src/pages/auth/AdminAuth.tsx` if needed:
  ```typescript
  const ALLOWED_DOMAIN = 'your-company.com';
  ```

---

## Troubleshooting

### Issue: "Invalid API credentials"
**Solution:** Double-check environment variables in Vercel dashboard. Redeploy after updating.

### Issue: Auth redirect not working
**Solution:** Ensure Vercel URL is added to Supabase Auth Redirect URLs.

### Issue: Edge Functions not responding
**Solution:** 
1. Check Supabase Edge Functions logs
2. Verify environment variables are set in Supabase
3. Check CORS settings in Edge Functions

### Issue: Payment not processing
**Solution:**
1. Verify merchant has configured M-Pesa credentials
2. Check Edge Function logs: `supabase functions logs mpesa-stk-push`
3. Ensure M-Pesa sandbox/production credentials are correct

---

## Monitoring & Maintenance

### Vercel Analytics
- Enable Vercel Analytics in project settings for traffic monitoring

### Supabase Dashboard
- Monitor database usage: Dashboard → Database → Usage
- Check Edge Function logs: Edge Functions → Select function → Logs
- View API metrics: Dashboard → API → Logs

### Performance
- Vercel automatically optimizes static assets
- Enable Vercel Analytics for performance insights
- Monitor Core Web Vitals

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase Edge Function logs
3. Check browser console for errors
4. Review this documentation

---

## Quick Commands Reference

```bash
# Build locally to test
npm run build
npm run preview

# Deploy to Vercel
vercel --prod

# Check Supabase functions
supabase functions list

# View function logs
supabase functions logs mpesa-stk-push --follow

# Test locally
npm run dev
```

---

## Environment Variables Summary

Copy this template to your Vercel project:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**That's it!** LipaSasa only needs these 2 environment variables for frontend deployment.

The Supabase project itself has additional secrets (Service Role Key, M-Pesa credentials, PayPal keys) which are managed directly in Supabase Dashboard → Project Settings → Edge Functions → Secrets.

---

## First Admin Account Setup

1. After deployment, go to `/admin/auth`
2. Click "Create Admin Account"
3. Use email ending with `@kazinikazi.co.ke`
4. Complete signup
5. You now have admin access!

To add more admin domains, edit `src/pages/auth/AdminAuth.tsx` and redeploy.

---

**🎉 Your LipaSasa platform is now live!**

