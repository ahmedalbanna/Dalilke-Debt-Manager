'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'العملاء', icon: Users },
  { href: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
];

export function AuthenticatedNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 border-b px-4 py-2 bg-card">
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'secondary' : 'ghost'}
          asChild
          className="w-full sm:w-auto justify-start"
        >
          <Link href={item.href} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
