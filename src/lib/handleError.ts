"use server";

import { logError } from "../actions/error-logger";
import { z } from "zod";

// Define the schema for error severity
const errorSeveritySchema = z.enum(["critical", "error", "warning", "info"]);

// Define the schema for error metadata
const errorMetadataSchema = z.record(
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.undefined(),
    z.record(z.any()),
    z.array(
      z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()])
    ),
  ])
);

// Define the schema for error handling options
const errorHandlingOptionsSchema = z.object({
  actionName: z.string().min(1, "Action name is required"),
  route: z.string().optional(),
  severity: errorSeveritySchema.default("error"),
  logToConsole: z.boolean().default(true),
  metadata: errorMetadataSchema.default({}),
});

// Infer types from schemas
export type ErrorSeverity = z.infer<typeof errorSeveritySchema>;
export type ErrorMetadata = z.infer<typeof errorMetadataSchema>;
export type ErrorHandlingOptions = z.infer<typeof errorHandlingOptionsSchema>;

/**
 * Handles and logs errors in a standardized way
 *
 * @param {unknown} error - The error to handle
 * @param {ErrorHandlingOptions} options - Error handling options
 * @returns {Promise<string>} A standardized error message
 *
 * @throws {z.ZodError} If the options are invalid
 *
 * @example
 * ```ts
 * try {
 *   // Some code that might throw
 * } catch (error) {
 *   const message = await handleError(error, {
 *     actionName: "createUser",
 *     severity: "error",
 *     metadata: {
 *       userId: "123",
 *       attempt: 1
 *     }
 *   });
 *   return {success: false, error: message};
 * }
 * ```
 */
export async function handleError(
  error: unknown,
  options: ErrorHandlingOptions
): Promise<string> {
  // Validate and parse the options
  const validatedOptions = errorHandlingOptionsSchema.parse(options);
  const { actionName, severity, logToConsole, metadata } = validatedOptions;

  // Log to console if enabled
  if (logToConsole) {
    console.error(`Error in ${actionName}:`, error);
  }

  // Log to database
  await logError({
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: "server-action",
    severity,
    metadata: {
      actionName,
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  });

  // Return a standardized error message
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}
