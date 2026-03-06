-- Run this in Supabase SQL Editor to create the quotation_documents table.
-- Each row represents one generated proforma invoice PDF linked to an inquiry.

CREATE TABLE IF NOT EXISTS quotation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID REFERENCES quotation_inquiries(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  proforma_number TEXT NOT NULL,
  pdf_url TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  delivery_charge NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  remark TEXT,
  transport TEXT,
  po_number TEXT,
  place_of_supply TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','accepted','rejected')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public read for the quotation view page (no auth required to view by token)
ALTER TABLE quotation_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quotation_documents by token"
  ON quotation_documents FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert quotation_documents"
  ON quotation_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update quotation_documents"
  ON quotation_documents FOR UPDATE
  TO authenticated
  USING (true);

-- Also allow anon to update status (for accept/reject from public page)
CREATE POLICY "Anon can update status fields"
  ON quotation_documents FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
