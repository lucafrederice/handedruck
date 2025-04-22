"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Landmark, LogOut } from "lucide-react";
import cn from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth/signOut";
import { DASHBOARD_PATH } from "../../page";
import { DASH_L_BORROWERS_PATH } from "../borrowers/page";
import { DASH_L_PATH } from "../page";
import { DASH_L_LOANS_PATH } from "../loans/page";
import { DASH_L_REPORTS_PATH } from "../reports/page";
const routes = [
  {
    href: DASH_L_PATH,
    label: "Dashboard",
    icon: Home,
  },
  {
    href: DASH_L_BORROWERS_PATH,
    label: "Borrowers",
    icon: Users,
  },
  {
    href: DASH_L_LOANS_PATH,
    label: "Loans",
    icon: Landmark,
  },
  {
    href: DASH_L_REPORTS_PATH,
    label: "Reports",
    icon: FileText,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between w-full">
      <h1 className="text-2xl font-semibold">
        <Link href={DASHBOARD_PATH}>🤝 Handedruck</Link>{" "}
        <span className="text-muted-foreground">|</span>{" "}
        <small className="text-muted-foreground">Lender Dashboard</small>
      </h1>
      <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 max-md:hidden",
                pathname === route.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {route.label}
            </Link>
          );
        })}
        <Button variant="outline" size="icon" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </nav>
    </header>
  );
}
