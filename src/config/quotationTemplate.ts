/**
 * Quotation template – editable company details and layout.
 * Change these values to match your branding. Logo path is relative to public (e.g. /images/logo.png).
 */
export const quotationTemplate = {
  /** Company name shown on the quotation */
  companyName: 'Nyloking & Co.',
  /** Short tagline or legal name (optional) */
  companyTagline: 'Precision Plastics',
  /** Address lines (each item is a new line) */
  companyAddress: ['Your address line 1', 'City, State, Postal Code', 'Country'],
  /** Phone (optional) */
  companyPhone: '',
  /** Email (optional) */
  companyEmail: '',
  /** Website (optional) */
  companyWebsite: '',
  /**
   * Logo image path (e.g. /images/company-logo.png).
   * Put your logo in public/images/ and set this. Leave empty to hide logo.
   */
  logoPath: '/Users/test/NylokingCo/precision-plastics-portal/public/images/home/logo.png',
  /** Default terms and conditions text at the bottom of the quotation */
  defaultTerms: 'Prices valid for 30 days. Payment terms as agreed. Delivery subject to availability.',
  /** Column headers for the items table (edit if you use different labels) */
  columnHeaders: {
    item: 'Item / Product',
    category: 'Category',
    quantity: 'Qty',
    unitPrice: 'Unit Price',
    amount: 'Amount',
  },
  /** Label for delivery charge row */
  deliveryLabel: 'Delivery',
  /** Label for tax row */
  taxLabel: 'Tax',
  /** Label for total row */
  totalLabel: 'Total',
  /** Quotation title (e.g. "QUOTATION" or "PRICE QUOTE") */
  quotationTitle: 'QUOTATION',
} as const;

export type QuotationTemplate = typeof quotationTemplate;
