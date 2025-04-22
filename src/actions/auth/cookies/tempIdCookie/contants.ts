import { z } from "zod";

/**
 * Schema for validating temporary ID cookie payload
 */
export const tempIdPayloadSchema = z.object({
  identifier: z.string().min(1),
  method: z.enum(["phone", "email"]),
});

export const TEMP_ID_COOKIE_NAME = "temp_user_id";
