-- Drop the existing insert policy that requires email confirmation
DROP POLICY IF EXISTS "Business owner can insert" ON public.businesses;

-- Create the new, more relaxed policy for development/testing
CREATE POLICY "Business owner can insert" ON public.businesses FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Similarly, drop and recreate for customers to prevent the same issue there
DROP POLICY IF EXISTS "Customer can insert own data" ON public.customers;

CREATE POLICY "Customer can insert own data" ON public.customers FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
