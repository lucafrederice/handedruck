"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { TEMP_ID_SECRET } from "../../constants";
import { handleError } from "@/lib/handleError";
import { tempIdPayloadSchema } from "./contants";

const actionName = readTempIdCookie.name;

/**
 * Reads and verifies the temporary identification cookie
 *
 * @returns {Promise<{identifier: string, method: "phone" | "email"} | null>} The user identification data or null
 *
 * @description
 * This function reads the temporary identification cookie, verifies its signature,
 * expiration, and payload structure, then returns the user identification data if valid.
 *
 * Steps:
 * 1. Get the temp_user_id cookie from the request
 * 2. If no cookie exists, return null
 * 3. Verify the JWT token signature and expiration
 * 4. Validate the payload structure
 * 5. Return the identifier and method from the token payload
 *
 * Error Handling:
 * - Returns null if:
 *   - No cookie exists
 *   - JWT verification fails
 *   - Payload validation fails
 * - Logs errors with appropriate metadata
 */
export async function readTempIdCookie(): Promise<{
  identifier: string;
  method: "phone" | "email";
} | null> {
  const token = (await cookies()).get("temp_user_id")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, TEMP_ID_SECRET);
    const validatedPayload = tempIdPayloadSchema.parse(payload);
    return {
      identifier: validatedPayload.identifier,
      method: validatedPayload.method,
    };
  } catch (error) {
    await handleError(error, {
      actionName,
      severity: "warning",
      logToConsole: true,
      metadata: {
        cookies: (await cookies()).getAll().toString(),
      },
    });
    return null;
  }
}
