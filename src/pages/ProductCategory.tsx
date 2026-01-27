import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import FilterPanel from '@/components/products/FilterPanel';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { supabase, Product, ProductImage, ProductCategory } from '@/lib/supabase';
import { compoundFilters, stockShapeFilters } from '@/data/products';

export default function ProductCategory() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (showLoading = true) => {
    if (!categoryId) return;

    try {
      if (showLoading) setIsLoading(true);
      
      // Convert categoryId back to category name for matching
      const categoryName = categoryId.replace(/-/g, ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Fetch all products (except deleted) to show status updates immediately
      // This allows admins to see status changes in real-time
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, description, image, status, available, properties, materials, industries, created_at, price, price_on_request')
        .is('deleted_at', null)
        .ilike('category', `%${categoryName}%`)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      // Debug: Log products with their status
      const productsWithStatus = productsData?.map(p => ({ id: p.id, name: p.name, status: p.status }));
      console.log('Fetched products with status:', productsWithStatus);
      console.log('Total products:', productsData?.length);
      console.log('Products with status:', productsData?.filter(p => p.status).length);

      setProducts(productsData || []);

      // Fetch primary images for all products
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
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };


  useEffect(() => {
    if (categoryId) {
      fetchCategory();
      fetchProducts();
    }
  }, [categoryId]);

  // Set up real-time subscription AND polling for product status updates
  useEffect(() => {
    if (!categoryId) return;

    console.log('Setting up real-time subscription for category:', categoryId);

    // Try real-time subscription first
    const channel = supabase
      .channel(`product-status-changes-${categoryId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          console.log('Product updated via real-time:', payload);
          console.log('New status:', payload.new?.status);
          // Refresh products when status is updated
          fetchProducts(false);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to product updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to product updates - will use polling instead');
        }
      });

    // Fallback: Poll every 3 seconds to check for updates
    // This ensures status updates are visible even without real-time subscriptions
    const pollInterval = setInterval(() => {
      console.log('Polling for product updates at', new Date().toLocaleTimeString());
      // Don't set loading state during polling to avoid UI flicker
      if (categoryId) {
        fetchProducts(false);
      }
    }, 3000);

    return () => {
      console.log('Cleaning up real-time subscription and polling');
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [categoryId]);

  const fetchCategory = async () => {
    if (!categoryId) return;
    
    try {
      // Try to find category by id first (only published)
      let { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', categoryId)
        .eq('status', 'published')
        .single();

      // If not found, try to find by name match (only published)
      if (error || !data) {
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

      if (data) {
        setCategory(data);
      } else {
        // Fallback: create category object from categoryId
        setCategory({
          id: categoryId,
          name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
    }
  };
  
  // Get appropriate filters based on category
  const getFilters = () => {
    switch (categoryId) {
      case 'compounds':
        return compoundFilters;
      case 'stock-shapes':
      case 'sintered-plastics':
        return stockShapeFilters;
      default:
        return compoundFilters.slice(0, 3);
    }
  };

  const filters = getFilters();

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const groupFilters = prev[groupId] || [];
      if (checked) {
        return { ...prev, [groupId]: [...groupFilters, optionId] };
      }
      return { ...prev, [groupId]: groupFilters.filter(id => id !== optionId) };
    });
  };

  const handleClearAll = () => {
    setSelectedFilters({});
  };

  // Apply filters to products
  let filteredProducts = [...products];
  
  // Filter by materials if selected
  if (selectedFilters['basic-polymer']?.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      p.materials?.some(m => 
        selectedFilters['basic-polymer']?.some(f => 
          m.toLowerCase().includes(f.toLowerCase())
        )
      )
    );
  }

  // Filter by industries if selected
  if (selectedFilters['industries']?.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      p.industries?.some(i => 
        selectedFilters['industries']?.some(f => 
          i.toLowerCase().includes(f.toLowerCase())
        )
      )
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <p>Loading products...</p>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">The requested product category does not exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb 
        items={[
          { label: 'Products', href: '/products' },
          { label: category.name }
        ]} 
      />

      <section className="industrial-section">
        <div className="industrial-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="flex gap-8">
            {/* Filter Panel */}
            <FilterPanel
              groups={filters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />

            {/* Product Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Manual refresh triggered');
                      fetchProducts(true);
                    }}
                    title="Refresh products to see latest status updates"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Products */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No products found in this category
                </div>
              ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredProducts.map((product) => {
                    // Debug: Log each product's status
                    if (!product.status) {
                      console.warn('Product missing status:', product.id, product.name);
                    }
                    return (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        category={product.category}
                        description={product.description}
                        image={productImages[product.id] || product.image}
                        properties={product.properties}
                        status={product.status || 'published'}
                      />
                    );
                  })}
              </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
