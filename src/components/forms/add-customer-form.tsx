
'use client';

import React, { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { handleAddCustomer } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2 animate-spin" />
          جاري الحفظ...
        </>
      ) : (
        <>
          <UserPlus className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
          إضافة العميل
        </>
      )}
    </Button>
  );
}

export function AddCustomerForm() {
  const initialState = { message: null, errors: {}, success: false, customerId: null };
  const [state, dispatch] = useActionState(handleAddCustomer, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success && state.customerId) {
        toast({
          title: 'نجاح',
          description: state.message,
        });
        formRef.current?.reset();
        router.push(`/dashboard/customers/${state.customerId}`);
      } else if (!state.success && state.errors && Object.keys(state.errors).length > 0) {
        toast({
          title: 'خطأ في الإدخال',
          description: state.message || 'الرجاء مراجعة الحقول.',
          variant: 'destructive',
        });
      } else if (!state.success && state.message) {
         toast({
          title: 'خطأ',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, router]);

  return (
    <Card className="shadow-lg w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">إضافة عميل جديد</CardTitle>
        <CardDescription>أدخل بيانات العميل الجديد ليتم إضافته إلى النظام.</CardDescription>
      </CardHeader>
      <form action={dispatch} ref={formRef}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">اسم العميل</Label>
            <Input id="name" name="name" placeholder="مثال: خالد المحمود" required />
            {state.errors?.name && <p className="text-sm text-destructive pt-1">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
            <Input id="email" name="email" type="email" placeholder="khaled@example.com" dir="ltr" />
            {state.errors?.email && <p className="text-sm text-destructive pt-1">{state.errors.email[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="05xxxxxxxx" dir="ltr" />
            {state.errors?.phone && <p className="text-sm text-destructive pt-1">{state.errors.phone[0]}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
