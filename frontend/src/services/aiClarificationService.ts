// NIVAARAN Conversational Voice AI Clarification Engine
// Inspects citizen grievance posts for missing critical evidence
// Synthesizes counter questions aloud in Hindi or English
// Penalizes priority score by 18 points if clarification is skipped

export interface ClarificationQuestion {
  id: 'population' | 'landmark' | 'duration' | 'danger';
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
}

export const CLARIFICATION_QUESTIONS: Record<ClarificationQuestion['id'], ClarificationQuestion> = {
  population: {
    id: 'population',
    titleHi: 'प्रभावित आबादी एवं परिवार',
    titleEn: 'Estimated Population and Families Affected',
    questionHi: 'इस समस्या से आपके गांव या इलाके में लगभग कितने लोग या परिवार प्रभावित हैं? (उदाहरण: 50 परिवार, 200 ग्रामीण)',
    questionEn: 'Approximately how many people or families are affected by this problem in your area? (e.g. 50 families, 200 villagers)',
    placeholderHi: 'उदा. लगभग 80 परिवार और 400 ग्रामीण सीधे प्रभावित हैं...',
    placeholderEn: 'e.g. Around 80 families and 400 villagers are directly affected...',
    contextHintHi: 'जनसंख्या का सही आंकड़ा प्रशासनिक राहत और त्वरित कार्रवाई तय करता है।',
    contextHintEn: 'Accurate population impact determines emergency administrative prioritization.',
  },
  landmark: {
    id: 'landmark',
    titleHi: 'सटीक टोला, मुहल्ला या लैंडमार्क',
    titleEn: 'Precise Tola, Hamlet or Local Landmark',
    questionHi: 'यह समस्या आपके गांव या टोले में किस मुख्य पहचान या लैंडमार्क के पास है? (उदाहरण: प्राथमिक विद्यालय, स्वास्थ्य केंद्र, मुख्य पुलिया)',
    questionEn: 'What is the exact landmark, tola, or location near this problem? (e.g. near Primary School, Health Center, Main Culvert)',
    placeholderHi: 'उदा. मुख्य पंचायत भवन और आंगनबाड़ी केंद्र के बीच वाली सड़क...',
    placeholderEn: 'e.g. On the connecting road between Panchayat Bhawan and Anganwadi Center...',
    contextHintHi: 'सटीक लैंडमार्क से निरीक्षण दल सीधे मौके पर पहुंच सकेंगे।',
    contextHintEn: 'Precise landmark details allow on ground inspection teams to reach the exact site directly.',
  },
  duration: {
    id: 'duration',
    titleHi: 'समस्या की अवधि एवं स्थिति',
    titleEn: 'Hazard Duration and Persistence',
    questionHi: 'यह समस्या लगभग कितने दिनों या महीनों से बनी हुई है, और क्या स्थिति लगातार बिगड़ रही है?',
    questionEn: 'How long has this issue been persisting (days, weeks, or months), and is the situation worsening?',
    placeholderHi: 'उदा. पिछले 3 हफ्तों से स्थिति खराब है और आवागमन पूरी तरह बंद है...',
    placeholderEn: 'e.g. Persisting for the past 3 weeks and worsening after recent rains...',
    contextHintHi: 'समय अवधि से समस्या की तात्कालिकता और समाधान का पैमाना तय होता है।',
    contextHintEn: 'Duration metrics define the SLA urgency for departmental dispatch.',
  },
  danger: {
    id: 'danger',
    titleHi: 'पेयजल, बच्चों एवं जीवन सुरक्षा का खतरा',
    titleEn: 'Drinking Water, Children and Life Hazard',
    questionHi: 'क्या इस समस्या से पीने के पानी के स्रोत, स्कूल के बच्चों, या मवेशियों को कोई तात्कालिक खतरा है?',
    questionEn: 'Is there immediate danger to drinking water sources, school children, livestock, or human health?',
    placeholderHi: 'उदा. मुख्य चापाकल से दूषित पानी आ रहा है और बच्चों का स्कूल जाना मुश्किल है...',
    placeholderEn: 'e.g. The community handpump is contaminated and school access is blocked...',
    contextHintHi: 'तात्कालिक खतरे की पुष्टि से आपातकालीन सरकारी सहायता सक्रिय होती है।',
    contextHintEn: 'Confirmation of critical life hazards triggers emergency priority escalation.',
  },
};

// Inspects grievance text and metadata to identify missing critical parameters
export const analyzeMissingInformation = (input: AnalysisInput): ClarificationQuestion | null => {
  const combined = `${input.title} ${input.description} ${input.blockVillage} ${input.audioTranscript || ''}`.toLowerCase();

  // 1. Population Impact Check
  const hasExplicitPopulation = typeof input.affectedPopulation === 'number' && input.affectedPopulation > 0;
  const populationRegex = /\b(\d+|several|many|hundreds|thousands)\s*(?:people|citizens|families|households|villagers|students|children|persons|hamlets|log|ghar|pariwar|bacche|nivasi|parivar)\b/i;
  const hindiPopulationRegex = /[\u0900-\u097F]*\s*(?:लोग|परिवार|घर|बच्चे|नागरिक|ग्रामीण|छात्र|मरीज)/;
  const hasMentionedPopulation = populationRegex.test(combined) || (hindiPopulationRegex.test(combined) && /\d+/.test(combined));

  if (!hasExplicitPopulation && !hasMentionedPopulation) {
    return CLARIFICATION_QUESTIONS.population;
  }

  // 2. Specific Landmark / Tola Check
  const landmarkRegex = /\b(near|paas|mandir|temple|school|vidyalaya|hospital|aspatal|tola|chowk|chauraha|bridge|pul|pulia|culvert|road|sadak|ward|panchayat|colliery|khadaan|well|kuan|handpump|chapkal|basti|maidan|talab|pokhra|more|bazaar|kendra|gate|anganwadi)\b/i;
  const hindiLandmarkRegex = /(के पास|मंदिर|स्कूल|विद्यालय|अस्पताल|टोला|चौक|पुल|पुलिया|सड़क|वार्ड|पंचायत|खदान|कुआं|चापाकल|बस्ती|मैदान|तालाब|मोड़|बाजार|केंद्र|आंगनबाड़ी)/;
  const hasSpecificLandmark = landmarkRegex.test(combined) || hindiLandmarkRegex.test(combined);

  if (!hasSpecificLandmark && input.blockVillage.trim().length < 8) {
    return CLARIFICATION_QUESTIONS.landmark;
  }

  // 3. Duration / Persistence Check
  const durationRegex = /\b(\d+\s*(?:days|weeks|months|years|din|mahine|saal|hafta|ghante)|since|ongoing|persistent|consecutive|several months|past week|pichle|lagatar)\b/i;
  const hindiDurationRegex = /(\d+\s*(?:दिन|हफ्ते|महीने|साल|घंटे)|पिछले|लगातार|काफी समय|महीनों से|दिनों से)/;
  const hasDuration = durationRegex.test(combined) || hindiDurationRegex.test(combined);

  if (!hasDuration) {
    return CLARIFICATION_QUESTIONS.duration;
  }

  // 4. Critical Danger Check
  const dangerRegex = /\b(drinking water|peene ka pani|arsenic|fluoride|toxic|contamination|poison|children|school|collapse|subsidence|fire|electric|submerged|khatra|hazard|fatal|casualty|bimar|illness|dast|disease|emergency|overflow|sinkhole)\b/i;
  const hindiDangerRegex = /(पीने का पानी|दूषित|जहर|बीमार|खतरा|स्कूल|बच्चे|पशु|मवेशी|आग|धंसान|बाढ़|डूबा|करंट|गंभीर)/;
  const hasDanger = dangerRegex.test(combined) || hindiDangerRegex.test(combined);

  if (!hasDanger) {
    return CLARIFICATION_QUESTIONS.danger;
  }

  return null;
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
