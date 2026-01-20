import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const productLinks = [
  { name: 'Compounds', href: '/products/compounds' },
  { name: 'Stock Shapes', href: '/products/stock-shapes' },
  { name: 'Sintered Plastics', href: '/products/sintered-plastics' },
  { name: 'Composites', href: '/products/composites' },
  { name: 'Filaments', href: '/products/filaments' },
];

const materialLinks = [
  { name: 'PEEK', href: '/materials/peek' },
  { name: 'PTFE', href: '/materials/ptfe' },
  { name: 'POM', href: '/materials/pom' },
  { name: 'PA / Nylon', href: '/materials/pa' },
  { name: 'All Materials', href: '/materials' },
];

const industryLinks = [
  { name: 'Aerospace', href: '/industries/aerospace' },
  { name: 'Medical', href: '/industries/medical' },
  { name: 'Semiconductor', href: '/industries/semiconductor' },
  { name: 'Oil & Gas', href: '/industries/oil-gas' },
  { name: 'All Industries', href: '/industries' },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="industrial-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-xl font-bold text-primary-foreground">POLYTECH</span>
              <span className="text-xl font-light">plastics</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Leading supplier of high-performance plastics and composites for engineering applications worldwide.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>123 Industrial Park, Tech City, TC 12345</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+1 (234) 567-890</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@polytechplastics.com</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Materials */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Materials</h3>
            <ul className="space-y-2">
              {materialLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">Industries</h3>
            <ul className="space-y-2">
              {industryLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-muted-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 Polytech Plastics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-background transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-background transition-colors">Terms of Service</Link>
              <Link to="/imprint" className="hover:text-background transition-colors">Imprint</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
