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
      {/* LIFESTYLE HERO SECTION */}
      <section className="relative bg-[#e8e4d8] min-h-screen pt-20 pb-12 overflow-hidden flex flex-col items-center">

        {/* 1. Main Headline Area */}
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-[12vw] md:text-[10vw] xl:text-[7.5rem] font-light tracking-tight leading-[0.9] flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span>NYLOKING</span>
              <span className="inline-flex items-center justify-center px-6 py-1 md:px-10 md:py-3 rounded-[3rem] border-2 border-black text-[4vw] md:text-[3vw] xl:text-5xl font-normal bg-transparent">
                & CO
              </span>
              <span className="font-bold">PLASTICS</span>
            </h1>
          </div>
        </div>

        {/* 2. Bento Grid Layout */}
        <div className="w-full max-w-[1300px] mx-auto px-4 md:px-6">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">

              {/* LEFT CARD: Collection Navigation + Image */}
              <div className="md:col-span-4 bg-[#f0ebe0] rounded-[2rem] p-6 relative overflow-hidden flex flex-col min-h-[450px]">
                {/* Floating Nav Pills */}
                <div className="flex flex-col gap-2.5 z-20 mb-4">
                  {categories.slice(0, 3).map((category, idx) => (
                    <Link
                      key={category.id}
                      to={`/products/${category.id || category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-full transition-all text-xs font-bold uppercase tracking-wider ${idx === 2
                        ? 'bg-black text-white'
                        : 'bg-white/90 backdrop-blur-sm border border-black/10 hover:bg-black hover:text-white'
                        }`}
                    >
                      <span className="truncate mr-2">{category.name}</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </Link>
                  ))}
                </div>

                {/* Main Image */}
                <div className="mt-auto relative w-full flex-1 rounded-[1.5rem] overflow-hidden">
                  <img
                    src="/images/home/heromain2.jpg"
                    alt="Collection"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Text */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/95 backdrop-blur-sm rounded-xl">
                    <p className="text-[9px] leading-relaxed text-muted-foreground">
                      Style seamlessly blending mystery and movement into a mesmerizing ensemble of avant-garde fashion.
                    </p>
                  </div>

                  {/* Corner Arrow */}
                  <div className="absolute top-3 right-3 bg-white rounded-full p-1.5">
                    <ArrowRight className="w-3 h-3 -rotate-45" />
                  </div>
                </div>
              </div>

              {/* CENTER: 3-Column Image/Video Grid */}
              <div className="md:col-span-4 flex flex-col gap-4 relative min-h-[400px]">
                <div className="grid grid-cols-3 gap-3 h-full">
                  {/* Column 1: Image */}
                  <div className="rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 relative group">
                    <img
                      src="/images/home/heromain2.jpg"
                      alt="Product showcase 1"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Column 2: Video */}
                  <div className="rounded-[1.5rem] overflow-hidden bg-black relative group">
                    <img
                      src="/images/home/heromain2.jpg"
                      alt="Product showcase video"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer">
                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[9px] border-l-white border-b-[6px] border-b-transparent ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Column 3: Image */}
                  <div className="rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 relative group">
                    <img
                      src="/images/home/heromain2.jpg"
                      alt="Product showcase 2"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Media + Stats */}
              <div className="md:col-span-4 flex flex-col gap-4 h-full">
                {/* Top: Video/Image Card */}
                <Link to="/products" className="flex-1 bg-black rounded-[2rem] p-3 relative overflow-hidden group min-h-[250px]">
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-15">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="h-full w-px bg-white/40" />
                    ))}
                  </div>

                  <div className="flex h-full gap-3 relative z-10">
                    <div className="flex-1 rounded-[1.2rem] overflow-hidden relative">
                      <img src="/images/home/heromain2.jpg" className="w-full h-full object-cover opacity-70" alt="Product 1" />
                    </div>
                    <div className="flex-1 rounded-[1.2rem] overflow-hidden relative mt-8 bg-zinc-900">
                      <div className="absolute top-2 right-2 bg-[#e0dcd0] text-black text-[8px] px-2 py-0.5 rounded font-bold uppercase">New</div>
                      <img src="/images/home/heromain2.jpg" className="w-full h-full object-cover opacity-50" alt="Product 2" />
                    </div>
                  </div>

                  {/* Play Button Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm cursor-pointer group-hover:scale-110 transition-transform bg-white/10 text-white z-20">
                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[10px] border-l-white border-b-[7px] border-b-transparent ml-1" />
                  </div>
                </Link>

                {/* Bottom: Satisfaction Card */}
                <div className="bg-[#f0ebe0] rounded-[2rem] p-5 h-32 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex -space-x-1.5">
                      <div className="w-8 h-8 rounded-full border-2 border-[#f0ebe0] bg-zinc-300" />
                      <div className="w-8 h-8 rounded-full border-2 border-[#f0ebe0] bg-zinc-400" />
                      <div className="w-8 h-8 rounded-full border-2 border-[#f0ebe0] bg-zinc-500 flex items-center justify-center text-[10px] text-white font-bold">+</div>
                    </div>
                    <span className="text-3xl font-bold font-mono leading-none">89<span className="text-lg">%</span></span>
                  </div>
                  <div>
                    <div className="w-full h-1.5 bg-black/10 rounded-full mb-2 overflow-hidden">
                      <div className="w-[89%] h-full bg-black rounded-full" />
                    </div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Satisfied Customers</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
