-- Payment Links and Bank Settlement Support

-- 1) Extend payment_methods with bank details
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT;

-- 2) Create payment_links table
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  method_type TEXT NOT NULL CHECK (method_type IN ('mpesa_paybill','mpesa_till','bank')),
  method_value TEXT NOT NULL,
  min_amount NUMERIC NOT NULL DEFAULT 1,
  currency TEXT NOT NULL DEFAULT 'KSH',
  logo_url TEXT,
  link_slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies: owners only
CREATE POLICY IF NOT EXISTS "Users can view their own payment links"
ON public.payment_links
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own payment links"
ON public.payment_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own payment links"
ON public.payment_links
FOR DELETE
USING (auth.uid() = user_id);

-- 3) Add link association to transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS link_id UUID REFERENCES public.payment_links(id) ON DELETE SET NULL;

-- 4) updated_at trigger for payment_links
CREATE TRIGGER IF NOT EXISTS update_payment_links_updated_at
BEFORE UPDATE ON public.payment_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON public.payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_created_at ON public.payment_links(created_at DESC);

