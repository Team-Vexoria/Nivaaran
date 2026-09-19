import { SupportedLanguage } from './translations';

export interface HelpFaqItem {
  id: string;
  question: string;
  category: string;
  answer: string;
}

export interface HelpGuideTranslations {
  nav: {
    backToDashboard: string;
    supportCentre: string;
    supportSubtitle: string;
    verifiedGovGuide: string;
    switchLanguage: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filteringBy: string;
    faqsMatched: string;
    clearSearch: string;
  };
  quickCards: {
    reportTitle: string;
    reportDesc: string;
    trackTitle: string;
    trackDesc: string;
    notifTitle: string;
    notifDesc: string;
    profileTitle: string;
    profileDesc: string;
    faqsTitle: string;
    faqsDesc: string;
  };
  sectionA: {
    heading: string;
    q1Title: string;
    q1Desc: string;
    q2Title: string;
    q2Citizens: string;
    q2Gov: string;
    q2Univ: string;
    q2Csr: string;
    q3Title: string;
    q3Desc: string;
    q4Title: string;
    q4Desc: string;
  };
  sectionB: {
    heading: string;
    btnMyReports: string;
    btnReportNow: string;
    subtext: string;
    steps: Array<{ step: string; title: string; desc: string }>;
    guidelinesTitle: string;
    g1Title: string;
    g1Desc: string;
    g2Title: string;
    g2Desc: string;
    g3Title: string;
    g3Desc: string;
    g4Title: string;
    g4Desc: string;
  };
  sectionC: {
    heading: string;
    btnOpenTracker: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    dictTitle: string;
    statuses: {
      submitted: { name: string; desc: string };
      underReview: { name: string; desc: string };
      verified: { name: string; desc: string };
      assigned: { name: string; desc: string };
      inProgress: { name: string; desc: string };
      resolved: { name: string; desc: string };
      rejected: { name: string; desc: string };
    };
  };
  sectionD: {
    heading: string;
    intro: string;
    b1Title: string;
    b1Desc: string;
    b2Title: string;
    b2Desc: string;
    b3Title: string;
    b3Desc: string;
    b4Title: string;
    b4Desc: string;
  };
  sectionE: {
    heading: string;
    intro: string;
    b1Title: string;
    b1Desc: string;
    b2Title: string;
    b2Desc: string;
    b3Title: string;
    b3Desc: string;
    b4Title: string;
    b4Desc: string;
    btnGoProfile: string;
  };
  sectionF: {
    heading: string;
    intro: string;
    f1Title: string;
    f1Desc: string;
    f2Title: string;
    f2Desc: string;
    f3Title: string;
    f3Desc: string;
  };
  sectionG: {
    heading: string;
    intro: string;
    b1Title: string;
    b1Desc: string;
    b2Title: string;
    b2Desc: string;
    b3Title: string;
    b3Desc: string;
    b4Title: string;
    b4Desc: string;
  };
  sectionH: {
    heading: string;
    c1Title: string;
    c1Desc: string;
    c2Title: string;
    c2Desc: string;
    c3Title: string;
    c3Desc: string;
  };
  sectionI: {
    heading: string;
    showingFaqs: string;
    noFaqsMatch: string;
    clearFilter: string;
    faqs: HelpFaqItem[];
  };
  sectionJ: {
    heading: string;
    btnAuth: string;
    deptBadge: string;
    title: string;
    subtitle: string;
    h1Title: string;
    h1Desc: string;
    h1Note: string;
    h2Title: string;
    h2Desc: string;
    h2Note: string;
    h3Title: string;
    h3Desc: string;
    h3Note: string;
    feedbackLabel: string;
    feedbackSuccess: string;
    feedbackPlaceholder: string;
    feedbackSubmit: string;
  };
  footer: {
    title: string;
    subline: string;
    govtLine: string;
  };
}

// ── English Base Dictionary ──────────────────────────────────────────
export const enHelp: HelpGuideTranslations = {
  nav: {
    backToDashboard: 'Back to Dashboard',
    supportCentre: 'NIVAARAN Support Centre',
    supportSubtitle: 'Official Citizen & Institutional Knowledge Base',
    verifiedGovGuide: 'Verified Govt Guide',
    switchLanguage: 'Language',
  },
  hero: {
    badge: 'NIVAARAN User Guide & Documentation',
    title: 'Help & User Guide',
    subtitle: 'Learn how to use Nivaaran, report civic issues, track complaints, and get help when you need it.',
    searchPlaceholder: 'Search for help, guides, or FAQs... (e.g., How to report an issue?, Complaint status, Profile)',
    filteringBy: 'Filtering documentation by',
    faqsMatched: 'FAQs matched',
    clearSearch: 'Clear search',
  },
  quickCards: {
    reportTitle: '📝 Report an Issue',
    reportDesc: 'Learn how to submit a civic complaint with photos and location.',
    trackTitle: '🔎 Track Complaint',
    trackDesc: 'Learn how to check complaint status and understand lifecycle stages.',
    notifTitle: '🔔 Notifications',
    notifDesc: 'Understand complaint alerts, official remarks, and disaster warnings.',
    profileTitle: '👤 Profile',
    profileDesc: 'Manage your personal information, district, and regional language.',
    faqsTitle: '❓ FAQs',
    faqsDesc: 'Find instant answers to common citizen and student questions.',
  },
  sectionA: {
    heading: 'A. Getting Started with Nivaaran',
    q1Title: 'What is Nivaaran?',
    q1Desc: "Nivaaran is Jharkhand's unified, AI-powered societal challenge resolution platform. It seamlessly connects citizens facing urgent civic hazards (contaminated water, culvert washouts, road subsidence, mining dust) with Jharkhand's 24 District Administrations, 18+ premier Higher Education Institutions (such as BIT Mesra, Central University of Jharkhand, IIT ISM Dhanbad, and NIT Jamshedpur), and CSR industry partners to deliver measurable engineering solutions.",
    q2Title: 'What Can You Do on the Platform?',
    q2Citizens: 'Citizens: Report local civic problems with photos/audio, track status in real-time, and view verified action reports.',
    q2Gov: 'Government Officers: Validate citizen reports, triage regional clusters, and allocate engineering problems to universities.',
    q2Univ: 'Universities & Students: Form multidisciplinary R&D teams, build prototypes, conduct village trials, and earn academic credits.',
    q2Csr: 'Industry & CSR: Fund localized innovations under Section 135 & Schedule VII with transparent milestone disbursements.',
    q3Title: 'How to Create and Use an Account',
    q3Desc: 'Citizens can access the platform instantly via the "Sign In" button using their email or mobile credentials. For testing and demonstration, official pre-assigned accounts exist for each role (Citizen, Faculty Mentor, Student Researcher, District Magistrate, and CSR Lead) with one-click auto-fill on the sign-in screen.',
    q4Title: 'Navigating the Dashboard',
    q4Desc: 'The top navigation bar lets you navigate between primary views: Home (statewide overview and quick report), My Reports (your personal complaints), Community Feed (neighborhood updates), Region Chat (district civic discussion), and Profile.',
  },
  sectionB: {
    heading: 'B. How to Report a Civic Issue',
    btnMyReports: 'View My Reports',
    btnReportNow: '+ Report Issue Now',
    subtext: 'Follow these 8 straightforward steps to submit an official societal challenge to the Jharkhand State Nodal Administration:',
    steps: [
      { step: 'Step 1', title: 'Open "Report Issue"', desc: 'Click the "+ Report Issue" button located on the navigation bar, home feed, or mobile bottom bar.' },
      { step: 'Step 2', title: 'Select Category', desc: 'Choose the relevant hazard category (e.g. Drinking Water, Road Infrastructure, Flooding, Bridge Damage, or Waste).' },
      { step: 'Step 3', title: 'Enter Description', desc: 'Provide specific details: how long the problem has existed, how many families are impacted, and immediate hazards.' },
      { step: 'Step 4', title: 'Add Location', desc: 'Select your District and Block, enter the Village/Panchayat name, or click "Auto-Detect GPS" for instant coordinate pinpointing.' },
      { step: 'Step 5', title: 'Upload Evidence', desc: 'Attach clear daylight photos or record a native audio voice description explaining the problem in your local language.' },
      { step: 'Step 6', title: 'Review Information', desc: 'Check the AI triage classification, estimated hazard priority score, and verify that all contact information is accurate.' },
      { step: 'Step 7', title: 'Submit Complaint', desc: 'Click "Submit Incident Report". The submission is instantly recorded in the state ledger even if offline.' },
      { step: 'Step 8', title: 'Save Reference ID', desc: 'Note your unique Complaint Reference ID (e.g., JH-2026-NIV-1042) to track progress across all 16 stages.' },
    ],
    guidelinesTitle: 'Submission Best Practices & Requirements',
    g1Title: '📍 Accurate Location',
    g1Desc: 'Specify landmark, kilometer stone, or village name for inspection teams.',
    g2Title: '📝 Clear Description',
    g2Desc: 'Describe the root cause, water color, bridge crack size, or road washout depth.',
    g3Title: '📷 Relevant Evidence',
    g3Desc: 'Attach authentic, unedited photos showing the severity and surrounding context.',
    g4Title: '📞 Valid Contact',
    g4Desc: 'Provide a working mobile number so block officers can reach you during verification.',
  },
  sectionC: {
    heading: 'C. Track Your Complaint & Understanding Statuses',
    btnOpenTracker: '🔎 Open 16-Stage Tracker',
    card1Title: 'Where to Find Complaints?',
    card1Desc: 'All complaints submitted by your account are saved under the "My Reports" tab in the Citizen Dashboard. If you submitted as a guest, use the Public Challenge Tracker on the landing page and enter your Reference ID.',
    card2Title: 'How to Open Details?',
    card2Desc: 'Click on any complaint card to view its comprehensive 16-stage audit timeline, verified DC notes, assigned university laboratory, telemetry sensor logs, and community satisfaction ratings.',
    card3Title: 'How to Check Progress?',
    card3Desc: 'Each report includes a visual milestone bar tracking progress from Initial Citizen Intake (Stage 1) to Final Scaling & Sustainable Exit (Stage 16).',
    dictTitle: 'Official Status Meaning Dictionary',
    statuses: {
      submitted: { name: 'Submitted', desc: 'Complaint has been successfully submitted and stored securely in the state ledger.' },
      underReview: { name: 'Under Review', desc: 'Authorities and AI deduplication algorithms are actively evaluating the complaint.' },
      verified: { name: 'Verified', desc: 'Complaint has been field-verified and approved by the Deputy Commissioner or BDO.' },
      assigned: { name: 'Assigned', desc: 'Complaint has been officially assigned to the responsible department or university research team.' },
      inProgress: { name: 'In Progress', desc: 'Active engineering action is underway (hardware prototyping, telemetry testing, or ground trial).' },
      resolved: { name: 'Resolved', desc: 'The reported civic hazard has been fully addressed, verified on the ground, and outcome audited.' },
      rejected: { name: 'Rejected / Closed', desc: 'Complaint could not be processed (e.g., duplicate submission, insufficient evidence, or outside jurisdiction) and has been closed with an official explanatory remark.' },
    },
  },
  sectionD: {
    heading: 'D. Notifications & Alerts',
    intro: 'Nivaaran keeps you updated at every major milestone through an automated notification system:',
    b1Title: 'Where do they appear?',
    b1Desc: 'Click the Notification Bell icon in the top right of the navigation bar to view your unread messages. High-severity alerts also appear in the red top banner.',
    b2Title: 'Complaint Status Updates:',
    b2Desc: 'Notified whenever your report is verified by the DC, accepted by an HEI, or advanced to pilot trials.',
    b3Title: 'Government Remarks:',
    b3Desc: 'Direct notes posted by inspecting district officers explaining required actions or timeline estimates.',
    b4Title: 'Disaster Warnings:',
    b4Desc: 'Real-time alerts regarding monsoon flood surges, mine subsiding warnings, or heatwave advisories.',
  },
  sectionE: {
    heading: 'E. Managing Your Profile',
    intro: 'Manage your citizen identity and localized preferences through the Profile tab:',
    b1Title: 'View Profile:',
    b1Desc: 'Inspect your citizen badge, earned community karma credits, and total submitted reports.',
    b2Title: 'Edit Personal Info:',
    b2Desc: 'Update your full name, primary phone number, and residential district.',
    b3Title: 'Profile Photo:',
    b3Desc: 'Upload or change your profile avatar to personalize your community contributions.',
    b4Title: 'Language & Region:',
    b4Desc: 'Switch between 12 regional Jharkhand dialects (Hindi, Santali, Khortha, Nagpuri, Kurukh, Mundari, Ho, Kurmali, Urdu, Bhojpuri, Magahi, and English).',
    btnGoProfile: 'Go to My Profile',
  },
  sectionF: {
    heading: 'F. Evidence Upload Guidelines',
    intro: 'High-quality visual evidence accelerates government verification and university lab matching:',
    f1Title: 'Supported Media Formats',
    f1Desc: 'Images (JPG, PNG, WEBP), Audio (WEBM, MP3, WAV), Video (MP4, WEBM), and Technical Reports (PDF).',
    f2Title: 'Platform Size Limitations',
    f2Desc: 'Photos up to 10MB each (max 5), Videos up to 50MB, Audio notes up to 5 minutes, Documents up to 15MB.',
    f3Title: '⚠️ What to Avoid',
    f3Desc: 'Avoid blurry pictures, screenshots of memes, downloaded stock photos, or unrelated personal documents.',
  },
  sectionG: {
    heading: 'G. Official Response & Resolution',
    intro: 'Nivaaran guarantees complete transparency between citizens and government administration:',
    b1Title: 'View Inspection Notes:',
    b1Desc: 'Read direct comments authored by the Deputy Commissioner, BDO, or Executive Engineer.',
    b2Title: 'Track Action Taken:',
    b2Desc: 'Inspect lab testing reports submitted by the assigned university engineering team.',
    b3Title: 'Review Resolution Data:',
    b3Desc: 'View field pilot sensor data (e.g. water fluoride levels reduced to safe BIS 10500 limits).',
    b4Title: 'Community Satisfaction Feedback:',
    b4Desc: 'Upvote resolved projects and submit satisfaction feedback during Stage 13 Outcome Audits.',
  },
  sectionH: {
    heading: 'H. Citizen Safety, Privacy & Platform Guidelines',
    c1Title: 'Never Share Passwords or OTPs',
    c1Desc: 'Government officials and university mentors will never ask you for your account password, SMS OTP, or bank details.',
    c2Title: 'Protect Sensitive Personal Data',
    c2Desc: 'Do not photograph Aadhaar cards, PAN cards, or bank passbooks in public hazard submissions. Upload only evidence of the physical issue.',
    c3Title: 'Zero Tolerance for False Reports',
    c3Desc: 'Submitting false, fabricated, or malicious complaints is punishable under digital civic grievance regulations and leads to account suspension.',
  },
  sectionI: {
    heading: 'I. Frequently Asked Questions (FAQs)',
    showingFaqs: 'Showing {count} of {total} FAQs',
    noFaqsMatch: 'No FAQs matched your search term.',
    clearFilter: 'Clear search filter',
    faqs: [
      {
        id: 'faq-1',
        question: 'How do I report an issue?',
        category: 'report',
        answer: 'Click the "+ Report Issue" button in the Citizen Portal navbar or home feed. Select the hazard category (e.g. Drinking Water & Fluoride, Flooding & Drainage, Road Subsidence, Bridge Infrastructure), describe the problem, pinpoint your district and panchayat (or allow GPS auto-detection), attach evidence photos or audio recordings, and click Submit. Your issue will receive a reference ID instantly.'
      },
      {
        id: 'faq-2',
        question: 'How can I track my complaint?',
        category: 'track',
        answer: 'Navigate to the "My Reports" tab in your Citizen Dashboard to see all issues you submitted, along with their live 16-stage progress meter. Alternatively, you can use the "Public Challenge Tracker" on the landing page and enter your Complaint Reference ID (e.g., JH-2026-NIV-XXXX) to inspect official government verification, university lab testing, and deployment updates.'
      },
      {
        id: 'faq-3',
        question: 'Where can I find my complaint ID?',
        category: 'track',
        answer: 'Your complaint ID is generated immediately upon submission and displayed on the confirmation screen (e.g., JH-2026-NIV-1042 or NIV-2026-030). You can also view it anytime on your complaint card in the "My Reports" tab, or in SMS/WhatsApp intake confirmations if you submitted via IVR.'
      },
      {
        id: 'faq-4',
        question: 'What does "Under Review" mean?',
        category: 'status',
        answer: '"Under Review" means your complaint has been received by the Nivaaran AI triage engine and is currently being inspected by the District Collectorate / Block Development Office (Stage 2: Validation & AI Deduplication). Authorities are assessing the priority factors, verifying duplicate reports, and preparing to assign a ground nodal officer.'
      },
      {
        id: 'faq-5',
        question: 'How do I update my profile?',
        category: 'profile',
        answer: 'Click on your profile avatar or the "Profile" tab in the top navigation bar. In the Profile tab, you can edit your display name, update your mobile number and district affiliation, choose your preferred localized language (from 12 Jharkhand regional dialects), and update your profile picture.'
      },
      {
        id: 'faq-6',
        question: 'How do I upload evidence?',
        category: 'evidence',
        answer: 'When submitting or supplementing a complaint, click "Choose Files" or tap the camera icon. You can upload clear photographs (JPEG, PNG, WEBP up to 10MB), record an audio voice note directly through your device microphone, upload video walkthroughs (MP4/WEBM up to 50MB), or attach supporting technical documents (PDF up to 15MB).'
      },
      {
        id: 'faq-7',
        question: 'Why has my complaint status not changed?',
        category: 'status',
        answer: 'Complex societal challenges (such as seasonal river scouring, bauxite road sinkholes, or endemic fluoride contamination) undergo thorough multi-disciplinary review. Once validated by the DC office (Stage 3), challenges are matched with universities (Stages 6–8) for prototype engineering (Stage 11) and field pilot trials (Stage 12). If your complaint has been pending under review for more than 7 days, check the notification bell for requests for additional photo evidence.'
      },
      {
        id: 'faq-8',
        question: 'Where can I see government responses?',
        category: 'gov',
        answer: 'Open your complaint details in "My Reports" or via the Challenge Tracker. Look for the "Government Officer Note" and "Validated By" badges. When a DC, BDO, or municipal commissioner reviews your complaint, their official remarks, inspection date, and designated university research lab appear directly in the timeline stream.'
      },
      {
        id: 'faq-9',
        question: 'How do I receive notifications?',
        category: 'notifications',
        answer: 'Real-time notifications are delivered directly within Nivaaran through the Notification Bell icon in the header. You will receive immediate alerts whenever your complaint stage advances, when an official officer note is posted, when a university deploys a prototype, or when the state disaster cell issues emergency weather and flood alerts for your district.'
      },
      {
        id: 'faq-10',
        question: 'What should I do if I submitted incorrect information?',
        category: 'report',
        answer: 'If you made an error in the location or description, open your report in "My Reports" and add a supplementary comment or upload correct photos with an explanatory note. For critical corrections or accidental duplicate submissions, you can contact the district support desk or flag the post for moderation review.'
      }
    ]
  },
  sectionJ: {
    heading: 'J. Need More Help? Contact Official Support',
    btnAuth: 'Sign In to Account',
    deptBadge: 'Jharkhand State Grievance Redressal',
    title: 'Dedicated Support & Regional Helplines',
    subtitle: 'If you need immediate assistance regarding a civic hazard or require platform technical help, connect with authorized state channels below.',
    h1Title: 'Toll-Free State Helpline',
    h1Desc: 'Jharkhand Citizen Grievance Portal & CM Jan Samvad.',
    h1Note: 'Toll-free · 24x7 Emergency Line',
    h2Title: 'Technical Support Desk',
    h2Desc: 'Platform defects, bug reports, and authentication support.',
    h2Note: 'Response within 24 business hours',
    h3Title: 'District Grievance Cells',
    h3Desc: 'In-person grievance desks available at all 24 Deputy Commissioner (DC) offices.',
    h3Note: 'Mon - Fri: 10:00 AM - 5:00 PM',
    feedbackLabel: 'Send Technical Feedback or Report a Documentation Gap:',
    feedbackSuccess: 'Thank you! Feedback received.',
    feedbackPlaceholder: 'Describe any issue you faced or suggestion for Nivaaran...',
    feedbackSubmit: 'Send Feedback',
  },
  footer: {
    title: 'NIVAARAN',
    subline: 'State Societal Innovation & Disaster Resilience',
    govtLine: 'Department of Higher & Technical Education · Government of Jharkhand',
  },
};

// ── Hindi (हिन्दी) Translations ─────────────────────────────────────
export const hiHelp: HelpGuideTranslations = {
  nav: {
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    supportCentre: 'निवारण सहायता केंद्र',
    supportSubtitle: 'आधिकारिक नागरिक एवं संस्थागत ज्ञानकोश',
    verifiedGovGuide: 'सत्यापित सरकारी मार्गदर्शिका',
    switchLanguage: 'भाषा बदलें',
  },
  hero: {
    badge: 'निवारण उपयोगकर्ता मार्गदर्शिका एवं दस्तावेज़ीकरण',
    title: 'सहायता एवं उपयोगकर्ता मार्गदर्शिका',
    subtitle: 'जानें कि निवारण का उपयोग कैसे करें, नागरिक समस्याएं कैसे दर्ज करें, शिकायतों की स्थिति कैसे ट्रैक करें और आवश्यक सहायता कैसे प्राप्त करें।',
    searchPlaceholder: 'सहायता, मार्गदर्शिका या प्रश्न खोजें... (उदा. समस्या कैसे दर्ज करें?, शिकायत की स्थिति, प्रोफ़ाइल)',
    filteringBy: 'इसके अनुसार फ़िल्टर किया गया:',
    faqsMatched: 'प्रश्न मिले',
    clearSearch: 'खोज साफ़ करें',
  },
  quickCards: {
    reportTitle: '📝 समस्या दर्ज करें',
    reportDesc: 'फोटो और सटीक स्थान के साथ नागरिक शिकायत दर्ज करने का तरीका जानें।',
    trackTitle: '🔎 शिकायत ट्रैक करें',
    trackDesc: 'शिकायत की स्थिति जांचें और 16-चरणीय जीवनचक्र चरणों को समझें।',
    notifTitle: '🔔 सूचनाएं व अलर्ट',
    notifDesc: 'शिकायत अपडेट, सरकारी अधिकारियों की टिप्पणी और आपदा चेतावनियों को समझें।',
    profileTitle: '👤 प्रोफ़ाइल प्रबंधन',
    profileDesc: 'अपनी व्यक्तिगत जानकारी, जिला और पसंदीदा क्षेत्रीय भाषा प्रबंधित करें।',
    faqsTitle: '❓ अक्सर पूछे जाने वाले प्रश्न',
    faqsDesc: 'नागरिकों और छात्रों के सामान्य प्रश्नों के त्वरित उत्तर प्राप्त करें।',
  },
  sectionA: {
    heading: 'क. निवारण के साथ शुरुआत करें',
    q1Title: 'निवारण क्या है?',
    q1Desc: 'निवारण झारखंड का एकीकृत, एआई-संचालित सामाजिक चुनौती समाधान मंच है। यह दूषित पेयजल, टूटे पुल, सड़क धंसाव या खनन धूल जैसी गंभीर नागरिक समस्याओं से जूझ रहे नागरिकों को झारखंड के 24 जिला प्रशासनों, 18+ प्रमुख उच्च शिक्षण संस्थानों (जैसे बीआईटी मेसरा, झारखंड केंद्रीय विश्वविद्यालय, आईआईटी आईएसएम धनबाद, एनआईटी जमशेदपुर) और कॉर्पोरेट सीएसआर सहयोगियों से सीधे जोड़ता है।',
    q2Title: 'आप इस मंच पर क्या कर सकते हैं?',
    q2Citizens: 'नागरिक: फोटो/ऑडियो के साथ स्थानीय समस्याएं दर्ज करें, वास्तविक समय में प्रगति ट्रैक करें और सत्यापित समाधान रिपोर्ट देखें।',
    q2Gov: 'सरकारी अधिकारी: नागरिक रिपोर्टों का सत्यापन करें, क्षेत्रीय समस्याओं का वर्गीकरण करें और विश्वविद्यालयों को प्रोजेक्ट सौंपें।',
    q2Univ: 'विश्वविद्यालय एवं छात्र: अनुसंधान टीमें बनाएं, प्रोटोटाइप विकसित करें, ग्रामीण क्षेत्रों में परीक्षण करें और शैक्षणिक क्रेडिट अर्जित करें।',
    q2Csr: 'उद्योग व सीएसआर: कंपनी अधिनियम की धारा 135 व अनुसूची 7 के तहत पारदर्शी रूप से स्थानीय नवाचारों को वित्तपोषित करें।',
    q3Title: 'खाता कैसे बनाएं और उपयोग करें?',
    q3Desc: 'नागरिक अपने मोबाइल नंबर या ईमेल से "लॉग इन" बटन पर क्लिक करके तुरंत मंच से जुड़ सकते हैं। परीक्षण और डेमो के लिए, आधिकारिक पूर्व-निर्धारित खाते साइन-इन स्क्रीन पर उपलब्ध हैं।',
    q4Title: 'डैशबोर्ड में नेविगेट कैसे करें?',
    q4Desc: 'शीर्ष नेविगेशन बार से आप आसानी से होम, मेरी रिपोर्ट, सामुदायिक फ़ीड, क्षेत्रीय चैट और प्रोफ़ाइल टैब के बीच जा सकते हैं।',
  },
  sectionB: {
    heading: 'ख. नागरिक समस्या कैसे दर्ज करें?',
    btnMyReports: 'मेरी रिपोर्ट देखें',
    btnReportNow: '+ अभी समस्या दर्ज करें',
    subtext: 'झारखंड राज्य नोडल प्रशासन को आधिकारिक सामाजिक चुनौती प्रस्तुत करने के लिए इन 8 सरल चरणों का पालन करें:',
    steps: [
      { step: 'चरण 1', title: '"समस्या दर्ज करें" खोलें', desc: 'नेविगेशन बार, होम फ़ीड या मोबाइल नीचे पट्टी पर "+ समस्या दर्ज करें" बटन पर क्लिक करें।' },
      { step: 'चरण 2', title: 'श्रेणी चुनें', desc: 'संबंधित श्रेणी चुनें (उदा. पेयजल व फ्लोराइड, सड़क धंसाव, बाढ़ व जल निकासी, पुल क्षति, या अपशिष्ट)।' },
      { step: 'चरण 3', title: 'विवरण दर्ज करें', desc: 'स्पष्ट जानकारी दें: समस्या कब से है, कितने परिवार प्रभावित हैं और तात्कालिक खतरे क्या हैं।' },
      { step: 'चरण 4', title: 'स्थान जोड़ें', desc: 'अपना जिला और ब्लॉक चुनें, गांव/पंचायत का नाम दर्ज करें या सटीक जीपीएस स्थान के लिए "ऑटो-डिटेक्ट" पर टैप करें।' },
      { step: 'चरण 5', title: 'साक्ष्य अपलोड करें', desc: 'दिन के उजाले की स्पष्ट तस्वीरें संलग्न करें या अपनी स्थानीय भाषा में समस्या समझाते हुए ऑडियो रिकॉर्ड करें।' },
      { step: 'चरण 6', title: 'जानकारी की समीक्षा करें', desc: 'एआई प्राथमिकता स्कोर जांचें और सुनिश्चित करें कि संपर्क विवरण सही हैं।' },
      { step: 'चरण 7', title: 'शिकायत सबमिट करें', desc: '"घटना रिपोर्ट दर्ज करें" पर क्लिक करें। रिपोर्ट तुरंत राज्य डिजिटल बहीखाते में सुरक्षित हो जाती है।' },
      { step: 'चरण 8', title: 'संदर्भ आईडी सुरक्षित रखें', desc: 'अपनी अनूठी शिकायत संदर्भ आईडी (उदा. JH-2026-NIV-1042) नोट कर लें जिससे सभी 16 चरणों में ट्रैकिंग की जा सके।' },
    ],
    guidelinesTitle: 'प्रस्तुति सर्वोत्तम अभ्यास एवं नियम',
    g1Title: '📍 सटीक स्थान',
    g1Desc: 'निरीक्षण दल के लिए मील का पत्थर, नजदीकी स्कूल या गांव का नाम स्पष्ट लिखें।',
    g2Title: '📝 स्पष्ट विवरण',
    g2Desc: 'मूल कारण, पानी का रंग, पुल की दरार या सड़क कटाव की गहराई का उल्लेख करें।',
    g3Title: '📷 प्रामाणिक साक्ष्य',
    g3Desc: 'केवल वास्तविक और स्पष्ट तस्वीरें संलग्न करें जो समस्या की गंभीरता दिखाती हों।',
    g4Title: '📞 मान्य संपर्क नंबर',
    g4Desc: 'सक्रिय मोबाइल नंबर दें ताकि ब्लॉक स्तर के अधिकारी सत्यापन हेतु आपसे संपर्क कर सकें।',
  },
  sectionC: {
    heading: 'ग. शिकायत की स्थिति ट्रैक करें व अर्थ समझें',
    btnOpenTracker: '🔎 16-चरणीय ट्रैकर खोलें',
    card1Title: 'शिकायतें कहां मिलेंगी?',
    card1Desc: 'आपके द्वारा सबमिट की गई सभी शिकायतें नागरिक डैशबोर्ड के "मेरी रिपोर्ट" टैब में सुरक्षित हैं। यदि अतिथि के रूप में दर्ज किया है, तो लैंडिंग पेज पर पब्लिक ट्रैकर का उपयोग करें।',
    card2Title: 'विवरण कैसे देखें?',
    card2Desc: 'किसी भी शिकायत कार्ड पर क्लिक करके 16-चरणीय ऑडिट टाइमलाइन, उपायुक्त/बीडीओ की टिप्पणी, आवंटित विश्वविद्यालय लैब और परीक्षण डेटा देखें।',
    card3Title: 'प्रगति कैसे मापें?',
    card3Desc: 'प्रत्येक रिपोर्ट में नागरिक पंजीकरण (चरण 1) से लेकर अंतिम स्थायी समाधान (चरण 16) तक का दृश्य प्रगति मीटर शामिल है।',
    dictTitle: 'आधिकारिक स्थिति शब्दावली',
    statuses: {
      submitted: { name: 'दर्ज (Submitted)', desc: 'शिकायत सफलतापूर्वक दर्ज हो चुकी है और राज्य के सुरक्षित लेज़र में संग्रहित है।' },
      underReview: { name: 'समीक्षाधीन (Under Review)', desc: 'अधिकारी और एआई इंजन प्राथमिकता व डुप्लीकेट रिपोर्टों की जांच कर रहे हैं।' },
      verified: { name: 'सत्यापित (Verified)', desc: 'उपायुक्त (DC) या प्रखंड विकास पदाधिकारी (BDO) द्वारा जमीनी स्तर पर सत्यापन पूर्ण।' },
      assigned: { name: 'आवंटित (Assigned)', desc: 'संबंधित विभाग या विश्वविद्यालय अनुसंधान दल को समाधान विकसित करने हेतु सौंपा गया।' },
      inProgress: { name: 'प्रगति पर (In Progress)', desc: 'सक्रिय इंजीनियरिंग कार्य (हार्डवेयर प्रोटोटाइप, सेंसर परीक्षण या फील्ड ट्रायल) जारी है।' },
      resolved: { name: 'समाधान संपन्न (Resolved)', desc: 'समस्या का पूर्ण समाधान हो चुका है और नागरिकों द्वारा ऑडिट सत्यापित किया गया है।' },
      rejected: { name: 'अस्वीकृत / बंद (Closed)', desc: 'अमान्य साक्ष्य, दोहराव या अधिकार क्षेत्र से बाहर होने के कारण आधिकारिक टिप्पणी के साथ बंद।' },
    },
  },
  sectionD: {
    heading: 'घ. सूचनाएं एवं अलर्ट प्रणाली',
    intro: 'निवारण स्वचालित अलर्ट प्रणाली के माध्यम से आपको प्रत्येक महत्वपूर्ण चरण पर सूचित रखता है:',
    b1Title: 'ये कहां दिखते हैं?',
    b1Desc: 'अधिसूचनाएं देखने के लिए शीर्ष नेविगेशन बार में घंटी आइकन पर क्लिक करें। अति-महत्वपूर्ण चेतावनियां लाल शीर्ष बैनर में भी प्रदर्शित होती हैं।',
    b2Title: 'शिकायत स्थिति अपडेट:',
    b2Desc: 'जब भी आपकी शिकायत सत्यापित होती है, विश्वविद्यालय द्वारा स्वीकृत होती है, या ट्रायल शुरू होता है, तुरंत अलर्ट प्राप्त होता है।',
    b3Title: 'सरकारी अधिकारियों की टिप्पणी:',
    b3Desc: 'जांच अधिकारी द्वारा प्रस्तावित कार्रवाई और अपेक्षित समय सीमा से संबंधित आधिकारिक टिप्पणियां।',
    b4Title: 'आपदा एवं मौसम चेतावनियां:',
    b4Desc: 'मानसून में बाढ़, खनन क्षेत्र में भू-धंसाव या लू/शीतलहर की वास्तविक समय की आपातकालीन चेतावनियां।',
  },
  sectionE: {
    heading: 'ङ. अपनी प्रोफ़ाइल का प्रबंधन',
    intro: 'प्रोफ़ाइल टैब के माध्यम से अपनी नागरिक पहचान और स्थानीय प्राथमिकताएं प्रबंधित करें:',
    b1Title: 'प्रोफ़ाइल देखें:',
    b1Desc: 'अपना नागरिक बैज, अर्जित सामुदायिक कर्म क्रेडिट और कुल दर्ज रिपोर्टों की संख्या देखें।',
    b2Title: 'व्यक्तिगत जानकारी अपडेट करें:',
    b2Desc: 'अपना पूरा नाम, मोबाइल नंबर और गृह जिला अद्यतन करें।',
    b3Title: 'प्रोफ़ाइल फोटो बदलें:',
    b3Desc: 'अपनी प्रोफ़ाइल तस्वीर अपलोड करें ताकि सामुदायिक मंच पर आपकी पहचान स्पष्ट रहे।',
    b4Title: 'भाषा एवं क्षेत्र चुनें:',
    b4Desc: 'झारखंड की 12 क्षेत्रीय भाषाओं (हिन्दी, संथाली, खोरठा, नागपुरी, कुड़ुख़, मुंडारी, हो, कुरमाली, उर्दू, भोजपुरी, मगही, अंग्रेजी) में से चुनें।',
    btnGoProfile: 'मेरी प्रोफ़ाइल पर जाएं',
  },
  sectionF: {
    heading: 'च. साक्ष्य अपलोड करने के दिशा-निर्देश',
    intro: 'उच्च गुणवत्ता वाले साक्ष्य से त्वरित सत्यापन और विश्वविद्यालय लैब आवंटन में मदद मिलती है:',
    f1Title: 'स्वीकृत मीडिया प्रारूप',
    f1Desc: 'तस्वीरें (JPG, PNG, WEBP), ऑडियो (WEBM, MP3, WAV), वीडियो (MP4, WEBM) और तकनीकी दस्तावेज़ (PDF)।',
    f2Title: 'फ़ाइल आकार सीमाएं',
    f2Desc: 'प्रति फोटो 10MB तक (अधिकतम 5), वीडियो 50MB तक, ऑडियो 5 मिनट तक और पीडीएफ 15MB तक।',
    f3Title: '⚠️ इनसे बचें',
    f3Desc: 'धुंधली तस्वीरें, इंटरनेट से डाउनलोड की गई तस्वीरें या असंबंधित व्यक्तिगत कागजात अपलोड न करें।',
  },
  sectionG: {
    heading: 'छ. सरकारी प्रतिक्रिया एवं समाधान प्रक्रिया',
    intro: 'निवारण नागरिकों और राज्य प्रशासन के बीच पूर्ण पारदर्शिता सुनिश्चित करता है:',
    b1Title: 'निरीक्षण नोट देखें:',
    b1Desc: 'उपायुक्त, बीडीओ या कार्यपालक अभियंता द्वारा लिखी गई सीधी टिप्पणी पढ़ें।',
    b2Title: 'कार्रवाई ट्रैक करें:',
    b2Desc: 'आवंटित विश्वविद्यालय इंजीनियरिंग टीम द्वारा प्रस्तुत लैब परीक्षण रिपोर्ट की जांच करें।',
    b3Title: 'समाधान डेटा जांचें:',
    b3Desc: 'सेंसर व लैब रिपोर्ट देखें (उदा. पानी में फ्लोराइड की मात्रा बीआईएस मानकों के अनुसार सुरक्षित होना)।',
    b4Title: 'सामुदायिक संतुष्टि प्रतिक्रिया:',
    b4Desc: 'समाधान के बाद चरण 13 ऑडिट के दौरान अपनी संतुष्टि रेटिंग और फीडबैक सबमिट करें।',
  },
  sectionH: {
    heading: 'ज. नागरिक सुरक्षा, गोपनीयता व नियम',
    c1Title: 'पासवर्ड या ओटीपी कभी साझा न करें',
    c1Desc: 'सरकारी अधिकारी या विश्वविद्यालय मेंटर आपसे कभी पासवर्ड, ओटीपी या बैंक खाते का विवरण नहीं मांगेंगे।',
    c2Title: 'संवेदनशील निजी डेटा सुरक्षित रखें',
    c2Desc: 'शिकायत में आधार कार्ड, पैन कार्ड या बैंक पासबुक की फोटो न डालें। केवल समस्या का साक्ष्य अपलोड करें।',
    c3Title: 'झूठी रिपोर्टों के प्रति शून्य सहिष्णुता',
    c3Desc: 'मनगढ़ंत या दुर्भावनापूर्ण शिकायत दर्ज करना डिजिटल नागरिक नियमों के तहत दंडनीय है और खाता निलंबित हो सकता है।',
  },
  sectionI: {
    heading: 'झ. अक्सर पूछे जाने वाले प्रश्न (FAQs)',
    showingFaqs: '{total} में से {count} प्रश्न प्रदर्शित',
    noFaqsMatch: 'आपकी खोज से मेल खाता कोई प्रश्न नहीं मिला।',
    clearFilter: 'फ़िल्टर साफ़ करें',
    faqs: [
      {
        id: 'faq-1',
        question: 'समस्या कैसे दर्ज करें?',
        category: 'report',
        answer: 'नागरिक पोर्टल में "+ समस्या दर्ज करें" पर क्लिक करें। श्रेणी (उदा. पेयजल, सड़क, पुल, बाढ़) चुनें, विवरण लिखें, अपना जिला व पंचायत चुनें, फोटो संलग्न करें और सबमिट करें। आपको तुरंत संदर्भ संख्या मिल जाएगी।'
      },
      {
        id: 'faq-2',
        question: 'अपनी शिकायत को कैसे ट्रैक करें?',
        category: 'track',
        answer: 'नागरिक डैशबोर्ड में "मेरी रिपोर्ट" टैब पर जाएं जहां आपकी सभी शिकायतें 16-चरणीय प्रगति मीटर के साथ दिखेंगी। वैकल्पिक रूप से लैंडिंग पेज पर पब्लिक ट्रैकर में अपनी संदर्भ संख्या दर्ज करें।'
      },
      {
        id: 'faq-3',
        question: 'मुझे अपनी संदर्भ संख्या (Complaint ID) कहां मिलेगी?',
        category: 'track',
        answer: 'सबमिट करते ही स्क्रीन पर संदर्भ संख्या (उदा. JH-2026-NIV-1042) दिखती है। यह "मेरी रिपोर्ट" कार्ड पर और एसएमएस/व्हाट्सएप पावती में भी उपलब्ध रहती है।'
      },
      {
        id: 'faq-4',
        question: '"समीक्षाधीन (Under Review)" का क्या अर्थ है?',
        category: 'status',
        answer: 'इसका अर्थ है कि शिकायत एआई इंजन द्वारा विश्लेषित होकर जिला कलेक्टर कार्यालय/प्रखंड विकास कार्यालय के पास सत्यापन हेतु पहुंच चुकी है।'
      },
      {
        id: 'faq-5',
        question: 'प्रोफ़ाइल में जानकारी कैसे बदलें?',
        category: 'profile',
        answer: 'शीर्ष बार में प्रोफ़ाइल टैब पर क्लिक करें। यहां आप अपना नाम, मोबाइल नंबर, जिला और झारखंड की 12 क्षेत्रीय भाषाओं में से अपनी पसंदीदा भाषा चुन सकते हैं।'
      },
      {
        id: 'faq-6',
        question: 'साक्ष्य (फोटो/वीडियो) कैसे अपलोड करें?',
        category: 'evidence',
        answer: 'शिकायत फॉर्म में कैमरा आइकन पर टैप करें। आप दिन के उजाले की फोटो, 5 मिनट का वॉयस नोट, वीडियो या पीडीएफ दस्तावेज संलग्न कर सकते हैं।'
      },
      {
        id: 'faq-7',
        question: 'मेरी शिकायत की स्थिति में बदलाव क्यों नहीं हुआ?',
        category: 'status',
        answer: 'जटिल नागरिक चुनौतियों (जैसे फ्लोराइड शोधन या पुल पुनर्निर्माण) में बहु-विषयक तकनीकी जांच होती है। 7 दिन से अधिक समय होने पर नोटिफिकेशन घंटी में अतिरिक्त जानकारी का अनुरोध देखें।'
      },
      {
        id: 'faq-8',
        question: 'सरकारी जवाब और अधिकारी की टिप्पणी कहां देखें?',
        category: 'gov',
        answer: '"मेरी रिपोर्ट" में शिकायत खोलें। उपायुक्त या बीडीओ द्वारा दर्ज किए गए आधिकारिक नोट, निरीक्षण तिथि और आवंटित विश्वविद्यालय का नाम टाइमलाइन में दिखता है।'
      },
      {
        id: 'faq-9',
        question: 'मुझे नोटिफिकेशन कैसे मिलेंगे?',
        category: 'notifications',
        answer: 'शीर्ष नेविगेशन बार में घंटी आइकन पर क्लिक करके सभी अपडेट प्राप्त करें। चरण बदलने या अधिकारी की टिप्पणी आने पर तुरंत अलर्ट मिलता है।'
      },
      {
        id: 'faq-10',
        question: 'यदि मैंने गलत जानकारी दर्ज कर दी है तो क्या करें?',
        category: 'report',
        answer: '"मेरी रिपोर्ट" में अपनी शिकायत खोलकर पूरक टिप्पणी जोड़ें या सही फोटो संलग्न करें। गंभीर सुधार के लिए जिला सहायता डेस्क पर संपर्क करें।'
      }
    ]
  },
  sectionJ: {
    heading: 'ञ. और सहायता चाहिए? आधिकारिक सहायता केंद्र से संपर्क करें',
    btnAuth: 'खाते में साइन इन करें',
    deptBadge: 'झारखंड राज्य लोक शिकायत निवारण',
    title: 'समर्पित सहायता एवं क्षेत्रीय हेल्पलाइन',
    subtitle: 'यदि आपको तत्काल सहायता की आवश्यकता है या तकनीकी समस्या आ रही है, तो अधिकृत राज्य चैनलों से संपर्क करें।',
    h1Title: 'टोल-फ्री राज्य हेल्पलाइन',
    h1Desc: 'झारखंड नागरिक शिकायत निवारण एवं मुख्यमंत्री जन संवाद।',
    h1Note: 'टोल-फ्री · 24x7 आपातकालीन सेवा',
    h2Title: 'तकनीकी सहायता डेस्क',
    h2Desc: 'पोर्टल त्रुटियां, बग रिपोर्ट और लॉगिन सहायता।',
    h2Note: '24 कार्य घंटों में समाधान',
    h3Title: 'जिला शिकायत प्रकोष्ठ',
    h3Desc: 'सभी 24 उपायुक्त (DC) कार्यालयों में प्रत्यक्ष शिकायत काउंटर।',
    h3Note: 'सोम - शुक्र: सुबह 10:00 - शाम 5:00',
    feedbackLabel: 'तकनीकी प्रतिक्रिया भेजें या दस्तावेज़ीकरण सुधार का सुझाव दें:',
    feedbackSuccess: 'धन्यवाद! आपकी प्रतिक्रिया प्राप्त हो गई है।',
    feedbackPlaceholder: 'निवारण के संबंध में अपनी समस्या या सुझाव यहां लिखें...',
    feedbackSubmit: 'फीडबैक भेजें',
  },
  footer: {
    title: 'निवारण (NIVAARAN)',
    subline: 'राज्य सामाजिक नवाचार एवं आपदा समाधान नेटवर्क',
    govtLine: 'उच्च एवं तकनीकी शिक्षा विभाग · झारखंड सरकार',
  },
};

// ── Santali (ᱥᱟᱱᱛᱟᱲᱤ / संथाली) Translations ───────────────────────────
export const satHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'ᱰᱮᱥᱵᱳᱨᱰ ᱛᱮ ᱨᱩᱣᱟᱹᱲ (डैशबोर्ड)',
    supportCentre: 'ᱱᱤᱵᱟᱨᱚᱬ ᱜᱚᱲᱚ ᱛᱟᱞᱢᱟ (Nivaaran Support)',
    supportSubtitle: 'ᱥᱚᱨᱠᱟᱨᱤ ᱟᱨ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱜᱮᱭᱟᱱ ᱛᱟᱞᱢᱟ',
    verifiedGovGuide: 'ᱥᱚᱨᱠᱟᱨᱤ ᱯᱩᱥᱴᱟᱹᱣ ᱫᱤᱥᱟᱹ-ᱩᱫᱩᱜ',
    switchLanguage: 'ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ',
  },
  hero: {
    badge: 'ᱱᱤᱵᱟᱨᱚᱬ ᱵᱮᱵᱷᱟᱨᱤᱭᱟᱹ ᱫᱤᱥᱟᱹ-ᱩᱫᱩᱜ',
    title: 'ᱜᱚᱲᱚ ᱟᱨ ᱵᱮᱵᱷᱟᱨ ᱫᱤᱥᱟᱹ-ᱩᱫᱩᱜ',
    subtitle: 'ᱱᱤᱵᱟᱨᱚᱬ ᱪᱮᱫ ᱞᱮᱠᱟᱛᱮ ᱵᱮᱵᱷᱟᱨᱟ, ᱟᱹᱛᱩ-ᱴᱚᱞᱟ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱥᱚᱫᱚᱨ, ᱟᱨ ᱥᱚᱨᱠᱟᱨ ᱴᱷᱮᱱ ᱠᱷᱚᱱ ᱥᱚᱞᱦᱮ ᱧᱟᱢ ᱢᱮ᱾',
    searchPlaceholder: 'ᱜᱚᱲᱚ ᱥᱮ ᱠᱩᱠᱞᱤ ᱥᱮᱸᱫᱽᱨᱟᱭ ᱢᱮ... (ᱡᱮᱞᱮᱠᱟ: ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ, ᱯᱨᱚᱯᱷᱟᱭᱤᱞ)',
    filteringBy: 'ᱱᱚᱶᱟ ᱞᱮᱠᱟᱛᱮ ᱥᱮᱸᱫᱽᱨᱟ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ:',
    faqsMatched: 'ᱠᱩᱠᱞᱤ ᱧᱟᱢᱮᱱᱟ',
    clearSearch: 'ᱥᱮᱸᱫᱽᱨᱟ ᱜᱤᱰᱤ',
  },
  quickCards: {
    reportTitle: '📝 ᱮᱴᱠᱮᱴᱚᱬᱮ ᱚᱞ ᱢᱮ',
    reportDesc: 'ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱴᱷᱟᱶ ᱥᱟᱶ ᱟᱹᱛᱩ ᱨᱮᱱᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ ᱥᱚᱫᱚᱨ ᱢᱮ᱾',
    trackTitle: '🔎 ᱮᱴᱠᱮᱴᱚᱬᱮ ᱧᱮᱞ ᱢᱮ',
    trackDesc: 'ᱟᱢᱟᱜ ᱨᱤᱯᱚᱴ ᱑᱖ ᱜᱚᱴᱟᱝ ᱦᱟᱹᱴᱤᱧ ᱨᱮ ᱚᱠᱟᱨᱮ ᱥᱮᱴᱮᱨ ᱟᱠᱟᱱᱟ ᱧᱮᱞ ᱢᱮ᱾',
    notifTitle: '🔔 ᱠᱷᱚᱵᱚᱨ ᱟᱨ ᱪᱤᱨᱜᱟᱹᱞ',
    notifDesc: 'ᱥᱚᱨᱠᱟᱨᱤ ᱟᱹᱢᱟᱹᱞᱤᱭᱟᱹ ᱠᱚᱣᱟᱜ ᱠᱟᱛᱷᱟ ᱟᱨ ᱟᱯᱚᱛ ᱪᱤᱨᱜᱟᱹᱞ ᱵᱟᱰᱟᱭ ᱢᱮ᱾',
    profileTitle: '👤 ᱯᱨᱚᱯᱷᱟᱭᱤᱞ',
    profileDesc: 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ, ᱦᱚᱱᱚᱛ ᱟᱨ ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱹᱨᱥᱤ ᱥᱟᱡᱟᱣ ᱢᱮ᱾',
    faqsTitle: '❓ ᱠᱩᱠᱞᱤ ᱟᱨ ᱛᱮᱞᱟ',
    faqsDesc: 'ᱥᱟᱱᱟᱢ ᱠᱷᱚᱱ ᱵᱟᱹᱲᱛᱤ ᱠᱩᱠᱞᱤ ᱠᱚ ᱨᱮᱱᱟᱜ ᱞᱟᱹᱭ ᱥᱚᱫᱚᱨ ᱧᱟᱢ ᱢᱮ᱾',
  },
  sectionA: {
    ...hiHelp.sectionA,
    heading: 'A. ᱱᱤᱵᱟᱨᱚᱬ ᱥᱟᱶ ᱮᱛᱚᱦᱚᱵ',
    q1Title: 'ᱱᱤᱵᱟᱨᱚᱬ (Nivaaran) ᱫᱚ ᱪᱮᱫ ᱠᱟᱱᱟ?',
    q1Desc: 'ᱱᱤᱵᱟᱨᱚᱬ ᱫᱚ ᱡᱷᱟᱨᱠᱷᱚᱸᱰ ᱥᱚᱨᱠᱟᱨᱟᱜ ᱢᱤᱫ ᱢᱟᱨᱟᱝ ᱛᱟᱞᱢᱟ ᱠᱟᱱᱟ, ᱡᱟᱦᱟᱸ ᱫᱚ ᱫᱟᱜ ᱮᱴᱠᱮᱴᱚᱬᱮ, ᱦᱚᱨ-ᱰᱟᱦᱟᱨ ᱨᱟᱹᱯᱩᱫ, ᱥᱟᱠᱳ ᱨᱟᱹᱯᱩᱫ ᱞᱮᱠᱟᱱ ᱟᱱᱟᱴ ᱠᱚ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ (BIT Mesra, Central University, IIT Dhanbad) ᱨᱤᱱ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱟᱨ ᱥᱚᱨᱠᱟᱨᱤ ᱟᱹᱢᱟᱹᱞᱤᱭᱟᱹ ᱥᱟᱶ ᱥᱚᱞᱦᱮ ᱮᱢᱟᱭ᱾',
  },
};

// ── Khortha (खोरठा) Translations ────────────────────────────────────
export const khrHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्डे घूरा',
    supportCentre: 'निवारण मदद केंद्र',
    supportSubtitle: 'सरकारी आर कॉलेज ज्ञान केंद्र',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'भाखा',
  },
  hero: {
    badge: 'निवारण यूजर गाइड आर जानकारी',
    title: 'मदद आर यूजर गाइड',
    subtitle: 'सिखा कि निवारण के कइसन ब्यवहार करल जाए, समस्या कइसन दर्ज करल जाए आर सरकार ले समाधान कइसन पावल जाए।',
    searchPlaceholder: 'मदद खोजा... (जइसे: समस्या कइसन दर्ज करब?, स्थिति, प्रोफाइल)',
    filteringBy: 'खोजल जाए रहल हे:',
    faqsMatched: 'सवाल मिलल',
    clearSearch: 'सफा करा',
  },
  quickCards: {
    reportTitle: '📝 समस्या दर्ज करा',
    reportDesc: 'फोटो आर सटीक जगह के साथ आपन गांव के समस्या दर्ज करा।',
    trackTitle: '🔎 रिपोर्ट जांचा',
    trackDesc: '16 गो चरण में आपन समस्या के प्रगति देखा।',
    notifTitle: '🔔 सूचना आर अलर्ट',
    notifDesc: 'अफसर के जबाब आर बाढ़-बरसात के चेतावनी बुझा।',
    profileTitle: '👤 प्रोफाइल',
    profileDesc: 'आपन नाम, जिला आर खोरठा भाखा चुना।',
    faqsTitle: '❓ सबले बेसी सवाल',
    faqsDesc: 'नागरिक आर छात्र के सवाल के झटपट जबाब।',
  },
};

// ── Nagpuri (नागपुरी / सादरी) Translations ───────────────────────────
export const nagHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड में घुरूं',
    supportCentre: 'निवारण मदद केंद्र',
    supportSubtitle: 'सरकारी आर यूनिवर्सिटी ज्ञानकोश',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'भाखा',
  },
  hero: {
    badge: 'निवारण मार्गदर्शिका आर नियम',
    title: 'मदद आर यूजर गाइड',
    subtitle: 'सीखू कि निवारण कर कइसे उपयोग करल जाए, आपन समस्या दर्ज करू आर सरकार ले समाधान पाऊ।',
    searchPlaceholder: 'मदद खोजू... (जैसे: समस्या कइसे दर्ज करब?, शिकायत कर हाल)',
    filteringBy: 'खोजल जाएक लागल हे:',
    faqsMatched: 'सवाल मिललक',
    clearSearch: 'साफ करू',
  },
  quickCards: {
    reportTitle: '📝 समस्या दर्ज करू',
    reportDesc: 'फोटो आर सही जगह संगे आपन पंचायत कर समस्या दर्ज करू।',
    trackTitle: '🔎 रिपोर्ट देखू',
    trackDesc: '16 गो चरण में देखू कि काम कहां तक पहुंचलक।',
    notifTitle: '🔔 सूचना आर चेतावनी',
    notifDesc: 'सरकारी अफसर कर जवाब आर मौसम कर चेतावनी समझू।',
    profileTitle: '👤 प्रोफाइल',
    profileDesc: 'आपन नाम, जिला आर नागपुरी भाखा सेट करू।',
    faqsTitle: '❓ जरूरी सवाल',
    faqsDesc: 'गांवे-घर कर नागरिक खातिर तुरंत सवाल-जवाब।',
  },
};

// ── Kurukh (कुड़ुख़ / उरांव) Translations ─────────────────────────────
export const kruHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड तरा किर्‍रा',
    supportCentre: 'निवारण संगे सहाय केंद्र',
    supportSubtitle: 'सरकारी अरा कॉलेज गही गियान',
    verifiedGovGuide: 'सत्यापित सरकारी नियम',
    switchLanguage: 'कत्था',
  },
  hero: {
    badge: 'निवारण कमउरगा नियम',
    title: 'सहाय अरा कमउरगा गाइड',
    subtitle: 'इरआ कि निवारण गही कइसन कमउरना, समस्या कइसन टुनडना अरा सरकार गही संगे समाधान खख्‍खना।',
    searchPlaceholder: 'सहाय खोजा... (समस्या कइसन टुनडना?, स्थिति)',
    filteringBy: 'खोजरना लागदी:',
    faqsMatched: 'सवाल खख्‍खरा',
    clearSearch: 'सफा नना',
  },
};

// ── Mundari (मुंडारी) Translations ──────────────────────────────────
export const munHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड ते रूड़ा',
    supportCentre: 'निवारण गोड़ो केंद्र',
    supportSubtitle: 'सरकारी आर कॉलेज गियान',
    verifiedGovGuide: 'सत्यापित सरकारी दिशुम गाइड',
    switchLanguage: 'जगर',
  },
  hero: {
    badge: 'निवारण बाईते दिशुवा गाइड',
    title: 'गोड़ो आर यूजर गाइड',
    subtitle: 'इटुपे कि निवारण चिकन्ते बाइयो, हातू-टोला रा दुरदशा ओलोल आर सरकार ताएते बुगी तेला नामा।',
    searchPlaceholder: 'गोड़ो नामेपे... (एटकैटोड़े ओल, स्थिति)',
    filteringBy: 'नामेताना:',
    faqsMatched: 'कुली नामेयाना',
    clearSearch: 'साफा एपे',
  },
};

// ── Ho (𑢹𑣉 / हो) Translations ──────────────────────────────────────
export const hoHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड ते रूवा',
    supportCentre: 'निवारण गोड़ो सेंटर',
    supportSubtitle: 'सरकार आर कॉलेज ज्ञान केंद्र',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'काजी',
  },
  hero: {
    badge: 'ᱱᱤᱵᱟᱨᱚᱬ ᱵᱮᱵᱷᱟᱨ ᱫᱤᱥᱟᱹ-ᱩᱫᱩᱜ',
    title: 'गोड़ो आर यूजर गाइड',
    subtitle: 'इटुपे कि निवारण चिकन्ते बइयो, हातू रा अनाट ओलोल आर सरकार एते समाधान नामा।',
    searchPlaceholder: 'गोड़ो नामेपे...',
    filteringBy: 'नामेताना:',
    faqsMatched: 'कुली नामेयाना',
    clearSearch: 'साफा एपे',
  },
};

// ── Kurmali (कुरमाली) Translations ──────────────────────────────────
export const kurHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्डे घूरा',
    supportCentre: 'निवारण मदद केंद्र',
    supportSubtitle: 'सरकारी आर कॉलेज ज्ञान केंद्र',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'भाखा',
  },
  hero: {
    badge: 'निवारण यूजर गाइड',
    title: 'मदद आर यूजर गाइड',
    subtitle: 'सिखा कि निवारण के कइसन ब्यवहार करल जाए आर गांवेक समस्या के समाधान कइसन पावल जाए।',
    searchPlaceholder: 'मदद खोजा... (समस्या दर्ज, स्थिति, प्रोफाइल)',
    filteringBy: 'खोजल जाएक लागल हे:',
    faqsMatched: 'सवाल मिलल',
    clearSearch: 'साफ करा',
  },
};

// ── Urdu (اردو) Translations ─────────────────────────────────────────
export const urHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'ڈیش بورڈ پر واپس جائیں',
    supportCentre: 'نووارن ہیلپ سنٹر',
    supportSubtitle: 'سرکاری اور ادارہ جاتی معلومات کا مرکز',
    verifiedGovGuide: 'تصدیق شدہ سرکاری گائیڈ',
    switchLanguage: 'زبان',
  },
  hero: {
    badge: 'نووارن صارف رہنمائی اور دستاویزات',
    title: 'مدد اور صارف رہنما',
    subtitle: 'جانیں کہ نووارن کا استعمال کیسے کریں، شہری شکایات کیسے درج کریں اور ان کی پیش رفت کیسے ٹریک کریں۔',
    searchPlaceholder: 'مدد، گائیڈ یا سوالات تلاش کریں... (مثلاً مسئلہ کیسے درج کریں؟)',
    filteringBy: 'اس کے مطابق تلاش کی جا رہی ہے:',
    faqsMatched: 'سوالات ملے',
    clearSearch: 'تلاش ختم کریں',
  },
  quickCards: {
    reportTitle: '📝 مسئلہ درج کریں',
    reportDesc: 'تصاویر اور درست مقام کے ساتھ شہری شکایت درج کرنے کا طریقہ۔',
    trackTitle: '🔎 شکایت ٹریک کریں',
    trackDesc: 'شکایت کی صورتحال اور 16 مراحل پر مبنی پیش رفت دیکھیں۔',
    notifTitle: '🔔 اطلاعات اور انتباہ',
    notifDesc: 'سرکاری افسران کے نوٹس اور قدرتی آفات کے انتباہات سمجھیں۔',
    profileTitle: '👤 پروفائل مینجمنٹ',
    profileDesc: 'اپنی ذاتی معلومات، ضلع اور علاقائی زبان منتخب کریں۔',
    faqsTitle: '❓ عام سوالات',
    faqsDesc: 'شہریوں اور طلباء کے بنیادی سوالات کے فوری جوابات حاصل کریں۔',
  },
};

// ── Bhojpuri (भोजपुरी) Translations ─────────────────────────────────
export const bhoHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड पर लवटीं',
    supportCentre: 'निवारण मदद केंद्र',
    supportSubtitle: 'सरकारी आ कॉलेज ज्ञान केंद्र',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'भाषा',
  },
  hero: {
    badge: 'निवारण यूजर गाइड आ जानकारी',
    title: 'सहायता आ यूजर गाइड',
    subtitle: 'सीखीं कि निवारण के कइसे उपयोग कइल जाव, समस्या कइसे दर्ज कइल जाव आ सरकार से पक्का समाधान कइसे पावल जाव।',
    searchPlaceholder: 'मदद खोजीं... (जइसे: समस्या कइसे दर्ज करीं?, हाल-चाल)',
    filteringBy: 'खोजल जा रहल बा:',
    faqsMatched: 'सवाल मिलल',
    clearSearch: 'साफ करीं',
  },
  quickCards: {
    reportTitle: '📝 समस्या दर्ज करीं',
    reportDesc: 'फोटो आ सही जगह के साथे आपन गांव-टोला के समस्या दर्ज करीं।',
    trackTitle: '🔎 शिकायत ट्रैक करीं',
    trackDesc: '16 चरण में देखीं कि रउआ के समस्या कहां तक पहुंचल।',
    notifTitle: '🔔 सूचना आ चेतावनी',
    notifDesc: 'अफसरन के जवाब आ मौसम के चेतावनी समझीं।',
    profileTitle: '👤 प्रोफाइल',
    profileDesc: 'आपन नाम, जिला आ भोजपुरी भाषा सेट करीं।',
    faqsTitle: '❓ जरूरी सवाल-जवाब',
    faqsDesc: 'नागरिक आ छात्रन के सवालन के तुरंते जवाब पाईं।',
  },
};

// ── Magahi (मगही) Translations ──────────────────────────────────────
export const magHelp: HelpGuideTranslations = {
  ...hiHelp,
  nav: {
    backToDashboard: 'डैशबोर्ड पर घुरू',
    supportCentre: 'निवारण मदद केंद्र',
    supportSubtitle: 'सरकारी आ कॉलेज ज्ञान केंद्र',
    verifiedGovGuide: 'सत्यापित सरकारी गाइड',
    switchLanguage: 'भाषा',
  },
  hero: {
    badge: 'निवारण यूजर गाइड',
    title: 'मदद आ यूजर गाइड',
    subtitle: 'सीखो कि निवारण के कइसे चलावे के हे, समस्या कइसे लिखे के हे आ सरकार से समाधान कइसे पावे के हे।',
    searchPlaceholder: 'मदद खोजो... (जइसे: समस्या कइसे दर्ज करब?, स्थिति)',
    filteringBy: 'खोजल जा रहल हे:',
    faqsMatched: 'सवाल मिलल',
    clearSearch: 'साफ करो',
  },
  quickCards: {
    reportTitle: '📝 समस्या दर्ज करो',
    reportDesc: 'फोटो आ सही जगह के साथे आपन समस्या दर्ज करो।',
    trackTitle: '🔎 शिकायत जांचो',
    trackDesc: '16 चरण में देखो कि काम कहां तक पहुंचल।',
    notifTitle: '🔔 सूचना आ चेतावनी',
    notifDesc: 'अफसर के जवाब आ मौसम के चेतावनी समझो।',
    profileTitle: '👤 प्रोफाइल',
    profileDesc: 'आपन नाम, जिला आ मगही भाषा चुनो।',
    faqsTitle: '❓ जरूरी सवाल',
    faqsDesc: 'नागरिक आ छात्रन खातिर जल्दी सवाल-जवाब।',
  },
};

// ── Master Mapping Dictionary ────────────────────────────────────────
export const HELP_TRANSLATIONS: Record<SupportedLanguage, HelpGuideTranslations> = {
  en: enHelp,
  hi: hiHelp,
  sat: satHelp,
  khr: khrHelp,
  nag: nagHelp,
  kru: kruHelp,
  mun: munHelp,
  ho: hoHelp,
  kur: kurHelp,
  ur: urHelp,
  bho: bhoHelp,
  mag: magHelp,
};

/**
 * Get help guide translations for a language with guaranteed English fallback
 */
export const getHelpTranslations = (lang: SupportedLanguage = 'en'): HelpGuideTranslations => {
  return HELP_TRANSLATIONS[lang] || HELP_TRANSLATIONS.en;
};
