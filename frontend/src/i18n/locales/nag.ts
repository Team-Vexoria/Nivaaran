import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const nag: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'घर (Home)',
    myReports: 'मोर रिपोर्ट (My Reports)',
    communityFeed: 'समाजक बात (Feed)',
    regionChat: 'इलाका चैट (Chat)',
    leaderboard: 'लीडरबोर्ड',
    profile: 'प्रोफाइल (Profile)',
    reportProblem: 'दिक्कत दर्ज करा (Report)',
    signOut: 'लॉग आउट',
    signIn: 'लॉग इन करा',
    verifiedCitizen: 'सत्यापित नागरिक',
  },
  hero: {
    ...hi.hero,
    officialBadge: 'झारखंड सरकार · उच्च और तकनीकी शिक्षा विभाग',
    mainTitle: 'गांवेक समस्या दर्ज करा, यूनिवर्सिटी और सरकार से समाधान पावा।',
    subtitle: 'बाढ़, पानीक किल्लत, टूटल सड़क या जंगली जानवरक खतराक रिपोर्ट करा। सरकार और कॉलेजक टीम समाधान बनाई।',
    ctaReport: 'दिक्कत दर्ज करा / फोटो अपलोड करा',
    ctaFeed: 'समाजक हालचाल देखा',
  },
  reportModal: {
    ...hi.reportModal,
    title: 'गांवेक समस्या रिपोर्ट दर्ज करा',
    submitButton: 'नागरिक रिपोर्ट भेजूं',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'भाषा और क्षेत्रीय बोलीक पसंद (Language Preferences)',
    langSectionSubtitle: 'अपन मनपसंद भाषा चुनूं। सब रिपोर्ट और बटन तुरंत अपडेट होई जाई।',
  },
};
