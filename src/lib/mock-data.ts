import type { Customer, Debt, Payment, DebtAgeData, DebtAgeCategory } from './types';
import { differenceInDays, parseISO, format } from 'date-fns';

let customers: Customer[] = [
  { id: '1', name: 'محمد الأحمد', email: 'mohammad@example.com', phone: '0501234567' },
  { id: '2', name: 'فاطمة عبدالله', email: 'fatima@example.com', phone: '0557654321' },
  { id: '3', name: 'علي حسين', email: 'ali@example.com', phone: '0539876543' },
];

let debts: Debt[] = [
  { id: 'd1', customerId: '1', amount: 1500, description: 'فاتورة مواد بناء', dueDate: '2024-06-15', createdAt: '2024-05-15', invoiceUrl: 'https://placehold.co/200x100.png' },
  { id: 'd2', customerId: '1', amount: 250, description: 'خدمات استشارية', dueDate: '2024-08-01', createdAt: '2024-07-01' },
  { id: 'd3', customerId: '2', amount: 800, description: 'توريد بضاعة', dueDate: '2024-05-10', createdAt: '2024-04-10', invoiceUrl: 'https://placehold.co/200x100.png' },
  { id: 'd4', customerId: '3', amount: 3000, description: 'عقد صيانة سنوي', dueDate: '2024-09-01', createdAt: '2024-03-01' },
  { id: 'd5', customerId: '1', amount: 600, description: 'فاتورة كهرباء متأخرة', dueDate: '2023-12-01', createdAt: '2023-11-01' },
];

let payments: Payment[] = [
  { id: 'p1', customerId: '1', amount: 1000, paymentMethod: 'تحويل بنكي', paymentDate: '2024-06-20', receiptUrl: 'https://placehold.co/200x100.png' },
  { id: 'p2', customerId: '2', amount: 800, paymentMethod: 'نقداً', paymentDate: '2024-05-15', receiptUrl: 'https://placehold.co/200x100.png' },
];

// Simulate API latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCustomers(): Promise<Customer[]> {
  await delay(300);
  return customers.map(c => {
    const customerDebts = debts.filter(d => d.customerId === c.id).reduce((sum, d) => sum + d.amount, 0);
    const customerPayments = payments.filter(p => p.customerId === c.id).reduce((sum, p) => sum + p.amount, 0);
    return { ...c, totalDebt: customerDebts - customerPayments };
  });
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  await delay(200);
  const customer = customers.find(c => c.id === id);
  if (!customer) return undefined;
  const customerDebts = debts.filter(d => d.customerId === id).reduce((sum, d) => sum + d.amount, 0);
  const customerPayments = payments.filter(p => p.customerId === id).reduce((sum, p) => sum + p.amount, 0);
  return { ...customer, totalDebt: customerDebts - customerPayments };
}

export async function getDebtsForCustomer(customerId: string): Promise<Debt[]> {
  await delay(250);
  return debts.filter(d => d.customerId === customerId).sort((a,b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
}

export async function getPaymentsForCustomer(customerId: string): Promise<Payment[]> {
  await delay(250);
  return payments.filter(p => p.customerId === customerId).sort((a,b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime());
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt'>): Promise<Debt> {
  await delay(500);
  const newDebt: Debt = {
    ...debtData,
    id: `d${Date.now()}`,
    createdAt: format(new Date(), 'yyyy-MM-dd')
  };
  debts.push(newDebt);
  return newDebt;
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
  await delay(500);
  const newPayment: Payment = { ...paymentData, id: `p${Date.now()}` };
  payments.push(newPayment);
  return newPayment;
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'totalDebt'>): Promise<Customer> {
  await delay(400);
  const newCustomer: Customer = {
    ...customerData,
    id: `c${Date.now()}`,
    totalDebt: 0, // New customers start with no debt
  };
  customers.push(newCustomer);
  return newCustomer;
}

export async function getDebtAgeReport(): Promise<DebtAgeData[]> {
  await delay(400);
  const today = new Date();
  const report: Record<DebtAgeCategory, { amount: number; debtCount: number }> = {
    "0-30": { amount: 0, debtCount: 0 },
    "31-60": { amount: 0, debtCount: 0 },
    "61-90": { amount: 0, debtCount: 0 },
    "90+": { amount: 0, debtCount: 0 },
  };

  const outstandingDebts: Debt[] = [];
  for (const customer of customers) {
    const customerTotalDebt = debts
      .filter(d => d.customerId === customer.id)
      .reduce((sum, d) => sum + d.amount, 0);
    const customerTotalPayment = payments
      .filter(p => p.customerId === customer.id)
      .reduce((sum, p) => sum + p.amount, 0);

    let remainingDebtToCategorize = customerTotalDebt - customerTotalPayment;

    if (remainingDebtToCategorize > 0) {
      // Iterate through debts, oldest first, to assign payments
      const customerDebtsSorted = debts
        .filter(d => d.customerId === customer.id)
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());

      let tempPayments = customerTotalPayment;

      for (const debt of customerDebtsSorted) {
        if (tempPayments >= debt.amount) {
          tempPayments -= debt.amount; // Debt fully paid by earlier payments
        } else {
          const outstandingAmount = debt.amount - tempPayments;
          tempPayments = 0;
          outstandingDebts.push({ ...debt, amount: outstandingAmount }); // Add remaining part of debt
        }
      }
    }
  }


  outstandingDebts.forEach(debt => {
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

  return Object.entries(report).map(([category, data]) => ({
    category: category as DebtAgeCategory,
    amount: data.amount,
    debtCount: data.debtCount,
  }));
}
