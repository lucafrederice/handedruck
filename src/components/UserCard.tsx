import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MovingBorderCard } from "./MovingBorderCard";

export function UserCard({ name }: { name: string }) {
  return (
    <div className="w-fit mx-auto">
      <MovingBorderCard className="border-neutral-200">
        <div className="bg-white p-8 w-full rounded-xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative">
              <div className="h-24 w-24  overflow-hidden border-2 border-primary/20 inline-flex items-center justify-center rounded-full bg-primary/10 text-primary fill-primary">
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
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-medium text-gray-900">
                Welcome back, <span className="capitalize">{name}</span>👋
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  3 lendings need your attention
                </div>
              </div>
              <Button variant="link" asChild size="lg" className="group">
                <Link href="/dashboard" className="flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </MovingBorderCard>
    </div>
  );
}
