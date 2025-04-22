import { Resend } from "resend";

// Resend configuration
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

/**
 * Validates that all required Resend configuration is present
 */
export function validateResendConfig() {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
