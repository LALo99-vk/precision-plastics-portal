-- Price list sheets: each row = one PDF "sheet" (catalogue section)
-- 1. Create bucket in Supabase Dashboard: Storage > New bucket > Name: price-list > Public: ON
-- 2. Run this SQL in Supabase SQL Editor

-- Folders table (categories); parent_id NULL = root folder
CREATE TABLE IF NOT EXISTS price_list_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  parent_id UUID REFERENCES price_list_folders(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_list_sheets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  folder_id UUID REFERENCES price_list_folders(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE price_list_sheets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read price_list_sheets" ON price_list_sheets;
CREATE POLICY "Public read price_list_sheets" ON price_list_sheets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert price_list_sheets" ON price_list_sheets;
CREATE POLICY "Authenticated insert price_list_sheets" ON price_list_sheets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update price_list_sheets" ON price_list_sheets;
CREATE POLICY "Authenticated update price_list_sheets" ON price_list_sheets
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete price_list_sheets" ON price_list_sheets;
CREATE POLICY "Authenticated delete price_list_sheets" ON price_list_sheets
  FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE price_list_folders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read price_list_folders" ON price_list_folders;
CREATE POLICY "Public read price_list_folders" ON price_list_folders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated insert price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated insert price_list_folders" ON price_list_folders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated update price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated update price_list_folders" ON price_list_folders FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated delete price_list_folders" ON price_list_folders;
CREATE POLICY "Authenticated delete price_list_folders" ON price_list_folders FOR DELETE USING (auth.role() = 'authenticated');

-- Storage: create bucket "price-list" in Dashboard (Public ON), then run below:
DROP POLICY IF EXISTS "Public read price-list" ON storage.objects;
CREATE POLICY "Public read price-list" ON storage.objects
  FOR SELECT USING (bucket_id = 'price-list');

DROP POLICY IF EXISTS "Authenticated upload price-list" ON storage.objects;
CREATE POLICY "Authenticated upload price-list" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'price-list' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update price-list" ON storage.objects;
CREATE POLICY "Authenticated update price-list" ON storage.objects
  FOR UPDATE USING (bucket_id = 'price-list' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'price-list');

DROP POLICY IF EXISTS "Authenticated delete price-list" ON storage.objects;
CREATE POLICY "Authenticated delete price-list" ON storage.objects
  FOR DELETE USING (bucket_id = 'price-list' AND auth.role() = 'authenticated');
