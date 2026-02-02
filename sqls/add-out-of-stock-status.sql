-- Add 'out_of_stock' status to products table
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- First, drop the existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;

-- Add the new constraint that includes 'out_of_stock'
ALTER TABLE products ADD CONSTRAINT products_status_check 
  CHECK (status IN ('draft', 'published', 'hidden', 'discontinued', 'out_of_stock'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname = 'products_status_check';
