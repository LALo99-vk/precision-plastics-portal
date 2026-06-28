import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MessageSquare,
  FileText,
  LogOut,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',  exact: true },
  { to: '/admin/products',  icon: Package,         label: 'Products',   exact: false },
  { to: '/admin/categories',icon: FolderTree,      label: 'Categories', exact: false },
  { to: '/admin/inquiries', icon: MessageSquare,   label: 'Inquiries',  exact: false },
  { to: '/admin/price-list',icon: FileText,        label: 'Price List', exact: false },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/admin/login');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    } else {
      setUser(session.user);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-sm font-bold">N</span>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground leading-tight">Nyloking & Co</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md text-[15px] transition-colors relative
                ${active
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
              )}
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-[15px] text-muted-foreground hover:text-foreground h-10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-[15px] text-muted-foreground hover:text-foreground h-10"
          asChild
        >
          <Link to="/">
            <Home className="w-5 h-5 mr-3" />
            Back to Site
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex flex-col z-50 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-background border-b border-border sticky top-0 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold text-foreground">Nyloking & Co Admin</span>
        </div>

        <main className="p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
