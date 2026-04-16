import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AICounselor } from "@/components/chat/AICounselor";

export const metadata: Metadata = {
  title: "Rivernova — Unbiased AI-Powered Education Consulting",
  description: "Find your perfect school with AI-powered, unbiased education consulting. No commissions, no hidden agendas — just honest recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {/* Ambient Background Orbs */}
        <div className="ambient-bg" aria-hidden="true">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        
        {/* Noise Overlay */}
        <div className="noise-overlay" aria-hidden="true"></div>

        <AuthProvider>
          {children}
          <AICounselor />
        </AuthProvider>
      </body>
    </html>
  );
}
