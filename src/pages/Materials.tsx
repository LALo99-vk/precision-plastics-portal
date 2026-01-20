import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { materialsByTier } from '@/data/materials';

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

          {/* High-Performance Tier */}
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

          {/* Engineering Tier */}
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
              {materialsByTier.engineering.map((material) => (
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

          {/* Standard Tier */}
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
              {materialsByTier.standard.map((material) => (
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
        </div>
      </section>
    </Layout>
  );
}
