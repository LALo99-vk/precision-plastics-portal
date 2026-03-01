import { Link, useLocation } from 'react-router-dom';
import NylokingLogo from '@/components/layout/NylokingLogo';
import { Menu, X, Phone, ChevronRight, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuoteCart } from '@/contexts/QuoteCartContext';

const NAV_ITEMS = [
  { label: 'HOME', to: '/' },
  { label: 'PRODUCTS', to: '/products' },
  { label: 'ABOUT', to: '/about' },
  { label: 'CONTACT', to: '/contact' },
];

interface CinematicNavbarProps {
  /** When true the bar is always shown (normal pages). When false it hides until the user scrolls past the hero. */
  visible?: boolean;
  /** Set to true on the homepage so the bar starts hidden and slides in on scroll. */
  scrollTriggered?: boolean;
}

export default function CinematicNavbar({ visible = true, scrollTriggered = false }: CinematicNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { itemCount } = useQuoteCart();

  const show = scrollTriggered ? visible : true;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        } ${scrolled ? 'shadow-md' : ''}`}
        style={{
          backgroundColor: 'hsl(var(--background) / 0.97)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="h-[2px] w-full bg-primary" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <NylokingLogo className="h-5 md:h-6 w-auto transition-opacity group-hover:opacity-80" />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-0">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`relative text-[11px] font-semibold tracking-[0.2em] px-5 py-2 transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-foreground/70 hover:text-foreground'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Phone */}
              <a
                href="tel:9448354795"
                className="hidden md:flex items-center gap-2 text-[11px] font-semibold tracking-wider text-foreground/70 hover:text-foreground transition-colors"
              >
                <Phone size={14} strokeWidth={2} />
                <span className="hidden xl:inline">9448354795</span>
              </a>

              <div className="hidden md:block w-px h-6 bg-border mx-1" />

              {/* Cart */}
              <Link
                to="/quote-cart"
                className="hidden md:inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider text-foreground/70 hover:text-foreground transition-colors relative"
              >
                <ShoppingCart size={16} strokeWidth={2} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-primary text-primary-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              <div className="hidden md:block w-px h-6 bg-border mx-1" />

              {/* CTA */}
              <Link
                to="/contact"
                className="hidden md:inline-flex items-center gap-2 bg-primary text-primary-foreground text-[11px] font-bold tracking-[0.15em] uppercase px-5 py-2.5 rounded-sm hover:opacity-90 transition-opacity"
              >
                GET A QUOTE
                <ChevronRight size={14} strokeWidth={2.5} />
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden relative w-10 h-10 flex items-center justify-center text-foreground rounded-sm hover:bg-secondary/50 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                <span className={`absolute transition-all duration-300 ${mobileOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'}`}>
                  <X size={22} strokeWidth={1.5} />
                </span>
                <span className={`absolute transition-all duration-300 ${mobileOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                  <Menu size={22} strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-border" />
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen && show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-[300px] max-w-[85vw] transition-transform duration-400 ease-out lg:hidden ${
          mobileOpen && show ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: 'hsl(var(--background))' }}
      >
        <div className="h-[74px]" />

        <div className="px-6 py-8 flex flex-col h-[calc(100%-74px)]">
          <div className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-3.5 px-3 rounded-sm text-sm font-semibold tracking-[0.2em] transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/80 hover:text-foreground hover:bg-secondary/30'
                  }`}
                >
                  {item.label}
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <Link
              to="/quote-cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between text-sm font-semibold text-foreground/80 px-3 py-2"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={16} /> Cart
              </span>
              {itemCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
              )}
            </Link>
            <a
              href="tel:9448354795"
              className="flex items-center gap-3 text-sm font-medium text-foreground/70 px-3"
            >
              <Phone size={16} />
              9448354795
            </a>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground text-xs font-bold tracking-[0.15em] uppercase py-3.5 rounded-sm hover:opacity-90 transition-opacity"
            >
              GET A QUOTE
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
