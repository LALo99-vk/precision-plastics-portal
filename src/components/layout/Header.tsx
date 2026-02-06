import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useQuoteCart } from '@/contexts/QuoteCartContext';
import NylokingLogo from './NylokingLogo';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useQuoteCart();
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-[#e8e4d8]/95 backdrop-blur-md transition-all duration-300">
      <div className="max-w-[1600px] mx-auto relative flex items-center justify-center">

        {/* Left: Logo — shown on every page except home */}
        {pathname !== '/' && (
          <Link to="/" className="absolute left-0 flex items-center">
            <NylokingLogo className="h-[28px] w-auto sm:h-[32px]" />
          </Link>
        )}

        {/* Center: Pill Navigation */}
        <nav className="hidden lg:flex items-center bg-white border border-black/10 rounded-full px-2 py-1 shadow-sm">
          <Link to="/" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">HOME</Link>
          <span className="text-black/20">•</span>
          <Link to="/products" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">PRODUCTS</Link>
          <span className="text-black/20">•</span>
          <Link to="/price-list" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">PRICE LIST</Link>
          <span className="text-black/20">•</span>
          <Link to="/about" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">ABOUT</Link>
          <span className="text-black/20">•</span>
          <Link to="/contact" className="px-5 py-2 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">CONTACT</Link>
        </nav>

        {/* Right: Cart & Menu (absolute so nav stays centered) */}
        <div className="absolute right-0 flex items-center gap-4">
          {/* Cart Pill */}
          <Link to="/quote-cart" className="hidden md:flex items-center gap-3 bg-white border border-black/10 rounded-full px-4 py-2 hover:shadow-md transition-all">
            <span className="text-sm font-bold tracking-wide">CART</span>
            <div className="h-4 w-px bg-black/10" />
            <span className="text-sm font-medium">{itemCount}</span>
          </Link>

          {/* Menu Button – professional pill, clean hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-3 shadow-sm hover:bg-black hover:text-white hover:border-black transition-all duration-200 w-11 h-11"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="flex flex-col gap-1.5 w-5 flex-shrink-0" aria-hidden>
              <span className="block h-0.5 w-full bg-current rounded-full" />
              <span className="block h-0.5 w-full bg-current rounded-full" />
              <span className="block h-0.5 w-full bg-current rounded-full" />
            </div>
          </button>
        </div>
      </div>

      {/* Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black/5">
                <span className="text-xl font-bold">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links – active item highlighted */}
              <nav className="flex-1 p-6">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/', true) ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/products') ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    Products
                  </Link>
                  <Link
                    to="/industries"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/industries') ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    Industries
                  </Link>
                  <Link
                    to="/price-list"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/price-list') ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    Price list
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/about') ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/contact') ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  >
                    Contact
                  </Link>

                  <div className="my-4 border-t border-black/5" />

                  <Link
                    to="/quote-cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg bg-black text-white hover:bg-black/90 transition-colors font-bold flex items-center justify-between"
                  >
                    <span>Cart</span>
                    <span className="bg-white text-black px-2 py-0.5 rounded-full text-sm">{itemCount}</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
