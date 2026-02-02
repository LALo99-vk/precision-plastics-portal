import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, getStoragePublicUrl, ensurePublicStorageUrl, ProductCategory } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'published' as ProductCategory['status'],
    image: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch categories: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload to Supabase Storage (contentType helps avoid 400 from strict MIME checks)
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Use correct public URL (with /public/ in path) so the image loads and doesn't 400
      const publicUrl = getStoragePublicUrl('product-images', filePath);
      setFormData((prev) => ({ ...prev, image: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: any = {
      name: formData.name,
      description: formData.description,
      status: formData.status || 'published',
    };

    // Only include image if it's set
    if (formData.image) {
      categoryData.image = formData.image;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('product_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully!');
      } else {
        // Create new category - generate ID from name
        const categoryId = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        const { error } = await supabase
          .from('product_categories')
          .insert([{
            id: categoryId,
            ...categoryData,
          }]);

        if (error) throw error;
        toast.success('Category created successfully!');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error('Failed to save category: ' + error.message);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status || 'published',
      image: category.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Category deleted successfully!');
      fetchCategories();
    } catch (error: any) {
      toast.error('Failed to delete category: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'published',
      image: '',
    });
    setEditingCategory(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'hidden':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Category Management</h1>
            <p className="text-muted-foreground">Manage product categories and their visibility</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="category-dialog-desc">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogDescription id="category-dialog-desc">
                  {editingCategory ? 'Update category details and image.' : 'Create a new product category with name, description, status, and image.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Laminated Sheets"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    placeholder="Describe this category..."
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status || 'published'} 
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published categories are visible on the website. Hidden categories are not shown to visitors.
                  </p>
                </div>
                <div>
                  <Label>Category Image</Label>
                  {formData.image ? (
                    <div className="mt-2 relative">
                      <div className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden">
                        <img 
                          src={ensurePublicStorageUrl(formData.image) || formData.image} 
                          alt="Category preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            const fixed = ensurePublicStorageUrl(el.src);
                            if (fixed && fixed !== el.src) {
                              el.src = fixed;
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an image to represent this category. Recommended size: 800x600px
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'Update' : 'Create'} Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-destructive/5 relative overflow-hidden">
                  {category.image ? (
                    <img 
                      src={ensurePublicStorageUrl(category.image) || category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.currentTarget;
                        const fixed = ensurePublicStorageUrl(el.src);
                        if (fixed && fixed !== el.src) {
                          el.src = fixed;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusBadgeColor(category.status)}>
                      {category.status || 'published'}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{category.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {categories.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            No categories found. Create your first category to get started.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
