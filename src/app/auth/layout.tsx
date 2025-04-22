import { checkAuth } from "@/actions/auth/checkAuth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { DASHBOARD_PATH } from "../dashboard/page";

/**
 * Authentication layout component that checks authentication and redirects to dashboard if authenticated.
 * This layout is used for authentication-related pages like login and register.
 *
 * @component
 * @param {object} props - The props for the layout component
 * @param {ReactNode} props.children - The child components to render
 * @returns {Promise<ReactNode>} The rendered layout
 *
 * @example
 * ```tsx
 * <Layout>
 *   <LoginForm />
 * </Layout>
 * ```
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) redirect(DASHBOARD_PATH);

  return <>{children}</>;
}
