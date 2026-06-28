import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { LoadingState } from '@/components/admin/LoadingState';
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal';
import {
  supabase, getStoragePublicUrl, ensurePublicStorageUrl,
  Product, ProductImage, ProductVariant, ProductFile,
} from '@/lib/supabase';
import { toast } from 'sonner';

interface ProductWithImages extends Product {
  product_images?: Array<{ image_path: string; is_primary: boolean; display_order: number }>;
}

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  'Laminated Sheets', 'Heat Resistant Rods', 'Acrylic Sheets', 'PVC Products',
  'PVC Curtain Rolls', 'Polyurethane Cords', 'PVC Folding Bed Shoe Moulds',
  'Acrylic Tubes', 'PTFE Bushes', 'PEEK Tubes', 'Stock Shapes', 'Sintered Plastics',
];

function getCategorySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getPrimaryImage(product: ProductWithImages) {
  const imgs = product.product_images ?? [];
  const primary = imgs.find((i) => i.is_primary) ?? imgs.sort((a, b) => a.display_order - b.display_order)[0];
  return primary?.image_path;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: '', subcategory: '', description: '',
    status: 'draft' as Product['status'],
    available: true, price: '', price_on_request: false,
    thermal: false, electrical: false, chemical: false,
    materials: '', industries: '',
  });

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter((p) => p.status === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter((p) => p.category === categoryFilter);
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(image_path, is_primary, display_order)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts((data as ProductWithImages[]) || []);
    } catch (error: any) {
      toast.error('Failed to fetch products: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    const [imagesRes, variantsRes, filesRes] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', productId).order('display_order'),
      supabase.from('product_variants').select('*').eq('product_id', productId).order('display_order'),
      supabase.from('product_files').select('*').eq('product_id', productId),
    ]);
    if (imagesRes.data) setProductImages(imagesRes.data);
    if (variantsRes.data) setProductVariants(variantsRes.data);
    if (filesRes.data) setProductFiles(filesRes.data);
  };

  const handleImageUpload = async (file: File) => {
    if (!file || !editingProduct) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${editingProduct.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images').upload(filePath, file, { upsert: false, contentType: file.type || 'image/jpeg' });
      if (uploadError) throw uploadError;
      const publicUrl = getStoragePublicUrl('product-images', filePath);
      const { data: existingImages } = await supabase.from('product_images')
        .select('display_order').eq('product_id', editingProduct.id)
        .order('display_order', { ascending: false }).limit(1);
      const nextOrder = Array.isArray(existingImages) && existingImages.length > 0
        && typeof (existingImages[0] as any).display_order === 'number'
        ? (existingImages[0] as any).display_order + 1 : 0;
      const { error: insertError } = await supabase.from('product_images').insert([{
        product_id: editingProduct.id, image_path: publicUrl, bucket_name: 'product-images',
        display_order: nextOrder, is_primary: nextOrder === 0,
      }]);
      if (insertError) throw insertError;
      toast.success('Image added.');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    }
  };

  const handleFileUpload = async (file: File, fileType: string) => {
    if (!file || !editingProduct) return;
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `products/${editingProduct.id}/files/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('product-files').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('product-files').getPublicUrl(filePath);
      const { error: insertError } = await supabase.from('product_files').insert([{
        product_id: editingProduct.id, file_path: urlData.publicUrl,
        bucket_name: 'product-files', file_name: file.name, file_type: fileType, file_size: file.size,
      }]);
      if (insertError) throw insertError;
      toast.success('File uploaded successfully!');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to upload file: ' + error.message);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
      toast.success('Image deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete image: ' + error.message);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase.from('product_files').delete().eq('id', fileId);
      if (error) throw error;
      toast.success('File deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete file: ' + error.message);
    }
  };

  const handleAddVariant = async () => {
    if (!editingProduct) return;
    const variantType = prompt('Variant type (e.g., size, grade, thickness):');
    const variantValue = prompt('Variant value:');
    const variantLabel = prompt('Display label (optional):');
    if (!variantType || !variantValue) return;
    try {
      const { data: existing } = await supabase.from('product_variants')
        .select('display_order').eq('product_id', editingProduct.id)
        .order('display_order', { ascending: false }).limit(1);
      const displayOrder = existing?.[0]?.display_order !== undefined ? existing[0].display_order + 1 : 0;
      const { error } = await supabase.from('product_variants').insert([{
        product_id: editingProduct.id, variant_type: variantType, variant_value: variantValue,
        variant_label: variantLabel || null, display_order: displayOrder,
      }]);
      if (error) throw error;
      toast.success('Variant added');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to add variant: ' + error.message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      const { error } = await supabase.from('product_variants').delete().eq('id', variantId);
      if (error) throw error;
      toast.success('Variant deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete variant');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validStatuses = ['draft', 'published', 'hidden', 'discontinued', 'out_of_stock'];
    const productData: any = {
      name: formData.name, category: formData.category, subcategory: formData.subcategory || null,
      description: formData.description,
      status: validStatuses.includes(formData.status || '') ? formData.status : 'draft',
      available: formData.available,
      price: formData.price ? parseFloat(formData.price) : null,
      price_on_request: formData.price_on_request,
      properties: { thermal: formData.thermal, electrical: formData.electrical, chemical: formData.chemical },
      materials: formData.materials ? formData.materials.split(',').map((m) => m.trim()).filter(Boolean) : [],
      industries: formData.industries ? formData.industries.split(',').map((i) => i.trim()).filter(Boolean) : [],
    };
    try {
      if (editingProduct) {
        const cleanData: any = {};
        Object.keys(productData).forEach((key) => {
          if (productData[key] !== undefined && productData[key] !== null) cleanData[key] = productData[key];
        });
        const { error } = await supabase.from('products').update(cleanData).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated successfully!');
      } else {
        const { data, error } = await supabase.from('products').insert([productData]).select().single();
        if (error) throw error;
        toast.success('Product created successfully!');
        setEditingProduct(data);
        await fetchProductDetails(data.id);
      }
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error('Failed to save product: ' + error.message);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, category: product.category, subcategory: product.subcategory || '',
      description: product.description, status: product.status || 'draft',
      available: product.available ?? true, price: product.price?.toString() || '',
      price_on_request: product.price_on_request || false,
      thermal: product.properties?.thermal || false,
      electrical: product.properties?.electrical || false,
      chemical: product.properties?.chemical || false,
      materials: product.materials?.join(', ') || '', industries: product.industries?.join(', ') || '',
    });
    setIsDialogOpen(true);
    await fetchProductDetails(product.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products')
        .update({ deleted_at: new Date().toISOString() }).eq('id', deleteTarget);
      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error: any) {
      toast.error('Failed to delete product: ' + error.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', subcategory: '', description: '', status: 'draft',
      available: true, price: '', price_on_request: false,
      thermal: false, electrical: false, chemical: false, materials: '', industries: '',
    });
    setEditingProduct(null);
    setProductImages([]);
    setProductVariants([]);
    setProductFiles([]);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div>
        <PageHeader
          title="Products"
          description="Manage your product catalog"
          action={
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="product-dialog-desc">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription id="product-dialog-desc">
                    {editingProduct ? 'Edit product details, images, variants, and files.' : 'Add a new product to the catalog.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input id="name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Switch id="available" checked={formData.available}
                          onCheckedChange={(c) => setFormData({ ...formData, available: c })} />
                        <Label htmlFor="available">Available</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" step="0.01" value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        disabled={formData.price_on_request} />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2">
                        <Checkbox id="price_on_request" checked={formData.price_on_request}
                          onCheckedChange={(c) => setFormData({ ...formData, price_on_request: c as boolean })} />
                        <Label htmlFor="price_on_request" className="cursor-pointer">Price on Request</Label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input id="subcategory" value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" value={formData.description} required rows={3}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  {editingProduct && (
                    <>
                      <div className="border-t pt-4">
                        <Label>Product images</Label>
                        <p className="text-xs text-muted-foreground mt-1 mb-2">Images appear in order on the product page.</p>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {productImages.map((img, idx) => (
                            <div key={img.id} className="relative group">
                              <span className="absolute top-1 left-1 z-10 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <img
                                src={ensurePublicStorageUrl(img.image_path) || img.image_path}
                                alt="" className="w-full h-24 object-cover rounded border"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23e5e7eb" width="96" height="96"/%3E%3C/svg%3E'; }}
                              />
                              <Button type="button" variant="destructive" size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteImage(img.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <input type="file" accept="image/*" multiple id="product-images-input" className="hidden"
                            onChange={(e) => { const files = e.target.files; if (files?.length) { Array.from(files).forEach((f) => handleImageUpload(f)); e.target.value = ''; } }} />
                          <Button type="button" variant="outline" size="sm"
                            onClick={() => document.getElementById('product-images-input')?.click()}>
                            <Upload className="w-4 h-4 mr-2" /> Add image
                          </Button>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Product Variants</Label>
                          <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                            Add Variant
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {productVariants.map((variant) => (
                            <div key={variant.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                              <span className="font-medium">{variant.variant_type}:</span>
                              <span>{variant.variant_label || variant.variant_value}</span>
                              <Button type="button" variant="ghost" size="icon" className="ml-auto h-6 w-6"
                                onClick={() => handleDeleteVariant(variant.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <Label>Product Files (PDFs, Datasheets)</Label>
                        <div className="space-y-2 mt-2">
                          {productFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-2 border rounded text-sm">
                              <div>
                                <span className="font-medium">{file.file_name}</span>
                                <span className="text-xs text-muted-foreground ml-2">({file.file_type})</span>
                              </div>
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6"
                                onClick={() => handleDeleteFile(file.id)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input type="file" accept=".pdf,.doc,.docx" className="max-w-xs"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              const fileType = prompt('File type (datasheet, compliance, certificate):') || 'datasheet';
                              if (file) handleFileUpload(file, fileType);
                            }} />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label>Properties</Label>
                    <div className="flex gap-5 mt-2">
                      {(['thermal', 'electrical', 'chemical'] as const).map((prop) => (
                        <div key={prop} className="flex items-center gap-2">
                          <Checkbox id={prop} checked={(formData as any)[prop]}
                            onCheckedChange={(c) => setFormData({ ...formData, [prop]: c as boolean })} />
                          <Label htmlFor={prop} className="capitalize cursor-pointer">{prop}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="materials">Materials (comma-separated)</Label>
                    <Input id="materials" value={formData.materials} placeholder="POM, PTFE, HDPE"
                      onChange={(e) => setFormData({ ...formData, materials: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="industries">Industries (comma-separated)</Label>
                    <Input id="industries" value={formData.industries} placeholder="Mechanical, Chemical, Food"
                      onChange={(e) => setFormData({ ...formData, industries: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingProduct ? 'Update' : 'Create'} Product</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Filters */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 text-base" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44 h-11 text-base"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-52 h-11 text-base"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Search}
              title={searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No products match your filters' : 'No products yet'}
              description={searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first product to get started.'}
              action={(!searchQuery && statusFilter === 'all' && categoryFilter === 'all') ? {
                label: 'Add Product',
                onClick: () => { resetForm(); setIsDialogOpen(true); },
              } : undefined}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-20 text-sm font-semibold">Image</TableHead>
                    <TableHead className="text-sm font-semibold">Product Name</TableHead>
                    <TableHead className="text-sm font-semibold">Category</TableHead>
                    <TableHead className="text-sm font-semibold">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-sm font-semibold">Added</TableHead>
                    <TableHead className="w-36 text-right text-sm font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => {
                    const imgSrc = getPrimaryImage(product);
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30 h-16">
                        <TableCell className="py-3">
                          <div className="w-12 h-12 rounded border bg-muted overflow-hidden shrink-0">
                            {imgSrc ? (
                              <img
                                src={ensurePublicStorageUrl(imgSrc) || imgSrc}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                —
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="font-semibold text-base text-foreground">{product.name}</span>
                          {product.subcategory && (
                            <p className="text-sm text-muted-foreground">{product.subcategory}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-base text-muted-foreground py-3">{product.category}</TableCell>
                        <TableCell className="py-3">
                          <StatusBadge status={product.status || 'draft'} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-base text-muted-foreground py-3">
                          {formatDate(product.updated_at || product.created_at)}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9"
                              onClick={() => window.open(`/products/${getCategorySlug(product.category)}/${product.id}`, '_blank')}
                              title="View on site">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9"
                              onClick={() => handleEdit(product)} title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(product.id)} title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) page = i + 1;
                      else if (currentPage <= 3) page = i + 1;
                      else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                      else page = currentPage - 2 + i;
                      return (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'}
                          size="icon" className="h-7 w-7 text-xs"
                          onClick={() => setCurrentPage(page)}>
                          {page}
                        </Button>
                      );
                    })}
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
        title="Delete product?"
        description="This will remove the product from the catalog. This action cannot be undone."
      />
    </AdminLayout>
  );
}
