import type { Metadata } from "next";
import "./globals.css";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeLayoutWrapper } from "@/components/layout/ThemeLayoutWrapper";
import { AIAssistant } from "@/components/layout/AIAssistant";

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
              {children}
              <AIAssistant />
            </ThemeLayoutWrapper>
          </BookingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
