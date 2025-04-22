"use server";

import { logError } from "@/actions/error-logger";
import { resend, validateResendConfig } from "./config";
import { EmailTemplate } from "./templates";
import { z } from "zod";

// Define the schema for sending OTP parameters
const sendOtpParamsSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z
    .string()
    .min(4, "Code must be at least 4 characters")
    .max(32, "Code must be at most 32 characters"),
});

// Define the schema for Resend's email response
// const resendEmailResponseSchema = z.object({
//   id: z.string(),
//   from: z.string(),
//   to: z.array(z.string()),
//   subject: z.string(),
//   created_at: z.string(),
// });

// Define the schema for our function's return value
const sendOtpResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Infer types from schemas
type SendOtpParams = z.infer<typeof sendOtpParamsSchema>;
type SendOtpResult = z.infer<typeof sendOtpResultSchema>;

/**
 * Sends an OTP verification code via email using Resend
 *
 * @param {SendOtpParams} params - The parameters for sending the OTP
 * @param {string} params.email - The email address to send the OTP to
 * @param {string} params.code - The verification code to send (4-32 characters)
 *
 * @returns {Promise<SendOtpResult>} An object containing:
 *   - success: boolean - Whether the email was sent successfully
 *   - message: string - A message describing the result or error
 *
 * @throws {z.ZodError} If the parameters are invalid
 * @throws Will log errors to the error logger and return a failure response
 *
 * @example
 * ```ts
 * const result = await sendResendEmailOTP({
 *   email: "user@example.com",
 *   code: "123456"
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "Verification code sent to user@example.com"
 * } else {
 *   console.error(result.message); // Error message
 * }
 * ```
 */
export async function sendResendEmailOTP(
  params: SendOtpParams
): Promise<SendOtpResult> {
  try {
    // Validate input parameters
    const validatedParams = sendOtpParamsSchema.parse(params);
    const { email, code } = validatedParams;

    // Validate Resend configuration
    validateResendConfig();

    const { error } = await resend.emails.send({
      from: "Handedruck <onboarding@resend.dev>",
      to: [email],
      subject: "Hello world",
      react: EmailTemplate({ otp: code }) as React.ReactElement,
    });

    if (error) {
      return sendOtpResultSchema.parse({
        success: false,
        message: error.message,
      });
    }

    // Validate and parse the response data
    // const verifiedData = resendEmailResponseSchema.parse(data);

    return sendOtpResultSchema.parse({
      success: true,
      message: `Verification code sent to ${email}`,
    });
  } catch (error) {
    console.error(`Verification error (${params.email}):`, error);
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "server-action",
      severity: "error",
      route: "/api/send-otp",
      metadata: {
        destination: params.email.substring(0, 4) + "****", // Log partial destination for privacy
      },
    });
    return sendOtpResultSchema.parse({
      success: false,
      message: `Failed to send verification code via email.`,
    });
  }
}
