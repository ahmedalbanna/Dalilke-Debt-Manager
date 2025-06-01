
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCircle, KeyRound } from 'lucide-react';

// Mock user data - in a real app, this would come from your auth context or a backend call
const mockUser = {
  name: 'مندوب المبيعات النشط',
  email: 'sales.rep@example.com',
};

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center">
          <UserCircle className="ms-2 rtl:ms-0 rtl:me-2 h-8 w-8 text-primary" />
          الملف الشخصي
        </h1>
        <p className="text-muted-foreground">عرض وتحديث معلومات حسابك.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">معلومات الحساب</CardTitle>
          <CardDescription>تفاصيل حسابك المسجلة في النظام.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">الاسم</Label>
            <Input id="name" value={mockUser.name} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" value={mockUser.email} readOnly className="bg-muted/50" dir="ltr" />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled variant="outline">تحديث المعلومات (قيد التطوير)</Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">تغيير كلمة المرور</CardTitle>
          <CardDescription>قم بتحديث كلمة المرور الخاصة بحسابك بشكل دوري.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
            <Input id="currentPassword" type="password" placeholder="********" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
            <Input id="newPassword" type="password" placeholder="********" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
            <Input id="confirmPassword" type="password" placeholder="********" dir="ltr" />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>
            <KeyRound className="ms-2 h-4 w-4 rtl:ms-0 rtl:me-2" />
            تغيير كلمة المرور (قيد التطوير)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
