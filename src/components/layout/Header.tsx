import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, ChevronDown } from 'lucide-react';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import { Button } from '@/components/ui/button';

const productCategories = [
  { name: 'Laminated Sheets', href: '/products/laminated-sheets', description: 'Engineering plastic and composite laminate sheets' },
  { name: 'Heat Resistant Rods', href: '/products/heat-resistant-rods', description: 'Rods for thermal and mechanical applications' },
  { name: 'Acrylic Sheets', href: '/products/acrylic-sheets', description: 'Clear and coloured acrylic sheets' },
  { name: 'PVC Products', href: '/products/pvc-products', description: 'Boards and profiles for cutting and fabrication' },
  { name: 'PVC Curtain Rolls', href: '/products/pvc-curtain-rolls', description: 'Industrial PVC strip curtain rolls' },
  { name: 'Polyurethane Cords', href: '/products/polyurethane-cords', description: 'Durable PU cords for conveying and drives' },
  { name: 'Acrylic Tubes', href: '/products/acrylic-tubes', description: 'Transparent acrylic tubes' },
  { name: 'PTFE Bushes', href: '/products/ptfe-bushes', description: 'Low-friction PTFE bushes' },
  { name: 'PEEK Tubes', href: '/products/peek-tubes', description: 'High-performance PEEK tubes' },
  { name: 'Stock Shapes', href: '/products/stock-shapes', description: 'Rods, sheets, tubes & profiles' },
  { name: 'Sintered Plastics', href: '/products/sintered-plastics', description: 'High-performance sintered materials' },
];

const materialsTiers = [
  { 
    tier: 'High-Performance', 
    materials: ['PEEK', 'Polyimide', 'PAI', 'PEKK', 'LCP', 'PPS', 'PPSU', 'PSU', 'PES', 'PEI', 'PTFE', 'PVDF', 'PPA'] 
  },
  { 
    tier: 'Engineering', 
    materials: ['POM', 'PA', 'Cast Nylon', 'Extruded Nylon', 'PET', 'PCT-G', 'PBT', 'PC', 'PK'] 
  },
  { 
    tier: 'Standard', 
    materials: ['PPE', 'PP', 'PE', 'PMP', 'ABS'] 
  },
];

const industries = [
  'Aerospace', 'Biopharma', 'Building', 'Electronics', 'Food', 
  'Glass', 'Hydrogen', 'Mechanical', 'Medical', 'Mobility', 
  'Oil & Gas', 'Renewable Energy', 'Semiconductor'
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { itemCount } = useQuoteCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background">
      {/* Utility Bar */}
      <div className="utility-bar">
        <div className="industrial-container flex items-center justify-end gap-6 py-2">
          <a href="tel:9448354795" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-3.5 h-3.5" />
            <span>9448354795</span>
          </a>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          <Link to="/quote-cart" className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span>Quote Cart ({itemCount})</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="industrial-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="nyloking-logo text-2xl md:text-3xl font-black uppercase tracking-tight">
                NYLOKING & CO.
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Link to="/" className="industrial-btn-ghost">Home</Link>
              <Link to="/about" className="industrial-btn-ghost">About</Link>
              
              {/* Products Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('products')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="industrial-btn-ghost flex items-center gap-1">
                  Products <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'products' && (
                  <div className="absolute top-full left-0 w-80 bg-background border border-border shadow-lg py-2">
                    {productCategories.map((cat) => (
                      <Link key={cat.name} to={cat.href} className="mega-menu-item block">
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-xs text-muted-foreground">{cat.description}</div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Materials Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('materials')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="industrial-btn-ghost flex items-center gap-1">
                  Materials <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'materials' && (
                  <div className="absolute top-full left-0 w-[600px] bg-background border border-border shadow-lg p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {materialsTiers.map((tier) => (
                        <div key={tier.tier}>
                          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                            {tier.tier}
                          </div>
                          <div className="space-y-1">
                            {tier.materials.map((mat) => (
                              <Link 
                                key={mat} 
                                to={`/materials/${mat.toLowerCase().replace(/\s+/g, '-')}`}
                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5"
                              >
                                {mat}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to="/materials" className="text-sm text-primary hover:underline">
                        View all materials →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Industries Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setActiveDropdown('industries')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="industrial-btn-ghost flex items-center gap-1">
                  Industries <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'industries' && (
                  <div className="absolute top-full left-0 w-80 bg-background border border-border shadow-lg py-2">
                    {industries.map((ind) => (
                      <Link 
                        key={ind} 
                        to={`/industries/${ind.toLowerCase().replace(/\s+/g, '-')}`}
                        className="mega-menu-item"
                      >
                        {ind}
                      </Link>
                    ))}
                    <div className="px-4 pt-2 mt-2 border-t border-border">
                      <Link to="/industries" className="text-sm text-primary hover:underline">
                        View all industries →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/contact" className="industrial-btn-ghost">Contact</Link>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Button asChild className="industrial-btn-primary">
                <Link to="/quote-cart">Request Quotation</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border">
            <div className="industrial-container py-4 space-y-4">
              <Link to="/" className="block py-2 font-medium">Home</Link>
              <Link to="/about" className="block py-2 font-medium">About</Link>
              <Link to="/products" className="block py-2 font-medium">Products</Link>
              <Link to="/materials" className="block py-2 font-medium">Materials</Link>
              <Link to="/industries" className="block py-2 font-medium">Industries</Link>
              <Link to="/contact" className="block py-2 font-medium">Contact</Link>
              <Button asChild className="w-full industrial-btn-primary mt-4">
                <Link to="/quote-cart">Request Quotation</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
