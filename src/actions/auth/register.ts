"use server";

import { createTempIdCookie } from "./cookies/tempIdCookie/createTempIdCookie";
import { authMethods, REGISTRATION_STATUS } from "./constants";
import { z } from "zod";
import { handleError } from "@/lib/handleError";
import { cookies } from "next/headers";
import { prisma } from "../../db/prisma";

/**
 * Schema for validating registration input
 */
const registerSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  method: z.enum(authMethods, {
    errorMap: () => ({ message: "Method must be either 'phone' or 'email'" }),
  }),
});

/**
 * Schema for validating registration response
 */
const registerResponseSchema = z.object({
  success: z.boolean(),
  status: z
    .enum([
      REGISTRATION_STATUS.MINIMAL_REGISTRATION_INCOMPLETED,
      REGISTRATION_STATUS.MINIMAL_REGISTRATION_COMPLETED,
    ])
    .optional(),
  message: z.string().optional(),
});

type RegisterInput = z.infer<typeof registerSchema>;
type RegisterResponse = z.infer<typeof registerResponseSchema>;

/**
 * Validates email format using Zod
 *
 * @param {string} email - The email to validate
 * @returns {boolean} Whether the email is valid
 */
function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

/**
 * Validates phone number format using Zod
 *
 * @param {string} phone - The phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
function isValidPhone(phone: string): boolean {
  return z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format")
    .safeParse(phone).success;
}

/**
 * Formats validation errors into a string message
 *
 * @param {z.ZodError} error - The Zod validation error
 * @returns {string} Formatted error message
 */
function formatValidationError(error: z.ZodError): string {
  const flatErrors = error.flatten();
  const fieldErrors = Object.entries(flatErrors.fieldErrors)
    .map(([key, errors]) => {
      const errorMessages = (errors as string[]) || [];
      return errorMessages.length > 0
        ? `${key}: ${errorMessages.join(", ")}`
        : "";
    })
    .filter(Boolean);
  const formErrors = flatErrors.formErrors.filter(Boolean);
  const allErrors = [...fieldErrors, ...formErrors];
  return allErrors.length > 0 ? allErrors.join("; ") : "Validation failed";
}

const actionName = register.name;
/**
 * Registers a new user or identifies an existing user
 *
 * @param {RegisterInput} input - The registration parameters
 * @returns {Promise<RegisterResponse>} The registration result
 *
 * @description
 * This function handles user registration by:
 * 1. Validating input using Zod schemas
 * 2. Performing method-specific validation (email/phone)
 * 3. Checking for existing user
 * 4. Creating temporary identification cookie
 * 5. Creating new user if not exists
 * 6. Determining registration status
 *
 * Error Handling:
 * - Returns validation errors if input is invalid
 * - Returns method-specific validation errors
 * - Returns database errors if operation fails
 */
export async function register(
  input: RegisterInput
): Promise<RegisterResponse> {
  // Validate input
  const validationResult = registerSchema.safeParse(input);

  if (!validationResult.success) {
    return registerResponseSchema.parse({
      success: false,
      message: formatValidationError(validationResult.error),
    });
  }

  const { identifier, method } = validationResult.data;

  // Additional validation based on method
  if (method === "email" && !isValidEmail(identifier)) {
    return registerResponseSchema.parse({
      success: false,
      message: "Invalid email format",
    });
  }

  if (method === "phone" && !isValidPhone(identifier)) {
    return registerResponseSchema.parse({
      success: false,
      message: "Invalid phone number format",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        [method]: {
          not: null,
          equals: identifier,
        },
      },
    });

    // Create the temporary identification cookie
    await createTempIdCookie(identifier, method);

    if (!user) {
      await prisma.user.create({
        data: {
          [method]: identifier,
        },
      });

      return registerResponseSchema.parse({
        success: true,
        status: REGISTRATION_STATUS.MINIMAL_REGISTRATION_INCOMPLETED,
      });
    }

    // User exists, check registration status
    if (!user?.firstName && !user?.lastName) {
      return registerResponseSchema.parse({
        success: true,
        status: REGISTRATION_STATUS.MINIMAL_REGISTRATION_INCOMPLETED,
      });
    } else {
      return registerResponseSchema.parse({
        success: true,
        status: REGISTRATION_STATUS.MINIMAL_REGISTRATION_COMPLETED,
      });
    }
  } catch (error) {
    await handleError(error, {
      actionName,
      severity: "warning",
      logToConsole: true,
      metadata: {
        cookies: (await cookies()).getAll().toString(),
      },
    });

    return registerResponseSchema.parse({
      success: false,
      message: "An unknown error occurred",
    });
  }
}
