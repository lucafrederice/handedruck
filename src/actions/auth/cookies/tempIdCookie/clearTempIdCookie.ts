"use server";

import { cookies } from "next/headers";

/**
 * Clears the temporary identification cookie
 *
 * @returns {Promise<void>}
 *
 * @description
 * This function deletes the temporary identification cookie from the client.
 * No validation or error handling is needed as this is a simple cookie deletion operation.
 */
export async function clearTempIdCookie(): Promise<void> {
  (await cookies()).delete("temp_user_id");
}
