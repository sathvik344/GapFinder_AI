import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthContext";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

export const metadata: Metadata = {
  title: "GapFinder AI — Adaptive Knowledge Diagnostics & Spaced Revision",
  description: "Evidence-based knowledge gap audit and personalized revision scheduling with strict RAG citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-ivory-50 dark:bg-pine-950 text-forest-900 dark:text-forest-50 antialiased selection:bg-coral-500 selection:text-white transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
