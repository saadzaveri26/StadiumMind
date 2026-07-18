"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

/**
 * Provider component that maintains selected locale, persistence in localStorage, and translations context.
 * @param props - Element containing React children nodes.
 * @returns The context provider wrapper element.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");

  useEffect(() => {
    const saved = localStorage.getItem("stadiummind_lang");
    if (saved) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("stadiummind_lang", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom React hook to consume the active Language preference and change setter.
 * Throws an error if consumed outside of a LanguageProvider tree.
 * @returns The language context values.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
