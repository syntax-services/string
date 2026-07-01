-- isolated RLS policies for product-images and service-images buckets to bypass generic name conflicts

-- 2. Drop existing potentially conflicting policy names
DROP POLICY IF EXISTS "product-images public select" ON storage.objects;
DROP POLICY IF EXISTS "product-images auth insert" ON storage.objects;
DROP POLICY IF EXISTS "product-images auth delete" ON storage.objects;
DROP POLICY IF EXISTS "service-images public select" ON storage.objects;
DROP POLICY IF EXISTS "service-images auth insert" ON storage.objects;
DROP POLICY IF EXISTS "service-images auth delete" ON storage.objects;

-- 3. Create unique policies for product-images
CREATE POLICY "product-images public select" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product-images auth insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product-images auth delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- 4. Create unique policies for service-images
CREATE POLICY "service-images public select" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');

CREATE POLICY "service-images auth insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "service-images auth delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'service-images');
