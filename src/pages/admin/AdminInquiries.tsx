import { useState, useEffect } from 'react';
import { Search, Filter, Eye, MessageSquare, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, QuotationInquiry, QuotationItem, InquiryAttachment, InquiryHistory, ContactSubmission } from '@/lib/supabase';
import { toast } from 'sonner';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchInquiries();
    fetchContacts();
  }, []);

  useEffect(() => {
    filterInquiries();
    filterContacts();
  }, [inquiries, contacts, searchQuery, statusFilter, dateFrom, dateTo]);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('quotation_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch inquiries: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch contacts: ' + error.message);
    }
  };

  const fetchInquiryDetails = async (inquiryId: string) => {
    const [itemsRes, attachmentsRes, historyRes] = await Promise.all([
      supabase.from('quotation_items').select('*').eq('inquiry_id', inquiryId),
      supabase.from('inquiry_attachments').select('*').eq('inquiry_id', inquiryId),
      supabase.from('inquiry_history').select('*').eq('inquiry_id', inquiryId).order('created_at', { ascending: false }),
    ]);

    if (itemsRes.data) setInquiryItems(itemsRes.data);
    if (attachmentsRes.data) setInquiryAttachments(attachmentsRes.data);
    if (historyRes.data) setInquiryHistory(historyRes.data);
  };

  const filterInquiries = () => {
    let filtered = [...inquiries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.inquiry_number.toLowerCase().includes(query) ||
        i.customer_name.toLowerCase().includes(query) ||
        i.customer_company.toLowerCase().includes(query) ||
        i.customer_email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(i => new Date(i.created_at || '') >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(i => new Date(i.created_at || '') <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredInquiries(filtered);
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.subject.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter(c => new Date(c.created_at || '') >= new Date(dateFrom));
    }

    if (dateTo) {
      filtered = filtered.filter(c => new Date(c.created_at || '') <= new Date(dateTo + 'T23:59:59'));
    }

    setFilteredContacts(filtered);
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'quoted') {
        updateData.quoted_at = new Date().toISOString();
      } else if (newStatus === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('quotation_inquiries')
        .update(updateData)
        .eq('id', inquiryId);

      if (error) throw error;
      toast.success('Status updated');
      fetchInquiries();
      if (selectedInquiry?.id === inquiryId) {
        const updated = inquiries.find(i => i.id === inquiryId);
        if (updated) {
          setSelectedInquiry(updated);
          await fetchInquiryDetails(inquiryId);
        }
      }
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleContactStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'responded') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updateData)
        .eq('id', contactId);

      if (error) throw error;
      toast.success('Status updated');
      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleSaveNotes = async (inquiryId: string) => {
    try {
      const { error } = await supabase
        .from('quotation_inquiries')
        .update({ admin_notes: adminNotes })
        .eq('id', inquiryId);

      if (error) throw error;
      toast.success('Notes saved');
      fetchInquiries();
    } catch (error: any) {
      toast.error('Failed to save notes: ' + error.message);
    }
  };

  const handleSaveContactNotes = async (contactId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ admin_notes: notes })
        .eq('id', contactId);

      if (error) throw error;
      toast.success('Notes saved');
      fetchContacts();
    } catch (error: any) {
      toast.error('Failed to save notes: ' + error.message);
    }
  };

  const handleViewInquiry = async (inquiry: QuotationInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
    setIsDialogOpen(true);
    await fetchInquiryDetails(inquiry.id);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      in_review: 'bg-yellow-500',
      quoted: 'bg-green-500',
      closed: 'bg-gray-500',
      responded: 'bg-green-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
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
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {(dateFrom || dateTo) && (
              <Button variant="outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Clear Dates
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="quotations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quotations">
              Quotation Requests ({filteredInquiries.length})
            </TabsTrigger>
            <TabsTrigger value="contacts">
              Contact Submissions ({filteredContacts.length})
            </TabsTrigger>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInquiry(inquiry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
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
              {filteredInquiries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No inquiries found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <Select
                          value={contact.status}
                          onValueChange={(value) => handleContactStatusChange(contact.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
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
              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No contact submissions found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Inquiry Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="inquiry-dialog-desc">
            <DialogDescription id="inquiry-dialog-desc" className="sr-only">View and manage inquiry details, items, and attachments.</DialogDescription>
            {selectedInquiry && (
              <>
                <DialogHeader>
                  <DialogTitle>Inquiry #{selectedInquiry.inquiry_number}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Customer Name</Label>
                      <p className="text-sm">{selectedInquiry.customer_name}</p>
                    </div>
                    <div>
                      <Label>Company</Label>
                      <p className="text-sm">{selectedInquiry.customer_company}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedInquiry.customer_email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedInquiry.customer_phone || '-'}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                    </div>
                    <div>
                      <Label>Date</Label>
                      <p className="text-sm">{new Date(selectedInquiry.created_at || '').toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedInquiry.message && (
                    <div>
                      <Label>Message</Label>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedInquiry.message}</p>
                    </div>
                  )}

                  <div>
                    <Label>Selected Products</Label>
                    <div className="mt-2 space-y-2">
                      {inquiryItems.map((item) => (
                        <div key={item.id} className="p-2 border rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.product_name}</span>
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.product_category}</p>
                          {item.notes && (
                            <p className="text-xs mt-1">Notes: {item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {inquiryAttachments.length > 0 && (
                    <div>
                      <Label>Attachments</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryAttachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{attachment.file_name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(attachment.file_path, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                    <Button
                      className="mt-2"
                      onClick={() => handleSaveNotes(selectedInquiry.id)}
                    >
                      Save Notes
                    </Button>
                  </div>

                  {inquiryHistory.length > 0 && (
                    <div>
                      <Label>History</Label>
                      <div className="mt-2 space-y-2">
                        {inquiryHistory.map((history) => (
                          <div key={history.id} className="text-xs p-2 bg-muted rounded">
                            <span className="font-medium">
                              {history.status_from || 'Created'} → {history.status_to}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {new Date(history.created_at || '').toLocaleString()}
                            </span>
                            {history.notes && (
                              <p className="mt-1">{history.notes}</p>
                            )}
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
      </div>
    </AdminLayout>
  );
}
