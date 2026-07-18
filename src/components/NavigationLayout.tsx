"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthContext } from "@/context/AuthContext";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "./ui/button";

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const { language, setLanguage } = useLanguage();
  const { user, isStaff, signInWithGoogle, logout } = useAuthContext();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip Navigation Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 bg-tertiary text-on-tertiary px-4 py-2 rounded-lg font-bold"
      >
        Skip to main content
      </a>

      {/* Top AppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-container-padding h-[72px]">
        <div className="flex items-center">
          <LanguageSelector currentLanguageCode={language} onChange={setLanguage} />
        </div>
        
        <div className="flex-1 flex justify-center items-center">
          <Link href="/" className="font-headline-xl text-2xl md:text-3xl text-tertiary tracking-tighter uppercase font-extrabold hover:opacity-80 transition-opacity">
            StadiumMind
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isStaff && (
                <span className="hidden md:inline font-data-mono text-[10px] bg-primary-container text-primary border border-primary/30 px-2 py-0.5 rounded">
                  STAFF
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                aria-label="Sign out"
                className="h-9 px-3 py-1 font-label-bold text-xs"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={signInWithGoogle}
              aria-label="Sign in with Google"
              className="h-9 px-3 py-1 font-label-bold text-xs"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 pt-[72px] pb-[80px] md:pb-0 min-h-[calc(100vh-72px)] flex flex-col">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container-low border-t border-outline-variant/30 flex justify-around items-center px-4 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)] h-[72px]">
        {/* Home Link */}
        <Link
          href="/"
          aria-label="Home"
          className={`flex flex-col items-center justify-center transition-transform active:scale-95 w-[64px] h-[56px] ${
            pathname === "/"
              ? "bg-primary-container text-primary rounded-full px-4 py-1"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="font-label-bold text-[11px] leading-tight mt-0.5">Home</span>
        </Link>

        {/* Navigate Link */}
        <Link
          href="/navigate"
          aria-label="Navigate"
          className={`flex flex-col items-center justify-center transition-transform active:scale-95 w-[64px] h-[56px] ${
            pathname.startsWith("/navigate")
              ? "bg-primary-container text-primary rounded-full px-4 py-1"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">map</span>
          <span className="font-label-bold text-[11px] leading-tight mt-0.5">Map</span>
        </Link>

        {/* Assistant Link */}
        <Link
          href="/assistant"
          aria-label="Assistant"
          className={`flex flex-col items-center justify-center transition-transform active:scale-95 w-[64px] h-[56px] ${
            pathname.startsWith("/assistant")
              ? "bg-primary-container text-primary rounded-full px-4 py-1"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
          <span className="font-label-bold text-[11px] leading-tight mt-0.5">Concierge</span>
        </Link>

        {/* Ops Link */}
        <Link
          href="/ops"
          aria-label="Ops Dashboard"
          className={`flex flex-col items-center justify-center transition-transform active:scale-95 w-[64px] h-[56px] ${
            pathname.startsWith("/ops")
              ? "bg-primary-container text-primary rounded-full px-4 py-1"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">dashboard</span>
          <span className="font-label-bold text-[11px] leading-tight mt-0.5">Ops</span>
        </Link>
      </nav>

      {/* Desktop Sidebar / Header Navigation Links (Hidden on Mobile) */}
      <div className="hidden md:flex fixed top-[72px] right-container-padding z-40 gap-4 mt-2">
        <Link href="/" className={`font-label-bold text-xs uppercase px-3 py-2 rounded-lg border transition-colors ${pathname === "/" ? "bg-primary-container border-primary/30 text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
          Home
        </Link>
        <Link href="/navigate" className={`font-label-bold text-xs uppercase px-3 py-2 rounded-lg border transition-colors ${pathname.startsWith("/navigate") ? "bg-primary-container border-primary/30 text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
          Interactive Map
        </Link>
        <Link href="/assistant" className={`font-label-bold text-xs uppercase px-3 py-2 rounded-lg border transition-colors ${pathname.startsWith("/assistant") ? "bg-primary-container border-primary/30 text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
          AI Concierge
        </Link>
        <Link href="/ops" className={`font-label-bold text-xs uppercase px-3 py-2 rounded-lg border transition-colors ${pathname.startsWith("/ops") ? "bg-primary-container border-primary/30 text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"}`}>
          Ops Dashboard
        </Link>
      </div>

      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 8px);
        }
      `}</style>
    </div>
  );
}
