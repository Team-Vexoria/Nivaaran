import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const mun: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'ओड़ाः (Home)',
    myReports: 'अञाः रिपोर्ट (My Reports)',
    communityFeed: 'हातू कजी (Feed)',
    reportProblem: 'दुख कजी ओल में (Report)',
    signOut: 'ओड़ोङ (Logout)',
    signIn: 'बोलोः (Login)',
  },
  hero: {
    ...hi.hero,
    mainTitle: 'हातू रेनाः दुख कजी ओल में, सरकार आर युनिवर्सिटी एते समाधान नाम में।',
    subtitle: 'दाः बाढ़ी, दाः तेटां, होरा बाड़ीज एते दुख कजी ओल में। सरकार आर कॉलेज टीम समाधान बाईया।',
  },
};
