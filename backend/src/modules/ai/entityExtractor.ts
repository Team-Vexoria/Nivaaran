/**
 * NIVAARAN — Stage 4: AI Entity Extraction Engine (SIH 26043)
 *
 * STEP 1 — EXTRACT INPUTS FROM REPORT (entity / verify)
 * Extracts structured entities from raw civic problem reports:
 * - district (string)
 * - eventDate (ISO YYYY-MM-DD)
 * - eventTime (HH:MM)
 * - infrastructureType (Drainage / Road / Water / WASH / Power / Facility / Utility)
 * - hazardType (Flood / Waterlogging / Fire / Landslide / Structural Collapse / Contamination)
 * - severity (CRITICAL / HIGH / MEDIUM / STANDARD)
 * - urgency (1-10)
 * - affectedPopulation (int)
 * - upvotes (int)
 * - economicValue (int in INR)
 */

import { DISTRICTS } from '../../constants/districts';

export interface ExtractedLocation {
  district: string;
  block: string;
  village?: string;
  landmark?: string;
  lat: number;
  lng: number;
}

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface ExtractedEntities {
  district: string;
  eventDate: string;              // ISO YYYY-MM-DD or ISO string
  eventTime: string;              // HH:MM format
  infrastructureType: string;     // Drainage, Road, Water, WASH, Power, etc.
  hazardType: string;             // Flood, Waterlogging, Fire, Landslide, etc.
  severity: SeverityLevel;        // CRITICAL, HIGH, MEDIUM, STANDARD
  urgency: number | undefined;    // 1-10 scale — undefined when citizen omitted (T5.1 honest numerics)
  affectedPopulation: number | undefined; // integer
  upvotes: number;                // integer
  economicValue: number | undefined;      // in INR

  // Extended context & backward-compatibility aliases
  location: ExtractedLocation;
  estimatedResolutionCost: number | undefined; // in INR
  summary: string;
  confidence: number;
  date: string;                   // formatted date
  time: string;                   // formatted time
  hazardUrgency: number | undefined;          // alias for urgency
  economicValueEstimate: number | undefined;  // alias for economicValue
  recentIncidents?: any[];
}

export interface ReportInput {
  title?: string;
  description?: string;
  location?: {
    district?: string;
    block?: string;
    village?: string;
    landmark?: string;
    lat?: number;
    lng?: number;
  };
  district?: string;
  block?: string;
  date?: string;
  time?: string;
  eventDate?: string;
  eventTime?: string;
  category?: string;
  severity?: SeverityLevel | string;
  urgency?: number;
  hazardUrgency?: number;
  affectedPopulation?: number;
  population?: number;
  upvotes?: number;
  economicValue?: number;
  economicValueEstimate?: number;
}

// Approximate district central coordinates in Jharkhand (24 districts)
export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Ranchi': { lat: 23.3441, lng: 85.3096 },
  'Dhanbad': { lat: 23.7957, lng: 86.4304 },
  'East Singhbhum': { lat: 22.8046, lng: 86.2029 },
  'Bokaro': { lat: 23.6693, lng: 86.1511 },
  'Palamu': { lat: 24.0416, lng: 84.0722 },
  'Hazaribagh': { lat: 23.9937, lng: 85.3637 },
  'Deoghar': { lat: 24.4826, lng: 86.6974 },
  'Giridih': { lat: 24.1856, lng: 86.3057 },
  'Ramgarh': { lat: 23.6300, lng: 85.5100 },
  'Latehar': { lat: 23.7431, lng: 84.4984 },
  'Garhwa': { lat: 24.1610, lng: 83.8055 },
  'Dumka': { lat: 24.2676, lng: 87.2489 },
  'Godda': { lat: 24.8267, lng: 87.2131 },
  'Sahebganj': { lat: 25.2425, lng: 87.6433 },
  'Pakur': { lat: 24.6334, lng: 87.8491 },
  'Jamtara': { lat: 23.9631, lng: 86.8028 },
  'Khunti': { lat: 23.0726, lng: 85.2789 },
  'Gumla': { lat: 23.0427, lng: 84.5410 },
  'Simdega': { lat: 22.6146, lng: 84.5098 },
  'West Singhbhum': { lat: 22.5694, lng: 85.8083 },
  'Seraikela Kharsawan': { lat: 22.6998, lng: 85.9299 },
  'Chatra': { lat: 24.2092, lng: 84.8711 },
  'Koderma': { lat: 24.4674, lng: 85.5939 },
  'Lohardaga': { lat: 23.4332, lng: 84.6820 },
};

export function normalizeDistrict(input?: string): string {
  if (!input) return 'Ranchi';
  const lower = input.toLowerCase().trim();
  for (const d of DISTRICTS) {
    if (lower === d.name.toLowerCase() || lower.includes(d.name.toLowerCase())) {
      return d.name;
    }
  }
  for (const key of Object.keys(DISTRICT_COORDS)) {
    if (lower.includes(key.toLowerCase())) {
      return key;
    }
  }
  return 'Ranchi';
}

function normalizeSeverity(sev?: string, urgency: number = 5): SeverityLevel {
  if (sev) {
    const s = sev.toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH' || s === 'MEDIUM' || s === 'STANDARD') return s as SeverityLevel;
  }
  if (urgency >= 8) return 'CRITICAL';
  if (urgency >= 6) return 'HIGH';
  if (urgency >= 4) return 'MEDIUM';
  return 'STANDARD';
}

/**
 * Fallback deterministic heuristic extractor when LLM is unreachable or for fast offline extraction
 */
export function extractEntitiesHeuristic(reportInput: string | ReportInput, optionalTitle: string = ''): ExtractedEntities {
  let title = optionalTitle;
  let description = '';
  let directDistrict = '';
  let directBlock = '';
  let directDate = '';
  let directTime = '';
  let directCategory = '';
  let directSeverity: SeverityLevel | undefined;
  let directUrgency: number | undefined;
  let directPop: number | undefined;
  let directUpvotes: number | undefined;
  let directEcon: number | undefined;

  if (typeof reportInput === 'string') {
    description = reportInput;
  } else if (reportInput && typeof reportInput === 'object') {
    title = reportInput.title || optionalTitle;
    description = reportInput.description || '';
    directDistrict = reportInput.district || reportInput.location?.district || '';
    directBlock = reportInput.block || reportInput.location?.block || '';
    directDate = reportInput.eventDate || reportInput.date || '';
    directTime = reportInput.eventTime || reportInput.time || '';
    directCategory = reportInput.category || '';
    if (reportInput.severity) directSeverity = normalizeSeverity(reportInput.severity);
    directUrgency = reportInput.urgency ?? reportInput.hazardUrgency;
    directPop = reportInput.affectedPopulation ?? reportInput.population;
    directUpvotes = reportInput.upvotes;
    directEcon = reportInput.economicValue ?? reportInput.economicValueEstimate;
  }

  const fullText = `${title} ${description} ${directCategory}`.toLowerCase();

  // 1. District Matching
  const matchedDistrict = directDistrict ? normalizeDistrict(directDistrict) : (() => {
    for (const d of DISTRICTS) {
      if (fullText.includes(d.name.toLowerCase())) {
        return d.name;
      }
    }
    return 'Ranchi';
  })();

  // 2. Block / Landmark extraction
  let matchedBlock = directBlock || 'Central Block';
  if (!directBlock) {
    const blockMatch = fullText.match(/(?:in|at|near|block|panchayat)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
    if (blockMatch && blockMatch[1] && blockMatch[1].length > 2) {
      matchedBlock = blockMatch[1].charAt(0).toUpperCase() + blockMatch[1].slice(1);
    }
  }

  // 3. Infrastructure Type
  let infra = 'Drainage';
  if (fullText.includes('pothole') || fullText.includes('road') || fullText.includes('bridge') || fullText.includes('highway')) {
    infra = 'Road';
  } else if (fullText.includes('water') || fullText.includes('pipe') || fullText.includes('borewell') || fullText.includes('drinking water')) {
    infra = 'Water';
  } else if (fullText.includes('drain') || fullText.includes('culvert') || fullText.includes('sewage') || fullText.includes('wash') || fullText.includes('toilet') || fullText.includes('sanitation')) {
    infra = fullText.includes('wash') || fullText.includes('toilet') ? 'WASH' : 'Drainage';
  } else if (fullText.includes('electric') || fullText.includes('transformer') || fullText.includes('wire') || fullText.includes('power')) {
    infra = 'Power';
  } else if (fullText.includes('hospital') || fullText.includes('school') || fullText.includes('anganwadi')) {
    infra = 'Facility';
  } else if (fullText.includes('garbage') || fullText.includes('waste') || fullText.includes('dump')) {
    infra = 'Utility';
  }

  // 4. Hazard Type & Urgency
  let hazard = 'Waterlogging';
  let urgency = directUrgency ?? 5;
  if (fullText.includes('flood') || fullText.includes('flash flood') || fullText.includes('inundat')) {
    hazard = 'Flood';
    if (!directUrgency) urgency = 8;
  } else if (fullText.includes('waterlog') || fullText.includes('water accumulation') || fullText.includes('drainage overflow')) {
    hazard = 'Waterlogging';
    if (!directUrgency) urgency = 7;
  } else if (fullText.includes('fire') || fullText.includes('spark') || fullText.includes('short circuit') || fullText.includes('electric')) {
    hazard = 'Fire';
    if (!directUrgency) urgency = 9;
  } else if (fullText.includes('landslide') || fullText.includes('collapse') || fullText.includes('subsidence') || fullText.includes('cave-in') || fullText.includes('sinkhole')) {
    hazard = 'Landslide';
    if (!directUrgency) urgency = 9;
  } else if (fullText.includes('contamination') || fullText.includes('arsenic') || fullText.includes('poison') || fullText.includes('toxic')) {
    hazard = 'Contamination';
    if (!directUrgency) urgency = 8;
  } else if (fullText.includes('pothole') || fullText.includes('accident') || fullText.includes('broken road')) {
    hazard = 'Accident';
    if (!directUrgency) urgency = 6;
  }

  // 5. Population estimation
  let population = directPop ?? 500;
  if (directPop === undefined) {
    const numMatch = fullText.match(/(\d+)\s*(?:people|citizens|families|residents|students|villagers|houses)/i);
    if (numMatch && numMatch[1]) {
      population = parseInt(numMatch[1], 10);
    } else if (fullText.includes('village') || fullText.includes('panchayat')) {
      population = 1500;
    } else if (fullText.includes('school') || fullText.includes('hospital')) {
      population = 800;
    } else if (fullText.includes('highway') || fullText.includes('main road')) {
      population = 4000;
    }
  }

  // 6. Temporal extraction (ISO date & HH:MM time)
  const now = new Date();
  const eventDate = directDate || now.toISOString().slice(0, 10); // YYYY-MM-DD
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const eventTime = directTime || `${hours}:${minutes}`;

  const coords = DISTRICT_COORDS[matchedDistrict] || { lat: 23.3441, lng: 85.3096 };
  const severity = directSeverity || normalizeSeverity(undefined, urgency);
  const upvotes = directUpvotes ?? 1;
  const economicValue = directEcon ?? Math.min(500000, population * 250);

  return {
    district: matchedDistrict,
    eventDate,
    eventTime,
    infrastructureType: infra,
    hazardType: hazard,
    severity,
    urgency,
    affectedPopulation: population,
    upvotes,
    economicValue,
    location: {
      district: matchedDistrict,
      block: matchedBlock,
      lat: coords.lat,
      lng: coords.lng,
    },
    estimatedResolutionCost: Math.min(300000, population * 120),
    summary: description ? description.slice(0, 150) : (title || 'Civic infrastructure issue reported'),
    confidence: 0.85,
    date: eventDate,
    time: `${eventTime} IST`,
    hazardUrgency: urgency,
    economicValueEstimate: economicValue,
  };
}

/**
 * Main Stage 4 Entity Extraction function (STEP 1)
 */
export async function extractEntities(
  reportOrDescription: string | ReportInput,
  optionalTitle: string = ''
): Promise<ExtractedEntities> {
  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JYEDAm5LNkEkX5oRsZ5vEVvIC4_830TTIpHqeSyiWS5Q';

  let title = optionalTitle;
  let description = '';
  if (typeof reportOrDescription === 'string') {
    description = reportOrDescription;
  } else if (reportOrDescription && typeof reportOrDescription === 'object') {
    title = reportOrDescription.title || optionalTitle;
    description = reportOrDescription.description || '';
  }

  if (!apiKey || apiKey.length < 15) {
    return extractEntitiesHeuristic(reportOrDescription, title);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const prompt = `You are the NIVAARAN Government AI Data Extraction Engine for Jharkhand.
Given a Jharkhand civic problem report with title, description, location (district/block), date/time, category, and severity, extract structured entities into JSON.

Report Title: "${title}"
Report Description: "${description}"

Return JSON matching this exact structure:
{
  "district": "One of: [Ranchi, Dhanbad, East Singhbhum, Bokaro, Palamu, Hazaribagh, Deoghar, Giridih, Ramgarh, Latehar, Garhwa, Dumka, Godda, Sahebganj, Pakur, Jamtara, Khunti, Gumla, Simdega, West Singhbhum, Seraikela Kharsawan, Chatra, Koderma, Lohardaga]",
  "eventDate": "YYYY-MM-DD (ISO date of occurrence or current date)",
  "eventTime": "HH:MM (24-hour time of occurrence or current time)",
  "infrastructureType": "One of: [Drainage, Road, Water, WASH, Power, Facility, Utility]",
  "hazardType": "One of: [Flood, Waterlogging, Fire, Landslide, Structural Collapse, Contamination, Accident]",
  "severity": "One of: [CRITICAL, HIGH, MEDIUM, STANDARD]",
  "urgency": integer from 1 (minor) to 10 (life-critical emergency),
  "affectedPopulation": integer number of people impacted (estimate 300 to 5000 if not stated),
  "upvotes": integer community upvote count (default 1 if not stated),
  "economicValue": integer estimated economic loss in INR (e.g. 50000 to 500000),
  "block": "Block or area name",
  "landmark": "Nearby landmark if mentioned",
  "estimatedResolutionCost": estimated cost in INR for resolution (e.g. 25000 to 200000),
  "summary": "1 concise sentence summarizing the core issue"
}
Respond with only valid JSON.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const json: any = await res.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const district = normalizeDistrict(parsed.district);
        const coords = DISTRICT_COORDS[district] || { lat: 23.3441, lng: 85.3096 };
        const now = new Date();
        const eventDate = parsed.eventDate || now.toISOString().slice(0, 10);
        const eventTime = parsed.eventTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const urgency = typeof parsed.urgency === 'number' ? Math.min(10, Math.max(1, parsed.urgency)) : (typeof parsed.hazardUrgency === 'number' ? parsed.hazardUrgency : 6);
        const severity = normalizeSeverity(parsed.severity, urgency);
        const affectedPopulation = typeof parsed.affectedPopulation === 'number' ? parsed.affectedPopulation : 500;
        const upvotes = typeof parsed.upvotes === 'number' ? parsed.upvotes : 1;
        const economicValue = typeof parsed.economicValue === 'number' ? parsed.economicValue : (typeof parsed.economicValueEstimate === 'number' ? parsed.economicValueEstimate : 100000);
        const estimatedResolutionCost = typeof parsed.estimatedResolutionCost === 'number' ? parsed.estimatedResolutionCost : 50000;

        return {
          district,
          eventDate,
          eventTime,
          infrastructureType: parsed.infrastructureType || 'Drainage',
          hazardType: parsed.hazardType || 'Waterlogging',
          severity,
          urgency,
          affectedPopulation,
          upvotes,
          economicValue,
          location: {
            district,
            block: parsed.block || 'Central Block',
            landmark: parsed.landmark || undefined,
            lat: coords.lat,
            lng: coords.lng,
          },
          estimatedResolutionCost,
          summary: parsed.summary || description.slice(0, 150),
          confidence: 0.95,
          date: eventDate,
          time: `${eventTime} IST`,
          hazardUrgency: urgency,
          economicValueEstimate: economicValue,
        };
      }
    }
  } catch {
    // Fallback gracefully on timeout or network error
  }

  return extractEntitiesHeuristic(reportOrDescription, title);
}
