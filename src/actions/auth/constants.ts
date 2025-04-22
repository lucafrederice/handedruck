import { z } from "zod";

/**
 * Secret key for the temporary identification cookie
 * This should be different from your main JWT secret
 */
export const TEMP_ID_SECRET = new TextEncoder().encode(
  process.env.TEMP_ID_SECRET || "temp-id-secret-key-at-least-32-characters"
);

/**
 * JWT secret key for the main authentication
 */
export const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters"
);

/**
 * Schema for validating registration status
 */
export const registrationStatusSchema = z.enum([
  "unregistered",
  "minimal-registration-incompleted",
  "minimal-registration-completed",
]);

/**
 * Enum representing possible registration statuses
 */
export enum REGISTRATION_STATUS {
  UNREGISTERED = "unregistered",
  MINIMAL_REGISTRATION_INCOMPLETED = "minimal-registration-incompleted",
  MINIMAL_REGISTRATION_COMPLETED = "minimal-registration-completed",
}

/**
 * Type representing valid registration status strings
 */
export type REGISTRATION_TYPES = z.infer<typeof registrationStatusSchema>;

/**
 * Schema for validating authentication methods
 */
export const authMethodSchema = z.enum(["phone", "email"]);

/**
 * Array of valid authentication methods
 */
export const authMethods = ["phone", "email"] as const;

/**
 * Type representing valid authentication methods
 */
export type AuthMethod = z.infer<typeof authMethodSchema>;

/**
 * Object mapping authentication methods to themselves
 * Used for type-safe method references
 */
export const authMethod = authMethods.reduce<Record<AuthMethod, AuthMethod>>(
  (acc, cur) => {
    acc[cur] = cur;
    return acc;
  },
  {} as Record<AuthMethod, AuthMethod>
);
