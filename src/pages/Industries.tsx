import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { industries } from '@/data/industries';

export default function Industries() {
  return (
    <Layout>
      <Breadcrumb items={[{ label: 'Industries' }]} />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2">Industries</h1>
            <p className="text-muted-foreground max-w-3xl">
              We serve a wide range of industries with specialized materials and technical expertise. 
              Explore solutions tailored to your sector's unique requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <Link
                key={industry.id}
                to={`/industries/${industry.id}`}
                className="industrial-card group"
              >
                <div className="aspect-video bg-secondary mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 bg-muted-foreground/20 rounded" />
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {industry.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {industry.description}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
