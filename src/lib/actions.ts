'use server';

import { z } from 'zod';
import { addDebt as mockAddDebt, addPayment as mockAddPayment } from './mock-data';
import { revalidatePath } from 'next/cache';
import type { Debt, Payment } from './types';

const DebtSchema = z.object({
  customerId: z.string().min(1, "معرف العميل مطلوب"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  description: z.string().min(1, "الوصف مطلوب").max(200, "الوصف طويل جداً"),
  dueDate: z.string().min(1, "تاريخ الاستحقاق مطلوب"), // YYYY-MM-DD
  invoiceUrl: z.string().url("رابط الفاتورة غير صحيح").optional().or(z.literal('')),
});

export async function handleAddDebt(prevState: any, formData: FormData) {
  const validatedFields = DebtSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'الرجاء تصحيح الأخطاء المدخلة.',
    };
  }

  try {
    await mockAddDebt(validatedFields.data as Omit<Debt, 'id' | 'createdAt'>);
    revalidatePath(`/dashboard/customers/${validatedFields.data.customerId}`);
    revalidatePath('/dashboard/reports'); // Revalidate reports as well
    revalidatePath('/dashboard'); // Revalidate dashboard for summary cards
    return { message: 'تم تسجيل الدين بنجاح!', errors: {} };
  } catch (error) {
    return { message: 'فشل تسجيل الدين. حاول مرة أخرى.', errors: {} };
  }
}


const PaymentSchema = z.object({
  customerId: z.string().min(1, "معرف العميل مطلوب"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من صفر"),
  paymentMethod: z.string().min(1, "طريقة الدفع مطلوبة"),
  paymentDate: z.string().min(1, "تاريخ الدفع مطلوب"), // YYYY-MM-DD
  receiptUrl: z.string().url("رابط إيصال الدفع غير صحيح").optional().or(z.literal('')),
});

export async function handleAddPayment(prevState: any, formData: FormData) {
  const validatedFields = PaymentSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'الرجاء تصحيح الأخطاء المدخلة.',
    };
  }

  try {
    await mockAddPayment(validatedFields.data as Omit<Payment, 'id'>);
    revalidatePath(`/dashboard/customers/${validatedFields.data.customerId}`);
    revalidatePath('/dashboard/reports'); // Revalidate reports as well
    revalidatePath('/dashboard'); // Revalidate dashboard for summary cards
    return { message: 'تم تسجيل الدفعة بنجاح!', errors: {} };
  } catch (error) {
    return { message: 'فشل تسجيل الدفعة. حاول مرة أخرى.', errors: {} };
  }
}
