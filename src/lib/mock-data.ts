import { db, FieldValue, Timestamp } from './firebase';
import type { Customer, Debt, Payment, DebtAgeData, DebtAgeCategory } from './types';
import { differenceInDays, parseISO, format as formatDate } from 'date-fns';

const CUSTOMERS_COLLECTION = 'customers';
const DEBTS_COLLECTION = 'debts';
const PAYMENTS_COLLECTION = 'payments';

// Helper to convert Firestore doc data to a specific type, including ID
function docDataToType<T>(doc: admin.firestore.DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}

// Helper to format Firestore Timestamp to 'YYYY-MM-DD' string
function formatTimestampToString(timestamp: admin.firestore.Timestamp | undefined): string {
  if (!timestamp) return '';
  return formatDate(timestamp.toDate(), 'yyyy-MM-dd');
}

export async function getCustomers(): Promise<Customer[]> {
  const snapshot = await db.collection(CUSTOMERS_COLLECTION).orderBy('name').get();
  const customersData = snapshot.docs.map(doc => docDataToType<Customer>(doc));

  // Calculate totalDebt for each customer
  for (const customer of customersData) {
    const debtsSnapshot = await db.collection(DEBTS_COLLECTION).where('customerId', '==', customer.id).get();
    const customerDebtsTotal = debtsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

    const paymentsSnapshot = await db.collection(PAYMENTS_COLLECTION).where('customerId', '==', customer.id).get();
    const customerPaymentsTotal = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
    customer.totalDebt = customerDebtsTotal - customerPaymentsTotal;
  }
  return customersData;
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const doc = await db.collection(CUSTOMERS_COLLECTION).doc(id).get();
  if (!doc.exists) {
    return undefined;
  }
  const customer = docDataToType<Customer>(doc);

  const debtsSnapshot = await db.collection(DEBTS_COLLECTION).where('customerId', '==', customer.id).get();
  const customerDebtsTotal = debtsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

  const paymentsSnapshot = await db.collection(PAYMENTS_COLLECTION).where('customerId', '==', customer.id).get();
  const customerPaymentsTotal = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    
  customer.totalDebt = customerDebtsTotal - customerPaymentsTotal;
  return customer;
}

export async function getDebtsForCustomer(customerId: string): Promise<Debt[]> {
  const snapshot = await db.collection(DEBTS_COLLECTION)
    .where('customerId', '==', customerId)
    .orderBy('createdAt', 'desc') // createdAt is a Timestamp
    .get();
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      amount: data.amount || 0,
      description: data.description || '',
      dueDate: data.dueDate || '', // Assuming stored as YYYY-MM-DD string
      createdAt: formatTimestampToString(data.createdAt as admin.firestore.Timestamp), // Convert Timestamp to string
      invoiceUrl: data.invoiceUrl,
    } as Debt;
  });
}

export async function getPaymentsForCustomer(customerId: string): Promise<Payment[]> {
  const snapshot = await db.collection(PAYMENTS_COLLECTION)
    .where('customerId', '==', customerId)
    .orderBy('paymentDate', 'desc') // paymentDate is a YYYY-MM-DD string
    .get();
  return snapshot.docs.map(doc => docDataToType<Payment>(doc));
}

export async function addDebt(debtData: Omit<Debt, 'id' | 'createdAt'>): Promise<Debt> {
  const debtPayload = {
    ...debtData,
    createdAt: FieldValue.serverTimestamp(), // Use server timestamp
  };
  const docRef = await db.collection(DEBTS_COLLECTION).add(debtPayload);
  
  // To return the full Debt object, we need to fetch it again to get the server-generated createdAt
  // Or, we can approximate it for the return if an immediate exact value isn't critical client-side post-add
  // For simplicity, we'll return with a client-side formatted date for now, but know it's a Timestamp in DB
  return {
    id: docRef.id,
    ...debtData,
    createdAt: formatDate(new Date(), 'yyyy-MM-dd'), // Placeholder, actual is server timestamp
  };
}

export async function addPayment(paymentData: Omit<Payment, 'id'>): Promise<Payment> {
  const docRef = await db.collection(PAYMENTS_COLLECTION).add(paymentData);
  return { id: docRef.id, ...paymentData };
}

export async function addCustomer(customerData: Omit<Customer, 'id' | 'totalDebt'>): Promise<Customer> {
  const docRef = await db.collection(CUSTOMERS_COLLECTION).add(customerData);
  return { 
    id: docRef.id, 
    ...customerData,
    totalDebt: 0 // New customers start with 0 debt calculated
  };
}

export async function getDebtAgeReport(): Promise<DebtAgeData[]> {
  const today = new Date();
  const report: Record<DebtAgeCategory, { amount: number; debtCount: number }> = {
    "0-30": { amount: 0, debtCount: 0 },
    "31-60": { amount: 0, debtCount: 0 },
    "61-90": { amount: 0, debtCount: 0 },
    "90+": { amount: 0, debtCount: 0 },
  };

  const allCustomersSnapshot = await db.collection(CUSTOMERS_COLLECTION).get();
  const outstandingDebtsApplicableForReport: Debt[] = [];

  for (const customerDoc of allCustomersSnapshot.docs) {
    const customerId = customerDoc.id;
    
    const customerDebts = await getDebtsForCustomer(customerId); // These have createdAt as string
    const customerPayments = await getPaymentsForCustomer(customerId);

    const customerGrossDebts = customerDebts.reduce((sum, d) => sum + d.amount, 0);
    const customerGrossPayments = customerPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let remainingDebtToCategorize = customerGrossDebts - customerGrossPayments;

    if (remainingDebtToCategorize > 0) {
      // Sort debts by due date (oldest first) to apply payments chronologically against them
      const customerDebtsSortedByDueDate = [...customerDebts].sort((a, b) => 
        parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()
      );

      let tempPaymentsMadeByCustomer = customerGrossPayments;

      for (const debt of customerDebtsSortedByDueDate) {
        if (tempPaymentsMadeByCustomer >= debt.amount) {
          tempPaymentsMadeByCustomer -= debt.amount; // This debt is considered paid
        } else {
          const outstandingAmountForThisDebt = debt.amount - tempPaymentsMadeByCustomer;
          tempPaymentsMadeByCustomer = 0;
          // This debt (or part of it) is outstanding. Add its details.
          outstandingDebtsApplicableForReport.push({ ...debt, amount: outstandingAmountForThisDebt });
        }
      }
    }
  }

  outstandingDebtsApplicableForReport.forEach(debt => {
    const dueDate = parseISO(debt.dueDate); // dueDate is 'YYYY-MM-DD'
    const daysOverdue = differenceInDays(today, dueDate);

    if (daysOverdue < 0) return; // Not yet due

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
