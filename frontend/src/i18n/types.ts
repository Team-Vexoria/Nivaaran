export type SupportedLanguage = 
  | 'en'   // English
  | 'hi'   // Hindi (हिन्दी)
  | 'sat'  // Santali (ᱥᱟᱱᱛᱟᱲᱤ / संथाली)
  | 'khr'  // Khortha (खोरठा)
  | 'nag'  // Nagpuri / Sadri (नागपुरी)
  | 'kru'  // Kurukh / Oraon (कुड़ुख़)
  | 'mun'  // Mundari (मुंडारी)
  | 'ho'   // Ho (हो / 𑢹𑣉)
  | 'kur'  // Kurmali (कुरमाली)
  | 'ur'   // Urdu (اردو)
  | 'bho'  // Bhojpuri (भोजपुरी)
  | 'mag'; // Magahi (मगही)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
  dir?: 'ltr' | 'rtl';
}

export interface NavTranslations {
  home: string;
  myReports: string;
  communityFeed: string;
  regionChat: string;
  leaderboard: string;
  profile: string;
  heiPortal: string;
  reportProblem: string;
  signOut: string;
  signIn: string;
  verifiedCitizen: string;
  officialGovPortal: string;
  back: string;
}

export interface HeroTranslations {
  officialBadge: string;
  mainTitle: string;
  subtitle: string;
  ctaReport: string;
  ctaFeed: string;
  incidentsLogged: string;
  acrossDistricts: string;
  activeLabs: string;
  universitiesList: string;
  verificationRate: string;
  auditProven: string;
  feedbackRating: string;
  citizenSatisfaction: string;
  beforeAfterTitle: string;
  beforeAfterSubtitle: string;
  resolutionTimeLabel: string;
  resolutionBefore: string;
  resolutionAfter: string;
  resolutionChange: string;
  labsInvolvedLabel: string;
  labsBefore: string;
  labsAfter: string;
  labsChange: string;
  auditRateLabel: string;
  auditBefore: string;
  auditAfter: string;
  auditChange: string;
  feedbackScoreLabel: string;
  feedbackBefore: string;
  feedbackAfter: string;
  feedbackChange: string;
}

export interface FeatureTranslations {
  sectionTitle: string;
  sectionSubtitle: string;
  f1Title: string;
  f1Desc: string;
  f2Title: string;
  f2Desc: string;
  f3Title: string;
  f3Desc: string;
  f4Title: string;
  f4Desc: string;
}

export interface SpotlightTranslations {
  badge: string;
  title: string;
  location: string;
  stageBadge: string;
  step1Title: string;
  step1Desc: string;
  step1Status: string;
  step2Title: string;
  step2Desc: string;
  step2Status: string;
  step3Title: string;
  step3Desc: string;
  step3Status: string;
  step4Title: string;
  step4Desc: string;
  step4Status: string;
  assignedUniLabel: string;
  assignedUniName: string;
  assignedUniDept: string;
  csrLabel: string;
  csrName: string;
  csrGrant: string;
  beneficiariesLabel: string;
  beneficiariesCount: string;
  beneficiariesZone: string;
  auditNote: string;
  cta: string;
}

export interface ReportModalTranslations {
  title: string;
  subtitle: string;
  step1Badge: string;
  step2Badge: string;
  step3Badge: string;
  uploadTitle: string;
  uploadSubtitle: string;
  dragDropText: string;
  browseFiles: string;
  categoryLabel: string;
  categoryPlaceholder: string;
  problemTitleLabel: string;
  problemTitlePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  districtLabel: string;
  blockLabel: string;
  panchayatLabel: string;
  gpsDetecting: string;
  gpsDetected: string;
  autoTriageBadge: string;
  submitButton: string;
  submittingText: string;
  successTitle: string;
  successDesc: string;
  trackingIdLabel: string;
  priorityScoreLabel: string;
  matchedUniLabel: string;
  viewReportBtn: string;
  closeBtn: string;
}

export interface MyReportsTranslations {
  title: string;
  subtitle: string;
  filterAll: string;
  filterUnderReview: string;
  filterValidated: string;
  filterInProgress: string;
  filterResolved: string;
  noReportsTitle: string;
  noReportsDesc: string;
  reportProblemBtn: string;
  stageLabel: string;
  priorityLabel: string;
  viewTimelineBtn: string;
  assignedTeamLabel: string;
  dateLabel: string;
}

export interface CommunityFeedTranslations {
  title: string;
  subtitle: string;
  upvoteBtn: string;
  commentBtn: string;
  shareBtn: string;
  commentsTitle: string;
  writeCommentPlaceholder: string;
  postCommentBtn: string;
  allCategoriesFilter: string;
  solvedFilter: string;
  urgentFilter: string;
  newPostTitle: string;
  newPostPlaceholder: string;
  postBtn: string;
}

export interface RegionChatTranslations {
  title: string;
  subtitle: string;
  selectDistrict: string;
  typeMessagePlaceholder: string;
  sendBtn: string;
  officersOnline: string;
  citizensActive: string;
  disasterWarningNotice: string;
}

export interface LeaderboardTranslations {
  title: string;
  subtitle: string;
  rankLabel: string;
  citizenNameLabel: string;
  districtLabel: string;
  reportsFiledLabel: string;
  greenPointsLabel: string;
  vouchersEarnedLabel: string;
  badgesTitle: string;
  treeVoucherTitle: string;
  treeVoucherDesc: string;
  claimTreeBtn: string;
}

export interface ProfileTranslations {
  title: string;
  subtitle: string;
  verifiedCitizenBadge: string;
  editProfile: string;
  saveChanges: string;
  reportsFiledStat: string;
  govtVerifiedStat: string;
  uniActiveStat: string;
  treeVouchersStat: string;
  langSectionTitle: string;
  langSectionSubtitle: string;
  personalDetailsTitle: string;
  fullNameLabel: string;
  phoneLabel: string;
  districtLabel: string;
  blockLabel: string;
  villageLabel: string;
  signOutBtn: string;
}

export interface TranslationDictionary {
  nav: NavTranslations;
  hero: HeroTranslations;
  features: FeatureTranslations;
  spotlight: SpotlightTranslations;
  reportModal: ReportModalTranslations;
  myReports: MyReportsTranslations;
  communityFeed: CommunityFeedTranslations;
  regionChat: RegionChatTranslations;
  leaderboard: LeaderboardTranslations;
  profile: ProfileTranslations;
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    back: string;
    next: string;
    viewAll: string;
    details: string;
    languageChangedToast: string;
  };
}
