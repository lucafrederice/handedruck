"use server";

import { readTempIdCookie } from "./cookies/tempIdCookie/readTempIdCookie";
import { sendTwilioOTP } from "@/twillio/sendTwilioOTP";
import { generateSecureOtp } from "@/utils/otp";
import { sendResendEmailOTP } from "@/resend/sendResendEmailOTP";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { cookies } from "next/headers";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating the OTP sending response
 */
const sendOtpResponseSchema = z.object({
  success: z.boolean(),
  status: z.enum(["otp-sent", "otp-already-sent"]).optional(),
  message: z.string().optional(),
});

type SendOtpResponse = z.infer<typeof sendOtpResponseSchema>;

const actionName = sendOTP.name;
/**
 * Generates and sends a one-time password (OTP) to the user
 *
 * @returns {Promise<SendOtpResponse>} The OTP sending result
 *
 * @description
 * This function handles the OTP sending process by:
 * 1. Reading the temporary identification cookie
 * 2. Validating the user's identification method (email or phone)
 * 3. For phone method:
 *    - Sends OTP via Twilio SMS
 * 4. For email method:
 *    - Checks for existing valid OTP
 *    - Generates new OTP if needed
 *    - Stores OTP in database
 *    - Sends OTP via Resend email
 * 5. Returns appropriate status
 *
 * Error Handling:
 * - Returns error response if:
 *   - No user identification found
 *   - Database operation fails
 *   - OTP sending fails
 */
export async function sendOTP(): Promise<SendOtpResponse> {
  try {
    // Read user identification from cookie
    const userIdData = await readTempIdCookie();

    if (!userIdData || !userIdData.identifier || !userIdData.method) {
      return sendOtpResponseSchema.parse({
        success: false,
        message:
          "User identification not found. Please start the registration process again.",
      });
    }

    const { identifier, method } = userIdData;

    if (method === "phone") {
      await sendTwilioOTP({ channel: "sms", to: identifier, locale: "en" });
    }

    if (method === "email") {
      const user = await prisma.user.findFirst({
        where: {
          [method]: {
            not: null,
            equals: identifier,
          },
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
        },
      });

      if (!user) {
        return sendOtpResponseSchema.parse({
          success: false,
          message: "User not found",
        });
      }

      const availableOTP = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          method: method,
          identifier: identifier,
          expiresAt: {
            gt: new Date(),
          },
          session: null, // This replaces the notExists check
        },
      });

      if (availableOTP) {
        return sendOtpResponseSchema.parse({
          success: true,
          status: "otp-already-sent",
        });
      }

      const { code, expiresAt } = generateSecureOtp({
        length: 6,
        type: "numeric",
        expiresInMinutes: 2,
      });

      await prisma.otp.create({
        data: {
          userId: user.id,
          method,
          identifier,
          code,
          expiresAt,
        },
      });

      await sendResendEmailOTP({ code, email: identifier });
    }

    return sendOtpResponseSchema.parse({
      success: true,
      status: "otp-sent",
    });
  } catch (error) {
    await handleError(error, {
      actionName,
      severity: "warning",
      logToConsole: true,
      metadata: {
        cookies: (await cookies()).getAll().toString(),
      },
    });
    return sendOtpResponseSchema.parse({
      success: false,
      message: "An unknown error occurred.",
    });
  }
}
