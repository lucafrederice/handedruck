import Link from "next/link";
import { getCurrentUser } from "@/actions/auth/getCurrentUser";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DotBackgroundDemo } from "../components/dottedBg";
import { UserCard } from "../components/UserCard";
import { AUTH_REGISTER_PATH } from "./auth/register/path";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-gray-50/50">
      <main className="flex-1">
        <DotBackgroundDemo>
          <div className="flex flex-col gap-20">
            <section className="w-full relative mx-auto text-center text-lg">
              <div>🤝</div>
              <b> Handedruck</b>
            </section>
            <section className="w-full relative overflow-hidden">
              <div className="absolute inset-0 -z-10 opacity-[0.02]">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
                <div className="inline-block mb-4 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  Simplified Lending Management
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-6">
                  Lending management,{" "}
                  <span className="relative">
                    simplified
                    <svg
                      className="absolute -bottom-1 left-0 w-full"
                      height="6"
                      viewBox="0 0 200 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 3C50 -1 150 -1 200 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-primary/40"
                      />
                    </svg>
                  </span>
                  .
                </h1>
                <p className="text-muted-foreground mb-10 text-lg">
                  <i>Handedruck</i> helps you manage all your lending operations
                  in one place.
                </p>
              </div>
            </section>
          </div>
        </DotBackgroundDemo>

        <section className="w-full py-16 border-t border-b border-gray-100">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            {user ? (
              <UserCard name={user.firstName || ""} />
            ) : (
              <div className="grid gap-16 md:grid-cols-2">
                <div
                  id="lenders"
                  className="space-y-6 p-6 rounded-xl transition-all duration-300 hover:bg-gray-50/80"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-medium">For Lenders</h2>
                  <p className="text-muted-foreground">
                    Manage your lending operations with a simple, efficient
                    interface.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 group relative overflow-hidden"
                  >
                    <Link
                      href={AUTH_REGISTER_PATH}
                      className="flex items-center"
                    >
                      Staff Access
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>

                <div
                  id="borrowers"
                  className="space-y-6 p-6 rounded-xl transition-all duration-300 hover:bg-gray-50/80"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-medium">For Borrowers</h2>
                  <p className="text-muted-foreground">
                    View your lendings and request new items with ease.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 group relative overflow-hidden"
                  >
                    <Link
                      href={AUTH_REGISTER_PATH}
                      className="flex items-center"
                    >
                      Customer Access
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
