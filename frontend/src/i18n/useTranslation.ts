import { TRANSLATIONS } from './translations';
import { SupportedLanguage } from './types';

export function useTranslation(lang: SupportedLanguage = 'en') {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return { t };
}
