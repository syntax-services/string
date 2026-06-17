-- Drop and recreate referral_codes insert policy to allow trigger execution (when auth.uid() is NULL)
DROP POLICY IF EXISTS "Users can insert own referral code" ON public.referral_codes;
CREATE POLICY "Users can insert own referral code" ON public.referral_codes
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Drop and recreate user_points insert policy to allow trigger execution (when auth.uid() is NULL)
DROP POLICY IF EXISTS "Users can insert own points" ON public.user_points;
CREATE POLICY "Users can insert own points" ON public.user_points
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
