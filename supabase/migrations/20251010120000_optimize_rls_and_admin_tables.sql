-- Migration: Optimize RLS Policies and Create Admin Tables
-- Date: 2025-10-10
-- Description: Fix auth.uid() RLS performance issues and create admin infrastructure

-- ============================================================================
-- PART 1: Optimize RLS Policies (Fix auth.uid() re-evaluation)
-- ============================================================================

-- Drop existing RLS policies and recreate with optimized (select auth.uid())
-- This prevents re-evaluation of auth.uid() for each row

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (user_id = (select auth.uid()));

-- Payment Methods table
DROP POLICY IF EXISTS "Users can view their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON payment_methods;

CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own payment methods" ON payment_methods
  FOR UPDATE USING (user_id = (select auth.uid()));

-- Invoices table
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (user_id = (select auth.uid()));

-- M-PESA Credentials table
DROP POLICY IF EXISTS "Users can view their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can insert their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can update their own M-PESA credentials" ON mpesa_credentials;
DROP POLICY IF EXISTS "Users can delete their own M-PESA credentials" ON mpesa_credentials;

CREATE POLICY "Users can view their own M-PESA credentials" ON mpesa_credentials
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own M-PESA credentials" ON mpesa_credentials
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own M-PESA credentials" ON mpesa_credentials
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own M-PESA credentials" ON mpesa_credentials
  FOR DELETE USING (user_id = (select auth.uid()));

-- Transactions table
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (user_id = (select auth.uid()));

-- Subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = (select auth.uid()));

-- API Keys table
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;

CREATE POLICY "Users can view their own API keys" ON api_keys
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own API keys" ON api_keys
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own API keys" ON api_keys
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own API keys" ON api_keys
  FOR DELETE USING (user_id = (select auth.uid()));

-- User Roles table (merge multiple policies)
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Combined policy for viewing (user can see own OR admin can see all)
CREATE POLICY "Users can view roles" ON user_roles
  FOR SELECT USING (
    user_id = (select auth.uid()) OR 
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'admin')
  );

-- Payment Links table
DROP POLICY IF EXISTS "Users can view their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can insert their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can update their own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can delete their own payment links" ON payment_links;

CREATE POLICY "Users can view their own payment links" ON payment_links
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own payment links" ON payment_links
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own payment links" ON payment_links
  FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own payment links" ON payment_links
  FOR DELETE USING (user_id = (select auth.uid()));

-- ============================================================================
-- PART 2: Add Missing Indexes
-- ============================================================================

-- Add index on transactions.link_id (foreign key without index)
CREATE INDEX IF NOT EXISTS idx_transactions_link_id ON transactions(link_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_invoices_user_status_created ON invoices(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status_created ON transactions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires ON subscriptions(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_payment_links_slug ON payment_links(link_slug);

-- ============================================================================
-- PART 3: Create Admin Settings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin settings
CREATE POLICY "Only admins can view admin settings" ON admin_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'admin')
  );

CREATE POLICY "Only admins can manage admin settings" ON admin_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'admin')
  );

-- ============================================================================
-- PART 4: Create System Incidents Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_services text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS on system_incidents
ALTER TABLE system_incidents ENABLE ROW LEVEL SECURITY;

-- Anyone can view incidents
CREATE POLICY "Anyone can view system incidents" ON system_incidents
  FOR SELECT USING (true);

-- Only admins can manage incidents
CREATE POLICY "Only admins can manage incidents" ON system_incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = (select auth.uid()) AND role = 'admin')
  );

-- ============================================================================
-- PART 5: Create OTP Verification Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  is_verified boolean DEFAULT false,
  attempts int DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Enable RLS on otp_verifications
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own OTP records
CREATE POLICY "Users can view their own OTP records" ON otp_verifications
  FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own OTP records" ON otp_verifications
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own OTP records" ON otp_verifications
  FOR UPDATE USING (user_id = (select auth.uid()));

-- Index for OTP lookups
CREATE INDEX IF NOT EXISTS idx_otp_user_phone ON otp_verifications(user_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- ============================================================================
-- PART 6: Add phone_verified column to profiles
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at timestamptz;

-- ============================================================================
-- PART 7: Create Admin Helper Functions
-- ============================================================================

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
    'total_transactions', (SELECT COUNT(*) FROM transactions),
    'total_transaction_amount', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed'),
    'total_invoices', (SELECT COUNT(*) FROM invoices),
    'pending_invoices', (SELECT COUNT(*) FROM invoices WHERE status = 'pending'),
    'paid_invoices', (SELECT COUNT(*) FROM invoices WHERE status = 'paid')
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to search users (full-text search)
CREATE OR REPLACE FUNCTION search_users(search_query text)
RETURNS TABLE (
  id uuid,
  business_name text,
  owner_name text,
  email text,
  phone text,
  country text,
  selected_plan text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.business_name,
    p.owner_name,
    p.email,
    p.phone,
    p.country,
    p.selected_plan,
    p.created_at
  FROM profiles p
  WHERE 
    p.business_name ILIKE '%' || search_query || '%' OR
    p.owner_name ILIKE '%' || search_query || '%' OR
    p.email ILIKE '%' || search_query || '%' OR
    p.phone ILIKE '%' || search_query || '%'
  ORDER BY p.created_at DESC
  LIMIT 100;
END;
$$;

-- Function to get revenue by plan
CREATE OR REPLACE FUNCTION get_revenue_by_plan()
RETURNS TABLE (
  plan text,
  subscription_count bigint,
  total_revenue numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    s.plan,
    COUNT(*) as subscription_count,
    SUM(s.amount) as total_revenue
  FROM subscriptions s
  WHERE s.status = 'active'
  GROUP BY s.plan
  ORDER BY total_revenue DESC;
END;
$$;

-- ============================================================================
-- PART 8: Insert Default Admin Settings
-- ============================================================================

-- Insert default platform settings (if not exists)
INSERT INTO admin_settings (setting_key, setting_value, description, is_encrypted)
VALUES 
  ('mpesa_till_number', '{"till_number": "", "business_name": "LipaSasa"}', 'Platform M-Pesa Till for subscription payments', false),
  ('paypal_credentials', '{"client_id": "", "client_secret": "", "mode": "sandbox"}', 'PayPal API credentials', true),
  ('platform_branding', '{"primary_color": "#0EA5E9", "secondary_color": "#10B981", "logo_url": "/lipasasa-logo.png"}', 'Platform branding settings', false),
  ('rate_limits', '{"api_requests_per_minute": 60, "invoices_per_hour": 100}', 'API rate limiting configuration', false),
  ('email_settings', '{"from_email": "noreply@lipasasa.online", "from_name": "LipaSasa"}', 'Email notification settings', false),
  ('feature_flags', '{"otp_verification_enabled": true, "google_oauth_enabled": true, "paypal_enabled": true}', 'Feature toggle flags', false)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- PART 9: Create update trigger for admin_settings
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_incidents_updated_at
  BEFORE UPDATE ON system_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 10: Grant necessary permissions
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_platform_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_users(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_by_plan() TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE '1. RLS policies optimized for better performance';
  RAISE NOTICE '2. Missing indexes added';
  RAISE NOTICE '3. Admin tables created (admin_settings, system_incidents, otp_verifications)';
  RAISE NOTICE '4. Admin helper functions created';
  RAISE NOTICE '5. Default settings inserted';
END $$;

