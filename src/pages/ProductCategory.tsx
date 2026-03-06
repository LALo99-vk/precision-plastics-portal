import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase, ensurePublicStorageUrl, Product, ProductCategory as ProductCategoryType } from '@/lib/supabase';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Product Category Page — MoMA-style clean grid                      */
/* ------------------------------------------------------------------ */
export default function ProductCategoryPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<ProductCategoryType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  /* ── Data fetching ─────────────────────────────────────────── */
  const fetchProducts = async (showLoading = true) => {
    if (!categoryId) return;
    try {
      if (showLoading) setIsLoading(true);
      const categoryName = categoryId.replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const { data: productsData, error } = await supabase
        .from('products')
        .select('id, name, category, description, image, status, available, properties, materials, industries, created_at, price, price_on_request')
        .is('deleted_at', null)
        .ilike('category', `%${categoryName}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(productsData || []);

      if (productsData && productsData.length > 0) {
        const productIds = productsData.map(p => p.id);
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('product_id, image_path, is_primary')
          .in('product_id', productIds)
          .order('is_primary', { ascending: false })
          .order('display_order');

        if (imagesData) {
          const imageMap: Record<string, string> = {};
          imagesData.forEach((img) => {
            if (!imageMap[img.product_id] || img.is_primary) {
              imageMap[img.product_id] = img.image_path;
            }
          });
          setProductImages(imageMap);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const fetchCategory = async () => {
    if (!categoryId) return;
    try {
      let { data } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', categoryId)
        .eq('status', 'published')
        .single();

      if (!data) {
        const categoryName = categoryId.replace(/-/g, ' ');
        const { data: altData } = await supabase
          .from('product_categories')
          .select('*')
          .eq('status', 'published')
          .ilike('name', `%${categoryName}%`)
          .limit(1)
          .single();
        data = altData;
      }

      setCategory(data || {
        id: categoryId,
        name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: '',
      });
    } catch {
      setCategory({
        id: categoryId,
        name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: '',
      });
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchProducts();
    }
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    const channel = supabase
      .channel(`product-status-changes-${categoryId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, () => fetchProducts(false))
      .subscribe();
    const poll = setInterval(() => fetchProducts(false), 3000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [categoryId]);

  /* ── Loading / Not found ───────────────────────────────────── */
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-black/40 uppercase tracking-wider">Loading products...</p>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mb-2">Category Not Found</h1>
          <p className="text-sm text-black/40">The requested product category does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Products', href: '/products' }, { label: category.name }]} />

        {/* Header */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 pb-4 border-b border-black/10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-sm text-black/50 mt-1 max-w-2xl">{category.description}</p>
          )}
          <p className="text-xs text-black/30 mt-2 uppercase tracking-wider">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Main content — grid */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-black/40 mb-6">No products found in this category.</p>
              <div className="max-w-md mx-auto p-6 rounded-xl border border-black/10 bg-black/[0.02]">
                <Search className="w-10 h-10 text-black/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Need something specific?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell us what you&apos;re looking for and we&apos;ll check availability and send you a quote.
                </p>
                <Button asChild>
                  <Link to="/custom-quote">Request a custom quote</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-black/50">
                  Need a product not listed here?{' '}
                  <Link to="/custom-quote" className="font-medium text-primary hover:underline">
                    Request a custom quote
                  </Link>
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                {products.map((product) => {
                    const rawImage = productImages[product.id] || product.image;
                    const imageSrc = rawImage ? (ensurePublicStorageUrl(rawImage) || rawImage) : undefined;
                    return (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        imageSrc={imageSrc}
                      />
                    );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

/* ------------------------------------------------------------------ */
/*  Clean product card — MoMA-style                                    */
/* ------------------------------------------------------------------ */
function ProductGridCard({ product, imageSrc }: { product: Product; imageSrc?: string }) {
  const { addItem, items } = useQuoteCart();
  const isInCart = items.some(item => item.id === product.id);
  const isUnavailable = product.status === 'out_of_stock' || product.status === 'discontinued';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUnavailable) return;
    addItem({ id: product.id, name: product.name, category: product.category });
    toast.success('Added to cart', { description: product.name, duration: 2000 });
  };

  const priceDisplay = () => {
    if (isUnavailable) return product.status === 'out_of_stock' ? 'Out of stock' : 'Discontinued';
    if (product.price_on_request) return 'Price on request';
    if (product.price) return `₹${product.price.toLocaleString('en-IN')}`;
    return 'Price on request';
  };

  return (
    <div className="group">
      <Link
        to={`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}/${product.id}`}
        className="block"
      >
        {/* Image */}
        <div className={`relative aspect-square bg-[#f5f5f5] rounded-lg overflow-hidden mb-3 ${isUnavailable ? 'opacity-50' : ''}`}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/5" />
            </div>
          )}

          {/* Status badge */}
          {product.status && product.status !== 'published' && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {product.status.replace('_', ' ')}
            </span>
          )}

          {/* Add to cart button — appears on hover */}
          {!isUnavailable && (
            <button
              onClick={handleAdd}
              className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isInCart
                  ? 'bg-black text-white opacity-100'
                  : 'bg-white text-black shadow-md opacity-0 group-hover:opacity-100'
              }`}
              title={isInCart ? 'Added to cart' : 'Add to quote'}
            >
              {isInCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Info */}
        <h3 className="text-sm font-medium text-black leading-snug mb-0.5 group-hover:underline">
          {product.name}
        </h3>
        <p className="text-[13px] text-black/40">
          {priceDisplay()}
        </p>
      </Link>
    </div>
  );
}
