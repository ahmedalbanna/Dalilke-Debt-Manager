import { AddCustomerForm } from '@/components/forms/add-customer-form';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">إضافة عميل جديد</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">
            <ArrowRight className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
            العودة إلى قائمة العملاء
          </Link>
        </Button>
      </div>
      <AddCustomerForm />
    </div>
  );
}
