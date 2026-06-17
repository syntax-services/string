-- 1. Redefine public.has_role to check both user_roles and profiles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) OR (
    _role = 'admin'::public.app_role AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE user_id = _user_id
        AND user_type = 'admin'
    )
  )
$$;

-- 2. Restore SELECT policy for active businesses
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
CREATE POLICY "Anyone can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = true);
