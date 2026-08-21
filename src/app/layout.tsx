import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AdminAuthProvider } from "@/lib/AdminAuthContext";
import AuthGuard from "@/components/AuthGuard";
import PersistentAdminChrome from "@/components/PersistentAdminChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "TK & VD Admin Panel",
  description: "Multi-site CMS for Thailand Kitchen brands",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          <AuthGuard>
            <PersistentAdminChrome>{children}</PersistentAdminChrome>
          </AuthGuard>
          <Toaster position="top-right" richColors closeButton />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
