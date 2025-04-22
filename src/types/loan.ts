export type LoanStatus =
  | "pending"
  | "active"
  | "paid"
  | "defaulted"
  | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Payment {
  id: number;
  loanId: number;
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Loan {
  id: number;
  userId: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: LoanStatus;
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  payments: Payment[];
}
