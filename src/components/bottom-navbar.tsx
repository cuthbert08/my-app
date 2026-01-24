'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { navItems } from '@/lib/nav-items';

export function BottomNavbar() {
  const pathname = usePathname();
  const { hasRole } = useAuth();

  const bottomNavHrefs = ['/', '/residents', '/rota', '/issues', '/announcements'];

  const filteredNavItems = navItems
    .filter(item => bottomNavHrefs.includes(item.href) && hasRole(item.roles))
    .sort((a, b) => bottomNavHrefs.indexOf(a.href) - bottomNavHrefs.indexOf(b.href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary',
                isActive && 'text-primary bg-muted'
              )}
            >
              <item.icon className={cn('h-5 w-5 mb-1', isActive ? item.color : 'text-muted-foreground')} />
              <span className="text-xs text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
