-- Add UPDATE policies for products table
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This allows authenticated users to update products

-- Allow authenticated users to update products
CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated users to insert products" ON products
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete products (soft delete via deleted_at)
CREATE POLICY "Allow authenticated users to delete products" ON products
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- If you're using service role key in admin panel instead of auth, use this instead:
-- DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
-- CREATE POLICY "Allow service role to manage products" ON products
--   FOR ALL 
--   USING (true)
--   WITH CHECK (true);
