import Link from "next/link";
import { ArrowRight, Landmark, BriefcaseBusiness } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DASH_L_PATH } from "./l/path";
import { DotBackgroundDemo } from "@/components/dottedBg";
import { getCurrentUser } from "@/effect/auth/getCurrentUser";
import { DASH_B_PATH } from "./b/path";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) return null; // the layout is checking for authentication

  // const { success, userTypes } = await checkUserType(user?.id);

  // if (!success || !userTypes) {
  //   return null; // there is an error
  // }

  // // If user is only admin, return null
  // if (userTypes.length === 1 && userTypes[0] === "admin") {
  //   return null; // should redirect to the admin dashboard
  // }

  // If user is only agent, redirect to lender dashboard
  // if (userTypes.length === 1 && userTypes[0] === "agent") {
  //   redirect(DASH_L_PATH);
  // }

  // If user is only borrower, redirect to borrower dashboard
  // if (userTypes.length === 1 && userTypes[0] === "borrower") {
  //   redirect(DASH_B_PATH);
  // }

  // If user is only customer, return null
  // if (userTypes.length === 1 && userTypes[0] === "customer") {
  // return null; // should redirect to a onboarding page to make the first borrower application
  // }

  // If user is both agent and borrower, show the UI
  return (
    <div className="min-h-screen flex justify-center p-4 max-md:mt-10">
      <DotBackgroundDemo>
        <div className="flex flex-col gap-20">
          <section className="w-full relative mx-auto text-center text-lg">
            <div>🤝</div>
            <b> Handedruck</b>
          </section>
          <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
            <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-emerald-500 group">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Lender Dashboard</CardTitle>
                  <Landmark className="h-6 w-6 text-emerald-500 transition-transform group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative text-muted-foreground">
                Manage your lending portfolio
              </CardContent>
              <CardFooter className="flex justify-start mt-auto relative">
                <Button
                  variant="link"
                  className="p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                  asChild
                >
                  <Link href={DASH_L_PATH}>
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 border-l-violet-500 group">
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Borrower Dashboard</CardTitle>
                  <BriefcaseBusiness className="h-6 w-6 text-violet-500 transition-transform group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="relative text-muted-foreground">
                Manage your loans and assets
              </CardContent>
              <CardFooter className="flex justify-start mt-auto relative">
                <Button
                  variant="link"
                  className="p-0 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                  asChild
                >
                  <Link href={DASH_B_PATH}>
                    Open Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </DotBackgroundDemo>
    </div>
  );
}
