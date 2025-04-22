import { checkAuth } from "@/actions/auth/checkAuth";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AUTH_REGISTER_PATH } from "@/app/auth/register/path";
import { DASHBOARD_PATH } from "@/app/dashboard/path";
import { checkUserType } from "@/actions/checkUserType";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { Navbar } from "./components/Navbar";

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

  // Check if user is an agent
  const user = await getCurrentUser();
  if (!user) redirect(AUTH_REGISTER_PATH);

  const { success, userTypes, error } = await checkUserType(user.id);
  console.log("error", error);

  console.log("userTypes", userTypes);
  if (!success || !userTypes) redirect(DASHBOARD_PATH);

  // Redirect if user is not an agent
  if (!userTypes.includes("agent")) redirect(DASHBOARD_PATH);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <Navbar />
        </div>
      </header>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
