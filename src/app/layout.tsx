import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Evolve by Cams — Fitness & Wellness",
  description: "High-vibe booking platform for modern fitness and wellness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          <BookingProvider>
            <Navbar />
            <main className="flex-1 pb-20 lg:pb-0">{children}</main>
            <BottomNav />
          </BookingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
