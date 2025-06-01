'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleAddPayment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { CircleDollarSign, Upload, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface AddPaymentFormProps {
  customerId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'جاري الحفظ...' : (
        <>
          <CircleDollarSign className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
          حفظ الدفعة
        </>
      )}
    </Button>
  );
}

export function AddPaymentForm({ customerId }: AddPaymentFormProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(handleAddPayment, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentDate, setPaymentDate] = React.useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = React.useState<string | undefined>();

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: state.message.includes('بنجاح') ? 'نجاح' : 'خطأ',
        description: state.message,
        variant: state.message.includes('بنجاح') ? 'default' : 'destructive',
      });
      if (state.message.includes('بنجاح')) {
        formRef.current?.reset();
        setPaymentDate(new Date());
        setPaymentMethod(undefined);
        // Manually clear Select component if form.reset() doesn't work due to controlled state.
        // This might require a key prop on the Select or managing its value explicitly.
      }
    } else if (state.message && state.errors) {
       toast({
        title: 'خطأ في الإدخال',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline">تسجيل دفعة جديدة</CardTitle>
        <CardDescription>أدخل تفاصيل دفعة العميل المستلمة.</CardDescription>
      </CardHeader>
      <form action={dispatch} ref={formRef}>
        <CardContent className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          
          <div className="space-y-1">
            <Label htmlFor="paymentAmount">المبلغ</Label>
            <Input id="paymentAmount" name="amount" type="number" step="0.01" placeholder="مثال: 100.00" required />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select name="paymentMethod" required onValueChange={setPaymentMethod} value={paymentMethod}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نقداً">نقداً</SelectItem>
                <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                <SelectItem value="شيك">شيك</SelectItem>
                <SelectItem value="بطاقة ائتمانية">بطاقة ائتمانية</SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.paymentMethod && <p className="text-sm text-destructive">{state.errors.paymentMethod[0]}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="paymentDate">تاريخ الدفع</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: arSA }) : <span>اختر تاريخًا</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  locale={arSA}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="paymentDate" value={paymentDate ? format(paymentDate, "yyyy-MM-dd") : ""} />
            {state.errors?.paymentDate && <p className="text-sm text-destructive">{state.errors.paymentDate[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="receiptUrl">رابط نسخة إيصال الدفع (اختياري)</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Input id="receiptUrl" name="receiptUrl" type="url" placeholder="https://example.com/receipt.pdf" dir="ltr" />
              {/*
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
                 <span className="sr-only">Upload</span>
              </Button>
              */}
            </div>
             {state.errors?.receiptUrl && <p className="text-sm text-destructive">{state.errors.receiptUrl[0]}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
