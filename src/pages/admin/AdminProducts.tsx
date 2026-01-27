import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Search, Filter, ArrowUpDown, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase, Product, ProductImage, ProductVariant, ProductFile } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [productFiles, setProductFiles] = useState<ProductFile[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    status: 'draft' as Product['status'],
    available: true,
    price: '',
    price_on_request: false,
    thermal: false,
    electrical: false,
    chemical: false,
    materials: '',
    industries: '',
  });

  const categories = [
    'Laminated Sheets',
    'Heat Resistant Rods',
    'Acrylic Sheets',
    'PVC Products',
    'PVC Curtain Rolls',
    'Polyurethane Cords',
    'PVC Folding Bed Shoe Moulds',
    'Acrylic Tubes',
    'PTFE Bushes',
    'PEEK Tubes',
    'Stock Shapes',
    'Sintered Plastics',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch products: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.materials?.some(m => m.toLowerCase().includes(query)) ||
        p.industries?.some(i => i.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
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

  const handleImageUpload = async (file: File, isPrimary = false) => {
    if (!file || !editingProduct) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${editingProduct.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Get max display_order
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('display_order')
        .eq('product_id', editingProduct.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const displayOrder = existingImages?.[0]?.display_order !== undefined 
        ? existingImages[0].display_order + 1 
        : 0;

      // If this is primary, unset other primary images
      if (isPrimary) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', editingProduct.id);
      }

      const { error: insertError } = await supabase
        .from('product_images')
        .insert([{
          product_id: editingProduct.id,
          image_path: urlData.publicUrl,
          bucket_name: 'product-images',
          display_order,
          is_primary: isPrimary,
        }]);

      if (insertError) throw insertError;

      toast.success('Image uploaded successfully!');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    }
  };

  const handleFileUpload = async (file: File, fileType: string) => {
    if (!file || !editingProduct) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `products/${editingProduct.id}/files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-files')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('product_files')
        .insert([{
          product_id: editingProduct.id,
          file_path: urlData.publicUrl,
          bucket_name: 'product-files',
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
        }]);

      if (insertError) throw insertError;

      toast.success('File uploaded successfully!');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to upload file: ' + error.message);
    }
  };

  const handleDeleteImage = async (imageId: string, imagePath: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      toast.success('Image deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete image: ' + error.message);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;

    try {
      const { error } = await supabase
        .from('product_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      toast.success('File deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete file: ' + error.message);
    }
  };

  const handleReorderImages = async (imageId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ display_order: newOrder })
        .eq('id', imageId);

      if (error) throw error;
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to reorder images');
    }
  };

  const handleAddVariant = async () => {
    if (!editingProduct) return;
    const variantType = prompt('Variant type (e.g., size, grade, thickness):');
    const variantValue = prompt('Variant value:');
    const variantLabel = prompt('Display label (optional):');

    if (!variantType || !variantValue) return;

    try {
      const { data: existing } = await supabase
        .from('product_variants')
        .select('display_order')
        .eq('product_id', editingProduct.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const displayOrder = existing?.[0]?.display_order !== undefined 
        ? existing[0].display_order + 1 
        : 0;

      const { error } = await supabase
        .from('product_variants')
        .insert([{
          product_id: editingProduct.id,
          variant_type: variantType,
          variant_value: variantValue,
          variant_label: variantLabel || null,
          display_order: displayOrder,
        }]);

      if (error) throw error;
      toast.success('Variant added');
      fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to add variant: ' + error.message);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      toast.success('Variant deleted');
      if (editingProduct) fetchProductDetails(editingProduct.id);
    } catch (error: any) {
      toast.error('Failed to delete variant');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: any = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory || null,
      description: formData.description,
      status: formData.status || 'draft',
      available: formData.available,
      price: formData.price ? parseFloat(formData.price) : null,
      price_on_request: formData.price_on_request,
      properties: {
        thermal: formData.thermal,
        electrical: formData.electrical,
        chemical: formData.chemical,
      },
      materials: formData.materials ? formData.materials.split(',').map(m => m.trim()).filter(Boolean) : [],
      industries: formData.industries ? formData.industries.split(',').map(i => i.trim()).filter(Boolean) : [],
    };

    // Ensure status is valid
    const validStatuses = ['draft', 'published', 'hidden', 'discontinued', 'out_of_stock'];
    if (!validStatuses.includes(productData.status)) {
      console.warn('Invalid status, defaulting to draft:', productData.status);
      productData.status = 'draft';
    }

    try {
      if (editingProduct) {
        console.log('Updating product:', { id: editingProduct.id, data: productData });
        
        // Clean the data - remove undefined values
        const cleanData: any = {};
        Object.keys(productData).forEach(key => {
          const value = (productData as any)[key];
          if (value !== undefined && value !== null) {
            cleanData[key] = value;
          }
        });

        console.log('Cleaned product data:', cleanData);
        
        // First, update the product (without select to avoid RLS issues)
        const { error: updateError } = await supabase
          .from('products')
          .update(cleanData)
          .eq('id', editingProduct.id);

        if (updateError) {
          console.error('Error updating product:', updateError);
          console.error('Error details:', JSON.stringify(updateError, null, 2));
          toast.error(`Failed to update product: ${updateError.message}`);
          throw updateError;
        }

        console.log('Update successful!');
        console.log('Updated status to:', cleanData.status);
        console.log('Updated product ID:', editingProduct.id);
        
        // Refresh the product list to show updated status
        toast.success('Product updated successfully!');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

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
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description,
      status: product.status || 'draft',
      available: product.available ?? true,
      price: product.price?.toString() || '',
      price_on_request: product.price_on_request || false,
      thermal: product.properties?.thermal || false,
      electrical: product.properties?.electrical || false,
      chemical: product.properties?.chemical || false,
      materials: product.materials?.join(', ') || '',
      industries: product.industries?.join(', ') || '',
    });
    setIsDialogOpen(true);
    await fetchProductDetails(product.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will soft-delete the product.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error: any) {
      toast.error('Failed to delete product: ' + error.message);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected');
      return;
    }

    const productIds = Array.from(selectedProducts);

    try {
      switch (action) {
        case 'publish':
          await supabase.from('products').update({ status: 'published' }).in('id', productIds);
          toast.success(`${productIds.length} products published`);
          break;
        case 'hide':
          await supabase.from('products').update({ status: 'hidden' }).in('id', productIds);
          toast.success(`${productIds.length} products hidden`);
          break;
        case 'out_of_stock':
          await supabase.from('products').update({ status: 'out_of_stock' }).in('id', productIds);
          toast.success(`${productIds.length} products marked as out of stock`);
          break;
        case 'available':
          await supabase.from('products').update({ available: true }).in('id', productIds);
          toast.success(`${productIds.length} products marked as available`);
          break;
        case 'unavailable':
          await supabase.from('products').update({ available: false }).in('id', productIds);
          toast.success(`${productIds.length} products marked as unavailable`);
          break;
        case 'price_on_request':
          await supabase.from('products').update({ price_on_request: true }).in('id', productIds);
          toast.success(`${productIds.length} products set to price on request`);
          break;
        case 'delete':
          if (!confirm(`Soft-delete ${productIds.length} products?`)) return;
          await supabase.from('products').update({ deleted_at: new Date().toISOString() }).in('id', productIds);
          toast.success(`${productIds.length} products deleted`);
          break;
      }
      setSelectedProducts(new Set());
      fetchProducts();
    } catch (error: any) {
      toast.error('Bulk operation failed: ' + error.message);
    }
  };

  const toggleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      status: 'draft',
      available: true,
      price: '',
      price_on_request: false,
      thermal: false,
      electrical: false,
      chemical: false,
      materials: '',
      industries: '',
    });
    setEditingProduct(null);
    setProductImages([]);
    setProductVariants([]);
    setProductFiles([]);
  };

  const getStatusBadge = (status?: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      hidden: 'bg-yellow-500',
      discontinued: 'bg-red-500',
      out_of_stock: 'bg-orange-500',
    };
    const labels: Record<string, string> = {
      draft: 'Draft',
      published: 'Published',
      hidden: 'Hidden',
      discontinued: 'Discontinued',
      out_of_stock: 'Out of Stock',
    };
    return <Badge className={colors[status || 'draft']}>{labels[status || 'draft'] || status || 'draft'}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Product Management</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock / Not Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="available"
                        checked={formData.available}
                        onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                      />
                      <Label htmlFor="available">Available</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={formData.price_on_request}
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="price_on_request"
                        checked={formData.price_on_request}
                        onCheckedChange={(checked) => setFormData({ ...formData, price_on_request: checked as boolean })}
                      />
                      <Label htmlFor="price_on_request" className="cursor-pointer">Price on Request</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
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
                  />
                </div>
                
                {editingProduct && (
                  <>
                    <div className="border-t pt-4">
                      <Label>Product Images</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {productImages.map((img, idx) => (
                          <div key={img.id} className="relative">
                            <img src={img.image_path} alt={`Image ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                            <div className="absolute top-1 right-1 flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 bg-background/80"
                                onClick={() => handleDeleteImage(img.id, img.image_path)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            {img.is_primary && <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, false);
                          }}
                          className="max-w-xs"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e: any) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, true);
                            };
                            input.click();
                          }}
                        >
                          Upload Primary
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
                          <div key={variant.id} className="flex items-center gap-2 p-2 border rounded">
                            <span className="text-sm font-medium">{variant.variant_type}:</span>
                            <span className="text-sm">{variant.variant_label || variant.variant_value}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-auto h-6 w-6"
                              onClick={() => handleDeleteVariant(variant.id)}
                            >
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
                          <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="text-sm font-medium">{file.file_name}</span>
                              <span className="text-xs text-muted-foreground ml-2">({file.file_type})</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteFile(file.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            const fileType = prompt('File type (datasheet, compliance, certificate):') || 'datasheet';
                            if (file) handleFileUpload(file, fileType);
                          }}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <Label>Properties</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="thermal"
                        checked={formData.thermal}
                        onCheckedChange={(checked) => setFormData({ ...formData, thermal: checked as boolean })}
                      />
                      <Label htmlFor="thermal" className="cursor-pointer">Thermal</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="electrical"
                        checked={formData.electrical}
                        onCheckedChange={(checked) => setFormData({ ...formData, electrical: checked as boolean })}
                      />
                      <Label htmlFor="electrical" className="cursor-pointer">Electrical</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="chemical"
                        checked={formData.chemical}
                        onCheckedChange={(checked) => setFormData({ ...formData, chemical: checked as boolean })}
                      />
                      <Label htmlFor="chemical" className="cursor-pointer">Chemical</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="materials">Materials (comma-separated)</Label>
                  <Input
                    id="materials"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="POM, PTFE, HDPE"
                  />
                </div>
                <div>
                  <Label htmlFor="industries">Industries (comma-separated)</Label>
                  <Input
                    id="industries"
                    value={formData.industries}
                    onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
                    placeholder="Mechanical, Chemical, Food"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock / Not Available</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProducts.size > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={handleBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="hide">Hide</SelectItem>
                    <SelectItem value="out_of_stock">Mark Out of Stock</SelectItem>
                    <SelectItem value="available">Mark Available</SelectItem>
                    <SelectItem value="unavailable">Mark Unavailable</SelectItem>
                    <SelectItem value="price_on_request">Price on Request</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSelectAll}
                      className="h-6 w-6"
                    >
                      {selectedProducts.size === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => toggleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>
                      <Badge variant={product.available ? 'default' : 'secondary'}>
                        {product.available ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.price_on_request ? (
                        <span className="text-sm text-muted-foreground">On Request</span>
                      ) : product.price ? (
                        `$${product.price.toFixed(2)}`
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {product.materials?.join(', ') || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
