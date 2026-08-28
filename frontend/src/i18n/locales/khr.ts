import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const khr: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'घर (Home)',
    myReports: 'हमार रिपोर्ट (My Reports)',
    communityFeed: 'गांव-घर चर्चा (Feed)',
    regionChat: 'इलाका चैट (Chat)',
    leaderboard: 'लीडरबोर्ड (Top Citizens)',
    profile: 'प्रोफाइल (Profile)',
    reportProblem: 'समस्या दर्ज करा (Report)',
    signOut: 'बाहर निकलो (Logout)',
    signIn: 'लॉग इन करा',
    verifiedCitizen: 'सत्यापित नागरिक',
  },
  hero: {
    ...hi.hero,
    officialBadge: 'झारखंड सरकार · उच्च आर तकनीकी शिक्षा विभाग',
    mainTitle: 'गांव कर समस्या दर्ज करा, यूनिवर्सिटी आर सरकार से समाधान पावा।',
    subtitle: 'बाढ़, पानी संकट, टुटल सड़क भा स्कूल सुरक्षा कर रिपोर्ट दर्ज करा। जिला अधिकारी आर यूनिवर्सिटी टीम राउर गांव खातिर समाधान बनवतय।',
    ctaReport: 'समस्या दर्ज करा / फोटो-वीडियो डाला',
    ctaFeed: 'गांव-घर कर हाल-चाल देखा',
  },
  reportModal: {
    ...hi.reportModal,
    title: 'गांव कर समस्या रिपोर्ट दर्ज करा',
    submitButton: 'नागरिक रिपोर्ट सबमिट करा',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'भाषा आर क्षेत्रीय बोली पसंद (Language Preferences)',
    langSectionSubtitle: 'अपन पसंद कर भाषा चुना। सबे रिपोर्ट आर इंटरफ़ेस तुरंत अपडेट भई जातय।',
  },
};
