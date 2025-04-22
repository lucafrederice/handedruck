"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";

type LoanStatus = "pending" | "active" | "paid" | "defaulted" | "cancelled";

interface PrismaLoan {
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
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PrismaPayment {
  id: number;
  loanId: number;
  amount: number;
  paymentDate: Date;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get all loans with user info
export async function getLoans() {
  try {
    const loans = await prisma.loan.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal values to numbers
    const formattedLoans = loans.map((loan: PrismaLoan) => ({
      ...loan,
      amount: Number(loan.amount),
      interestRate: Number(loan.interestRate),
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
      payments: loan.payments.map((payment: PrismaPayment) => ({
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
  amount: number;
  interestRate: number;
  termMonths: number;
  status?: LoanStatus;
  startDate?: Date;
  endDate?: Date;
  purpose?: string;
  notes?: string;
}) {
  try {
    const loan = await prisma.loan.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        interestRate: data.interestRate,
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

    revalidatePath(`/loans/${id}`);
    revalidatePath("/loans");
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

    revalidatePath("/loans");
    return { success: true, loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to delete loan ${id}:`, error);
    return { error: `Failed to delete loan ${id}` };
  }
}
