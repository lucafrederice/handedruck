"use server";

import { JWT_SECRET } from "./constants";
import { cookies, headers } from "next/headers";
import { clearTempIdCookie } from "./cookies/tempIdCookie/clearTempIdCookie";
import { readTempIdCookie } from "./cookies/tempIdCookie/readTempIdCookie";
import { verifyTwilioOTP } from "@/twillio/verifyTwilioOTP";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { prisma } from "../../db/prisma";
import { SignJWT } from "jose";

/**
 * Schema for validating the OTP verification input
 */
const verifyOtpInputSchema = z.object({
  code: z
    .string()
    .min(4)
    .max(8)
    .regex(/^\d+$/, "OTP code must contain only digits"),
});

/**
 * Schema for validating the OTP verification response
 */
const verifyOtpResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  session: z
    .object({
      id: z.number(),
      expiresAt: z.date(),
    })
    .optional(),
  user: z
    .object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
});

type VerifyOtpInput = z.infer<typeof verifyOtpInputSchema>;
type VerifyOtpResponse = z.infer<typeof verifyOtpResponseSchema>;

const actionName = verifyOTP.name;
/**
 * Verifies a one-time password (OTP) and creates a session
 *
 * @param {VerifyOtpInput} params - The verification parameters
 * @param {string} params.code - The OTP code to verify (4-8 digits)
 * @returns {Promise<VerifyOtpResponse>} The verification result
 * @throws {z.ZodError} If the input validation fails
 *
 * @description
 * This function verifies an OTP, creates a session for the user, and sets a session cookie.
 * It handles both email and phone verification methods.
 *
 * Steps:
 * 1. Validates the input OTP code
 * 2. Reads the temporary identification cookie to get the user's identifier
 * 3. Finds the user in the database
 * 4. For email method:
 *    - Finds and validates the OTP in the database
 *    - Checks if OTP has already been used
 * 5. For phone method:
 *    - Verifies the OTP with Twilio
 * 6. Creates a JWT token for the session
 * 7. Creates a session record in the database
 * 8. Sets the session cookie
 * 9. Clears the temporary identification cookie
 * 10. Returns success with session and user information
 */
export async function verifyOTP({
  code,
}: VerifyOtpInput): Promise<VerifyOtpResponse> {
  try {
    // Validate input
    const { code: validatedCode } = verifyOtpInputSchema.parse({ code });

    // Read user identification from cookie
    const userIdData = await readTempIdCookie();

    if (!userIdData || !userIdData.identifier || !userIdData.method) {
      return verifyOtpResponseSchema.parse({
        success: false,
        message:
          "User identification not found. Please start the registration process again.",
      });
    }

    const { identifier, method } = userIdData;

    const user = await prisma.user.findFirst({
      where: {
        [method]: {
          not: null,
          equals: identifier,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return verifyOtpResponseSchema.parse({
        success: false,
        message: "User not found",
      });
    }

    let otpId;

    if (method === "email") {
      const otp = await prisma.otp.findFirst({
        where: {
          userId: user.id,
          method: method,
          identifier: identifier,
          code: validatedCode,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!otp) {
        return verifyOtpResponseSchema.parse({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      otpId = otp.id;

      // Check if OTP has already been used (by checking if it has a session)
      const existingSession = await prisma.session.findFirst({
        where: {
          otpId: otp.id,
        },
      });

      if (existingSession) {
        return verifyOtpResponseSchema.parse({
          success: false,
          message: "OTP has already been used",
        });
      }
    }

    if (method === "phone") {
      const res = await verifyTwilioOTP({
        code: validatedCode,
        to: identifier,
      });

      if (!res.success) {
        return verifyOtpResponseSchema.parse({
          success: false,
          message: res.message,
        });
      }
    }

    // Create JWT token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const jwtToken = await new SignJWT({
      sub: user.id.toString(),
      name: `${user.firstName} ${user.lastName}`,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Get request info
    const headersList = await headers();
    const userAgent = headersList.get("user-agent");
    const ipAddress =
      headersList.get("x-forwarded-for") || headersList.get("x-real-ip");

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        otpId: otpId,
        jwtToken,
        expiresAt,
        userAgent: userAgent || undefined,
        ipAddress: ipAddress || undefined,
        deviceInfo: JSON.stringify({
          userAgent,
          ip: ipAddress,
          timestamp: new Date().toISOString(),
        }),
        lastActive: new Date(),
      },
    });

    // Set session cookie
    (await cookies()).set("session_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
    });

    // Clear the temporary identification cookie now that we have a real session
    clearTempIdCookie();

    return verifyOtpResponseSchema.parse({
      success: true,
      message: "OTP verified successfully",
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
      user: {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
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

    return verifyOtpResponseSchema.parse({
      success: false,
      message: "An unknown error occurred.",
    });
  }
}
