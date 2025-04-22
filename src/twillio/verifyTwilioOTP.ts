"use server";

import { logError } from "@/actions/error-logger";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  validateTwilioConfig,
} from "./config";
import { z } from "zod";

// Define the schema for verification parameters
const verifyOtpParamsSchema = z.object({
  to: z.string().min(1, "Destination is required"),
  code: z
    .string()
    .min(4, "Code must be at least 4 characters")
    .max(32, "Code must be at most 32 characters"),
});

// Define the schema for Twilio's verification response
const twilioVerificationResponseSchema = z.object({
  sid: z.string(),
  service_sid: z.string(),
  account_sid: z.string(),
  to: z.string(),
  channel: z.string(),
  status: z.string(),
  valid: z.boolean(),
  date_created: z.string(),
  date_updated: z.string(),
});

// Define the schema for our function's return value
const verificationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Infer types from schemas
type VerifyOtpParams = z.infer<typeof verifyOtpParamsSchema>;
type VerificationResult = z.infer<typeof verificationResultSchema>;

/**
 * Verifies an OTP code using Twilio Verify service
 *
 * @param {VerifyOtpParams} params - The parameters for verifying the OTP
 * @param {string} params.to - Phone number (E.164 format) or email address that received the code
 * @param {string} params.code - The verification code to check (4-32 characters)
 *
 * @returns {Promise<VerificationResult>} An object containing:
 *   - success: boolean - Whether the verification was successful
 *   - message: string - A message describing the result or error
 *
 * @throws {z.ZodError} If the parameters are invalid
 * @throws Will log errors to the error logger and return a failure response
 *
 * @example
 * ```ts
 * const result = await verifyTwilioOTP({
 *   to: "+12065550100",
 *   code: "123456"
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "Verification successful"
 * } else {
 *   console.error(result.message); // "Verification failed: [status]"
 * }
 * ```
 */
export async function verifyTwilioOTP(
  params: VerifyOtpParams
): Promise<VerificationResult> {
  try {
    // Validate input parameters
    const validatedParams = verifyOtpParamsSchema.parse(params);
    const { to, code } = validatedParams;

    // Validate Twilio configuration
    validateTwilioConfig();

    // Create the request body
    const requestParams = new URLSearchParams();
    requestParams.append("To", to);
    requestParams.append("Code", code);

    // Create auth string
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Send verification check request using fetch
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestParams.toString(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Twilio Verify API error: ${data.message || response.statusText}`
      );
    }

    // Validate and parse the response data
    const verifiedData = twilioVerificationResponseSchema.parse(data);

    // Check verification status
    if (verifiedData.valid && verifiedData.status === "approved") {
      return verificationResultSchema.parse({
        success: true,
        message: "Verification successful",
      });
    } else {
      return verificationResultSchema.parse({
        success: false,
        message: `Verification failed: ${verifiedData.status}`,
      });
    }
  } catch (error) {
    console.error("Verification check error:", error);
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "server-action",
      severity: "error",
      route: "/api/verify-otp",
      metadata: {
        destination: params.to.substring(0, 4) + "****", // Log partial destination for privacy
      },
    });
    return verificationResultSchema.parse({
      success: false,
      message: "Failed to verify code.",
    });
  }
}
