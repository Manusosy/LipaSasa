-- Create system_health_checks table for monitoring
CREATE TABLE IF NOT EXISTS public.system_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    overall_status TEXT NOT NULL CHECK (overall_status IN ('operational', 'degraded', 'down')),
    checks JSONB NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX idx_health_checks_checked_at ON public.system_health_checks(checked_at DESC);
CREATE INDEX idx_health_checks_status ON public.system_health_checks(overall_status);

-- RLS policies for system_health_checks (public read access for status page)
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view health checks"
    ON public.system_health_checks
    FOR SELECT
    USING (true);

-- Ensure admin_settings table exists with proper structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_settings') THEN
        CREATE TABLE public.admin_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            setting_key TEXT UNIQUE NOT NULL,
            setting_value JSONB NOT NULL,
            description TEXT,
            is_encrypted BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_admin_settings_key ON public.admin_settings(setting_key);

        ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Only admins can manage settings"
            ON public.admin_settings
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = (select auth.uid())
                    AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Ensure system_incidents table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'system_incidents') THEN
        CREATE TABLE public.system_incidents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
            status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
            affected_services TEXT[] NOT NULL,
            started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            resolved_at TIMESTAMPTZ,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_incidents_status ON public.system_incidents(status);
        CREATE INDEX idx_incidents_started_at ON public.system_incidents(started_at DESC);

        ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Anyone can view incidents"
            ON public.system_incidents
            FOR SELECT
            USING (true);

        CREATE POLICY "Only admins can manage incidents"
            ON public.system_incidents
            FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = (select auth.uid())
                    AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Add subscription_id column to transactions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'subscription_id'
    ) THEN
        ALTER TABLE public.transactions
        ADD COLUMN subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

        CREATE INDEX idx_transactions_subscription ON public.transactions(subscription_id);
    END IF;
END $$;

-- Ensure subscriptions table has all necessary columns
DO $$ 
BEGIN
    -- Add paypal_order_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'paypal_order_id'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD COLUMN paypal_order_id TEXT,
        ADD COLUMN paypal_capture_id TEXT;

        CREATE INDEX idx_subscriptions_paypal_order ON public.subscriptions(paypal_order_id);
    END IF;

    -- Add failure_reason if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'failure_reason'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD COLUMN failure_reason TEXT;
    END IF;

    -- Add phone_number if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE public.subscriptions
        ADD COLUMN phone_number TEXT;
    END IF;
END $$;

-- Add function to clean up old health checks (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_checks()
RETURNS void AS $$
BEGIN
    DELETE FROM public.system_health_checks
    WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- This would need to be set up separately in production

-- Add comment to indicate last migration
COMMENT ON TABLE public.system_health_checks IS 'System health monitoring data - Migration 20251010140000';

