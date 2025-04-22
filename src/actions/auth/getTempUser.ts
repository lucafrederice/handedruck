import { handleError } from "@/lib/handleError";
import { readTempIdCookie } from "./cookies/tempIdCookie/readTempIdCookie";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating the temporary user data
 */
const tempUserSchema = z.object({
  id: z.number(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type TempUser = z.infer<typeof tempUserSchema>;

const actionName = getTempUser.name;

/**
 * Retrieves the temporary user based on the temporary identification cookie
 *
 * @returns {Promise<TempUser | null>} The temporary user object or null if not found
 *
 * @description
 * This function:
 * 1. Reads the temporary identification cookie
 * 2. If cookie exists, retrieves the user from the database
 * 3. Returns the user if found, null otherwise
 *
 * Error Handling:
 * - Returns null if:
 *   - No temporary identification cookie exists
 *   - User not found in database
 *   - Any error occurs during the process
 * - Logs errors with appropriate metadata
 */
export async function getTempUser(): Promise<TempUser | null> {
  try {
    const tempIdCookieInfo = await readTempIdCookie();
    if (!tempIdCookieInfo) return null;

    const { identifier, method } = tempIdCookieInfo;

    const user = await prisma.user.findFirst({
      where: {
        [method]: identifier,
      },
    });

    if (!user) return null;

    return tempUserSchema.parse(user);
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
