import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { translations } from "./translations";

const STORAGE_KEY = "parakh-dashboard-language";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

// Wraps the whole app once (see App.jsx). Persists the choice to
// localStorage so it survives a refresh, and defaults to English the
// first time someone opens the dashboard.
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore — localStorage can be unavailable (private mode, etc.)
    }
  }, [language]);

  const value = useMemo(() => {
    const dict = translations[language] || translations.en;
    // Falls back to the English string (or the raw key) if a given key
    // hasn't been translated yet, so an untranslated corner of the app
    // never renders blank.
    const t = (key, vars) => {
      const str = dict[key] ?? translations.en[key] ?? key;
      if (!vars) return str;
      return Object.keys(vars).reduce(
        (acc, k) => acc.replaceAll(`{${k}}`, vars[k]),
        str
      );
    };
    return { language, setLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
