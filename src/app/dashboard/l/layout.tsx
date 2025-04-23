import { checkAuth } from "@/actions/auth/checkAuth";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AUTH_REGISTER_PATH } from "@/app/auth/register/path";
import { DASHBOARD_PATH } from "@/app/dashboard/path";
import { checkUserType } from "@/actions/checkUserType";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { Navbar } from "./components/Navbar";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Users, FileText, Landmark } from "lucide-react";
import { DASH_L_PATH } from "./path";
import { DASH_L_BORROWERS_PATH } from "./borrowers/path";
import { DASH_L_LOANS_PATH } from "./loans/path";
import { DASH_L_REPORTS_PATH } from "./reports/path";

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
      <div className="fixed bottom-4 left-0 right-0 flex justify-center md:hidden">
        <FloatingDock
          items={[
            {
              title: "Dashboard",
              icon: <Home className="h-4 w-4" />,
              href: DASH_L_PATH,
            },
            {
              title: "Borrowers",
              icon: <Users className="h-4 w-4" />,
              href: DASH_L_BORROWERS_PATH,
            },
            {
              title: "Loans",
              icon: <Landmark className="h-4 w-4" />,
              href: DASH_L_LOANS_PATH,
            },
            {
              title: "Reports",
              icon: <FileText className="h-4 w-4" />,
              href: DASH_L_REPORTS_PATH,
            },
          ]}
        />
      </div>
    </div>
  );
}
