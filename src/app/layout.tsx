import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { z } from "zod";
import "./globals.css";
import ErrorBoundary from "./errorBoundary";
import Link from "next/link";
import { Toaster } from "sonner";

// Define schema for metadata
const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export type MetadataType = z.infer<typeof metadataSchema>;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Validate metadata
export const metadata: Metadata = metadataSchema.parse({
  title: "Handedruck - Lending Management",
  description: "Simplified lending management for lenders and borrowers",
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
          {children}
          <footer className="w-full py-6 border-t border-gray-100 mx-auto max-w-7xl">
            <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
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
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
