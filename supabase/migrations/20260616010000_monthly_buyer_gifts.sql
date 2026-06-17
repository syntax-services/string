-- ============================================================================
-- STRING PLATFORM - MIGRATION: MONTHLY VIP BUYER GIFTS
-- ============================================================================

-- Create table for monthly buyer gifts
CREATE TABLE IF NOT EXISTS public.monthly_buyer_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    year_month TEXT NOT NULL, -- Format: YYYY-MM
    total_spent NUMERIC(12, 2) NOT NULL,
    reward_amount NUMERIC(12, 2) NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, year_month)
);

ALTER TABLE public.monthly_buyer_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own monthly gifts" ON public.monthly_buyer_gifts;
CREATE POLICY "Users can view own monthly gifts" ON public.monthly_buyer_gifts 
    FOR SELECT USING (auth.uid() = user_id);

-- Insert system setting defaults for monthly VIP gifts
INSERT INTO public.system_settings (key, value)
VALUES 
  ('monthly_gift_spend_threshold', '50000'::jsonb),
  ('monthly_gift_reward_amount', '5000'::jsonb)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;

-- RPC to check and claim monthly gift
CREATE OR REPLACE FUNCTION public.check_and_claim_monthly_gift()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_customer_id UUID;
  v_current_month TEXT;
  v_spend_threshold NUMERIC;
  v_reward_amount NUMERIC;
  v_total_spent NUMERIC := 0.00;
  v_already_claimed BOOLEAN;
  v_threshold_setting RECORD;
  v_reward_setting RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  v_current_month := to_char(now(), 'YYYY-MM');

  -- Get setting values
  SELECT value->>0 AS val INTO v_threshold_setting FROM public.system_settings WHERE key = 'monthly_gift_spend_threshold';
  v_spend_threshold := COALESCE(v_threshold_setting.val::NUMERIC, 50000);

  SELECT value->>0 AS val INTO v_reward_setting FROM public.system_settings WHERE key = 'monthly_gift_reward_amount';
  v_reward_amount := COALESCE(v_reward_setting.val::NUMERIC, 5000);

  -- Check if already claimed for this month
  SELECT EXISTS (
    SELECT 1 FROM public.monthly_buyer_gifts 
    WHERE user_id = v_user_id AND year_month = v_current_month
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN jsonb_build_object('success', false, 'message', 'You have already claimed your VIP gift for this month.');
  END IF;

  -- Get customer id
  SELECT id INTO v_customer_id FROM public.customers WHERE user_id = v_user_id;
  IF v_customer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Customer profile not found');
  END IF;

  -- Calculate total spent on completed/delivered orders during current calendar month
  SELECT COALESCE(SUM(total), 0) INTO v_total_spent
  FROM public.orders
  WHERE customer_id = v_customer_id
    AND status = 'delivered'
    AND to_char(created_at, 'YYYY-MM') = v_current_month;

  IF v_total_spent < v_spend_threshold THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'You have not reached the spending threshold of ₦' || v_spend_threshold || ' yet. Your current month spending is ₦' || v_total_spent
    );
  END IF;

  -- Record the gift claim
  INSERT INTO public.monthly_buyer_gifts (user_id, year_month, total_spent, reward_amount)
  VALUES (v_user_id, v_current_month, v_total_spent, v_reward_amount);

  -- Credit user balance
  UPDATE public.profiles
  SET 
    coupon_balance = coupon_balance + v_reward_amount,
    updated_at = now()
  WHERE user_id = v_user_id;

  -- Send notification
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_user_id,
    'monthly_gift_claimed',
    'Monthly VIP Gift Claimed!',
    'Congratulations! You have claimed your monthly VIP purchaser reward of ₦' || v_reward_amount || ' for spending ₦' || v_total_spent || ' this month.',
    jsonb_build_object('year_month', v_current_month, 'reward_amount', v_reward_amount, 'total_spent', v_total_spent)
  );

  RETURN jsonb_build_object(
    'success', true,
    'reward_amount', v_reward_amount,
    'total_spent', v_total_spent,
    'message', 'Congratulations! Your VIP gift has been credited to your wallet.'
  );
END;
$$;
