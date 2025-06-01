'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleAddDebt } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, CreditCard, Upload } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

interface AddDebtFormProps {
  customerId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'جاري الحفظ...' : (
        <>
          <CreditCard className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
          حفظ الدين
        </>
      )}
    </Button>
  );
}

export function AddDebtForm({ customerId }: AddDebtFormProps) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(handleAddDebt, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [dueDate, setDueDate] = React.useState<Date | undefined>();


  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: state.message.includes('بنجاح') ? 'نجاح' : 'خطأ',
        description: state.message,
        variant: state.message.includes('بنجاح') ? 'default' : 'destructive',
      });
      if (state.message.includes('بنجاح')) {
        formRef.current?.reset();
        setDueDate(undefined);
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
        <CardTitle className="font-headline">تسجيل دين جديد</CardTitle>
        <CardDescription>أدخل تفاصيل الدين الجديد للعميل.</CardDescription>
      </CardHeader>
      <form action={dispatch} ref={formRef}>
        <CardContent className="space-y-4">
          <input type="hidden" name="customerId" value={customerId} />
          
          <div className="space-y-1">
            <Label htmlFor="amount">المبلغ</Label>
            <Input id="amount" name="amount" type="number" step="0.01" placeholder="مثال: 150.75" required />
            {state.errors?.amount && <p className="text-sm text-destructive">{state.errors.amount[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" name="description" placeholder="مثال: فاتورة رقم 123" required />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
                  {dueDate ? format(dueDate, "PPP", { locale: arSA }) : <span>اختر تاريخًا</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  locale={arSA}
                />
              </PopoverContent>
            </Popover>
            <input type="hidden" name="dueDate" value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""} />
            {state.errors?.dueDate && <p className="text-sm text-destructive">{state.errors.dueDate[0]}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="invoiceUrl">رابط نسخة الفاتورة (اختياري)</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Input id="invoiceUrl" name="invoiceUrl" type="url" placeholder="https://example.com/invoice.pdf" dir="ltr" />
              {/*
              <Button type="button" variant="outline" size="icon" className="aspect-square">
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload</span>
              </Button>
              */}
            </div>
            {state.errors?.invoiceUrl && <p className="text-sm text-destructive">{state.errors.invoiceUrl[0]}</p>}
          </div>

        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
