-- Add policy to allow admins to insert and manage referral codes

DROP POLICY IF EXISTS "Admins can insert referral codes" ON public.referral_codes;
CREATE POLICY "Admins can insert referral codes" ON public.referral_codes
    FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage referral codes" ON public.referral_codes;
CREATE POLICY "Admins can manage referral codes" ON public.referral_codes
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));
