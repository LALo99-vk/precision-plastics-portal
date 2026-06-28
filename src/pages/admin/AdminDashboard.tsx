import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderTree, MessageSquare, FileText, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatCard } from '@/components/admin/StatCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { LoadingState } from '@/components/admin/LoadingState';
import { supabase, QuotationInquiry } from '@/lib/supabase';

interface Stats {
  products: number;
  categories: number;
  inquiries: number;
  priceListItems: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ products: 0, categories: 0, inquiries: 0, priceListItems: 0 });
  const [recentInquiries, setRecentInquiries] = useState<QuotationInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: products },
        { count: categories },
        { count: quotationInquiries },
        { count: contactSubmissions },
        { count: priceListItems },
        { data: recent },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('product_categories').select('*', { count: 'exact', head: true }),
        supabase.from('quotation_inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('price_list_sheets').select('*', { count: 'exact', head: true }),
        supabase
          .from('quotation_inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      setStats({
        products: products ?? 0,
        categories: categories ?? 0,
        inquiries: (quotationInquiries ?? 0) + (contactSubmissions ?? 0),
        priceListItems: priceListItems ?? 0,
      });
      setRecentInquiries(recent ?? []);
    } catch (_) {
      // stats remain 0 on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">Welcome back — here's an overview of your store.</p>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Products"
                value={stats.products}
                icon={Package}
                description="Active in catalog"
              />
              <StatCard
                title="Categories"
                value={stats.categories}
                icon={FolderTree}
                description="Product categories"
              />
              <StatCard
                title="Inquiries"
                value={stats.inquiries}
                icon={MessageSquare}
                description="Quotes & contacts"
              />
              <StatCard
                title="Price Sheets"
                value={stats.priceListItems}
                icon={FileText}
                description="PDF price sheets"
              />
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                { to: '/admin/products',   label: 'Manage Products',   icon: Package },
                { to: '/admin/categories', label: 'Manage Categories', icon: FolderTree },
                { to: '/admin/inquiries',  label: 'View Inquiries',    icon: MessageSquare },
                { to: '/admin/price-list', label: 'Price List',        icon: FileText },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors group"
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="flex-1">{item.label}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            {/* Recent Inquiries */}
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Recent Inquiries</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/inquiries">
                    View all <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>

              {recentInquiries.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No inquiries yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentInquiries.map((inq) => (
                    <div key={inq.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-foreground truncate">
                            {inq.customer_name}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {inq.customer_company}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">
                          {inq.inquiry_number}
                        </p>
                      </div>
                      <StatusBadge status={inq.status} />
                      <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                        {formatDate(inq.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
