-- String Platform - Squad Sub-account, NIN/BVN Verification, and AML Schema

-- 1. Add verification and Squad columns to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nin_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bvn_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS squad_subaccount_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS squad_virtual_account TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_funded NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_withdrawn_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aml_flagged BOOLEAN DEFAULT false;

-- 2. Redefine get_customer_conversations to include business verified status
DROP FUNCTION IF EXISTS public.get_customer_conversations(UUID);

CREATE OR REPLACE FUNCTION public.get_customer_conversations(p_customer_id UUID)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  business_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT,
  verified BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.business_id,
    COALESCE(b.company_name, 'Business') AS business_name,
    lm.content AS last_message,
    COALESCE(lm.created_at, c.last_message_at, c.created_at) AS last_message_at,
    COUNT(um.id) AS unread_count,
    COALESCE(b.verified, false) AS verified
  FROM public.conversations c
  JOIN public.customers cu ON cu.id = c.customer_id
  JOIN public.businesses b ON b.id = c.business_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN public.messages um
    ON um.conversation_id = c.id
   AND um.sender_type = 'business'
   AND um.read_at IS NULL
  WHERE c.customer_id = p_customer_id
    AND cu.user_id = auth.uid()
  GROUP BY c.id, c.business_id, b.company_name, lm.content, lm.created_at, c.last_message_at, c.created_at, b.verified
  ORDER BY COALESCE(lm.created_at, c.last_message_at, c.created_at) DESC;
$$;

-- 3. Redefine get_business_conversations to include customer verification level
DROP FUNCTION IF EXISTS public.get_business_conversations(UUID);

CREATE OR REPLACE FUNCTION public.get_business_conversations(p_business_id UUID)
RETURNS TABLE (
  id UUID,
  customer_id UUID,
  customer_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT,
  verification_level INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.customer_id,
    COALESCE(p.full_name, 'Customer') AS customer_name,
    lm.content AS last_message,
    COALESCE(lm.created_at, c.last_message_at, c.created_at) AS last_message_at,
    COUNT(um.id) AS unread_count,
    COALESCE(p.verification_level, 1) AS verification_level
  FROM public.conversations c
  JOIN public.businesses b ON b.id = c.business_id
  JOIN public.customers cu ON cu.id = c.customer_id
  LEFT JOIN public.profiles p ON p.user_id = cu.user_id
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN public.messages um
    ON um.conversation_id = c.id
   AND um.sender_type = 'customer'
   AND um.read_at IS NULL
  WHERE c.business_id = p_business_id
    AND b.user_id = auth.uid()
  GROUP BY c.id, c.customer_id, p.full_name, lm.content, lm.created_at, c.last_message_at, c.created_at, p.verification_level
  ORDER BY COALESCE(lm.created_at, c.last_message_at, c.created_at) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_conversations(UUID) TO authenticated;

-- Create public storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage buckets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Access' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images' OR bucket_id = 'service-images');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Insert Access' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' OR bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owner Delete Access' AND tablename = 'objects' AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Owner Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' OR bucket_id = 'service-images');
  END IF;
END
$$;
