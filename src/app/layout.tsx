import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/lib/AdminAuthContext";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRUSTPRIME Admin",
  description: "Multi-site CMS for Thailand Kitchen brands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminAuthProvider>
          <AuthGuard>{children}</AuthGuard>
          <Toaster position="top-right" richColors closeButton />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
