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
  focusAreas: string[];
  schedule7Focus: Schedule7Category[];
  badge: string;
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
    focusAreas: ['Solar Pumping & Drip Irrigation', 'Santhal Heritage Craft Hubs', 'Village Flood Barriers'],
    schedule7Focus: [
      'iv. Ensuring environmental sustainability',
      'v. Protection of national heritage, art and culture',
      'x. Rural development projects',
    ],
    badge: 'Infrastructure CSR Partner',
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
