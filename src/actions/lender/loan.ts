"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import { LoanStatus } from "../../types/loan";
import { Decimal } from "@prisma/client/runtime/library";
import { sendLoanNotification } from "@/resend/sendLoanNotification";
import { formatCurrency } from "@/lib/loan-utils";
import { DASH_L_LOANS_PATH } from "@/app/dashboard/l/loans/path";
import { DASH_L_LOANS_ID_PATH } from "@/app/dashboard/l/loans/[id]/path";
type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

type Payment = {
  id: number;
  loanId: number;
  amount: Decimal;
  paymentDate: Date;
  status: PaymentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type LoanWithRelations = {
  id: number;
  userId: number;
  amount: Decimal;
  interestRate: Decimal;
  termMonths: number;
  status: LoanStatus;
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  payments: Payment[];
};

// Get all loans with user info
export async function getLoans() {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal values to numbers
    const formattedLoans = loans.map((loan: LoanWithRelations) => ({
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
      payments: loan.payments.map((payment: Payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    return { loans: formattedLoans };
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return { error: "Failed to fetch loans" };
  }
}

// Get a single loan with user and payment info
export async function getLoan(id: number) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        user: true,
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    if (!loan) {
      return { error: "Loan not found" };
    }

    // Convert Decimal values to numbers
    const formattedLoan = {
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
      payments: loan.payments.map((payment: Payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };

    return { loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to fetch loan ${id}:`, error);
    return { error: `Failed to fetch loan ${id}` };
  }
}

// Create a new loan
export async function createLoan(data: {
  userId: number;
  amount: number | string;
  interestRate: number | string;
  termMonths: number;
  status?: LoanStatus;
  startDate?: Date;
  endDate?: Date;
  purpose?: string;
  notes?: string;
}) {
  try {
    // Parse and validate numeric values
    const amount =
      typeof data.amount === "string"
        ? parseFloat(data.amount.replace(/[^0-9.-]+/g, ""))
        : data.amount;

    const interestRate =
      typeof data.interestRate === "string"
        ? parseFloat(data.interestRate.replace(/[^0-9.-]+/g, ""))
        : data.interestRate;

    // Validate amount is within database limits (precision 12, scale 2)
    if (isNaN(amount) || amount <= 0) {
      return { error: "Invalid loan amount" };
    }
    if (amount >= 10000000000) {
      // 10^10 (max value for precision 12, scale 2)
      return { error: "Loan amount exceeds maximum allowed value" };
    }

    if (isNaN(interestRate) || interestRate <= 0) {
      return { error: "Invalid interest rate" };
    }
    if (isNaN(data.termMonths) || data.termMonths <= 0) {
      return { error: "Invalid term months" };
    }

    const loan = await prisma.loan.create({
      data: {
        user: {
          connect: {
            id: data.userId,
          },
        },
        amount: new Decimal(amount),
        interestRate: new Decimal(interestRate),
        termMonths: data.termMonths,
        status: data.status || "pending",
        startDate: data.startDate,
        endDate: data.endDate,
        purpose: data.purpose,
        notes: data.notes,
      },
      include: {
        user: true,
      },
    });

    // Send notification email to the borrower
    if (loan.user.email) {
      await sendLoanNotification({
        firstName: loan.user.firstName || "",
        lastName: loan.user.lastName || "",
        email: loan.user.email,
        loanAmount: formatCurrency(Number(loan.amount)),
        interestRate: Number(loan.interestRate).toString(),
        termMonths: loan.termMonths,
        purpose: loan.purpose,
      });
    }

    // Convert Decimal values to numbers
    const formattedLoan = {
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
    };

    revalidatePath("/loans");
    return { loan: formattedLoan };
  } catch (error) {
    console.error("Failed to create loan:", error);
    return { error: "Failed to create loan" };
  }
}

// Update an existing loan
export async function updateLoan(
  id: number,
  data: Partial<{
    userId: number;
    amount: number;
    interestRate: number;
    termMonths: number;
    status: LoanStatus;
    startDate: Date | null;
    endDate: Date | null;
    purpose: string | null;
    notes: string | null;
  }>
) {
  try {
    const loan = await prisma.loan.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });

    // Convert Decimal values to numbers
    const formattedLoan = {
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
    };

    revalidatePath(DASH_L_LOANS_ID_PATH(id.toString()));
    revalidatePath(DASH_L_LOANS_PATH);
    return { loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to update loan ${id}:`, error);
    return { error: `Failed to update loan ${id}` };
  }
}

// Delete a loan
export async function deleteLoan(id: number) {
  try {
    const loan = await prisma.loan.delete({
      where: { id },
      include: {
        user: true,
      },
    });

    // Convert Decimal values to numbers
    const formattedLoan = {
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
    };

    revalidatePath(DASH_L_LOANS_PATH);
    return { success: true, loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to delete loan ${id}:`, error);
    return { error: `Failed to delete loan ${id}` };
  }
}
