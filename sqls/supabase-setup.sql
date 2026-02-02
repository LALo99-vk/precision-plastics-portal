-- Supabase Database Setup for Nyloking & Co Admin Panel
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  image TEXT,
  properties JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  materials TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fullName TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('high-performance', 'engineering', 'standard')),
  description TEXT NOT NULL,
  maxTemp TEXT,
  applications TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_categories table (optional, for category management)
CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  productCount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access, but you can restrict later)
CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on materials" ON materials
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on product_categories" ON product_categories
  FOR SELECT USING (true);

-- For admin operations, you'll need to set up authentication
-- For now, you can create a service role policy or use Supabase Auth
-- Example: Allow authenticated users to insert/update/delete
-- CREATE POLICY "Allow authenticated users to manage products" ON products
--   FOR ALL USING (auth.role() = 'authenticated');

-- Create storage bucket for product images
-- Note: Run this in Supabase Dashboard > Storage > Create Bucket
-- Bucket name: product-images
-- Public: Yes (or set up proper access policies)

-- Insert initial product categories
INSERT INTO product_categories (id, name, description, productCount) VALUES
  ('laminated-sheets', 'Laminated Sheets', 'Engineered plastic and composite laminate sheets for industrial applications', 25),
  ('heat-resistant-rods', 'Heat Resistant Rods', 'High-performance rods designed for thermal and mechanical resistance', 14),
  ('acrylic-sheets', 'Acrylic Sheets', 'Transparent and opaque acrylic sheets for glazing and display applications', 5),
  ('pvc-products', 'PVC Products', 'PVC-based boards and profiles for cutting, clicking and general purpose use', 1),
  ('pvc-curtain-rolls', 'PVC Curtain Rolls', 'Flexible PVC strip curtain rolls for industrial doors and partitions', 1),
  ('polyurethane-cords', 'Polyurethane Cords', 'High wear resistant polyurethane cords for conveying and drive applications', 1),
  ('pvc-folding-bed-shoe-moulds', 'PVC Folding Bed Shoe Moulds', 'PVC moulds designed for folding bed shoe and related moulding applications', 1),
  ('acrylic-tubes', 'Acrylic Tubes', 'Clear acrylic tubes for display, guarding and flow visualization', 1),
  ('ptfe-bushes', 'PTFE Bushes', 'Low-friction PTFE bushes for sliding and bearing applications', 1),
  ('peek-tubes', 'PEEK Tubes', 'High-temperature, chemically resistant PEEK tubes for critical services', 1),
  ('stock-shapes', 'Stock Shapes', 'Rods, sheets, tubes and profiles in engineering plastics', 20),
  ('sintered-plastics', 'Sintered Plastics', 'High-performance sintered plastic stock shapes for demanding environments', 10)
ON CONFLICT (id) DO NOTHING;
