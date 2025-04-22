import { checkAuth } from "@/actions/auth/checkAuth";
import { ReactNode } from "react";
import { AUTH_REGISTER_PATH } from "../auth/register/path";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
}

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
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) redirect(AUTH_REGISTER_PATH);

  return <>{children}</>;
}
