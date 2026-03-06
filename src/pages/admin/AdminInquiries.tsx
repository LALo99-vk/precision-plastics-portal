import { useState, useEffect } from 'react';
import { Search, Eye, FileText, Download, Mail, MessageCircle, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, QuotationInquiry, QuotationItem, InquiryAttachment, InquiryHistory, ContactSubmission, QuotationDocument, QuotationPdfLineItem } from '@/lib/supabase';
import { generateQuotationPdf, downloadBlob, type QuotationPdfFormData } from '@/lib/generateQuotationPdf';
import { quotationTemplate } from '@/config/quotationTemplate';
import { toast } from 'sonner';

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<QuotationInquiry[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<QuotationInquiry[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<QuotationInquiry | null>(null);
  const [inquiryItems, setInquiryItems] = useState<QuotationItem[]>([]);
  const [inquiryAttachments, setInquiryAttachments] = useState<InquiryAttachment[]>([]);
  const [inquiryHistory, setInquiryHistory] = useState<InquiryHistory[]>([]);
  const [inquiryDocuments, setInquiryDocuments] = useState<QuotationDocument[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Quotation dialog state
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false);
  const [qfProformaNo, setQfProformaNo] = useState('');
  const [qfDate, setQfDate] = useState('');
  const [qfPoNumber, setQfPoNumber] = useState('');
  const [qfPlaceOfSupply, setQfPlaceOfSupply] = useState('');
  const [qfTransport, setQfTransport] = useState('');
  const [qfDelivery, setQfDelivery] = useState('READY STOCK');
  const [qfRemark, setQfRemark] = useState(quotationTemplate.defaultRemark);
  const [qfLineItems, setQfLineItems] = useState<QuotationPdfLineItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  useEffect(() => { fetchInquiries(); fetchContacts(); }, []);
  useEffect(() => { filterInquiries(); filterContacts(); }, [inquiries, contacts, searchQuery, statusFilter, dateFrom, dateTo]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase.from('quotation_inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) { toast.error('Failed to fetch inquiries: ' + error.message); }
    finally { setIsLoading(false); }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) { toast.error('Failed to fetch contacts: ' + error.message); }
  };

  const fetchInquiryDetails = async (inquiryId: string) => {
    const [itemsRes, attachmentsRes, historyRes, docsRes] = await Promise.all([
      supabase.from('quotation_items').select('*').eq('inquiry_id', inquiryId),
      supabase.from('inquiry_attachments').select('*').eq('inquiry_id', inquiryId),
      supabase.from('inquiry_history').select('*').eq('inquiry_id', inquiryId).order('created_at', { ascending: false }),
      supabase.from('quotation_documents').select('*').eq('inquiry_id', inquiryId).order('created_at', { ascending: false }),
    ]);
    if (itemsRes.data) setInquiryItems(itemsRes.data);
    if (attachmentsRes.data) setInquiryAttachments(attachmentsRes.data);
    if (historyRes.data) setInquiryHistory(historyRes.data);
    if (docsRes.data) setInquiryDocuments(docsRes.data);
  };

  const filterInquiries = () => {
    let filtered = [...inquiries];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.inquiry_number.toLowerCase().includes(q) || i.customer_name.toLowerCase().includes(q) || i.customer_company.toLowerCase().includes(q) || i.customer_email.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(i => i.status === statusFilter);
    if (dateFrom) filtered = filtered.filter(i => new Date(i.created_at || '') >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(i => new Date(i.created_at || '') <= new Date(dateTo + 'T23:59:59'));
    setFilteredInquiries(filtered);
  };

  const filterContacts = () => {
    let filtered = [...contacts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    if (dateFrom) filtered = filtered.filter(c => new Date(c.created_at || '') >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(c => new Date(c.created_at || '') <= new Date(dateTo + 'T23:59:59'));
    setFilteredContacts(filtered);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'quoted') updateData.quoted_at = new Date().toISOString();
      else if (newStatus === 'closed') updateData.closed_at = new Date().toISOString();
      const { error } = await supabase.from('quotation_inquiries').update(updateData).eq('id', inquiryId);
      if (error) throw error;
      toast.success('Status updated');
      fetchInquiries();
    } catch (error: any) { toast.error('Failed to update status: ' + error.message); }
  };

  const handleContactStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'responded') updateData.responded_at = new Date().toISOString();
      const { error } = await supabase.from('contact_submissions').update(updateData).eq('id', contactId);
      if (error) throw error;
      toast.success('Status updated');
      fetchContacts();
    } catch (error: any) { toast.error('Failed to update status: ' + error.message); }
  };

  const handleSaveNotes = async (inquiryId: string) => {
    try {
      const { error } = await supabase.from('quotation_inquiries').update({ admin_notes: adminNotes }).eq('id', inquiryId);
      if (error) throw error;
      toast.success('Notes saved');
      fetchInquiries();
    } catch (error: any) { toast.error('Failed to save notes: ' + error.message); }
  };

  const handleViewInquiry = async (inquiry: QuotationInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setIsDialogOpen(true);
    await fetchInquiryDetails(inquiry.id);
  };

  // ─── Quotation dialog ────────────────────────────────────
  const openQuotationDialog = () => {
    if (!selectedInquiry) return;
    setQfProformaNo(selectedInquiry.inquiry_number);
    setQfDate(new Date().toLocaleDateString('en-GB'));
    setQfPoNumber('');
    setQfPlaceOfSupply(selectedInquiry.company_address ? 'BENGALURU' : '');
    setQfTransport('');
    setQfDelivery('READY STOCK');
    setQfRemark(quotationTemplate.defaultRemark);
    setGeneratedDocId(null);
    setGeneratedToken(null);

    const items: QuotationPdfLineItem[] = inquiryItems.map((item) => ({
      description: item.product_name,
      hsn_code: '',
      qty: item.quantity,
      unit: 'NOS',
      rate: 0,
      discount_percent: 0,
      gst_percent: 18,
      amount: 0,
    }));
    if (items.length === 0) {
      items.push({ description: '', hsn_code: '', qty: 1, unit: 'NOS', rate: 0, discount_percent: 0, gst_percent: 18, amount: 0 });
    }
    setQfLineItems(items);
    setIsQuotationDialogOpen(true);
  };

  const updateLineItem = (index: number, field: keyof QuotationPdfLineItem, value: string | number) => {
    setQfLineItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      const discounted = item.rate * (1 - item.discount_percent / 100);
      item.amount = Math.round(item.qty * discounted * 100) / 100;
      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => {
    setQfLineItems(prev => [...prev, { description: '', hsn_code: '', qty: 1, unit: 'NOS', rate: 0, discount_percent: 0, gst_percent: 18, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setQfLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const qfSubtotal = qfLineItems.reduce((s, it) => s + it.amount, 0);
  const qfTaxAmount = qfLineItems.reduce((s, it) => s + it.amount * (it.gst_percent / 100), 0);
  const qfGrandTotal = qfSubtotal + qfTaxAmount;

  const handleGeneratePdf = async () => {
    if (!selectedInquiry) return;
    if (qfLineItems.length === 0 || qfLineItems.every(it => !it.description.trim())) {
      toast.error('Add at least one line item');
      return;
    }
    setIsGenerating(true);
    try {
      const formData: QuotationPdfFormData = {
        proformaNumber: qfProformaNo,
        date: qfDate,
        poNumber: qfPoNumber,
        placeOfSupply: qfPlaceOfSupply,
        transport: qfTransport,
        delivery: qfDelivery,
        items: qfLineItems,
        remark: qfRemark,
      };

      const blob = await generateQuotationPdf(selectedInquiry, formData);
      const token = generateToken();

      // Upload PDF to storage
      const filePath = `${selectedInquiry.id}/${token}.pdf`;
      const { error: uploadErr } = await supabase.storage.from('quotation-pdfs').upload(filePath, blob, { contentType: 'application/pdf', upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('quotation-pdfs').getPublicUrl(filePath);
      const pdfUrl = urlData.publicUrl;

      // Insert quotation document row
      const { data: doc, error: insertErr } = await supabase.from('quotation_documents').insert([{
        inquiry_id: selectedInquiry.id,
        token,
        proforma_number: qfProformaNo,
        pdf_url: pdfUrl,
        line_items: qfLineItems,
        subtotal: qfSubtotal,
        tax_amount: qfTaxAmount,
        delivery_charge: 0,
        total_amount: qfGrandTotal,
        remark: qfRemark,
        transport: qfTransport,
        po_number: qfPoNumber,
        place_of_supply: qfPlaceOfSupply,
        status: 'draft',
      }]).select().single();
      if (insertErr) throw insertErr;

      // Mark inquiry as quoted
      await supabase.from('quotation_inquiries').update({ status: 'quoted', quoted_at: new Date().toISOString() }).eq('id', selectedInquiry.id);

      downloadBlob(blob, `Quotation_${qfProformaNo.replace(/\s/g, '_')}.pdf`);
      setGeneratedDocId(doc?.id || null);
      setGeneratedToken(token);
      toast.success('PDF generated and saved. You can now send it to the customer.');
      fetchInquiries();
      await fetchInquiryDetails(selectedInquiry.id);
    } catch (error: any) {
      toast.error('Failed to generate PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuotationUrl = (token: string) => {
    const base = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
    return `${base.replace(/\/$/, '')}/quotation/${token}`;
  };

  const handleSendEmail = () => {
    if (!selectedInquiry || !generatedToken) return;
    const url = getQuotationUrl(generatedToken);
    const subject = encodeURIComponent(`Quotation ${qfProformaNo} - Nyloking & Co.`);
    const body = encodeURIComponent(`Dear ${selectedInquiry.customer_name},\n\nYour quotation is ready. Please view and download it here:\n${url}\n\nThank you,\nNyloking & Co.`);
    const mailtoLink = `mailto:${selectedInquiry.customer_email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    navigator.clipboard.writeText(url).then(() => toast.success('Quotation link copied to clipboard')).catch(() => {});
    if (generatedDocId) {
      supabase.from('quotation_documents').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', generatedDocId).then(() => {
        if (selectedInquiry) fetchInquiryDetails(selectedInquiry.id);
      });
    }
  };

  const handleSendWhatsApp = () => {
    if (!selectedInquiry || !generatedToken) return;
    const raw = selectedInquiry.whatsapp_number || selectedInquiry.customer_phone || '';
    const digits = raw.replace(/\D/g, '');
    const number = digits.startsWith('91') ? digits : digits ? `91${digits}` : '';
    if (!number) { toast.error('No WhatsApp or phone number available'); return; }
    const url = getQuotationUrl(generatedToken);
    const text = encodeURIComponent(`Dear ${selectedInquiry.customer_name}, your quotation ${qfProformaNo} from Nyloking & Co. is ready. View it here: ${url}`);
    window.open(`https://wa.me/${number}?text=${text}`, '_blank');
    if (generatedDocId) {
      supabase.from('quotation_documents').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', generatedDocId).then(() => {
        if (selectedInquiry) fetchInquiryDetails(selectedInquiry.id);
      });
    }
  };

  const handleSendExistingDoc = async (doc: QuotationDocument) => {
    if (!selectedInquiry) return;
    const url = getQuotationUrl(doc.token);
    const subject = encodeURIComponent(`Quotation ${doc.proforma_number} - Nyloking & Co.`);
    const body = encodeURIComponent(`Dear ${selectedInquiry.customer_name},\n\nYour quotation is ready:\n${url}\n\nThank you,\nNyloking & Co.`);
    window.open(`mailto:${selectedInquiry.customer_email}?subject=${subject}&body=${body}`, '_blank');
    navigator.clipboard.writeText(url).then(() => toast.success('Quotation link copied to clipboard')).catch(() => {});
    await supabase.from('quotation_documents').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', doc.id);
    await fetchInquiryDetails(selectedInquiry.id);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = { new: 'bg-blue-500', in_review: 'bg-yellow-500', quoted: 'bg-green-500', closed: 'bg-gray-500', responded: 'bg-green-500', draft: 'bg-gray-400', sent: 'bg-blue-500', viewed: 'bg-yellow-500', accepted: 'bg-green-600', rejected: 'bg-red-500' };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const getDocStatusBadge = (status: string) => {
    const colors: Record<string, string> = { draft: 'bg-gray-400', sent: 'bg-blue-500', viewed: 'bg-yellow-500', accepted: 'bg-green-600', rejected: 'bg-red-500' };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Inquiry Management</h1>
          <p className="text-muted-foreground">Manage quotation requests and contact submissions</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            {(dateFrom || dateTo) && <Button variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear Dates</Button>}
          </div>
        </div>

        <Tabs defaultValue="quotations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quotations">Quotation Requests ({filteredInquiries.length})</TabsTrigger>
            <TabsTrigger value="contacts">Contact Submissions ({filteredContacts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="quotations">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inquiry #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-mono text-sm">{inquiry.inquiry_number}</TableCell>
                      <TableCell>{inquiry.customer_name}</TableCell>
                      <TableCell>{inquiry.customer_company}</TableCell>
                      <TableCell>{inquiry.customer_email}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>{new Date(inquiry.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}><Eye className="w-4 h-4" /></Button>
                          <Select value={inquiry.status} onValueChange={(value) => handleStatusChange(inquiry.id, value)}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="quoted">Quoted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredInquiries.length === 0 && <div className="text-center py-12 text-muted-foreground">No inquiries found</div>}
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead><TableHead>Company</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.company}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.subject}</TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>{new Date(contact.created_at || '').toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select value={contact.status} onValueChange={(value) => handleContactStatusChange(contact.id, value)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredContacts.length === 0 && <div className="text-center py-12 text-muted-foreground">No contact submissions found</div>}
            </div>
          </TabsContent>
        </Tabs>

        {/* ─── Inquiry Detail Dialog ───────────────────────────── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="inquiry-dialog-desc">
            <DialogDescription id="inquiry-dialog-desc" className="sr-only">Inquiry details</DialogDescription>
            {selectedInquiry && (
              <>
                <DialogHeader><DialogTitle>Inquiry #{selectedInquiry.inquiry_number}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Customer Name</Label><p className="text-sm">{selectedInquiry.customer_name}</p></div>
                    <div><Label>Company</Label><p className="text-sm">{selectedInquiry.customer_company}</p></div>
                    <div><Label>Email</Label><p className="text-sm">{selectedInquiry.customer_email}</p></div>
                    <div><Label>Phone</Label><p className="text-sm">{selectedInquiry.customer_phone || '-'}</p></div>
                    {selectedInquiry.whatsapp_number && <div><Label>WhatsApp</Label><p className="text-sm">{selectedInquiry.whatsapp_number}</p></div>}
                    <div><Label>Status</Label><div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div></div>
                    <div><Label>Date</Label><p className="text-sm">{new Date(selectedInquiry.created_at || '').toLocaleString()}</p></div>
                  </div>

                  {selectedInquiry.size_requirements && <div><Label>Size / dimensions & requirements</Label><p className="text-sm mt-1 p-2 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.size_requirements}</p></div>}
                  {selectedInquiry.delivery_required !== undefined && <div><Label>Delivery needed</Label><p className="text-sm">{selectedInquiry.delivery_required ? 'Yes' : 'No (pickup/self-collect)'}</p></div>}
                  {selectedInquiry.company_address && <div><Label>Company / delivery address</Label><p className="text-sm mt-1 p-2 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.company_address}</p></div>}
                  {selectedInquiry.company_details && <div><Label>Company details (GSTIN, etc.)</Label><p className="text-sm mt-1 p-2 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.company_details}</p></div>}
                  {selectedInquiry.product_looking_for && <div><Label>Product requested / Looking for</Label><p className="text-sm mt-1 p-2 bg-primary/10 rounded font-medium">{selectedInquiry.product_looking_for}</p></div>}
                  {selectedInquiry.message && <div><Label>Message</Label><p className="text-sm mt-1 p-2 bg-muted rounded">{selectedInquiry.message}</p></div>}

                  {/* Inquiry items */}
                  {inquiryItems.length > 0 && (
                    <div>
                      <Label>Requested Products</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryItems.map((item) => (
                          <div key={item.id} className="p-2 border rounded">
                            <div className="flex justify-between"><span className="font-medium">{item.product_name}</span><span className="text-sm text-muted-foreground">Qty: {item.quantity}</span></div>
                            <p className="text-xs text-muted-foreground">{item.product_category}</p>
                            {item.notes && <p className="text-xs mt-1">Notes: {item.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {inquiryAttachments.length > 0 && (
                    <div>
                      <Label>Attachments</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryAttachments.map((att) => (
                          <div key={att.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{att.file_name}</span>
                            <Button variant="outline" size="sm" onClick={() => window.open(att.file_path, '_blank')}><Download className="w-4 h-4 mr-1" />Download</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quotation documents */}
                  {inquiryDocuments.length > 0 && (
                    <div>
                      <Label>Quotation Documents</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryDocuments.map((doc) => (
                          <div key={doc.id} className="flex flex-wrap items-center gap-2 p-3 border rounded bg-muted/30">
                            <span className="font-mono text-sm font-medium">{doc.proforma_number}</span>
                            {getDocStatusBadge(doc.status)}
                            <span className="text-xs text-muted-foreground">Total: {Number(doc.total_amount).toFixed(2)}</span>
                            {doc.sent_at && <span className="text-xs text-muted-foreground">Sent: {new Date(doc.sent_at).toLocaleDateString()}</span>}
                            {doc.viewed_at && <span className="text-xs text-muted-foreground">Viewed: {new Date(doc.viewed_at).toLocaleDateString()}</span>}
                            <div className="flex gap-1 ml-auto">
                              {doc.pdf_url && <Button variant="outline" size="sm" onClick={() => window.open(doc.pdf_url!, '_blank')}><Download className="w-3 h-3 mr-1" />PDF</Button>}
                              <Button variant="outline" size="sm" onClick={() => window.open(getQuotationUrl(doc.token), '_blank')}><ExternalLink className="w-3 h-3 mr-1" />View</Button>
                              <Button variant="outline" size="sm" onClick={() => handleSendExistingDoc(doc)}><Mail className="w-3 h-3 mr-1" />Re-send</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Create quotation button */}
                  <Button type="button" variant="default" onClick={openQuotationDialog}>
                    <FileText className="w-4 h-4 mr-2" />Create Proforma Invoice
                  </Button>

                  {/* Admin notes */}
                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="mt-1" />
                    <Button className="mt-2" onClick={() => handleSaveNotes(selectedInquiry.id)}>Save Notes</Button>
                  </div>

                  {/* History */}
                  {inquiryHistory.length > 0 && (
                    <div>
                      <Label>History</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryHistory.map((h) => (
                          <div key={h.id} className="text-xs p-2 bg-muted rounded">
                            <span className="font-medium">{h.status_from || 'Created'} → {h.status_to}</span>
                            <span className="text-muted-foreground ml-2">{new Date(h.created_at || '').toLocaleString()}</span>
                            {h.notes && <p className="mt-1">{h.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── Create Quotation Dialog (Proforma Invoice) ──────── */}
        <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="quotation-dialog-desc">
            <DialogDescription id="quotation-dialog-desc" className="sr-only">Create proforma invoice quotation</DialogDescription>
            <DialogHeader><DialogTitle>Create Proforma Invoice</DialogTitle></DialogHeader>
            <div className="space-y-5">

              {/* Invoice metadata */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Proforma No</Label><Input value={qfProformaNo} onChange={(e) => setQfProformaNo(e.target.value)} className="mt-1" /></div>
                <div><Label>Date</Label><Input value={qfDate} onChange={(e) => setQfDate(e.target.value)} className="mt-1" /></div>
                <div><Label>Customer P.O. No</Label><Input value={qfPoNumber} onChange={(e) => setQfPoNumber(e.target.value)} className="mt-1" /></div>
                <div><Label>Place of Supply</Label><Input value={qfPlaceOfSupply} onChange={(e) => setQfPlaceOfSupply(e.target.value)} className="mt-1" /></div>
                <div><Label>Transport</Label><Input value={qfTransport} onChange={(e) => setQfTransport(e.target.value)} className="mt-1" /></div>
                <div><Label>Delivery</Label><Input value={qfDelivery} onChange={(e) => setQfDelivery(e.target.value)} className="mt-1" /></div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}><Plus className="w-3 h-3 mr-1" />Add row</Button>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>HSN</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Disc%</TableHead>
                        <TableHead>GST%</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qfLineItems.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-center text-xs">{i + 1}</TableCell>
                          <TableCell><Input value={item.description} onChange={(e) => updateLineItem(i, 'description', e.target.value)} className="min-w-[140px]" /></TableCell>
                          <TableCell><Input value={item.hsn_code} onChange={(e) => updateLineItem(i, 'hsn_code', e.target.value)} className="w-24" /></TableCell>
                          <TableCell><Input type="number" min={0} value={item.qty || ''} onChange={(e) => updateLineItem(i, 'qty', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell>
                            <Select value={item.unit} onValueChange={(v) => updateLineItem(i, 'unit', v)}>
                              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                              <SelectContent>{quotationTemplate.units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" min={0} step={0.01} value={item.rate || ''} onChange={(e) => updateLineItem(i, 'rate', Number(e.target.value) || 0)} className="w-24" /></TableCell>
                          <TableCell><Input type="number" min={0} max={100} step={0.1} value={item.discount_percent || ''} onChange={(e) => updateLineItem(i, 'discount_percent', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell><Input type="number" min={0} max={100} step={0.1} value={item.gst_percent} onChange={(e) => updateLineItem(i, 'gst_percent', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell className="font-medium text-right whitespace-nowrap">{item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {qfLineItems.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLineItem(i)}><Trash2 className="w-3 h-3" /></Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Taxable Amount</span><span>{qfSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>GST / IGST</span><span>{qfTaxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-1"><span>Grand Total</span><span>{qfGrandTotal.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Remark */}
              <div>
                <Label>Remark</Label>
                <Textarea value={qfRemark} onChange={(e) => setQfRemark(e.target.value)} rows={2} className="mt-1" />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>Cancel</Button>
                {!generatedDocId ? (
                  <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                    {isGenerating ? 'Generating...' : <><FileText className="w-4 h-4 mr-2" />Generate PDF & Save</>}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleSendEmail}><Mail className="w-4 h-4 mr-2" />Send via Email</Button>
                    <Button variant="outline" onClick={handleSendWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send via WhatsApp</Button>
                    <Button variant="outline" onClick={() => { if (generatedToken) window.open(getQuotationUrl(generatedToken), '_blank'); }}><ExternalLink className="w-4 h-4 mr-2" />View public page</Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
