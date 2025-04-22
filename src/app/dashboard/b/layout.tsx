import { checkAuth } from "@/actions/auth/checkAuth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./components/Navbar";

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
    </div>
  );
}
