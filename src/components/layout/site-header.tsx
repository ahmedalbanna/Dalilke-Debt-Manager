import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle } from 'lucide-react';

interface SiteHeaderProps {
  isAuthenticated?: boolean;
}

export function SiteHeader({ isAuthenticated = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href={isAuthenticated ? "/dashboard" : "/login"} className="mr-auto flex items-center space-x-2 rtl:ml-auto rtl:mr-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-primary">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          <span className="font-bold font-headline">دليلك لإدارة الديون</span>
        </Link>
        {isAuthenticated && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/profile"> {/* Placeholder for profile */}
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">الملف الشخصي</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login"> {/* Mock logout */}
                <LogOut className="h-5 w-5" />
                <span className="sr-only">تسجيل الخروج</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
