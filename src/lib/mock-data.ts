
import type { Customer, Debt, Payment, DebtAgeData, DebtAgeCategory } from './types';
import { differenceInDays, parseISO, format as formatDate } from 'date-fns';

// In-memory store
let customers: Customer[] = [];
let debts: Debt[] = [];
let payments: Payment[] = [];

// Seed initial data for basic testing
customers = [
  { id: 'c1717207200001', name: 'أحمد الراجحي', email: 'ahmad@example.com', phone: '0512345678' },
  { id: 'c1717207200002', name: 'فاطمة السالم', email: 'fatima@example.com', phone: '0587654321' },
  { id: 'c1717207200003', name: 'شركة النهر الخالد', email: 'info@river.sa', phone: '0555010101' },
];

debts = [
  { id: 'd1717207200011', customerId: 'c1717207200001', amount: 500, description: 'فاتورة كهرباء رقم #INV001', dueDate: '2024-07-15', createdAt: new Date('2024-06-01T10:00:00Z').toISOString(), invoiceUrl: 'https://placehold.co/100x50.png?text=Invoice1' },
  { id: 'd1717207200012', customerId: 'c1717207200001', amount: 250, description: 'مستلزمات مكتبية #INV002', dueDate: '2024-08-01', createdAt: new Date('2024-06-10T11:00:00Z').toISOString() },
  { id: 'd1717207200013', customerId: 'c1717207200002', amount: 1200, description: 'إيجار شهري يوليو #INV003', dueDate: '2024-07-01', createdAt: new Date('2024-05-20T09:30:00Z').toISOString(), invoiceUrl: 'https://placehold.co/100x50.png?text=Invoice2' },
  { id: 'd1717207200014', customerId: 'c1717207200003', amount: 3500, description: 'خدمات استشارية #INV004', dueDate: '2024-06-20', createdAt: new Date('2024-04-15T14:00:00Z').toISOString() },
  { id: 'd1717207200015', customerId: 'c1717207200001', amount: 150, description: 'صيانة دورية #INV005', dueDate: '2023-11-10', createdAt: new Date('2023-10-25T16:00:00Z').toISOString() }, // Old debt
];

payments = [
  { id: 'p1717207200021', customerId: 'c1717207200001', amount: 100, paymentMethod: 'نقداً', paymentDate: '2024-06-05', receiptUrl: 'https://placehold.co/100x50.png?text=Receipt1' },
  { id: 'p1717207200022', customerId: 'c1717207200003', amount: 1000, paymentMethod: 'تحويل بنكي', paymentDate: '2024-05-01' },
];


export async function getCustomers(): Promise<Customer[]> {
  return Promise.resolve(
    customers.map(customer => {
      const customerDebtsTotal = debts
        .filter(d => d.customerId === customer.id)
        .reduce((sum, d) => sum + d.amount, 0);
      const customerPaymentsTotal = payments
        .filter(p => p.customerId === customer.id)
        .reduce((sum, p) => sum + p.amount, 0);
      return { ...customer, totalDebt: customerDebtsTotal - customerPaymentsTotal };
    }).sort((a, b) => a.name.localeCompare(b.name, 'ar'))
  );
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const customer = customers.find(c => c.id === id);
  if (!customer) {
    return Promise.resolve(undefined);
  }
  const customerDebtsTotal = debts
    .filter(d => d.customerId === customer.id)
    .reduce((sum, d) => sum + d.amount, 0);
  const customerPaymentsTotal = payments
    .filter(p => p.customerId === customer.id)
    .reduce((sum, p) => sum + p.amount, 0);
  return Promise.resolve({ ...customer, totalDebt: customerDebtsTotal - customerPaymentsTotal });
}

export async function getDebtsForCustomer(customerId: string): Promise<Debt[]> {
  return Promise.resolve(
    debts.filter(d => d.customerId === customerId)
         .sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime())
  );
}

export async function getPaymentsForCustomer(customerId: string): Promise<Payment[]> {
  return Promise.resolve(
    payments.filter(p => p.customerId === customerId)
            .sort((a,b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime())
  );
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt'>): Promise<Debt> {
  const newDebt: Debt = {
    id: `d${Date.now()}`, // Simple ID generation
    ...debtData,
    createdAt: new Date().toISOString(),
  };
  debts.push(newDebt);
  return Promise.resolve(newDebt);
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
  const newPayment: Payment = {
    id: `p${Date.now()}`, // Simple ID generation
    ...paymentData,
  };
  payments.push(newPayment);
  return Promise.resolve(newPayment);
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'totalDebt'>): Promise<Customer> {
  const newCustomer: Customer = {
    id: `c${Date.now()}`, // Simple ID generation
    ...customerData,
    totalDebt: 0, // New customers start with 0 debt
  };
  customers.push(newCustomer);
  return Promise.resolve(newCustomer);
}


export async function getDebtAgeReport(): Promise<DebtAgeData[]> {
  const today = new Date();
  const report: Record<DebtAgeCategory, { amount: number; debtCount: number }> = {
    "0-30": { amount: 0, debtCount: 0 },
    "31-60": { amount: 0, debtCount: 0 },
    "61-90": { amount: 0, debtCount: 0 },
    "90+": { amount: 0, debtCount: 0 },
  };

  const allCustomersData = await getCustomers();
  const outstandingDebtsApplicableForReport: Debt[] = [];

  for (const customer of allCustomersData) {
    if(!customer.id) continue; // Should not happen with mock data structure

    const customerTotalDebts = debts
        .filter(d => d.customerId === customer.id)
        .reduce((sum, d) => sum + d.amount, 0);
    
    const customerTotalPayments = payments
      .filter(p => p.customerId === customer.id)
      .reduce((sum, p) => sum + p.amount, 0);

    let remainingDebtToCategorize = customerTotalDebts - customerTotalPayments;

    if (remainingDebtToCategorize > 0) {
      const customerDebtsFromDb = await getDebtsForCustomer(customer.id);
      // Sort debts by due date (oldest first) to apply payments chronologically
      const customerDebtsSortedByDueDate = [...customerDebtsFromDb].sort((a, b) =>
        parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
      );

      let tempPaymentsMadeByCustomer = customerTotalPayments;

      for (const debt of customerDebtsSortedByDueDate) {
        if (tempPaymentsMadeByCustomer >= debt.amount) {
          tempPaymentsMadeByCustomer -= debt.amount; // This debt is considered paid
        } else {
          const outstandingAmountForThisDebt = debt.amount - tempPaymentsMadeByCustomer;
          tempPaymentsMadeByCustomer = 0;
          // This debt (or part of it) is outstanding. Add its details.
          outstandingDebtsApplicableForReport.push({ ...debt, amount: outstandingAmountForThisDebt });
        }
        if (tempPaymentsMadeByCustomer <= 0) break; // All payments applied for this customer
      }
    }
  }


  outstandingDebtsApplicableForReport.forEach(debt => {
    const dueDate = parseISO(debt.dueDate);
    const daysOverdue = differenceInDays(today, dueDate);

    if (daysOverdue < 0) return; // Not yet due or paid

    let category: DebtAgeCategory;
    if (daysOverdue <= 30) category = "0-30";
    else if (daysOverdue <= 60) category = "31-60";
    else if (daysOverdue <= 90) category = "61-90";
    else category = "90+";

    report[category].amount += debt.amount;
    report[category].debtCount += 1;
  });

  return Promise.resolve(
    Object.entries(report).map(([category, data]) => ({
      category: category as DebtAgeCategory,
      amount: data.amount,
      debtCount: data.debtCount,
    }))
  );
}
