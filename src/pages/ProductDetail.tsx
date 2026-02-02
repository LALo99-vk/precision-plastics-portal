import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { supabase, ensurePublicStorageUrl, Product, ProductImage } from '@/lib/supabase';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { categoryId, productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addItem, items } = useQuoteCart();
  
  // Check if this product is already in the cart
  const isInCart = product ? items.some(item => item.id === product.id) : false;
  const cartItem = product ? items.find(item => item.id === product.id) : null;
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Refetch when user returns to this tab so newly added images from admin show
  useEffect(() => {
    if (!productId) return;
    const onVisible = () => { if (document.visibilityState === 'visible') fetchProduct(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [productId]);

  useEffect(() => {
    if (!carouselApi || !productImages.length) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', () => setCurrentSlide(carouselApi.selectedScrollSnap()));
  }, [carouselApi, productImages.length]);

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .is('deleted_at', null)
        .single();

      if (productError) throw productError;
      setProduct(productData);
      
      // Debug: Log product data
      console.log('Product data loaded:', productData);
      console.log('Product specifications:', productData?.specifications);

      // Fetch ALL product images (product_images table) in display order
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('image_path, is_primary, display_order')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      const fromTable = (imagesData || []).map(img => ensurePublicStorageUrl(img.image_path) || img.image_path);
      const legacyUrl = productData?.image ? (ensurePublicStorageUrl(productData.image) || productData.image) : '';

      // Show both: legacy product.image first (if not duplicate), then all from product_images
      const allImages: string[] = [];
      if (legacyUrl && !fromTable.includes(legacyUrl)) {
        allImages.push(legacyUrl);
      }
      allImages.push(...fromTable);

      if (allImages.length > 0) {
        setProductImages(allImages);
        setPrimaryImage(allImages[0]);
      } else if (legacyUrl) {
        setProductImages([legacyUrl]);
        setPrimaryImage(legacyUrl);
      }
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToQuote = () => {
    if (product) {
      const existingItem = items.find(i => i.id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
      
      addItem({ id: product.id, name: product.name, category: product.category });
      
      // Show success notification
      toast.success('Product added to cart!', {
        description: `${product.name} (Quantity: ${newQuantity})`,
        duration: 3000,
      });
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return `₹ ${price.toLocaleString('en-IN')}`;
  };

  const getSpecificationValue = (key: string) => {
    if (!product?.specifications) return null;
    const value = product.specifications[key];
    return value && value.trim() !== '' ? value : null;
  };

  // Get default values from product fields if specifications don't exist
  const getDisplayValue = (key: string, fallback?: string) => {
    const specValue = getSpecificationValue(key);
    if (specValue) return specValue;
    if (fallback) return fallback;
    return null;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product does not exist.</p>
          <Button asChild className="mt-4">
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const isOutOfStock = product.status === 'out_of_stock';
  const isUnavailable = product.status === 'out_of_stock' || product.status === 'discontinued';

  return (
    <Layout>
      <Breadcrumb 
        items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/products/${categoryId || product.category.toLowerCase().replace(/\s+/g, '-')}` },
          { label: product.name }
        ]} 
      />

      <section className="industrial-section">
        <div className="industrial-container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product images: always use carousel so user can swipe left/right (1, 2, 3…) */}
            <div className="relative">
              {productImages.length >= 1 ? (
                <>
                  <Carousel
                    setApi={setCarouselApi}
                    opts={{ align: 'start', loop: productImages.length > 1, dragFree: false }}
                    className={`w-full rounded-lg overflow-hidden relative ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                  >
                    <CarouselContent className="ml-0">
                      {productImages.map((img, idx) => (
                        <CarouselItem key={idx} className="pl-0">
                          <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                            <img
                              src={ensurePublicStorageUrl(img) || img}
                              alt={`${product.name} – image ${idx + 1}`}
                              className="w-full h-full object-cover select-none"
                              draggable={false}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {productImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 border-0 bg-background/80 shadow" />
                        <CarouselNext className="right-2 border-0 bg-background/80 shadow" />
                      </>
                    )}
                  </Carousel>
                  {/* Dots 1, 2, 3… – tap to jump, swipe left/right to see all images */}
                  <div className="flex justify-center gap-2 mt-3 flex-wrap">
                    {productImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`View image ${idx + 1}`}
                        onClick={() => carouselApi?.scrollTo(idx)}
                        className={`min-w-[2rem] h-8 rounded-full text-sm font-medium transition-colors ${
                          currentSlide === idx
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`aspect-square bg-secondary rounded-lg overflow-hidden ${isOutOfStock ? 'grayscale opacity-60' : ''}`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {product.status && product.status !== 'published' && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge
                    className={
                      product.status === 'out_of_stock' ? 'bg-orange-500 hover:bg-orange-600' :
                      product.status === 'discontinued' ? 'bg-red-500 hover:bg-red-600' :
                      product.status === 'hidden' ? 'bg-yellow-500 hover:bg-yellow-600' :
                      'bg-gray-500 hover:bg-gray-600'
                    }
                  >
                    {product.status === 'out_of_stock' ? 'Out of Stock' :
                     product.status === 'discontinued' ? 'Discontinued' :
                     product.status === 'hidden' ? 'Hidden' :
                     product.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Information - Right Side */}
            <div className="space-y-6">
              {/* Product Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                
                {/* Price and Get Latest Price */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  {product.price && !product.price_on_request ? (
                    <>
                      <span className="text-2xl font-semibold text-primary">
                        {formatPrice(product.price)}
                        {product.specifications?.unit ? `/${product.specifications.unit}` : '/Kg'}
                      </span>
                      <Link 
                        to="/contact" 
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Get Latest Price
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-semibold text-primary">Price on Request</span>
                      <Link 
                        to="/contact" 
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Get Latest Price
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Specifications Table - Always show with defaults */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold">Product Specifications</h3>
                </div>
                <div className="divide-y divide-border">
                  {/* Thickness */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Thickness</span>
                    <span>{getDisplayValue('thickness') || getDisplayValue('thickness_mm') || 'N/A'}</span>
                  </div>
                  
                  {/* Color */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Color</span>
                    <span>{getDisplayValue('color') || 'Standard'}</span>
                  </div>
                  
                  {/* Size */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Size</span>
                    <span>{getDisplayValue('size') || getDisplayValue('dimensions') || 'Standard Sizes Available'}</span>
                  </div>
                  
                  {/* Usage/Application */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Usage/Application</span>
                    <span>
                      {getDisplayValue('usage') || 
                       getDisplayValue('application') ||
                       (product.industries && product.industries.length > 0 ? product.industries.join(', ') : 'Industrial')}
                    </span>
                  </div>
                  
                  {/* Packaging Type */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Packaging Type</span>
                    <span>{getDisplayValue('packaging') || getDisplayValue('packaging_type') || 'Sheet'}</span>
                  </div>
                  
                  {/* Country of Origin */}
                  <div className="grid grid-cols-2 px-4 py-3">
                    <span className="font-medium text-muted-foreground">Country of Origin</span>
                    <span>{getDisplayValue('country_of_origin') || getDisplayValue('origin') || 'Made in India'}</span>
                  </div>
                  
                  {/* Material - only show if available */}
                  {product.materials && product.materials.length > 0 && (
                    <div className="grid grid-cols-2 px-4 py-3">
                      <span className="font-medium text-muted-foreground">Material</span>
                      <span>{product.materials.join(', ')}</span>
                    </div>
                  )}
                  
                  {/* Grade - only show if available */}
                  {getDisplayValue('grade') && (
                    <div className="grid grid-cols-2 px-4 py-3">
                      <span className="font-medium text-muted-foreground">Grade</span>
                      <span>{getDisplayValue('grade')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Description */}
              <div className="bg-muted/30 rounded-lg p-6">
                <p className="text-sm leading-relaxed">
                  Established in the year 1992, we, <strong>'Nyloking & Co'</strong>, are a recognized retailers and wholesalers of all kinds of Engineering Plastic products and its products.
                </p>
              </div>

              {/* Call to Action Button */}
              <div>
                <Button
                  size="lg"
                  className={`w-full text-lg py-6 transition-all ${
                    isInCart 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                  onClick={handleAddToQuote}
                  disabled={isUnavailable}
                >
                  {isUnavailable ? (
                    'Not Available'
                  ) : isInCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart {quantity > 1 ? `(${quantity})` : ''}
                    </>
                  ) : (
                    <>
                      Yes, I am interested!
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3">Product Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
