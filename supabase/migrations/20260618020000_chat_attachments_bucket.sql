-- Create the chat-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies just in case to prevent conflicts
DROP POLICY IF EXISTS "Public View chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own chat-attachments" ON storage.objects;

-- Chat Attachments Policies:
-- 1. Anyone can view chat attachments
CREATE POLICY "Public View chat-attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-attachments');

-- 2. Authenticated users can upload chat attachments
CREATE POLICY "Authenticated Users can upload chat-attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- 3. Authenticated users can update their own chat attachments
CREATE POLICY "Users can update their own chat-attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-attachments');

-- 4. Authenticated users can delete their own chat attachments
CREATE POLICY "Users can delete their own chat-attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments');
