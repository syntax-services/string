-- ==============================================
-- STRING PLATFORM - REFERRAL SYSTEM & OFFER ENHANCEMENTS
-- ==============================================

-- ==============================================
-- 1. REFERRAL CODES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);

-- ==============================================
-- 2. REFERRALS TABLE (tracks each referral)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    referral_code TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can view own referral as referred" ON public.referrals FOR SELECT USING (auth.uid() = referred_id);
CREATE POLICY "System can insert referrals" ON public.referrals FOR INSERT WITH CHECK (true);

CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- ==============================================
-- 3. USER POINTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_points INTEGER NOT NULL DEFAULT 0,
    referral_points INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);

-- ==============================================
-- 4. GENERATE REFERRAL CODE FUNCTION
-- ==============================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 8 char alphanumeric code prefixed with STR-
    new_code := 'STR-' || upper(substr(md5(random()::text), 1, 6));
    
    SELECT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- ==============================================
-- 5. ENSURE REFERRAL CODE ON PROFILE CREATION
-- ==============================================
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Only create a referral code if one doesn't exist for this user
  IF NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE user_id = NEW.user_id) THEN
    new_code := public.generate_referral_code();
    
    INSERT INTO public.referral_codes (user_id, code) VALUES (NEW.user_id, new_code);
  END IF;
  
  -- Also ensure user_points row exists
  INSERT INTO public.user_points (user_id, total_points, referral_points)
  VALUES (NEW.user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_referral_code_on_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_referral_code();

-- ==============================================
-- 6. PROCESS REFERRAL RPC
-- Awards points when a referred user completes onboarding
-- ==============================================
CREATE OR REPLACE FUNCTION public.process_referral(p_referral_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_points_per_referral INTEGER := 100;
  v_already_referred BOOLEAN;
BEGIN
  v_referred_id := auth.uid();
  
  IF v_referred_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;
  
  -- Check if the referred user has already been referred
  SELECT EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = v_referred_id)
  INTO v_already_referred;
  
  IF v_already_referred THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already has a referral');
  END IF;
  
  -- Find the referrer
  SELECT user_id INTO v_referrer_id
  FROM public.referral_codes
  WHERE code = p_referral_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Can't refer yourself
  IF v_referrer_id = v_referred_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot use your own referral code');
  END IF;
  
  -- Create the referral record
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, points_awarded, status, completed_at)
  VALUES (v_referrer_id, v_referred_id, p_referral_code, v_points_per_referral, 'completed', now());
  
  -- Award points to referrer
  INSERT INTO public.user_points (user_id, total_points, referral_points)
  VALUES (v_referrer_id, v_points_per_referral, v_points_per_referral)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_points.total_points + v_points_per_referral,
    referral_points = public.user_points.referral_points + v_points_per_referral,
    updated_at = now();
  
  -- Award half points to the referred user as a welcome bonus
  INSERT INTO public.user_points (user_id, total_points, referral_points)
  VALUES (v_referred_id, v_points_per_referral / 2, v_points_per_referral / 2)
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.user_points.total_points + (v_points_per_referral / 2),
    referral_points = public.user_points.referral_points + (v_points_per_referral / 2),
    updated_at = now();
  
  -- Create notification for referrer
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    v_referrer_id,
    'referral_completed',
    'Referral Reward!',
    'Someone joined String using your referral code. You earned ' || v_points_per_referral || ' points!',
    jsonb_build_object('points', v_points_per_referral, 'referred_id', v_referred_id)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'points_awarded', v_points_per_referral,
    'welcome_bonus', v_points_per_referral / 2
  );
END;
$$;

-- ==============================================
-- 7. OFFERS ENHANCEMENTS
-- ==============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'offers' AND column_name = 'allow_calls'
  ) THEN
    ALTER TABLE public.offers ADD COLUMN allow_calls BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'offers' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE public.offers ADD COLUMN contact_phone TEXT;
  END IF;
END $$;

-- ==============================================
-- 8. PROFILES: Add verification_level column
-- ==============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'verification_level'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN verification_level INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_code_used'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code_used TEXT;
  END IF;
END $$;

-- Update verification_level: level 1 = email verified (handled in app), level 2 = onboarding complete + phone verified
-- This is computed at the application layer based on:
-- Level 0: Just signed up
-- Level 1: Email verified
-- Level 2: Email verified + Onboarding complete + Phone provided
