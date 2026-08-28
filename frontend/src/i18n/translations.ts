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
  | 'mag';  // Magahi (मगही)

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  region: string;
}

export const JHARKHAND_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'Global / State' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'State Official' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ (संथाली)', region: 'Santhal Pargana' },
  { code: 'khr', name: 'Khortha', nativeName: 'खोरठा', region: 'North Chotanagpur' },
  { code: 'nag', name: 'Nagpuri', nativeName: 'नागपुरी (सादरी)', region: 'South Chotanagpur' },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़ (उरांव)', region: 'Chotanagpur Plateau' },
  { code: 'mun', name: 'Mundari', nativeName: 'मुंडारी', region: 'Khunti / Ranchi' },
  { code: 'ho', name: 'Ho', nativeName: '𑢹𑣉 (हो)', region: 'Kolhan / Singhbhum' },
  { code: 'kur', name: 'Kurmali', nativeName: 'कुरमाली', region: 'East Singhbhum / Bokaro' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'State Official' },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', region: 'Palamu / Garhwa' },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', region: 'Chatra / Koderma' },
];

export interface ChallengeItem {
  id: string;
  title: string;
  district: string;
  block: string;
  category: string;
  status: string;
  matchedHEI: string;
  peopleAffected: string;
  summary: string;
}

export interface HeiItem {
  name: string;
  focus: string;
  node: string;
}

export interface TranslationStrings {
  title: string;
  subtitle: string;
  tagline: string;
  govDeptBanner: string;
  navHome: string;
  navMyReports: string;
  navCommunityFeed: string;
  navRegionChat: string;
  navLeaderboard: string;
  navHeiPortal: string;
  navLogout: string;
  reportProblem: string;
  signIn: string;
  exploreChallenges: string;
  trackReport: string;
  communitySolutions: string;
  impactLedger: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  viewLiveFeed: string;
  metricIncidentsLogged: string;
  metricAcrossDistricts: string;
  metricActiveLabs: string;
  metricLabsList: string;
  metricVerificationRate: string;
  metricGeotagVerified: string;
  metricCitizenRewards: string;
  metricVouchersIssued: string;
  quickBrowse: string;
  catFloods: string;
  catInfrastructure: string;
  catSchools: string;
  catWildlife: string;
  districtsCovered: string;
  districtsSub: string;
  heiLabs: string;
  heiLabsSub: string;
  lifecycleTitle: string;
  lifecycleSub: string;
  outcomesTitle: string;
  outcomesSub: string;
  
  // Citizen usecases
  citizenFeatureTitle: string;
  citizenFeatureSub: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Title: string;
  feature2Desc: string;
  feature3Title: string;
  feature3Desc: string;
  feature4Title: string;
  feature4Desc: string;
  
  activeChallengesTitle: string;
  activeChallengesSub: string;
  
  spotlightBadge: string;
  spotlightTitle: string;
  spotlightLocation: string;
  spotlightActiveStage: string;
  phase1Title: string;
  phase1Sub: string;
  phase1Status: string;
  phase2Title: string;
  phase2Sub: string;
  phase2Status: string;
  phase3Title: string;
  phase3Sub: string;
  phase3Status: string;
  phase4Title: string;
  phase4Sub: string;
  phase4Status: string;
  
  assignedUnitLabel: string;
  assignedUnitName: string;
  assignedUnitDept: string;
  csrPartnerLabel: string;
  csrPartnerName: string;
  csrPartnerGrant: string;
  beneficiariesLabel: string;
  beneficiariesCount: string;
  beneficiariesZone: string;
  spotlightAuditNote: string;
  spotlightCta: string;
  
  allFilter: string;
  floodingFilter: string;
  droughtFilter: string;
  mineSubsidenceFilter: string;
  locationLabel: string;
  matchedHeiLabel: string;
  affectedPopLabel: string;
  viewTeamCta: string;
  
  footerAbout: string;
  footerRolePortals: string;
  footerFocusAreas: string;
  footerHelplines: string;
  footerRights: string;
  footerSecurity: string;
  
  challenges: ChallengeItem[];
  heis: HeiItem[];
}

const en: TranslationStrings = {
  title: 'Report Local Community Problems. Get Verified University & Government Solutions.',
  subtitle: 'Citizens report local floods, water crisis, road damage, or school safety hazards across Jharkhand. Government officers and university research teams build verified solutions for your community.',
  tagline: 'Jharkhand Citizen Societal Innovation Portal',
  govDeptBanner: 'Government of Jharkhand · Directorate of Higher & Technical Education',
  navHome: 'Home',
  navMyReports: 'My Reports',
  navCommunityFeed: 'Community Feed',
  navRegionChat: 'Region Chat',
  navLeaderboard: 'Leaderboard',
  navHeiPortal: 'HEI R&D Portal',
  navLogout: 'Logout',
  reportProblem: 'Report Problem',
  signIn: 'Sign In / Login',
  exploreChallenges: 'Report Problem',
  trackReport: 'Track My Report',
  communitySolutions: 'Local Solutions',
  impactLedger: 'Community Impact',
  heroCtaPrimary: 'Report Problem / Upload Photo & Video',
  heroCtaSecondary: 'Track My Report Status',
  viewLiveFeed: 'View Live Community Feed',
  metricIncidentsLogged: 'Incidents Logged',
  metricAcrossDistricts: 'Across 24 Districts',
  metricActiveLabs: 'Active R&D Labs',
  metricLabsList: 'BIT, IIT, NIT & BAU',
  metricVerificationRate: 'Verification Rate',
  metricGeotagVerified: 'Audit Geotag Verified',
  metricCitizenRewards: 'Citizen Rewards',
  metricVouchersIssued: 'Tree Vouchers Issued',
  quickBrowse: 'Quick Browse:',
  catFloods: 'Floods & Water Hazards',
  catInfrastructure: 'Roads & Infrastructure',
  catSchools: 'School Safety',
  catWildlife: 'Wildlife Hazards',
  districtsCovered: '24 / 24 Districts Covered',
  districtsSub: 'Statewide Citizen Network',
  heiLabs: '48+ Universities',
  heiLabsSub: 'BIT, IIT-ISM, NIT, BAU',
  lifecycleTitle: 'Verified Progress',
  lifecycleSub: 'Report to Solution',
  outcomesTitle: '100% Transparent',
  outcomesSub: 'Government Verified',
  
  citizenFeatureTitle: 'Built Specifically for Jharkhand Citizens & Communities',
  citizenFeatureSub: 'Turn everyday local problems into real engineering solutions backed by state government funding.',
  feature1Title: '📸 Photo & Video Evidence Intake',
  feature1Desc: 'Take a picture or record a short video of the local flood, broken bridge, or water hazard directly from your phone.',
  feature2Title: '📍 Automatic GPS & District Tagging',
  feature2Desc: 'Your report is geotagged down to your Panchayat, Block, and District so local officers can instantly verify the ground location.',
  feature3Title: '🏫 University Student & Lab Power',
  feature3Desc: 'Engineering students and university labs (BIT Mesra, NIT Jamshedpur, IIT Dhanbad) build customized prototypes for your village.',
  feature4Title: '⭐ Community Tracking & Feedback',
  feature4Desc: 'Track your report step-by-step from submission to completion and rate the solution once deployed in your area.',
  
  activeChallengesTitle: 'Recent Community Reports Being Solved',
  activeChallengesSub: 'Ground Issues Reported by Citizens',
  
  spotlightBadge: 'Featured Community Project',
  spotlightTitle: 'Subernarekha River Flood Early Warning System',
  spotlightLocation: 'Kanke Block & Namkum, District Ranchi, Jharkhand • Report ID: JH-2026-FL-0842',
  spotlightActiveStage: 'Stage 8: BIT Mesra Engineering Team Assigned',
  phase1Title: 'Step 1: Citizen Submission',
  phase1Sub: 'Photo & GPS Upload',
  phase1Status: '✓ Verified by Govt',
  phase2Title: 'Step 2: University Assignment',
  phase2Sub: 'BIT Mesra Engineering Team',
  phase2Status: '● In Progress',
  phase3Title: 'Step 3: Prototype Build',
  phase3Sub: 'IoT Sensors & Solar Unit',
  phase3Status: 'Next Step',
  phase4Title: 'Step 4: Village Deployment',
  phase4Sub: 'Installed in Panchayat',
  phase4Status: 'Upcoming',
  
  assignedUnitLabel: 'Assigned University Team',
  assignedUnitName: 'BIT Mesra, Ranchi',
  assignedUnitDept: 'Department of Electronics & Civil Engineering',
  csrPartnerLabel: 'Industry Support & Grant',
  csrPartnerName: 'Tata Steel CSR Foundation',
  csrPartnerGrant: 'Telemetry Hardware & Sensor Equipment Grant',
  beneficiariesLabel: 'Protected Community Members',
  beneficiariesCount: '1,450+ Citizens & 2 Schools',
  beneficiariesZone: 'Subernarekha Flood Zone, Kanke Block',
  spotlightAuditNote: 'Verified on Government of Jharkhand Citizen Innovation Portal.',
  spotlightCta: 'View Project Details & Live Status',
  
  allFilter: 'All Reports',
  floodingFilter: 'Flooding & Drainage',
  droughtFilter: 'Drought & Water',
  mineSubsidenceFilter: 'Landslides & Mine Hazards',
  locationLabel: 'Location:',
  matchedHeiLabel: 'University Team:',
  affectedPopLabel: 'People Affected:',
  viewTeamCta: 'View Progress & Solution',
  
  footerAbout: 'NIVAARAN — Jharkhand Societal Challenge & Innovation Portal for Citizens. Directorate of Higher & Technical Education, Government of Jharkhand.',
  footerRolePortals: 'Portal Login Links',
  footerFocusAreas: 'Report Categories',
  footerHelplines: 'State Emergency Helplines',
  footerRights: '© 2026 Government of Jharkhand • All Rights Reserved',
  footerSecurity: 'Verified Citizen Intake & Public Audit Ledger',
  
  challenges: [
    {
      id: 'JH-2026-FL-0842',
      title: 'Monsoon Flash Flood Risk Near School Road',
      district: 'Ranchi',
      block: 'Kanke Block (Subernarekha Basin)',
      category: 'Flooding & Drainage',
      status: 'University Team Assigned',
      matchedHEI: 'BIT Mesra (Civil & IoT Dept)',
      peopleAffected: '1,450+ Citizens & 2 Schools',
      summary: 'River overflow floods primary school road during heavy rains. Seeking automated early warning sensors.',
    },
    {
      id: 'JH-2026-DR-0319',
      title: 'Drinking Water Shortage & Deep Well Depletion',
      district: 'Palamu',
      block: 'Daltonganj Block',
      category: 'Drought & Water',
      status: 'Verified by Local Officer',
      matchedHEI: 'Birsa Agricultural University & NIT Jamshedpur',
      peopleAffected: '3,800+ Farmers',
      summary: 'Summer water table drop causing severe drinking water crisis. Seeking solar recharge solutions.',
    },
    {
      id: 'JH-2026-LS-0112',
      title: 'Road Cracks & Mine Area Ground Displacement',
      district: 'Dhanbad',
      block: 'Jharia Coalfield Belt',
      category: 'Mine Hazards',
      status: 'Prototype Testing',
      matchedHEI: 'IIT (ISM) Dhanbad (Mining Dept)',
      peopleAffected: '6,200+ Residents',
      summary: 'Ground cracks appearing near road. Proposing underground movement sensors to warn residents.',
    },
  ],
  heis: [
    { name: 'BIT Mesra, Ranchi', focus: 'Flood Telemetry & Road Sensors', node: 'Disaster Electronics Center' },
    { name: 'IIT (ISM) Dhanbad', focus: 'Mine Safety & Land Displacement', node: 'Geotechnical Safety Lab' },
    { name: 'NIT Jamshedpur', focus: 'Water Basin & GIS Mapping', node: 'Spatial Data Lab' },
    { name: 'Birsa Agricultural University', focus: 'Drought & Agro-Water Solutions', node: 'Irrigation Division' },
    { name: 'IIIT Ranchi', focus: 'Low-Cost Electronics & Edge AI', node: 'IoT Innovation Lab' },
    { name: 'Ranchi University', focus: 'Community Surveys & Field Verification', node: 'Citizen Feedback Cell' },
  ],
};

const hi: TranslationStrings = {
  title: 'स्थानीय समस्याएं दर्ज करें। विश्वविद्यालय और सरकार से पाएं सत्यापित समाधान।',
  subtitle: 'झारखंड के नागरिक बाढ़, जल संकट, टूटी सड़क या स्कूल सुरक्षा खतरों की रिपोर्ट दर्ज करें। स्थानीय प्रशासन और विश्वविद्यालय की टीमें आपके गांव के लिए समाधान तैयार करती हैं।',
  tagline: 'झारखंड नागरिक सामाजिक नवाचार पोर्टल',
  govDeptBanner: 'झारखंड सरकार · उच्च एवं तकनीकी शिक्षा निदेशालय',
  navHome: 'होम',
  navMyReports: 'मेरी रिपोर्ट',
  navCommunityFeed: 'कम्युनिटी फीड',
  navRegionChat: 'क्षेत्र चैट',
  navLeaderboard: 'लीडरबोर्ड',
  navHeiPortal: 'विश्वविद्यालय आरएंडडी पोर्टल',
  navLogout: 'लॉगआउट',
  reportProblem: 'समस्या दर्ज करें',
  signIn: 'लॉग इन करें',
  exploreChallenges: 'समस्या दर्ज करें',
  trackReport: 'रिपोर्ट की स्थिति देखें',
  communitySolutions: 'स्थानीय समाधान',
  impactLedger: 'सामुदायिक प्रभाव',
  heroCtaPrimary: 'समस्या दर्ज करें / फोटो-वीडियो अपलोड करें',
  heroCtaSecondary: 'अपनी रिपोर्ट की स्थिति जांचें',
  viewLiveFeed: 'लाइव कम्युनिटी फीड देखें',
  metricIncidentsLogged: 'कुल दर्ज समस्याएं',
  metricAcrossDistricts: '24 जिलों में सक्रिय',
  metricActiveLabs: 'सक्रिय आरएंडडी लैब',
  metricLabsList: 'बीआईटी, आईआईटी, एनआईटी व बीएयू',
  metricVerificationRate: 'सत्यापन दर',
  metricGeotagVerified: 'जीपीएस ऑ‌डिट सत्यापित',
  metricCitizenRewards: 'नागरिक पुरस्कार',
  metricVouchersIssued: 'पौधे वाउचर जारी',
  quickBrowse: 'त्वरित खोजें:',
  catFloods: 'बाढ़ एवं जल संकट',
  catInfrastructure: 'सड़क व बुनियादी ढांचा',
  catSchools: 'स्कूल सुरक्षा खतरे',
  catWildlife: 'वन्यजीव एवं जंगल खतरा',
  districtsCovered: '24 / 24 जिले शामिल',
  districtsSub: 'राज्यव्यापी नागरिक नेटवर्क',
  heiLabs: '48+ विश्वविद्यालय',
  heiLabsSub: 'बीआईटी, आईआईटी-आईएसएम, एनआईटी, बीएयू',
  lifecycleTitle: 'सत्यापित प्रगति',
  lifecycleSub: 'समस्या से समाधान तक',
  outcomesTitle: '100% पारदर्शी',
  outcomesSub: 'सरकारी सत्यापन',
  
  citizenFeatureTitle: 'विशेष रूप से झारखंड के नागरिकों और समुदायों के लिए निर्मित',
  citizenFeatureSub: 'अपनी दैनिक स्थानीय समस्याओं को राज्य सरकार की मदद से वास्तविक इंजीनियरिंग समाधानों में बदलें।',
  feature1Title: '📸 फोटो एवं वीडियो साक्ष्य अपलोड',
  feature1Desc: 'अपने मोबाइल से बाढ़, टूटे पुल या पानी के संकट की फोटो खींचें या वीडियो रिकॉर्ड करके भेजें।',
  feature2Title: '📍 स्वचालित जीपीएस एवं जिला ट्रैकिंग',
  feature2Desc: 'आपकी रिपोर्ट आपके पंचायत, ब्लॉक और जिले से जुड़ जाती है ताकि अधिकारी तुरंत जगह की पुष्टि कर सकें।',
  feature3Title: '🏫 विश्वविद्यालय के छात्रों और लैब की ताकत',
  feature3Desc: 'इंजीनियरिंग के छात्र और विश्वविद्यालय की लैब (बीआईटी मेसरा, एनआईटी, आईआईटी) आपके गांव के लिए मॉडल बनाते हैं।',
  feature4Title: '⭐ ट्रैकिंग और प्रतिक्रिया',
  feature4Desc: 'रिपोर्ट की स्थिति चरण-दर-चरण देखें और समाधान लगने के बाद अपनी रेटिंग और प्रतिक्रिया दें।',
  
  activeChallengesTitle: 'नागरिकों द्वारा दर्ज समस्याएं और समाधान',
  activeChallengesSub: 'जमीनी स्तर पर जारी समाधान कार्य',
  
  spotlightBadge: 'प्रमुख सामुदायिक परियोजना',
  spotlightTitle: 'स्वर्णरेखा नदी बाढ़ पूर्व चेतावनी प्रणाली',
  spotlightLocation: 'कांके ब्लॉक एवं नामकुम, जिला रांची, झारखंड • रिपोर्ट संख्या: JH-2026-FL-0842',
  spotlightActiveStage: 'स्तर 8: बीआईटी मेसरा की टीम आवंटित',
  phase1Title: 'चरण 1: नागरिक रिपोर्ट दर्ज',
  phase1Sub: 'फोटो एवं जीपीएस अपलोड',
  phase1Status: '✓ सरकार द्वारा सत्यापित',
  phase2Title: 'चरण 2: विश्वविद्यालय आवंटन',
  phase2Sub: 'बीआईटी मेसरा टीम',
  phase2Status: '● प्रगति पर',
  phase3Title: 'चरण 3: मॉडल निर्माण',
  phase3Sub: 'सेंसर एवं सोलर यूनिट',
  phase3Status: 'अगला चरण',
  phase4Title: 'चरण 4: पंचायत में स्थापना',
  phase4Sub: 'गांव में तैनाती',
  phase4Status: 'आगामी',
  
  assignedUnitLabel: 'आवंटित विश्वविद्यालय टीम',
  assignedUnitName: 'बीआईटी मेसरा, रांची',
  assignedUnitDept: 'इलेक्ट्रॉनिक्स एवं सिविल इंजीनियरिंग विभाग',
  csrPartnerLabel: 'उद्योग सहयोग एवं अनुदान',
  csrPartnerName: 'टाटा स्टील सीएसआर फाउंडेशन',
  csrPartnerGrant: 'हार्डवेयर सेंसर एवं उपकरण अनुदान',
  beneficiariesLabel: 'सुरक्षित नागरिक व छात्र',
  beneficiariesCount: '1,450+ नागरिक एवं 2 स्कूल',
  beneficiariesZone: 'स्वर्णरेखा बाढ़ क्षेत्र, कांके',
  spotlightAuditNote: 'झारखंड सरकार के नागरिक पोर्टल पर पूर्ण पारदर्शिता के साथ सत्यापित।',
  spotlightCta: 'परियोजना की स्थिति और विवरण देखें',
  
  allFilter: 'सभी रिपोर्ट',
  floodingFilter: 'बाढ़ एवं जलभराव',
  droughtFilter: 'सूखा एवं पेयजल संकट',
  mineSubsidenceFilter: 'भू-धंसाव व खदान खतरे',
  locationLabel: 'स्थान:',
  matchedHeiLabel: 'विश्वविद्यालय टीम:',
  affectedPopLabel: 'प्रभावित लोग:',
  viewTeamCta: 'प्रगति एवं समाधान देखें',
  
  footerAbout: 'निवाण — झारखंड नागरिक सामाजिक नवाचार पोर्टल। उच्च एवं तकनीकी शिक्षा विभाग, झारखंड सरकार।',
  footerRolePortals: 'पोर्टल लॉग इन',
  footerFocusAreas: 'रिपोर्ट श्रेणियां',
  footerHelplines: 'राज्य आपातकालीन हेल्पलाइन',
  footerRights: '© 2026 झारखंड सरकार • सर्वाधिकार सुरक्षित',
  footerSecurity: 'सत्यापित नागरिक रिपोर्ट एवं पारदर्शी ऑडिट',
  
  challenges: [
    {
      id: 'JH-2026-FL-0842',
      title: 'स्कूल मार्ग के पास मानसून बाढ़ का खतरा',
      district: 'रांची',
      block: 'कांके ब्लॉक (स्वर्णरेखा)',
      category: 'बाढ़ एवं जलभराव',
      status: 'विश्वविद्यालय टीम आवंटित',
      matchedHEI: 'बीआईटी मेसरा (सिविल व IoT विभाग)',
      peopleAffected: '1,450+ नागरिक एवं 2 स्कूल',
      summary: 'भारी बारिश में नदी का पानी स्कूल रोड पर भर जाता है। चेतावनी सेंसर की आवश्यकता।',
    },
    {
      id: 'JH-2026-DR-0319',
      title: 'पेयजल संकट एवं कुएं-चापाकल का सूखना',
      district: 'पलामू',
      block: 'डाल्टनगंज ब्लॉक',
      category: 'सूखा एवं जल संकट',
      status: 'अधिकारी द्वारा सत्यापित',
      matchedHEI: 'बिरसा कृषि विश्वविद्यालय व एनआईटी',
      peopleAffected: '3,800+ किसान',
      summary: 'गर्मी में भूजल स्तर गिरने से पानी का गंभीर संकट। सोलर रिचार्ज समाधान।',
    },
    {
      id: 'JH-2026-LS-0112',
      title: 'सड़क पर दरार एवं खदान क्षेत्र में जमीन धंसाव',
      district: 'धनबाद',
      block: 'झरिया कोयला क्षेत्र',
      category: 'खदान खतरे',
      status: 'मॉडल परीक्षण चरण',
      matchedHEI: 'आईआईटी (आईएसएम) धनबाद',
      peopleAffected: '6,200+ निवासी',
      summary: 'सड़क के पास दरारें दिख रही हैं। खतरे की पूर्व चेतावनी के लिए सेंसर की मांग।',
    },
  ],
  heis: [
    { name: 'बीआईटी मेसरा, रांची', focus: 'बाढ़ सेंसर एवं सड़क सुरक्षा', node: 'आपदा इलेक्ट्रॉनिक्स केंद्र' },
    { name: 'आईआईटी (आईएसएम) धनबाद', focus: 'खदान सुरक्षा एवं भू-धंसाव', node: 'जियोटेक्निकल लैब' },
    { name: 'एनआईटी जमशेदपुर', focus: 'जल संचयन एवं जीआईएस मैपिंग', node: 'वाटरशेड लैब' },
    { name: 'बिरसा कृषि विश्वविद्यालय', focus: 'सूखा एवं कृषि जल समाधान', node: 'सिंचाई विभाग' },
    { name: 'आईआईआईटी रांची', focus: 'कम लागत वाले इलेक्ट्रॉनिक्स', node: 'IoT लैब' },
    { name: 'रांची विश्वविद्यालय', focus: 'नागरिक सर्वेक्षण एवं सत्यापन', node: 'नागरिक प्रतिक्रिया सेल' },
  ],
};

const sat: TranslationStrings = { ...hi, title: 'ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ, ᱥᱚᱨᱠᱟᱨ ᱟᱨ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱠᱷᱚᱱ ᱥᱚᱞᱦᱮ ᱧᱟᱢ ᱢᱮ', tagline: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ ᱯᱳᱨᱴᱟᱞ' };
const khr: TranslationStrings = { ...hi, title: 'गांव कर समस्या दर्ज करा, यूनिवर्सिटी आर सरकार से समाधान पावा', tagline: 'झारखंड नागरिक पोर्टल' };
const nag: TranslationStrings = { ...hi, title: 'गांवेक समस्या दर्ज करा, यूनिवर्सिटी आर सरकार से समाधान पावा', tagline: 'झारखंड नागरिक पोर्टल' };
const kru: TranslationStrings = { ...hi, tagline: 'झारखंड नागरिक पोर्टल' };
const mun: TranslationStrings = { ...hi, tagline: 'झारखंड नागरिक पोर्टल' };
const ho: TranslationStrings = { ...hi, tagline: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ ᱯᱳᱨᱴᱟᱞ' };
const kur: TranslationStrings = { ...hi, tagline: 'झारखंड नागरिक पोर्टल' };
const ur: TranslationStrings = { ...hi, tagline: 'جھارکھنڈ شہری پورٹل' };
const bho: TranslationStrings = { ...hi, tagline: 'झारखंड नागरिक पोर्टल' };
const mag: TranslationStrings = { ...hi, tagline: 'झारखंड नागरिक पोर्टल' };

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en,
  hi,
  sat,
  khr,
  nag,
  kru,
  mun,
  ho,
  kur,
  ur,
  bho,
  mag,
};
