import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Send, Upload, ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CustomQuote() {
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
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

      toast.success(`Request submitted. Inquiry #${inquiry.inquiry_number}. We'll send the quotation to your email/WhatsApp.`);
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
      <Breadcrumb items={[{ label: 'Custom Quote Request' }]} />

      <section className="industrial-section">
        <div className="industrial-container max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Request a quote for a product not on the website</h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            Tell us exactly what you&apos;re looking for—product name, size, grade and any other details. We&apos;ll check availability
            from our full catalogue and send you a quotation by email or WhatsApp.
          </p>

          <div className="mb-6 p-4 sm:p-5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">Product not found on the site?</h2>
                <p className="text-sm text-muted-foreground">
                  Use this form when you can&apos;t find a product on the website. We stock many more items in the shop than what&apos;s shown online.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product requested */}
              <div>
                <Label htmlFor="product_looking_for">Product you&apos;re looking for *</Label>
                <Input
                  id="product_looking_for"
                  required
                  value={formData.product_looking_for}
                  onChange={(e) => setFormData({ ...formData, product_looking_for: e.target.value })}
                  className="mt-1"
                  placeholder="e.g. Nylon 6 rod 20mm dia x 1m, Teflon sheet 3mm, etc."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include product name, grade, any brand preference, and quantity required.
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
                          <Upload className="w-3 h-3" />
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

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already added products to your quote cart?{' '}
            <Link to="/quote-cart" className="font-medium text-primary hover:underline">
              Go to quote cart form
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

