import { Schedule7Category } from './firebaseService';

export interface IndustryPartnerDoc {
  id: string;
  name: string;
  shortName: string;
  cin: string;
  csrRegNumber: string;
  district: string;
  headOffice: string;
  leadName: string;
  leadDesignation: string;
  leadEmail: string;
  leadPhone: string;
  annualCsrBudget: string;
  operatingDistricts: string[];
  focusAreas: string[];
  relevantCategories: string[];
  matchKeywords: string[];
  schedule7Focus: Schedule7Category[];
  badge: string;
}

export interface MatchDetails {
  isRelevant: boolean;
  matchScore: number;
  matchReasons: string[];
  categoryScore?: number;
  domainScore?: number;
  districtScore?: number;
  schedule7Score?: number;
  urgencyScore?: number;
}

export const JHARKHAND_INDUSTRIES: IndustryPartnerDoc[] = [
  {
    id: 'IND-TATA-STEEL',
    name: 'Tata Steel Foundation',
    shortName: 'Tata Steel',
    cin: 'L27100MH1907PLC000260',
    csrRegNumber: 'CSR00001248',
    district: 'East Singhbhum',
    headOffice: 'Jamshedpur',
    leadName: 'Sourav Roy',
    leadDesignation: 'Chief of CSR & Social Innovation',
    leadEmail: 'partner@tatasteel.com',
    leadPhone: '+91 657 664 4444',
    annualCsrBudget: '₹315.40 Cr',
    operatingDistricts: ['East Singhbhum', 'Saraikela Kharsawan', 'West Singhbhum', 'Ramgarh', 'Dhanbad', 'Simdega'],
    relevantCategories: [
      'Flood Management & Urban Drainage',
      'Flooding & Drainage',
      'Industrial Mining Effluent & River Contamination',
      'Hazardous Industrial Chemical Effluent',
      'Water Quality & Contamination',
      'Mining & Coalfire Disaster',
    ],
    matchKeywords: [
      'subarnarekha', 'kharkai', 'flood', 'drainage', 'effluent', 'hematite', 'slurry', 
      'electroplating', 'jamshedpur', 'bagbera', 'adityapur', 'steel', 'water', 'arsenic', 'karo'
    ],
    focusAreas: ['IoT Flood & Water Telemetry', 'Tribal Livelihood', 'Rural Health Systems', 'Environmental Engineering'],
    schedule7Focus: [
      'ix. Contributions to science, technology, engineering, medicine R&D',
      'iv. Ensuring environmental sustainability',
      'x. Rural development projects',
    ],
    badge: 'Tier 1 Prime CSR Sponsor',
  },
  {
    id: 'IND-CCL-COAL-INDIA',
    name: 'Central Coalfields Limited (CCL / Coal India)',
    shortName: 'CCL Coal India',
    cin: 'U10200JH1975GOI001223',
    csrRegNumber: 'CSR00004521',
    district: 'Ranchi',
    headOffice: 'Darbhanga House, Ranchi',
    leadName: 'Dr. A.K. Singh',
    leadDesignation: 'General Manager (CSR & Sustainable Development)',
    leadEmail: 'csr@centralcoalfields.in',
    leadPhone: '+91 651 236 0123',
    annualCsrBudget: '₹142.80 Cr',
    operatingDistricts: ['Dhanbad', 'Ranchi', 'Bokaro', 'Ramgarh', 'Hazaribagh', 'Chatra', 'Giridih'],
    relevantCategories: [
      'Mining & Coalfire Disaster',
      'Ground Subsidence & Coal Seam Fires',
      'Thermal Power Industrial Pollution',
      'Industrial Mining Effluent & River Contamination',
      'Water Quality & Contamination',
    ],
    matchKeywords: [
      'coal', 'coalfire', 'subsidence', 'lodna', 'jharia', 'pit', 'colliery', 'mine', 
      'fly ash', 'slurry', 'methane', 'venting', 'konar', 'arsenic', 'fluoride'
    ],
    focusAreas: ['Mine Water Purification', 'Slope Stability Telemetry', 'Clean Energy', 'Community Sanitation'],
    schedule7Focus: [
      'ix. Contributions to science, technology, engineering, medicine R&D',
      'iv. Ensuring environmental sustainability',
      'i. Eradicating extreme hunger, poverty and malnutrition',
    ],
    badge: 'PSU Maharatna Partner',
  },
  {
    id: 'IND-SAIL-BOKARO',
    name: 'SAIL Bokaro Steel Plant CSR',
    shortName: 'SAIL Bokaro',
    cin: 'L27109DL1973GOI006454',
    csrRegNumber: 'CSR00003890',
    district: 'Bokaro',
    headOffice: 'Bokaro Steel City',
    leadName: 'Vandana Jha',
    leadDesignation: 'Chief General Manager (CSR)',
    leadEmail: 'csr@sail-bokaro.com',
    leadPhone: '+91 6542 240 100',
    annualCsrBudget: '₹88.50 Cr',
    operatingDistricts: ['Bokaro', 'Dhanbad', 'Giridih', 'Ramgarh'],
    relevantCategories: [
      'Thermal Power Industrial Pollution',
      'Hazardous Industrial Chemical Effluent',
      'Water Quality & Contamination',
      'Flooding & Drainage',
      'Industrial Mining Effluent & River Contamination',
    ],
    matchKeywords: [
      'fly ash', 'bokaro', 'konar', 'effluent', 'slurry', 'water quality', 
      'arsenic', 'fluoride', 'tisri', 'phusro', 'industrial', 'stream'
    ],
    focusAreas: ['Industrial Effluent Sensor Arrays', 'Community Education', 'Rural Solar Infrastructure'],
    schedule7Focus: [
      'ix. Contributions to science, technology, engineering, medicine R&D',
      'ii. Promoting education, employment, livelihood',
      'iv. Ensuring environmental sustainability',
    ],
    badge: 'PSU Maharatna Partner',
  },
  {
    id: 'IND-JSP-FOUNDATION',
    name: 'Jindal Steel & Power (JSP Foundation)',
    shortName: 'JSP Foundation',
    cin: 'L27105HR1979PLC009913',
    csrRegNumber: 'CSR00006732',
    district: 'Ramgarh',
    headOffice: 'Patratu, Ramgarh',
    leadName: 'Prashant Hota',
    leadDesignation: 'President & Head (CSR & Social Capital)',
    leadEmail: 'csr@jindalsteel.com',
    leadPhone: '+91 6553 275 400',
    annualCsrBudget: '₹74.20 Cr',
    operatingDistricts: ['Ramgarh', 'Ranchi', 'Dumka', 'Godda', 'Khunti', 'Palamu', 'Garhwa', 'Lohardaga'],
    relevantCategories: [
      'Drought & Aquifer Depletion',
      'Agro Forestry & Tribal Livelihood',
      'Rural Water & Solar Microgrids',
      'Flooding & Drainage',
      'Water Quality & Contamination',
    ],
    matchKeywords: [
      'drought', 'aquifer', 'paddy', 'irrigation', 'farming', 'agronomy', 'patratu', 
      'ramgarh', 'microgrid', 'solar', 'agro forestry', 'lac', 'kanke', 'hutup', 'palamu', 'north koel'
    ],
    focusAreas: ['Agro Forestry Tech', 'Watershed Harvesting', 'Tribal Women Artisans', 'Biomass Briquettes'],
    schedule7Focus: [
      'x. Rural development projects',
      'iii. Promoting gender equality, empowering women',
      'iv. Ensuring environmental sustainability',
    ],
    badge: 'Industry R&D Investor',
  },
  {
    id: 'IND-ESL-VEDANTA',
    name: 'ESL Steel / Vedanta CSR Foundation',
    shortName: 'Vedanta ESL',
    cin: 'L27310JH2006PLC012663',
    csrRegNumber: 'CSR00008914',
    district: 'Bokaro',
    headOffice: 'Siyaljori, Bokaro',
    leadName: 'Ashish Ranjan',
    leadDesignation: 'Head of Corporate Social Responsibility',
    leadEmail: 'csr@eslsteel.com',
    leadPhone: '+91 6542 284 300',
    annualCsrBudget: '₹46.00 Cr',
    operatingDistricts: ['Bokaro', 'Dhanbad', 'Deoghar', 'Giridih', 'West Singhbhum'],
    relevantCategories: [
      'Industrial Mining Effluent & River Contamination',
      'Water Quality & Contamination',
      'Ground Subsidence & Coal Seam Fires',
      'Hazardous Industrial Chemical Effluent',
    ],
    matchKeywords: [
      'slag', 'hematite', 'slurry', 'arsenic', 'fluoride', 'tisri', 'karo', 
      'river contamination', 'bokaro', 'siyaljori', 'effluent', 'water quality'
    ],
    focusAreas: ['Slag Recycling Tech', 'Rural Micro-Irrigation', 'Smart Village Testbeds'],
    schedule7Focus: [
      'ix. Contributions to science, technology, engineering, medicine R&D',
      'x. Rural development projects',
    ],
    badge: 'Industry R&D Investor',
  },
  {
    id: 'IND-USHA-MARTIN',
    name: 'Usha Martin Foundation',
    shortName: 'Usha Martin',
    cin: 'L31400WB1986PLC091621',
    csrRegNumber: 'CSR00002159',
    district: 'Ranchi',
    headOffice: 'Tatisilwai, Ranchi',
    leadName: 'Dr. Mayank Sinha',
    leadDesignation: 'Executive Director (Community & CSR Outreach)',
    leadEmail: 'csr@ushamartin.com',
    leadPhone: '+91 651 305 1400',
    annualCsrBudget: '₹28.40 Cr',
    operatingDistricts: ['Ranchi', 'Saraikela Kharsawan', 'East Singhbhum', 'Khunti', 'Latehar'],
    relevantCategories: [
      'Flooding & Drainage',
      'Wildlife Conservation & Conflict',
      'Hazardous Industrial Chemical Effluent',
      'Agro Forestry & Tribal Livelihood',
    ],
    matchKeywords: [
      'hutup', 'kanke', 'school road', 'drainage', 'tatisilwai', 'ranchi', 
      'adityapur', 'kharkai', 'elephant', 'betla', 'torpa', 'lac'
    ],
    focusAreas: ['Tribal Youth Skilling', 'Water Quality Monitoring', 'Renewable Microgrids'],
    schedule7Focus: [
      'ii. Promoting education, employment, livelihood',
      'iv. Ensuring environmental sustainability',
      'x. Rural development projects',
    ],
    badge: 'Regional CSR Leader',
  },
  {
    id: 'IND-ADANI-FOUNDATION',
    name: 'Adani Foundation / Adani Power Godda',
    shortName: 'Adani Foundation',
    cin: 'L40100GJ1996PLC030533',
    csrRegNumber: 'CSR00007823',
    district: 'Godda',
    headOffice: 'Motia, Godda',
    leadName: 'Manish Kumar',
    leadDesignation: 'Senior General Manager (CSR Operations)',
    leadEmail: 'csr@adani.com',
    leadPhone: '+91 6422 280 200',
    annualCsrBudget: '₹52.60 Cr',
    operatingDistricts: ['Godda', 'Sahibganj', 'Pakur', 'Dumka', 'Deoghar', 'Jamtara'],
    relevantCategories: [
      'Riverbank Erosion & Disaster Inundation',
      'Flood Management & Urban Drainage',
      'Water Quality & Contamination',
      'Thermal Power Industrial Pollution',
    ],
    matchKeywords: [
      'ganga', 'erosion', 'rajmahal', 'kankjol', 'diara', 'godda', 'sahibganj', 
      'riverbank', 'thermal', 'wetland', 'submergence', 'pakur', 'silicosis', 'jamtara', 'ajay'
    ],
    focusAreas: ['Solar Pumping & Drip Irrigation', 'Santhal Heritage Craft Hubs', 'Village Flood Barriers'],
    schedule7Focus: [
      'iv. Ensuring environmental sustainability',
      'v. Protection of national heritage, art and culture',
      'x. Rural development projects',
    ],
    badge: 'Infrastructure CSR Partner',
  },
  {
    id: 'IND-NTPC-KARANPURA',
    name: 'NTPC North Karanpura CSR Foundation',
    shortName: 'NTPC Karanpura',
    cin: 'L40101DL1975GOI007966',
    csrRegNumber: 'CSR00005519',
    district: 'Hazaribagh',
    headOffice: 'Tandwa, Hazaribagh',
    leadName: 'V.K. Pandey',
    leadDesignation: 'Chief General Manager (CSR & Community Affairs)',
    leadEmail: 'csr@ntpc-karanpura.co.in',
    leadPhone: '+91 6546 220 300',
    annualCsrBudget: '₹62.10 Cr',
    operatingDistricts: ['Hazaribagh', 'Chatra', 'Ramgarh', 'Latehar', 'Palamu', 'Garhwa', 'Koderma'],
    relevantCategories: [
      'Drought & Aquifer Depletion',
      'Thermal Power Industrial Pollution',
      'Wildlife Conservation & Conflict',
      'Water Quality & Contamination',
    ],
    matchKeywords: [
      'drought', 'palamu', 'chhatarpur', 'north koel', 'karanpura', 'betla', 
      'elephant', 'hazaribagh', 'chatra', 'aquifer', 'borewell', 'thermal'
    ],
    focusAreas: ['Ash Dyke Stability Telemetry', 'Clean Potable Water Networks', 'Rural Electrification', 'Biodiversity Conservation'],
    schedule7Focus: [
      'ix. Contributions to science, technology, engineering, medicine R&D',
      'iv. Ensuring environmental sustainability',
      'x. Rural development projects',
    ],
    badge: 'PSU Maharatna Partner',
  },
  {
    id: 'IND-JASCOLAMPF',
    name: 'JASCOLAMPF Tribal Livelihood Federation',
    shortName: 'JASCOLAMPF',
    cin: 'COOP-JH-1967-00912',
    csrRegNumber: 'CSR-COOP-8821',
    district: 'Khunti',
    headOffice: 'Purulia Road, Ranchi',
    leadName: 'Shri Sukra Oraon',
    leadDesignation: 'Managing Director & Livelihood Custodian',
    leadEmail: 'contact@jascolampf.gov.in',
    leadPhone: '+91 651 221 4455',
    annualCsrBudget: '₹18.90 Cr',
    operatingDistricts: ['Khunti', 'Gumla', 'Simdega', 'Latehar', 'West Singhbhum', 'Ranchi', 'Giridih'],
    relevantCategories: [
      'Agro Forestry & Tribal Livelihood',
      'Wildlife Conservation & Conflict',
      'Water Quality & Contamination',
      'Drought & Aquifer Depletion',
    ],
    matchKeywords: [
      'lac', 'kusum', 'torpa', 'fungal', 'moth', 'tribal', 'betla', 'elephant', 
      'forest', 'munda', 'tisri', 'santhal', 'fluoride', 'khunti', 'gumla', 'livelihood'
    ],
    focusAreas: ['Lac Host Tree Parasite Protection', 'Minor Forest Produce Processing', 'Tribal Farmer Cooperatives'],
    schedule7Focus: [
      'x. Rural development projects',
      'ii. Promoting education, employment, livelihood',
      'iv. Ensuring environmental sustainability',
    ],
    badge: 'Apex Tribal Cooperative',
  },
];

export function getIndustryByEmail(email: string): IndustryPartnerDoc | undefined {
  if (!email) return undefined;
  const e = email.toLowerCase().trim();
  return JHARKHAND_INDUSTRIES.find(ind => ind.leadEmail.toLowerCase() === e);
}

export function getIndustryById(id: string): IndustryPartnerDoc | undefined {
  return JHARKHAND_INDUSTRIES.find(ind => ind.id === id);
}

export function getTestingIndustriesList(): Array<{ ind: IndustryPartnerDoc; email: string }> {
  return JHARKHAND_INDUSTRIES.map(ind => ({
    ind,
    email: ind.leadEmail,
  }));
}

export function evaluateChallengeRelevance(
  challenge: { title?: string; summary?: string; description?: string; district?: string; category?: string; assignedHEI?: string; priorityScore?: number },
  industry: IndustryPartnerDoc
): MatchDetails {
  if (!industry) {
    return { isRelevant: true, matchScore: 100, matchReasons: ['General Statewide Project'] };
  }

  const reasons: string[] = [];
  let categoryScore = 0;
  let domainScore = 0;
  let districtScore = 0;
  let schedule7Score = 0;
  let urgencyScore = 0;

  const chDistrict = (challenge.district || '').toLowerCase().trim();
  const chCategory = (challenge.category || '').toLowerCase().trim();
  const textBody = `${challenge.title || ''} ${challenge.description || ''} ${challenge.summary || ''} ${challenge.district || ''} ${challenge.category || ''}`.toLowerCase();

  // Factor 1: Thematic CSR Category Alignment (35 pts max)
  const directCategory = (industry.relevantCategories || []).some(
    c => c.toLowerCase().trim() === chCategory || chCategory.includes(c.toLowerCase().trim()) || c.toLowerCase().trim().includes(chCategory)
  );

  if (directCategory) {
    categoryScore = 35;
    reasons.push(`CSR Charter Alignment: ${challenge.category}`);
  } else {
    const partialCategory = (industry.relevantCategories || []).some(c => {
      const words = c.toLowerCase().split(/[ &/,]+/);
      return words.some(w => w.length > 4 && chCategory.includes(w));
    });
    if (partialCategory) {
      categoryScore = 18;
      reasons.push(`Related Sector Mandate: ${challenge.category}`);
    }
  }

  // If no thematic category fit at all, this challenge is not concerned with this industry
  if (categoryScore === 0) {
    return {
      isRelevant: false,
      matchScore: 0,
      matchReasons: ['No thematic alignment with corporate CSR charter or industrial focus areas.'],
      categoryScore: 0,
      domainScore: 0,
      districtScore: 0,
      schedule7Score: 0,
      urgencyScore: 0
    };
  }

  // Factor 2: Technical Domain and Operations Keyword Match (25 pts max)
  const matchedKeywords = (industry.matchKeywords || []).filter(kw => textBody.includes(kw.toLowerCase()));
  if (matchedKeywords.length >= 3) {
    domainScore = 25;
    reasons.push(`Core Operations Synergy: ${matchedKeywords.slice(0, 3).join(', ')}`);
  } else if (matchedKeywords.length === 2) {
    domainScore = 18;
    reasons.push(`Domain Alignment: ${matchedKeywords.join(', ')}`);
  } else if (matchedKeywords.length === 1) {
    domainScore = 10;
    reasons.push(`Operational Synergy: ${matchedKeywords[0]}`);
  } else {
    domainScore = 5;
  }

  // Factor 3: Geographical and Operational District Presence (20 pts max)
  const isDirectDistrict = (industry.operatingDistricts || []).some(
    d => d.toLowerCase().trim() === chDistrict
  );
  if (isDirectDistrict) {
    districtScore = 20;
    reasons.push(`Plant and Operational Presence in ${challenge.district} District`);
  } else {
    districtScore = 10;
    reasons.push(`Regional Jharkhand Project Deployment`);
  }

  // Factor 4: Schedule VII and Statutory CSR Alignment (10 pts max)
  const hasSchedule7 = (industry.schedule7Focus || []).length > 0;
  schedule7Score = hasSchedule7 ? 10 : 5;
  reasons.push(`Schedule VII R&D Eligibility under Companies Act`);

  // Factor 5: Civic Severity and Project Urgency (10 pts max)
  const prio = challenge.priorityScore || 85;
  urgencyScore = prio >= 90 ? 10 : 8;

  const totalScore = Math.min(100, categoryScore + domainScore + districtScore + schedule7Score + urgencyScore);

  return {
    isRelevant: totalScore >= 80,
    matchScore: totalScore,
    matchReasons: reasons,
    categoryScore,
    domainScore,
    districtScore,
    schedule7Score,
    urgencyScore
  };
}
