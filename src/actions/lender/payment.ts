"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";
import { DASH_L_LOANS_ID_PATH } from "@/app/dashboard/l/loans/[id]/path";
type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

// Get all payments for a loan
export async function getPaymentsForLoan(loanId: number) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        loanId: loanId,
      },
      orderBy: {
        paymentDate: "desc",
      },
    });
    return { payments };
  } catch (error) {
    console.error(`Failed to fetch payments for loan ${loanId}:`, error);
    return { error: `Failed to fetch payments for loan ${loanId}` };
  }
}

// Create a new payment
export async function createPayment(data: {
  loanId: number;
  amount: number;
  paymentDate: Date;
  status?: PaymentStatus;
  notes?: string;
}) {
  try {
    const payment = await prisma.payment.create({
      data: {
        loanId: data.loanId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        status: data.status || "pending",
        notes: data.notes,
      },
    });

    // Convert Decimal to number before returning
    const paymentWithNumberAmount = {
      ...payment,
      amount: Number(payment.amount),
    };

    revalidatePath(DASH_L_LOANS_ID_PATH(data.loanId.toString()));
    return { payment: paymentWithNumberAmount };
  } catch (error) {
    console.error("Failed to create payment:", error);
    return { error: "Failed to create payment" };
  }
}

// Update an existing payment
export async function updatePayment(
  id: number,
  data: Partial<{
    amount: number;
    paymentDate: Date;
    status: PaymentStatus;
    notes: string;
  }>
) {
  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: data,
    });

    revalidatePath(DASH_L_LOANS_ID_PATH(payment.loanId.toString()));
    return { payment };
  } catch (error) {
    console.error(`Failed to update payment ${id}:`, error);
    return { error: `Failed to update payment ${id}` };
  }
}

// Delete a payment
export async function deletePayment(id: number) {
  try {
    const payment = await prisma.payment.delete({
      where: { id },
    });

    revalidatePath(DASH_L_LOANS_ID_PATH(payment.loanId.toString()));
    return { success: true, payment };
  } catch (error) {
    console.error(`Failed to delete payment ${id}:`, error);
    return { error: `Failed to delete payment ${id}` };
  }
}
