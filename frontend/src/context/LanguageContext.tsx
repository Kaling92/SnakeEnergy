import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'EN' | 'VI';

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>('EN');

  // Load persisted language
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) setLang(saved);
  }, []);

  // Persist changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'EN' ? 'VI' : 'EN'));
  };

  const setLanguage = (lang: Language) => {
    setLang(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
