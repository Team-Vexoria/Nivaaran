import { SupportedLanguage, LanguageMeta, TranslationDictionary } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { sat } from './locales/sat';
import { khr } from './locales/khr';
import { nag } from './locales/nag';
import { kru } from './locales/kru';
import { mun } from './locales/mun';
import { ho } from './locales/ho';
import { kur } from './locales/kur';
import { ur } from './locales/ur';
import { bho } from './locales/bho';
import { mag } from './locales/mag';

export * from './types';

export const JHARKHAND_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / State', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'State Official', dir: 'ltr' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ (संथाली)', region: 'Santhal Pargana', dir: 'ltr' },
  { code: 'khr', name: 'Khortha', nativeName: 'खोरठा', region: 'North Chotanagpur', dir: 'ltr' },
  { code: 'nag', name: 'Nagpuri', nativeName: 'नागपुरी (सादरी)', region: 'South Chotanagpur', dir: 'ltr' },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़ (उरांव)', region: 'Chotanagpur Plateau', dir: 'ltr' },
  { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी', region: 'Khunti / Ranchi', dir: 'ltr' },
  { code: 'ho', name: 'Ho', nativeName: '𑢹𑣉 (हो)', region: 'Kolhan / Singhbhum', dir: 'ltr' },
  { code: 'kur', name: 'Kurmali', nativeName: 'कुरमाली', region: 'East Singhbhum / Bokaro', dir: 'ltr' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'State Official', dir: 'rtl' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'Palamu / Garhwa', dir: 'ltr' },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', region: 'Chatra / Koderma', dir: 'ltr' },
];

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  hi,
  sat,
  khr,
  nag,
  kru,
  mun,
  ho,
  kur,
  ur,
  bho,
  mag,
};

/**
 * Deep merge helper to ensure graceful fallback to English for any undefined key
 */
function createFallbackProxy(target: any, fallback: any): any {
  if (target === null || target === undefined) return fallback;
  if (typeof target !== 'object' || typeof fallback !== 'object') return target;

  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj && obj[prop] !== undefined && obj[prop] !== '') {
        const val = obj[prop];
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return createFallbackProxy(val, fallback?.[prop] || {});
        }
        return val;
      }
      return fallback?.[prop];
    },
  });
}

/**
 * Get translations for the specified language with guaranteed English fallback
 */
export const getTranslations = (lang: SupportedLanguage = 'en'): TranslationDictionary => {
  const chosen = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return createFallbackProxy(chosen, TRANSLATIONS.en);
};
