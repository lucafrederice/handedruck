"use server";

import { cookies } from "next/headers";
import { sessionCookieNameSchema } from "./constants";

/**
 * Clears the session cookie
 *
 * @returns {Promise<void>}
 *
 * @description
 * This function deletes the session cookie from the client.
 * It ensures the cookie name is valid before attempting deletion.
 *
 * Steps:
 * 1. Validate the session cookie name
 * 2. Delete the session_token cookie
 *
 * Error Handling:
 * - Throws an error if:
 *   - Invalid cookie name is provided
 *   - Cookie deletion fails
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieName = sessionCookieNameSchema.parse("session_token");
  (await cookies()).delete(cookieName);
}
