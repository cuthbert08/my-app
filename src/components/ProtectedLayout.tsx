'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Skeleton } from './ui/skeleton';
import { BottomNavbar } from './bottom-navbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:border-r lg:sticky lg:top-0 lg:h-screen">
          <Sidebar />
      </div>

      <div className="flex-1 flex flex-col w-full">
        {/* Add padding-bottom for the bottom nav on mobile */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}
