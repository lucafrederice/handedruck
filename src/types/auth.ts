import { ReactNode } from "react";
import { z } from "zod";

// Define schemas for validation
export const authStateSchema = z.boolean();

export const layoutPropsSchema = z.object({
  children: z.custom<ReactNode>(),
});

// Infer types from schemas
export type AuthState = z.infer<typeof authStateSchema>;
export type LayoutProps = z.infer<typeof layoutPropsSchema>;
