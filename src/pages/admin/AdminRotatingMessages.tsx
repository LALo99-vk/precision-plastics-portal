import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, RotatingMessage, RotatingMessageType } from '@/lib/supabase';
import { toast } from 'sonner';

const MESSAGE_TYPES: { value: RotatingMessageType; label: string }[] = [
  { value: 'quote', label: 'Quote' },
  { value: 'offer', label: 'Offer' },
  { value: 'notice', label: 'Notice' },
  { value: 'general', label: 'General' },
];

export default function AdminRotatingMessages() {
  const [messages, setMessages] = useState<RotatingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<RotatingMessage | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'general' as RotatingMessageType,
    duration_seconds: 5,
    sort_order: 0,
    active: true,
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('rotating_messages')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error('Failed to load messages: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        message: formData.message.trim(),
        type: formData.type,
        duration_seconds: Math.max(1, Math.min(120, formData.duration_seconds)),
        sort_order: formData.sort_order,
        active: formData.active,
      };

      if (editingMessage) {
        const { error } = await supabase
          .from('rotating_messages')
          .update(payload)
          .eq('id', editingMessage.id);

        if (error) throw error;
        toast.success('Message updated successfully!');
      } else {
        const { error } = await supabase
          .from('rotating_messages')
          .insert([payload]);

        if (error) throw error;
        toast.success('Message added successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to save message: ' + error.message);
    }
  };

  const handleEdit = (msg: RotatingMessage) => {
    setEditingMessage(msg);
    setFormData({
      message: msg.message,
      type: msg.type,
      duration_seconds: msg.duration_seconds,
      sort_order: msg.sort_order,
      active: msg.active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this message from the homepage rotation? You can add it again later.')) return;

    try {
      const { error } = await supabase
        .from('rotating_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Message removed.');
      fetchMessages();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      type: 'general',
      duration_seconds: 5,
      sort_order: messages.length,
      active: true,
    });
    setEditingMessage(null);
  };

  const getTypeBadge = (type: RotatingMessageType) => {
    switch (type) {
      case 'offer':
        return <Badge className="bg-amber-600 hover:bg-amber-700">Offer</Badge>;
      case 'notice':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Notice</Badge>;
      case 'quote':
        return <Badge variant="secondary">Quote</Badge>;
      default:
        return <Badge variant="outline">General</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Homepage rotating messages</h1>
            <p className="text-muted-foreground">
              Manage quotes, offers, notices and tips shown below the hero on the homepage. Order and duration control how they rotate.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData((prev) => ({ ...prev, sort_order: messages.length }))}>
                <Plus className="w-4 h-4 mr-2" />
                Add message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" aria-describedby="rotating-msg-desc">
              <DialogHeader>
                <DialogTitle>{editingMessage ? 'Edit message' : 'Add message'}</DialogTitle>
                <DialogDescription id="rotating-msg-desc">
                  This text appears in the rotating strip below the hero. Use type “Offer” or “Notice” for special styling.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="message">Message text *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={3}
                    placeholder="e.g. 20% off acrylic sheets this month — contact us for a quote."
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: RotatingMessageType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Offer and Notice use a different color and style on the homepage.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_seconds">Display duration (seconds)</Label>
                    <Input
                      id="duration_seconds"
                      type="number"
                      min={1}
                      max={120}
                      value={formData.duration_seconds}
                      onChange={(e) => setFormData({ ...formData, duration_seconds: Number(e.target.value) || 5 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">1–120 seconds per message</p>
                  </div>
                  <div>
                    <Label htmlFor="sort_order">Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      min={0}
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Lower = shown first</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="active">Show on homepage</Label>
                    <p className="text-xs text-muted-foreground">Turn off to hide without deleting</p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingMessage ? 'Update' : 'Add message'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
            <p className="mb-2">No messages yet.</p>
            <p className="text-sm">Add a message to show in the rotating strip on the homepage.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="flex items-start justify-between gap-4 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getTypeBadge(msg.type)}
                    {!msg.active && (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {msg.duration_seconds}s · order {msg.sort_order}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{msg.message}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(msg)} aria-label="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)} aria-label="Delete">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
