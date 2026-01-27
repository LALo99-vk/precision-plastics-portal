import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { supabase, ProductCategory } from '@/lib/supabase';

export default function Index() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch published categories only
      const { data: categoriesData, error: catError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('status', 'published')
        .order('name')
        .limit(6);

      if (catError) throw catError;

      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'published')
        .eq('available', true)
        .is('deleted_at', null);

      if (prodError) throw prodError;

      const counts: Record<string, number> = {};
      productsData?.forEach((p) => {
        const categoryId = p.category.toLowerCase().replace(/\s+/g, '-');
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });

      setProductCounts(counts);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Modern Hero Section with Geometric Design */}
      <section className="relative bg-white overflow-hidden">
        {/* Professional Background Geometric Patterns */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle gradient overlay */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          
          {/* Structured grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Large geometric accent - top right */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/8 to-transparent transform translate-x-1/3 -translate-y-1/3 rotate-45 rounded-full blur-3xl" />
          
          {/* Structured geometric lines - left side */}
          <div className="absolute left-0 top-1/4 w-px h-48 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute left-12 top-1/4 w-32 h-px bg-gradient-to-r from-primary/20 to-transparent" />
          
          {/* Structured geometric lines - right side */}
          <div className="absolute right-0 bottom-1/4 w-px h-48 bg-gradient-to-t from-transparent via-destructive/20 to-transparent" />
          <div className="absolute right-12 bottom-1/4 w-32 h-px bg-gradient-to-l from-destructive/20 to-transparent" />
          
          {/* Corner accent elements - more structured */}
          <div className="absolute top-16 left-16 w-24 h-24 border border-primary/15 rounded-lg rotate-12" />
          <div className="absolute bottom-16 right-16 w-32 h-32 border border-destructive/15 rounded-lg -rotate-12" />
        </div>

        <div className="industrial-container py-20 md:py-32 lg:py-40 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content Area */}
            <div className="relative z-10">
              {/* Brand tag */}
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-6">
                NYLOKING &amp; CO
              </p>
              
              {/* Split-color headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                <span className="block text-primary">ENGINEERING</span>
                <span className="block text-primary">PLASTICS</span>
                <span className="block text-destructive">FOR YOU!</span>
              </h1>
              
              {/* Sub-headline */}
              <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-lg font-medium">
                FIND THE BEST PRODUCTS AT COMPETITIVE PRICES.
              </p>
              
              {/* CTA Button */}
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6 rounded-lg font-semibold shadow-lg"
              >
                <Link to="/products">
                  SEE PRODUCTS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Right Image Area with Geometric Frame */}
            <div className="relative lg:min-h-[500px]">
              {/* Geometric frame - rotated diamond/rhombus */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Outer frame */}
                <div className="absolute inset-0 rotate-12 border-4 border-primary rounded-2xl shadow-2xl">
                  <div className="absolute inset-2 border-2 border-white rounded-xl">
                    <div className="absolute inset-2 border border-destructive/30 rounded-lg">
                      {/* Main image area */}
                      <div className="absolute inset-4 rounded-lg overflow-hidden">
                        <img 
                          src="/images/home/heromain2.jpg" 
                          alt="Nyloking & Co - Engineering Plastics" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional decorative elements around image */}
              <div className="absolute -top-6 -right-6 w-20 h-20 border-2 border-primary/30 rotate-45 bg-white/90 backdrop-blur-sm shadow-lg rounded-sm" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 border-2 border-destructive/30 rotate-45 bg-white/90 backdrop-blur-sm shadow-lg rounded-sm" />
              
              {/* Subtle accent lines */}
              <div className="absolute top-1/4 -left-12 w-8 h-px bg-gradient-to-r from-primary/40 to-transparent" />
              <div className="absolute bottom-1/4 -right-12 w-8 h-px bg-gradient-to-l from-destructive/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="relative bg-gradient-to-b from-white via-blue-50/20 to-white py-20 md:py-24 overflow-hidden">
        {/* Professional background patterns */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px'
            }}
          />
          
          {/* Structured geometric shapes */}
          <div className="absolute top-20 right-20 w-40 h-40 border border-primary/10 rounded-2xl rotate-12" />
          <div className="absolute bottom-32 left-24 w-32 h-32 border border-destructive/10 rounded-xl -rotate-12" />
          
          {/* Subtle gradient accents */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-destructive/5 to-transparent rounded-full blur-3xl" />
          
          {/* Clean vertical accent line */}
          <div className="absolute top-1/4 left-0 w-px h-96 bg-gradient-to-b from-transparent via-primary/15 to-transparent" />
        </div>

        <div className="industrial-container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 relative">
              <Package className="w-10 h-10 text-primary" />
              {/* Decorative corner */}
              <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-destructive rotate-45" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-primary">BROWSE OUR</span>{' '}
              <span className="text-destructive">PRODUCT CATALOG</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto font-medium">
              Explore our comprehensive range of engineering plastics organized by category. 
              Find the perfect material solution for your application.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const categoryId = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
                const count = productCounts[categoryId] || category.productCount || 0;
                return (
                  <Link
                    key={category.id}
                    to={`/products/${categoryId}`}
                    className="group relative bg-white border-2 border-border rounded-xl p-6 hover:border-primary transition-all duration-300 hover:shadow-xl"
                  >
                    {/* Decorative corner element */}
                    <div className="absolute top-4 right-4 w-3 h-3 border-2 border-primary/30 rotate-45 group-hover:border-primary transition-colors" />
                    
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-destructive/5 mb-4 flex items-center justify-center overflow-hidden rounded-lg relative">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-10 h-10 text-primary/40" />
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm font-bold text-primary">{count} products</span>
                      <ArrowRight className="w-5 h-5 text-foreground/40 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {categories.length > 0 && (
            <div className="text-center mt-16">
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-base font-semibold rounded-lg"
              >
                <Link to="/products">
                  VIEW ALL PRODUCTS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
