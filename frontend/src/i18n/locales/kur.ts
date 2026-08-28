import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const kur: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'घर (Home)',
    myReports: 'हमर रिपोर्ट (My Reports)',
    communityFeed: 'गांव कर बात (Feed)',
    reportProblem: 'समस्या दर्ज करा (Report)',
  },
  hero: {
    ...hi.hero,
    mainTitle: 'गांवेक समस्या दर्ज करा, सरकार और यूनिवर्सिटी ले समाधान पावा।',
  },
};
