-- ============================================================================
-- STRING PLATFORM - MIGRATION: PAYOUTS, COUPON ALIGNMENT & GAMIFICATION
-- ============================================================================

-- 1. ALTER REFERRAL CODES TABLE
-- Make user_id nullable to support admin-generated coupon/promo codes
ALTER TABLE public.referral_codes ALTER COLUMN user_id DROP NOT NULL;

-- Add new campaign columns matching admin dashboard inputs
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS points_to_referrer INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS points_to_referred INTEGER NOT NULL DEFAULT 50;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS qualifying_user_type TEXT NOT NULL DEFAULT 'any' CHECK (qualifying_user_type IN ('any', 'onboarded_only', 'verified_only'));
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS is_business_code BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS created_by_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.referral_codes ADD COLUMN IF NOT EXISTS reward_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- 2. ALTER PROFILES TABLE
-- Add coupon_balance to track cash rewards from coupons/referrals
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coupon_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

-- 3. ALTER WITHDRAWAL REQUESTS TABLE
-- Support coupon balance withdrawals for normal users (not just businesses)
ALTER TABLE public.withdrawal_requests ALTER COLUMN business_id DROP NOT NULL;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS withdrawal_type TEXT NOT NULL DEFAULT 'business' CHECK (withdrawal_type IN ('business', 'coupon'));

-- Add constraint to ensure a withdrawal is owned by either a business or a customer user
ALTER TABLE public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_owner_check;
ALTER TABLE public.withdrawal_requests ADD CONSTRAINT withdrawal_owner_check CHECK (
  (business_id IS NOT NULL AND withdrawal_type = 'business') OR 
  (user_id IS NOT NULL AND withdrawal_type = 'coupon')
);

-- Enable RLS on withdrawal requests policies extension
DROP POLICY IF EXISTS "Users can view own coupon withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can view own coupon withdrawals" ON public.withdrawal_requests 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create coupon withdrawals" ON public.withdrawal_requests;
CREATE POLICY "Users can create coupon withdrawals" ON public.withdrawal_requests 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. CREATE SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default configurations
INSERT INTO public.system_settings (key, value)
VALUES 
  ('allow_coupon_withdrawal', 'false'::jsonb),
  ('min_spend_for_withdrawal', '5000'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 5. CREATE COUPON CLAIMS TABLE
-- Tracks which users have claimed which admin-generated coupon codes
CREATE TABLE IF NOT EXISTS public.coupon_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code_id UUID REFERENCES public.referral_codes(id) ON DELETE CASCADE NOT NULL,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, code_id)
);

ALTER TABLE public.coupon_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon claims" ON public.coupon_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coupon claims" ON public.coupon_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. CREATE GAMIFICATION TABLES

-- A. Flash Auctions (Daily Drop)
CREATE TABLE IF NOT EXISTS public.flash_auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    start_price NUMERIC(12, 2) NOT NULL,
    current_bid NUMERIC(12, 2) NOT NULL,
    highest_bidder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.flash_auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view flash auctions" ON public.flash_auctions FOR SELECT USING (true);
CREATE POLICY "Users can place bids on flash auctions" ON public.flash_auctions FOR ALL USING (auth.uid() IS NOT NULL);

-- B. Squad Deals (Squad Discount)
CREATE TABLE IF NOT EXISTS public.squad_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    target_slots INTEGER NOT NULL DEFAULT 5,
    filled_slots INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(12, 2) NOT NULL,
    discounted_price NUMERIC(12, 2) NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.squad_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view squad deals" ON public.squad_deals FOR SELECT USING (true);
CREATE POLICY "Users can join squad deals" ON public.squad_deals FOR ALL USING (auth.uid() IS NOT NULL);

-- C. Video Reviews (Vibe Checks)
CREATE TABLE IF NOT EXISTS public.video_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_url TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.video_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view video reviews" ON public.video_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create video reviews" ON public.video_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. REWRITE PROCESS REFERRAL RPC FUNCTION
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_code_record RECORD;
  v_already_referred BOOLEAN;
  v_already_claimed BOOLEAN;
BEGIN
  v_referred_id := auth.uid();
  
  IF v_referred_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Find the referral / coupon code configuration
  SELECT * INTO v_code_record
  FROM public.referral_codes
  WHERE code = upper(trim(p_referral_code));
  
  IF v_code_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid code. Please check and try again.');
  END IF;
  
  IF v_code_record.is_revoked THEN
    RETURN jsonb_build_object('success', false, 'message', 'This promotional campaign has expired.');
  END IF;

  -- CASE A: Admin-Generated Coupon Code (system code)
  IF v_code_record.created_by_admin OR v_code_record.user_id IS NULL THEN
    -- Check if user has already claimed this specific coupon code
    SELECT EXISTS (
      SELECT 1 FROM public.coupon_claims 
      WHERE user_id = v_referred_id AND code_id = v_code_record.id
    ) INTO v_already_claimed;

    IF v_already_claimed THEN
      RETURN jsonb_build_object('success', false, 'message', 'You have already claimed this coupon code.');
    END IF;

    -- Insert claim log
    INSERT INTO public.coupon_claims (user_id, code_id)
    VALUES (v_referred_id, v_code_record.id);

    -- Award points to user
    IF v_code_record.points_to_referred > 0 THEN
      INSERT INTO public.user_points (user_id, total_points, referral_points)
      VALUES (v_referred_id, v_code_record.points_to_referred, 0)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = public.user_points.total_points + v_code_record.points_to_referred,
        updated_at = now();
    END IF;

    -- Award cash/balance to user
    IF v_code_record.reward_amount > 0 THEN
      UPDATE public.profiles
      SET 
        coupon_balance = coupon_balance + v_code_record.reward_amount,
        updated_at = now()
      WHERE user_id = v_referred_id;
    END IF;

    -- Notify user
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_referred_id,
      'coupon_claimed',
      'Coupon Applied!',
      'Promotional code ' || v_code_record.code || ' successfully applied. You earned ' || 
        CASE WHEN v_code_record.points_to_referred > 0 THEN v_code_record.points_to_referred || ' points' ELSE '' END ||
        CASE WHEN v_code_record.points_to_referred > 0 AND v_code_record.reward_amount > 0 THEN ' and ' ELSE '' END ||
        CASE WHEN v_code_record.reward_amount > 0 THEN '₦' || v_code_record.reward_amount || ' coupon cash' ELSE '' END || '!',
      jsonb_build_object('code', v_code_record.code, 'reward_amount', v_code_record.reward_amount, 'points', v_code_record.points_to_referred)
    );

    RETURN jsonb_build_object(
      'success', true,
      'points_awarded', v_code_record.points_to_referred,
      'cash_awarded', v_code_record.reward_amount,
      'message', 'Coupon claimed successfully!'
    );

  -- CASE B: Peer-to-Peer User Referral Code
  ELSE
    v_referrer_id := v_code_record.user_id;

    -- Can't refer yourself
    IF v_referrer_id = v_referred_id THEN
      RETURN jsonb_build_object('success', false, 'message', 'Cannot use your own referral code.');
    END IF;

    -- Check if the referred user has already used a referral code
    SELECT EXISTS (
      SELECT 1 FROM public.referrals WHERE referred_id = v_referred_id
    ) INTO v_already_referred;
    
    IF v_already_referred THEN
      RETURN jsonb_build_object('success', false, 'message', 'You have already claimed a welcome referral code.');
    END IF;

    -- Create referral record
    INSERT INTO public.referrals (referrer_id, referred_id, referral_code, points_awarded, status, completed_at)
    VALUES (v_referrer_id, v_referred_id, v_code_record.code, v_code_record.points_to_referrer, 'completed', now());

    -- Save referral code used in profile
    UPDATE public.profiles
    SET 
      referral_code_used = v_code_record.code,
      updated_at = now()
    WHERE user_id = v_referred_id;

    -- Award points to referrer
    IF v_code_record.points_to_referrer > 0 THEN
      INSERT INTO public.user_points (user_id, total_points, referral_points)
      VALUES (v_referrer_id, v_code_record.points_to_referrer, v_code_record.points_to_referrer)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = public.user_points.total_points + v_code_record.points_to_referrer,
        referral_points = public.user_points.referral_points + v_code_record.points_to_referrer,
        updated_at = now();
    END IF;

    -- Award points to referred user
    IF v_code_record.points_to_referred > 0 THEN
      INSERT INTO public.user_points (user_id, total_points, referral_points)
      VALUES (v_referred_id, v_code_record.points_to_referred, 0)
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = public.user_points.total_points + v_code_record.points_to_referred,
        updated_at = now();
    END IF;

    -- Award cash to referred user (if configured on code)
    IF v_code_record.reward_amount > 0 THEN
      UPDATE public.profiles
      SET 
        coupon_balance = coupon_balance + v_code_record.reward_amount,
        updated_at = now()
      WHERE user_id = v_referred_id;
    END IF;

    -- Notify referrer
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_referrer_id,
      'referral_completed',
      'Referral Completed!',
      'Your friend used your referral code. You earned ' || v_code_record.points_to_referrer || ' points!',
      jsonb_build_object('points', v_code_record.points_to_referrer, 'referred_id', v_referred_id)
    );

    -- Notify referred
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      v_referred_id,
      'referral_claimed',
      'Welcome Reward!',
      'Welcome to String! You earned ' || v_code_record.points_to_referred || ' points for signing up with a friend''s code!',
      jsonb_build_object('points', v_code_record.points_to_referred, 'referrer_id', v_referrer_id)
    );

    RETURN jsonb_build_object(
      'success', true,
      'points_awarded', v_code_record.points_to_referred,
      'cash_awarded', v_code_record.reward_amount,
      'message', 'Referral welcome bonus claimed!'
    );
  END IF;
END;
$$;
