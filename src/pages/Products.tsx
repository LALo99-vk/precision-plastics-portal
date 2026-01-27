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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryId = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
                const count = productCounts[categoryId] || category.productCount || 0;
                return (
              <Link
                key={category.id}
                    to={`/products/${categoryId}`}
                className="industrial-card group relative"
              >
                    <div className="aspect-video bg-secondary mb-4 flex items-center justify-center overflow-hidden relative">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                  <div className="w-16 h-16 bg-muted-foreground/20 rounded" />
                      )}
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                      <span className="text-sm text-primary">{count} products</span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
                );
              })}
          </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
