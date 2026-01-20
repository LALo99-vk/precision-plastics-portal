import { Link } from 'react-router-dom';
import { ArrowRight, Package, Layers, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { productCategories } from '@/data/products';
import { materialsByTier } from '@/data/materials';
import { industries } from '@/data/industries';

export default function Index() {
  return (
    <Layout>
      {/* Hero Section - Black & White */}
      <section className="bg-hero-bg text-hero-fg">
        <div className="industrial-container py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Engineering Plastics & Composites
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl">
              High-performance thermoplastics and composite materials for demanding industrial applications. 
              From stock shapes to custom compounds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/products">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-hero-fg text-hero-fg hover:bg-hero-fg hover:text-hero-bg">
                <Link to="/quote-cart">
                  Request Quotation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="industrial-section bg-background">
        <div className="industrial-container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Products</h2>
            </div>
            <Link to="/products" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCategories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                className="industrial-card group"
              >
                <div className="aspect-video bg-secondary mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description}
                </p>
                <span className="text-xs text-primary">{category.productCount} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="industrial-section bg-secondary">
        <div className="industrial-container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Layers className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Materials</h2>
            </div>
            <Link to="/materials" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View all materials <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* High-Performance */}
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                High-Performance
              </h3>
              <div className="space-y-2">
                {materialsByTier['high-performance'].slice(0, 6).map((mat) => (
                  <Link
                    key={mat.id}
                    to={`/materials/${mat.id}`}
                    className="block py-2 px-3 bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="font-medium text-sm">{mat.name}</div>
                    <div className="text-xs text-muted-foreground">{mat.fullName}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Engineering */}
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                Engineering
              </h3>
              <div className="space-y-2">
                {materialsByTier.engineering.slice(0, 6).map((mat) => (
                  <Link
                    key={mat.id}
                    to={`/materials/${mat.id}`}
                    className="block py-2 px-3 bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="font-medium text-sm">{mat.name}</div>
                    <div className="text-xs text-muted-foreground">{mat.fullName}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Standard */}
            <div>
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
                Standard
              </h3>
              <div className="space-y-2">
                {materialsByTier.standard.slice(0, 5).map((mat) => (
                  <Link
                    key={mat.id}
                    to={`/materials/${mat.id}`}
                    className="block py-2 px-3 bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="font-medium text-sm">{mat.name}</div>
                    <div className="text-xs text-muted-foreground">{mat.fullName}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="industrial-section bg-background">
        <div className="industrial-container">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Factory className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Industries</h2>
            </div>
            <Link to="/industries" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View all industries <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {industries.slice(0, 10).map((industry) => (
              <Link
                key={industry.id}
                to={`/industries/${industry.id}`}
                className="p-4 border border-border hover:border-primary/30 bg-background hover:bg-accent/50 transition-colors text-center"
              >
                <span className="font-medium text-sm">{industry.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="industrial-container text-center">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Need Technical Support?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Our engineering team is ready to help you select the right material for your application. 
            Contact us for technical consultation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/quote-cart">Request Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
