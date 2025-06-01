export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalDebt?: number; // Optional: calculated field
}

export interface Debt {
  id: string;
  customerId: string;
  amount: number;
  description: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  invoiceUrl?: string;
  createdAt: string; // ISO date string YYYY-MM-DD
}

export interface Payment {
  id: string;
  customerId: string;
  amount: number;
  paymentMethod: string; // e.g., "Cash", "Bank Transfer", "Check"
  receiptUrl?: string;
  paymentDate: string; // ISO date string YYYY-MM-DD
}

export type DebtAgeCategory = "0-30" | "31-60" | "61-90" | "90+";

export interface DebtAgeData {
  category: DebtAgeCategory;
  amount: number;
  debtCount: number;
}
