import { checkAuth } from "@/actions/auth/checkAuth";
import { ReactNode } from "react";
import { AUTH_REGISTER_PATH } from "../auth/register/page";
import { redirect } from "next/navigation";
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
 * Dashboard layout component that checks authentication and redirects if not authenticated.
 *
 * @component
 * @param {LayoutProps} props - The props for the layout component
 * @returns {Promise<ReactNode>} The rendered layout
 *
 * @example
 * ```tsx
 * <Layout>
 *   <DashboardContent />
 * </Layout>
 * ```
 */
export default async function Layout({ children }: LayoutProps) {
  // Validate authentication state
  const isAuthenticated = authStateSchema.parse(await checkAuth());

  if (!isAuthenticated) redirect(AUTH_REGISTER_PATH);

  return <>{children}</>;
}
