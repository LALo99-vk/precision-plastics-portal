import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import Breadcrumb from '@/components/navigation/Breadcrumb';
import { industries } from '@/data/industries';
import { materials } from '@/data/materials';

export default function IndustryDetail() {
  const { industryId } = useParams();
  const industry = industries.find(i => i.id === industryId);

  if (!industry) {
    return (
      <Layout>
        <div className="industrial-container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Industry Not Found</h1>
          <p className="text-muted-foreground">The requested industry does not exist.</p>
        </div>
      </Layout>
    );
  }

  const recommendedMats = materials.filter(
    m => industry.recommendedMaterials?.includes(m.name)
  );

  return (
    <Layout>
      <Breadcrumb 
        items={[
          { label: 'Industries', href: '/industries' },
          { label: industry.name }
        ]} 
      />

      <section className="industrial-section">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{industry.name}</h1>
                <p className="text-lg text-muted-foreground">{industry.description}</p>
              </div>

              {/* Challenges */}
              {industry.challenges && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Technical Challenges</h2>
                  <ul className="space-y-3">
                    {industry.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Applications */}
              {industry.applications && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Typical Applications</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {industry.applications.map((app, index) => (
                      <div key={index} className="p-4 bg-secondary">
                        <span className="font-medium">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Materials */}
              {recommendedMats.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">Recommended Materials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendedMats.map((mat) => (
                      <Link
                        key={mat.id}
                        to={`/materials/${mat.id}`}
                        className="industrial-card group p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">
                              {mat.name}
                            </div>
                            <div className="text-sm text-muted-foreground">{mat.fullName}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        {mat.maxTemp && (
                          <div className="text-xs text-primary mt-2">up to {mat.maxTemp}</div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* CTA Card */}
              <div className="industrial-card bg-secondary">
                <h3 className="font-semibold mb-4">Need a Solution?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our engineering team specializes in {industry.name.toLowerCase()} applications. 
                  Contact us for material recommendations.
                </p>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/quote-cart">Request Quotation</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
