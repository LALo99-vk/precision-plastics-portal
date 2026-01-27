import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Send, ShoppingCart, Upload } from 'lucide-react';
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
    message: ''
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
    if (items.length === 0) {
      toast.error('Please add products to your cart');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create quotation inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('quotation_inquiries')
        .insert([{
          customer_name: formData.name,
          customer_company: formData.company,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          message: formData.message || null,
        }])
        .select()
        .single();

      if (inquiryError) throw inquiryError;
      if (!inquiry) throw new Error('Failed to create inquiry');

      // Create quotation items
      // Try to find product IDs for items that have valid UUIDs
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
          productsData.forEach(p => {
            productIdMap[p.name] = p.id;
          });
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

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems);

      if (itemsError) throw itemsError;

      // Upload attachments if any
      if (attachments.length > 0) {
        const uploadPromises = attachments.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `inquiries/${inquiry.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('inquiry-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('inquiry-attachments')
            .getPublicUrl(filePath);

          return supabase.from('inquiry_attachments').insert([{
            inquiry_id: inquiry.id,
            file_path: urlData.publicUrl,
            bucket_name: 'inquiry-attachments',
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          }]);
        });

        await Promise.all(uploadPromises);
      }

      toast.success(`Quotation request submitted successfully! Inquiry #${inquiry.inquiry_number}`);
    clearCart();
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
      setAttachments([]);
    } catch (error: any) {
      toast.error('Failed to submit quotation request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Quote Cart' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <h1 className="text-3xl font-bold mb-8">Quotation Request</h1>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-secondary">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your quote cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Browse our products and add items to request a quotation.
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="border border-border">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted text-sm font-medium text-muted-foreground">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-4">Notes</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Cart Items */}
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-4 border-t border-border items-center">
                      <div className="col-span-5">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Add notes..."
                          value={item.notes || ''}
                          onChange={(e) => updateNotes(item.id, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/products">Continue Browsing</Link>
                  </Button>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="industrial-card">
                  <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Additional Message</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachments">Attachments (Optional)</Label>
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="mt-1"
                      />
                      {attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                              <span>{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveAttachment(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Quotation Request'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
