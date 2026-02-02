-- Migration: Add status column to product_categories table
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Add status column with default value 'published'
ALTER TABLE product_categories 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' 
CHECK (status IN ('draft', 'published', 'hidden', 'archived'));

-- Update existing categories to have 'published' status if they don't have one
UPDATE product_categories 
SET status = 'published' 
WHERE status IS NULL;

-- Make status NOT NULL after setting defaults
ALTER TABLE product_categories 
ALTER COLUMN status SET NOT NULL;

-- Add index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_product_categories_status ON product_categories(status);
