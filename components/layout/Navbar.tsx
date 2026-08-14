import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  title: string;
  subtitle?: string;
  userDisplayName?: string;
  userEmail?: string;
}

export function Navbar({ title, subtitle, userDisplayName, userEmail }: NavbarProps) {
  const displayName = userDisplayName || (userEmail ? userEmail.split('@')[0] : 'User');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </Button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white">
            {initial}
          </div>
          <span className="text-xs font-medium text-foreground max-w-[120px] truncate">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
