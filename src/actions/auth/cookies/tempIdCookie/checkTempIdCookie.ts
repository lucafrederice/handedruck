"use server";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { TEMP_ID_SECRET } from "../../constants";
import { tempIdPayloadSchema } from "./contants";
import { handleError } from "@/lib/handleError";
const actionName = checkTempIdCookie.name;

/**
 * Checks if a temporary identification cookie exists and is valid
 *
 * @returns {Promise<boolean>} True if the cookie exists and is valid, false otherwise
 *
 * @description
 * This function checks if the temporary identification cookie exists and contains
 * a valid JWT token with proper signature and expiration.
 *
 * Steps:
 * 1. Get the temp_user_id cookie from the request
 * 2. Verify the JWT token signature and expiration
 * 3. Validate the payload structure
 * 4. Return true if all checks pass, false otherwise
 */
export async function checkTempIdCookie(): Promise<boolean> {
  const token = (await cookies()).get("temp_user_id")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, TEMP_ID_SECRET);
    tempIdPayloadSchema.parse(payload);
    return true;
  } catch (error) {
    await handleError(error, {
      actionName,
      severity: "warning",
      logToConsole: true,
      metadata: {
        cookies: (await cookies()).getAll().toString(),
      },
    });
    return false;
  }
}
