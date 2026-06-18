-- ============================================================================
-- STRING PLATFORM - LAUNCH FIX: IDIC PARTICIPANTS + PREMIUM EXPIRY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.idic_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE,
  department TEXT NOT NULL,
  participation_code TEXT NOT NULL UNIQUE,
  whatsapp_verified BOOLEAN NOT NULL DEFAULT false,
  whatsapp_left_at TIMESTAMPTZ,
  audience_score NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_uses INTEGER NOT NULL DEFAULT 0,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idic_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own IDIC participant record" ON public.idic_participants;
CREATE POLICY "Users can view own IDIC participant record"
ON public.idic_participants FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users can register own IDIC participant record" ON public.idic_participants;
CREATE POLICY "Users can register own IDIC participant record"
ON public.idic_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own IDIC participant record" ON public.idic_participants;
CREATE POLICY "Users can update own IDIC participant record"
ON public.idic_participants FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.register_idic_participant(p_department TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT;
  v_attempt INTEGER := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NULLIF(btrim(COALESCE(p_department, '')), '') IS NULL THEN
    RAISE EXCEPTION 'Department is required';
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    v_code := 'IDIC-' || upper(substr(md5(v_user_id::text || now()::text || random()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.idic_participants WHERE participation_code = v_code
    ) AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE idic_code = v_code
    );
    IF v_attempt > 20 THEN
      RAISE EXCEPTION 'Could not generate unique IDIC code';
    END IF;
  END LOOP;

  INSERT INTO public.idic_participants (user_id, department, participation_code)
  VALUES (v_user_id, p_department, v_code)
  ON CONFLICT (user_id) DO UPDATE SET
    department = EXCLUDED.department,
    participation_code = COALESCE(public.idic_participants.participation_code, EXCLUDED.participation_code),
    updated_at = now()
  RETURNING participation_code INTO v_code;

  UPDATE public.profiles
  SET idic_department = p_department,
      idic_code = v_code,
      updated_at = now()
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object('code', v_code, 'department', p_department);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_idic_participant(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.expire_premium_subscriptions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.premium_subscriptions
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  GET DIAGNOSTICS v_expired_count = ROW_COUNT;

  UPDATE public.businesses b
  SET verification_tier = CASE WHEN COALESCE(b.location_verified, false) THEN 'verified' ELSE 'none' END,
      verified = COALESCE(b.location_verified, false),
      updated_at = now()
  WHERE b.verification_tier = 'premium'
    AND EXISTS (
      SELECT 1
      FROM public.premium_subscriptions ps
      WHERE ps.business_id = b.id
        AND ps.status = 'expired'
        AND ps.expires_at <= now()
    );

  RETURN jsonb_build_object('expired_count', v_expired_count);
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_premium_subscriptions() TO authenticated;

INSERT INTO public.system_config (key, value)
VALUES
  ('idic_reward_pool', jsonb_build_object(
    'total', 40000,
    'cash', 20000,
    'vouchers', 20000,
    'winner_department', 20000,
    'second_place', 5000,
    'third_place', 5000,
    'audience', 5000,
    'voucher_expiry', 'never'
  )),
  ('idic_whatsapp_strategy', jsonb_build_object(
    'primary_channel', 'whatsapp',
    'monitor_group_exit', true,
    'analyze_exported_chat_logs', true,
    'audience_supporter_reward_enabled', true
  )),
  ('maintenance_window', jsonb_build_object(
    'day', 'Saturday',
    'starts_at', '22:00',
    'ends_at', '06:00',
    'timezone', 'Africa/Lagos'
  )),
  ('business_free_period_months', '6'::jsonb),
  ('business_monthly_subscription_fee', '2000'::jsonb),
  ('merchant_price_parity_required', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
