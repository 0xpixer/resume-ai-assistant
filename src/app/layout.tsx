import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthContext';
import { NavbarProvider } from '@/components/layout/NavbarContext';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Resume AI Assistant",
  description: "Create professional resumes with AI assistance",
  keywords: ["resume", "cv", "job application", "career", "AI", "assistant"],
  authors: [{ name: "Resume AI Team" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <NavbarProvider>
            {children}
          </NavbarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
