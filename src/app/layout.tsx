import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { NavigationLayout } from "@/components/NavigationLayout";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StadiumMind — Your AI Tournament Companion",
  description: "AI-powered smart stadium operations and real-time navigation assistant for FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} h-full dark`}>
      <head>
        {/* Material Symbols Outlined stylesheet */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-background text-on-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-primary focus:text-on-primary focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <LanguageProvider>
            <NavigationLayout>{children}</NavigationLayout>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
