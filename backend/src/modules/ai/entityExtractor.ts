/**
 * NIVAARAN — Stage 4: AI Entity Extraction Engine (SIH 26043)
 *
 * Uses Gemini LLM to extract structured entities from raw citizen descriptions:
 * - Date & Time of occurrence
 * - Location (District, Block, Village, Landmark, GPS coordinates)
 * - Estimated Affected Population
 * - Infrastructure Type & Classification
 * - Hazard Type & Urgency Level (1-10)
 * - Economic Impact & Feasibility Estimates
 */

import { DISTRICTS } from '../../constants/districts';

export interface ExtractedLocation {
  district: string;
  block: string;
  village?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface ExtractedEntities {
  date: string;
  time: string;
  location: ExtractedLocation;
  affectedPopulation: number;
  infrastructureType: string;
  hazardType: string;
  hazardUrgency: number;          // 1-10 scale
  economicValueEstimate: number;  // in INR
  estimatedResolutionCost: number;// in INR
  summary: string;
  confidence: number;
}

// Approximate district central coordinates in Jharkhand
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
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

/**
 * Fallback heuristic extractor when LLM is unreachable
 */
function extractEntitiesHeuristic(description: string, title: string = ''): ExtractedEntities {
  const fullText = `${title} ${description}`.toLowerCase();
  
  // 1. Location Matching
  let matchedDistrict = 'Ranchi';
  for (const d of DISTRICTS) {
    if (fullText.includes(d.name.toLowerCase())) {
      matchedDistrict = d.name;
      break;
    }
  }

  // 2. Block / Landmark extraction via regex
  let matchedBlock = 'Central Block';
  const blockMatch = fullText.match(/(?:in|at|near|block|panchayat)\s+([a-zA-Z]+(?:\s+[a-zA-Z]+)?)/i);
  if (blockMatch && blockMatch[1] && blockMatch[1].length > 2) {
    matchedBlock = blockMatch[1].charAt(0).toUpperCase() + blockMatch[1].slice(1);
  }

  // 3. Infrastructure Type
  let infra = 'Civic Infrastructure';
  if (fullText.includes('pothole') || fullText.includes('road') || fullText.includes('bridge') || fullText.includes('highway')) {
    infra = 'Roadway & Bridge Network';
  } else if (fullText.includes('water') || fullText.includes('pipe') || fullText.includes('drain') || fullText.includes('sewage')) {
    infra = 'Water & Sanitation Infrastructure';
  } else if (fullText.includes('electric') || fullText.includes('transformer') || fullText.includes('wire') || fullText.includes('power')) {
    infra = 'Power & Electrical Grid';
  } else if (fullText.includes('hospital') || fullText.includes('school') || fullText.includes('anganwadi')) {
    infra = 'Public Health & Education Facility';
  } else if (fullText.includes('garbage') || fullText.includes('waste') || fullText.includes('dump')) {
    infra = 'Solid Waste & Environmental Utility';
  }

  // 4. Hazard Type & Urgency
  let hazard = 'Structural Defect';
  let urgency = 5;
  if (fullText.includes('flood') || fullText.includes('waterlogging') || fullText.includes('inundat')) {
    hazard = 'Monsoon Flooding / Waterlogging';
    urgency = 8;
  } else if (fullText.includes('electric') || fullText.includes('wire') || fullText.includes('shock') || fullText.includes('spark')) {
    hazard = 'Electrocution / High-Voltage Risk';
    urgency = 9;
  } else if (fullText.includes('collapse') || fullText.includes('crack') || fullText.includes('sinkhole') || fullText.includes('cave')) {
    hazard = 'Structural Collapse Hazard';
    urgency = 9;
  } else if (fullText.includes('contamination') || fullText.includes('poison') || fullText.includes('toxic') || fullText.includes('smell')) {
    hazard = 'Water / Soil Bio-Chemical Contamination';
    urgency = 8;
  } else if (fullText.includes('pothole') || fullText.includes('broken')) {
    hazard = 'Vehicular Accident & Commuter Hazard';
    urgency = 6;
  }

  // 5. Population estimation from numbers in text
  let population = 500;
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

  // 6. Temporal extraction
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const coords = DISTRICT_COORDS[matchedDistrict] || { lat: 23.3441, lng: 85.3096 };

  return {
    date: dateStr,
    time: `${timeStr} IST`,
    location: {
      district: matchedDistrict,
      block: matchedBlock,
      lat: coords.lat,
      lng: coords.lng,
    },
    affectedPopulation: population,
    infrastructureType: infra,
    hazardType: hazard,
    hazardUrgency: urgency,
    economicValueEstimate: Math.min(500000, population * 250),
    estimatedResolutionCost: Math.min(300000, population * 120),
    summary: description.slice(0, 150),
    confidence: 0.85,
  };
}

/**
 * Main Stage 4 Entity Extraction function
 */
export async function extractEntities(description: string, title: string = ''): Promise<ExtractedEntities> {
  const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JYEDAm5LNkEkX5oRsZ5vEVvIC4_830TTIpHqeSyiWS5Q';

  if (!apiKey || apiKey.length < 15) {
    return extractEntitiesHeuristic(description, title);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const prompt = `You are the NIVAARAN Government AI Data Extraction Engine for Jharkhand.
Analyze the following citizen problem report and extract exact structured entities into JSON.

Report Title: "${title}"
Report Description: "${description}"

Return JSON matching this exact structure:
{
  "date": "Extracted date or current date if unspecified",
  "time": "Extracted time or current time if unspecified",
  "district": "One of: [Ranchi, Dhanbad, East Singhbhum, Bokaro, Palamu, Hazaribagh, Deoghar, Giridih, Ramgarh, Latehar, Garhwa, Dumka, Godda, Sahebganj, Pakur, Jamtara, Khunti, Gumla, Simdega, West Singhbhum, Seraikela Kharsawan, Chatra, Koderma, Lohardaga]",
  "block": "Block or area name",
  "landmark": "Nearby landmark if mentioned",
  "affectedPopulation": integer number of people impacted (estimate 300 to 5000 if not stated),
  "infrastructureType": "Specific public infrastructure component (e.g. Concrete Culvert, 11kV Transformer, Rural Paved Road, Borewell Aquifer, Storm Drain)",
  "hazardType": "Specific safety hazard (e.g. Flash Flood Risk, High-Voltage Exposure, Pothole Traffic Risk, Pathogen Contamination)",
  "hazardUrgency": integer from 1 (minor) to 10 (life-critical emergency),
  "economicValueEstimate": estimated economic loss saved in INR (e.g. 50000 to 500000),
  "estimatedResolutionCost": estimated cost in INR for university lab/department to fix (e.g. 25000 to 200000),
  "summary": "1 concise sentence summarizing the core challenge"
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
        const district = parsed.district || 'Ranchi';
        const coords = DISTRICT_COORDS[district] || { lat: 23.3441, lng: 85.3096 };

        return {
          date: parsed.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: parsed.time || `${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST`,
          location: {
            district,
            block: parsed.block || 'Central Block',
            landmark: parsed.landmark || undefined,
            lat: coords.lat,
            lng: coords.lng,
          },
          affectedPopulation: typeof parsed.affectedPopulation === 'number' ? parsed.affectedPopulation : 500,
          infrastructureType: parsed.infrastructureType || 'Public Infrastructure',
          hazardType: parsed.hazardType || 'Civic Safety Defect',
          hazardUrgency: typeof parsed.hazardUrgency === 'number' ? Math.min(10, Math.max(1, parsed.hazardUrgency)) : 6,
          economicValueEstimate: typeof parsed.economicValueEstimate === 'number' ? parsed.economicValueEstimate : 100000,
          estimatedResolutionCost: typeof parsed.estimatedResolutionCost === 'number' ? parsed.estimatedResolutionCost : 50000,
          summary: parsed.summary || description.slice(0, 150),
          confidence: 0.95,
        };
      }
    }
  } catch {
    // Fallback gracefully on timeout or network error
  }

  return extractEntitiesHeuristic(description, title);
}
