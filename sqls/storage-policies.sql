-- Storage policies for product-images bucket
-- 1. Create bucket in Dashboard: Storage > New bucket > Name: product-images > Public: ON
-- 2. Run this SQL in Supabase SQL Editor

-- RLS policies on storage.objects
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete product-images" ON storage.objects;

CREATE POLICY "Public read product-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated upload product-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update product-images" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated delete product-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
