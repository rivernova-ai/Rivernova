import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AICounselor } from "@/components/chat/AICounselor";

export const metadata: Metadata = {
  title: "Rivernova",
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
        <AuthProvider>
          {children}
          <AICounselor />
        </AuthProvider>
      </body>
    </html>
  );
}
