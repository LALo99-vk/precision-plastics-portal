import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import { supabase, getStoragePublicUrl, ensurePublicStorageUrl, ProductCategory } from '@/lib/supabase';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function AdminCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ProductCategory[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '', description: '',
    status: 'published' as ProductCategory['status'],
    image: '',
  });

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    let filtered = [...categories];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      );
    }
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [categories, searchQuery]);

  const fetchAll = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('product_categories').select('*').order('name', { ascending: true }),
        supabase.from('products').select('category').is('deleted_at', null),
      ]);
      if (categoriesRes.error) throw categoriesRes.error;
      setCategories(categoriesRes.data || []);

      // Count products per category
      const counts: Record<string, number> = {};
      (productsRes.data || []).forEach((p: { category: string }) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
      setProductCounts(counts);
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
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: false, contentType: file.type || 'image/jpeg' });
      if (uploadError) throw uploadError;
      const publicUrl = getStoragePublicUrl('product-images', filePath);
      setFormData((prev) => ({ ...prev, image: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData: any = {
      name: formData.name, description: formData.description,
      status: formData.status || 'published',
    };
    if (formData.image) categoryData.image = formData.image;

    try {
      if (editingCategory) {
        const { error } = await supabase.from('product_categories')
          .update(categoryData).eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated successfully!');
      } else {
        const categoryId = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const { error } = await supabase.from('product_categories')
          .insert([{ id: categoryId, ...categoryData }]);
        if (error) throw error;
        toast.success('Category created successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to save category: ' + error.message);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name, description: category.description,
      status: category.status || 'published', image: category.image || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', deleteTarget);
      if (error) throw error;
      toast.success('Category deleted successfully!');
      fetchAll();
    } catch (error: any) {
      toast.error('Failed to delete category: ' + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'published', image: '' });
    setEditingCategory(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <AdminLayout>
      <div>
        <PageHeader
          title="Categories"
          description="Manage product categories and their visibility"
          action={
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="category-dialog-desc">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                  <DialogDescription id="category-dialog-desc">
                    {editingCategory ? 'Update category details and image.' : 'Create a new product category.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input id="name" value={formData.name} required placeholder="e.g. Laminated Sheets"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" value={formData.description} required rows={3}
                      placeholder="Describe this category…"
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Status *</Label>
                    <Select value={formData.status || 'published'}
                      onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published categories are visible on the website.
                    </p>
                  </div>
                  <div>
                    <Label>Category Image</Label>
                    {formData.image ? (
                      <div className="mt-2 relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden">
                        <img
                          src={ensurePublicStorageUrl(formData.image) || formData.image}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget;
                            const fixed = ensurePublicStorageUrl(el.src);
                            if (fixed && fixed !== el.src) el.src = fixed;
                          }}
                        />
                        <Button type="button" variant="destructive" size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, image: '' })}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                        <Button type="button" variant="outline" className="w-full"
                          onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                          {uploadingImage ? 'Uploading…' : <><Upload className="w-4 h-4 mr-2" />Upload Image</>}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Recommended: 800×600px</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingCategory ? 'Update' : 'Create'} Category</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Search */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search categories…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 text-base" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No categories match your search' : 'No categories yet'}
              description={searchQuery ? 'Try a different search term.' : 'Add your first category to get started.'}
              action={!searchQuery ? {
                label: 'Add Category',
                onClick: () => { resetForm(); setIsDialogOpen(true); },
              } : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-sm font-semibold">Category</TableHead>
                    <TableHead className="hidden sm:table-cell text-sm font-semibold">Description</TableHead>
                    <TableHead className="w-32 text-center text-sm font-semibold">Products</TableHead>
                    <TableHead className="w-32 text-sm font-semibold">Status</TableHead>
                    <TableHead className="w-28 text-right text-sm font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/30 h-16">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img
                              src={ensurePublicStorageUrl(category.image) || category.image}
                              alt={category.name}
                              className="w-11 h-11 rounded object-cover border border-border"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded bg-muted border border-border flex items-center justify-center">
                              <span className="text-sm text-muted-foreground font-semibold">
                                {category.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="font-semibold text-base text-foreground">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-base text-muted-foreground max-w-xs py-3">
                        <span className="line-clamp-2">{category.description}</span>
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span className="text-base font-semibold text-foreground">
                          {productCounts[category.name] ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={category.status || 'published'} />
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9"
                            onClick={() => handleEdit(category)} title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(category.id)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length)} of {filteredCategories.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete category?"
        description="This will permanently delete this category. Products in this category will not be deleted."
      />
    </AdminLayout>
  );
}
