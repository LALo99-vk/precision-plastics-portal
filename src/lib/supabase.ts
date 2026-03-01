import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Public URL for a file in storage (use this so images load; getPublicUrl() can return URLs that 400 without /public/). */
export function getStoragePublicUrl(bucket: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path.replace(/^\//, '')}`;
}

/** Rewrite storage URL to use /object/public/ so it loads (fixes 400 on existing saved URLs). */
export function ensurePublicStorageUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('/object/public/')) return url;
  const match = url.match(/^(https?:\/\/[^/]+)\/storage\/v1\/object\/([^/]+)\/(.+)$/);
  if (match) {
    const [, base, bucket, path] = match;
    return `${base}/storage/v1/object/public/${bucket}/${path}`;
  }
  return url;
}

// Database types
export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  image?: string;
  status?: 'draft' | 'published' | 'hidden' | 'discontinued' | 'out_of_stock';
  available?: boolean;
  price?: number;
  price_on_request?: boolean;
  properties?: {
    thermal?: boolean;
    electrical?: boolean;
    chemical?: boolean;
  };
  specifications?: Record<string, string>;
  materials?: string[];
  industries?: string[];
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
  bucket_name: string;
  display_order: number;
  is_primary: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  variant_label?: string;
  display_order: number;
  created_at?: string;
}

export interface ProductFile {
  id: string;
  product_id: string;
  file_path: string;
  bucket_name: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  created_at?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_review' | 'responded' | 'closed';
  admin_notes?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuotationInquiry {
  id: string;
  inquiry_number: string;
  customer_name: string;
  customer_company: string;
  customer_email: string;
  customer_phone?: string;
  message?: string;
  status: 'new' | 'in_review' | 'quoted' | 'closed';
  admin_notes?: string;
  quoted_at?: string;
  closed_at?: string;
  created_at?: string;
  updated_at?: string;
  /** Size/dimensions and other requirements for the product */
  size_requirements?: string;
  /** Whether delivery is needed */
  delivery_required?: boolean;
  /** Full address for delivery or company */
  company_address?: string;
  /** GSTIN, registration, or other company details */
  company_details?: string;
  /** WhatsApp number for sending quotation */
  whatsapp_number?: string;
  /** Product name/description when customer couldn't find it on site (request-a-quote for unlisted product) */
  product_looking_for?: string;
}

export interface QuotationItem {
  id: string;
  inquiry_id: string;
  product_id?: string;
  product_name: string;
  product_category: string;
  quantity: number;
  notes?: string;
  created_at?: string;
}

export interface InquiryAttachment {
  id: string;
  inquiry_id: string;
  file_path: string;
  bucket_name: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  created_at?: string;
}

export interface InquiryHistory {
  id: string;
  inquiry_id: string;
  status_from?: string;
  status_to: string;
  admin_user?: string;
  notes?: string;
  created_at?: string;
}

export interface Material {
  id: string;
  name: string;
  fullName: string;
  tier: 'high-performance' | 'engineering' | 'standard';
  description: string;
  maxTemp?: string;
  applications?: string[];
  industries?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  status?: 'draft' | 'published' | 'hidden' | 'archived';
  productCount?: number;
  created_at?: string;
  updated_at?: string;
}

export type RotatingMessageType = 'quote' | 'offer' | 'notice' | 'general';

export interface RotatingMessage {
  id: string;
  message: string;
  type: RotatingMessageType;
  duration_seconds: number;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PriceListFolder {
  id: string;
  title: string;
  parent_id: string | null;
  sort_order: number;
  created_at?: string;
}

export interface PriceListSheet {
  id: string;
  title: string;
  file_path: string;
  folder_id: string | null;
  sort_order: number;
  created_at?: string;
}

export interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  sort_order: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}
