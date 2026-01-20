import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import FilterPanel from '@/components/products/FilterPanel';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { productCategories, sampleProducts, compoundFilters, stockShapeFilters } from '@/data/products';

export default function ProductCategory() {
  const { categoryId } = useParams();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const category = productCategories.find(c => c.id === categoryId);
  
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

  // Filter products by category
  const categoryProducts = sampleProducts.filter(
    p => p.category.toLowerCase().replace(/\s+/g, '-') === categoryId
  );

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
                  Showing {categoryProducts.length > 0 ? categoryProducts.length : sampleProducts.length} products
                </p>
                <div className="flex items-center gap-2">
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
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {(categoryProducts.length > 0 ? categoryProducts : sampleProducts).map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    category={product.category}
                    description={product.description}
                    properties={product.properties}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
