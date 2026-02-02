-- Enable Real-time Replication for Products Table
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- This enables real-time subscriptions to work

-- Enable replication for products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Verify replication is enabled
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products';

-- If the above query returns a row, replication is enabled
-- If it returns no rows, run the ALTER PUBLICATION command above
