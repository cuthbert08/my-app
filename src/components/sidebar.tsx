'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { navItems } from '@/lib/nav-items';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <aside className="w-full h-full flex-shrink-0 bg-card border-r">
      <div className="flex flex-col h-full">
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
            <div className='px-2 pt-2 pb-4 border-b'>
                <Button
                    variant="ghost"
                    onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                    className="w-full justify-start text-muted-foreground hover:text-primary"
                >
                    {resolvedTheme === 'light' ? (
                        <Moon className="mr-3 h-4 w-4" />
                    ) : (
                        <Sun className="mr-3 h-4 w-4" />
                    )}
                    <span>{resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </Button>
            </div>
            <div className='px-2 py-2 space-y-1 mt-2'>
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
