"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import type { Decimal } from "@prisma/client/runtime/library";
import { DASH_B_LOAN_PATH } from "@/app/dashboard/b/loan/[id]/path";
import { DASH_B_PATH } from "@/app/dashboard/b/path";
interface PrismaLoan {
  id: number;
  userId: number;
  amount: Decimal;
  interestRate: Decimal;
  termMonths: number;
  status: "pending" | "active" | "paid" | "defaulted" | "cancelled";
  approvedByUs: boolean;
  approvedByCustomer: boolean;
  startDate: Date | null;
  endDate: Date | null;
  purpose: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  payments: PrismaPayment[];
}

interface PrismaPayment {
  id: number;
  loanId: number;
  amount: Decimal;
  paymentDate: Date;
  status: "pending" | "completed" | "failed" | "cancelled";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Get all loans for the current user
export async function getUserLoans() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const loans = await prisma.loan.findMany({
      where: { userId: user.id },
      include: {
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
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
      payments: loan.payments.map((payment: PrismaPayment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));

    return { loans: formattedLoans };
  } catch (error) {
    console.error("Failed to fetch user loans:", error);
    return { error: "Failed to fetch loans" };
  }
}

// Get a single loan with payment info
export async function getUserLoan(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const loan = await prisma.loan.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
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

// Create a new loan application
export async function createLoanApplication(data: {
  amount: number;
  interestRate: number;
  termMonths: number;
  purpose?: string;
  notes?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        amount: data.amount,
        interestRate: data.interestRate,
        termMonths: data.termMonths,
        purpose: data.purpose,
        notes: data.notes,
        status: "pending",
        approvedByCustomer: true, // Customer has approved by submitting the application
      },
      include: {
        payments: true,
      },
    });

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

    revalidatePath(DASH_B_PATH);
    return { loan: formattedLoan };
  } catch (error) {
    console.error("Failed to create loan application:", error);
    return { error: "Failed to create loan application" };
  }
}

// Approve a loan
export async function approveLoan(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const loan = await prisma.loan.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        approvedByCustomer: true,
        status: "active",
        startDate: new Date(),
      },
      include: {
        payments: true,
      },
    });

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

    revalidatePath(DASH_B_PATH);
    revalidatePath(DASH_B_LOAN_PATH(id.toString()));
    return { loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to approve loan ${id}:`, error);
    return { error: `Failed to approve loan ${id}` };
  }
}

// Decline a loan
export async function declineLoan(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "User not found" };
    }

    const loan = await prisma.loan.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        status: "cancelled",
      },
      include: {
        payments: true,
      },
    });

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

    revalidatePath(DASH_B_PATH);
    revalidatePath(DASH_B_LOAN_PATH(id.toString()));
    return { loan: formattedLoan };
  } catch (error) {
    console.error(`Failed to decline loan ${id}:`, error);
    return { error: `Failed to decline loan ${id}` };
  }
}
