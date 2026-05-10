import { createContext, useContext, useEffect, useMemo, useState } from "react";
import translations from "./translations";

const STORAGE_KEY = "vetcare.lang";
const DEFAULT_LANG = "id";

const LanguageContext = createContext(null);

/**
 * Resolve nested translation key dengan dot notation.
 * Misal: t("sidebar.menu.dashboard") → translations[lang].sidebar.menu.dashboard
 * Kalau key tidak ketemu → fallback ke key itu sendiri.
 */
function resolve(dict, key) {
  return (
    key
      .split(".")
      .reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), dict) ??
    key
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = translations[lang] ?? translations[DEFAULT_LANG];
    return {
      lang,
      setLang: (l) => setLangState(l),
      toggleLang: () => setLangState((prev) => (prev === "id" ? "en" : "id")),
      t: (key) => resolve(dict, key),
      available: Object.keys(translations),
    };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within <LanguageProvider>");
  }
  return ctx;
}
