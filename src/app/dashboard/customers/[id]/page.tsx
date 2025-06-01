
import { getCustomerById, getDebtsForCustomer, getPaymentsForCustomer } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddDebtForm } from '@/components/forms/add-debt-form';
import { AddPaymentForm } from '@/components/forms/add-payment-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, CircleDollarSign, FileText, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { arSA } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function CustomerDetailPage({ params: { id } }: { params: { id: string } }) {
  const customer = await getCustomerById(id);
  const debts = await getDebtsForCustomer(id);
  const payments = await getPaymentsForCustomer(id);

  if (!customer) {
    return <p className="text-center text-destructive">لم يتم العثور على العميل.</p>;
  }
  
  const transactions = [
    ...debts.map(d => ({ ...d, type: 'debt' as const, date: parseISO(d.createdAt) })),
    ...payments.map(p => ({ ...p, type: 'payment' as const, date: parseISO(p.paymentDate) }))
  ].sort((a,b) => b.date.getTime() - a.date.getTime());

  let balance = 0;
  const statementWithBalance = transactions.map(tx => {
    if (tx.type === 'debt') {
      balance += tx.amount;
    } else {
      balance -= tx.amount;
    }
    return { ...tx, balance };
  }).reverse(); // Show oldest first for running balance logic, then reverse for display

  const finalBalance = customer.totalDebt || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.email} &bull; {customer.phone && <span dir="ltr" className="inline-block">{customer.phone}</span>}</p>
        </div>
        <Card className="p-4 bg-secondary shadow-md min-w-[200px] text-center">
          <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
          <CardDescription className={`text-2xl font-bold ${finalBalance >= 0 ? 'text-destructive' : 'text-green-600'}`}>
            {Math.abs(finalBalance).toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
            {finalBalance < 0 && " (دائن)"}
          </CardDescription>
        </Card>
      </div>

      <Tabs defaultValue="statement" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="statement"><FileText className="inline ms-1 rtl:ms-0 rtl:me-1" size={16}/>كشف الحساب</TabsTrigger>
          <TabsTrigger value="add-debt"><CreditCard className="inline ms-1 rtl:ms-0 rtl:me-1" size={16}/>إضافة دين</TabsTrigger>
          <TabsTrigger value="add-payment"><CircleDollarSign className="inline ms-1 rtl:ms-0 rtl:me-1" size={16}/>إضافة دفعة</TabsTrigger>
        </TabsList>

        <TabsContent value="statement">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">كشف حساب العميل</CardTitle>
              <CardDescription>قائمة بجميع المعاملات المالية للعميل.</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead>الوصف/طريقة الدفع</TableHead>
                      <TableHead>مدين</TableHead>
                      <TableHead>دائن</TableHead>
                      <TableHead>الرصيد</TableHead>
                      <TableHead>المرفق</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statementWithBalance.reverse().map((tx) => ( // Reverse back for display (newest first)
                      <TableRow key={`${tx.type}-${tx.id}`}>
                        <TableCell>{format(tx.date, 'dd MMMM yyyy', { locale: arSA })}</TableCell>
                        <TableCell>
                          {tx.type === 'debt' ? 
                            <span className="text-red-600 font-semibold">دين</span> : 
                            <span className="text-green-600 font-semibold">دفعة</span>
                          }
                        </TableCell>
                        <TableCell>{tx.type === 'debt' ? tx.description : tx.paymentMethod}</TableCell>
                        <TableCell className="text-red-600">
                          {tx.type === 'debt' ? tx.amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' }) : '-'}
                        </TableCell>
                        <TableCell className="text-green-600">
                          {tx.type === 'payment' ? tx.amount.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' }) : '-'}
                        </TableCell>
                        <TableCell className={`font-semibold ${tx.balance >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                          {Math.abs(tx.balance).toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })}
                          {tx.balance < 0 ? " (دائن)" : ""}
                        </TableCell>
                        <TableCell>
                          {(tx.type === 'debt' && tx.invoiceUrl) || (tx.type === 'payment' && tx.receiptUrl) ? (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={tx.type === 'debt' ? tx.invoiceUrl! : tx.receiptUrl!} target="_blank" data-ai-hint="document invoice">
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد معاملات لعرضها حالياً.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-debt">
          <AddDebtForm customerId={id} />
        </TabsContent>

        <TabsContent value="add-payment">
          <AddPaymentForm customerId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
