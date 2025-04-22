import crypto from "crypto";
import { z } from "zod";

// Define the schema for OTP options
const otpOptionsSchema = z.object({
  length: z.number().int().min(4).max(32).default(6),
  type: z.enum(["numeric", "alphanumeric", "alphabetic"]).default("numeric"),
  expiresInMinutes: z.number().int().min(1).max(1440).default(10), // Max 24 hours
});

// Infer the type from the schema
type OtpOptions = z.infer<typeof otpOptionsSchema>;

/**
 * Generates a cryptographically secure OTP with configurable options
 *
 * @param {OtpOptions} [options] - Configuration options for the OTP
 * @param {number} [options.length=6] - Length of the OTP code (4-32 characters)
 * @param {"numeric" | "alphanumeric" | "alphabetic"} [options.type="numeric"] - Type of characters to include
 * @param {number} [options.expiresInMinutes=10] - How long the OTP is valid in minutes (1-1440)
 *
 * @returns {{
 *   code: string;
 *   expiresAt: Date;
 * }} An object containing:
 *   - code: string - The generated OTP code
 *   - expiresAt: Date - The expiration date/time of the OTP
 *
 * @throws {z.ZodError} If the options are invalid
 *
 * @example
 * ```ts
 * // Generate a 6-digit numeric OTP valid for 10 minutes
 * const { code, expiresAt } = generateSecureOtp();
 *
 * // Generate an 8-character alphanumeric OTP valid for 5 minutes
 * const { code, expiresAt } = generateSecureOtp({
 *   length: 8,
 *   type: "alphanumeric",
 *   expiresInMinutes: 5
 * });
 * ```
 */
export function generateSecureOtp(options: Partial<OtpOptions> = {}) {
  // Validate and parse the options
  const validatedOptions = otpOptionsSchema.parse(options);
  const { length, type, expiresInMinutes } = validatedOptions;

  // Define character sets
  const charSets = {
    numeric: "0123456789",
    alphabetic: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    alphanumeric:
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  };

  const charset = charSets[type];

  // Generate secure random bytes
  const randomBytes = crypto.randomBytes(length);

  // Convert random bytes to characters from our charset
  let otp = "";
  for (let i = 0; i < length; i++) {
    // Use modulo to map the byte to a character in our charset
    const randomIndex = randomBytes[i] % charset.length;
    otp += charset[randomIndex];
  }

  // Calculate expiration time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

  return {
    code: otp,
    expiresAt,
  };
}

/**
 * Generates a numeric OTP with specified length and expiration time
 *
 * @param {number} [length=6] - Length of the OTP code (4-32 characters)
 * @param {number} [expiresInMinutes=10] - How long the OTP is valid in minutes (1-1440)
 *
 * @returns {{
 *   code: string;
 *   expiresAt: Date;
 * }} An object containing:
 *   - code: string - The generated numeric OTP code
 *   - expiresAt: Date - The expiration date/time of the OTP
 *
 * @throws {z.ZodError} If the length or expiresInMinutes are invalid
 *
 * @example
 * ```ts
 * // Generate a 6-digit numeric OTP valid for 10 minutes
 * const { code, expiresAt } = generateNumericOtp();
 *
 * // Generate a 4-digit numeric OTP valid for 5 minutes
 * const { code, expiresAt } = generateNumericOtp(4, 5);
 * ```
 */
export function generateNumericOtp(length = 6, expiresInMinutes = 10) {
  return generateSecureOtp({
    length,
    type: "numeric",
    expiresInMinutes,
  });
}
