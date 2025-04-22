"use server";

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JWT_SECRET } from "./constants";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating JWT payload
 */
const jwtPayloadSchema = z.object({
  sub: z.string().transform((val) => Number(val)),
  name: z.string().optional(),
  jti: z.string().optional(),
});

const actionName = checkAuth.name;

/**
 * Checks if the current user is authenticated
 *
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 *
 * @description
 * This function verifies user authentication by:
 * 1. Checking for a valid session token in cookies
 * 2. Verifying the JWT token signature and expiration
 * 3. Validating the session in the database
 * 4. Updating the session's last active timestamp
 *
 * Error Handling:
 * - Returns false if:
 *   - No session token exists
 *   - JWT verification fails
 *   - Session is invalid or expired
 *   - Session is forcibly deactivated
 *   - Any error occurs during the process
 * - Logs errors with appropriate metadata
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const sessionToken = (await cookies()).get("session_token")?.value;

    if (!sessionToken) return false;

    // Verify JWT signature and expiration
    const { payload } = await jwtVerify(sessionToken, JWT_SECRET);

    if (!payload) return false;

    // Validate and transform JWT payload
    const { sub: userId } = jwtPayloadSchema.parse(payload);

    // Check if the session exists and is not forcibly deactivated
    const session = await prisma.session.findFirst({
      where: {
        jwtToken: sessionToken,
        forceDeactivation: false,
        userId: userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // If no valid session found, return false
    if (!session) {
      return false;
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
