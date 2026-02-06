-- Run this in Supabase SQL Editor if you get "Could not find folder_id column" error.
-- This adds the folders table (if missing) and the folder_id column to price_list_sheets.

-- 1. Create folders table if it doesn't exist
CREATE TABLE IF NOT EXISTS price_list_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  parent_id UUID REFERENCES price_list_folders(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE price_list_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read price_list_folders" ON price_list_folders;
CREATE POLICY "Public read price_list_folders" ON price_list_folders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated insert price_list_folders" ON price_list_folders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated update price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated update price_list_folders" ON price_list_folders FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated delete price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated delete price_list_folders" ON price_list_folders FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Add folder_id to price_list_sheets (nullable)
ALTER TABLE price_list_sheets
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES price_list_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_price_list_sheets_folder_id ON price_list_sheets(folder_id);
CREATE INDEX IF NOT EXISTS idx_price_list_folders_parent_id ON price_list_folders(parent_id);
