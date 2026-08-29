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

export interface LandingTranslations {
  heroMainTitle: string;  heroSubtitle: string;
  heroCtaPortals: string;
  heroCtaLifecycle: string;
  tickerDistrictsLabel: string;
  tickerDistrictsNote: string;
  tickerLabsLabel: string;
  tickerLabsNote: string;
  tickerAuditLabel: string;
  tickerAuditNote: string;
  tickerResolutionLabel: string;
  tickerResolutionNote: string;
  portalSectionBadge: string;
  portalSectionTitle: string;
  portalRootLabel: string;
  portalEnter: string;
  govTag: string;
  govTitle: string;
  govDesc: string;
  uniTag: string;
  uniTitle: string;
  uniDesc: string;
  industryTag: string;
  industryTitle: string;
  industryDesc: string;
  citizenTag: string;
  citizenTitle: string;
  citizenDesc: string;
  citizenReport: string;
  lifecycleTitle: string;
  lifecycleAuditTrail: string;
  lifecycleConnectedStages: string;
  phase1: string;
  phase1Badge: string;
  phase2: string;
  phase2Badge: string;
  phase3: string;
  phase3Badge: string;
  phase4: string;
  phase4Badge: string;
  s1Name: string;
  s1Desc: string;
  s2Name: string;
  s2Desc: string;
  s3Name: string;
  s3Desc: string;
  s4Name: string;
  s4Desc: string;
  s5Name: string;
  s5Desc: string;
  s6Name: string;
  s6Desc: string;
  s7Name: string;
  s7Desc: string;
  s8Name: string;
  s8Desc: string;
  s9Name: string;
  s9Desc: string;
  s10Name: string;
  s10Desc: string;
  s11Name: string;
  s11Desc: string;
  s12Name: string;
  s12Desc: string;
  s13Name: string;
  s13Desc: string;
  s14Name: string;
  s14Desc: string;
  s15Name: string;
  s15Desc: string;
  s16Name: string;
  s16Desc: string;
  uniSectionBadge: string;
  uniSectionTitle: string;
  uniSectionSubtitle: string;
  uniFocusArea: string;
  impactBadge: string;
  impactTitle: string;
  impactSubtitle: string;
  impactGeotaggedLabel: string;
  impactGeotaggedValue: string;
  impactGeotaggedNote: string;
  impactDistrictsLabel: string;
  impactDistrictsValue: string;
  impactDistrictsNote: string;
  impactRewardsLabel: string;
  impactRewardsValue: string;
  impactRewardsNote: string;
  footerTagline: string;
  footerDept: string;
  footerRoleEntrances: string;
  footerGovPortal: string;
  footerUniPortal: string;
  footerIndustryPortal: string;
  footerCitizenPortal: string;
  footerDomains: string;
  footerDomain1: string;
  footerDomain2: string;
  footerDomain3: string;
  footerDomain4: string;
  footerDomain5: string;
  footerHelplines: string;
  footerEmergency: string;
  footerDisasterCell: string;
  footerHigherEdDept: string;
  footerCopyright: string;
  navRolePortals: string;
  navExploreMap: string;
  navExplorePlatform: string;
  navDistrictsMap: string;
  navLifecycleStream: string;
  navUniLabs: string;
  navImpactLedger: string;
  navSignIn: string;
  govStripGovt: string;
  govStripDept: string;
  govStripHelpline: string;
  skipToContent: string;
}

export interface MapTranslations {
  title: string;
  subtitle: string;
  back: string;
  loading: string;
  noDataTitle: string;
  noDataDesc: string;
  statsTotal: string;
  statsCritical: string;
  statsValidated: string;
  statsResolved: string;
  filtersTitle: string;
  clearAll: string;
  severityTitle: string;
  riskCritical: string;
  riskHigh: string;
  riskMedium: string;
  riskStandard: string;
  statusTitle: string;
  districtsTitle: string;
  clearDistrict: string;
  legendTitle: string;
  legendCritical: string;
  legendHigh: string;
  legendMedium: string;
  legendStandard: string;
  districtTooltip: string;
  noGpsCoords: string;
  popupAiPriority: string;
  popupAdvisory: string;
  popupAssigned: string;
  popupValidateAssign: string;
  popupRequestEvidence: string;
  popupEvidenceAlt: string;
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
  landing: LandingTranslations;
  map: MapTranslations;
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
