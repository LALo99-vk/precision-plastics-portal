-- Rotating messages for homepage (quotes, offers, notices)
-- Run in Supabase SQL Editor after supabase-setup / extended schema

CREATE TABLE IF NOT EXISTS rotating_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quote' CHECK (type IN ('quote', 'offer', 'notice', 'general')),
  duration_seconds INTEGER NOT NULL DEFAULT 5 CHECK (duration_seconds >= 1 AND duration_seconds <= 120),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Public can read all (homepage filters by active; admin sees all)
ALTER TABLE rotating_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read rotating_messages" ON rotating_messages;
CREATE POLICY "Allow public read rotating_messages" ON rotating_messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert rotating_messages" ON rotating_messages;
CREATE POLICY "Allow authenticated insert rotating_messages" ON rotating_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update rotating_messages" ON rotating_messages;
CREATE POLICY "Allow authenticated update rotating_messages" ON rotating_messages
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete rotating_messages" ON rotating_messages;
CREATE POLICY "Allow authenticated delete rotating_messages" ON rotating_messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- Optional: trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION update_rotating_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rotating_messages_updated_at ON rotating_messages;
CREATE TRIGGER rotating_messages_updated_at
  BEFORE UPDATE ON rotating_messages
  FOR EACH ROW EXECUTE FUNCTION update_rotating_messages_updated_at();
