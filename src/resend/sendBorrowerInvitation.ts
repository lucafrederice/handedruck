"use server";

import { logError } from "@/actions/error-logger";
import { resend, validateResendConfig } from "./config";
import { BorrowerInvitationTemplate } from "./templates/borrower-invitation";
import { z } from "zod";

// Define the schema for sending invitation parameters
const sendInvitationParamsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  loginUrl: z.string().url("Invalid login URL"),
});

// Define the schema for our function's return value
const sendInvitationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Infer types from schemas
type SendInvitationParams = z.infer<typeof sendInvitationParamsSchema>;
type SendInvitationResult = z.infer<typeof sendInvitationResultSchema>;

/**
 * Sends a borrower invitation email using Resend
 *
 * @param {SendInvitationParams} params - The parameters for sending the invitation
 * @param {string} params.firstName - The borrower's first name
 * @param {string} params.lastName - The borrower's last name
 * @param {string} params.email - The email address to send the invitation to
 * @param {string} params.loginUrl - The URL for the borrower to log in
 *
 * @returns {Promise<SendInvitationResult>} An object containing:
 *   - success: boolean - Whether the email was sent successfully
 *   - message: string - A message describing the result or error
 *
 * @throws {z.ZodError} If the parameters are invalid
 * @throws Will log errors to the error logger and return a failure response
 */
export async function sendBorrowerInvitation(
  params: SendInvitationParams
): Promise<SendInvitationResult> {
  try {
    // Validate input parameters
    const validatedParams = sendInvitationParamsSchema.parse(params);
    const { firstName, lastName, email, loginUrl } = validatedParams;

    // Validate Resend configuration
    validateResendConfig();

    const { error } = await resend.emails.send({
      from: "Handedruck <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Handedruck - Your Borrower Account",
      react: BorrowerInvitationTemplate({
        firstName,
        lastName,
        email,
        loginUrl,
      }) as React.ReactElement,
    });

    if (error) {
      return sendInvitationResultSchema.parse({
        success: false,
        message: error.message,
      });
    }

    return sendInvitationResultSchema.parse({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error(`Invitation error (${params.email}):`, error);
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "server-action",
      severity: "error",
      route: "/api/send-invitation",
      metadata: {
        destination: params.email.substring(0, 4) + "****", // Log partial destination for privacy
      },
    });
    return sendInvitationResultSchema.parse({
      success: false,
      message: `Failed to send invitation email.`,
    });
  }
}
