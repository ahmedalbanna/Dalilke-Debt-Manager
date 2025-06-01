import { SiteHeader } from '@/components/layout/site-header';
import { AuthenticatedNav } from '@/components/layout/authenticated-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader isAuthenticated={true} />
      <AuthenticatedNav />
      <main className="flex-grow container py-8">{children}</main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} دليلك لإدارة الديون. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
