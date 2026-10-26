import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "GapFinder AI — Adaptive Knowledge Gap & Revision Platform",
  description: "AI-powered learning platform identifying knowledge gaps from syllabus & study materials with personalized revision plans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
