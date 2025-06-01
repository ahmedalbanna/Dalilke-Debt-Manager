import { getCustomers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">قائمة العملاء</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع العملاء المسجلين.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new">
            <PlusCircle className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
            إضافة عميل جديد
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>العملاء</CardTitle>
          <CardDescription>قائمة بجميع العملاء وبيانات التواصل الخاصة بهم.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>إجمالي الدين</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell dir="ltr" className="text-left rtl:text-right">{customer.phone || '-'}</TableCell>
                      <TableCell>
                        {(customer.totalDebt ?? 0) < 0 ? 
                         <span className="text-green-600">{- (customer.totalDebt ?? 0).toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })} (رصيد دائن)</span> :
                         (customer.totalDebt ?? 0).toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })
                        }
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/customers/${customer.id}`}>
                            <Eye className="ms-1 h-4 w-4 rtl:ms-0 rtl:me-1" />
                            عرض التفاصيل
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">لا يوجد عملاء لعرضهم حالياً.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
