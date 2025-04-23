import { checkAuth } from "@/actions/auth/checkAuth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./components/Navbar";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Home, Send } from "lucide-react";
import { DASH_B_PATH } from "./path";
import { DASH_B_APPLY_PATH } from "./apply/path";

/**
 * Borrower dashboard layout component that checks authentication and authorization.
 *
 * @component
 * @param {object} props - The props for the layout component
 * @param {ReactNode} props.children - The child components to render
 * @returns {Promise<ReactNode>} The rendered layout
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect("/auth/login");
  }

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
              href: DASH_B_PATH,
            },
            {
              title: "Apply",
              icon: <Send className="h-4 w-4" />,
              href: DASH_B_APPLY_PATH,
            },
          ]}
        />
      </div>
    </div>
  );
}
