import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Package, Layers, LogOut, Home, MessageSquare, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth changes
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

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary mb-8">Nyloking & Co</h1>
          <p className="text-sm text-muted-foreground mb-6">Admin Panel</p>
          
          <nav className="space-y-2">
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/admin') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </Link>
            <Link
              to="/admin/materials"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/admin/materials') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Materials</span>
            </Link>
            <Link
              to="/admin/categories"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/admin/categories') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <FolderTree className="w-5 h-5" />
              <span>Categories</span>
            </Link>
            <Link
              to="/admin/inquiries"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive('/admin/inquiries') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Inquiries</span>
            </Link>
          </nav>
          
          {user && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Logged in as:</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Site
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
