import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const kru: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'एड़पा (Home)',
    myReports: 'एंगहै रिपोर्ट (My Reports)',
    communityFeed: 'पद्दार गही कत्था (Feed)',
    regionChat: 'इलाका चैट (Chat)',
    reportProblem: 'तकलीफ तिंङा (Report)',
    signOut: 'बाहरी काला (Logout)',
    signIn: 'उलंग कोरके (Login)',
  },
  hero: {
    ...hi.hero,
    mainTitle: 'पद्दार गही तकलीफ तिंङा, सरकार अरा यूनिवर्सिटी ती समाधान बिद्दा।',
    subtitle: 'अम्म बाढ़ी, उमबस्का, डहरे खंखरा गही कत्था तिंङा। सरकार अरा कॉलेज टीम समाधान कमओर।',
    ctaReport: 'तकलीफ तिंङा / फोटो इट्टी',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'कत्था अरा बोलीक पसंद (Kurukh / Oraon Language)',
  },
};
