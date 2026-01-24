'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getDashboardInfo, triggerReminder, skipTurn, advanceTurn } from '@/lib/api';
import { type DashboardData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format, nextWednesday, addDays } from 'date-fns';
import { AlertTriangle, ChevronsRight, SkipForward, User, Users, Activity, Send, MessageSquarePlus, MoreVertical, Settings, FileText, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();
  const { hasRole, user, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await getDashboardInfo();
      setData(dashboardData);
    } catch (error) {
      const errorMessage = 'Could not load dashboard information from the server.';
      setError(errorMessage);
      toast({
        title: 'Error fetching dashboard data',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const canPerformAction = hasRole(['superuser', 'editor']);

  const handleSendReminder = async (message?: string) => {
    try {
      await triggerReminder(message);
      toast({
        title: 'Reminder Sent!',
        description: 'The reminder has been successfully sent and the turn has been advanced.',
      });
      if (message) {
        setCustomMessage('');
      }
      loadDashboardData(); // Refresh data to show new person on duty
    } catch (error) {
      toast({
        title: 'Error Sending Reminder',
        description: 'Could not send the reminder.',
        variant: 'destructive',
      });
      console.error('Failed to send reminder:', error);
    }
  };

  const handleSkipTurn = async () => {
    try {
        await skipTurn();
        toast({
            title: 'Turn Skipped',
            description: 'The current turn has been skipped successfully.',
        });
        await loadDashboardData();
    } catch (error) {
        toast({
            title: 'Error Skipping Turn',
            description: 'Could not skip the current turn.',
            variant: 'destructive',
        });
        console.error('Failed to skip turn:', error);
    }
  };
  
  const handleAdvanceTurn = async () => {
    try {
        await advanceTurn();
        toast({
            title: 'Turn Advanced',
            description: 'The duty has been manually advanced to the next person.',
        });
        await loadDashboardData();
    } catch (error) {
        toast({
            title: 'Error Advancing Turn',
            description: 'Could not advance the current turn.',
            variant: 'destructive',
        });
        console.error('Failed to advance turn:', error);
    }
  };

  const currentDutyDate = nextWednesday(new Date());
  const nextDutyDate = addDays(currentDutyDate, 7);

  const renderCardContent = (value: string | undefined, date?: Date) => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center text-destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          <p className="text-sm font-medium">Error loading data</p>
        </div>
      );
    }
    return (
      <div>
        <p className="text-2xl font-bold">{value || 'N/A'}</p>
        {date && <p className="text-sm text-muted-foreground">{format(date, 'dd-MM-yyyy')}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 flex flex-col">
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex-1 mt-4 space-y-1 px-4">
                    {hasRole(['superuser']) && (
                        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                        <Settings className="h-4 w-4 text-pink-500" />
                        Settings
                        </Link>
                    )}
                    {hasRole(['superuser', 'editor', 'viewer']) && (
                        <Link href="/logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                        <FileText className="h-4 w-4 text-slate-500" />
                        Logs
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                        className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                    >
                        {resolvedTheme === 'light' ? (
                            <Moon className="h-4 w-4" />
                        ) : (
                            <Sun className="h-4 w-4" />
                        )}
                        <span>{resolvedTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </Button>
                </nav>
                <div className="mt-auto border-t p-4">
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
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Current Bin Duty</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {renderCardContent(data?.current_duty?.name, currentDutyDate)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Next in Rotation</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {renderCardContent(data?.next_in_rotation?.name, nextDutyDate)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-1/2" />
            ) : error ? (
              <div className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <p className="text-sm font-medium">Error</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Last reminder run:</p>
                <p className="text-lg font-semibold">{data?.system_status?.last_reminder_run || 'N/A'}</p>
              </>
            )}
          </CardContent>
           {canPerformAction && (
             <CardFooter className='space-x-2'>
                  <Button variant="outline" onClick={handleAdvanceTurn} disabled={loading || !!error}>
                      <ChevronsRight className="text-cyan-500"/> Advance Turn
                  </Button>
                  <Button variant="outline" onClick={handleSkipTurn} disabled={loading || !!error}>
                      <SkipForward className="text-pink-500"/> Skip Turn
                  </Button>
              </CardFooter>
            )}
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send Weekly Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Send the standard weekly reminder to the person currently on duty. This will also advance the turn to the next person.
            </p>
            {canPerformAction && (
              <Button onClick={() => handleSendReminder()} disabled={loading || !!error}><Send />Send Reminder & Advance</Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Send Custom Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={canPerformAction ? "Enter your custom reminder message here..." : "You do not have permission to send custom reminders."}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={loading || !!error || !canPerformAction}
            />
            {canPerformAction && (
              <Button onClick={() => handleSendReminder(customMessage)} disabled={!customMessage || loading || !!error}><MessageSquarePlus />Send Custom Reminder & Advance</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
