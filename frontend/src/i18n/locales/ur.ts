import { TranslationDictionary } from '../types';
import { en } from './en';

export const ur: TranslationDictionary = {
  ...en,
  nav: {
    ...en.nav,
    home: 'ہوم (Home)',
    myReports: 'میری رپورٹس (My Reports)',
    communityFeed: 'عوامی فیڈ (Feed)',
    regionChat: 'علاقائی چیٹ (Chat)',
    leaderboard: 'لیڈر بورڈ (Leaderboard)',
    profile: 'پروفائل (Profile)',
    reportProblem: 'مسئلہ درج کریں (Report)',
    signOut: 'لاگ آؤٹ (Logout)',
    signIn: 'لاگ ان (Login)',
    verifiedCitizen: 'تصدیق شدہ شہری',
  },
  hero: {
    ...en.hero,
    officialBadge: 'حکومت جھارکھنڈ · نظامت برائے اعلیٰ و تکنیکی تعلیم',
    mainTitle: 'مقامی مسائل درج کریں۔ یونیورسٹی اور حکومت سے مصدقہ حل حاصل کریں۔',
    subtitle: 'سیلاب، پانی کی قلت، ٹوٹی سڑک اور دیگر عوامی مسائل کی اطلاع دیں۔ حکومت اور یونیورسٹی ریسرچ ٹیمیں حل تیار کریں گی۔',
    ctaReport: 'مسئلہ درج کریں / تصویر یا ویڈیو اپ لوڈ کریں',
    ctaFeed: 'لائیو عوامی فیڈ دیکھیں',
  },
  reportModal: {
    ...en.reportModal,
    title: 'عوامی مسئلے کی رپورٹ درج کریں',
    submitButton: 'مصدقہ شہری رپورٹ جمع کریں',
  },
  profile: {
    ...en.profile,
    langSectionTitle: 'زبان اور علاقائی ترجیحات (Language Preferences)',
    langSectionSubtitle: 'اپنی پسندیدہ زبان منتخب کریں۔ تمام انٹرفیس فوری طور پر اپ ڈیٹ ہو جائیں گے۔',
  },
};
