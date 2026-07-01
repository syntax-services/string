-- Ensure storage buckets are public
UPDATE storage.buckets SET public = true WHERE id IN ('product-images', 'service-images');
