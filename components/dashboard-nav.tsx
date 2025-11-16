'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Info, Calendar, Flame } from 'lucide-react';

const navItems = [
  {
    title: 'Daglig Info',
    href: '/dashboard/daily-info',
    icon: Info,
  },
  {
    title: 'Vaktliste',
    href: '/dashboard/duty-roster',
    icon: Calendar,
  },
  {
    title: 'Bålmeldinger',
    href: '/dashboard/bonfire',
    icon: Flame,
    comingSoon: true,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 relative',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300',
                  item.comingSoon && 'cursor-not-allowed opacity-60'
                )}
                onClick={(e) => {
                  if (item.comingSoon) {
                    e.preventDefault();
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.comingSoon && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    Kommer snart
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
