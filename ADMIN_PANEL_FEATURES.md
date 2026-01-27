# Admin Panel Features Documentation

## Overview

The admin panel is a comprehensive backend management system for Nyloking & Co's industrial catalog website. It uses Supabase for authentication, database, and storage.

## Authentication

- **Method**: Supabase Auth (email/password)
- **Access**: Any authenticated user is considered an admin
- **Login Route**: `/admin/login`
- **Session Management**: Automatic session handling with Supabase

## Product Management (`/admin`)

### Core Features

1. **Product CRUD Operations**
   - Create, Read, Update, Delete products
   - Soft delete (uses `deleted_at` field, never hard-deletes)

2. **Product Status Management**
   - Draft
   - Published
   - Hidden
   - Discontinued

3. **Availability Toggle**
   - Available / Unavailable flag

4. **Pricing**
   - Price field (decimal)
   - "Price on Request" toggle

5. **Product Grouping**
   - Category selection (12 predefined categories)
   - Subcategory (optional)
   - Materials (comma-separated array)
   - Industries (comma-separated array)
   - Properties (thermal, electrical, chemical checkboxes)

### Image Management

- **Multiple Images per Product**
  - Upload multiple images
  - Set primary image
  - Reorder images (via display_order)
  - Delete images
  - Images stored in Supabase Storage (`product-images` bucket)

### Product Variants

- **Structured Variant System**
  - Add variants (size, grade, thickness, color, etc.)
  - Each variant has: type, value, label, display_order
  - Variants stored in `product_variants` table

### File Management

- **PDF/Document Upload**
  - Upload datasheets, compliance documents, certificates
  - Files stored in Supabase Storage (`product-files` bucket)
  - File metadata stored in `product_files` table

### Bulk Operations

- Select multiple products via checkboxes
- Bulk actions:
  - Publish
  - Hide
  - Mark Available
  - Mark Unavailable
  - Set Price on Request
  - Delete (soft delete)

### Search & Filters

- **Search**: By name, description, materials, industries
- **Filters**:
  - Status (draft, published, hidden, discontinued)
  - Category
  - Date range (via filters)

## Material Management (`/admin/materials`)

- Create, Edit, Delete materials
- Organize by tier (High-Performance, Engineering, Standard)
- Fields: name, fullName, tier, description, maxTemp, applications, industries

## Inquiry Management (`/admin/inquiries`)

### Quotation Inquiries Tab

- **View All Inquiries**
  - Inquiry number (auto-generated: Q-YYYYMMDD-XXXX)
  - Customer details
  - Status tracking
  - Date filtering

- **Inquiry Details**
  - Full customer information
  - Selected products with quantities
  - Attachments (files uploaded by customer)
  - Admin notes (internal only)
  - Status history timeline

- **Status Workflow**
  - New → In Review → Quoted → Closed
  - Status changes logged in `inquiry_history` table
  - Timestamps for quoted_at, closed_at

### Contact Submissions Tab

- View contact form submissions
- Status tracking: New → In Review → Responded → Closed
- Admin notes support

### Search & Filters

- Search by: inquiry number, customer name, company, email
- Filter by: status, date range
- Works for both quotations and contacts

## Frontend Integration

### Contact Form (`/contact`)
- Saves submissions to `contact_submissions` table
- Includes: name, company, email, phone, subject, message

### Quote Cart (`/quote-cart`)
- Creates `quotation_inquiries` record
- Creates `quotation_items` for each product in cart
- Supports file attachments (saved to `inquiry-attachments` bucket)
- Auto-generates inquiry numbers

## Database Schema

### Core Tables

- `products` - Main product catalog
- `product_images` - Multiple images per product
- `product_variants` - Product variants (size, grade, etc.)
- `product_files` - PDFs and documents
- `materials` - Material catalog
- `quotation_inquiries` - Quotation requests
- `quotation_items` - Products in each inquiry
- `inquiry_attachments` - Files attached to inquiries
- `inquiry_history` - Status change timeline
- `contact_submissions` - Contact form submissions

### Storage Buckets

- `product-images` - Product photos
- `product-files` - PDFs, datasheets, compliance docs
- `inquiry-attachments` - Files uploaded with inquiries

## Security

- **RLS Policies**: 
  - Public read access for products/materials (for frontend)
  - Authenticated users only for admin operations
  - Public insert for contact/inquiry forms

- **Soft Deletes**: All deletions use `deleted_at` timestamp
- **Data Preservation**: Inquiry data preserved even if products are discontinued

## UI/UX

- **Table-based layouts** for efficient data viewing
- **Functional design** optimized for daily use
- **Clear confirmations** for destructive actions
- **Search and filter** for quick access
- **Bulk operations** for efficiency
- **No animations** - fast and predictable

## Setup Requirements

1. Run `supabase-setup.sql` first
2. Run `supabase-extended-schema.sql` for extended features
3. Create storage buckets: `product-images`, `product-files`, `inquiry-attachments`
4. Set up Supabase Auth users (admin accounts)
5. Configure environment variables

## Notes

- All timestamps use UTC
- Inquiry numbers auto-generate with date prefix
- Status changes are logged automatically
- Images/files stored as paths in database, not raw data
- Supports product variants without duplicating products
