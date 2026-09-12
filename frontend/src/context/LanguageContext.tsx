import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  LanguageMeta, 
  TranslationDictionary, 
  JHARKHAND_LANGUAGES, 
  getTranslations 
} from '../i18n/translations';

interface LanguageContextType {
  currentLang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  langMeta: LanguageMeta;
  languages: LanguageMeta[];
}

const LANGUAGE_STORAGE_KEY = 'nivaaran_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
    if (saved && JHARKHAND_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    if (JHARKHAND_LANGUAGES.some(l => l.code === lang)) {
      setCurrentLangState(lang);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      
      const meta = JHARKHAND_LANGUAGES.find(l => l.code === lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = meta?.dir || 'ltr';
    }
  };

  // Sync when language changes in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LANGUAGE_STORAGE_KEY && e.newValue) {
        const newLang = e.newValue as SupportedLanguage;
        if (JHARKHAND_LANGUAGES.some(l => l.code === newLang)) {
          setCurrentLangState(newLang);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = getTranslations(currentLang);
  const langMeta = JHARKHAND_LANGUAGES.find(l => l.code === currentLang) || JHARKHAND_LANGUAGES[0];



  return (
    <LanguageContext.Provider value={{
      currentLang,
      setLanguage,
      t,
      langMeta,
      languages: JHARKHAND_LANGUAGES,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    const defaultLang: SupportedLanguage = 'en';
    const t = getTranslations(defaultLang);
    const langMeta = JHARKHAND_LANGUAGES[0];
    return {
      currentLang: defaultLang,
      setLanguage: () => {},
      t,
      langMeta,
      languages: JHARKHAND_LANGUAGES,
    };
  }
  return context;
};
