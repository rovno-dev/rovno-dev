"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language, translations } from "@/entities/i18n/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Language | null;
    if (stored === "en" || stored === "ru") {
      setLangState(stored);
    } else {
      const osLang = navigator.language.toLowerCase();
      if (osLang.startsWith("ru")) {
        setLangState("ru");
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
  };

  const t = (key: string) => translations[lang][key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
