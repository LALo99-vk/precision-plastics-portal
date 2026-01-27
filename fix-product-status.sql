-- Fix product status - ensure all products have a status
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Update all products that have NULL status to 'published'
UPDATE products 
SET status = 'published' 
WHERE status IS NULL;

-- Verify all products now have a status
SELECT id, name, status 
FROM products 
WHERE status IS NULL;

-- If the above query returns 0 rows, all products have status
-- If it returns rows, those products still need status

-- Also check for any products with invalid status values
SELECT id, name, status 
FROM products 
WHERE status NOT IN ('draft', 'published', 'hidden', 'discontinued', 'out_of_stock');
