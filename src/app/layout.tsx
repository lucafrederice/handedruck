import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "./errorBoundary";
import Link from "next/link";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Handedruck - Lending Management",
  description: "Simplified lending management for lenders and borrowers",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary
          fallback={<div>Something went wrong. Please try again.</div>}
        >
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">{children}</div>
            <footer className="w-full py-6 border-t border-gray-100 mx-auto max-w-7xl">
              <div className="container flex flex-col md:flex-row mx-auto justify-between items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Handedruck
                </p>
                <div className="flex items-center gap-4">
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    Terms
                  </Link>
                  <div className="h-1 w-1 rounded-full bg-gray-200"></div>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    Privacy
                  </Link>
                </div>
              </div>
            </footer>
          </div>

          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
