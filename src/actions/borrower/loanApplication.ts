import { prisma } from "@/db/prisma";
import { z } from "zod";

const loanApplicationSchema = z.object({
  amount: z.number().positive(),
  interestRate: z.number().positive(),
  termMonths: z.number().int().positive(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
});

export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;

export async function createLoanApplication(
  userId: number,
  data: LoanApplicationInput
) {
  try {
    // Validate input data
    const validatedData = loanApplicationSchema.parse(data);

    // Create the loan with customer approval
    const loan = await prisma.loan.create({
      data: {
        userId,
        amount: validatedData.amount,
        interestRate: validatedData.interestRate,
        termMonths: validatedData.termMonths,
        purpose: validatedData.purpose,
        notes: validatedData.notes,
        approvedByCustomer: true, // Customer has approved by submitting the application
        status: "pending", // Initial status is pending until approved by the company
      },
    });

    return { success: true, data: loan };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
        details: error.errors,
      };
    }
    return { success: false, error: "Failed to create loan application" };
  }
}
