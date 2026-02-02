-- Add UPDATE policies for products table
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This allows authenticated users to update products (safe to re-run)

DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert products" ON products
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products" ON products
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- product_categories: allow authenticated users to insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated users to insert product_categories" ON product_categories;
DROP POLICY IF EXISTS "Allow authenticated users to update product_categories" ON product_categories;
DROP POLICY IF EXISTS "Allow authenticated users to delete product_categories" ON product_categories;
CREATE POLICY "Allow authenticated users to insert product_categories" ON product_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update product_categories" ON product_categories
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete product_categories" ON product_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- product_images: allow public read so product cards and detail page show images
DROP POLICY IF EXISTS "Allow public read product_images" ON product_images;
CREATE POLICY "Allow public read product_images" ON product_images
  FOR SELECT USING (true);

-- If you're using service role key in admin panel instead of auth, use this instead:
-- DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
-- CREATE POLICY "Allow service role to manage products" ON products
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);
