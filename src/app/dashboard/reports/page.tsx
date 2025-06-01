import { getDebtAgeReport } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Percent } from 'lucide-react';
import type { DebtAgeData } from '@/lib/types';

export default async function ReportsPage() {
  const debtAgeReportData = await getDebtAgeReport();
  const totalDebtAllCategories = debtAgeReportData.reduce((sum, cat) => sum + cat.amount, 0);

  const categoriesMap: Record<string, string> = {
    "0-30": "0 - 30 يومًا",
    "31-60": "31 - 60 يومًا",
    "61-90": "61 - 90 يومًا",
    "90+": "أكثر من 90 يومًا",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">تقرير أعمار الديون</h1>
          <p className="text-muted-foreground">تحليل للديون المستحقة بناءً على فترة التأخير.</p>
        </div>
        <BarChart3 className="h-8 w-8 text-primary" />
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>ملخص أعمار الديون</CardTitle>
          <CardDescription>
            إجمالي الديون القائمة: {totalDebtAllCategories.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {debtAgeReportData.length > 0 ? (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>فئة عمر الدين</TableHead>
                  <TableHead className="text-center">عدد الفواتير</TableHead>
                  <TableHead className="text-right rtl:text-left">المبلغ المستحق</TableHead>
                  <TableHead className="text-center">النسبة من الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debtAgeReportData.map((categoryData: DebtAgeData) => (
                  <TableRow key={categoryData.category} className={categoryData.category === "90+" ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                    <TableCell className="font-medium">{categoriesMap[categoryData.category] || categoryData.category}</TableCell>
                    <TableCell className="text-center">{categoryData.debtCount}</TableCell>
                    <TableCell className="text-right rtl:text-left">
                      {categoryData.amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                    </TableCell>
                    <TableCell className="text-center">
                      {totalDebtAllCategories > 0 ? 
                        ((categoryData.amount / totalDebtAllCategories) * 100).toFixed(2) + '%' : 
                        '0.00%'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-secondary">
                  <TableCell>الإجمالي</TableCell>
                  <TableCell className="text-center">
                    {debtAgeReportData.reduce((sum, cat) => sum + cat.debtCount, 0)}
                  </TableCell>
                  <TableCell className="text-right rtl:text-left">
                    {totalDebtAllCategories.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                  </TableCell>
                  <TableCell className="text-center">100.00%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا توجد بيانات ديون لعرض التقرير.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
