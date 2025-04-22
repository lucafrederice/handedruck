// Twilio configuration
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
export const TWILIO_VERIFY_SERVICE_SID =
  process.env.TWILIO_VERIFY_SERVICE_SID || "";

/**
 * Validates that all required Twilio configuration is present
 */
export function validateTwilioConfig() {
  if (!TWILIO_ACCOUNT_SID)
    throw new Error("TWILIO_ACCOUNT_SID is not configured");
  if (!TWILIO_AUTH_TOKEN)
    throw new Error("TWILIO_AUTH_TOKEN is not configured");
  if (!TWILIO_VERIFY_SERVICE_SID)
    throw new Error("TWILIO_VERIFY_SERVICE_SID is not configured");
}
