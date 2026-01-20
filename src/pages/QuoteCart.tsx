import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Send, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to a backend
    toast.success('Quotation request submitted successfully!');
    clearCart();
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
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
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Quotation Request
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
