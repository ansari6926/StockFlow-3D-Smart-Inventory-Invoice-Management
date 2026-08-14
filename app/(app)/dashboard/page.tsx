import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Package,
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/actions/invoices';
import { getProfile } from '@/lib/actions/profile';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, isLowStock } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
};

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  gradient: string;
  href?: string;
}) {
  const content = (
    <Card className="card-hover cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-3 bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function DashboardPage() {
  const [statsRes, profileRes] = await Promise.all([
    getDashboardStats(),
    getProfile(),
  ]);

  const stats = statsRes.data;
  const error = statsRes.error;
  const profile = profileRes.data;

  const displayName = profile?.display_name || 'User';

  if (error || !stats) {
    return (
      <div>
        <Navbar
          title={`Welcome back, ${displayName}`}
          subtitle="Smart Inventory & Invoice Management Overview"
          userDisplayName={profile?.display_name}
          userEmail={profile?.email}
        />
        <div className="p-6">
          <p className="text-destructive">{error || 'Failed to load dashboard statistics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar
        title={`Welcome back, ${displayName}`}
        subtitle="Smart Inventory & Invoice Management Overview"
        userDisplayName={profile?.display_name}
        userEmail={profile?.email}
      />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="SKUs in catalog"
            icon={Package}
            gradient="from-blue-500 to-cyan-500"
            href="/inventory"
          />
          <StatCard
            title="Total Units"
            value={stats.totalUnits.toLocaleString()}
            subtitle="Units in stock"
            icon={Boxes}
            gradient="from-indigo-500 to-purple-500"
            href="/inventory"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockCount}
            subtitle={stats.lowStockCount === 0 ? 'All items healthy' : 'Needs attention'}
            icon={AlertTriangle}
            gradient={stats.lowStockCount > 0 ? 'from-orange-500 to-yellow-500' : 'from-emerald-500 to-teal-500'}
            href="/inventory"
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`From ${stats.totalInvoices} invoice${stats.totalInvoices !== 1 ? 's' : ''}`}
            icon={DollarSign}
            gradient="from-emerald-500 to-green-500"
            href="/invoices"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest {stats.recentInvoices.length} transactions</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/invoices">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {stats.recentInvoices.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No invoices yet</p>
                  <Button variant="gradient" size="sm" className="mt-4" asChild>
                    <Link href="/invoices/new">Create First Invoice</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.recentInvoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(invoice.total)}</p>
                        <Badge variant={invoice.status === 'PAID' ? 'success' : 'cancelled'} className="text-[10px]">
                          {invoice.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.lowStockProducts.length === 0 ? 'All products healthy' : `${stats.lowStockProducts.length} product${stats.lowStockProducts.length !== 1 ? 's' : ''} need attention`}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/inventory">
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {stats.lowStockProducts.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <TrendingUp className="mx-auto h-10 w-10 text-emerald-500/50" />
                  <p className="mt-2 text-sm text-muted-foreground">All stock levels are healthy!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stats.lowStockProducts.map((product) => (
                    <Link
                      key={product.id}
                      href="/inventory"
                      className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-500">{product.stock_quantity} units</p>
                        <p className="text-xs text-muted-foreground">Threshold: {product.reorder_threshold}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Action */}
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Create a New Invoice</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select products, enter quantities, apply discounts, and confirm — stock is deducted atomically.
                </p>
              </div>
              <Button variant="gradient" asChild>
                <Link href="/invoices/new" id="dashboard-new-invoice">
                  <PlusCircle className="h-4 w-4" />
                  New Invoice
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
