import { checkAuth } from "@/actions/auth/checkAuth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { DASHBOARD_PATH } from "../dashboard/page";
import { z } from "zod";

// Define schemas for validation
export const authStateSchema = z.boolean();

export const layoutPropsSchema = z.object({
  children: z.custom<ReactNode>(),
});

// Infer types from schemas
export type AuthState = z.infer<typeof authStateSchema>;
export type LayoutProps = z.infer<typeof layoutPropsSchema>;

/**
 * Authentication layout component that checks authentication and redirects to dashboard if authenticated.
 * This layout is used for authentication-related pages like login and register.
 *
 * @component
 * @param {LayoutProps} props - The props for the layout component
 * @returns {Promise<ReactNode>} The rendered layout
 *
 * @example
 * ```tsx
 * <Layout>
 *   <LoginForm />
 * </Layout>
 * ```
 */
export default async function Layout({ children }: LayoutProps) {
  // Validate authentication state
  const isAuthenticated = authStateSchema.parse(await checkAuth());

  if (isAuthenticated) redirect(DASHBOARD_PATH);

  return <>{children}</>;
}
