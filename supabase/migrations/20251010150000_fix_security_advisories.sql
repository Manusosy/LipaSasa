-- Fix security advisories from Supabase

-- 1. Fix function search path mutable issue for get_platform_stats
ALTER FUNCTION public.get_platform_stats()
SET search_path = public, pg_catalog, pg_temp;

-- Recreate search_users function with proper search path if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'search_users'
    ) THEN
        -- Set search_path for search_users function
        EXECUTE 'ALTER FUNCTION public.search_users(TEXT) SET search_path = public, pg_catalog, pg_temp';
    END IF;
END $$;

-- Fix all other user-defined functions to have secure search_path
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_arguments(p.oid) as function_args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f' -- only functions, not procedures
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config pc
            WHERE pc.oid = p.oid
            AND pc.config[1] LIKE 'search_path%'
        )
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER FUNCTION public.%I(%s) SET search_path = public, pg_catalog, pg_temp',
                func_record.function_name,
                func_record.function_args
            );
            RAISE NOTICE 'Set search_path for function: %', func_record.function_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not set search_path for function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. Add auth configuration recommendations (to be done via Supabase Dashboard)
-- These settings must be configured via the Supabase Dashboard:
-- 
-- a) OTP Expiry:
--    Navigate to: Dashboard > Authentication > Email Auth
--    Set OTP expiry to: 600 seconds (10 minutes) or less
--
-- b) Leaked Password Protection:
--    Navigate to: Dashboard > Authentication > Policies
--    Enable "Leaked password protection"
--
-- c) Postgres Version:
--    Navigate to: Dashboard > Database > Settings
--    Click "Upgrade Database" to apply security patches

-- Add a table to track security configuration status
CREATE TABLE IF NOT EXISTS public.security_config_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_item TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'n/a')),
    notes TEXT,
    last_checked TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert security config items
INSERT INTO public.security_config_status (config_item, status, notes) VALUES
    ('otp_expiry_configured', 'pending', 'Set OTP expiry to < 1 hour in Supabase Dashboard'),
    ('leaked_password_protection', 'pending', 'Enable in Supabase Dashboard > Auth > Policies'),
    ('postgres_version_updated', 'pending', 'Upgrade database in Supabase Dashboard > Database > Settings'),
    ('function_search_paths', 'completed', 'Fixed via migration 20251010150000')
ON CONFLICT (config_item) DO UPDATE
SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW();

-- RLS for security config
ALTER TABLE public.security_config_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security config"
    ON public.security_config_status
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (select auth.uid())
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update security config"
    ON public.security_config_status
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = (select auth.uid())
            AND role = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE public.security_config_status IS 'Tracks security configuration status - Migration 20251010150000';

