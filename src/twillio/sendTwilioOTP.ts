"use server";

import { logError } from "@/actions/error-logger";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  validateTwilioConfig,
} from "./config";
import { z } from "zod";

// Define the schema for sending OTP parameters
const sendOtpParamsSchema = z.object({
  to: z.string().min(1, "Destination is required"),
  channel: z.enum(["sms", "email"]),
  locale: z.string().min(2).max(5).default("pt-BR"),
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
const sendOtpResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  sid: z.string().optional(),
  status: z.string().optional(),
});

// Infer types from schemas
type SendOtpParams = z.infer<typeof sendOtpParamsSchema>;
type SendOtpResult = z.infer<typeof sendOtpResultSchema>;

/**
 * Sends an OTP verification code using Twilio Verify service
 *
 * @param {SendOtpParams} params - The parameters for sending the OTP
 * @param {string} params.to - Phone number (E.164 format) or email address to send the OTP to
 * @param {"sms" | "email"} params.channel - The channel to use for sending the OTP
 * @param {string} [params.locale="pt-BR"] - Optional locale for the verification message (2-5 characters)
 *
 * @returns {Promise<SendOtpResult>} An object containing:
 *   - success: boolean - Whether the OTP was sent successfully
 *   - message: string - A message describing the result or error
 *   - sid?: string - The verification SID (only on success)
 *   - status?: string - The verification status (only on success)
 *
 * @throws {z.ZodError} If the parameters are invalid
 * @throws Will log errors to the error logger and return a failure response
 *
 * @example
 * ```ts
 * // Send SMS OTP
 * const result = await sendTwilioOTP({
 *   to: "+12065550100",
 *   channel: "sms",
 *   locale: "en-US"
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "Verification code sent to +12065550100 via sms"
 *   console.log(result.sid); // Verification SID
 * } else {
 *   console.error(result.message); // Error message
 * }
 * ```
 */
export async function sendTwilioOTP(
  params: SendOtpParams
): Promise<SendOtpResult> {
  try {
    // Validate input parameters
    const validatedParams = sendOtpParamsSchema.parse(params);
    const { to, channel, locale } = validatedParams;

    // Validate Twilio configuration
    validateTwilioConfig();

    // Validate the destination based on channel
    if (channel === "sms" && !to.startsWith("+")) {
      return sendOtpResultSchema.parse({
        success: false,
        message: "Phone number must be in E.164 format (e.g., +12065550100)",
      });
    }

    // Create the request body
    const requestParams = new URLSearchParams();
    requestParams.append("To", to);
    requestParams.append("Channel", channel);
    requestParams.append("Locale", locale);

    // Create auth string
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Send verification request using fetch
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
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

    return sendOtpResultSchema.parse({
      success: true,
      message: `Verification code sent to ${to} via ${channel}`,
      sid: verifiedData.sid,
      status: verifiedData.status,
    });
  } catch (error) {
    console.error(`Verification error (${params.channel}):`, error);
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "server-action",
      severity: "error",
      route: "/api/send-otp",
      metadata: {
        channel: params.channel,
        destination: params.to.substring(0, 4) + "****", // Log partial destination for privacy
      },
    });
    return sendOtpResultSchema.parse({
      success: false,
      message: `Failed to send verification code via ${params.channel}.`,
    });
  }
}
