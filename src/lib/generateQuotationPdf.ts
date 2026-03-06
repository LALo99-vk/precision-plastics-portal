import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { quotationTemplate } from '@/config/quotationTemplate';
import { amountToWords } from '@/lib/amountToWords';
import type { QuotationInquiry, QuotationPdfLineItem } from '@/lib/supabase';

export interface QuotationPdfFormData {
  proformaNumber: string;
  date: string;
  poNumber: string;
  placeOfSupply: string;
  transport: string;
  delivery: string;
  items: QuotationPdfLineItem[];
  remark: string;
}

async function fetchLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch(quotationTemplate.logoPath);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateQuotationPdf(
  inquiry: QuotationInquiry,
  formData: QuotationPdfFormData,
): Promise<Blob> {
  const t = quotationTemplate;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 8;
  const contentW = pageW - margin * 2;
  let y = margin;

  const drawRect = (x: number, yy: number, w: number, h: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, yy, w, h);
  };

  // ─── HEADER ───────────────────────────────────────────────
  const headerH = 32;
  drawRect(margin, y, contentW, headerH);

  const logoData = await fetchLogoBase64();
  if (logoData) {
    doc.addImage(logoData, 'PNG', margin + 2, y + 2, 26, 26);
  }

  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text(t.companyName, pageW / 2, y + 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  doc.text(t.companyTagline, pageW / 2, y + 15, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(t.companyAddress, pageW / 2, y + 20, { align: 'center' });
  doc.text(`Ph. - , ${t.companyPhone}`, pageW / 2, y + 24, { align: 'center' });
  doc.text(`Email : ${t.companyEmail},  Website : ${t.companyWebsite}`, pageW / 2, y + 28, { align: 'center' });

  y += headerH;

  // ─── GSTIN / PROFORMA INVOICE / Original ──────────────────
  const titleH = 7;
  drawRect(margin, y, contentW, titleH);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTIN No.    ${t.gstin}`, margin + 2, y + 5);
  doc.setFontSize(9);
  doc.text('PROFORMA INVOICE', pageW / 2, y + 5, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Original for Recipient', pageW - margin - 2, y + 5, { align: 'right' });
  y += titleH;

  // ─── BILLED TO / REFERENCE FIELDS ────────────────────────
  const leftW = contentW * 0.48;
  const rightW = contentW - leftW;
  const infoH = 42;

  drawRect(margin, y, leftW, infoH);
  drawRect(margin + leftW, y, rightW, infoH);

  // Left: Receiver / Billed to
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Details of Receiver | Billed to', margin + 2, y + 5);
  doc.setFont('helvetica', 'normal');
  const custCompany = inquiry.customer_company || '';
  const custAddr = inquiry.company_address || '';
  const addrLines = doc.splitTextToSize(custAddr, leftW - 6);
  let ly = y + 10;
  doc.setFont('helvetica', 'bold');
  doc.text(custCompany, margin + 2, ly); ly += 4;
  doc.setFont('helvetica', 'normal');
  addrLines.forEach((line: string) => { doc.text(line, margin + 2, ly); ly += 3.5; });
  doc.text(`State    ${t.state}          Code    ${t.stateCode}`, margin + 2, ly); ly += 4;
  doc.text(`GSTIN No.    ${inquiry.company_details || ''}`, margin + 2, ly);

  // Right: Reference fields
  const rx = margin + leftW + 2;
  const rvW = rightW - 4;
  let ry = y + 5;
  const field = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(label, rx, ry);
    doc.text(value, rx + rvW * 0.45, ry);
    ry += 5;
  };
  field('Proforma No', formData.proformaNumber);
  field('Date', formData.date);
  field('Your P.O.No', formData.poNumber);
  field('Place of Supply', formData.placeOfSupply);
  field('Transport', formData.transport);
  field('L.R. No', '');
  field('Delivery', formData.delivery);

  y += infoH;

  // ─── CONSIGNEE / SHIP TO ──────────────────────────────────
  const shipH = 26;
  drawRect(margin, y, leftW, shipH);
  drawRect(margin + leftW, y, rightW, shipH);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Details of Consignee | Ship to', margin + 2, y + 5);
  doc.setFont('helvetica', 'normal');
  let sy = y + 10;
  doc.setFont('helvetica', 'bold');
  doc.text(custCompany, margin + 2, sy); sy += 4;
  doc.setFont('helvetica', 'normal');
  const shipAddr = doc.splitTextToSize(custAddr, leftW - 6);
  shipAddr.forEach((line: string) => { doc.text(line, margin + 2, sy); sy += 3.5; });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Vehicle No', margin + leftW + 2, y + 5);
  doc.text('', margin + leftW + 2 + rvW * 0.45, y + 5);

  y += shipH;

  // ─── ITEMS TABLE ──────────────────────────────────────────
  const head = [['Sr\nNo', 'Description', 'HSN code', 'Qty', 'Unit', 'Rate', 'Disc\n(%)', 'GST', 'Amount']];
  const body = formData.items.map((item, i) => [
    String(i + 1),
    item.description,
    item.hsn_code,
    String(item.qty),
    item.unit,
    item.rate.toFixed(3),
    item.discount_percent > 0 ? item.discount_percent.toFixed(1) : '',
    item.gst_percent.toFixed(2),
    item.amount.toFixed(2),
  ]);

  const totalQty = formData.items.reduce((s, it) => s + it.qty, 0);
  body.push(['', '', '', String(totalQty), '', '', '', 'Total', '']);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 6.5, halign: 'center', lineWidth: 0.3, lineColor: [0, 0, 0] },
    bodyStyles: { fontSize: 6.5, textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [0, 0, 0] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 42 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 14 },
      8: { halign: 'right', cellWidth: contentW - 8 - 42 - 20 - 14 - 12 - 18 - 12 - 14 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.row.index === body.length - 1) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY;

  // ─── TOTALS BLOCK ─────────────────────────────────────────
  const subtotal = formData.items.reduce((s, it) => s + it.amount, 0);
  const gstAmounts: Record<string, number> = {};
  formData.items.forEach((it) => {
    const key = `${it.gst_percent}%`;
    const taxable = it.amount;
    const tax = taxable * (it.gst_percent / 100);
    gstAmounts[key] = (gstAmounts[key] || 0) + tax;
  });
  const totalTax = Object.values(gstAmounts).reduce((s, v) => s + v, 0);
  const grandTotal = subtotal + totalTax;

  const totalsH = 22;
  drawRect(margin, y, contentW, totalsH);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  // Left side: taxable amt / GST breakdowns
  let ty = y + 5;
  Object.entries(gstAmounts).forEach(([pct, amt]) => {
    doc.text(`${pct} GST`, margin + 2, ty);
    doc.text('Taxable Amt', margin + 28, ty);
    doc.text('IGST AMT', margin + leftW + 2, ty);
    ty += 5;
    doc.text(subtotal.toFixed(2), margin + 28, ty);
    doc.text(amt.toFixed(2), margin + leftW + 2, ty);
    ty += 5;
  });
  doc.text(`Total     ${subtotal.toFixed(2)}`, margin + 2, ty);
  doc.text(totalTax.toFixed(2), margin + leftW + 2, ty);

  // Right side
  const rx2 = margin + leftW + rightW * 0.35;
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Before Tax', rx2, y + 5);
  doc.text(subtotal.toFixed(2), pageW - margin - 2, y + 5, { align: 'right' });
  doc.text('IGST Amt.', rx2, y + 10);
  doc.text(totalTax.toFixed(2), pageW - margin - 2, y + 10, { align: 'right' });

  y += totalsH;

  // ─── GRAND TOTAL + AMOUNT IN WORDS ────────────────────────
  const gtH = 7;
  drawRect(margin, y, contentW, gtH);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`RUPEES : ${amountToWords(grandTotal).replace('RUPEES : ', '')}`, margin + 2, y + 5);
  doc.text('G.Total Amount', margin + leftW + rightW * 0.35, y + 5);
  doc.text(grandTotal.toFixed(2), pageW - margin - 2, y + 5, { align: 'right' });
  y += gtH;

  // ─── REMARK + PAYMENT ─────────────────────────────────────
  const remH = 7;
  drawRect(margin, y, contentW, remH);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Remark    ${formData.remark}`, margin + 2, y + 5);
  doc.text('Payment Days', margin + leftW + rightW * 0.35, y + 5);
  y += remH;

  // ─── BANK DETAILS ─────────────────────────────────────────
  const bankH = 28;
  drawRect(margin, y, contentW, bankH);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');

  const bank = (b: typeof t.banks[0], bx: number) => {
    let by = y + 5;
    doc.text(`Bank Name  : ${b.bankName}`, bx, by); by += 4;
    doc.text(`A/c. No.   : ${b.accountNo}`, bx, by); by += 4;
    doc.text(`IFSC Code  : ${b.ifsc}`, bx, by); by += 4;
    doc.text(`Branch     : ${b.branch}`, bx, by); by += 4;
  };
  bank(t.banks[0], margin + 2);
  bank(t.banks[1], margin + leftW + 2);
  doc.text(`PAN NO.${t.panNo}.`, margin + leftW + 2, y + 21);
  doc.text(`MSME:${t.msme}`, margin + leftW + 2, y + 25);

  doc.text('Total Pkg.', margin + leftW + rightW * 0.6, y + 5);

  y += bankH;

  // ─── TERMS + SIGNATURE ────────────────────────────────────
  const termsH = 30;
  drawRect(margin, y, contentW, termsH);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Condition', margin + 2, y + 5);

  doc.setFont('helvetica', 'normal');
  let tty = y + 10;
  t.terms.forEach((term) => {
    doc.text(term, margin + 2, tty);
    tty += 4;
  });

  doc.setFont('helvetica', 'normal');
  doc.text('E.& O.E.', pageW - margin - 2, y + 5, { align: 'right' });
  doc.setFont('times', 'bold');
  doc.text(`For, ${t.companyName.replace(' .,', '')}`, pageW - margin - 2, y + 12, { align: 'right' });
  doc.text('(Authorised Signatory)', pageW - margin - 2, y + 26, { align: 'right' });

  y += termsH;

  // ─── OUTPUT ───────────────────────────────────────────────
  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
