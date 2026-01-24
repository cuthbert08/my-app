'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Megaphone, Shield, Wrench, Settings, LogOut, FileText, ListOrdered, History as HistoryIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, roles: ['superuser', 'editor', 'viewer'], color: 'text-sky-500' },
  { href: '/residents', label: 'Residents', icon: Users, roles: ['superuser', 'editor', 'viewer'], color: 'text-green-500' },
  { href: '/rota', label: 'Rotation', icon: ListOrdered, roles: ['superuser', 'editor', 'viewer'], color: 'text-amber-500' },
  { href: '/issues', label: 'Issue Tracker', icon: Wrench, roles: ['superuser', 'editor', 'viewer'], color: 'text-red-500' },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['superuser', 'editor'], color: 'text-indigo-500' },
  { href: '/history', label: 'History', icon: HistoryIcon, roles: ['superuser', 'editor'], color: 'text-purple-500' },
  { href: '/logs', label: 'Logs', icon: FileText, roles: ['superuser', 'editor', 'viewer'], color: 'text-slate-500' },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['superuser'], color: 'text-pink-500' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <aside className="w-full h-full flex-shrink-0 bg-card border-r">
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <Shield className="w-6 h-6 text-primary" />
            <span>DutyFlow</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                  isActive && 'bg-muted text-primary'
                )}
              >
                <item.icon className={cn('h-4 w-4', !isActive && item.color)} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto p-4 border-t">
            <div className='px-2 py-2 space-y-1'>
                <p className="text-sm font-medium">{user?.email}</p>
                {user?.role && (
                    <Badge 
                        variant={
                            user.role === 'superuser' ? 'destructive' :
                            user.role === 'editor' ? 'default' : 'secondary'
                        }
                        className="capitalize"
                    >
                        {user.role}
                    </Badge>
                )}
            </div>
            <button
                onClick={logout}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-destructive transition-all hover:bg-destructive/10 hover:text-destructive"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </div>
      </div>
    </aside>
  );
}
