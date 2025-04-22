"use server";

import { SignJWT } from "jose";
import { TEMP_ID_SECRET } from "../../constants";
import { cookies } from "next/headers";
import { tempIdPayloadSchema } from "./contants";

/**
 * Creates a temporary identification cookie for the user during registration/login flow
 *
 * @param {string} identifier - The user's email or phone number
 * @param {"phone" | "email"} method - The identification method used
 * @returns {Promise<string>} The JWT token stored in the cookie
 *
 * @description
 * This function creates a short-lived JWT token containing the user's identifier
 * and authentication method, then stores it in an HTTP-only cookie.
 *
 * Steps:
 * 1. Create an expiration date 30 minutes from now
 * 2. Generate a JWT token with the identifier and method
 * 3. Set the token in an HTTP-only cookie
 * 4. Return the token
 *
 * Error Handling:
 * - Throws an error if:
 *   - Invalid identifier or method is provided
 *   - JWT signing fails
 *   - Cookie setting fails
 */
export async function createTempIdCookie(
  identifier: string,
  method: "phone" | "email"
): Promise<string> {
  // Validate input parameters
  tempIdPayloadSchema.parse({ identifier, method });

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiration

  const token = await new SignJWT({
    identifier,
    method,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(TEMP_ID_SECRET);

  (await cookies()).set("temp_user_id", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
    sameSite: "lax",
  });

  return token;
}
