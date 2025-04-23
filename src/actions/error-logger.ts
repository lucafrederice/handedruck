"use server";

import { cookies, headers } from "next/headers";
import { getCurrentUser } from "./auth/getCurrentUser";
import { z } from "zod";
import { prisma } from "../db/prisma";
import type { JsonValue } from "@prisma/client/runtime/library";

/**
 * Schema for validating error severity levels
 */
const errorSeveritySchema = z.enum(["critical", "error", "warning", "info"]);

/**
 * Schema for validating HTTP methods
 */
const httpMethodSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
  "UNKNOWN",
]);

/**
 * Schema for validating error metadata
 * This matches Prisma's JsonValue type
 */
const errorMetadataSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(errorMetadataSchema),
    z.record(errorMetadataSchema),
  ])
);

/**
 * Schema for validating error log input
 */
const errorLogInputSchema = z.object({
  message: z.string(),
  name: z.string().optional(),
  stack: z.string().optional(),
  code: z.string().optional(),
  type: z.string().optional(),
  severity: errorSeveritySchema.optional(),
  url: z.string().optional(),
  route: z.string().optional(),
  metadata: errorMetadataSchema.optional(),
});

/**
 * Schema for validating error log response
 */
const errorLogResponseSchema = z.object({
  success: z.boolean(),
  errorId: z.number().optional(),
});

/**
 * Schema for validating error resolution input
 */
const errorResolutionSchema = z.object({
  errorId: z.number(),
  resolution: z.string().optional(),
});

/**
 * Schema for validating error resolution response
 */
const errorResolutionResponseSchema = z.object({
  success: z.boolean(),
});

/**
 * Schema for validating error filter options
 */
const errorFilterOptionsSchema = z.object({
  severity: errorSeveritySchema.optional(),
  resolved: z.boolean().optional(),
  limit: z.number().min(1).max(1000).optional(),
});

type ErrorLogInput = z.infer<typeof errorLogInputSchema>;
type ErrorLogResponse = z.infer<typeof errorLogResponseSchema>;
type ErrorResolutionInput = z.infer<typeof errorResolutionSchema>;
type ErrorResolutionResponse = z.infer<typeof errorResolutionResponseSchema>;
type ErrorFilterOptions = z.infer<typeof errorFilterOptionsSchema>;

/**
 * Logs an error to the database in production, or to console in development
 *
 * @param {ErrorLogInput} error - The error details to log
 * @returns {Promise<ErrorLogResponse>} Result of the logging operation
 * @throws {z.ZodError} If the input validation fails
 */
export async function logError(
  error: ErrorLogInput
): Promise<ErrorLogResponse> {
  // Validate input
  const validatedError = errorLogInputSchema.parse(error);

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === "production";

  // In development, just log to console and return
  if (!isProduction) {
    console.info("[DEV] Error logged (not saved to database):", {
      ...validatedError,
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  }

  // Production logging logic
  try {
    // Get current user if available
    const user = await getCurrentUser();

    // Get request information
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      undefined;
    const methodHeader = headersList.get("x-http-method");

    // Validate method
    const method = httpMethodSchema.parse(
      methodHeader &&
        ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"].includes(
          methodHeader
        )
        ? methodHeader
        : "UNKNOWN"
    );

    // Get session if available
    const sessionToken = (await cookies()).get("session_token")?.value;
    let sessionId: number | undefined = undefined;

    // If we have a session token, try to find the session ID
    if (sessionToken && user) {
      const session = await prisma.session.findFirst({
        where: {
          jwtToken: sessionToken,
          userId: user.id,
          forceDeactivation: false,
        },
        select: {
          id: true,
        },
      });

      if (session) {
        sessionId = session.id;
      }
    }

    // Insert error into database
    const result = await prisma.errorLog.create({
      data: {
        message: validatedError.message,
        name: validatedError.name,
        stack: validatedError.stack,
        code: validatedError.code,
        type: validatedError.type,
        severity: validatedError.severity || "error",
        userId: user?.id,
        sessionId,
        url: validatedError.url,
        method,
        route: validatedError.route,
        userAgent,
        ipAddress,
        // metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return errorLogResponseSchema.parse({
      success: true,
      errorId: result.id,
    });
  } catch (error) {
    // Fallback to console if we can't log to database
    console.error("Failed to log error to database:", error);
    console.error("Original error:", validatedError);

    return errorLogResponseSchema.parse({
      success: false,
    });
  }
}

/**
 * Marks an error as resolved
 *
 * @param {ErrorResolutionInput} input - The error ID and optional resolution notes
 * @returns {Promise<ErrorResolutionResponse>} Result of the resolution operation
 * @throws {z.ZodError} If the input validation fails
 */
export async function resolveError(
  input: ErrorResolutionInput
): Promise<ErrorResolutionResponse> {
  const { errorId, resolution } = errorResolutionSchema.parse(input);

  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResolutionResponseSchema.parse({ success: false });
    }

    await prisma.errorLog.update({
      where: {
        id: errorId,
      },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: user.id,
        resolution: resolution,
        updatedAt: new Date(),
      },
    });

    return errorResolutionResponseSchema.parse({ success: true });
  } catch (error) {
    console.error("Failed to resolve error:", error);
    return errorResolutionResponseSchema.parse({ success: false });
  }
}

/**
 * Gets a list of errors with optional filtering
 *
 * @param {ErrorFilterOptions} options - Optional filter options
 * @returns {Promise<Array<ErrorLog>>} List of errors
 */
export async function getErrors(options?: ErrorFilterOptions) {
  const validatedOptions = options
    ? errorFilterOptionsSchema.parse(options)
    : undefined;

  try {
    const errors = await prisma.errorLog.findMany({
      where: {
        severity: validatedOptions?.severity,
        isResolved: validatedOptions?.resolved,
      },
      select: {
        id: true,
        message: true,
        severity: true,
        isResolved: true,
        createdAt: true,
      },
      take: validatedOptions?.limit || 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return errors;
  } catch (error) {
    console.error("Failed to fetch errors:", error);
    return [];
  }
}
