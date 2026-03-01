import { ReactNode } from 'react';
import CinematicNavbar from '@/components/CinematicNavbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <CinematicNavbar />
      {/* Spacer for fixed navbar (2px accent + 72px bar + 1px border = 75px) */}
      <div className="h-[75px]" />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
