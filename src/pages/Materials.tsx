import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { supabase, Material } from '@/lib/supabase';

const tierLabels = {
  'high-performance': {
    title: 'High-Performance Plastics',
    description: 'For the most demanding applications in aerospace, medical, semiconductor, and extreme environments.'
  },
  engineering: {
    title: 'Engineering Plastics',
    description: 'Balanced performance-cost materials for mechanical, automotive, and general industrial applications.'
  },
  standard: {
    title: 'Standard / Industrial Plastics',
    description: 'Cost-effective solutions for high-volume applications and general industrial use.'
  }
};

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('tier')
        .order('name');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error: any) {
      console.error('Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const materialsByTier = {
    'high-performance': materials.filter(m => m.tier === 'high-performance'),
    'engineering': materials.filter(m => m.tier === 'engineering'),
    'standard': materials.filter(m => m.tier === 'standard'),
  };

  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Materials' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">Materials</h1>
            <p className="text-muted-foreground max-w-3xl">
              Comprehensive range of thermoplastics organized by performance tier. 
              From high-performance polymers to cost-effective industrial plastics.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading materials...</div>
          ) : (
            <>
          {/* High-Performance Tier */}
              {materialsByTier['high-performance'].length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-primary mb-2">
                {tierLabels['high-performance'].title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tierLabels['high-performance'].description}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {materialsByTier['high-performance'].map((material) => (
                <Link
                  key={material.id}
                  to={`/materials/${material.id}`}
                  className="industrial-card group p-4"
                >
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {material.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {material.fullName}
                  </div>
                  {material.maxTemp && (
                    <div className="text-xs text-primary mt-2">
                      up to {material.maxTemp}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
              )}

          {/* Engineering Tier */}
              {materialsByTier['engineering'].length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-primary mb-2">
                {tierLabels.engineering.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tierLabels.engineering.description}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {materialsByTier['engineering'].map((material) => (
                <Link
                  key={material.id}
                  to={`/materials/${material.id}`}
                  className="industrial-card group p-4"
                >
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {material.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {material.fullName}
                  </div>
                  {material.maxTemp && (
                    <div className="text-xs text-primary mt-2">
                      up to {material.maxTemp}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
              )}

          {/* Standard Tier */}
              {materialsByTier['standard'].length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-primary mb-2">
                {tierLabels.standard.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tierLabels.standard.description}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {materialsByTier['standard'].map((material) => (
                <Link
                  key={material.id}
                  to={`/materials/${material.id}`}
                  className="industrial-card group p-4"
                >
                  <div className="font-semibold group-hover:text-primary transition-colors">
                    {material.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {material.fullName}
                  </div>
                  {material.maxTemp && (
                    <div className="text-xs text-primary mt-2">
                      up to {material.maxTemp}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
              )}

              {materials.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  No materials found
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
