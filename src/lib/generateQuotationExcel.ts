import ExcelJS from 'exceljs';
import { quotationTemplate } from '@/config/quotationTemplate';
import type { QuotationInquiry, QuotationItem } from '@/lib/supabase';

export interface QuotationLineItem extends QuotationItem {
  unitPrice: number;
  amount: number;
}

export interface QuotationFormData {
  items: QuotationLineItem[];
  deliveryCharge: number;
  taxPercent: number;
  notes: string;
}

/**
 * Fetch image from public path and return as base64 (for logo in Excel).
 * Returns null if fetch fails or path is empty.
 */
async function getLogoBase64(logoPath: string): Promise<{ base64: string; extension: 'png' | 'jpeg' | 'gif' } | null> {
  if (!logoPath.trim()) return null;
  try {
    const url = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const ext = (blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpeg' : 'gif') as 'png' | 'jpeg' | 'gif';
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        if (base64) resolve({ base64, extension: ext });
        else resolve(null);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Generate quotation Excel from inquiry + admin-entered prices.
 * Returns blob for download. Template text comes from quotationTemplate config (editable).
 */
export async function generateQuotationExcel(
  inquiry: QuotationInquiry,
  formData: QuotationFormData,
): Promise<Blob> {
  const t = quotationTemplate;
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Quotation', { views: [{ state: 'frozen', ySplit: 1 }] });

  let startRow = 1;

  // Logo (optional) – editable via t.logoPath
  if (t.logoPath) {
    const logo = await getLogoBase64(t.logoPath);
    if (logo) {
      const imageId = workbook.addImage({
        extension: logo.extension,
        base64: logo.base64,
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 60 },
      });
      startRow = 5; // leave space for logo
    }
  }

  // Company name & details (editable in quotationTemplate)
  sheet.getCell(startRow, 1).value = t.companyName;
  sheet.getCell(startRow, 1).font = { bold: true, size: 14 };
  startRow++;
  if (t.companyTagline) {
    sheet.getCell(startRow, 1).value = t.companyTagline;
    startRow++;
  }
  t.companyAddress.forEach((line) => {
    sheet.getCell(startRow, 1).value = line;
    startRow++;
  });
  if (t.companyPhone) {
    sheet.getCell(startRow, 1).value = `Tel: ${t.companyPhone}`;
    startRow++;
  }
  if (t.companyEmail) {
    sheet.getCell(startRow, 1).value = t.companyEmail;
    startRow++;
  }
  if (t.companyWebsite) {
    sheet.getCell(startRow, 1).value = t.companyWebsite;
    startRow++;
  }
  startRow += 2;

  // Quotation title and ref
  sheet.getCell(startRow, 1).value = t.quotationTitle;
  sheet.getCell(startRow, 1).font = { bold: true, size: 12 };
  startRow++;
  sheet.getCell(startRow, 1).value = `Ref: ${inquiry.inquiry_number}`;
  sheet.getCell(startRow + 1, 1).value = `Date: ${new Date().toLocaleDateString()}`;
  startRow += 3;

  // Customer block
  sheet.getCell(startRow, 1).value = 'Customer';
  sheet.getCell(startRow, 1).font = { bold: true };
  startRow++;
  sheet.getCell(startRow, 1).value = inquiry.customer_name;
  sheet.getCell(startRow + 1, 1).value = inquiry.customer_company;
  sheet.getCell(startRow + 2, 1).value = inquiry.customer_email;
  sheet.getCell(startRow + 3, 1).value = inquiry.customer_phone || '-';
  startRow += 5;

  // Items table headers (editable column labels)
  const headerRow = startRow;
  sheet.getCell(startRow, 1).value = t.columnHeaders.item;
  sheet.getCell(startRow, 2).value = t.columnHeaders.category;
  sheet.getCell(startRow, 3).value = t.columnHeaders.quantity;
  sheet.getCell(startRow, 4).value = t.columnHeaders.unitPrice;
  sheet.getCell(startRow, 5).value = t.columnHeaders.amount;
  [1, 2, 3, 4, 5].forEach((c) => {
    sheet.getCell(startRow, c).font = { bold: true };
  });
  startRow++;

  let subtotal = 0;
  formData.items.forEach((item) => {
    sheet.getCell(startRow, 1).value = item.product_name;
    sheet.getCell(startRow, 2).value = item.product_category;
    sheet.getCell(startRow, 3).value = item.quantity;
    sheet.getCell(startRow, 4).value = item.unitPrice;
    sheet.getCell(startRow, 5).value = item.amount;
    subtotal += item.amount;
    startRow++;
  });

  startRow++;
  const delivery = formData.deliveryCharge || 0;
  const taxRate = (formData.taxPercent || 0) / 100;
  const taxAmount = (subtotal + delivery) * taxRate;
  const total = subtotal + delivery + taxAmount;

  sheet.getCell(startRow, 4).value = t.deliveryLabel;
  sheet.getCell(startRow, 5).value = delivery;
  startRow++;
  sheet.getCell(startRow, 4).value = t.taxLabel;
  sheet.getCell(startRow, 5).value = taxAmount;
  startRow++;
  sheet.getCell(startRow, 4).value = t.totalLabel;
  sheet.getCell(startRow, 4).font = { bold: true };
  sheet.getCell(startRow, 5).value = total;
  sheet.getCell(startRow, 5).font = { bold: true };
  startRow += 2;

  // Terms (editable default + per-quotation notes)
  sheet.getCell(startRow, 1).value = formData.notes || t.defaultTerms;
  sheet.getCell(startRow, 1).alignment = { wrapText: true };
  sheet.mergeCells(startRow, 1, startRow, 5);

  // Column widths
  sheet.getColumn(1).width = 28;
  sheet.getColumn(2).width = 18;
  sheet.getColumn(3).width = 8;
  sheet.getColumn(4).width = 12;
  sheet.getColumn(5).width = 12;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return blob;
}

/** Trigger browser download of a blob with the given filename */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
