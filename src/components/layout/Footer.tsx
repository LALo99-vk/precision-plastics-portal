import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import NylokingLogo from './NylokingLogo';

const productLinks = [
  { name: 'Laminated Sheets', href: '/products/laminated-sheets' },
  { name: 'Heat Resistant Rods', href: '/products/heat-resistant-rods' },
  { name: 'Acrylic Sheets', href: '/products/acrylic-sheets' },
  { name: 'Stock Shapes', href: '/products/stock-shapes' },
  { name: 'Sintered Plastics', href: '/products/sintered-plastics' },
];

const materialLinks = [
  { name: 'PEEK', href: '/materials/peek' },
  { name: 'PTFE', href: '/materials/ptfe' },
  { name: 'POM', href: '/materials/pom' },
  { name: 'PA / Nylon', href: '/materials/pa' },
  { name: 'All Materials', href: '/materials' },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="industrial-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 [&_path]:fill-[#2E3AA8] [&_path[stroke]]:stroke-white">
              <NylokingLogo className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">
              Leading supplier of high-performance plastics and composites for engineering applications worldwide.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>No. 161/1, S.P. Road, Bengaluru-560002, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>
                  <a href="tel:9448354795" className="hover:text-white">9448354795</a> | 
                  <a href="tel:222234795" className="hover:text-white"> 222234795</a> / 
                  <a href="tel:22224200" className="hover:text-white">22224200</a>
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:nylokingandco@gmail.com" className="hover:text-white">nylokingandco@gmail.com</a>
              </div>
              <div className="pt-2 text-xs text-gray-500">
                <p>Director Proprietor: NYLOKING & CO (Partner)</p>
                <p>GSTIN: 29AABFN2443F1ZH</p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Materials */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-white">Materials</h3>
            <ul className="space-y-2">
              {materialLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2024 Nyloking & Co. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/imprint" className="hover:text-white transition-colors">Imprint</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
