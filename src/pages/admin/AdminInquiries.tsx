import { useState, useEffect } from 'react';
import {
  Search, Eye, FileText, Download, Mail, MessageCircle, Plus, Trash2,
  ExternalLink, ChevronLeft, ChevronRight, CheckCircle, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import {
  supabase, QuotationInquiry, QuotationItem, InquiryAttachment,
  InquiryHistory, ContactSubmission, QuotationDocument, QuotationPdfLineItem,
} from '@/lib/supabase';
import { generateQuotationPdf, downloadBlob, type QuotationPdfFormData } from '@/lib/generateQuotationPdf';
import { quotationTemplate } from '@/config/quotationTemplate';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

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
  const [inqPage, setInqPage] = useState(1);
  const [conPage, setConPage] = useState(1);

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

  const applyFilters = <T extends { status: string; created_at?: string }>(
    items: T[],
    getSearchText: (i: T) => string,
  ) => {
    let filtered = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => getSearchText(i).toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter((i) => i.status === statusFilter);
    if (dateFrom) filtered = filtered.filter((i) => new Date(i.created_at || '') >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter((i) => new Date(i.created_at || '') <= new Date(dateTo + 'T23:59:59'));
    return filtered;
  };

  const filterInquiries = () => {
    const filtered = applyFilters(inquiries, (i) =>
      `${i.inquiry_number} ${i.customer_name} ${i.customer_company} ${i.customer_email}`);
    setFilteredInquiries(filtered);
    setInqPage(1);
  };

  const filterContacts = () => {
    const filtered = applyFilters(contacts, (c) =>
      `${c.name} ${c.company} ${c.email} ${c.subject}`);
    setFilteredContacts(filtered);
    setConPage(1);
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

  // Quotation dialog
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
      description: item.product_name, hsn_code: '', qty: item.quantity,
      unit: 'NOS', rate: 0, discount_percent: 0, gst_percent: 18, amount: 0,
    }));
    if (items.length === 0) {
      items.push({ description: '', hsn_code: '', qty: 1, unit: 'NOS', rate: 0, discount_percent: 0, gst_percent: 18, amount: 0 });
    }
    setQfLineItems(items);
    setIsQuotationDialogOpen(true);
  };

  const updateLineItem = (index: number, field: keyof QuotationPdfLineItem, value: string | number) => {
    setQfLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      const discounted = item.rate * (1 - item.discount_percent / 100);
      item.amount = Math.round(item.qty * discounted * 100) / 100;
      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => setQfLineItems((prev) => [...prev, { description: '', hsn_code: '', qty: 1, unit: 'NOS', rate: 0, discount_percent: 0, gst_percent: 18, amount: 0 }]);
  const removeLineItem = (index: number) => setQfLineItems((prev) => prev.filter((_, i) => i !== index));

  const qfSubtotal = qfLineItems.reduce((s, it) => s + it.amount, 0);
  const qfTaxAmount = qfLineItems.reduce((s, it) => s + it.amount * (it.gst_percent / 100), 0);
  const qfGrandTotal = qfSubtotal + qfTaxAmount;

  const handleGeneratePdf = async () => {
    if (!selectedInquiry) return;
    if (qfLineItems.length === 0 || qfLineItems.every((it) => !it.description.trim())) {
      toast.error('Add at least one line item');
      return;
    }
    setIsGenerating(true);
    try {
      const formData: QuotationPdfFormData = {
        proformaNumber: qfProformaNo, date: qfDate, poNumber: qfPoNumber,
        placeOfSupply: qfPlaceOfSupply, transport: qfTransport, delivery: qfDelivery,
        items: qfLineItems, remark: qfRemark,
      };
      const blob = await generateQuotationPdf(selectedInquiry, formData);
      const token = generateToken();
      const filePath = `${selectedInquiry.id}/${token}.pdf`;
      const { error: uploadErr } = await supabase.storage.from('quotation-pdfs').upload(filePath, blob, { contentType: 'application/pdf', upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('quotation-pdfs').getPublicUrl(filePath);
      const { data: doc, error: insertErr } = await supabase.from('quotation_documents').insert([{
        inquiry_id: selectedInquiry.id, token, proforma_number: qfProformaNo,
        pdf_url: urlData.publicUrl, line_items: qfLineItems, subtotal: qfSubtotal,
        tax_amount: qfTaxAmount, delivery_charge: 0, total_amount: qfGrandTotal,
        remark: qfRemark, transport: qfTransport, po_number: qfPoNumber,
        place_of_supply: qfPlaceOfSupply, status: 'draft',
      }]).select().single();
      if (insertErr) throw insertErr;
      await supabase.from('quotation_inquiries').update({ status: 'quoted', quoted_at: new Date().toISOString() }).eq('id', selectedInquiry.id);
      downloadBlob(blob, `Quotation_${qfProformaNo.replace(/\s/g, '_')}.pdf`);
      setGeneratedDocId(doc?.id || null);
      setGeneratedToken(token);
      toast.success('PDF generated and saved.');
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
    window.open(`mailto:${selectedInquiry.customer_email}?subject=${subject}&body=${body}`, '_blank');
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

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  // Pagination helpers
  const paginate = <T,>(items: T[], page: number) =>
    items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalInqPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const totalConPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);

  const PaginationBar = ({
    current, total, onChange,
  }: { current: number; total: number; onChange: (p: number) => void }) => (
    total <= 1 ? null : (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Page {current} of {total}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    )
  );

  return (
    <AdminLayout>
      <div>
        <PageHeader
          title="Inquiries"
          description="Manage quotation requests and contact submissions"
        />

        {/* Filters */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, company, email…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 text-base" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-11 text-base"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-36" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-36" />
            {(dateFrom || dateTo) && (
              <Button variant="outline" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear dates
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="quotations" className="space-y-4">
          <TabsList className="bg-background border border-border">
            <TabsTrigger value="quotations">
              Quotation Requests
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded px-1.5">
                {filteredInquiries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="contacts">
              Contact Submissions
              <span className="ml-1.5 text-xs bg-muted text-muted-foreground rounded px-1.5">
                {filteredContacts.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Quotation Inquiries Tab */}
          <TabsContent value="quotations">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <LoadingState />
              ) : filteredInquiries.length === 0 ? (
                <EmptyState
                  icon={MessageCircle}
                  title="No quotation inquiries found"
                  description="Inquiries submitted through the website will appear here."
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-sm font-semibold">Inquiry #</TableHead>
                        <TableHead className="text-sm font-semibold">Customer</TableHead>
                        <TableHead className="hidden md:table-cell text-sm font-semibold">Company</TableHead>
                        <TableHead className="hidden lg:table-cell text-sm font-semibold">Email</TableHead>
                        <TableHead className="hidden sm:table-cell text-sm font-semibold">Phone</TableHead>
                        <TableHead className="text-sm font-semibold">Status</TableHead>
                        <TableHead className="hidden md:table-cell text-sm font-semibold">Date</TableHead>
                        <TableHead className="text-right text-sm font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginate(filteredInquiries, inqPage).map((inquiry) => (
                        <TableRow key={inquiry.id} className="hover:bg-muted/30 h-16">
                          <TableCell className="font-mono text-sm text-muted-foreground py-3">
                            {inquiry.inquiry_number}
                          </TableCell>
                          <TableCell className="font-semibold text-base py-3">{inquiry.customer_name}</TableCell>
                          <TableCell className="hidden md:table-cell text-base text-muted-foreground py-3">
                            {inquiry.customer_company}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-base text-muted-foreground py-3">
                            {inquiry.customer_email}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-base text-muted-foreground py-3">
                            {inquiry.customer_phone || '—'}
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={inquiry.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-base text-muted-foreground py-3">
                            {formatDate(inquiry.created_at)}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-9 w-9"
                                onClick={() => handleViewInquiry(inquiry)} title="View details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {inquiry.status === 'new' || inquiry.status === 'in_review' ? (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-emerald-600 hover:text-emerald-700"
                                  onClick={() => handleStatusChange(inquiry.id, 'quoted')} title="Mark as quoted">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : null}
                              {inquiry.status !== 'closed' ? (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleStatusChange(inquiry.id, 'closed')} title="Close inquiry">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationBar current={inqPage} total={totalInqPages} onChange={setInqPage} />
                </>
              )}
            </div>
          </TabsContent>

          {/* Contact Submissions Tab */}
          <TabsContent value="contacts">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <LoadingState />
              ) : filteredContacts.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No contact submissions found"
                  description="Contact form submissions will appear here."
                />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-sm font-semibold">Name</TableHead>
                        <TableHead className="hidden md:table-cell text-sm font-semibold">Company</TableHead>
                        <TableHead className="hidden lg:table-cell text-sm font-semibold">Email</TableHead>
                        <TableHead className="hidden sm:table-cell text-sm font-semibold">Subject</TableHead>
                        <TableHead className="text-sm font-semibold">Status</TableHead>
                        <TableHead className="hidden md:table-cell text-sm font-semibold">Date</TableHead>
                        <TableHead className="text-right text-sm font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginate(filteredContacts, conPage).map((contact) => (
                        <TableRow key={contact.id} className="hover:bg-muted/30 h-16">
                          <TableCell className="font-semibold text-base py-3">{contact.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-base text-muted-foreground py-3">{contact.company}</TableCell>
                          <TableCell className="hidden lg:table-cell text-base text-muted-foreground py-3">{contact.email}</TableCell>
                          <TableCell className="hidden sm:table-cell text-base text-muted-foreground max-w-xs py-3">
                            <span className="truncate block">{contact.subject}</span>
                          </TableCell>
                          <TableCell className="py-3"><StatusBadge status={contact.status} /></TableCell>
                          <TableCell className="hidden md:table-cell text-base text-muted-foreground py-3">{formatDate(contact.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              {contact.status === 'new' || contact.status === 'in_review' ? (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                  onClick={() => handleContactStatusChange(contact.id, 'responded')} title="Mark as responded">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                              ) : null}
                              {contact.status !== 'closed' ? (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleContactStatusChange(contact.id, 'closed')} title="Close">
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              ) : null}
                              <Select value={contact.status} onValueChange={(v) => handleContactStatusChange(contact.id, v)}>
                                <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in_review">In Review</SelectItem>
                                  <SelectItem value="responded">Responded</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationBar current={conPage} total={totalConPages} onChange={setConPage} />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Inquiry Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="inquiry-dialog-desc">
            <DialogDescription id="inquiry-dialog-desc" className="sr-only">Inquiry details</DialogDescription>
            {selectedInquiry && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    Inquiry #{selectedInquiry.inquiry_number}
                    <StatusBadge status={selectedInquiry.status} />
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div><Label className="text-xs text-muted-foreground">Customer Name</Label><p className="text-sm font-medium mt-0.5">{selectedInquiry.customer_name}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Company</Label><p className="text-sm mt-0.5">{selectedInquiry.customer_company}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Email</Label><p className="text-sm mt-0.5">{selectedInquiry.customer_email}</p></div>
                    <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="text-sm mt-0.5">{selectedInquiry.customer_phone || '—'}</p></div>
                    {selectedInquiry.whatsapp_number && (
                      <div><Label className="text-xs text-muted-foreground">WhatsApp</Label><p className="text-sm mt-0.5">{selectedInquiry.whatsapp_number}</p></div>
                    )}
                    <div><Label className="text-xs text-muted-foreground">Date</Label><p className="text-sm mt-0.5">{formatDate(selectedInquiry.created_at)}</p></div>
                  </div>

                  {selectedInquiry.product_looking_for && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Product / Looking for</Label>
                      <p className="text-sm mt-1 p-3 bg-primary/5 border border-primary/20 rounded font-medium">{selectedInquiry.product_looking_for}</p>
                    </div>
                  )}
                  {selectedInquiry.size_requirements && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Size / Dimensions & Requirements</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.size_requirements}</p>
                    </div>
                  )}
                  {selectedInquiry.delivery_required !== undefined && (
                    <div><Label className="text-xs text-muted-foreground">Delivery needed</Label><p className="text-sm mt-0.5">{selectedInquiry.delivery_required ? 'Yes' : 'No (pickup/self-collect)'}</p></div>
                  )}
                  {selectedInquiry.company_address && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Company / Delivery Address</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.company_address}</p>
                    </div>
                  )}
                  {selectedInquiry.company_details && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Company Details (GSTIN, etc.)</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedInquiry.company_details}</p>
                    </div>
                  )}
                  {selectedInquiry.message && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Message</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded">{selectedInquiry.message}</p>
                    </div>
                  )}

                  {inquiryItems.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Requested Products</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 border rounded text-sm">
                            <div>
                              <span className="font-medium">{item.product_name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{item.product_category}</span>
                              {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
                            </div>
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inquiryAttachments.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Attachments</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryAttachments.map((att) => (
                          <div key={att.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{att.file_name}</span>
                            <Button variant="outline" size="sm" onClick={() => window.open(att.file_path, '_blank')}>
                              <Download className="w-3.5 h-3.5 mr-1" /> Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inquiryDocuments.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Quotation Documents</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryDocuments.map((doc) => (
                          <div key={doc.id} className="flex flex-wrap items-center gap-2 p-3 border rounded bg-muted/20">
                            <span className="font-mono text-sm font-medium">{doc.proforma_number}</span>
                            <StatusBadge status={doc.status} />
                            <span className="text-xs text-muted-foreground">₹{Number(doc.total_amount).toFixed(2)}</span>
                            {doc.sent_at && <span className="text-xs text-muted-foreground">Sent: {formatDate(doc.sent_at)}</span>}
                            {doc.viewed_at && <span className="text-xs text-muted-foreground">Viewed: {formatDate(doc.viewed_at)}</span>}
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

                  <div className="flex items-center gap-3 pt-2 border-t">
                    <Button onClick={openQuotationDialog}>
                      <FileText className="w-4 h-4 mr-2" /> Create Proforma Invoice
                    </Button>
                    <Select value={selectedInquiry.status} onValueChange={(v) => { handleStatusChange(selectedInquiry.id, v); setSelectedInquiry({ ...selectedInquiry, status: v as any }); }}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Admin Notes</Label>
                    <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="mt-1" />
                    <Button size="sm" className="mt-2" onClick={() => handleSaveNotes(selectedInquiry.id)}>Save Notes</Button>
                  </div>

                  {inquiryHistory.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">History</Label>
                      <div className="mt-2 space-y-1.5">
                        {inquiryHistory.map((h) => (
                          <div key={h.id} className="text-xs p-2 bg-muted rounded flex items-center gap-2">
                            <span className="font-medium">{h.status_from || 'Created'} → {h.status_to}</span>
                            <span className="text-muted-foreground">{formatDate(h.created_at)}</span>
                            {h.notes && <span className="text-muted-foreground">· {h.notes}</span>}
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

        {/* Create Quotation Dialog */}
        <Dialog open={isQuotationDialogOpen} onOpenChange={setIsQuotationDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="quotation-dialog-desc">
            <DialogDescription id="quotation-dialog-desc" className="sr-only">Create proforma invoice</DialogDescription>
            <DialogHeader><DialogTitle>Create Proforma Invoice</DialogTitle></DialogHeader>
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Proforma No</Label><Input value={qfProformaNo} onChange={(e) => setQfProformaNo(e.target.value)} className="mt-1" /></div>
                <div><Label>Date</Label><Input value={qfDate} onChange={(e) => setQfDate(e.target.value)} className="mt-1" /></div>
                <div><Label>Customer P.O. No</Label><Input value={qfPoNumber} onChange={(e) => setQfPoNumber(e.target.value)} className="mt-1" /></div>
                <div><Label>Place of Supply</Label><Input value={qfPlaceOfSupply} onChange={(e) => setQfPlaceOfSupply(e.target.value)} className="mt-1" /></div>
                <div><Label>Transport</Label><Input value={qfTransport} onChange={(e) => setQfTransport(e.target.value)} className="mt-1" /></div>
                <div><Label>Delivery</Label><Input value={qfDelivery} onChange={(e) => setQfDelivery(e.target.value)} className="mt-1" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="w-3 h-3 mr-1" />Add row
                  </Button>
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
                          <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
                          <TableCell><Input value={item.description} onChange={(e) => updateLineItem(i, 'description', e.target.value)} className="min-w-[140px]" /></TableCell>
                          <TableCell><Input value={item.hsn_code} onChange={(e) => updateLineItem(i, 'hsn_code', e.target.value)} className="w-24" /></TableCell>
                          <TableCell><Input type="number" min={0} value={item.qty || ''} onChange={(e) => updateLineItem(i, 'qty', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell>
                            <Select value={item.unit} onValueChange={(v) => updateLineItem(i, 'unit', v)}>
                              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                              <SelectContent>{quotationTemplate.units.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input type="number" min={0} step={0.01} value={item.rate || ''} onChange={(e) => updateLineItem(i, 'rate', Number(e.target.value) || 0)} className="w-24" /></TableCell>
                          <TableCell><Input type="number" min={0} max={100} step={0.1} value={item.discount_percent || ''} onChange={(e) => updateLineItem(i, 'discount_percent', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell><Input type="number" min={0} max={100} step={0.1} value={item.gst_percent} onChange={(e) => updateLineItem(i, 'gst_percent', Number(e.target.value) || 0)} className="w-16" /></TableCell>
                          <TableCell className="font-medium text-right whitespace-nowrap">₹{item.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {qfLineItems.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLineItem(i)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Taxable Amount</span><span>₹{qfSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">GST / IGST</span><span>₹{qfTaxAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2"><span>Grand Total</span><span>₹{qfGrandTotal.toFixed(2)}</span></div>
                </div>
              </div>

              <div>
                <Label>Remark</Label>
                <Textarea value={qfRemark} onChange={(e) => setQfRemark(e.target.value)} rows={2} className="mt-1" />
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
                <Button variant="outline" onClick={() => setIsQuotationDialogOpen(false)}>Cancel</Button>
                {!generatedDocId ? (
                  <Button onClick={handleGeneratePdf} disabled={isGenerating}>
                    {isGenerating ? 'Generating…' : <><FileText className="w-4 h-4 mr-2" />Generate PDF & Save</>}
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleSendEmail}><Mail className="w-4 h-4 mr-2" />Send via Email</Button>
                    <Button variant="outline" onClick={handleSendWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />Send via WhatsApp</Button>
                    <Button variant="outline" onClick={() => { if (generatedToken) window.open(getQuotationUrl(generatedToken), '_blank'); }}>
                      <ExternalLink className="w-4 h-4 mr-2" />View public page
                    </Button>
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
