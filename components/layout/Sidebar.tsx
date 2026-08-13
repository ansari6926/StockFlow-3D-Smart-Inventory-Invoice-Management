'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  PlusCircle,
  LogOut,
  Boxes,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & analytics',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Package,
    description: 'Manage products',
  },
  {
    href: '/invoices',
    label: 'Invoices',
    icon: FileText,
    description: 'Invoice history',
  },
  {
    href: '/invoices/new',
    label: 'New Invoice',
    icon: PlusCircle,
    description: 'Create invoice',
    highlight: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">StockFlow 3D</p>
          <p className="text-[10px] text-muted-foreground">Smart Inventory</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/invoices/new'
            ? pathname === item.href
            : pathname.startsWith(item.href) && (item.href !== '/invoices' || pathname === '/invoices');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : item.highlight
                  ? 'border border-dashed border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="truncate">{item.label}</p>
                <p className={cn(
                  'text-[10px] truncate',
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {item.description}
                </p>
              </div>
              <ChevronRight className={cn(
                'h-3 w-3 flex-shrink-0 transition-transform',
                isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'
              )} />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
