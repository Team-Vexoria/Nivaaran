import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const bho: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'होम (Home)',
    myReports: 'हमार रिपोर्ट (My Reports)',
    communityFeed: 'समाज के बात (Feed)',
    regionChat: 'इलाकाई बात (Chat)',
    leaderboard: 'लीडरबोर्ड (Leaderboard)',
    profile: 'प्रोफाइल (Profile)',
    reportProblem: 'समस्या दर्ज करीं (Report)',
    signOut: 'बाहरी निकलीं (Logout)',
    signIn: 'लॉग इन करीं (Login)',
    verifiedCitizen: 'प्रमाणित नागरिक',
  },
  hero: {
    ...hi.hero,
    officialBadge: 'झारखंड सरकार · उच्च आ तकनीकी शिक्षा विभाग',
    mainTitle: 'गाँव-घर के समस्या दर्ज करीं। यूनिवर्सिटी आ सरकार से समाधान पाईं।',
    subtitle: 'बाढ़, पानी के किल्लत, टूटल सड़क भा स्कूल के खतरा के रपट लिखीं। सरकारी टीम आ कॉलेज के छात्र रउआ खातिर समाधान बनइहें।',
    ctaReport: 'समस्या दर्ज करीं / फोटो-वीडियो डालीं',
    ctaFeed: 'समाज के हालचाल देखीं',
  },
  reportModal: {
    ...hi.reportModal,
    title: 'गाँव के समस्या रपट दर्ज करीं',
    submitButton: 'नागरिक रपट सबमिट करीं',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'भाषा आ बोली के पसंद (Language Preferences)',
    langSectionSubtitle: 'अपन मनपसंद भाषा चुनीं। सगरी रपट आ इंटरफेस तुरंत अपडेट हो जाई।',
  },
};
