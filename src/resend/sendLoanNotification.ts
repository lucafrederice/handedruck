"use server";

import { logError } from "@/actions/error-logger";
import { resend, validateResendConfig } from "./config";
import { LoanNotificationTemplate } from "./templates/loan-notification";
import { z } from "zod";

// Define the schema for sending loan notification parameters
const sendLoanNotificationParamsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  loanAmount: z.string().min(1, "Loan amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  termMonths: z.number().min(1, "Term months is required"),
  purpose: z.string().nullable(),
});

// Define the schema for our function's return value
const sendLoanNotificationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Infer types from schemas
type SendLoanNotificationParams = z.infer<
  typeof sendLoanNotificationParamsSchema
>;
type SendLoanNotificationResult = z.infer<
  typeof sendLoanNotificationResultSchema
>;

/**
 * Sends a loan notification email using Resend
 *
 * @param {SendLoanNotificationParams} params - The parameters for sending the notification
 * @param {string} params.firstName - The borrower's first name
 * @param {string} params.lastName - The borrower's last name
 * @param {string} params.email - The email address to send the notification to
 * @param {string} params.loanAmount - The loan amount
 * @param {string} params.interestRate - The interest rate
 * @param {number} params.termMonths - The loan term in months
 * @param {string | null} params.purpose - The loan purpose (optional)
 *
 * @returns {Promise<SendLoanNotificationResult>} An object containing:
 *   - success: boolean - Whether the email was sent successfully
 *   - message: string - A message describing the result or error
 *
 * @throws {z.ZodError} If the parameters are invalid
 * @throws Will log errors to the error logger and return a failure response
 */
export async function sendLoanNotification(
  params: SendLoanNotificationParams
): Promise<SendLoanNotificationResult> {
  try {
    // Validate input parameters
    const validatedParams = sendLoanNotificationParamsSchema.parse(params);
    const {
      firstName,
      lastName,
      email,
      loanAmount,
      interestRate,
      termMonths,
      purpose,
    } = validatedParams;

    // Validate Resend configuration
    validateResendConfig();

    const { error } = await resend.emails.send({
      from: "Handedruck <onboarding@resend.dev>",
      to: [email],
      subject: "New Loan Application Created - Handedruck",
      react: LoanNotificationTemplate({
        firstName,
        lastName,
        loanAmount,
        interestRate,
        termMonths,
        purpose,
      }) as React.ReactElement,
    });

    if (error) {
      return sendLoanNotificationResultSchema.parse({
        success: false,
        message: error.message,
      });
    }

    return sendLoanNotificationResultSchema.parse({
      success: true,
      message: `Loan notification sent to ${email}`,
    });
  } catch (error) {
    console.error(`Loan notification error (${params.email}):`, error);
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "server-action",
      severity: "error",
      route: "/api/send-loan-notification",
      metadata: {
        destination: params.email.substring(0, 4) + "****", // Log partial destination for privacy
      },
    });
    return sendLoanNotificationResultSchema.parse({
      success: false,
      message: `Failed to send loan notification email.`,
    });
  }
}
