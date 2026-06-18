-- ============================================================================
-- STRING PLATFORM - LAUNCH FIX: DIRECT MESSAGING RPCS + READ RECEIPTS
-- ============================================================================

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_conversations_customer_business
  ON public.conversations(customer_id, business_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
  ON public.messages(conversation_id, created_at);

-- Make direct messaging work without any request/accept gate.
CREATE OR REPLACE FUNCTION public.get_customer_conversations(p_customer_id UUID)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  business_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
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
    COUNT(um.id) AS unread_count
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
  GROUP BY c.id, c.business_id, b.company_name, lm.content, lm.created_at, c.last_message_at, c.created_at
  ORDER BY COALESCE(lm.created_at, c.last_message_at, c.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_business_conversations(p_business_id UUID)
RETURNS TABLE (
  id UUID,
  customer_id UUID,
  customer_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
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
    COUNT(um.id) AS unread_count
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
  GROUP BY c.id, c.customer_id, p.full_name, lm.content, lm.created_at, c.last_message_at, c.created_at
  ORDER BY COALESCE(lm.created_at, c.last_message_at, c.created_at) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_customer_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_conversations(UUID) TO authenticated;

-- Existing policy allowed only senders to update their own messages, which blocks
-- read receipts because the receiver needs to set read_at on the sender's message.
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can update message read state" ON public.messages;

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.customers cu ON cu.id = c.customer_id
    LEFT JOIN public.businesses b ON b.id = c.business_id
    WHERE c.id = messages.conversation_id
      AND (
        (messages.sender_type = 'customer' AND cu.user_id = auth.uid())
        OR (messages.sender_type = 'business' AND b.user_id = auth.uid())
      )
  )
);

CREATE POLICY "Conversation participants can update message read state"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.customers cu ON cu.id = c.customer_id
    LEFT JOIN public.businesses b ON b.id = c.business_id
    WHERE c.id = messages.conversation_id
      AND (cu.user_id = auth.uid() OR b.user_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.customers cu ON cu.id = c.customer_id
    LEFT JOIN public.businesses b ON b.id = c.business_id
    WHERE c.id = messages.conversation_id
      AND (cu.user_id = auth.uid() OR b.user_id = auth.uid())
  )
);
