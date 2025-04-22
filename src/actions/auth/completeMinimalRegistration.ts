"use server";

import { readTempIdCookie } from "./cookies/tempIdCookie/readTempIdCookie";
import { REGISTRATION_STATUS, registrationStatusSchema } from "./constants";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { cookies } from "next/headers";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating the registration completion input
 */
const completeRegistrationInputSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
});

/**
 * Schema for validating the registration completion response
 */
const completeRegistrationResponseSchema = z.object({
  success: z.boolean(),
  status: registrationStatusSchema.optional(),
  message: z.string().optional(),
});

type CompleteRegistrationInput = z.infer<
  typeof completeRegistrationInputSchema
>;
type CompleteRegistrationResponse = z.infer<
  typeof completeRegistrationResponseSchema
>;

const actionName = completeMinimalRegistration.name;

/**
 * Completes the user registration by adding first and last name
 *
 * @param {CompleteRegistrationInput} params - The registration completion parameters
 * @param {string} params.firstName - The user's first name (1-50 characters)
 * @param {string} params.lastName - The user's last name (1-50 characters)
 * @returns {Promise<CompleteRegistrationResponse>} The registration completion result
 *
 * @description
 * This function completes the user registration by:
 * 1. Validating the input parameters
 * 2. Reading the temporary identification cookie
 * 3. Updating the user record with first and last name
 * 4. Returning the registration status
 *
 * Error Handling:
 * - Returns error response if:
 *   - Input validation fails
 *   - No user identification found
 *   - Database operation fails
 *   - Any other error occurs
 */
export async function completeMinimalRegistration({
  firstName,
  lastName,
}: CompleteRegistrationInput): Promise<CompleteRegistrationResponse> {
  try {
    // Validate input
    const { firstName: validatedFirstName, lastName: validatedLastName } =
      completeRegistrationInputSchema.parse({ firstName, lastName });

    // Read user identification from cookie
    const userIdData = await readTempIdCookie();

    if (!userIdData || !userIdData.method || !userIdData.identifier) {
      return completeRegistrationResponseSchema.parse({
        success: false,
        message:
          "User identification not found. Please start the registration process again.",
      });
    }

    const { identifier, method } = userIdData;

    // Update user record using Prisma
    await prisma.user.updateMany({
      where: {
        [method]: {
          not: null,
          equals: identifier,
        },
      },
      data: {
        firstName: validatedFirstName,
        lastName: validatedLastName,
        updatedAt: new Date(),
      },
    });

    return completeRegistrationResponseSchema.parse({
      success: true,
      status: REGISTRATION_STATUS.MINIMAL_REGISTRATION_COMPLETED,
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
    return completeRegistrationResponseSchema.parse({
      success: false,
      message: "An unknown error occurred.",
    });
  }
}
