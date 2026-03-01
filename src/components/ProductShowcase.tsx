import { ArrowRight } from 'lucide-react';
import delrinImg from '@/assets/product-delrin-sheets.jpg';
import hdpeImg from '@/assets/product-hdpe-sheets.jpg';
import teflonImg from '@/assets/product-teflon-sheets.jpg';
import uhmwImg from '@/assets/product-uhmw-rods.jpg';

const PRODUCTS = [
  { name: 'Delrin POM Sheets', material: 'Polyacetal', image: delrinImg },
  { name: 'Plain HDPE Sheet', material: 'High-Density Polyethylene', image: hdpeImg },
  { name: 'White Teflon Sheet', material: 'PTFE', image: teflonImg },
  { name: 'UHMW PE Sheet & Rods', material: 'Ultra-High Molecular Weight', image: uhmwImg },
];

export default function ProductShowcase() {
  return (
    <section className="bg-background py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase mb-4">
              LAMINATED SHEETS & MORE
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              The Sheet Collection
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-sm md:text-base leading-relaxed">
            Leading manufacturers of Delrin POM, PP, HDPE, Teflon, and UHMW PE sheets and rods — precision cut from Bengaluru, India.
          </p>
        </div>

        {/* Product grid — 2 large + 2 small */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Large card */}
          <div className="md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden bg-card border border-border">
            <img
              src={PRODUCTS[0].image}
              alt={PRODUCTS[0].name}
              className="w-full h-full object-cover min-h-[400px] md:min-h-[520px] group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-xs font-semibold tracking-widest text-accent/60 uppercase mb-1">
                {PRODUCTS[0].material}
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-accent">
                {PRODUCTS[0].name}
              </h3>
            </div>
          </div>

          {/* Smaller cards */}
          {PRODUCTS.slice(1).map((product) => (
            <div
              key={product.name}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border min-h-[240px]"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] font-semibold tracking-widest text-accent/60 uppercase mb-1">
                  {product.material}
                </p>
                <h3 className="font-display text-lg font-bold text-accent">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {['PP Sheets', 'Polypropylene', 'Plastic Sheets', 'Plast Nova'].map((tag) => (
              <span key={tag} className="bg-card border border-border rounded-full px-4 py-2">
                {tag}
              </span>
            ))}
          </div>
          <button className="btn-pill inline-flex items-center gap-2">
            VIEW ALL SHEETS <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
