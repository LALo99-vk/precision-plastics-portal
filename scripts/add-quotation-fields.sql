-- Run this in Supabase SQL Editor to add new quotation request fields.
-- These columns are used by the Quotation Request form and Admin Inquiries.

ALTER TABLE quotation_inquiries
  ADD COLUMN IF NOT EXISTS size_requirements TEXT,
  ADD COLUMN IF NOT EXISTS delivery_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_address TEXT,
  ADD COLUMN IF NOT EXISTS company_details TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- For "product not listed" requests: what the customer is looking for
ALTER TABLE quotation_inquiries
  ADD COLUMN IF NOT EXISTS product_looking_for TEXT;
