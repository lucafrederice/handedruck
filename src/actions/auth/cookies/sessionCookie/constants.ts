import { z } from "zod";

/**
 * Schema for validating session cookie name
 */
export const sessionCookieNameSchema = z.literal("session_token");
