-- Extended Supabase Schema for Nyloking & Co Admin Panel
-- Run this AFTER the initial supabase-setup.sql

-- Update products table with new fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden', 'discontinued'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_on_request BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'product-images',
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, display_order)
);

-- Create product_variants table for structured variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- 'size', 'grade', 'thickness', 'color', etc.
  variant_value TEXT NOT NULL,
  variant_label TEXT, -- Display label
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, variant_type, variant_value)
);

-- Create product_files table for PDFs and documents
CREATE TABLE IF NOT EXISTS product_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'product-files',
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'datasheet', 'compliance', 'certificate', etc.
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'responded', 'closed')),
  admin_notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotation_inquiries table
CREATE TABLE IF NOT EXISTS quotation_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_number TEXT UNIQUE NOT NULL, -- Generated: Q-YYYYMMDD-XXXX
  customer_name TEXT NOT NULL,
  customer_company TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'quoted', 'closed')),
  admin_notes TEXT,
  quoted_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotation_items table (products in cart)
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES quotation_inquiries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Snapshot for discontinued products
  product_category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiry_attachments table for file uploads
CREATE TABLE IF NOT EXISTS inquiry_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES quotation_inquiries(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'inquiry-attachments',
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inquiry_history table for timeline tracking
CREATE TABLE IF NOT EXISTS inquiry_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inquiry_id UUID NOT NULL REFERENCES quotation_inquiries(id) ON DELETE CASCADE,
  status_from TEXT,
  status_to TEXT NOT NULL,
  admin_user TEXT, -- Can store admin email/ID if using Supabase Auth
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_quotation_inquiries_status ON quotation_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_quotation_inquiries_created_at ON quotation_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_quotation_inquiries_customer_email ON quotation_inquiries(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotation_items_inquiry_id ON quotation_items(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Function to generate inquiry numbers
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  seq_num INTEGER;
  new_number TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(inquiry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM quotation_inquiries
  WHERE inquiry_number LIKE 'Q-' || date_part || '-%';
  
  new_number := 'Q-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate inquiry numbers
CREATE OR REPLACE FUNCTION set_inquiry_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inquiry_number IS NULL OR NEW.inquiry_number = '' THEN
    NEW.inquiry_number := generate_inquiry_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_inquiry_number
  BEFORE INSERT ON quotation_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_inquiry_number();

-- Trigger to log inquiry status changes
CREATE OR REPLACE FUNCTION log_inquiry_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO inquiry_history (inquiry_id, status_from, status_to, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status changed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_inquiry_status
  AFTER UPDATE ON quotation_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION log_inquiry_status_change();

-- Update triggers for updated_at
CREATE TRIGGER update_quotation_inquiries_updated_at BEFORE UPDATE ON quotation_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only for sensitive tables
CREATE POLICY "Allow authenticated users to manage product_images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage product_variants" ON product_variants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage product_files" ON product_files
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage contact_submissions" ON contact_submissions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage quotation_inquiries" ON quotation_inquiries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage quotation_items" ON quotation_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage inquiry_attachments" ON inquiry_attachments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage inquiry_history" ON inquiry_history
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public to insert contact submissions and quotations (for frontend forms)
CREATE POLICY "Allow public to insert contact_submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert quotation_inquiries" ON quotation_inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert quotation_items" ON quotation_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to insert inquiry_attachments" ON inquiry_attachments
  FOR INSERT WITH CHECK (true);
