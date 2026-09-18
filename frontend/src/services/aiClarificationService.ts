// NIVAARAN Conversational Voice AI Clarification Engine
// Inspects citizen grievance posts for missing critical evidence
// Synthesizes counter questions aloud in Hindi or English
// Penalizes priority score by 18 points if clarification is skipped

export interface ClarificationQuestion {
  id: string;
  round: 1 | 2;
  domain: string;
  titleHi: string;
  titleEn: string;
  questionHi: string;
  questionEn: string;
  placeholderHi: string;
  placeholderEn: string;
  contextHintHi: string;
  contextHintEn: string;
}

export interface AnalysisInput {
  title: string;
  description: string;
  district: string;
  blockVillage: string;
  affectedPopulation?: number;
  audioTranscript?: string;
  categoryCode?: string;
}

// 8 Civic Domains mapped to 2-Round Conversational Questions
export const DOMAIN_CLARIFICATIONS: Record<string, { round1: ClarificationQuestion; round2: ClarificationQuestion }> = {
  flooding_drainage: {
    round1: {
      id: 'flood_r1',
      round: 1,
      domain: 'flooding_drainage',
      titleHi: 'जलभराव की गहराई एवं आवागमन रुकावट',
      titleEn: 'Waterlogging Depth & Access Blockage',
      questionHi: 'सड़क या बस्ती में जमा पानी कितना गहरा है, और क्या यह स्कूली बच्चों, एम्बुलेंस या घरों के रास्ते को सीधे रोक रहा है?',
      questionEn: 'How deep is the stagnant floodwater on the ground, and is it directly blocking school children, emergency vehicles, or homes?',
      placeholderHi: 'उदा. लगभग 3 से 4 फीट गहरा पानी भरा है; स्कूल वैन और मरीजों की गाड़ियां नहीं निकल पा रही हैं...',
      placeholderEn: 'e.g. Around 3 to 4 feet deep runoff; road is completely impassable for school vans and patients...',
      contextHintHi: 'गहराई का सटीक विवरण आपातकालीन पंप और राहत कार्य की प्राथमिकता तय करता है।',
      contextHintEn: 'Depth metrics establish emergency pump deployment priority.',
    },
    round2: {
      id: 'flood_r2',
      round: 2,
      domain: 'flooding_drainage',
      titleHi: 'प्रभावित परिवार एवं जलस्तर की प्रवृत्ति',
      titleEn: 'Affected Families & Rising Water Trend',
      questionHi: 'समझा। लगभग कितने परिवार या छात्र फंसे हुए हैं, और क्या पिछले 24 घंटों में जलस्तर लगातार बढ़ रहा है?',
      questionEn: 'Understood. Approximately how many families or students are stranded, and has the water level risen in the last 24 hours?',
      placeholderHi: 'उदा. 120 से ज्यादा परिवार फंसे हैं; सुबह से 15 घरों के आंगनों में पानी घुस गया है...',
      placeholderEn: 'e.g. Over 120 families cut off; water entered 15 courtyard verandas this morning...',
      contextHintHi: 'फंसी हुई आबादी का आंकड़ा राज्य आपदा राहत (SDRF) और त्वरित निकासी को सक्रिय करता है।',
      contextHintEn: 'Stranded population metrics escalate immediate NDRF/SDRF and municipal disaster relief.',
    },
  },

  water_contamination: {
    round1: {
      id: 'water_r1',
      round: 1,
      domain: 'water_contamination',
      titleHi: 'जल प्रदूषण का स्रोत एवं प्रत्यक्ष लक्षण',
      titleEn: 'Contamination Source & Physical Symptoms',
      questionHi: 'दूषित पानी का मुख्य स्रोत क्या है (चापाकल, सरकारी पाइप, कुआं), और क्या पानी में दुर्गंध, पीला/काला रंग या बीमारी के लक्षण दिख रहे हैं?',
      questionEn: 'What is the affected water source (handpump, pipeline, open well), and do you notice foul odor, dark/yellow color, or illness?',
      placeholderHi: 'उदा. मुख्य सरकारी चापाकल से लाल मटमैला पानी आ रहा है जिसमें जंग की बदबू है; कई लोग बीमार पड़े हैं...',
      placeholderEn: 'e.g. Main PHED handpump pumps reddish turbid water with metallic odor; 8 children fell sick...',
      contextHintHi: 'प्रदूषण के लक्षणों से जनस्वास्थ्य अभियांत्रिकी विभाग (PHED) की टेस्टिंग लैब तुरंत भेजी जाती है।',
      contextHintEn: 'Water contamination indicators trigger immediate PHED mobile laboratory dispatch.',
    },
    round2: {
      id: 'water_r2',
      round: 2,
      domain: 'water_contamination',
      titleHi: 'निर्भर परिवार एवं सुरक्षित पेयजल विकल्प',
      titleEn: 'Dependent Households & Alternative Sources',
      questionHi: 'समझा। इस खराब जल स्रोत पर लगभग कितने परिवार निर्भर हैं, और क्या गांव में पास कोई अन्य साफ पानी का विकल्प है?',
      questionEn: 'Got it. Approximately how many households rely on this contaminated point, and is there any other safe drinking source nearby?',
      placeholderHi: 'उदा. पूरे टोले के 65 परिवार इसी चापाकल पर निर्भर हैं; दूसरा कुआं 2 किलोमीटर दूर है...',
      placeholderEn: 'e.g. Entire tola of 65 families depends on this single pump; nearest well is 2 km away...',
      contextHintHi: 'पेयजल संकट की पुष्टि होने पर आपातकालीन टैंकरों की तत्काल आपूर्ति की जाती है।',
      contextHintEn: 'Identifies critical water scarcity to dispatch emergency mobile water tankers.',
    },
  },

  mining_subsidence_fire: {
    round1: {
      id: 'mining_r1',
      round: 1,
      domain: 'mining_subsidence_fire',
      titleHi: 'जमीनी दरारें एवं जहरीला धुआं',
      titleEn: 'Surface Fissures & Toxic Gas Venting',
      questionHi: 'क्या रिहायशी घरों या सड़कों के पास जमीन फटने, धुआं निकलने या जमीन अत्यधिक गर्म होने की स्थिति है?',
      questionEn: 'Are there widening ground cracks, smoking fissures, or excessive ground heat near residential quarters or transit roads?',
      placeholderHi: 'उदा. बस्ती के पास 1 मीटर चौड़ी दरार पड़ गई है और सल्फर का तीखा धुआं निकल रहा है...',
      placeholderEn: 'e.g. Fissure widened to 1 meter near basti edge; thick sulfur smoke and steam venting...',
      contextHintHi: 'धंसान और गैस रिसाव की जानकारी DGMS और कोयला कंपनी की सुरक्षा इकाई को सतर्क करती है।',
      contextHintEn: 'Subsidence data alerts Directorate General of Mines Safety (DGMS) and BCCL/CCL emergency units.',
    },
    round2: {
      id: 'mining_r2',
      round: 2,
      domain: 'mining_subsidence_fire',
      titleHi: 'घरों से दूरी एवं संरचनात्मक खतरा',
      titleEn: 'Proximity to Homes & Wall Cracking',
      questionHi: 'समझा। आग या दरार सबसे नजदीकी मकान से कितनी दूरी पर है, और क्या घरों की दीवारों में दरारें आई हैं?',
      questionEn: 'Understood. How close is the active smoke or fissure to the nearest occupied home, and have wall cracks appeared?',
      placeholderHi: 'उदा. 4 पक्के मकानों से मात्र 15 मीटर दूर है; 2 घरों की दीवारों में गहरी दरारें आ चुकी हैं...',
      placeholderEn: 'e.g. Barely 15 meters from 4 pucca houses; walls of 2 houses have already developed diagonal cracks...',
      contextHintHi: 'संरचनात्मक क्षति से तत्काल पुनर्वास और सुरक्षित स्थल पर स्थानांतरण की प्रक्रिया शुरू होती है।',
      contextHintEn: 'Structural damage severity triggers mandatory rehabilitation and evacuation protocols.',
    },
  },

  road_bridge_collapse: {
    round1: {
      id: 'road_r1',
      round: 1,
      domain: 'road_bridge_collapse',
      titleHi: 'सड़क/पुलिया क्षति एवं आवागमन ठप',
      titleEn: 'Road Fracture & Transit Cutoff',
      questionHi: 'क्या सड़क या पुलिया पूरी तरह टूट या बह गई है, और क्या चार पहिया वाहनों और एम्बुलेंस का जाना बिल्कुल बंद है?',
      questionEn: 'Has the road or bridge completely collapsed or washed away, and is four-wheeler or ambulance movement completely blocked?',
      placeholderHi: 'उदा. बाढ़ से पुलिया धंस गई है; सड़क के बीच 10 फीट का गड्ढा है और कोई गाड़ी नहीं निकल सकती...',
      placeholderEn: 'e.g. Culvert collapsed after flash flood; 10-foot crater across the road, no vehicle can pass...',
      contextHintHi: 'सड़क टूटने पर पथ निर्माण विभाग (RCD) द्वारा आपातकालीन डायवर्जन का निर्माण कराया जाता है।',
      contextHintEn: 'Road cutoff triggers Road Construction Department (RCD) emergency culvert diversion.',
    },
    round2: {
      id: 'road_r2',
      round: 2,
      domain: 'road_bridge_collapse',
      titleHi: 'संपर्कविहीन पंचायतें एवं वैकल्पिक मार्ग',
      titleEn: 'Cutoff Panchayats & Detour Distance',
      questionHi: 'समझा। इस संपर्क टूटने से कितने गांव या पंचायतें कट गई हैं, और वैकल्पिक रास्ता कितनी दूरी का है?',
      questionEn: 'Understood. How many villages or panchayats are disconnected by this breach, and how long is the detour route?',
      placeholderHi: 'उदा. 4 पंचायतें अलग-थलग हो गई हैं; वैकल्पिक रास्ता जंगल से 18 किमी लंबा है...',
      placeholderEn: 'e.g. 4 panchayats cut off; alternative route through forest requires 18 km extra travel...',
      contextHintHi: 'कट चुकी आबादी के पैमाने से आपातकालीन आपदा मरम्मत फंड तुरंत स्वीकृत होता है।',
      contextHintEn: 'Population cutoff scale determines high-priority state disaster road restoration funds.',
    },
  },

  wildlife_conflict: {
    round1: {
      id: 'wildlife_r1',
      round: 1,
      domain: 'wildlife_conflict',
      titleHi: 'वन्यजीव की मौजूदगी एवं गांव से निकटता',
      titleEn: 'Animal Presence & Proximity to Village',
      questionHi: 'कौन सा वन्यजीव खतरे का कारण बना है (जैसे हाथियों का झुंड, तेंदुआ, जंगली सूअर), और क्या वह अभी घरों या स्कूल के रास्तों के पास है?',
      questionEn: 'Which wild animal is causing the hazard (e.g. wild elephant herd, leopard, boar), and is it currently near homes or school paths?',
      placeholderHi: 'उदा. प्राथमिक विद्यालय से 200 मीटर दूर धान के खेतों में 12 हाथियों का झुंड आ गया है...',
      placeholderEn: 'e.g. A herd of 12 wild elephants entered paddy fields 200m from primary school...',
      contextHintHi: 'वन्यजीव की निकटता से वन विभाग की क्विक रिस्पांस टीम (QRT) और हूटर वाहन रवाना होते हैं।',
      contextHintEn: 'Animal proximity alerts Forest Division Quick Response Teams (QRT) and hooter vehicles.',
    },
    round2: {
      id: 'wildlife_r2',
      round: 2,
      domain: 'wildlife_conflict',
      titleHi: 'फसल हानि, मानवीय खतरा एवं रात्रि सुरक्षा',
      titleEn: 'Crop Loss, Injuries & Night Risk',
      questionHi: 'समझा। क्या किसी ग्रामीण को चोट आई है या फसल का नुकसान हुआ है, और क्या वनरक्षक मौके पर पहुंचे हैं?',
      questionEn: 'Understood. Has any villager been injured or crop acreage damaged, and has the forest beat staff arrived?',
      placeholderHi: 'उदा. 20 बीघा धान की फसल रौंद दी गई है; अभी जनहानि नहीं हुई पर ग्रामीण छतों पर रतजगा कर रहे हैं...',
      placeholderEn: 'e.g. 20 bighas of standing paddy trampled; no casualties yet but villagers are awake guarding roofs...',
      contextHintHi: 'फसल नुकसान का ब्योरा वन विभाग के मुआवजा पोर्टल पर त्वरित स्वीकृति के लिए भेजा जाता है।',
      contextHintEn: 'Crop damage logs fast-track compensation claims under State Forest Department norms.',
    },
  },

  waste_sewage_chemical: {
    round1: {
      id: 'waste_r1',
      round: 1,
      domain: 'waste_sewage_chemical',
      titleHi: 'कचरे का प्रकार एवं खुले में डंपिंग खतरा',
      titleEn: 'Waste Classification & Open Dumping Hazard',
      questionHi: 'किस प्रकार का कचरा या अपशिष्ट जमा है (फैक्ट्री स्लरी, मेडिकल कचरा, सीवेज), और क्या यह नाले या पीने के पानी के पास फैल रहा है?',
      questionEn: 'What type of waste is overflowing or illegally dumped (industrial sludge, medical syringes, sewage), and is it near open drains or drinking water?',
      placeholderHi: 'उदा. खदान के बंधे से लाल कीचड़ बहकर गांव की मुख्य नाली और खेत में भर रहा है...',
      placeholderEn: 'e.g. Red hematite iron slurry flowing from broken bund into village drainage canal...',
      contextHintHi: 'रासायनिक कचरा होने पर प्रदूषण नियंत्रण बोर्ड (JSPCB) का संयुक्त निरीक्षण तय होता है।',
      contextHintEn: 'Chemical/toxic waste flags Jharkhand State Pollution Control Board (JSPCB) inspection.',
    },
    round2: {
      id: 'waste_r2',
      round: 2,
      domain: 'waste_sewage_chemical',
      titleHi: 'स्वास्थ्य खतरा एवं उत्तरदायी स्रोत',
      titleEn: 'Health Threat & Source Identification',
      questionHi: 'समझा। क्या स्थानीय लोगों को सांस लेने में तकलीफ या त्वचा रोग हो रहे हैं, और यह किस कंपनी या स्रोत से आ रहा है?',
      questionEn: 'Understood. Are local residents suffering from breathing distress or skin rashes, and which company or hospital is disposing of this?',
      placeholderHi: 'उदा. तेज बदबू से बच्चों का जी मिचला रहा है; रात में स्थानीय फैक्ट्री द्वारा डंप किया जाता है...',
      placeholderEn: 'e.g. Unbearable chemical stench causing nausea in children; dumped by local industrial unit nightly...',
      contextHintHi: 'अवैध डंपिंग करने वाली इकाई के विरुद्ध तत्काल कारण बताओ और जब्ती नोटिस जारी करने में सहायक।',
      contextHintEn: 'Helps administration issue immediate stop-work and environmental violation notices.',
    },
  },

  electricity_hazard: {
    round1: {
      id: 'electric_r1',
      round: 1,
      domain: 'electricity_hazard',
      titleHi: 'नंगे तार का खतरा एवं करंट की आशंका',
      titleEn: 'Live Wire Exposure & Electrocution Risk',
      questionHi: 'क्या कोई हाई-वोल्टेज खुला तार जमीन पर गिरा है या ट्रांसफार्मर में स्पार्किंग हो रही है जिससे लोगों या मवेशियों को करंट लग सकता है?',
      questionEn: 'Is there a broken high-voltage wire or sparking transformer within human reach or near pedestrian pathways?',
      placeholderHi: 'उदा. 11 हजार वोल्ट का तार टूटकर रास्ते पर 4 फीट की ऊंचाई पर लटक रहा है, चिंगारी निकल रही है...',
      placeholderEn: 'e.g. 11kV line snapped and hanging 4 feet above main market walkway, continuous sparking...',
      contextHintHi: 'बिजली के नंगे तार की सूचना पर JBVNL सबस्टेशन से तुरंत बिजली काटने का निर्देश जाता है।',
      contextHintEn: 'Live electrical hazards trigger immediate JBVNL substation trip-off protocols.',
    },
    round2: {
      id: 'electric_r2',
      round: 2,
      domain: 'electricity_hazard',
      titleHi: 'विद्युत आपूर्ति बाधित क्षेत्र एवं जलभराव',
      titleEn: 'Outage Scope & Waterlogged Surroundings',
      questionHi: 'समझा। क्या तार के आसपास पानी भरा हुआ है, और इसके कारण कितने टोलों की बिजली ठप है?',
      questionEn: 'Understood. Is there standing water near the live wire, and how many hamlets are currently without electricity?',
      placeholderHi: 'उदा. सड़क पर पानी भरा है जिससे करंट फैलने का भारी खतरा है; पूरे वार्ड में ब्लैकआउट है...',
      placeholderEn: 'e.g. Surrounding road is flooded making it extremely hazardous; entire ward is in blackout...',
      contextHintHi: 'सुरक्षा उपकरणों के साथ विद्युत विभाग के लाइनमैन दस्ते को तत्काल मौके पर भेजता है।',
      contextHintEn: 'Directs electricity lineman emergency squads with insulated safety gear.',
    },
  },

  general_civic: {
    round1: {
      id: 'general_r1',
      round: 1,
      domain: 'general_civic',
      titleHi: 'मौके पर वास्तविक क्षति एवं जनता को खतरा',
      titleEn: 'Specific On-Ground Damage & Public Danger',
      questionHi: 'मौके पर वास्तविक रूप से क्या खराबी या क्षति हुई है, और क्या इससे आम जनता या बच्चों को कोई तुरंत खतरा है?',
      questionEn: 'What is the exact physical defect or damage observed on the ground, and does it pose an immediate danger to life or safety?',
      placeholderHi: 'उदा. मुख्य पैदल रास्ते के बीच खुला हुआ गहरा मैनहोल है जिस पर कोई चेतावनी बोर्ड नहीं है...',
      placeholderEn: 'e.g. Open uncovered deep manhole in the middle of pedestrian street without warning signs...',
      contextHintHi: 'सटीक भौतिक विवरण से समस्या को सही संबंधित विभाग के पास भेजा जाता है।',
      contextHintEn: 'Detailed physical characteristics ensure accurate departmental routing.',
    },
    round2: {
      id: 'general_r2',
      round: 2,
      domain: 'general_civic',
      titleHi: 'प्रभावित नागरिकों की संख्या एवं समय अवधि',
      titleEn: 'Impacted Citizens Count & Persistence',
      questionHi: 'समझा। इस समस्या से रोजाना लगभग कितने लोग या परिवार परेशान हो रहे हैं, और यह स्थिति कब से बनी हुई है?',
      questionEn: 'Understood. Approximately how many people or families face difficulty due to this every day, and how long has this persisted?',
      placeholderHi: 'उदा. रोजाना 400 से अधिक राहगीर गुजरते हैं; पिछले 2 महीनों से कोई मरम्मत नहीं हुई है...',
      placeholderEn: 'e.g. Around 400 commuters pass daily; persisting for 2 months without any repair...',
      contextHintHi: 'दैनिक प्रभावित संख्या और समय अवधि से समाधान की सरकारी समय सीमा तय होती है।',
      contextHintEn: 'Daily commuter density and persistence define administrative escalation SLA.',
    },
  },
};

// Legacy fallback map to preserve compatibility
export const CLARIFICATION_QUESTIONS: Record<string, ClarificationQuestion> = {
  population: DOMAIN_CLARIFICATIONS.general_civic.round2,
  landmark: DOMAIN_CLARIFICATIONS.road_bridge_collapse.round2,
  duration: DOMAIN_CLARIFICATIONS.general_civic.round2,
  danger: DOMAIN_CLARIFICATIONS.general_civic.round1,
};

// Detects problem domain from title, description, and AI categoryCode
export const detectProblemDomain = (
  title: string = '',
  description: string = '',
  categoryCode: string = ''
): string => {
  const combined = `${title} ${description} ${categoryCode}`.toLowerCase();

  if (
    combined.includes('flood') || combined.includes('waterlog') || combined.includes('spillway') ||
    combined.includes('culvert blockage') || combined.includes('drain') || combined.includes('sewage') ||
    combined.includes('runoff') || combined.includes('jalbharaav') || combined.includes('paani') ||
    categoryCode.includes('flood') || categoryCode.includes('drain')
  ) {
    return 'flooding_drainage';
  }

  if (
    combined.includes('arsenic') || combined.includes('fluoride') || combined.includes('handpump') ||
    combined.includes('borewell') || combined.includes('tap water') || combined.includes('drinking water') ||
    combined.includes('peene ka pani') || combined.includes('toxic water') || combined.includes('contamination') ||
    combined.includes('dirty water') || categoryCode.includes('water')
  ) {
    return 'water_contamination';
  }

  if (
    combined.includes('coal') || combined.includes('mine') || combined.includes('subsidence') ||
    combined.includes('fissure') || combined.includes('gas') || combined.includes('colliery') ||
    combined.includes('jharia') || combined.includes('underground fire') || categoryCode.includes('mining')
  ) {
    return 'mining_subsidence_fire';
  }

  if (
    combined.includes('road') || combined.includes('bridge') || combined.includes('pothole') ||
    combined.includes('culvert') || combined.includes('collapse') || combined.includes('fracture') ||
    combined.includes('sadak') || combined.includes('pul') || combined.includes('highway') ||
    categoryCode.includes('road') || categoryCode.includes('bridge') || categoryCode.includes('transport')
  ) {
    return 'road_bridge_collapse';
  }

  if (
    combined.includes('elephant') || combined.includes('hathi') || combined.includes('leopard') ||
    combined.includes('wildlife') || combined.includes('tiger') || combined.includes('boar') ||
    combined.includes('crop raiding') || combined.includes('forest') || categoryCode.includes('wildlife') ||
    categoryCode.includes('forestry')
  ) {
    return 'wildlife_conflict';
  }

  if (
    combined.includes('waste') || combined.includes('slurry') || combined.includes('chemical') ||
    combined.includes('dump') || combined.includes('garbage') || combined.includes('plastic') ||
    combined.includes('kachra') || combined.includes('effluent') || categoryCode.includes('waste') ||
    categoryCode.includes('pollution')
  ) {
    return 'waste_sewage_chemical';
  }

  if (
    combined.includes('electric') || combined.includes('wire') || combined.includes('transformer') ||
    combined.includes('current') || combined.includes('spark') || combined.includes('jbvnl') ||
    combined.includes('bijli') || categoryCode.includes('electric')
  ) {
    return 'electricity_hazard';
  }

  return 'general_civic';
};

// Gets the domain question for Round 1 or Round 2
export const getClarificationQuestion = (
  domain: string,
  round: 1 | 2
): ClarificationQuestion => {
  const pair = DOMAIN_CLARIFICATIONS[domain] || DOMAIN_CLARIFICATIONS.general_civic;
  return round === 1 ? pair.round1 : pair.round2;
};

// Validates citizen answer to prevent blank or meaningless submissions
export const validateClarificationAnswer = (
  answerText: string,
  lang: 'hi-IN' | 'en-IN'
): { isValid: boolean; warning: string | null } => {
  const trimmed = (answerText || '').trim();
  if (!trimmed || trimmed.length < 5) {
    return {
      isValid: false,
      warning: lang === 'hi-IN'
        ? 'कृपया कम से कम 5 अक्षरों में स्पष्ट व उपयोगी जमीनी विवरण दें।'
        : 'Please provide at least a few words describing the on-ground situation (minimum 5 characters).'
    };
  }

  const fillerRegex = /^(hi|hello|ok|okay|k|yes|no|test|done|bye|fine|good|haan|nahi|theek|accha|pata nahi|nothing|na|yo)\b/i;
  if (fillerRegex.test(trimmed) && trimmed.length < 10) {
    return {
      isValid: false,
      warning: lang === 'hi-IN'
        ? 'कृपया केवल अभिवादन या "हाँ/ना" न लिखें। समस्या की गहराई, दूरी, संख्या या स्थिति का स्पष्ट उत्तर दें।'
        : 'Please provide substantive ground details rather than greetings or one-word answers, so authorities can respond.'
    };
  }

  return { isValid: true, warning: null };
};

// Inspects grievance text and metadata to trigger domain-specific clarification
export const analyzeMissingInformation = (input: AnalysisInput): ClarificationQuestion | null => {
  const domain = detectProblemDomain(input.title, input.description, input.categoryCode);
  return getClarificationQuestion(domain, 1);
};

// Extracts numerical population metrics if citizen answered verbally or in text
export const extractPopulationFromClarification = (answerText: string): number | undefined => {
  if (!answerText) return undefined;

  // Check for family count e.g. 50 families = approx 250 people
  const familyMatch = answerText.match(/(\d+)\s*(?:families|family|pariwar|parivar|ghar|households|परिवार|घर)/i);
  if (familyMatch && familyMatch[1]) {
    const families = parseInt(familyMatch[1], 10);
    if (!isNaN(families) && families > 0) {
      return families * 5;
    }
  }

  // Check for direct individual count e.g. 300 people, 150 villagers
  const peopleMatch = answerText.match(/(\d+)\s*(?:people|citizens|persons|villagers|students|log|bacche|लोग|ग्रामीण|नागरिक|छात्र|बच्चे)/i);
  if (peopleMatch && peopleMatch[1]) {
    const count = parseInt(peopleMatch[1], 10);
    if (!isNaN(count) && count > 0) {
      return count;
    }
  }

  // Pure standalone number fallback
  const pureNumMatch = answerText.match(/\b(\d{1,6})\b/);
  if (pureNumMatch && pureNumMatch[1]) {
    const val = parseInt(pureNumMatch[1], 10);
    if (!isNaN(val) && val > 0 && val < 500000) {
      return val;
    }
  }

  return undefined;
};

// Speaks question aloud via Web Speech Synthesis in Hindi or English
export const speakAICounterQuestion = (
  text: string,
  lang: 'hi-IN' | 'en-IN',
  onStart?: () => void,
  onEnd?: () => void
): (() => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi-IN') {
      const hiVoice = voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  } catch (err) {
    console.warn('Speech synthesis invocation warning:', err);
    if (onEnd) onEnd();
    return () => {};
  }
};
