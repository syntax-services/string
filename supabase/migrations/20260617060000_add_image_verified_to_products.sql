-- Add image_verified column to products table to support admin verification of product catalog images
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_verified BOOLEAN DEFAULT true;

-- Add video_url and user-submitted coordinates (latitude, longitude) to location_requests
ALTER TABLE public.location_requests ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.location_requests ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.location_requests ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create storage bucket for business verification proof videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-videos', 'verification-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification proof videos
DROP POLICY IF EXISTS "Public View verification-videos" ON storage.objects;
CREATE POLICY "Public View verification-videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'verification-videos');

DROP POLICY IF EXISTS "Authenticated Users can upload verification-videos" ON storage.objects;
CREATE POLICY "Authenticated Users can upload verification-videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-videos');
