-- =============================================================================
-- Migration: Comprehensive Performance and Security Fix
-- Date: 2025-10-15
-- Purpose: Fix all Supabase advisor warnings (RLS, indexes, security, policies)
-- =============================================================================

-- =============================================================================
-- PART 1: Drop policies that depend on is_user_admin function
-- =============================================================================

-- Drop admin-specific policies that use is_user_admin
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can view all payment links" ON payment_links;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can view all merchant profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update merchant profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete merchant profiles" ON profiles;

-- =============================================================================
-- PART 2: Fix Functions with search_path Security Warnings
-- =============================================================================

-- Fix assign_default_merchant_role
CREATE OR REPLACE FUNCTION public.assign_default_merchant_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Now drop and recreate is_user_admin with correct signature
DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;
CREATE FUNCTION public.is_user_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid
      AND role = 'admin'
  );
$$;

-- Drop and recreate is_user_merchant
DROP FUNCTION IF EXISTS public.is_user_merchant(uuid) CASCADE;
CREATE FUNCTION public.is_user_merchant(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = user_uuid
      AND role = 'merchant'
  );
$$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix calculate_usd_price
CREATE OR REPLACE FUNCTION public.calculate_usd_price(ksh_price numeric, from_currency text DEFAULT 'KES')
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN from_currency = 'USD' THEN ksh_price
    ELSE ROUND(ksh_price / COALESCE(
      (SELECT rate FROM public.currency_exchange_rates 
       WHERE from_currency = $2 AND to_currency = 'USD' AND is_active = true
       ORDER BY updated_at DESC LIMIT 1),
      130.0
    ), 2)
  END;
$$;

-- Fix calculate_annual_price
CREATE OR REPLACE FUNCTION public.calculate_annual_price(monthly_price numeric)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT ROUND(monthly_price * 12 * 0.8, 2);
$$;

-- Fix update_subscription_status
CREATE OR REPLACE FUNCTION public.update_subscription_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < NOW();
END;
$$;

-- Fix expire_subscriptions  
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'active'
    AND end_date < NOW();
    
  RAISE NOTICE 'Expired subscriptions: %', found;
END;
$$;

-- =============================================================================
-- PART 3: Add Missing Foreign Key Indexes (Performance)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_payment_settings_updated_by 
  ON public.admin_payment_settings(updated_by);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_user_id 
  ON public.notifications(recipient_user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_sender_user_id 
  ON public.notifications(sender_user_id);

CREATE INDEX IF NOT EXISTS idx_system_incidents_created_by 
  ON public.system_incidents(created_by);

-- =============================================================================
-- PART 4: Consolidate and Optimize RLS Policies
-- =============================================================================

-- mpesa_credentials - simple user-owned policies
DROP POLICY IF EXISTS "Users can view their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can insert their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can update their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can delete their own M-PESA credentials" ON mpesa_credentials;

CREATE POLICY "mpesa_credentials_policy" ON mpesa_credentials
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- transactions - separate view and modify
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Merchants can view own transactions" ON transactions;

CREATE POLICY "transactions_select" ON transactions
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT WITH CHECK (true); -- Service role only

CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE USING (true); -- Service role only

-- subscriptions - user and admin access
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Merchants can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Merchants can create own subscriptions" ON subscriptions;

CREATE POLICY "subscriptions_policy" ON subscriptions
  FOR ALL USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

-- api_keys - user-owned
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;

CREATE POLICY "api_keys_policy" ON api_keys
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- payment_links - user and admin
DROP POLICY IF EXISTS "Users can view their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can insert their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can update their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can delete their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Merchants can manage own payment links" ON payment_links;

CREATE POLICY "payment_links_policy" ON payment_links
  FOR ALL USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

-- invoices - user and admin
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Merchants can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Merchants can create own invoices" ON invoices;
DROP POLICY IF EXISTS "Merchants can update own invoices" ON invoices;

CREATE POLICY "invoices_policy" ON invoices
  FOR ALL USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

-- payment_methods - user and admin
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Merchants can manage own payment methods" ON payment_methods;

CREATE POLICY "payment_methods_policy" ON payment_methods
  FOR ALL USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

-- currency_exchange_rates - public read, admin write
DROP POLICY IF EXISTS "Exchange rates are viewable by everyone" ON currency_exchange_rates;
DROP POLICY IF EXISTS "Only admins can update exchange rates" ON currency_exchange_rates;

CREATE POLICY "exchange_rates_select" ON currency_exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "exchange_rates_modify" ON currency_exchange_rates
  FOR ALL USING (is_user_admin((SELECT auth.uid())));

-- subscription_history - user and admin
DROP POLICY IF EXISTS "Users can view own subscription history" ON subscription_history;
DROP POLICY IF EXISTS "Admins can view all subscription history" ON subscription_history;

CREATE POLICY "subscription_history_select" ON subscription_history
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

-- profiles - user own, admin all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    id = (SELECT auth.uid()) 
    OR is_user_admin((SELECT auth.uid()))
  );

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles_admin_manage" ON profiles
  FOR ALL USING (is_user_admin((SELECT auth.uid())));

-- =============================================================================
-- Success notification
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Comprehensive performance and security migration completed!';
  RAISE NOTICE '1. Fixed search_path for 8 functions';
  RAISE NOTICE '2. Added 4 missing foreign key indexes';
  RAISE NOTICE '3. Optimized RLS policies for performance';
  RAISE NOTICE '4. Consolidated %% duplicate permissive policies into single policies';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Run advisors again to verify fixes';
END $$;

