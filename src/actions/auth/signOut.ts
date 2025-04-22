"use server";

import { cookies } from "next/headers";
import { getCurrentUser } from "./getCurrentUser";
import { clearSessionCookie } from "./cookies/sessionCookie/clearSessionCookie";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating the sign-out response
 */
const signOutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type SignOutResponse = z.infer<typeof signOutResponseSchema>;

const actionName = signOut.name;

/**
 * Signs out the current user by deactivating their session and clearing the session cookie
 *
 * @returns {Promise<SignOutResponse>} The sign-out result with success status and message
 *
 * @description
 * This function handles the user sign-out process by:
 * 1. Getting the current user from the session
 * 2. If no user is found, returns an error response
 * 3. Retrieving the session token from cookies
 * 4. If a token exists:
 *    - Updates the session in the database to mark it as deactivated
 *    - Logs the sign-out event for security auditing
 * 5. Clears the session cookie
 * 6. Returns a success response
 *
 * Error Handling:
 * - If any error occurs during the process, it:
 *   - Logs the error
 *   - Returns a failure response with an error message
 */
export async function signOut(): Promise<SignOutResponse> {
  try {
    // Read user identification from cookie
    const user = await getCurrentUser();
    if (!user) {
      return signOutResponseSchema.parse({
        success: false,
        message: "No user to be signed out.",
      });
    }

    // Get the session token from cookies
    const sessionToken = (await cookies()).get("session_token")?.value;

    if (sessionToken) {
      // Find the session by JWT token and update it
      await prisma.session.updateMany({
        where: {
          jwtToken: sessionToken,
        },
        data: {
          forceDeactivation: true,
          updatedAt: new Date(),
        },
      });

      // Log the sign-out event for security auditing
      console.log(`User ${user.id} signed out at ${new Date().toISOString()}`);
    }

    // Clear the session cookie
    clearSessionCookie();

    return signOutResponseSchema.parse({
      success: true,
      message: "User signed out successfully.",
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
    return signOutResponseSchema.parse({
      success: false,
      message: "An unknown error occurred.",
    });
  }
}
