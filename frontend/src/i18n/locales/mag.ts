import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const mag: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'घर (Home)',
    myReports: 'हमार रपट (My Reports)',
    communityFeed: 'टोला-मोहल्ला बात (Feed)',
    regionChat: 'इलाका चैट (Chat)',
    leaderboard: 'लीडरबोर्ड',
    profile: 'प्रोफ़ाइल (Profile)',
    reportProblem: 'दिक्कत दर्ज करऽ (Report)',
    signOut: 'बाहर निकलो (Logout)',
    signIn: 'लॉग इन करऽ',
    verifiedCitizen: 'प्रमाणित नागरिक',
  },
  hero: {
    ...hi.hero,
    officialBadge: 'झारखंड सरकार · उच्च और तकनीकी शिक्षा विभाग',
    mainTitle: 'गांवे के समस्या दर्ज करऽ, यूनिवर्सिटी आर सरकार से समाधान पावऽ।',
    subtitle: 'बाढ़, पानी के किल्लत, टूटल सड़क या जंगली जानवर के खतरा के रपट दर्ज करऽ। सरकार और यूनिवर्सिटी टीम समाधान बनईतौ।',
    ctaReport: 'दिक्कत दर्ज करऽ / फोटो अपलोड करऽ',
    ctaFeed: 'गांव-घर के हालचाल देखऽ',
  },
  reportModal: {
    ...hi.reportModal,
    title: 'गांवे के समस्या रपट दर्ज करऽ',
    submitButton: 'नागरिक रपट जमा करऽ',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'भाषा और क्षेत्रीय बोली पसंद (Language Preferences)',
    langSectionSubtitle: 'अपन मनपसंद भाषा चुनऽ। सब रपट और बटन तुरंत बदल जतौ।',
  },
};
