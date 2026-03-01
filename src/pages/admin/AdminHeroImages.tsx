import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, getStoragePublicUrl, HeroImage } from '@/lib/supabase';
import { toast } from 'sonner';

const BUCKET = 'hero-images';

export default function AdminHeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error('Failed to load hero images: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormFile(file);
    setFormPreview(URL.createObjectURL(file));
    if (!formTitle) {
      setFormTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFile) {
      toast.error('Please select an image file.');
      return;
    }

    try {
      setUploading(true);
      const ext = formFile.name.split('.').pop() || 'jpg';
      const fileName = `hero_${Date.now()}.${ext}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, formFile, {
          upsert: false,
          contentType: formFile.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const imageUrl = getStoragePublicUrl(BUCKET, filePath);

      const { error: insertError } = await supabase
        .from('hero_images')
        .insert([{
          title: formTitle.trim() || 'Untitled',
          image_url: imageUrl,
          sort_order: images.length,
          active: true,
        }]);

      if (insertError) throw insertError;

      toast.success('Image added to hero carousel!');
      setIsDialogOpen(false);
      resetForm();
      fetchImages();
    } catch (error: any) {
      toast.error('Failed to upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (img: HeroImage) => {
    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ active: !img.active })
        .eq('id', img.id);
      if (error) throw error;
      toast.success(img.active ? 'Image hidden from homepage' : 'Image visible on homepage');
      fetchImages();
    } catch (error: any) {
      toast.error('Failed to update: ' + error.message);
    }
  };

  const handleDelete = async (img: HeroImage) => {
    if (!confirm(`Remove "${img.title}" from the hero section? This cannot be undone.`)) return;
    try {
      // Try to delete from storage
      const storagePath = img.image_url.split(`/storage/v1/object/public/${BUCKET}/`)[1];
      if (storagePath) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
      }

      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', img.id);
      if (error) throw error;

      toast.success('Image removed.');
      fetchImages();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('hero_images')
        .update({ sort_order: newOrder })
        .eq('id', id);
      if (error) throw error;
      fetchImages();
    } catch (error: any) {
      toast.error('Failed to reorder: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormFile(null);
    setFormPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeCount = images.filter((i) => i.active).length;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hero Images</h1>
            <p className="text-muted-foreground">
              Manage the images that scroll across the homepage hero section.
              {activeCount > 0 && (
                <span className="ml-1 font-medium text-foreground">{activeCount} active</span>
              )}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" aria-describedby="hero-img-desc">
              <DialogHeader>
                <DialogTitle>Add hero image</DialogTitle>
                <DialogDescription id="hero-img-desc">
                  Upload an image to appear in the scrolling hero section on the homepage. Use high-quality photos of products, facilities, or team.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                {/* File picker */}
                <div>
                  <Label>Image *</Label>
                  <div
                    className="mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-black/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formPreview ? (
                      <img src={formPreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
                    ) : (
                      <div className="text-muted-foreground">
                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Click to select an image</p>
                        <p className="text-xs mt-1 opacity-60">JPG, PNG, or WebP — recommended 800x1000 or larger</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Title / label</Label>
                  <Input
                    id="title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. PTFE Rods, Workshop, Team photo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">For your reference only — not shown on the website.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!formFile || uploading}>
                    {uploading ? 'Uploading…' : 'Upload & add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Image grid */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading images…</p>
        ) : images.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-2 font-medium">No hero images yet</p>
            <p className="text-sm">Upload images to show in the scrolling hero section on the homepage.<br />Fallback stock photos will be used until you add your own.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                  img.active ? 'border-black/10' : 'border-dashed border-black/15 opacity-50'
                }`}
              >
                {/* Image */}
                <div className="aspect-[3/4] bg-muted">
                  <img
                    src={img.image_url}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-28"
                    onClick={() => handleToggleActive(img)}
                  >
                    {img.active ? (
                      <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Hide</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5 mr-1.5" /> Show</>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-28"
                    onClick={() => handleDelete(img)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>

                {/* Title + order */}
                <div className="px-2 py-2">
                  <p className="text-xs font-medium truncate">{img.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">Order: </span>
                    <Input
                      type="number"
                      min={0}
                      className="w-14 h-6 text-[11px] px-1 py-0"
                      value={img.sort_order}
                      onChange={(e) => handleUpdateOrder(img.id, Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Active indicator */}
                {!img.active && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    HIDDEN
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
