import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, Users, CircleDollarSign, AlertTriangle, UserPlus } from 'lucide-react';
import { getCustomers, getDebtAgeReport } from '@/lib/mock-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const customers = await getCustomers();
  const debtAgeReport = await getDebtAgeReport();

  const totalCustomers = customers.length;
  const totalOutstandingDebt = debtAgeReport.reduce((sum, category) => sum + category.amount, 0);
  const debtsOver90Days = debtAgeReport.find(cat => cat.category === "90+")?.amount || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">لوحة التحكم</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">عدد العملاء المسجلين في النظام</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الديون القائمة</CardTitle>
            <CircleDollarSign className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOutstandingDebt.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">مجموع المبالغ المستحقة من العملاء</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ديون متأخرة (أكثر من 90 يوم)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtsOver90Days.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
            </div>
            <p className="text-xs text-muted-foreground">مبالغ مستحقة لأكثر من 90 يومًا</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">إجراءات سريعة</CardTitle>
          <CardDescription>انتقل بسرعة إلى الأقسام الهامة في النظام.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center">
            <Link href="/dashboard/customers">
              <Users className="h-8 w-8 text-primary" />
              <span>إدارة العملاء</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center">
            <Link href="/dashboard/customers/new">
              <UserPlus className="h-8 w-8 text-green-500" />
              <span>إضافة عميل جديد</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center">
            <Link href="/dashboard/reports">
              <BarChart3 className="h-8 w-8 text-accent" />
              <span>عرض تقرير أعمار الديون</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
