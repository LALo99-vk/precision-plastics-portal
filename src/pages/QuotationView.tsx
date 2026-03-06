import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, CheckCircle, XCircle, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase, QuotationDocument, QuotationInquiry, QuotationPdfLineItem } from '@/lib/supabase';
import { quotationTemplate } from '@/config/quotationTemplate';
import { amountToWords } from '@/lib/amountToWords';

export default function QuotationView() {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<QuotationDocument | null>(null);
  const [inquiry, setInquiry] = useState<QuotationInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  // Email verification gate
  const [verified, setVerified] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    if (token) fetchQuotationMeta(token);
  }, [token]);

  // Step 1: fetch document + inquiry email (but don't expose details yet)
  const fetchQuotationMeta = async (t: string) => {
    try {
      const { data, error: fetchErr } = await supabase
        .from('quotation_documents')
        .select('*')
        .eq('token', t)
        .single();
      if (fetchErr || !data) { setError('Quotation not found or link is invalid.'); return; }
      setDoc(data);

      const { data: inq } = await supabase
        .from('quotation_inquiries')
        .select('*')
        .eq('id', data.inquiry_id)
        .single();
      if (inq) {
        setCustomerEmail(inq.customer_email.toLowerCase().trim());
        setInquiry(inq);
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const input = emailInput.toLowerCase().trim();
    if (input === customerEmail) {
      setVerified(true);
      setVerifyError('');
      // Mark as viewed
      if (doc && doc.status === 'sent') {
        supabase.from('quotation_documents').update({ status: 'viewed', viewed_at: new Date().toISOString() }).eq('id', doc.id);
        setDoc({ ...doc, status: 'viewed', viewed_at: new Date().toISOString() });
      }
    } else {
      setVerifyError('Email does not match our records. Please use the email you provided when requesting the quote.');
    }
  };

  const handleAccept = async () => {
    if (!doc) return;
    await supabase.from('quotation_documents').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', doc.id);
    setDoc({ ...doc, status: 'accepted' });
    setActionDone(true);
  };

  const handleReject = async () => {
    if (!doc) return;
    await supabase.from('quotation_documents').update({ status: 'rejected', rejected_at: new Date().toISOString() }).eq('id', doc.id);
    setDoc({ ...doc, status: 'rejected' });
    setActionDone(true);
  };

  const t = quotationTemplate;
  const items: QuotationPdfLineItem[] = (doc?.line_items as QuotationPdfLineItem[]) || [];
  const subtotal = Number(doc?.subtotal || 0);
  const taxAmount = Number(doc?.tax_amount || 0);
  const grandTotal = Number(doc?.total_amount || 0);

  const statusColors: Record<string, string> = { draft: 'bg-gray-400', sent: 'bg-blue-500', viewed: 'bg-yellow-500', accepted: 'bg-green-600', rejected: 'bg-red-500' };

  // Loading state
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-400 uppercase tracking-wider">Loading quotation...</p>
    </div>
  );

  // Not found
  if (error || !doc) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <FileText className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-xl font-bold mb-2">Quotation Not Found</h1>
      <p className="text-gray-500 mb-6">{error || 'The link may be expired or invalid.'}</p>
      <Link to="/" className="text-sm font-medium text-primary hover:underline">Go to homepage</Link>
    </div>
  );

  // Email verification gate
  if (!verified) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border p-6 sm:p-8">
          <div className="text-center mb-6">
            <img src={t.logoPath} alt="Logo" className="h-12 mx-auto mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <h1 className="text-lg font-bold">{t.companyName}</h1>
            <p className="text-xs text-gray-500 tracking-wider">{t.companyTagline}</p>
          </div>
          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <Lock className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500">
              For security, please verify your email to view this quotation.
            </p>
          </div>
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <Label htmlFor="verify-email">Your email address</Label>
              <Input
                id="verify-email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setVerifyError(''); }}
                placeholder="Enter the email you used for the quote request"
                className="mt-1"
              />
              {verifyError && <p className="text-xs text-red-500 mt-1">{verifyError}</p>}
            </div>
            <Button type="submit" className="w-full">Verify & View Quotation</Button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            Quotation #{doc.proforma_number}
          </p>
        </div>
      </div>
    </div>
  );

  // Verified — show full quotation
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <img src={t.logoPath} alt="Logo" className="h-14 mx-auto mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-xl sm:text-2xl font-bold">{t.companyName}</h1>
          <p className="text-xs text-gray-500 font-semibold tracking-wider">{t.companyTagline}</p>
          <p className="text-xs text-gray-400 mt-1">{t.companyAddress}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-white rounded-xl border p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Proforma Invoice</h2>
              <p className="text-sm text-gray-500 font-mono">{doc.proforma_number}</p>
            </div>
            <Badge className={statusColors[doc.status] || 'bg-gray-400'}>{doc.status}</Badge>
          </div>

          {inquiry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-6 pb-4 border-b">
              <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Customer</span>{inquiry.customer_name}</div>
              <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Company</span>{inquiry.customer_company}</div>
              {doc.place_of_supply && <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Place of Supply</span>{doc.place_of_supply}</div>}
              {doc.transport && <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Transport</span>{doc.transport}</div>}
            </div>
          )}

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Items</h3>
            <div className="hidden sm:block border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium text-gray-600">#</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Description</th>
                    <th className="px-3 py-2 font-medium text-gray-600">HSN</th>
                    <th className="px-3 py-2 font-medium text-gray-600 text-center">Qty</th>
                    <th className="px-3 py-2 font-medium text-gray-600">Unit</th>
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Rate</th>
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">GST%</th>
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{item.description}</td>
                      <td className="px-3 py-2 text-gray-500">{item.hsn_code}</td>
                      <td className="px-3 py-2 text-center">{item.qty}</td>
                      <td className="px-3 py-2">{item.unit}</td>
                      <td className="px-3 py-2 text-right">{Number(item.rate).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{item.gst_percent}%</td>
                      <td className="px-3 py-2 text-right font-medium">{Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3">
              {items.map((item, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{item.description}</span>
                    <span className="font-bold text-sm">{Number(item.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    {item.hsn_code && <span>HSN: {item.hsn_code}</span>}
                    <span>Qty: {item.qty} {item.unit}</span>
                    <span>Rate: {Number(item.rate).toFixed(2)}</span>
                    <span>GST: {item.gst_percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-full sm:w-64 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Taxable Amount</span><span>{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">GST / IGST</span><span>{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-1"><span>Grand Total</span><span>{grandTotal.toFixed(2)}</span></div>
              <p className="text-xs text-gray-400 pt-1">{amountToWords(grandTotal)}</p>
            </div>
          </div>

          {doc.remark && (
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg mb-4">
              <span className="font-semibold">Remark:</span> {doc.remark}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border p-4 sm:p-6 space-y-4">
          {doc.pdf_url && (
            <Button className="w-full sm:w-auto" onClick={() => window.open(doc.pdf_url!, '_blank')}>
              <Download className="w-4 h-4 mr-2" />Download PDF
            </Button>
          )}

          {!actionDone && doc.status !== 'accepted' && doc.status !== 'rejected' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleAccept}>
                <CheckCircle className="w-4 h-4 mr-2" />Accept Quotation
              </Button>
              <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => setShowRejectForm(true)}>
                <XCircle className="w-4 h-4 mr-2" />Request Changes
              </Button>
            </div>
          )}

          {showRejectForm && (
            <div className="space-y-3 pt-2">
              <Textarea placeholder="What changes would you like? (optional)" value={rejectMessage} onChange={(e) => setRejectMessage(e.target.value)} rows={3} />
              <Button variant="destructive" onClick={handleReject}>Submit Request</Button>
            </div>
          )}

          {actionDone && doc.status === 'accepted' && (
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-green-800">Quotation Accepted</h3>
              <p className="text-sm text-green-600">Thank you! We will process your order shortly.</p>
            </div>
          )}

          {actionDone && doc.status === 'rejected' && (
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <XCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-orange-800">Changes Requested</h3>
              <p className="text-sm text-orange-600">We'll review your request and send an updated quotation.</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400 space-y-1 px-2">
          <p className="font-semibold text-gray-500">Terms & Conditions</p>
          {t.terms.map((term, i) => <p key={i}>{term}</p>)}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">{t.companyName} &middot; {t.companyAddress}</p>
      </main>
    </div>
  );
}
