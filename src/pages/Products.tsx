import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase, ProductCategory } from '@/lib/supabase';

export default function Products() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Fetch published categories from database
      const { data: categoriesData, error: catError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('status', 'published')
        .order('name');

      if (catError) throw catError;

      // Fetch product counts for each category (only published and available)
      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('category')
        .eq('status', 'published')
        .eq('available', true)
        .is('deleted_at', null);

      if (prodError) throw prodError;

      // Count products per category
      const counts: Record<string, number> = {};
      productsData?.forEach((p) => {
        const categoryId = p.category.toLowerCase().replace(/\s+/g, '-');
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });

      setProductCounts(counts);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Fallback to empty array
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Products' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">
              Explore our range of engineering plastic sheets, rods, tubes and speciality products from Nyloking &amp; Co.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[300px]">
              {categories.map((category, i) => {
                const categoryId = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
                const count = productCounts[categoryId] || category.productCount || 0;

                // Bento Layout Pattern:
                // 0: Large square (2x2)
                // 3: Wide (2x1)
                // 6: Tall (1x2)
                const isLarge = i === 0 || i === 7;
                const isWide = i === 3 || i === 6;
                const colSpan = isLarge ? "md:col-span-2 md:row-span-2" : isWide ? "md:col-span-2" : "md:col-span-1";

                return (
                  <div
                    key={category.id}
                    className={`group relative rounded-3xl overflow-hidden border-4 border-slate-100 bg-white hover:border-slate-900 transition-all duration-300 ${colSpan}`}
                  >
                    <Link to={`/products/${categoryId}`} className="block h-full w-full">
                      {/* Image Container */}
                      <div className="absolute inset-0 w-full h-full">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                            <div className="w-20 h-20 bg-slate-200 rounded-full animate-pulse" />
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter mb-2">
                            {category.name}
                          </h2>
                          <p className="text-sm text-slate-300 line-clamp-2 max-w-[90%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-4">
                            {category.description}
                          </p>

                          <div className="flex items-center justify-between border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200">
                            <span className="text-xs font-bold text-primary-foreground bg-primary px-2 py-1 rounded">
                              {count} ITEMS
                            </span>
                            <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                              <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating "View Specs" Badge - like reference */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                        <span className="bg-white text-black font-bold px-6 py-3 rounded-full shadow-xl">
                          View Specs
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Price catalogues & query CTA */}
          <div className="mt-16 max-w-3xl mx-auto rounded-2xl bg-muted/50 border border-border p-6 md:p-8 text-center">
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              We have all the products you need — they may not all be listed on this website, but they&apos;re available at our shop. If the product you&apos;re looking for is not here, search in our{' '}
              <Link to="/price-list" className="font-semibold text-primary hover:underline">
                price catalogues
              </Link>
              {' '}or{' '}
              <Link to="/contact" className="font-semibold text-primary hover:underline">
                send us a query
              </Link>
              {' '}with the product details and requirements — we&apos;ll get back to you soon.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
