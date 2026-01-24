import { Home, Users, Megaphone, Wrench, Settings, LogOut, FileText, ListOrdered, History as HistoryIcon, Moon, Sun } from 'lucide-react';

export const navItems = [
  { href: '/', label: 'Dashboard', icon: Home, roles: ['superuser', 'editor', 'viewer'], color: 'text-sky-500' },
  { href: '/residents', label: 'Residents', icon: Users, roles: ['superuser', 'editor', 'viewer'], color: 'text-green-500' },
  { href: '/rota', label: 'Rotation', icon: ListOrdered, roles: ['superuser', 'editor', 'viewer'], color: 'text-amber-500' },
  { href: '/issues', label: 'Issues', icon: Wrench, roles: ['superuser', 'editor', 'viewer'], color: 'text-red-500' },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['superuser', 'editor'], color: 'text-indigo-500' },
  { href: '/history', label: 'History', icon: HistoryIcon, roles: ['superuser', 'editor'], color: 'text-purple-500' },
  { href: '/logs', label: 'Logs', icon: FileText, roles: ['superuser', 'editor', 'viewer'], color: 'text-slate-500' },
  { href: '/settings', label: 'Settings', icon: Settings, roles: ['superuser'], color: 'text-pink-500' },
];
