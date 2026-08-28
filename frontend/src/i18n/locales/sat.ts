import { TranslationDictionary } from '../types';
import { hi } from './hi';

export const sat: TranslationDictionary = {
  ...hi,
  nav: {
    ...hi.nav,
    home: 'ᱳᱲᱟᱜ (Home)',
    myReports: 'ᱤᱧᱟᱜ ᱨᱤᱯᱳᱨᱴ (My Reports)',
    communityFeed: 'ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱠᱷᱚᱵᱚᱨ (Feed)',
    regionChat: 'ᱴᱚᱞᱟ ᱜᱟᱯᱟᱞᱢᱟᱨᱟᱣ (Chat)',
    leaderboard: 'ᱢᱟᱬᱟᱝ ᱛᱟᱹᱞᱠᱟᱹ (Leaderboard)',
    profile: 'ᱯᱨᱳᱯᱷᱟᱭᱤᱞ (Profile)',
    reportProblem: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ (Report)',
    signOut: 'ᱚᱰᱚᱠᱚᱜ ᱢᱮ (Logout)',
    signIn: 'ᱵᱚᱞᱚᱱ ᱢᱮ (Login)',
    verifiedCitizen: 'ᱯᱟᱹᱛᱭᱟᱹᱣ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ',
  },
  hero: {
    ...hi.hero,
    officialBadge: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱚᱨᱠᱟᱨ · ᱩᱥᱩᱞ ᱟᱨ ᱴᱮᱠᱱᱤᱠᱟᱞ ᱥᱮᱪᱮᱫ ᱵᱤᱵᱷᱟᱜᱽ',
    mainTitle: 'ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ, ᱥᱚᱨᱠᱟᱨ ᱟᱨ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱠᱷᱚᱱ ᱥᱚᱞᱦᱮ ᱧᱟᱢ ᱢᱮ',
    subtitle: 'ᱫᱟᱜ ᱵᱟᱹᱰ, ᱫᱟᱜ ᱛᱮᱛᱟᱝ, ᱦᱚᱨ ᱵᱟᱹᱲᱤᱡ ᱮᱢᱟᱱ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱨᱮᱱᱟᱜ ᱨᱤᱯᱳᱨᱴ ᱥᱚᱨᱠᱟᱨ ᱟᱨ ᱤᱧᱡᱤᱱᱤᱭᱟᱹᱨᱤᱝ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱴᱷᱮᱱ ᱥᱮᱴᱮᱨ ᱢᱮ᱾',
    ctaReport: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ / ᱯᱷᱳᱴᱳ ᱟᱯᱞᱳᱰ ᱢᱮ',
    ctaFeed: 'ᱴᱚᱞᱟ ᱠᱷᱚᱵᱚᱨ ᱧᱮᱞ ᱢᱮ',
  },
  reportModal: {
    ...hi.reportModal,
    title: 'ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱨᱤᱯᱳᱨᱴ ᱮᱢ ᱢᱮ',
    submitButton: 'ᱥᱟᱹᱨᱤ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ ᱨᱤᱯᱳᱨᱴ ᱵᱷᱮᱡᱟᱭ ᱢᱮ',
  },
  profile: {
    ...hi.profile,
    langSectionTitle: 'ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱴᱚᱞᱟ ᱨᱚᱲ ᱵᱟᱪᱷᱟᱣ (Language Preferences)',
    langSectionSubtitle: 'ᱟᱢᱟᱜ ᱠᱩᱥᱤ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾ ᱡᱚᱛᱚ ᱨᱤᱯᱳᱨᱴ ᱟᱨ ᱵᱮᱵᱚᱥᱛᱟ ᱱᱚᱶᱟ ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱩᱫᱩᱜᱚᱜᱼᱟ᱾',
  },
};
