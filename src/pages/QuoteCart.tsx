import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Send, ShoppingCart, Upload, ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function QuoteCart() {
  const { items, removeItem, updateQuantity, updateNotes, clearCart } = useQuoteCart();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    company_address: '',
    company_details: '',
    product_looking_for: '',
    size_requirements: '',
    delivery_required: true,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: inquiry, error: inquiryError } = await supabase
        .from('quotation_inquiries')
        .insert([{
          customer_name: formData.name,
          customer_company: formData.company,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          message: formData.message || null,
          size_requirements: formData.size_requirements || null,
          delivery_required: formData.delivery_required,
          company_address: formData.company_address || null,
          company_details: formData.company_details || null,
          whatsapp_number: formData.whatsapp || null,
          product_looking_for: formData.product_looking_for || null,
        }])
        .select()
        .single();

      if (inquiryError) throw inquiryError;
      if (!inquiry) throw new Error('Failed to create inquiry');

      if (items.length > 0) {
        const productIds = items.map(item => item.id).filter(id =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        );
        let productIdMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: productsData } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);
          if (productsData) {
            productsData.forEach(p => { productIdMap[p.name] = p.id; });
          }
        }
        const quotationItems = items.map(item => ({
          inquiry_id: inquiry.id,
          product_id: productIdMap[item.name] || (item.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? item.id : null),
          product_name: item.name,
          product_category: item.category,
          quantity: item.quantity,
          notes: item.notes || null,
        }));
        const { error: itemsError } = await supabase.from('quotation_items').insert(quotationItems);
        if (itemsError) throw itemsError;
      }

      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `inquiries/${inquiry.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('inquiry-attachments')
            .upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from('inquiry-attachments').getPublicUrl(filePath);
          await supabase.from('inquiry_attachments').insert([{
            inquiry_id: inquiry.id,
            file_path: urlData.publicUrl,
            bucket_name: 'inquiry-attachments',
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          }]);
        }
      }

      toast.success(`Quotation request submitted. Inquiry #${inquiry.inquiry_number}. We'll send the quotation to your email/WhatsApp.`);
      clearCart();
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        whatsapp: '',
        company_address: '',
        company_details: '',
        product_looking_for: '',
        size_requirements: '',
        delivery_required: true,
        message: '',
      });
      setAttachments([]);
    } catch (error: any) {
      toast.error('Failed to submit: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Quote Cart' }]} />

      <section className="industrial-section">
        <div className="industrial-container max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quotation Request</h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Fill in your details and requirements. We’ll send the quotation to your email or WhatsApp.
          </p>

          {/* Cart items - optional block */}
          {items.length > 0 && (
            <div className="mb-8 p-4 sm:p-6 rounded-xl border border-border bg-card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Items in your quote ({items.length})
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-2 sm:gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.category}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Notes..."
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="flex-1 min-w-[120px] max-w-[200px] text-sm"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={clearCart}>Clear all</Button>
                <Button type="button" variant="outline" size="sm" asChild><Link to="/products">Add more products</Link></Button>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="mb-6 p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-1">Can&apos;t find your product?</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tell us what you need—name, grade, or description—and we&apos;ll check availability and send you a quote.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Single form - mobile first */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product looking for (when not in cart) */}
              <div>
                <Label htmlFor="product_looking_for">Product you&apos;re looking for (optional)</Label>
                <Input
                  id="product_looking_for"
                  value={formData.product_looking_for}
                  onChange={(e) => setFormData({ ...formData, product_looking_for: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. Nylon 6 rod 20mm, Teflon sheet 3mm, or describe the product"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use this if the product isn&apos;t on our site—we&apos;ll confirm availability and quote.
                </p>
              </div>

              {/* Your details */}
              <div>
                <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border">Your details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company name *</Label>
                    <Input id="company" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1" placeholder="With country code" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="whatsapp">WhatsApp number (for sending quotation)</Label>
                    <Input id="whatsapp" type="tel" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="mt-1" placeholder="e.g. 919448354795" />
                  </div>
                </div>
              </div>

              {/* Company address & details */}
              <div>
                <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border">Company address & details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_address">Company / delivery address *</Label>
                    <Textarea id="company_address" required rows={3} value={formData.company_address} onChange={(e) => setFormData({ ...formData, company_address: e.target.value })} className="mt-1" placeholder="Full address for delivery or correspondence" />
                  </div>
                  <div>
                    <Label htmlFor="company_details">Company details (GSTIN, registration, etc.)</Label>
                    <Textarea id="company_details" rows={2} value={formData.company_details} onChange={(e) => setFormData({ ...formData, company_details: e.target.value })} className="mt-1" placeholder="Optional" />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border">Requirements</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="size_requirements">Size, dimensions & other requirements *</Label>
                    <Textarea id="size_requirements" required rows={3} value={formData.size_requirements} onChange={(e) => setFormData({ ...formData, size_requirements: e.target.value })} className="mt-1" placeholder="e.g. thickness, width, length, material grade, colour" />
                  </div>
                  <div>
                    <Label>Delivery needed?</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="delivery" checked={formData.delivery_required} onChange={() => setFormData({ ...formData, delivery_required: true })} className="rounded-full" />
                        <span className="text-sm">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="delivery" checked={!formData.delivery_required} onChange={() => setFormData({ ...formData, delivery_required: false })} className="rounded-full" />
                        <span className="text-sm">No (pickup / self-collect)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product photos */}
              <div>
                <h3 className="text-base font-semibold mb-4 pb-2 border-b border-border flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Product photos (optional)
                </h3>
                <p className="text-sm text-muted-foreground mb-2">Upload photos so we can confirm availability and match your requirement.</p>
                <Input type="file" multiple accept="image/*" onChange={handleFileChange} className="mt-1" />
                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-lg">
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{file.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRemoveAttachment(index)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional message */}
              <div>
                <Label htmlFor="message">Additional message</Label>
                <Textarea id="message" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="mt-1" placeholder="Any other details or questions" />
              </div>

              <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSubmitting}>
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit quotation request'}
              </Button>
            </form>
          </div>

          {items.length === 0 && (
            <p className="mt-4 text-center">
              <Link to="/products" className="text-sm font-medium text-primary hover:underline">Browse products</Link>
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}
