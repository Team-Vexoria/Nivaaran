import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const ho: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'ᱚᱲᱟᱜ (Home)',
    myReports: 'ᱟᱧᱟᱜ ᱨᱤᱯᱳᱨᱴ (My Reports)',
    communityFeed: 'ᱦᱟᱛᱩ ᱠᱟᱡᱤ (Feed)',
    reportProblem: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ (Report)',
  },
  hero: {
    ...hi.hero,
    mainTitle: 'ᱦᱟᱛᱩ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ, ᱥᱚᱨᱠᱟᱨ ᱠᱷᱚᱱ ᱥᱚᱞᱦᱮ ᱧᱟᱢ ᱢᱮ',
  },
};
