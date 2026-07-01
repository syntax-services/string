-- String Platform - Campus Runner Gig Delivery System Migration

-- 1. Extend profiles and customers tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_runner BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS runner_active BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS runner_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS is_runner BOOLEAN DEFAULT false;

-- 2. Extend withdrawal requests constraint to support 'runner' types
ALTER TABLE public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_withdrawal_type_check;
ALTER TABLE public.withdrawal_requests ADD CONSTRAINT withdrawal_requests_withdrawal_type_check CHECK (withdrawal_type IN ('business', 'coupon', 'runner'));

ALTER TABLE public.withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_owner_check;
ALTER TABLE public.withdrawal_requests ADD CONSTRAINT withdrawal_owner_check CHECK (
  (business_id IS NOT NULL AND withdrawal_type = 'business') OR 
  (user_id IS NOT NULL AND withdrawal_type IN ('coupon', 'runner'))
);

-- 3. Extend orders table to support courier tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS runner_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_status TEXT CHECK (delivery_status IN ('pending', 'accepted', 'picked_up', 'delivered')) DEFAULT 'pending';

-- 4. Enable RLS and add policies on orders for runners
DROP POLICY IF EXISTS "Runners can view active delivery gigs" ON public.orders;
CREATE POLICY "Runners can view active delivery gigs" ON public.orders
  FOR SELECT USING (
    (delivery_method = 'delivery' AND status IN ('confirmed', 'processing') AND runner_id IS NULL)
    OR (runner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Runners can update claimed orders" ON public.orders;
CREATE POLICY "Runners can update claimed orders" ON public.orders
  FOR UPDATE USING (
    runner_id = auth.uid() OR (runner_id IS NULL AND delivery_method = 'delivery' AND status IN ('confirmed', 'processing'))
  );

-- 5. Atomicity Function: accept_delivery_gig
CREATE OR REPLACE FUNCTION public.accept_delivery_gig(p_order_id UUID, p_runner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN := false;
BEGIN
  -- Verify the claimant is a registered runner
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_runner_id AND is_runner = true) THEN
    UPDATE public.orders
    SET runner_id = p_runner_id,
        delivery_status = 'accepted',
        updated_at = now()
    WHERE id = p_order_id
      AND delivery_method = 'delivery'
      AND status IN ('confirmed', 'processing')
      AND runner_id IS NULL;
      
    IF FOUND THEN
      v_updated := true;
    END IF;
  END IF;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Atomicity Function: complete_delivery_gig
CREATE OR REPLACE FUNCTION public.complete_delivery_gig(p_order_id UUID, p_runner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_fee NUMERIC(12, 2);
  v_updated BOOLEAN := false;
BEGIN
  -- Verify order belongs to runner and is currently picked up
  SELECT delivery_fee INTO v_fee
  FROM public.orders
  WHERE id = p_order_id 
    AND runner_id = p_runner_id 
    AND delivery_status = 'picked_up';

  IF FOUND THEN
    -- Update order status to delivered
    UPDATE public.orders
    SET delivery_status = 'delivered',
        status = 'delivered',
        delivered_at = now(),
        updated_at = now()
    WHERE id = p_order_id;
    
    -- Credit Runner's balance in profiles table
    UPDATE public.profiles
    SET runner_balance = runner_balance + coalesce(v_fee, 0.00),
        updated_at = now()
    WHERE user_id = p_runner_id;
    
    v_updated := true;
  END IF;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
