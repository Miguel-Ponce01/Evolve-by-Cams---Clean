import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeLayoutWrapper } from "@/components/layout/ThemeLayoutWrapper";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

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
            <ThemeLayoutWrapper>
              <AnimatedBackground />
              <Navbar />
              <main className="flex-1 pb-20 lg:pb-0 relative z-10">{children}</main>
              <BottomNav />
            </ThemeLayoutWrapper>
          </BookingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
