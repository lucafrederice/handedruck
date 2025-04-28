"use server";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWT_SECRET } from "./constants";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating the current user data
 */
const currentUserSchema = z.object({
  id: z.number(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isAgent: z.boolean(),
  isAdmin: z.boolean(),
});

type CurrentUser = z.infer<typeof currentUserSchema>;

const actionName = getCurrentUser.name;

/**
 * Gets the currently authenticated user
 *
 * @returns {Promise<CurrentUser | null>} The user object if authenticated, null otherwise
 *
 * @description
 * This function handles user authentication by:
 * 1. Retrieving the session token from cookies
 * 2. Verifying the JWT token signature and expiration
 * 3. Checking session validity in the database
 * 4. Updating session activity timestamp
 * 5. Retrieving and validating user data
 *
 * Error Handling:
 * - Returns null if:
 *   - No session token exists
 *   - JWT verification fails
 *   - Session is invalid or expired
 *   - User not found
 *   - Any error occurs during the process
 * - Logs errors with appropriate metadata
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const sessionToken = (await cookies()).get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Verify JWT signature and expiration
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
    const userId = Number(payload.sub);

    // Check if the session exists and is not forcibly deactivated
    const session = await prisma.session.findFirst({
      where: {
        jwtToken: sessionToken,
        forceDeactivation: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // If no valid session found, return null
    if (!session) {
      return null;
    }

    // Update lastActive timestamp for the session
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        lastActive: new Date(),
        updatedAt: new Date(),
      },
    });

    // Get the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) return null;
    return currentUserSchema.parse(user);
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
