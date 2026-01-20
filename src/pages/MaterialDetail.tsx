import { useParams, Link } from 'react-router-dom';
import { Thermometer, Shield, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { materials } from '@/data/materials';
import { sampleProducts } from '@/data/products';

export default function MaterialDetail() {
  const { materialId } = useParams();
  const material = materials.find(m => m.id === materialId);

  if (!material) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Material Not Found</h1>
          <p className="text-muted-foreground">The requested material does not exist.</p>
        </div>
      </Layout>
    );
  }

  const relatedProducts = sampleProducts.filter(
    p => p.materials?.includes(material.name)
  );

  const tierLabel = {
    'high-performance': 'High-Performance Plastic',
    engineering: 'Engineering Plastic',
    standard: 'Standard Plastic'
  };

  return (
    <Layout>
      <Breadcrumb 
        items={[
          { label: 'Materials', href: '/materials' },
          { label: material.name }
        ]} 
      />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm font-medium text-primary uppercase tracking-wide">
                  {tierLabel[material.tier]}
                </span>
                <h1 className="text-3xl font-bold mt-2 mb-1">{material.name}</h1>
                <p className="text-lg text-muted-foreground">{material.fullName}</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-3">Overview</h2>
                <p className="text-muted-foreground">{material.description}</p>
              </div>

              {/* Key Properties */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Key Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {material.maxTemp && (
                    <div className="industrial-card p-4">
                      <Thermometer className="w-6 h-6 text-primary mb-2" />
                      <div className="text-sm text-muted-foreground">Max Temperature</div>
                      <div className="font-semibold">{material.maxTemp}</div>
                    </div>
                  )}
                  <div className="industrial-card p-4">
                    <Shield className="w-6 h-6 text-primary mb-2" />
                    <div className="text-sm text-muted-foreground">Chemical Resistance</div>
                    <div className="font-semibold">Excellent</div>
                  </div>
                  <div className="industrial-card p-4">
                    <Zap className="w-6 h-6 text-primary mb-2" />
                    <div className="text-sm text-muted-foreground">Electrical Properties</div>
                    <div className="font-semibold">Insulating</div>
                  </div>
                </div>
              </div>

              {/* Applications */}
              {material.applications && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Typical Applications</h2>
                  <ul className="grid grid-cols-2 gap-2">
                    {material.applications.map((app, index) => (
                      <li key={index} className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Industries */}
              {material.industries && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Industries</h2>
                  <div className="flex flex-wrap gap-2">
                    {material.industries.map((ind, index) => (
                      <Link
                        key={index}
                        to={`/industries/${ind.toLowerCase().replace(/\s+/g, '-')}`}
                        className="px-3 py-1 bg-secondary text-sm hover:bg-accent transition-colors"
                      >
                        {ind}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* CTA Card */}
              <div className="industrial-card bg-secondary mb-6">
                <h3 className="font-semibold mb-4">Need {material.name} Products?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse our selection of {material.name} products or contact us for custom solutions.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/products/stock-shapes">Browse Products</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/contact">Ask a Question</Link>
                  </Button>
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Related Products</h3>
                  <div className="space-y-3">
                    {relatedProducts.slice(0, 4).map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}/${product.id}`}
                        className="block p-3 border border-border hover:border-primary/30 transition-colors"
                      >
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
