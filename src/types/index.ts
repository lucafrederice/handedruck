export type Borrower = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  creditScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Loan = {
  id: number;
  userId: number;
  amount: number;
  interestRate: number;
  termMonths: number;
  status: "pending" | "active" | "paid" | "defaulted" | "cancelled";
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  payments?: Payment[];
};

export type Payment = {
  id: number;
  loanId: number;
  amount: string;
  paymentDate: Date;
  status: "pending" | "completed" | "failed" | "cancelled";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};
