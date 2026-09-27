export const FLOOD_SCENARIO = { title: 'Monsoon Waterlogging — Ranchi Ward Kanke/Harmu', district_code: 'RANCHI', block_code: 'RANCHI_KANKE', type: 'FLOOD', severity: 'MODERATE', description: 'Annual monsoon runoff overwhelms drains; 30–60cm standing water; 2,000+ households; 3 schools disrupted.' };
export const SCHOOL_SCENARIO = { title: 'School WASH & Solar — Khunti Block (5 schools)', district_code: 'KHOUNTI', block_code: 'KHOUNTI_KANKE', type: 'EDUCATION_INFRASTRUCTURE', severity: 'HIGH', description: '5 government primaries lack functional toilets + reliable electricity; solar ~5kW/roof; attendance drops 12%.' };
export const TUPUDANA_CULVERT_SCENARIO = {
  id: 'NIV-JH-RNC-2026-0042',
  title: 'Catastrophic Culvert Failure & Roadway Washout on Tupudana–Balalong Industrial Corridor',
  district_code: 'RANCHI',
  block_code: 'RANCHI_HATIA',
  type: 'PUBLIC_INFRASTRUCTURE_ROAD_BRIDGES',
  categoryCode: 'GOV-CIVIC-04',
  severity: 'P1_CRITICAL',
  priorityScore: 94.05,
  latitude: 23.2842,
  longitude: 85.3126,
  location: 'Tupudana–Balalong Link Road, Hatia Block, Ranchi District, Jharkhand',
  description: 'Monsoon flash flood surge overtopped aging 1.8m masonry culvert, causing total foundation scour and roadway breach (4.2m deep crater). Direct arterial access severed for Hatia rail yard, 35 MSME units, and 14 tribal villages (22,000 residents). Ambulances diverted 14.5 km.',
  assignedDept: 'Road Construction Department (RCD) Jharkhand',
  matchedHEI: 'Birla Institute of Technology (BIT Mesra), Ranchi',
  heiDepartment: 'Department of Civil and Environmental Engineering',
  estimatedCost: 3905000,
  coFundingCSR: 'Tupudana Industrial Estate Manufacturers Association (TIEMA)',
  workflowStages: [
    'Citizen Complaint',
    'AI Verification & PII Masking',
    'Duplicate Detection',
    'P1 Priority Scoring',
    'Automatic Government Routing',
    'Academic/Expert Matching with BIT Mesra',
    'Technical Assessment',
    'DPR/CAD/Cost Estimate',
    'Resolution Tracking'
  ]
};
console.log('Canonical scenarios: FLOOD (Ranchi) + SCHOOL (Khunti) + TUPUDANA_CULVERT (Ranchi/BIT Mesra)');

