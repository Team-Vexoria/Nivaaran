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
  reportProblem: string;
  signIn: string;
  exploreChallenges: string;
  lifecycle: string;
  universities: string;
  industryMarketplace: string;
  impactLedger: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  districtsCovered: string;
  districtsSub: string;
  heiLabs: string;
  heiLabsSub: string;
  lifecycleTitle: string;
  lifecycleSub: string;
  outcomesTitle: string;
  outcomesSub: string;
  activeChallengesTitle: string;
  activeChallengesSub: string;
  
  // Spotlight
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
  
  // Filters & Card labels
  allFilter: string;
  floodingFilter: string;
  droughtFilter: string;
  mineSubsidenceFilter: string;
  locationLabel: string;
  matchedHeiLabel: string;
  affectedPopLabel: string;
  viewTeamCta: string;
  
  // HEI Section
  heiBadge: string;
  heiTitle: string;
  heiSubtitle: string;
  
  // CSR Section
  csrBadge: string;
  csrTitle: string;
  csrSubtitle: string;
  csrCard1Title: string;
  csrCard1Desc: string;
  csrCard2Title: string;
  csrCard2Desc: string;
  csrCard3Title: string;
  csrCard3Desc: string;
  
  // Footer
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
  title: 'Connecting Grassroots Challenges to University Research & Industry Deployment',
  subtitle: 'Jharkhand’s centralized demand-and-supply orchestration platform turning citizen-reported societal and disaster challenges into AI-triage, university-engineered prototypes, and verified government deployments.',
  tagline: 'Jharkhand Societal Challenge & Innovation Network',
  reportProblem: 'Report Problem',
  signIn: 'Sign In',
  exploreChallenges: 'Explore Challenges',
  lifecycle: '16-Stage Lifecycle',
  universities: 'Universities',
  industryMarketplace: 'Industry Marketplace',
  impactLedger: 'Impact Ledger',
  heroCtaPrimary: 'Submit Challenge / Upload Evidence',
  heroCtaSecondary: 'Explore Live Projects & GIS Map',
  districtsCovered: '24 / 24 Districts Covered',
  districtsSub: 'Statewide GIS Grid',
  heiLabs: '48+ HEI Research Labs',
  heiLabsSub: 'BIT, IIT-ISM, NIT, BAU',
  lifecycleTitle: '16-Stage Verified Lifecycle',
  lifecycleSub: 'Submission to Policy',
  outcomesTitle: '100% Traceable Outcomes',
  outcomesSub: 'Human-Validated Audit',
  activeChallengesTitle: 'Active State Challenges & Innovation Pipeline',
  activeChallengesSub: 'Ground Incidents in Motion',
  
  spotlightBadge: 'Flagship Challenge in Motion',
  spotlightTitle: 'Subernarekha Basin IoT Flood Telemetry Network',
  spotlightLocation: 'Kanke Block & Namkum, District Ranchi, Jharkhand • Incident ID: JH-2026-FL-0842',
  spotlightActiveStage: 'Active Stage 8: Multidisciplinary Team Formed',
  phase1Title: 'Phase 1 (Stages 1-4)',
  phase1Sub: 'Intake & AI Triage',
  phase1Status: '✓ Completed',
  phase2Title: 'Phase 2 (Stages 5-8)',
  phase2Sub: 'HEI Matching & Team',
  phase2Status: '● In Progress (Stage 8)',
  phase3Title: 'Phase 3 (Stages 9-12)',
  phase3Sub: 'Prototype & Pilot',
  phase3Status: 'Upcoming',
  phase4Title: 'Phase 4 (Stages 13-16)',
  phase4Sub: 'Deployment & Audit',
  phase4Status: 'Upcoming',
  
  assignedUnitLabel: 'Assigned Academic Unit',
  assignedUnitName: 'BIT Mesra, Ranchi',
  assignedUnitDept: 'Dept. of Electronics & Hydrological Civil Engineering',
  csrPartnerLabel: 'Industry / CSR Partner',
  csrPartnerName: 'Tata Steel CSR Foundation',
  csrPartnerGrant: 'Hardware Telemetry Enclosures & Cloud Server Grant',
  beneficiariesLabel: 'Verified Ground Beneficiaries',
  beneficiariesCount: '1,450+ Citizens & 2 Schools',
  beneficiariesZone: 'Subernarekha Flood Buffer Zone, Kanke',
  spotlightAuditNote: 'Verified on Government of Jharkhand Innovation Ledger with full audit accountability.',
  spotlightCta: 'View Project Deliverables & Sensor Logs',
  
  allFilter: 'All Challenges',
  floodingFilter: 'Flooding & Drainage',
  droughtFilter: 'Drought & Groundwater',
  mineSubsidenceFilter: 'Mine Subsidence & Landslide',
  locationLabel: 'Location:',
  matchedHeiLabel: 'Matched HEI:',
  affectedPopLabel: 'Affected Population:',
  viewTeamCta: 'View Team & Technical Milestones',
  
  heiBadge: 'Higher Education Network',
  heiTitle: 'Connected Universities & Research Centers',
  heiSubtitle: 'Accredited universities across Jharkhand equipped with multidisciplinary labs to prototype and validate societal solutions.',
  
  csrBadge: 'Public-Private Collaboration',
  csrTitle: 'Industry Mentorship & CSR Marketplace',
  csrSubtitle: 'Connecting corporate CSR capital, industrial testing facilities, and startup mentorship directly to validated university projects.',
  csrCard1Title: 'Prototype Funding Grants',
  csrCard1Desc: 'CSR foundations can fund bill-of-materials and fabrication grants directly for validated student and faculty prototypes.',
  csrCard2Title: 'Testing & Cloud Telemetry Labs',
  csrCard2Desc: 'Access industrial environmental chambers, compute clusters, and telemetry gateways to productionize student innovations.',
  csrCard3Title: 'Statewide Pilot Deployment',
  csrCard3Desc: 'Support field deployment in Panchayati Raj and ULB jurisdictions with government-backed outcome measurement.',
  
  footerAbout: 'Jharkhand Societal Challenge & Innovation Network. Department of Higher & Technical Education, Government of Jharkhand.',
  footerRolePortals: 'Role Portals',
  footerFocusAreas: 'Core Challenge Areas',
  footerHelplines: 'State Emergency Helplines',
  footerRights: '© 2026 Government of Jharkhand • All Rights Reserved',
  footerSecurity: 'Secure Role-Based Access Control • Traceable Audit Ledger',
  
  challenges: [
    {
      id: 'JH-2026-FL-0842',
      title: 'Monsoon Flash Flood Mitigation & IoT Early Warning',
      district: 'Ranchi',
      block: 'Kanke Block (Subernarekha Basin)',
      category: 'Flooding & Drainage',
      status: 'University Accepted',
      matchedHEI: 'BIT Mesra (IoT/Civil Dept)',
      peopleAffected: '1,450+ Citizens & 2 Schools',
      summary: 'Subernarekha river seasonal overflow creates severe inundation across agricultural fields and primary access roads.',
    },
    {
      id: 'JH-2026-DR-0319',
      title: 'Solar-Powered Deep Aquifer Recharge & Soil Moisture Sensors',
      district: 'Palamu',
      block: 'Daltonganj Block',
      category: 'Drought & Water',
      status: 'Validated & Prioritized',
      matchedHEI: 'Birsa Agricultural University & NIT Jamshedpur',
      peopleAffected: '3,800+ Farmers',
      summary: 'Severe summer groundwater depletion leading to crop failure. Proposing automated sensor-driven micro-irrigation.',
    },
    {
      id: 'JH-2026-LS-0112',
      title: 'Geotechnical Soil Stability & Mine Subsidence Early Detection',
      district: 'Dhanbad',
      block: 'Jharia Coalfield Belt',
      category: 'Mine Subsidence & Landslide',
      status: 'Prototype Stage',
      matchedHEI: 'IIT (ISM) Dhanbad (Mining & Geophysics)',
      peopleAffected: '6,200+ Residents',
      summary: 'Subsurface displacement monitoring using fiber-optic strain sensors to prevent catastrophic road and settlement collapse.',
    },
  ],
  heis: [
    { name: 'BIT Mesra, Ranchi', focus: 'IoT Sensor Systems & Civil Infrastructure', node: 'Center of Excellence in Disaster Telemetry' },
    { name: 'IIT (ISM) Dhanbad', focus: 'Geotechnical Engineering & Mine Subsidence', node: 'Subsurface Geophysics Lab' },
    { name: 'NIT Jamshedpur', focus: 'GIS Remote Sensing & AI Hydrology', node: 'Spatial Data & Watershed Intelligence' },
    { name: 'Birsa Agricultural University', focus: 'Drought Resilience & Agro-IoT', node: 'Climate-Smart Irrigation Division' },
    { name: 'IIIT Ranchi', focus: 'Embedded Telemetry & Edge AI Computing', node: 'Low-Power Edge IoT Lab' },
    { name: 'Ranchi University', focus: 'Community Validation & Field Surveys', node: 'Civic Policy & Ground Evaluation Cell' },
  ],
};

const hi: TranslationStrings = {
  title: 'जमीनी समस्याओं का विश्वविद्यालयों के शोध और उद्योग से समाधान',
  subtitle: 'झारखंड का राज्य नवाचार मंच, जो नागरिकों द्वारा दर्ज आपदाओं व सामाजिक समस्याओं को AI विश्लेषण, विश्वविद्यालय प्रोटोटाइप और सरकारी सत्यापन से जोड़ता है।',
  tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क',
  reportProblem: 'समस्या दर्ज करें',
  signIn: 'लॉग इन करें',
  exploreChallenges: 'चुनौतियां देखें',
  lifecycle: '16-चरणीय जीवनचक्र',
  universities: 'विश्वविद्यालय नेटवर्क',
  industryMarketplace: 'उद्योग व CSR बाजार',
  impactLedger: 'प्रभाव बहीखाता',
  heroCtaPrimary: 'समस्या दर्ज करें / साक्ष्य अपलोड करें',
  heroCtaSecondary: 'लाइव प्रोजेक्ट्स व GIS नक्शा देखें',
  districtsCovered: '24 / 24 जिले शामिल',
  districtsSub: 'राज्यव्यापी GIS ग्रिड',
  heiLabs: '48+ विश्वविद्यालय अनुसंधान लैब',
  heiLabsSub: 'बीआईटी, आईआईटी-आईएसएम, एनआईटी, बीएयू',
  lifecycleTitle: '16-चरणीय सत्यापित जीवनचक्र',
  lifecycleSub: 'समस्या से नीति निर्धारण तक',
  outcomesTitle: '100% पारदर्शी परिणाम',
  outcomesSub: 'मानव-सत्यापित ऑडिट ट्रेल',
  activeChallengesTitle: 'सक्रिय राज्य चुनौतियां एवं समाधान पाइपलाइन',
  activeChallengesSub: 'जमीनी स्तर पर जारी कार्य',
  
  spotlightBadge: 'प्रमुख आपदा समाधान परियोजना',
  spotlightTitle: 'स्वर्णरेखा नदी बेसिन IoT बाढ़ पूर्व चेतावनी नेटवर्क',
  spotlightLocation: 'कांके ब्लॉक एवं नामकुम, जिला रांची, झारखंड • घटना संख्या: JH-2026-FL-0842',
  spotlightActiveStage: 'सक्रिय चरण 8: बहुविषयक विशेषज्ञ टीम गठित',
  phase1Title: 'चरण 1 (स्तर 1-4)',
  phase1Sub: 'समस्या दर्ज एवं AI विश्लेषण',
  phase1Status: '✓ पूर्ण हुआ',
  phase2Title: 'चरण 2 (स्तर 5-8)',
  phase2Sub: 'विश्वविद्यालय चयन एवं टीम गठन',
  phase2Status: '● प्रगति पर (स्तर 8)',
  phase3Title: 'चरण 3 (स्तर 9-12)',
  phase3Sub: 'प्रोटोटाइप निर्माण एवं फील्ड ट्रायल',
  phase3Status: 'आगामी',
  phase4Title: 'चरण 4 (स्तर 13-16)',
  phase4Sub: 'सरकारी तैनाती एवं प्रभाव ऑडिट',
  phase4Status: 'आगामी',
  
  assignedUnitLabel: 'आवंटित विश्वविद्यालय इकाई',
  assignedUnitName: 'बीआईटी मेसरा, रांची',
  assignedUnitDept: 'इलेक्ट्रॉनिक्स एवं जल विज्ञान सिविल इंजीनियरिंग विभाग',
  csrPartnerLabel: 'औद्योगिक / CSR सहयोगी',
  csrPartnerName: 'टाटा स्टील सीएसआर फाउंडेशन',
  csrPartnerGrant: 'हार्डवेयर सेंसर एनक्लोजर एवं क्लाउड सर्वर अनुदान',
  beneficiariesLabel: 'सत्यापित जमीनी लाभार्थी',
  beneficiariesCount: '1,450+ नागरिक एवं 2 विद्यालय',
  beneficiariesZone: 'स्वर्णरेखा बाढ़ बफर क्षेत्र, कांके',
  spotlightAuditNote: 'झारखंड सरकार के नवाचार बहीखाते पर पूर्ण ऑडिट जवाबदेही के साथ सत्यापित।',
  spotlightCta: 'परियोजना परिणाम एवं सेंसर रिकॉर्ड देखें',
  
  allFilter: 'सभी चुनौतियां',
  floodingFilter: 'बाढ़ एवं जलभराव',
  droughtFilter: 'सूखा एवं भूजल संकट',
  mineSubsidenceFilter: 'खनन भू-धंसाव एवं भूस्खलन',
  locationLabel: 'स्थान:',
  matchedHeiLabel: 'आवंटित संस्थान:',
  affectedPopLabel: 'प्रभावित जनसंख्या:',
  viewTeamCta: 'तकनीकी टीम एवं प्रगति देखें',
  
  heiBadge: 'उच्च शिक्षा अनुसंधान नेटवर्क',
  heiTitle: 'संबद्ध विश्वविद्यालय एवं आपदा अनुसंधान केंद्र',
  heiSubtitle: 'झारखंड के मान्यता प्राप्त विश्वविद्यालय, जो सामाजिक समस्याओं के प्रोटोटाइप और वैज्ञानिक परीक्षण हेतु सुसज्जित हैं।',
  
  csrBadge: 'सार्वजनिक-निजी सहयोग',
  csrTitle: 'उद्योग मार्गदर्शन एवं सीएसआर बाजार',
  csrSubtitle: 'कॉर्पोरेट सीएसआर फंड, औद्योगिक परीक्षण प्रयोगशालाओं और स्टार्टअप मेंटरशिप को सीधे विश्वविद्यालय परियोजनाओं से जोड़ना।',
  csrCard1Title: 'प्रोटोटाइप विकास अनुदान',
  csrCard1Desc: 'सीएसआर फाउंडेशन सीधे छात्र एवं संकाय प्रोटोटाइप के निर्माण सामग्री के लिए अनुदान दे सकते हैं।',
  csrCard2Title: 'परीक्षण एवं क्लाउड लैब',
  csrCard2Desc: 'औद्योगिक पर्यावरण परीक्षण कक्षों, कंप्यूट क्लस्टर और टेलीमेट्री गेटवे की सुविधा।',
  csrCard3Title: 'राज्यव्यापी फील्ड तैनाती',
  csrCard3Desc: 'पंचायती राज और नगर निकायों में सरकारी निगरानी के साथ समाधानों की वास्तविक तैनाती।',
  
  footerAbout: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क। उच्च एवं तकनीकी शिक्षा विभाग, झारखंड सरकार।',
  footerRolePortals: 'भूमिका पोर्टल',
  footerFocusAreas: 'प्रमुख चुनौती क्षेत्र',
  footerHelplines: 'राज्य आपातकालीन हेल्पलाइन',
  footerRights: '© 2026 झारखंड सरकार • सर्वाधिकार सुरक्षित',
  footerSecurity: 'सुरक्षित आरबीएसी नियंत्रण • पारदर्शी ऑडिट बहीखाता',
  
  challenges: [
    {
      id: 'JH-2026-FL-0842',
      title: 'मानसून बाढ़ न्यूनीकरण एवं IoT पूर्व चेतावनी प्रणाली',
      district: 'रांची',
      block: 'कांके ब्लॉक (स्वर्णरेखा बेसिन)',
      category: 'बाढ़ एवं जलभराव',
      status: 'विश्वविद्यालय द्वारा स्वीकृत',
      matchedHEI: 'बीआईटी मेसरा (IoT/सिविल विभाग)',
      peopleAffected: '1,450+ नागरिक एवं 2 स्कूल',
      summary: 'स्वर्णरेखा नदी का मौसमी जलभराव कृषि भूमि और मुख्य संपर्क मार्गों को जलमग्न कर देता है।',
    },
    {
      id: 'JH-2026-DR-0319',
      title: 'सौर ऊर्जा संचालित भूजल पुनर्भरण एवं नमी सेंसर नेटवर्क',
      district: 'पलामू',
      block: 'डाल्टनगंज ब्लॉक',
      category: 'सूखा एवं भूजल संकट',
      status: 'सत्यापित एवं प्राथमिकता प्राप्त',
      matchedHEI: 'बिरसा कृषि विश्वविद्यालय एवं एनआईटी जमशेदपुर',
      peopleAffected: '3,800+ किसान',
      summary: 'गर्मी के मौसम में भूजल स्तर गिरने से फसल बर्बादी। स्वचालित सेंसर आधारित सूक्ष्म सिंचाई प्रणाली।',
    },
    {
      id: 'JH-2026-LS-0112',
      title: 'कोयला खदान क्षेत्र में भू-धंसाव पूर्व चेतावनी एवं स्थिरता जांच',
      district: 'धनबाद',
      block: 'झरिया कोयला क्षेत्र',
      category: 'खनन भू-धंसाव एवं भूस्खलन',
      status: 'प्रोटोटाइप परीक्षण चरण',
      matchedHEI: 'आईआईटी (आईएसएम) धनबाद (खनन एवं भूभौतिकी)',
      peopleAffected: '6,200+ निवासी',
      summary: 'फाइबर-ऑप्टिक सेंसर द्वारा जमीन के नीचे हलचल की निरंतर निगरानी ताकि बस्तियों का धंसाव रोका जा सके।',
    },
  ],
  heis: [
    { name: 'बीआईटी मेसरा, रांची', focus: 'IoT सेंसर सिस्टम एवं सिविल इन्फ्रास्ट्रक्चर', node: 'आपदा टेलीमेट्री उत्कृष्टता केंद्र' },
    { name: 'आईआईटी (आईएसएम) धनबाद', focus: 'जियोटेक्निकल इंजीनियरिंग एवं खदान धंसाव', node: 'भूगर्भीय भूभौतिकी प्रयोगशाला' },
    { name: 'एनआईटी जमशेदपुर', focus: 'जीआईएस रिमोट सेंसिंग एवं हाइड्रोलॉजी', node: 'स्थानिक डेटा एवं वाटरशेड इंटेलिजेंस' },
    { name: 'बिरसा कृषि विश्वविद्यालय', focus: 'सूखा सहिष्णुता एवं कृषि-IoT', node: 'जलवायु-अनुकूल सिंचाई प्रभाग' },
    { name: 'आईआईआईटी रांची', focus: 'एंबेडेड टेलीमेट्री एवं एज AI कंप्यूटिंग', node: 'लो-पावर एज IoT लैब' },
    { name: 'रांची विश्वविद्यालय', focus: 'सामुदायिक सत्यापन एवं फील्ड सर्वेक्षण', node: 'नागरिक नीति एवं जमीनी मूल्यांकन सेल' },
  ],
};

const sat: TranslationStrings = {
  ...hi,
  title: 'ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱚ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱟᱨ ᱠᱟᱹᱨᱜᱟᱲ ᱦᱚᱛᱮᱛᱮ ᱥᱚᱞᱦᱮ',
  subtitle: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱨᱮᱱᱟᱜ ᱥᱚᱨᱠᱟᱨᱤ ᱯᱞᱮᱴᱯᱷᱳᱨᱢ, ᱡᱟᱦᱟᱸ ᱫᱚ ᱱᱟᱜᱟᱨᱤᱭᱟᱹ ᱠᱚᱣᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱚ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱨᱤᱥᱟᱨᱪ ᱟᱨ ᱥᱚᱨᱠᱟᱨ ᱥᱟᱶ ᱡᱚᱲᱟᱣᱟᱭ᱾',
  tagline: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱟᱶᱛᱟᱨᱤ ᱟᱨ ᱱᱟᱶᱟ ᱩᱭᱦᱟᱹᱨ ᱱᱮᱴᱣᱟᱨᱠ',
  reportProblem: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ',
  signIn: 'ᱵᱚᱞᱚᱱ ᱢᱮ',
  exploreChallenges: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱠᱚ ᱧᱮᱞ ᱢᱮ',
  lifecycle: '᱑᱖ ᱫᱷᱟᱯ ᱠᱟᱹᱢᱤᱦᱚᱨᱟ',
  universities: 'ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ',
  industryMarketplace: 'ᱤᱱᱰᱟᱥᱴᱨᱤ ᱵᱟᱡᱟᱨ',
  impactLedger: 'ᱚᱨᱡᱚ ᱨᱮᱠᱳᱨᱰ',
  heroCtaPrimary: 'ᱮᱴᱠᱮᱴᱚᱬᱮ ᱟᱨ ᱪᱤᱛᱟᱹᱨ ᱟᱯᱞᱳᱰ ᱢᱮ',
  heroCtaSecondary: 'GIS ᱢᱮᱯ ᱟᱨ ᱯᱨᱚᱡᱮᱠᱴ ᱧᱮᱞ ᱢᱮ',
  districtsCovered: '᱒᱔ / ᱒᱔ ᱦᱚᱱᱚᱛ ᱥᱮᱞᱮᱫ',
  districtsSub: 'ᱜᱚᱴᱟ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱱᱮᱴᱣᱟᱨᱠ',
  heiLabs: '᱔᱘+ ᱨᱤᱥᱟᱨᱪ ᱞᱮᱵᱽ',
  spotlightBadge: 'ᱢᱩᱬᱩᱛ ᱠᱟᱹᱢᱤᱦᱚᱨᱟ',
  spotlightTitle: 'ᱥᱚᱵᱚᱨᱱᱟᱠᱷᱟ ᱜᱟᱰᱟ ᱫᱟᱜ ᱵᱟᱹᱰ ᱪᱮᱛᱟᱣᱱᱤ IoT ᱱᱮᱴᱣᱟᱨᱠ',
  spotlightActiveStage: '᱘ ᱫᱷᱟᱯ: ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱴᱤᱢ ᱵᱮᱱᱟᱣ ᱮᱱᱟ',
  allFilter: 'ᱡᱚᱛᱚ ᱠᱟᱹᱢᱤ',
  floodingFilter: 'ᱫᱟᱜ ᱵᱟᱹᱰ ᱟᱨ ᱫᱟᱜ ᱯᱮᱨᱮᱡ',
  droughtFilter: 'ᱟᱠᱟᱞ ᱟᱨ ᱦᱟᱥᱟ ᱫᱟᱜ',
  mineSubsidenceFilter: 'ᱠᱷᱟᱫᱟᱱ ᱦᱟᱥᱟ ᱫᱷᱟᱥᱟᱣ',
};

const khr: TranslationStrings = {
  ...hi,
  title: 'गांवेक समस्या के यूनिवर्सिटी रिसर्च आर उद्योग से समाधान',
  subtitle: 'झारखंड कर सरकारी नवाचार पोर्टल, जे नागरिक कर समस्या के कॉलेज, रिसर्चर आर सरकारी योजना से जोड़ो हे।',
  tagline: 'झारखंड सामाजिक चुनौती आर नवाचार नेटवर्क',
  reportProblem: 'समस्या दर्ज करा',
  signIn: 'लॉग इन करा',
  exploreChallenges: 'समस्या देखा',
  lifecycle: '16-चरणीय चक्र',
  universities: 'यूनिवर्सिटी नेटवर्क',
  industryMarketplace: 'उद्योग बाजार',
  impactLedger: 'प्रभाव खाता',
  heroCtaPrimary: 'समस्या दर्ज करा / फोटो अपलोड करा',
  heroCtaSecondary: 'लाइव प्रोजेक्ट आर GIS नक्शा देखा',
  districtsCovered: '24 / 24 जिला शामिल',
  districtsSub: 'पूरा झारखंड GIS ग्रिड',
  heiLabs: '48+ रिसर्च लैब',
  spotlightBadge: 'खास आपदा प्रोजेक्ट',
  spotlightTitle: 'स्वर्णरेखा नदी बेसिन IoT बाढ़ चेतावनी नेटवर्क',
  spotlightActiveStage: '8वां चरण: कॉलेज टीम तैयार भेल',
  allFilter: 'सब समस्या',
  floodingFilter: 'बाढ़ आर जलजमाव',
  droughtFilter: 'सुखार आर भूजल संकट',
  mineSubsidenceFilter: 'कोयला खदान धंसाव',
};

const nag: TranslationStrings = {
  ...hi,
  title: 'गांवेक समस्या कर यूनिवर्सिटी रिसर्च आर इंडस्ट्री से समाधान',
  subtitle: 'झारखंड कर पहल, जे आम जनता कर आपदा आर समस्या के विश्वविद्यालय कर वैज्ञानिक समाधान आर सरकारी सहयोग से जोड़ेला।',
  tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क',
  reportProblem: 'समस्या बतावा',
  signIn: 'साइन इन करा',
  exploreChallenges: 'चुनौती मन देखा',
  lifecycle: '16-कदम प्रोसेस',
  universities: 'यूनिवर्सिटी मन',
  industryMarketplace: 'उद्योग बाजार',
  impactLedger: 'नतीजा बही',
  heroCtaPrimary: 'समस्या दर्ज करा / फोटो अपलोड करा',
  heroCtaSecondary: 'लाइव प्रोजेक्ट आर GIS नक्शा देखा',
  districtsCovered: '24 / 24 जिला शामिल',
  districtsSub: 'गोटा राज्य ग्रिड',
  heiLabs: '48+ कॉलेज लैब',
  spotlightBadge: 'मुख्य प्रोजेक्ट',
  spotlightTitle: 'स्वर्णरेखा नदी बाढ़ अलर्ट IoT नेटवर्क',
  spotlightActiveStage: '8वां कदम: कॉलेज टीम बन गेल',
  allFilter: 'सब चुनौती',
  floodingFilter: 'बाढ़ आर पानी जमाव',
  droughtFilter: 'सुखार आर कुंआ-पानी',
  mineSubsidenceFilter: 'जमीन धंसाव आर खदान',
};

const kru: TranslationStrings = { ...hi, tagline: 'झारखंड सामाजिक चुनौती अरा नवाचार नेटवर्क' };
const mun: TranslationStrings = { ...nag, tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क' };
const ho: TranslationStrings = { ...sat, tagline: 'ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱟᱶᱛᱟ ᱟᱨ ᱱᱟᱶᱟ ᱩᱭᱦᱟᱹᱨ ᱱᱮᱴᱣᱟᱨᱠ' };
const kur: TranslationStrings = { ...khr, tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क' };
const ur: TranslationStrings = { ...hi, tagline: 'جھارکھنڈ سماجی چیلنج اور انوویشن نیٹ ورک' };
const bho: TranslationStrings = { ...khr, tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क' };
const mag: TranslationStrings = { ...khr, tagline: 'झारखंड सामाजिक चुनौती एवं नवाचार नेटवर्क' };

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
