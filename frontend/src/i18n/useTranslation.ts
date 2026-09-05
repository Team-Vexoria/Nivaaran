export function useTranslation() { const { lang } = useLanguage(); return (key: string) => (translationEngine.get(key, lang) || key); }
