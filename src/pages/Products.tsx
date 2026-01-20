import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { productCategories } from '@/data/products';

export default function Products() {
  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Products' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">
              Explore our comprehensive range of engineering plastics and composites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products/${category.id}`}
                className="industrial-card group"
              >
                <div className="aspect-video bg-secondary mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-muted-foreground/20 rounded" />
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">{category.productCount} products</span>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
