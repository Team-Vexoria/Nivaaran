// Centralized Workflow Seed Data for All 48 Jharkhand District Crisis Problems
// Spanning all 24 districts of Jharkhand with 2 authentic crisis problems per district.
// Uses DISTRICT_PROBLEM_IMAGES dictionary so all images can be easily edited or pasted in one place.

import type {
  Challenge,
  Project,
  Proposal,
  TimelineEvent,
  WorkflowState,
} from './workflowTypes';
import { DISTRICT_PROBLEM_IMAGES } from './districtProblemImages';

const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

export const SEED_CHALLENGES: Challenge[] = [
  {
    "id": "DEMO-CH-001",
    "reportId": "NIV-2026-001",
    "title": "Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits",
    "description": "Continuous subterranean coalfire smoke and 1.2m wide ground cracks opened near residential quarters. Ground surface temperature measured at 56 degrees Celsius with asphyxiation risks.",
    "district": "Dhanbad",
    "block": "Jharia",
    "village": "Lodna Colliery",
    "locationCoords": {
      "lat": 23.746,
      "lng": 86.4132
    },
    "formattedAddress": "Lodna Colliery, Jharia Block, Dhanbad District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Mining & Coalfire Disaster",
    "aiAnalysis": {
      "category": "Mining & Coalfire Disaster",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits",
      "confidenceScore": 96,
      "priorityScore": 89,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Dhanbad region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Dhanbad. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mining & Geotechnical Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-001']
    ],
    "govtOfficerNote": "Inspected by DC Dhanbad office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri A. K. Rai, DC Dhanbad",
    "govtValidatedAt": daysAgo(11),
    "assignedHEI": "IIT (ISM) Dhanbad",
    "assignedDept": "Mining & Geotechnical Engineering",
    "assignedProjectId": "DEMO-PRJ-001",
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-002",
    "reportId": "NIV-2026-002",
    "title": "Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps",
    "description": "Water quality lab tests show arsenic at 8x WHO safe limits and fluoride at 3.6 mg per litre in community tubewells. Over 6200 residents suffering from skeletal fluorosis and skin lesions.",
    "district": "Giridih",
    "block": "Tisri",
    "village": "Lokai & Baramasia",
    "locationCoords": {
      "lat": 24.5821,
      "lng": 86.0543
    },
    "formattedAddress": "Lokai & Baramasia, Tisri Block, Giridih District, Jharkhand",
    "status": "Prototype Active",
    "stageNumber": 11,
    "stageName": "Stage 11: Prototype Development & Testing",
    "category": "Water Quality & Contamination",
    "aiAnalysis": {
      "category": "Water Quality & Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps",
      "confidenceScore": 97,
      "priorityScore": 90,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Giridih region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Giridih. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Environmental Science & Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-002']
    ],
    "govtOfficerNote": "Inspected by DC Giridih office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Vikram Singh, DC Giridih",
    "govtValidatedAt": daysAgo(12),
    "assignedHEI": "BBMKU & BIT Sindri",
    "assignedDept": "Environmental Science & Engineering",
    "assignedProjectId": "DEMO-PRJ-002",
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-003",
    "reportId": "NIV-2026-003",
    "title": "North Koel rain shadow drought and deep aquifer drawdown below 42 metres",
    "description": "Over 1800 hectares of paddy wilting due to 45 day monsoon deficit. Deep community borewells running dry with zero surface irrigation for 940 tribal farming families.",
    "district": "Palamu",
    "block": "Chhatarpur",
    "village": "Mahugawan",
    "locationCoords": {
      "lat": 24.2341,
      "lng": 84.1852
    },
    "formattedAddress": "Mahugawan, Chhatarpur Block, Palamu District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Drought & Aquifer Depletion",
    "aiAnalysis": {
      "category": "Drought & Aquifer Depletion",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "North Koel rain shadow drought and deep aquifer drawdown below 42 metres",
      "confidenceScore": 98,
      "priorityScore": 91,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Palamu region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Palamu. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil & Water Conservation Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-003']
    ],
    "govtOfficerNote": "Inspected by DC Palamu office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Shashi Ranjan, DC Palamu",
    "govtValidatedAt": daysAgo(13),
    "assignedHEI": "Birsa Agricultural University (BAU)",
    "assignedDept": "Soil & Water Conservation Engineering",
    "assignedProjectId": "DEMO-PRJ-003",
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-004",
    "reportId": "NIV-2026-004",
    "title": "Subarnarekha and Kharkai river confluence backwater flood surge in Bagbera settlement",
    "description": "High tide monsoon surge forces river water 1.8km backwards through open drainage culverts, flooding 4200 low lying homes with contaminated floodwaters.",
    "district": "East Singhbhum",
    "block": "Jamshedpur Urban",
    "village": "Bagbera Colony",
    "locationCoords": {
      "lat": 22.7712,
      "lng": 86.195
    },
    "formattedAddress": "Bagbera Colony, Jamshedpur Urban Block, East Singhbhum District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Flooding & Drainage",
    "aiAnalysis": {
      "category": "Flooding & Drainage",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Subarnarekha and Kharkai river confluence backwater flood surge in Bagbera settlement",
      "confidenceScore": 99,
      "priorityScore": 92,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in East Singhbhum region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in East Singhbhum. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil & IoT Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 92,
    "confidenceScore": 99,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-004']
    ],
    "govtOfficerNote": "Inspected by DC East Singhbhum office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Manjunath Bhajantri, DC East Singhbhum",
    "govtValidatedAt": daysAgo(14),
    "assignedHEI": "NIT Jamshedpur",
    "assignedDept": "Civil & IoT Engineering",
    "assignedProjectId": "DEMO-PRJ-004",
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(1)
  },
  {
"id": "DEMO-CH-005",
    "reportId": "NIV-2026-005",
    "title": "Iron ore tailings slurry and hematite red mud runoff polluting Karo river at Gua",
    "description": "Monsoon heavy rain overtopped iron ore slime ponds, releasing high turbidity hematite red sludge into Karo river, elevating TSS to 840 mg per litre.",
    "district": "West Singhbhum",
    "block": "Noamundi",
    "village": "Gua & Barajamda",
    "locationCoords": {
      "lat": 22.1852,
      "lng": 85.3847

    },
    "formattedAddress": "Gua & Barajamda, Noamundi Block, West Singhbhum District, Jharkhand",
    "status": "Prototype Active",
    "stageNumber": 11,
    "stageName": "Stage 11: Prototype Development & Testing",
    "category": "Industrial Mining Effluent & River Contamination",
    "aiAnalysis": {
      "category": "Industrial Mining Effluent & River Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Iron ore tailings slurry and hematite red mud runoff polluting Karo river at Gua",
      "confidenceScore": 95,
      "priorityScore": 93,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in West Singhbhum region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in West Singhbhum. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 93,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-005']
    ],
    "govtOfficerNote": "Inspected by DC West Singhbhum office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Kuldeep Chaudhary, DC West Singhbhum",
    "govtValidatedAt": daysAgo(15),
    "assignedHEI": "Srinath University (Adityapur) & Kolhan University",
    "assignedDept": "Chemical & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-005",
    "createdAt": daysAgo(25),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-006",
    "reportId": "NIV-2026-006",
    "title": "Elephant migration corridor nocturnal crop raiding and human elephant conflict at Betla buffer",
    "description": "Herd of 14 wild elephants routinely leaves Betla National Park corridor, destroying 65 hectares of standing maize crops and threatening 12 tribal hamlets.",
    "district": "Latehar",
    "block": "Barwadih",
    "village": "Betla Buffer Zone",
    "locationCoords": {
      "lat": 23.7431,
      "lng": 84.4984
    },
    "formattedAddress": "Betla Buffer Zone, Barwadih Block, Latehar District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Wildlife Conservation & Conflict",
    "aiAnalysis": {
      "category": "Wildlife Conservation & Conflict",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Elephant migration corridor nocturnal crop raiding and human elephant conflict at Betla buffer",
      "confidenceScore": 96,
      "priorityScore": 94,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Latehar region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Latehar. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Electronics & Forestry Management",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 94,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-006']
    ],
    "govtOfficerNote": "Inspected by DC Latehar office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Himanshu Mohan, DC Latehar",
    "govtValidatedAt": daysAgo(16),
    "assignedHEI": "Sarala Birla University (SBU, Ranchi) & BAU Ranchi",
    "assignedDept": "Electronics & Forestry Management",
    "assignedProjectId": "DEMO-PRJ-006",
    "createdAt": daysAgo(26),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-007",
    "reportId": "NIV-2026-007",
    "title": "Severe Ganga riverbank scouring and seasonal road washaway isolating 14 Diara island villages",
    "description": "High velocity flood currents scoured 85 metres of riverbank in Rajmahal, threatening the main connecting road and isolating 14 Diara island hamlets with 11000 residents.",
    "district": "Sahibganj",
    "block": "Rajmahal",
    "village": "Diara Khas & Udhwa",
    "locationCoords": {
      "lat": 25.0489,
      "lng": 87.8384
    },
    "formattedAddress": "Diara Khas & Udhwa, Rajmahal Block, Sahibganj District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Flooding & Riverbank Scour",
    "aiAnalysis": {
      "category": "Flooding & Riverbank Scour",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe Ganga riverbank scouring and seasonal road washaway isolating 14 Diara island villages",
      "confidenceScore": 97,
      "priorityScore": 95,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Sahibganj region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Sahibganj. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil & Water Resources Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 95,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-007']
    ],
    "govtOfficerNote": "Inspected by DC Sahibganj office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Umesh Prasad Sah, DC Sahibganj",
    "govtValidatedAt": daysAgo(17),
    "assignedHEI": "Sido Kanhu Murmu University (SKMU)",
    "assignedDept": "Civil & Water Resources Engineering",
    "assignedProjectId": "DEMO-PRJ-007",
    "createdAt": daysAgo(27),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-008",
    "reportId": "NIV-2026-008",
    "title": "Monsoon stormwater accumulation submerging Government High School road in Hutup",
    "description": "Heavy storm runoff from Kanke catchment has submerged the main access road under 3.5 feet of stagnant runoff. 450 school children cannot reach school safely.",
    "district": "Ranchi",
    "block": "Kanke",
    "village": "Hutup & Mesra Mor",
    "locationCoords": {
      "lat": 23.4241,
      "lng": 85.3421
    },
    "formattedAddress": "Hutup & Mesra Mor, Kanke Block, Ranchi District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Flooding & Drainage",
    "aiAnalysis": {
      "category": "Flooding & Drainage",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Monsoon stormwater accumulation submerging Government High School road in Hutup",
      "confidenceScore": 98,
      "priorityScore": 96,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Ranchi region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Ranchi. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil Engineering & Embedded Systems",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 96,
    "confidenceScore": 98,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-008']
    ],
    "govtOfficerNote": "Inspected by DC Ranchi office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Rahul Kumar Sinha, DC Ranchi",
    "govtValidatedAt": daysAgo(18),
    "assignedHEI": "Dr. Shyama Prasad Mukherjee University (DSPMU, Ranchi)",
    "assignedDept": "Civil Engineering & Embedded Systems",
    "assignedProjectId": "DEMO-PRJ-008",
    "createdAt": daysAgo(28),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-009",
    "reportId": "NIV-2026-009",
    "title": "Fly ash slurry pipeline breach discharging into Konar river intake zone at Phusro",
    "description": "Rupture in thermal power plant ash disposal pipeline discharged 450 tonnes of fly ash slurry into Konar river, threatening municipal drinking water intake wells.",
    "district": "Bokaro",
    "block": "Bermo",
    "village": "Phusro & Jaridih",
    "locationCoords": {
      "lat": 23.782,
      "lng": 85.961
    },
    "formattedAddress": "Phusro & Jaridih, Bermo Block, Bokaro District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Industrial Power Plant Fly Ash Spill",
    "aiAnalysis": {
      "category": "Industrial Power Plant Fly Ash Spill",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Fly ash slurry pipeline breach discharging into Konar river intake zone at Phusro",
      "confidenceScore": 99,
      "priorityScore": 88,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Bokaro region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Bokaro. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 88,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-009']
    ],
    "govtOfficerNote": "Inspected by DC Bokaro office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Kuldeep Chaudhary, DC Bokaro",
    "govtValidatedAt": daysAgo(19),
    "assignedHEI": "National University of Study and Research in Law (NUSRL)",
    "assignedDept": "Chemical & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-009",
    "createdAt": daysAgo(29),
    "updatedAt": daysAgo(2)
  },
  {
"id": "DEMO-CH-010",
    "reportId": "NIV-2026-010",
    "title": "Untreated electroplating heavy metal and acid bath discharge into Kharkai river tributary",
    "description": "Unauthorized discharge of chromium, nickel, and acidic wash water from small scale electroplating units in Adityapur Phase 4 into natural nallah entering Kharkai river.",
    "district": "Saraikela Kharsawan",
    "block": "Gamharia",
    "village": "Adityapur Phase 4",
    "locationCoords": {
      "lat": 22.7845,
      "lng": 86.152

    },
    "formattedAddress": "Adityapur Phase 4, Gamharia Block, Saraikela Kharsawan District, Jharkhand",
    "status": "Prototype Active",
    "stageNumber": 11,
    "stageName": "Stage 11: Prototype Development & Testing",
    "category": "Industrial Chemical Water Pollution",
    "aiAnalysis": {
      "category": "Industrial Chemical Water Pollution",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Untreated electroplating heavy metal and acid bath discharge into Kharkai river tributary",
      "confidenceScore": 95,
      "priorityScore": 89,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Saraikela Kharsawan region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Saraikela Kharsawan. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Metallurgy & Chemical Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-010']
    ],
    "govtOfficerNote": "Inspected by DC Saraikela Kharsawan office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ravi Shankar Shukla, DC Saraikela Kharsawan",
    "govtValidatedAt": daysAgo(20),
    "assignedHEI": "Arka Jain University, Jamshedpur & NIT Jamshedpur",
    "assignedDept": "Metallurgy & Chemical Engineering",
    "assignedProjectId": "DEMO-PRJ-010",
    "createdAt": daysAgo(30),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-011",
    "reportId": "NIV-2026-011",
    "title": "Fungal shoot blight and Eublemma moth infestation destroying tribal Kusum tree lac yields",
    "description": "Severe fungal twig blight coupled with predatory caterpillar attack destroyed 70% of Rangeeni and Kusmi lac crops across 2400 tribal farmer host trees in Torpa block.",
    "district": "Khunti",
    "block": "Torpa",
    "village": "Dormo & Tapkara",
    "locationCoords": {
      "lat": 23.0722,
      "lng": 85.2789
    },
    "formattedAddress": "Dormo & Tapkara, Torpa Block, Khunti District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Agro Forestry & Tribal Livelihood Disease",
    "aiAnalysis": {
      "category": "Agro Forestry & Tribal Livelihood Disease",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Fungal shoot blight and Eublemma moth infestation destroying tribal Kusum tree lac yields",
      "confidenceScore": 96,
      "priorityScore": 90,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Khunti region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Khunti. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Forestry & Biotechnology",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-011']
    ],
    "govtOfficerNote": "Inspected by DC Khunti office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Lokesh Mishra, DC Khunti",
    "govtValidatedAt": daysAgo(21),
    "assignedHEI": "YBN University (Ranchi) & BAU Ranchi",
    "assignedDept": "Forestry & Biotechnology",
    "assignedProjectId": "DEMO-PRJ-011",
    "createdAt": daysAgo(31),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-012",
    "reportId": "NIV-2026-012",
    "title": "Fecal coliform and microbial contamination in 32 community handpumps along pilgrim route",
    "description": "High pilgrim footfall during Shravani Mela season caused shallow aquifer microbial contamination. Coliform counts exceed 140 CFU/100ml in 32 community handpumps.",
    "district": "Deoghar",
    "block": "Mohanpur",
    "village": "Duma & Ghormara",
    "locationCoords": {
      "lat": 24.4826,
      "lng": 86.7011
    },
    "formattedAddress": "Duma & Ghormara, Mohanpur Block, Deoghar District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Public Health & Water Contamination",
    "aiAnalysis": {
      "category": "Public Health & Water Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Fecal coliform and microbial contamination in 32 community handpumps along pilgrim route",
      "confidenceScore": 97,
      "priorityScore": 91,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Deoghar region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Deoghar. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Public Health & Biotechnology",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 97,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-012']
    ],
    "govtOfficerNote": "Inspected by DC Deoghar office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Vishal Sagar, DC Deoghar",
    "govtValidatedAt": daysAgo(22),
    "assignedHEI": "BIT Mesra (Deoghar Campus) & AIIMS Deoghar",
    "assignedDept": "Public Health & Biotechnology",
    "assignedProjectId": "DEMO-PRJ-012",
    "createdAt": daysAgo(32),
    "updatedAt": daysAgo(1)
  },
  {
"id": "DEMO-CH-013",
    "reportId": "NIV-2026-013",
    "title": "Barakar river bridge Pier 3 foundation scouring and concrete spalling risk on NH connector",
    "description": "Violent river turbulence scoured 2.8m deep cavity around foundation pier of Barakar bridge. Heavy mineral truck traffic risks structural fatigue and critical pier failure.",
    "district": "Hazaribagh",
    "block": "Chouparan",
    "village": "Barakar River Crossing",
    "locationCoords": {
      "lat": 23.9925,
      "lng": 85.3637

    },
    "formattedAddress": "Barakar River Crossing, Chouparan Block, Hazaribagh District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Bridge Infrastructure & Transport Safety",
    "aiAnalysis": {
      "category": "Bridge Infrastructure & Transport Safety",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Barakar river bridge Pier 3 foundation scouring and concrete spalling risk on NH connector",
      "confidenceScore": 98,
      "priorityScore": 92,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Hazaribagh region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Hazaribagh. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil Engineering & Structural Dynamics",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 92,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-013']
    ],
    "govtOfficerNote": "Inspected by DC Hazaribagh office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Ms. Nancy Sahay, DC Hazaribagh",
    "govtValidatedAt": daysAgo(23),
    "assignedHEI": "Vinoba Bhave University & NIT Jamshedpur",
    "assignedDept": "Civil Engineering & Structural Dynamics",
    "assignedProjectId": "DEMO-PRJ-013",
    "createdAt": daysAgo(33),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-014",
    "reportId": "NIV-2026-014",
    "title": "Abandoned open pit mica mine quarry slope collapse and unfenced deep water pit hazard",
    "description": "Over 40 abandoned illegal mica quarry pits left un reclaimed in Dhab forest belt. Steep quarry walls (65 degree slope) collapsing after rains, trapping livestock and endangering villagers.",
    "district": "Koderma",
    "block": "Chandwara",
    "village": "Dhab & Domchanch",
    "locationCoords": {
      "lat": 24.4674,
      "lng": 85.5938
    },
    "formattedAddress": "Dhab & Domchanch, Chandwara Block, Koderma District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Mining & Coalfire Disaster",
    "aiAnalysis": {
      "category": "Mining & Coalfire Disaster",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Abandoned open pit mica mine quarry slope collapse and unfenced deep water pit hazard",
      "confidenceScore": 99,
      "priorityScore": 93,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Koderma region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Koderma. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mining Geology & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 93,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-014']
    ],
    "govtOfficerNote": "Inspected by DC Koderma office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Aditya Ranjan, DC Koderma",
    "govtValidatedAt": daysAgo(24),
    "assignedHEI": "Radha Govind University (RGU, Ramgarh) & VBU",
    "assignedDept": "Mining Geology & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-014",
    "createdAt": daysAgo(34),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-015",
    "reportId": "NIV-2026-015",
    "title": "Heavy bauxite haulage truck axle loads causing road subsidence and shoulder collapse on Bishunpur ghat",
    "description": "Continuous movement of overloaded bauxite dumper trucks caused severe longitudinal shearing and edge failure on 4.2km stretch of Bishunpur hill road.",
    "district": "Gumla",
    "block": "Bishunpur",
    "village": "Netarhat Ghat Road",
    "locationCoords": {
      "lat": 23.0428,
      "lng": 84.5422
    },
    "formattedAddress": "Netarhat Ghat Road, Bishunpur Block, Gumla District, Jharkhand",
    "status": "Prototype Active",
    "stageNumber": 11,
    "stageName": "Stage 11: Prototype Development & Testing",
    "category": "Bridge Infrastructure & Transport Safety",
    "aiAnalysis": {
      "category": "Bridge Infrastructure & Transport Safety",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Heavy bauxite haulage truck axle loads causing road subsidence and shoulder collapse on Bishunpur ghat",
      "confidenceScore": 95,
      "priorityScore": 94,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Gumla region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Gumla. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Geotechnical & Transportation Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 94,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-015']
    ],
    "govtOfficerNote": "Inspected by DC Gumla office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Sushant Gaurav, DC Gumla",
    "govtValidatedAt": daysAgo(10),
    "assignedHEI": "Central University of Jharkhand (CUJ) & BIT Mesra",
    "assignedDept": "Geotechnical & Transportation Engineering",
    "assignedProjectId": "DEMO-PRJ-015",
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-016",
    "reportId": "NIV-2026-016",
    "title": "Severe fluoride contamination in deep borewells causing endemic dental and skeletal fluorosis",
    "description": "Fluoride concentration in drinking water handpumps reached 5.2 mg per litre in Bhavnathpur, exceeding safe limits by 3.5x. Over 450 school children show permanent dental mottling.",
    "district": "Garhwa",
    "block": "Bhavnathpur",
    "village": "Kharaundhi & Nagar Untari",
    "locationCoords": {
      "lat": 24.1612,
      "lng": 83.8052
    },
    "formattedAddress": "Kharaundhi & Nagar Untari, Bhavnathpur Block, Garhwa District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Water Quality & Contamination",
    "aiAnalysis": {
      "category": "Water Quality & Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe fluoride contamination in deep borewells causing endemic dental and skeletal fluorosis",
      "confidenceScore": 96,
      "priorityScore": 95,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Garhwa region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Garhwa. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Water Resources & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 95,
    "confidenceScore": 96,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-016']
    ],
    "govtOfficerNote": "Inspected by DC Garhwa office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Shekhar Jamuar, DC Garhwa",
    "govtValidatedAt": daysAgo(11),
    "assignedHEI": "IIM Ranchi & BAU Ranchi",
    "assignedDept": "Water Resources & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-016",
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-017",
    "reportId": "NIV-2026-017",
    "title": "Opencast coal mining PM2.5 and PM10 dust fallout smothering standing tomato and maize crops",
    "description": "High speed coal haulage and un sprayed overburden blasting created thick airborne particulate plumes. PM10 levels exceed 420 ug/m3, coating 380 hectares of vegetable fields.",
    "district": "Chatra",
    "block": "Tandwa",
    "village": "Simaria & Piparwar",
    "locationCoords": {
      "lat": 24.2092,
      "lng": 84.8722
    },
    "formattedAddress": "Simaria & Piparwar, Tandwa Block, Chatra District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Air Quality & Agricultural Dust Pollution",
    "aiAnalysis": {
      "category": "Air Quality & Agricultural Dust Pollution",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Opencast coal mining PM2.5 and PM10 dust fallout smothering standing tomato and maize crops",
      "confidenceScore": 97,
      "priorityScore": 96,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Chatra region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Chatra. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mechanical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 96,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-017']
    ],
    "govtOfficerNote": "Inspected by DC Chatra office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Abu Imran, DC Chatra",
    "govtValidatedAt": daysAgo(12),
    "assignedHEI": "Jharkhand Rai University (JRU, Ranchi) & VBU",
    "assignedDept": "Mechanical & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-017",
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-018",
    "reportId": "NIV-2026-018",
    "title": "Damodar river black sludge sedimentation and coal washery effluent overflow near Rajrappa",
    "description": "Discharge of fine coal slurry from nearby washeries turned the Damodar riverbed into thick black sludge near Rajrappa temple ghats. Dissolved oxygen plunged to 1.8 mg/L.",
    "district": "Ramgarh",
    "block": "Patratu",
    "village": "Rajrappa Confluence",
    "locationCoords": {
      "lat": 23.6315,
      "lng": 85.5184
    },
    "formattedAddress": "Rajrappa Confluence, Patratu Block, Ramgarh District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Industrial Mining Effluent & River Contamination",
    "aiAnalysis": {
      "category": "Industrial Mining Effluent & River Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Damodar river black sludge sedimentation and coal washery effluent overflow near Rajrappa",
      "confidenceScore": 98,
      "priorityScore": 88,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Ramgarh region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Ramgarh. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 88,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-018']
    ],
    "govtOfficerNote": "Inspected by DC Ramgarh office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Chandan Kumar, DC Ramgarh",
    "govtValidatedAt": daysAgo(13),
    "assignedHEI": "ICFAI University Jharkhand & BIT Mesra",
    "assignedDept": "Chemical & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-018",
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-019",
    "reportId": "NIV-2026-019",
    "title": "Seasonal flash flood washouts of low level causeway isolating 8 tribal villages in Kolebira",
    "description": "Flash floods on Sankh river submerge and wash out the single submersible causeway every monsoon, isolating 7800 tribal residents without emergency ambulance access.",
    "district": "Simdega",
    "block": "Kolebira",
    "village": "Sankh River Basin",
    "locationCoords": {
      "lat": 22.6162,
      "lng": 84.5074
    },
    "formattedAddress": "Sankh River Basin, Kolebira Block, Simdega District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Bridge Infrastructure & Transport Safety",
    "aiAnalysis": {
      "category": "Bridge Infrastructure & Transport Safety",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Seasonal flash flood washouts of low level causeway isolating 8 tribal villages in Kolebira",
      "confidenceScore": 99,
      "priorityScore": 89,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Simdega region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Simdega. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Structural Engineering & Rural Infrastructure",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-019']
    ],
    "govtOfficerNote": "Inspected by DC Simdega office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ajay Kumar Singh, DC Simdega",
    "govtValidatedAt": daysAgo(14),
    "assignedHEI": "XLRI Xavier School of Management & NIT Jamshedpur",
    "assignedDept": "Structural Engineering & Rural Infrastructure",
    "assignedProjectId": "DEMO-PRJ-019",
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-020",
    "reportId": "NIV-2026-020",
    "title": "Bauxite mine surface red mud runoff burying terraced paddy fields of Asur tribal farmers",
    "description": "Heavy monsoon runoff from Bagru plateau bauxite mines deposited 15cm of alkaline red silt across 220 hectares of terraced paddy fields in Kisko.",
    "district": "Lohardaga",
    "block": "Kisko",
    "village": "Bagru Hill Terraces",
    "locationCoords": {
      "lat": 23.4354,
      "lng": 84.6812
    },
    "formattedAddress": "Bagru Hill Terraces, Kisko Block, Lohardaga District, Jharkhand",
    "status": "Prototype Active",
    "stageNumber": 11,
    "stageName": "Stage 11: Prototype Development & Testing",
    "category": "Environmental Siltation & Agro Degradation",
    "aiAnalysis": {
      "category": "Environmental Siltation & Agro Degradation",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Bauxite mine surface red mud runoff burying terraced paddy fields of Asur tribal farmers",
      "confidenceScore": 95,
      "priorityScore": 90,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Lohardaga region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Lohardaga. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil Science & Agronomy",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 95,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-020']
    ],
    "govtOfficerNote": "Inspected by DC Lohardaga office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Dr. Waghmare Prasad Krishna, DC Lohardaga",
    "govtValidatedAt": daysAgo(15),
    "assignedHEI": "Nilamber Pitamber University (NPU, Palamu)",
    "assignedDept": "Soil Science & Agronomy",
    "assignedProjectId": "DEMO-PRJ-020",
    "createdAt": daysAgo(25),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-021",
    "reportId": "NIV-2026-021",
    "title": "Unfiltered Mayurakshi river basin water supply contaminated with high microbial pathogens and arsenic",
    "description": "Community drinking water scheme drawn from Mayurakshi river shows elevated total coliforms (220 CFU/100ml) and arsenic spikes (0.06 mg/L) across 24 villages.",
    "district": "Dumka",
    "block": "Shikaripara",
    "village": "Ranishwar & Kathikund",
    "locationCoords": {
      "lat": 24.2676,
      "lng": 87.2486
    },
    "formattedAddress": "Ranishwar & Kathikund, Shikaripara Block, Dumka District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Water Quality & Contamination",
    "aiAnalysis": {
      "category": "Water Quality & Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Unfiltered Mayurakshi river basin water supply contaminated with high microbial pathogens and arsenic",
      "confidenceScore": 96,
      "priorityScore": 91,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Dumka region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Dumka. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Environmental Science & Water Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-021']
    ],
    "govtOfficerNote": "Inspected by DC Dumka office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ameet Kumar, DC Dumka",
    "govtValidatedAt": daysAgo(16),
    "assignedHEI": "Sido Kanhu Murmu University (SKMU)",
    "assignedDept": "Environmental Science & Water Engineering",
    "assignedProjectId": "DEMO-PRJ-021",
    "createdAt": daysAgo(26),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-022",
    "reportId": "NIV-2026-022",
    "title": "Coal thermal plant suspended particulate matter (SPM) fallout damaging betel vine and mango orchards",
    "description": "Continuous deposition of fine coal ash and particulate matter on betel leaf greenhouses and mango blossoms reduced crop yields by 45% across 320 hectares.",
    "district": "Godda",
    "block": "Boarijor",
    "village": "Mehrma & Mahagama",
    "locationCoords": {
      "lat": 24.8322,
      "lng": 87.2144
    },
    "formattedAddress": "Mehrma & Mahagama, Boarijor Block, Godda District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Thermal Power Industrial Pollution",
    "aiAnalysis": {
      "category": "Thermal Power Industrial Pollution",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Coal thermal plant suspended particulate matter (SPM) fallout damaging betel vine and mango orchards",
      "confidenceScore": 97,
      "priorityScore": 92,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Godda region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Godda. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Horticulture & Environmental Science",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 92,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-022']
    ],
    "govtOfficerNote": "Inspected by DC Godda office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Zeeshan Qamar, DC Godda",
    "govtValidatedAt": daysAgo(17),
    "assignedHEI": "SKMU Dumka & BAU Ranchi",
    "assignedDept": "Horticulture & Environmental Science",
    "assignedProjectId": "DEMO-PRJ-022",
    "createdAt": daysAgo(27),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-023",
    "reportId": "NIV-2026-023",
    "title": "Stone crushing silica dust emission causing acute silicosis risk among tribal workers",
    "description": "Dry stone crushing and unshielded conveyor belts in Hiranpur released crystalline silica dust at 12x safe limits. Over 1600 tribal laborers report chronic coughing.",
    "district": "Pakur",
    "block": "Hiranpur",
    "village": "Malpaharia Cluster",
    "locationCoords": {
      "lat": 24.6345,
      "lng": 87.8456
    },
    "formattedAddress": "Malpaharia Cluster, Hiranpur Block, Pakur District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Mining & Coalfire Disaster",
    "aiAnalysis": {
      "category": "Mining & Coalfire Disaster",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Stone crushing silica dust emission causing acute silicosis risk among tribal workers",
      "confidenceScore": 98,
      "priorityScore": 93,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Pakur region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Pakur. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Occupational Health & Mining Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 93,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-023']
    ],
    "govtOfficerNote": "Inspected by DC Pakur office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Mrityunjay Kumar Baranwal, DC Pakur",
    "govtValidatedAt": daysAgo(18),
    "assignedHEI": "Capital University (Koderma) & SKMU Dumka",
    "assignedDept": "Occupational Health & Mining Engineering",
    "assignedProjectId": "DEMO-PRJ-023",
    "createdAt": daysAgo(28),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-024",
    "reportId": "NIV-2026-024",
    "title": "Ajay river seasonal sand deposition suffocating fertile paddy alluvial topsoil",
    "description": "Violent monsoon runoff along the Ajay river deposited 0.8m thick sterile sand sheets across 480 hectares of fertile paddy fields in Kundahit.",
    "district": "Jamtara",
    "block": "Kundahit",
    "village": "Ajay Basin Farmlands",
    "locationCoords": {
      "lat": 23.9584,
      "lng": 86.9942
    },
    "formattedAddress": "Ajay Basin Farmlands, Kundahit Block, Jamtara District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Flooding & Drainage",
    "aiAnalysis": {
      "category": "Flooding & Drainage",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Ajay river seasonal sand deposition suffocating fertile paddy alluvial topsoil",
      "confidenceScore": 99,
      "priorityScore": 94,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Jamtara region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Jamtara. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil Science & Agricultural Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 94,
    "confidenceScore": 99,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-024']
    ],
    "govtOfficerNote": "Inspected by DC Jamtara office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Faiz Aq Ahmed Mumtaz, DC Jamtara",
    "govtValidatedAt": daysAgo(19),
    "assignedHEI": "Central University of Jharkhand (CUJ)",
    "assignedDept": "Soil Science & Agricultural Engineering",
    "assignedProjectId": "DEMO-PRJ-024",
    "createdAt": daysAgo(29),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-025",
    "reportId": "NIV-2026-025",
    "title": "Heavy coal transport track vibration causing structural cracks in nearby schools and masonry",
    "description": "Continuous 40 tonne coal trailer movements create ground vibrations exceeding 8 mm/s PPV, causing diagonal shearing cracks in two primary schools and 60+ rural homes.",
    "district": "Dhanbad",
    "block": "Katras",
    "village": "Govindpur Cluster",
    "locationCoords": {
      "lat": 23.791,
      "lng": 86.4482
    },
    "formattedAddress": "Govindpur Cluster, Katras Block, Dhanbad District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Mining & Coalfire Disaster",
    "aiAnalysis": {
      "category": "Mining & Coalfire Disaster",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Heavy coal transport track vibration causing structural cracks in nearby schools and masonry",
      "confidenceScore": 95,
      "priorityScore": 95,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Dhanbad region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Dhanbad. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mining & Geotechnical Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 95,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-025']
    ],
    "govtOfficerNote": "Inspected by DC Dhanbad office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri A. K. Rai, DC Dhanbad",
    "govtValidatedAt": daysAgo(20),
    "assignedHEI": "Binod Bihari Mahto Koyalanchal University (BBMKU)",
    "assignedDept": "Department of Civil & Geotechnical Engineering",
    "assignedProjectId": "DEMO-PRJ-025",
    "createdAt": daysAgo(30),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-026",
    "reportId": "NIV-2026-026",
    "title": "High seasonal solar pump failure and inverter degradation due to extreme mica and quartz dust deposition",
    "description": "Fine abrasive mica and silica dust coats solar arrays in off grid tribal lift irrigation stations, causing 42% power yield drop and inverter overheating failures.",
    "district": "Giridih",
    "block": "Pirtand",
    "village": "Bengabad Solar Grid",
    "locationCoords": {
      "lat": 24.6271,
      "lng": 86.0893
    },
    "formattedAddress": "Bengabad Solar Grid, Pirtand Block, Giridih District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Renewable Energy & Power",
    "aiAnalysis": {
      "category": "Renewable Energy & Power",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "High seasonal solar pump failure and inverter degradation due to extreme mica and quartz dust deposition",
      "confidenceScore": 96,
      "priorityScore": 96,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Giridih region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Giridih. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Environmental Science & Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 96,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-026']
    ],
    "govtOfficerNote": "Inspected by DC Giridih office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Vikram Singh, DC Giridih",
    "govtValidatedAt": daysAgo(21),
    "assignedHEI": "National Institute of Foundry and Forge Technology (NIFFT)",
    "assignedDept": "Department of Electrical & Clean Energy Engineering",
    "assignedProjectId": "DEMO-PRJ-026",
    "createdAt": daysAgo(31),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-027",
    "reportId": "NIV-2026-027",
    "title": "Severe summer thermal stress and mortality in indigenous black Bengal goat rearing herds",
    "description": "Extreme 46C peak summer heat waves cause 28% herd mortality and acute dehydration across 800+ landless women goat farmers.",
    "district": "Palamu",
    "block": "Daltonganj",
    "village": "Chainpur Pastoral Belt",
    "locationCoords": {
      "lat": 24.2791,
      "lng": 84.2202
    },
    "formattedAddress": "Chainpur Pastoral Belt, Daltonganj Block, Palamu District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Drought & Livestock Livelihoods",
    "aiAnalysis": {
      "category": "Drought & Livestock Livelihoods",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe summer thermal stress and mortality in indigenous black Bengal goat rearing herds",
      "confidenceScore": 97,
      "priorityScore": 88,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Palamu region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Palamu. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil & Water Conservation Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 88,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-027']
    ],
    "govtOfficerNote": "Inspected by DC Palamu office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Shashi Ranjan, DC Palamu",
    "govtValidatedAt": daysAgo(22),
    "assignedHEI": "Nilamber Pitamber University (NPU, Palamu)",
    "assignedDept": "Faculty of Veterinary Science & Animal Husbandry",
    "assignedProjectId": "DEMO-PRJ-027",
    "createdAt": daysAgo(32),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-028",
    "reportId": "NIV-2026-028",
    "title": "Chromium and copper heavy metal bioaccumulation in vegetable farm soils along Kharkai river discharge channels",
    "description": "Treated industrial runoff contains residual heavy metals accumulating in topsoil, exceeding permissible agronomic phytotoxicity limits in spinach and brinjal crops.",
    "district": "East Singhbhum",
    "block": "Potka",
    "village": "Golmuri Agricultural Strip",
    "locationCoords": {
      "lat": 22.8162,
      "lng": 86.23
    },
    "formattedAddress": "Golmuri Agricultural Strip, Potka Block, East Singhbhum District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Industrial Pollution & Soil Remediation",
    "aiAnalysis": {
      "category": "Industrial Pollution & Soil Remediation",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Chromium and copper heavy metal bioaccumulation in vegetable farm soils along Kharkai river discharge channels",
      "confidenceScore": 98,
      "priorityScore": 89,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in East Singhbhum region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in East Singhbhum. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil & IoT Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 98,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-028']
    ],
    "govtOfficerNote": "Inspected by DC East Singhbhum office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Manjunath Bhajantri, DC East Singhbhum",
    "govtValidatedAt": daysAgo(23),
    "assignedHEI": "NIT Jamshedpur",
    "assignedDept": "Department of Metallurgical & Materials Engineering",
    "assignedProjectId": "DEMO-PRJ-028",
    "createdAt": daysAgo(33),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-029",
    "reportId": "NIV-2026-029",
    "title": "Acid mine drainage and manganese leaching into tribal forest drinking wells",
    "description": "Oxidation of exposed iron and manganese pyrite ores acidifies groundwater (pH 4.8) and leaches soluble manganese (1.4 mg/L) into 22 village wells.",
    "district": "West Singhbhum",
    "block": "Jhinkpani",
    "village": "Noamundi Forest Belt",
    "locationCoords": {
      "lat": 22.2302,
      "lng": 85.4197
    },
    "formattedAddress": "Noamundi Forest Belt, Jhinkpani Block, West Singhbhum District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Water Quality & Contamination",
    "aiAnalysis": {
      "category": "Water Quality & Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Acid mine drainage and manganese leaching into tribal forest drinking wells",
      "confidenceScore": 99,
      "priorityScore": 90,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in West Singhbhum region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in West Singhbhum. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-029']
    ],
    "govtOfficerNote": "Inspected by DC West Singhbhum office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Kuldeep Chaudhary, DC West Singhbhum",
    "govtValidatedAt": daysAgo(24),
    "assignedHEI": "Kolhan University, Chaibasa",
    "assignedDept": "Department of Geology & Environmental Sciences",
    "assignedProjectId": "DEMO-PRJ-029",
    "createdAt": daysAgo(34),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-030",
    "reportId": "NIV-2026-030",
    "title": "Frequent monsoon flash flood logjams and wooden culvert collapse cutting off Mahuadanr valley",
    "description": "Mountain torrents carry uprooted timber logjams that smash temporary wooden culverts, cutting off medical and food access for 11000 tribal villagers during peak rains.",
    "district": "Latehar",
    "block": "Mahuadanr",
    "village": "Chandwa Valley Link",
    "locationCoords": {
      "lat": 23.7881,
      "lng": 84.5334
    },
    "formattedAddress": "Chandwa Valley Link, Mahuadanr Block, Latehar District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Bridge Infrastructure & Transport Safety",
    "aiAnalysis": {
      "category": "Bridge Infrastructure & Transport Safety",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Frequent monsoon flash flood logjams and wooden culvert collapse cutting off Mahuadanr valley",
      "confidenceScore": 95,
      "priorityScore": 91,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Latehar region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Latehar. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Electronics & Forestry Management",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-030']
    ],
    "govtOfficerNote": "Inspected by DC Latehar office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Himanshu Mohan, DC Latehar",
    "govtValidatedAt": daysAgo(10),
    "assignedHEI": "BIT Mesra, Ranchi",
    "assignedDept": "Department of Civil & Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-030",
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-031",
    "reportId": "NIV-2026-031",
    "title": "River siltation and sudden shoreline recession disrupting inland vessel loading and fishing jetties",
    "description": "Excessive bedload silt deposition creates shifting shallow sandbars (depth < 1.4m), stranding cargo barges and blocking traditional fishing boats.",
    "district": "Sahibganj",
    "block": "Sakrigali",
    "village": "Sahibganj Harbor Sector",
    "locationCoords": {
      "lat": 25.215,
      "lng": 87.685
    },
    "formattedAddress": "Sahibganj Harbor Sector, Sakrigali Block, Sahibganj District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Waterways & Sedimentation Control",
    "aiAnalysis": {
      "category": "Waterways & Sedimentation Control",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "River siltation and sudden shoreline recession disrupting inland vessel loading and fishing jetties",
      "confidenceScore": 96,
      "priorityScore": 92,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Sahibganj region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Sahibganj. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil & Water Resources Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 92,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-031']
    ],
    "govtOfficerNote": "Inspected by DC Sahibganj office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Umesh Prasad Sah, DC Sahibganj",
    "govtValidatedAt": daysAgo(11),
    "assignedHEI": "Sido Kanhu Murmu University (SKMU)",
    "assignedDept": "Department of Riverine Studies & Coastal Hydrology",
    "assignedProjectId": "DEMO-PRJ-031",
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-032",
    "reportId": "NIV-2026-032",
    "title": "Cold storage decay and high post harvest loss in peri urban tomato and green chili crops",
    "description": "Lack of local cold chain causes 35% rotting in 120 tonnes of daily harvested tomatoes and chilies during summer months, causing heavy distress sales.",
    "district": "Ranchi",
    "block": "Bero",
    "village": "Mandar Agro Market Belt",
    "locationCoords": {
      "lat": 23.4691,
      "lng": 85.3771
    },
    "formattedAddress": "Mandar Agro Market Belt, Bero Block, Ranchi District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Agri Cold Chain & Renewable Storage",
    "aiAnalysis": {
      "category": "Agri Cold Chain & Renewable Storage",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Cold storage decay and high post harvest loss in peri urban tomato and green chili crops",
      "confidenceScore": 97,
      "priorityScore": 93,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Ranchi region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Ranchi. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil Engineering & Embedded Systems",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 93,
    "confidenceScore": 97,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-032']
    ],
    "govtOfficerNote": "Inspected by DC Ranchi office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Rahul Kumar Sinha, DC Ranchi",
    "govtValidatedAt": daysAgo(12),
    "assignedHEI": "Birsa Agricultural University (BAU)",
    "assignedDept": "College of Agricultural Engineering & Post-Harvest Tech",
    "assignedProjectId": "DEMO-PRJ-032",
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-033",
    "reportId": "NIV-2026-033",
    "title": "Toxic phenolic wastewater and cyanide traces in industrial storm drains near steel processing belt",
    "description": "Intermittent discharge of untreated industrial by products into open storm drains contaminates shallow borewells with phenol (0.45 mg/L) and toxic trace compounds.",
    "district": "Bokaro",
    "block": "Chas",
    "village": "Balidih Industrial Area",
    "locationCoords": {
      "lat": 23.827,
      "lng": 85.996
    },
    "formattedAddress": "Balidih Industrial Area, Chas Block, Bokaro District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Industrial Effluent & Chemical Remediation",
    "aiAnalysis": {
      "category": "Industrial Effluent & Chemical Remediation",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Toxic phenolic wastewater and cyanide traces in industrial storm drains near steel processing belt",
      "confidenceScore": 98,
      "priorityScore": 94,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Bokaro region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Bokaro. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 94,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-033']
    ],
    "govtOfficerNote": "Inspected by DC Bokaro office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Kuldeep Chaudhary, DC Bokaro",
    "govtValidatedAt": daysAgo(13),
    "assignedHEI": "BIT Sindri (Dhanbad)",
    "assignedDept": "Department of Chemical Engineering",
    "assignedProjectId": "DEMO-PRJ-033",
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-034",
    "reportId": "NIV-2026-034",
    "title": "High volatile organic compound (VOC) emissions and toxic paint sludge fumes in auto ancillary zones",
    "description": "Uncontained paint baking ovens and solvent degreasing booths release benzene and toluene fumes at 4x permissible limits, impacting 3200 surrounding workers.",
    "district": "Saraikela Kharsawan",
    "block": "Gamharia",
    "village": "Adityapur Auto Ancillary Zone",
    "locationCoords": {
      "lat": 22.8295,
      "lng": 86.187
    },
    "formattedAddress": "Adityapur Auto Ancillary Zone, Gamharia Block, Saraikela Kharsawan District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Air Quality & VOC Control",
    "aiAnalysis": {
      "category": "Air Quality & VOC Control",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "High volatile organic compound (VOC) emissions and toxic paint sludge fumes in auto ancillary zones",
      "confidenceScore": 99,
      "priorityScore": 95,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Saraikela Kharsawan region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Saraikela Kharsawan. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Metallurgy & Chemical Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 95,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-034']
    ],
    "govtOfficerNote": "Inspected by DC Saraikela Kharsawan office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ravi Shankar Shukla, DC Saraikela Kharsawan",
    "govtValidatedAt": daysAgo(14),
    "assignedHEI": "Netaji Subhas University (NSU, Jamshedpur)",
    "assignedDept": "Department of Chemical Engineering & Clean Air Hub",
    "assignedProjectId": "DEMO-PRJ-034",
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-035",
    "reportId": "NIV-2026-035",
    "title": "Severe stem borer pest infestation damaging Dragon Fruit and Papaya horticulture plantations",
    "description": "Wood boring beetle larvae tunnel through high value dragon fruit and papaya stems, causing 30% crop mortality in newly established tribal agribusiness clusters.",
    "district": "Khunti",
    "block": "Torpa",
    "village": "Karra Horticulture Cluster",
    "locationCoords": {
      "lat": 23.1172,
      "lng": 85.3139
    },
    "formattedAddress": "Karra Horticulture Cluster, Torpa Block, Khunti District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Agri Biotechnology & Pest Control",
    "aiAnalysis": {
      "category": "Agri Biotechnology & Pest Control",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe stem borer pest infestation damaging Dragon Fruit and Papaya horticulture plantations",
      "confidenceScore": 95,
      "priorityScore": 96,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Khunti region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Khunti. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Forestry & Biotechnology",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 96,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-035']
    ],
    "govtOfficerNote": "Inspected by DC Khunti office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Lokesh Mishra, DC Khunti",
    "govtValidatedAt": daysAgo(15),
    "assignedHEI": "Birsa Agricultural University (BAU)",
    "assignedDept": "Department of Entomology & Horticulture",
    "assignedProjectId": "DEMO-PRJ-035",
    "createdAt": daysAgo(25),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-036",
    "reportId": "NIV-2026-036",
    "title": "Enormous biodegradable floral and leaf waste accumulation decaying near religious heritage grounds",
    "description": "Over 8 tonnes of holy flowers (marigold, bel leaves) dumped daily in open drainage lines, causing methane odor, drain blockages, and vector breeding.",
    "district": "Deoghar",
    "block": "Jasidih",
    "village": "Baidyanathdham Heritage Zone",
    "locationCoords": {
      "lat": 24.5276,
      "lng": 86.7361
    },
    "formattedAddress": "Baidyanathdham Heritage Zone, Jasidih Block, Deoghar District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Solid Waste & Biomethanation",
    "aiAnalysis": {
      "category": "Solid Waste & Biomethanation",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Enormous biodegradable floral and leaf waste accumulation decaying near religious heritage grounds",
      "confidenceScore": 96,
      "priorityScore": 88,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Deoghar region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Deoghar. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Public Health & Biotechnology",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 88,
    "confidenceScore": 96,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-036']
    ],
    "govtOfficerNote": "Inspected by DC Deoghar office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Vishal Sagar, DC Deoghar",
    "govtValidatedAt": daysAgo(16),
    "assignedHEI": "Amity University Jharkhand (Ranchi)",
    "assignedDept": "Department of Environmental Engineering",
    "assignedProjectId": "DEMO-PRJ-036",
    "createdAt": daysAgo(26),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-037",
    "reportId": "NIV-2026-037",
    "title": "Rapid soil erosion and gullying on agricultural slopes caused by deforestation and heavy monsoon runoff",
    "description": "Heavy monsoon sheet erosion carves 2m deep gullies across 320 hectares of terraced tribal farms, stripping 4cm of fertile topsoil annually.",
    "district": "Hazaribagh",
    "block": "Barkagaon",
    "village": "Katkamsandi Slopes",
    "locationCoords": {
      "lat": 24.0375,
      "lng": 85.3987
    },
    "formattedAddress": "Katkamsandi Slopes, Barkagaon Block, Hazaribagh District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Soil Conservation & Geosynthetics",
    "aiAnalysis": {
      "category": "Soil Conservation & Geosynthetics",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Rapid soil erosion and gullying on agricultural slopes caused by deforestation and heavy monsoon runoff",
      "confidenceScore": 97,
      "priorityScore": 89,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Hazaribagh region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Hazaribagh. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Civil Engineering & Structural Dynamics",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-037']
    ],
    "govtOfficerNote": "Inspected by DC Hazaribagh office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Ms. Nancy Sahay, DC Hazaribagh",
    "govtValidatedAt": daysAgo(17),
    "assignedHEI": "AISECT University (Hazaribagh)",
    "assignedDept": "Department of Wildlife Biology & Forestry",
    "assignedProjectId": "DEMO-PRJ-037",
    "createdAt": daysAgo(27),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-038",
    "reportId": "NIV-2026-038",
    "title": "Acute groundwater salinity and heavy mineral hardness in dry rocky plateau habitations",
    "description": "Total dissolved solids (TDS) exceed 1800 ppm with high calcium and magnesium sulfate hardness in 28 deep handpumps, causing chronic renal calculi.",
    "district": "Koderma",
    "block": "Markacho",
    "village": "Satgawan Plateau",
    "locationCoords": {
      "lat": 24.5124,
      "lng": 85.6288
    },
    "formattedAddress": "Satgawan Plateau, Markacho Block, Koderma District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Water Purification & Capacitive Deionization",
    "aiAnalysis": {
      "category": "Water Purification & Capacitive Deionization",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Acute groundwater salinity and heavy mineral hardness in dry rocky plateau habitations",
      "confidenceScore": 98,
      "priorityScore": 90,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Koderma region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Koderma. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mining Geology & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-038']
    ],
    "govtOfficerNote": "Inspected by DC Koderma office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Aditya Ranjan, DC Koderma",
    "govtValidatedAt": daysAgo(18),
    "assignedHEI": "Vinoba Bhave University (VBU)",
    "assignedDept": "Department of Geology & Mine Environment",
    "assignedProjectId": "DEMO-PRJ-038",
    "createdAt": daysAgo(28),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-039",
    "reportId": "NIV-2026-039",
    "title": "Severe iron oxide staining and sediment blockage in natural hillside seepage drinking water springs",
    "description": "Natural underground spring water used by 1400 Asur and Oraon tribal villagers has high dissolved ferrous iron (4.2 mg/L) that oxidizes into thick rust colored slime.",
    "district": "Gumla",
    "block": "Chainpur",
    "village": "Dare Seepage Hamlet",
    "locationCoords": {
      "lat": 23.0878,
      "lng": 84.5772
    },
    "formattedAddress": "Dare Seepage Hamlet, Chainpur Block, Gumla District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Water Filtration & Spring Rejuvenation",
    "aiAnalysis": {
      "category": "Water Filtration & Spring Rejuvenation",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Severe iron oxide staining and sediment blockage in natural hillside seepage drinking water springs",
      "confidenceScore": 99,
      "priorityScore": 91,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Gumla region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Gumla. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Geotechnical & Transportation Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 99,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-039']
    ],
    "govtOfficerNote": "Inspected by DC Gumla office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Sushant Gaurav, DC Gumla",
    "govtValidatedAt": daysAgo(19),
    "assignedHEI": "Usha Martin University (UMU, Ranchi)",
    "assignedDept": "Zonal Agricultural Research Station (Chotanagpur Plateau)",
    "assignedProjectId": "DEMO-PRJ-039",
    "createdAt": daysAgo(29),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-040",
    "reportId": "NIV-2026-040",
    "title": "High soil alkalinity and calcification preventing pulse crop germination in Kanhar river basin",
    "description": "Excess soil calcium carbonate and high pH (8.8) lock phosphorus and micronutrients, causing 40% stunted germination in pigeon pea and chickpea crops.",
    "district": "Garhwa",
    "block": "Bhawnathpur",
    "village": "Kharaundhi Pulse Plains",
    "locationCoords": {
      "lat": 24.2062,
      "lng": 83.8402
    },
    "formattedAddress": "Kharaundhi Pulse Plains, Bhawnathpur Block, Garhwa District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Soil Chemistry & Agro Conditioners",
    "aiAnalysis": {
      "category": "Soil Chemistry & Agro Conditioners",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "High soil alkalinity and calcification preventing pulse crop germination in Kanhar river basin",
      "confidenceScore": 95,
      "priorityScore": 92,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Garhwa region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Garhwa. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Water Resources & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 92,
    "confidenceScore": 95,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-040']
    ],
    "govtOfficerNote": "Inspected by DC Garhwa office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Shekhar Jamuar, DC Garhwa",
    "govtValidatedAt": daysAgo(20),
    "assignedHEI": "Nilamber Pitamber University (NPU, Palamu)",
    "assignedDept": "Faculty of Forestry, Kanke",
    "assignedProjectId": "DEMO-PRJ-040",
    "createdAt": daysAgo(30),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-041",
    "reportId": "NIV-2026-041",
    "title": "Excessive siltation and heavy sand clogging of micro lift irrigation canals from opencast mine earthworks",
    "description": "Unchecked monsoon surface wash off from coal mine dumps chokes 12km of lift irrigation canals with fine coal dust and silt, halting water delivery to 600 hectares.",
    "district": "Chatra",
    "block": "Simaria",
    "village": "Tandwa Lift Canal",
    "locationCoords": {
      "lat": 24.2542,
      "lng": 84.9072
    },
    "formattedAddress": "Tandwa Lift Canal, Simaria Block, Chatra District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Irrigation Engineering & Hydrocyclones",
    "aiAnalysis": {
      "category": "Irrigation Engineering & Hydrocyclones",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Excessive siltation and heavy sand clogging of micro lift irrigation canals from opencast mine earthworks",
      "confidenceScore": 96,
      "priorityScore": 93,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Chatra region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Chatra. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Mechanical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 93,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-041']
    ],
    "govtOfficerNote": "Inspected by DC Chatra office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Abu Imran, DC Chatra",
    "govtValidatedAt": daysAgo(21),
    "assignedHEI": "AISECT University (Hazaribagh)",
    "assignedDept": "Department of Civil Engineering (Heritage Structures)",
    "assignedProjectId": "DEMO-PRJ-041",
    "createdAt": daysAgo(31),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-042",
    "reportId": "NIV-2026-042",
    "title": "Spontaneous combustion and suffocating sulfur dioxide fumes in abandoned overburden dump yards",
    "description": "Sub surface coal seam oxidation in 40m high overburden dumps generates underground fires (70C) releasing pungent SO2 and CO gases near village settlements.",
    "district": "Ramgarh",
    "block": "Bhurkunda",
    "village": "Patratu Overburden Yard",
    "locationCoords": {
      "lat": 23.6765,
      "lng": 85.5534
    },
    "formattedAddress": "Patratu Overburden Yard, Bhurkunda Block, Ramgarh District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Mining Safety & Thermal InSAR",
    "aiAnalysis": {
      "category": "Mining Safety & Thermal InSAR",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Spontaneous combustion and suffocating sulfur dioxide fumes in abandoned overburden dump yards",
      "confidenceScore": 97,
      "priorityScore": 94,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Ramgarh region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Ramgarh. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Chemical & Environmental Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 94,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-042']
    ],
    "govtOfficerNote": "Inspected by DC Ramgarh office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Chandan Kumar, DC Ramgarh",
    "govtValidatedAt": daysAgo(22),
    "assignedHEI": "Jharkhand Raksha Shakti University (JRSU, Ranchi)",
    "assignedDept": "Department of Mechanical Engineering (Robotics Lab)",
    "assignedProjectId": "DEMO-PRJ-042",
    "createdAt": daysAgo(32),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-043",
    "reportId": "NIV-2026-043",
    "title": "Rapid rotting and fungal mold spoilage in harvested Mahua flowers during humid monsoon transition",
    "description": "Tribal women collect 200 tonnes of Mahua flowers annually, but humidity causes 40% loss to Aspergillus and Penicillium mold during sun drying.",
    "district": "Simdega",
    "block": "Thethaitangar",
    "village": "Kurdeg Mahua Groves",
    "locationCoords": {
      "lat": 22.6612,
      "lng": 84.5424
    },
    "formattedAddress": "Kurdeg Mahua Groves, Thethaitangar Block, Simdega District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Agro Forestry Post Harvest Tech",
    "aiAnalysis": {
      "category": "Agro Forestry Post Harvest Tech",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Rapid rotting and fungal mold spoilage in harvested Mahua flowers during humid monsoon transition",
      "confidenceScore": 98,
      "priorityScore": 95,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Simdega region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Simdega. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Structural Engineering & Rural Infrastructure",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 95,
    "confidenceScore": 98,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-043']
    ],
    "govtOfficerNote": "Inspected by DC Simdega office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ajay Kumar Singh, DC Simdega",
    "govtValidatedAt": daysAgo(23),
    "assignedHEI": "Pragyan International University (PIU, Ranchi)",
    "assignedDept": "Department of Agro-Forestry & Entomology",
    "assignedProjectId": "DEMO-PRJ-043",
    "createdAt": daysAgo(33),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-044",
    "reportId": "NIV-2026-044",
    "title": "Acidic red soil phosphorus fixation reducing maize and mustard crop yields in Asur plateau villages",
    "description": "High soil aluminum and iron oxides bind 80% of applied phosphate fertilizer, rendering it insoluble and resulting in poor crop root development.",
    "district": "Lohardaga",
    "block": "Senha",
    "village": "Kisko Plateau Uplands",
    "locationCoords": {
      "lat": 23.4804,
      "lng": 84.7162
    },
    "formattedAddress": "Kisko Plateau Uplands, Senha Block, Lohardaga District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Soil Microbiology & Biofertilizers",
    "aiAnalysis": {
      "category": "Soil Microbiology & Biofertilizers",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Acidic red soil phosphorus fixation reducing maize and mustard crop yields in Asur plateau villages",
      "confidenceScore": 99,
      "priorityScore": 96,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Lohardaga region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Lohardaga. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil Science & Agronomy",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 96,
    "confidenceScore": 99,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-044']
    ],
    "govtOfficerNote": "Inspected by DC Lohardaga office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Dr. Waghmare Prasad Krishna, DC Lohardaga",
    "govtValidatedAt": daysAgo(24),
    "assignedHEI": "Ranchi University",
    "assignedDept": "Department of Environmental Science & Tribal Resource Center",
    "assignedProjectId": "DEMO-PRJ-044",
    "createdAt": daysAgo(34),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-CH-045",
    "reportId": "NIV-2026-045",
    "title": "Unregulated stone quarry blasting dust suppressing Mulberry leaf yield and destroying Tussar silkworm farming",
    "description": "Quarry blasting dust coats Arjun and Asan host tree leaves, causing bacterial flacherie disease and 50% cocoon yield drop for 1800 tribal sericulturists.",
    "district": "Dumka",
    "block": "Kathikund",
    "village": "Gopi Kandar Silk Tract",
    "locationCoords": {
      "lat": 24.3126,
      "lng": 87.2836
    },
    "formattedAddress": "Gopi Kandar Silk Tract, Kathikund Block, Dumka District, Jharkhand",
    "status": "In Progress",
    "stageNumber": 8,
    "stageName": "Stage 8: Team Formation & Project Initiation",
    "category": "Agro Silk & Dust Filtration",
    "aiAnalysis": {
      "category": "Agro Silk & Dust Filtration",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Unregulated stone quarry blasting dust suppressing Mulberry leaf yield and destroying Tussar silkworm farming",
      "confidenceScore": 95,
      "priorityScore": 88,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Dumka region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Dumka. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Environmental Science & Water Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 88,
    "confidenceScore": 95,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-045']
    ],
    "govtOfficerNote": "Inspected by DC Dumka office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Ameet Kumar, DC Dumka",
    "govtValidatedAt": daysAgo(10),
    "assignedHEI": "Sido Kanhu Murmu University (SKMU)",
    "assignedDept": "Department of Health Sciences & Community Welfare",
    "assignedProjectId": "DEMO-PRJ-045",
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-CH-046",
    "reportId": "NIV-2026-046",
    "title": "High groundwater boron levels affecting wheat crop germination and drinking water quality",
    "description": "Geogenic boron levels in deep tube wells exceed 2.4 mg/L in Boarijor basin, causing leaf tip chlorosis in wheat crops and gastrointestinal irritation.",
    "district": "Godda",
    "block": "Mehrma",
    "village": "Boarijor Basin",
    "locationCoords": {
      "lat": 24.8772,
      "lng": 87.2494
    },
    "formattedAddress": "Boarijor Basin, Mehrma Block, Godda District, Jharkhand",
    "status": "Government Validated",
    "stageNumber": 3,
    "stageName": "Stage 3: DC Triage & Problem Statement Validated",
    "category": "Water Purification & Ion Exchange",
    "aiAnalysis": {
      "category": "Water Purification & Ion Exchange",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "High groundwater boron levels affecting wheat crop germination and drinking water quality",
      "confidenceScore": 96,
      "priorityScore": 89,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Godda region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Godda. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Horticulture & Environmental Science",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 89,
    "confidenceScore": 96,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-046']
    ],
    "govtOfficerNote": "Inspected by DC Godda office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Zeeshan Qamar, DC Godda",
    "govtValidatedAt": daysAgo(11),
    "assignedHEI": "IIT (ISM) Dhanbad",
    "assignedDept": "Department of Mining Engineering (Rock Mechanics)",
    "assignedProjectId": "DEMO-PRJ-046",
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-CH-047",
    "reportId": "NIV-2026-047",
    "title": "Groundwater fluoride and heavy iron precipitate poisoning deep tube wells in tribal hamlets",
    "description": "Over 34 remote tribal handpumps deliver reddish water with 3.8 mg/L iron and 2.9 mg/L fluoride, staining teeth and causing chronic stomach ailments.",
    "district": "Pakur",
    "block": "Maheshpur",
    "village": "Pakuria Tribal Belt",
    "locationCoords": {
      "lat": 24.6795,
      "lng": 87.8806
    },
    "formattedAddress": "Pakuria Tribal Belt, Maheshpur Block, Pakur District, Jharkhand",
    "status": "Clustered",
    "stageNumber": 4,
    "stageName": "Stage 4: Call for Student & University Proposals Opened",
    "category": "Water Quality & Contamination",
    "aiAnalysis": {
      "category": "Water Quality & Contamination",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Groundwater fluoride and heavy iron precipitate poisoning deep tube wells in tribal hamlets",
      "confidenceScore": 97,
      "priorityScore": 90,
      "riskLevel": "HIGH",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Pakur region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Pakur. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Occupational Health & Mining Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 90,
    "confidenceScore": 97,
    "riskLevel": "HIGH",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-047']
    ],
    "govtOfficerNote": "Inspected by DC Pakur office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Mrityunjay Kumar Baranwal, DC Pakur",
    "govtValidatedAt": daysAgo(12),
    "assignedHEI": "Sido Kanhu Murmu University (SKMU)",
    "assignedDept": "Water Quality Innovation Hub",
    "assignedProjectId": "DEMO-PRJ-047",
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-CH-048",
    "reportId": "NIV-2026-048",
    "title": "Heavy soil lateritization and low water retention stunting cashew and fruit sapling survival in dry tracts",
    "description": "Hard compact lateritic crusts cause 65% summer mortality in newly planted fruit orchards and cashew saplings across 180 hectares in Narayanpur.",
    "district": "Jamtara",
    "block": "Narayanpur",
    "village": "Karmatar Arid Groves",
    "locationCoords": {
      "lat": 24.0034,
      "lng": 87.0292
    },
    "formattedAddress": "Karmatar Arid Groves, Narayanpur Block, Jamtara District, Jharkhand",
    "status": "HEI Matched",
    "stageNumber": 5,
    "stageName": "Stage 5: University Bidding & Preliminary EOI Matched",
    "category": "Arid Agronomy & Hydrogels",
    "aiAnalysis": {
      "category": "Arid Agronomy & Hydrogels",
      "categoryCode": "GOV-CIVIC",
      "matchedProblem": "Heavy soil lateritization and low water retention stunting cashew and fruit sapling survival in dry tracts",
      "confidenceScore": 98,
      "priorityScore": 91,
      "riskLevel": "CRITICAL",
      "factors": {
        "populationImpact": {
          "score": 23,
          "max": 25,
          "reason": "Over 2500+ citizens and families affected in Jamtara region."
        },
        "economicLifeSaving": {
          "score": 24,
          "max": 25,
          "reason": "High community safety and regional livelihood impact."
        },
        "resolutionCostFeasibility": {
          "score": 22,
          "max": 25,
          "reason": "Technically viable and cost effective prototype engineering."
        },
        "hazardUrgency": {
          "score": 23,
          "max": 25,
          "reason": "Immediate field containment and monitoring required."
        }
      },
      "reasoning": "Critical challenge in Jamtara. Verified through citizen telemetry and government administration.",
      "needsHumanVerification": false,
      "recommendedUniversityDepts": [
        "Soil Science & Agricultural Engineering",
        "Environmental Science",
        "Civil Engineering"
      ]
    },
    "priorityScore": 91,
    "confidenceScore": 98,
    "riskLevel": "CRITICAL",
    "evidenceUrls": [
      DISTRICT_PROBLEM_IMAGES['DEMO-CH-048']
    ],
    "govtOfficerNote": "Inspected by DC Jamtara office and verified for HEI engineering deployment.",
    "govtValidatedBy": "Shri Faiz Aq Ahmed Mumtaz, DC Jamtara",
    "govtValidatedAt": daysAgo(13),
    "assignedHEI": "BIT Sindri (Dhanbad)",
    "assignedDept": "Department of Chemical & Materials Engineering",
    "assignedProjectId": "DEMO-PRJ-048",
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(1)
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    "id": "DEMO-PRJ-001",
    "challengeId": "DEMO-CH-001",
    "challengeTitle": "Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits",
    "category": "Mining & Coalfire Disaster",
    "district": "Dhanbad",
    "universityId": "UNI-IIT-ISM-DHANBAD",
    "universityName": "IIT (ISM) Dhanbad",
    "facultyMentorName": "Prof. Mentoring Cell (IIT (ISM) Dhanbad)",
    "facultyEmail": "mentor.dhn@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-001A",
        "name": "Priya Sharma",
        "departmentName": "Mining & Geotechnical Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-001B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-001A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-001B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-001C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 650000,
    "budgetApproved": 650000,
    "createdAt": daysAgo(16),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-002",
    "challengeId": "DEMO-CH-002",
    "challengeTitle": "Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps",
    "category": "Water Quality & Contamination",
    "district": "Giridih",
    "universityId": "UNI-BBMKU-DHANBAD",
    "universityName": "BBMKU & BIT Sindri",
    "facultyMentorName": "Prof. Mentoring Cell (IIT (ISM) Dhanbad & BIT Sindri)",
    "facultyEmail": "mentor.grd@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-002A",
        "name": "Deepak Sahu",
        "departmentName": "Environmental Science & Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-002B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Prototype Active",
    "milestones": [
      {
        "id": "MS-002A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-002B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-002C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 520000,
    "budgetApproved": 520000,
    "createdAt": daysAgo(17),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-003",
    "challengeId": "DEMO-CH-003",
    "challengeTitle": "North Koel rain shadow drought and deep aquifer drawdown below 42 metres",
    "category": "Drought & Aquifer Depletion",
    "district": "Palamu",
    "universityId": "UNI-BAU-RANCHI",
    "universityName": "Birsa Agricultural University (BAU)",
    "facultyMentorName": "Prof. Mentoring Cell (Birsa Agricultural University (BAU))",
    "facultyEmail": "mentor.plm@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-003A",
        "name": "Amit Murmu",
        "departmentName": "Soil & Water Conservation Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-003B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-003A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-003B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-003C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 480000,
    "budgetApproved": 480000,
    "createdAt": daysAgo(18),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-004",
    "challengeId": "DEMO-CH-004",
    "challengeTitle": "Subarnarekha and Kharkai river confluence backwater flood surge in Bagbera settlement",
    "category": "Flooding & Drainage",
    "district": "East Singhbhum",
    "universityId": "UNI-NIT-JAMSHEDPUR",
    "universityName": "NIT Jamshedpur",
    "facultyMentorName": "Prof. Mentoring Cell (NIT Jamshedpur)",
    "facultyEmail": "mentor.esb@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-004A",
        "name": "Rajat Verma",
        "departmentName": "Civil & IoT Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-004B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-004A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-004B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-004C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 580000,
    "budgetApproved": 580000,
    "createdAt": daysAgo(19),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-005",
    "challengeId": "DEMO-CH-005",
    "challengeTitle": "Iron ore tailings slurry and hematite red mud runoff polluting Karo river at Gua",
    "category": "Industrial Mining Effluent & River Contamination",
    "district": "West Singhbhum",
    "universityId": "UNI-SRINATH-ADITYAPUR",
    "universityName": "Srinath University & Kolhan University",
    "facultyMentorName": "Prof. Mentoring Cell (Kolhan University & NIT Jamshedpur)",
    "facultyEmail": "mentor.wsb@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-005A",
        "name": "Sanjay Birua",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-005B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Prototype Active",
    "milestones": [
      {
        "id": "MS-005A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-005B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-005C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 620000,
    "budgetApproved": 620000,
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-006",
    "challengeId": "DEMO-CH-006",
    "challengeTitle": "Elephant migration corridor nocturnal crop raiding and human elephant conflict at Betla buffer",
    "category": "Wildlife Conservation & Conflict",
    "district": "Latehar",
    "universityId": "UNI-SBU-RANCHI",
    "universityName": "Sarala Birla University (SBU) & BAU Ranchi",
    "facultyMentorName": "Prof. Mentoring Cell (BIT Mesra & BAU Ranchi)",
    "facultyEmail": "mentor.lth@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-006A",
        "name": "Aniket Tirkey",
        "departmentName": "Electronics & Forestry Management",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-006B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-006A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-006B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-006C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 510000,
    "budgetApproved": 510000,
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-007",
    "challengeId": "DEMO-CH-007",
    "challengeTitle": "Severe Ganga riverbank scouring and seasonal road washaway isolating 14 Diara island villages",
    "category": "Flooding & Riverbank Scour",
    "district": "Sahibganj",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "Sido Kanhu Murmu University (SKMU)",
    "facultyMentorName": "Prof. Mentoring Cell (SKMU Dumka & IIT (ISM) Dhanbad)",
    "facultyEmail": "mentor.sbg@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-007A",
        "name": "Tariq Anwar",
        "departmentName": "Civil & Water Resources Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-007B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-007A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-007B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-007C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 640000,
    "budgetApproved": 640000,
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-008",
    "challengeId": "DEMO-CH-008",
    "challengeTitle": "Monsoon stormwater accumulation submerging Government High School road in Hutup",
    "category": "Flooding & Drainage",
    "district": "Ranchi",
    "universityId": "UNI-DSPMU-RANCHI",
    "universityName": "DSPMU Ranchi & Ranchi University",
    "facultyMentorName": "Prof. Mentoring Cell (BIT Mesra & Ranchi University)",
    "facultyEmail": "mentor.rnc@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-008A",
        "name": "Manish Pandey",
        "departmentName": "Civil Engineering & Embedded Systems",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-008B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-008A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-008B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-008C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 450000,
    "budgetApproved": 450000,
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-009",
    "challengeId": "DEMO-CH-009",
    "challengeTitle": "Fly ash slurry pipeline breach discharging into Konar river intake zone at Phusro",
    "category": "Industrial Power Plant Fly Ash Spill",
    "district": "Bokaro",
    "universityId": "UNI-NUSRL-RANCHI",
    "universityName": "NUSRL Ranchi & BIT Mesra",
    "facultyMentorName": "Prof. Mentoring Cell (IIT (ISM) Dhanbad & BIT Mesra)",
    "facultyEmail": "mentor.bkr@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-009A",
        "name": "Vikas Kumar",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-009B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-009A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-009B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-009C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 570000,
    "budgetApproved": 570000,
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-010",
    "challengeId": "DEMO-CH-010",
    "challengeTitle": "Untreated electroplating heavy metal and acid bath discharge into Kharkai river tributary",
    "category": "Industrial Chemical Water Pollution",
    "district": "Saraikela Kharsawan",
    "universityId": "UNI-ARKA-JAMSHEDPUR",
    "universityName": "Arka Jain University & NIT Jamshedpur",
    "facultyMentorName": "Prof. Mentoring Cell (NIT Jamshedpur)",
    "facultyEmail": "mentor.srk@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-010A",
        "name": "Rohit Mahato",
        "departmentName": "Metallurgy & Chemical Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-010B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Prototype Active",
    "milestones": [
      {
        "id": "MS-010A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-010B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-010C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 540000,
    "budgetApproved": 540000,
    "createdAt": daysAgo(15),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-011",
    "challengeId": "DEMO-CH-011",
    "challengeTitle": "Fungal shoot blight and Eublemma moth infestation destroying tribal Kusum tree lac yields",
    "category": "Agro Forestry & Tribal Livelihood Disease",
    "district": "Khunti",
    "universityId": "UNI-YBN-RANCHI",
    "universityName": "YBN University (Ranchi) & BAU Ranchi",
    "facultyMentorName": "Prof. Mentoring Cell (Birsa Agricultural University (BAU))",
    "facultyEmail": "mentor.kht@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-011A",
        "name": "Sushil Munda",
        "departmentName": "Forestry & Biotechnology",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-011B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-011A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-011B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-011C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 380000,
    "budgetApproved": 380000,
    "createdAt": daysAgo(16),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-012",
    "challengeId": "DEMO-CH-012",
    "challengeTitle": "Fecal coliform and microbial contamination in 32 community handpumps along pilgrim route",
    "category": "Public Health & Water Contamination",
    "district": "Deoghar",
    "universityId": "UNI-BIT-MESRA",
    "universityName": "BIT Mesra & AIIMS Deoghar",
    "facultyMentorName": "Prof. Mentoring Cell (AIIMS Deoghar & BIT Mesra)",
    "facultyEmail": "mentor.dgh@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-012A",
        "name": "Pooja Jha",
        "departmentName": "Public Health & Biotechnology",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-012B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-012A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-012B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-012C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 420000,
    "budgetApproved": 420000,
    "createdAt": daysAgo(17),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-013",
    "challengeId": "DEMO-CH-013",
    "challengeTitle": "Barakar river bridge Pier 3 foundation scouring and concrete spalling risk on NH connector",
    "category": "Bridge Infrastructure & Transport Safety",
    "district": "Hazaribagh",
    "universityId": "UNI-VBU-HAZARIBAGH",
    "universityName": "Vinoba Bhave University & NIT Jamshedpur",
    "facultyMentorName": "Prof. Mentoring Cell (Vinoba Bhave University & NIT Jamshedpur)",
    "facultyEmail": "mentor.hzb@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-013A",
        "name": "Alok Ranjan",
        "departmentName": "Civil Engineering & Structural Dynamics",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-013B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-013A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-013B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-013C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 610000,
    "budgetApproved": 610000,
    "createdAt": daysAgo(18),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-014",
    "challengeId": "DEMO-CH-014",
    "challengeTitle": "Abandoned open pit mica mine quarry slope collapse and unfenced deep water pit hazard",
    "category": "Mining & Coalfire Disaster",
    "district": "Koderma",
    "universityId": "UNI-RGU-RAMGARH",
    "universityName": "Radha Govind University & VBU",
    "facultyMentorName": "Prof. Mentoring Cell (BIT Sindri & Vinoba Bhave University)",
    "facultyEmail": "mentor.kdm@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-014A",
        "name": "Nikhil Barnwal",
        "departmentName": "Mining Geology & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-014B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-014A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-014B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-014C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 480000,
    "budgetApproved": 480000,
    "createdAt": daysAgo(19),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-015",
    "challengeId": "DEMO-CH-015",
    "challengeTitle": "Heavy bauxite haulage truck axle loads causing road subsidence and shoulder collapse on Bishunpur ghat",
    "category": "Bridge Infrastructure & Transport Safety",
    "district": "Gumla",
    "universityId": "UNI-CUJ-RANCHI",
    "universityName": "Central University of Jharkhand (CUJ)",
    "facultyMentorName": "Prof. Mentoring Cell (Ranchi University & BIT Mesra)",
    "facultyEmail": "mentor.gml@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-015A",
        "name": "Aman Linda",
        "departmentName": "Geotechnical & Transportation Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-015B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Prototype Active",
    "milestones": [
      {
        "id": "MS-015A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-015B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-015C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 590000,
    "budgetApproved": 590000,
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-016",
    "challengeId": "DEMO-CH-016",
    "challengeTitle": "Severe fluoride contamination in deep borewells causing endemic dental and skeletal fluorosis",
    "category": "Water Quality & Contamination",
    "district": "Garhwa",
    "universityId": "UNI-IIM-RANCHI",
    "universityName": "IIM Ranchi & BAU Ranchi",
    "facultyMentorName": "Prof. Mentoring Cell (IIT (ISM) Dhanbad & BAU Ranchi)",
    "facultyEmail": "mentor.grh@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-016A",
        "name": "Pankaj Kumar",
        "departmentName": "Water Resources & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-016B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-016A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-016B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-016C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 560000,
    "budgetApproved": 560000,
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-017",
    "challengeId": "DEMO-CH-017",
    "challengeTitle": "Opencast coal mining PM2.5 and PM10 dust fallout smothering standing tomato and maize crops",
    "category": "Air Quality & Agricultural Dust Pollution",
    "district": "Chatra",
    "universityId": "UNI-JRU-RANCHI",
    "universityName": "Jharkhand Rai University (JRU)",
    "facultyMentorName": "Prof. Mentoring Cell (Vinoba Bhave University & BIT Mesra)",
    "facultyEmail": "mentor.ctr@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-017A",
        "name": "Rajesh Dangi",
        "departmentName": "Mechanical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-017B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-017A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-017B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-017C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 520000,
    "budgetApproved": 520000,
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-018",
    "challengeId": "DEMO-CH-018",
    "challengeTitle": "Damodar river black sludge sedimentation and coal washery effluent overflow near Rajrappa",
    "category": "Industrial Mining Effluent & River Contamination",
    "district": "Ramgarh",
    "universityId": "UNI-ICFAI-RANCHI",
    "universityName": "ICFAI University Jharkhand",
    "facultyMentorName": "Prof. Mentoring Cell (BIT Mesra & IIT (ISM) Dhanbad)",
    "facultyEmail": "mentor.rmg@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-018A",
        "name": "Sumit Ganguly",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-018B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-018A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-018B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-018C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 610000,
    "budgetApproved": 610000,
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-019",
    "challengeId": "DEMO-CH-019",
    "challengeTitle": "Seasonal flash flood washouts of low level causeway isolating 8 tribal villages in Kolebira",
    "category": "Bridge Infrastructure & Transport Safety",
    "district": "Simdega",
    "universityId": "UNI-XLRI-JAMSHEDPUR",
    "universityName": "XLRI Jamshedpur & NIT Jamshedpur",
    "facultyMentorName": "Prof. Mentoring Cell (NIT Jamshedpur & BAU Ranchi)",
    "facultyEmail": "mentor.smd@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-019A",
        "name": "Gourav Kispotta",
        "departmentName": "Structural Engineering & Rural Infrastructure",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-019B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-019A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-019B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-019C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 630000,
    "budgetApproved": 630000,
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-020",
    "challengeId": "DEMO-CH-020",
    "challengeTitle": "Bauxite mine surface red mud runoff burying terraced paddy fields of Asur tribal farmers",
    "category": "Environmental Siltation & Agro Degradation",
    "district": "Lohardaga",
    "universityId": "UNI-NPU-PALAMU",
    "universityName": "Nilamber Pitamber University (NPU)",
    "facultyMentorName": "Prof. Mentoring Cell (Birsa Agricultural University (BAU))",
    "facultyEmail": "mentor.lhd@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-020A",
        "name": "Santosh Asur",
        "departmentName": "Soil Science & Agronomy",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-020B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Prototype Active",
    "milestones": [
      {
        "id": "MS-020A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-020B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-020C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 490000,
    "budgetApproved": 490000,
    "createdAt": daysAgo(15),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-021",
    "challengeId": "DEMO-CH-021",
    "challengeTitle": "Unfiltered Mayurakshi river basin water supply contaminated with high microbial pathogens and arsenic",
    "category": "Water Quality & Contamination",
    "district": "Dumka",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "Sido Kanhu Murmu University (SKMU)",
    "facultyMentorName": "Prof. Mentoring Cell (Sido Kanhu Murmu University (SKMU))",
    "facultyEmail": "mentor.dmk@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-021A",
        "name": "Chandan Marandi",
        "departmentName": "Environmental Science & Water Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-021B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-021A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-021B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-021C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 510000,
    "budgetApproved": 510000,
    "createdAt": daysAgo(16),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-022",
    "challengeId": "DEMO-CH-022",
    "challengeTitle": "Coal thermal plant suspended particulate matter (SPM) fallout damaging betel vine and mango orchards",
    "category": "Thermal Power Industrial Pollution",
    "district": "Godda",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "SKMU Dumka & BAU Ranchi",
    "facultyMentorName": "Prof. Mentoring Cell (SKMU Dumka & BAU Ranchi)",
    "facultyEmail": "mentor.gdd@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-022A",
        "name": "Mukesh Poddar",
        "departmentName": "Horticulture & Environmental Science",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-022B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-022A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-022B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-022C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 480000,
    "budgetApproved": 480000,
    "createdAt": daysAgo(17),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-023",
    "challengeId": "DEMO-CH-023",
    "challengeTitle": "Stone crushing silica dust emission causing acute silicosis risk among tribal workers",
    "category": "Mining & Coalfire Disaster",
    "district": "Pakur",
    "universityId": "UNI-CAPITAL-KODERMA",
    "universityName": "Capital University & SKMU Dumka",
    "facultyMentorName": "Prof. Mentoring Cell (IIT (ISM) Dhanbad & SKMU Dumka)",
    "facultyEmail": "mentor.pkr@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-023A",
        "name": "Devendra Paharia",
        "departmentName": "Occupational Health & Mining Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-023B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-023A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-023B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-023C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 570000,
    "budgetApproved": 570000,
    "createdAt": daysAgo(18),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-024",
    "challengeId": "DEMO-CH-024",
    "challengeTitle": "Ajay river seasonal sand deposition suffocating fertile paddy alluvial topsoil",
    "category": "Flooding & Drainage",
    "district": "Jamtara",
    "universityId": "UNI-CUJ-RANCHI",
    "universityName": "Central University of Jharkhand (CUJ)",
    "facultyMentorName": "Prof. Mentoring Cell (Birsa Agricultural University (BAU))",
    "facultyEmail": "mentor.jmt@university.ac.in",
    "teamMembers": [
      {
        "id": "TM-024A",
        "name": "Debashis Mondal",
        "departmentName": "Soil Science & Agricultural Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-024B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-024A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-024B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-024C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 430000,
    "budgetApproved": 430000,
    "createdAt": daysAgo(19),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-025",
    "challengeId": "DEMO-CH-025",
    "challengeTitle": "Heavy coal transport track vibration causing structural cracks in nearby schools and masonry",
    "category": "Mining & Coalfire Disaster",
    "district": "Dhanbad",
    "universityId": "UNI-BBMKU-DHANBAD",
    "universityName": "BBMKU Dhanbad",
    "facultyMentorName": "Dr. P. K. Singh (BIT Sindri (Dhanbad))",
    "facultyEmail": "pksingh.civil@bitsindri.ac.in",
    "teamMembers": [
      {
        "id": "TM-025A",
        "name": "Aditya Raj",
        "departmentName": "Mining & Geotechnical Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-025B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-025A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-025B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-025C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 540000,
    "budgetApproved": 540000,
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-026",
    "challengeId": "DEMO-CH-026",
    "challengeTitle": "High seasonal solar pump failure and inverter degradation due to extreme mica and quartz dust deposition",
    "category": "Renewable Energy & Power",
    "district": "Giridih",
    "universityId": "UNI-NIFFT-RANCHI",
    "universityName": "NIFFT Ranchi & IIT ISM",
    "facultyMentorName": "Prof. K. Mukherjee (IIT (ISM) Dhanbad)",
    "facultyEmail": "kmukherjee.ee@iitism.ac.in",
    "teamMembers": [
      {
        "id": "TM-026A",
        "name": "Kavita Singh",
        "departmentName": "Environmental Science & Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-026B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-026A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-026B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-026C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 480000,
    "budgetApproved": 480000,
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-027",
    "challengeId": "DEMO-CH-027",
    "challengeTitle": "Severe summer thermal stress and mortality in indigenous black Bengal goat rearing herds",
    "category": "Drought & Livestock Livelihoods",
    "district": "Palamu",
    "universityId": "UNI-NPU-PALAMU",
    "universityName": "Nilamber Pitamber University (NPU)",
    "facultyMentorName": "Dr. Sushil Prasad (Birsa Agricultural University (BAU))",
    "facultyEmail": "sprasad.vet@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-027A",
        "name": "Shweta Kumari",
        "departmentName": "Soil & Water Conservation Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-027B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-027A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-027B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-027C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 420000,
    "budgetApproved": 420000,
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-028",
    "challengeId": "DEMO-CH-028",
    "challengeTitle": "Chromium and copper heavy metal bioaccumulation in vegetable farm soils along Kharkai river discharge channels",
    "category": "Industrial Pollution & Soil Remediation",
    "district": "East Singhbhum",
    "universityId": "UNI-NIT-JAMSHEDPUR",
    "universityName": "NIT Jamshedpur",
    "facultyMentorName": "Dr. R. K. Soren (NIT Jamshedpur)",
    "facultyEmail": "rksoren.meta@nitjsr.ac.in",
    "teamMembers": [
      {
        "id": "TM-028A",
        "name": "Neha Roy",
        "departmentName": "Civil & IoT Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-028B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-028A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-028B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-028C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 510000,
    "budgetApproved": 510000,
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-029",
    "challengeId": "DEMO-CH-029",
    "challengeTitle": "Acid mine drainage and manganese leaching into tribal forest drinking wells",
    "category": "Water Quality & Contamination",
    "district": "West Singhbhum",
    "universityId": "UNI-KOLHAN-CHAIBASA",
    "universityName": "Kolhan University, Chaibasa",
    "facultyMentorName": "Dr. B. N. Tudu (Kolhan University, Chaibasa)",
    "facultyEmail": "bntudu.geol@kolhanuniversity.ac.in",
    "teamMembers": [
      {
        "id": "TM-029A",
        "name": "Anjali Soren",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-029B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-029A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-029B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-029C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 530000,
    "budgetApproved": 530000,
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-030",
    "challengeId": "DEMO-CH-030",
    "challengeTitle": "Frequent monsoon flash flood logjams and wooden culvert collapse cutting off Mahuadanr valley",
    "category": "Bridge Infrastructure & Transport Safety",
    "district": "Latehar",
    "universityId": "UNI-BIT-MESRA",
    "universityName": "BIT Mesra, Ranchi",
    "facultyMentorName": "Dr. Arun Kumar (BIT Mesra, Ranchi)",
    "facultyEmail": "arunkumar.civil@bitmesra.ac.in",
    "teamMembers": [
      {
        "id": "TM-030A",
        "name": "Pooja Oraon",
        "departmentName": "Electronics & Forestry Management",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-030B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-030A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-030B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-030C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 560000,
    "budgetApproved": 560000,
    "createdAt": daysAgo(15),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-031",
    "challengeId": "DEMO-CH-031",
    "challengeTitle": "River siltation and sudden shoreline recession disrupting inland vessel loading and fishing jetties",
    "category": "Waterways & Sedimentation Control",
    "district": "Sahibganj",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "Sido Kanhu Murmu University (SKMU)",
    "facultyMentorName": "Dr. Hemant Murmu (Sido Kanhu Murmu University (SKMU))",
    "facultyEmail": "hmurmu.river@skmu.ac.in",
    "teamMembers": [
      {
        "id": "TM-031A",
        "name": "Manoj Mandal",
        "departmentName": "Civil & Water Resources Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-031B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-031A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-031B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-031C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 590000,
    "budgetApproved": 590000,
    "createdAt": daysAgo(16),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-032",
    "challengeId": "DEMO-CH-032",
    "challengeTitle": "Cold storage decay and high post harvest loss in peri urban tomato and green chili crops",
    "category": "Agri Cold Chain & Renewable Storage",
    "district": "Ranchi",
    "universityId": "UNI-BAU-RANCHI",
    "universityName": "Birsa Agricultural University (BAU)",
    "facultyMentorName": "Dr. D. K. Singh (Birsa Agricultural University (BAU))",
    "facultyEmail": "dksingh.agriengg@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-032A",
        "name": "Sunil Toppo",
        "departmentName": "Civil Engineering & Embedded Systems",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-032B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-032A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-032B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-032C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 490000,
    "budgetApproved": 490000,
    "createdAt": daysAgo(17),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-033",
    "challengeId": "DEMO-CH-033",
    "challengeTitle": "Toxic phenolic wastewater and cyanide traces in industrial storm drains near steel processing belt",
    "category": "Industrial Effluent & Chemical Remediation",
    "district": "Bokaro",
    "universityId": "UNI-BBMKU-DHANBAD",
    "universityName": "BIT Sindri (Dhanbad)",
    "facultyMentorName": "Dr. S. P. Choudhary (BIT Sindri (Dhanbad))",
    "facultyEmail": "spchoudhary.chem@bitsindri.ac.in",
    "teamMembers": [
      {
        "id": "TM-033A",
        "name": "Deepa Mishra",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-033B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-033A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-033B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-033C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 530000,
    "budgetApproved": 530000,
    "createdAt": daysAgo(18),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-034",
    "challengeId": "DEMO-CH-034",
    "challengeTitle": "High volatile organic compound (VOC) emissions and toxic paint sludge fumes in auto ancillary zones",
    "category": "Air Quality & VOC Control",
    "district": "Saraikela Kharsawan",
    "universityId": "UNI-NSU-JAMSHEDPUR",
    "universityName": "Netaji Subhas University & NIT Jamshedpur",
    "facultyMentorName": "Dr. Ashok Kumar (NIT Jamshedpur)",
    "facultyEmail": "ashok.chem@nitjsr.ac.in",
    "teamMembers": [
      {
        "id": "TM-034A",
        "name": "Prakash Sahu",
        "departmentName": "Metallurgy & Chemical Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-034B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-034A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-034B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-034C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 490000,
    "budgetApproved": 490000,
    "createdAt": daysAgo(19),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-035",
    "challengeId": "DEMO-CH-035",
    "challengeTitle": "Severe stem borer pest infestation damaging Dragon Fruit and Papaya horticulture plantations",
    "category": "Agri Biotechnology & Pest Control",
    "district": "Khunti",
    "universityId": "UNI-BAU-RANCHI",
    "universityName": "Birsa Agricultural University (BAU)",
    "facultyMentorName": "Dr. R. B. Sah (Birsa Agricultural University (BAU))",
    "facultyEmail": "rbsah.ento@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-035A",
        "name": "Kiran Gope",
        "departmentName": "Forestry & Biotechnology",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-035B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-035A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-035B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-035C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 410000,
    "budgetApproved": 410000,
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-036",
    "challengeId": "DEMO-CH-036",
    "challengeTitle": "Enormous biodegradable floral and leaf waste accumulation decaying near religious heritage grounds",
    "category": "Solid Waste & Biomethanation",
    "district": "Deoghar",
    "universityId": "UNI-AMITY-RANCHI",
    "universityName": "Amity University Jharkhand",
    "facultyMentorName": "Dr. Santosh Kumar (BIT Mesra (Deoghar Campus))",
    "facultyEmail": "skumar.deoghar@bitmesra.ac.in",
    "teamMembers": [
      {
        "id": "TM-036A",
        "name": "Ravi Ranjan",
        "departmentName": "Public Health & Biotechnology",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-036B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-036A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-036B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-036C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 460000,
    "budgetApproved": 460000,
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-037",
    "challengeId": "DEMO-CH-037",
    "challengeTitle": "Rapid soil erosion and gullying on agricultural slopes caused by deforestation and heavy monsoon runoff",
    "category": "Soil Conservation & Geosynthetics",
    "district": "Hazaribagh",
    "universityId": "UNI-AISECT-HAZARIBAGH",
    "universityName": "AISECT University (Hazaribagh)",
    "facultyMentorName": "Dr. Meenakshi Sinha (Vinoba Bhave University (VBU))",
    "facultyEmail": "msinha.wildlife@vbu.ac.in",
    "teamMembers": [
      {
        "id": "TM-037A",
        "name": "Meenakshi Roy",
        "departmentName": "Civil Engineering & Structural Dynamics",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-037B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-037A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-037B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-037C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 440000,
    "budgetApproved": 440000,
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-038",
    "challengeId": "DEMO-CH-038",
    "challengeTitle": "Acute groundwater salinity and heavy mineral hardness in dry rocky plateau habitations",
    "category": "Water Purification & Capacitive Deionization",
    "district": "Koderma",
    "universityId": "UNI-VBU-HAZARIBAGH",
    "universityName": "Vinoba Bhave University (VBU)",
    "facultyMentorName": "Dr. Rajesh Kumar (Vinoba Bhave University (VBU))",
    "facultyEmail": "rkumar.geol@vbu.ac.in",
    "teamMembers": [
      {
        "id": "TM-038A",
        "name": "Sudhir Pandey",
        "departmentName": "Mining Geology & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-038B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-038A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-038B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-038C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 520000,
    "budgetApproved": 520000,
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-039",
    "challengeId": "DEMO-CH-039",
    "challengeTitle": "Severe iron oxide staining and sediment blockage in natural hillside seepage drinking water springs",
    "category": "Water Filtration & Spring Rejuvenation",
    "district": "Gumla",
    "universityId": "UNI-UMU-RANCHI",
    "universityName": "Usha Martin University (UMU)",
    "facultyMentorName": "Dr. A. K. Tiwari (Birsa Agricultural University (BAU))",
    "facultyEmail": "aktiwari.horti@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-039A",
        "name": "Pankaj Kujur",
        "departmentName": "Geotechnical & Transportation Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-039B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-039A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-039B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-039C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 410000,
    "budgetApproved": 410000,
    "createdAt": daysAgo(24),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-040",
    "challengeId": "DEMO-CH-040",
    "challengeTitle": "High soil alkalinity and calcification preventing pulse crop germination in Kanhar river basin",
    "category": "Soil Chemistry & Agro Conditioners",
    "district": "Garhwa",
    "universityId": "UNI-NPU-PALAMU",
    "universityName": "Nilamber Pitamber University (NPU)",
    "facultyMentorName": "Dr. M. S. Malik (Birsa Agricultural University (BAU))",
    "facultyEmail": "msmalik.forestry@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-040A",
        "name": "Sarita Kumari",
        "departmentName": "Water Resources & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-040B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-040A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-040B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-040C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 430000,
    "budgetApproved": 430000,
    "createdAt": daysAgo(15),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-041",
    "challengeId": "DEMO-CH-041",
    "challengeTitle": "Excessive siltation and heavy sand clogging of micro lift irrigation canals from opencast mine earthworks",
    "category": "Irrigation Engineering & Hydrocyclones",
    "district": "Chatra",
    "universityId": "UNI-AISECT-HAZARIBAGH",
    "universityName": "AISECT University (Hazaribagh)",
    "facultyMentorName": "Dr. S. K. Jain (BIT Mesra, Ranchi)",
    "facultyEmail": "skjain.heritage@bitmesra.ac.in",
    "teamMembers": [
      {
        "id": "TM-041A",
        "name": "Vivek Sharma",
        "departmentName": "Mechanical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-041B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-041A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-041B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-041C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 470000,
    "budgetApproved": 470000,
    "createdAt": daysAgo(16),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-042",
    "challengeId": "DEMO-CH-042",
    "challengeTitle": "Spontaneous combustion and suffocating sulfur dioxide fumes in abandoned overburden dump yards",
    "category": "Mining Safety & Thermal InSAR",
    "district": "Ramgarh",
    "universityId": "UNI-JRSU-RANCHI",
    "universityName": "Jharkhand Raksha Shakti University (JRSU)",
    "facultyMentorName": "Dr. Anand Prakash (BIT Mesra, Ranchi)",
    "facultyEmail": "aprakash.mech@bitmesra.ac.in",
    "teamMembers": [
      {
        "id": "TM-042A",
        "name": "Anirban Paul",
        "departmentName": "Chemical & Environmental Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-042B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-042A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-042B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-042C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 550000,
    "budgetApproved": 550000,
    "createdAt": daysAgo(17),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-043",
    "challengeId": "DEMO-CH-043",
    "challengeTitle": "Rapid rotting and fungal mold spoilage in harvested Mahua flowers during humid monsoon transition",
    "category": "Agro Forestry Post Harvest Tech",
    "district": "Simdega",
    "universityId": "UNI-PIU-RANCHI",
    "universityName": "Pragyan International University (PIU)",
    "facultyMentorName": "Dr. K. K. Sharma (Birsa Agricultural University (BAU))",
    "facultyEmail": "kksharma.lac@bauranchi.org",
    "teamMembers": [
      {
        "id": "TM-043A",
        "name": "Nirmal Bage",
        "departmentName": "Structural Engineering & Rural Infrastructure",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-043B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-043A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-043B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-043C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 390000,
    "budgetApproved": 390000,
    "createdAt": daysAgo(18),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-044",
    "challengeId": "DEMO-CH-044",
    "challengeTitle": "Acidic red soil phosphorus fixation reducing maize and mustard crop yields in Asur plateau villages",
    "category": "Soil Microbiology & Biofertilizers",
    "district": "Lohardaga",
    "universityId": "UNI-RANCHI-UNIVERSITY",
    "universityName": "Ranchi University",
    "facultyMentorName": "Dr. Latika Saran (Ranchi University)",
    "facultyEmail": "lsaran.env@ranchiuniversity.ac.in",
    "teamMembers": [
      {
        "id": "TM-044A",
        "name": "Rashmi Minz",
        "departmentName": "Soil Science & Agronomy",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-044B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-044A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(12)
      },
      {
        "id": "MS-044B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-044C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 410000,
    "budgetApproved": 410000,
    "createdAt": daysAgo(19),
    "updatedAt": daysAgo(1)
  },
  {
    "id": "DEMO-PRJ-045",
    "challengeId": "DEMO-CH-045",
    "challengeTitle": "Unregulated stone quarry blasting dust suppressing Mulberry leaf yield and destroying Tussar silkworm farming",
    "category": "Agro Silk & Dust Filtration",
    "district": "Dumka",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "Sido Kanhu Murmu University (SKMU)",
    "facultyMentorName": "Dr. C. P. Hansda (Sido Kanhu Murmu University (SKMU))",
    "facultyEmail": "cphansda.health@skmu.ac.in",
    "teamMembers": [
      {
        "id": "TM-045A",
        "name": "Sunil Hembrom",
        "departmentName": "Environmental Science & Water Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-045B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Team Formed",
    "milestones": [
      {
        "id": "MS-045A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(8)
      },
      {
        "id": "MS-045B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "Completed",
        "targetDays": 14
      },
      {
        "id": "MS-045C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 440000,
    "budgetApproved": 440000,
    "createdAt": daysAgo(20),
    "updatedAt": daysAgo(2)
  },
  {
    "id": "DEMO-PRJ-046",
    "challengeId": "DEMO-CH-046",
    "challengeTitle": "High groundwater boron levels affecting wheat crop germination and drinking water quality",
    "category": "Water Purification & Ion Exchange",
    "district": "Godda",
    "universityId": "UNI-IIT-ISM-DHANBAD",
    "universityName": "IIT (ISM) Dhanbad",
    "facultyMentorName": "Dr. V. M. S. R. Murthy (IIT (ISM) Dhanbad)",
    "facultyEmail": "vmsrmurthy.mining@iitism.ac.in",
    "teamMembers": [
      {
        "id": "TM-046A",
        "name": "Pradeep Sah",
        "departmentName": "Horticulture & Environmental Science",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-046B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Accepted",
    "milestones": [
      {
        "id": "MS-046A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(9)
      },
      {
        "id": "MS-046B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-046C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 470000,
    "budgetApproved": 470000,
    "createdAt": daysAgo(21),
    "updatedAt": daysAgo(3)
  },
  {
    "id": "DEMO-PRJ-047",
    "challengeId": "DEMO-CH-047",
    "challengeTitle": "Groundwater fluoride and heavy iron precipitate poisoning deep tube wells in tribal hamlets",
    "category": "Water Quality & Contamination",
    "district": "Pakur",
    "universityId": "UNI-SKMU-DUMKA",
    "universityName": "Sido Kanhu Murmu University (SKMU)",
    "facultyMentorName": "Dr. Sanjeev Murmu (Sido Kanhu Murmu University (SKMU))",
    "facultyEmail": "smurmu.water@skmu.ac.in",
    "teamMembers": [
      {
        "id": "TM-047A",
        "name": "Sanjay Murmu",
        "departmentName": "Occupational Health & Mining Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-047B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Accepted",
    "milestones": [
      {
        "id": "MS-047A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(10)
      },
      {
        "id": "MS-047B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-047C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 500000,
    "budgetApproved": 500000,
    "createdAt": daysAgo(22),
    "updatedAt": daysAgo(4)
  },
  {
    "id": "DEMO-PRJ-048",
    "challengeId": "DEMO-CH-048",
    "challengeTitle": "Heavy soil lateritization and low water retention stunting cashew and fruit sapling survival in dry tracts",
    "category": "Arid Agronomy & Hydrogels",
    "district": "Jamtara",
    "universityId": "UNI-BBMKU-DHANBAD",
    "universityName": "BIT Sindri (Dhanbad)",
    "facultyMentorName": "Dr. R. K. Verma (BIT Sindri (Dhanbad))",
    "facultyEmail": "rkverma.ceramic@bitsindri.ac.in",
    "teamMembers": [
      {
        "id": "TM-048A",
        "name": "Aniruddha Ghosh",
        "departmentName": "Soil Science & Agricultural Engineering",
        "role": "Team Lead & Field Investigator",
        "skills": [
          "System Engineering",
          "IoT Telemetry",
          "Field Prototyping"
        ]
      },
      {
        "id": "TM-048B",
        "name": "Aditya Sen",
        "departmentName": "Applied Technology",
        "role": "Hardware Engineer",
        "skills": [
          "Embedded Systems",
          "Sensor Calibration",
          "Data Logging"
        ]
      }
    ],
    "status": "Accepted",
    "milestones": [
      {
        "id": "MS-048A",
        "stageNumber": 1,
        "title": "Field Baseline Survey",
        "description": "Complete on ground sensor survey and baseline logging",
        "status": "Completed",
        "targetDays": 7,
        "completedAt": daysAgo(11)
      },
      {
        "id": "MS-048B",
        "stageNumber": 2,
        "title": "Prototype Fabrication",
        "description": "Assemble and calibrate field prototype unit",
        "status": "In Progress",
        "targetDays": 14
      },
      {
        "id": "MS-048C",
        "stageNumber": 3,
        "title": "Field Pilot Installation",
        "description": "Deploy prototype at targeted village site",
        "status": "Pending",
        "targetDays": 28
      }
    ],
    "proposals": [],
    "budgetEstimated": 390000,
    "budgetApproved": 390000,
    "createdAt": daysAgo(23),
    "updatedAt": daysAgo(1)
  },
];

export const SEED_PROPOSALS: Proposal[] = [
  {
    "id": "DEMO-PROP-001",
    "projectId": "DEMO-PRJ-001",
    "title": "CSR Technology Grant: Ground subsidence cracks and toxic CO gas venting near Lodna",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy continuous Fiber Optic Distributed Temperature Sensing (DTS) along with deep borehole nitrogen foam injection barrier.",
    "estimatedBudget": 650000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Priya Sharma (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(11),
    "reviewNote": "Approved by Dhanbad District Level Committee. Grant of ?6.50L sanctioned by Bharat Coking Coal Limited (BCCL CSR)."
  },
  {
    "id": "DEMO-PROP-002",
    "projectId": "DEMO-PRJ-002",
    "title": "CSR Technology Grant: Severe arsenic and fluoride toxicity in 18 Santhal tribal vi",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Fabricate stainless steel 304 filter cartridge with toolless quick swap flange and nano iron adsorbent media.",
    "estimatedBudget": 520000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Deepak Sahu (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(12),
    "reviewNote": "Approved by Giridih District Level Committee. Grant of ?5.20L sanctioned by Tata Steel Foundation."
  },
  {
    "id": "DEMO-PROP-003",
    "projectId": "DEMO-PRJ-003",
    "title": "CSR Technology Grant: North Koel rain shadow drought and deep aquifer drawdown bel",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install 24 LoRaWAN solar piezometers for real time aquifer recharge modeling and smart micro drip controllers.",
    "estimatedBudget": 480000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Amit Murmu (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(13),
    "reviewNote": "Approved by Palamu District Level Committee. Grant of ?4.80L sanctioned by NTPC CSR Rural Energy Fund."
  },
  {
    "id": "DEMO-PROP-004",
    "projectId": "DEMO-PRJ-004",
    "title": "CSR Technology Grant: Subarnarekha and Kharkai river confluence backwater flood su",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy ultrasonic stage telemetry sentinel array and solar automated knife gate backflow valves.",
    "estimatedBudget": 580000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Rajat Verma (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(14),
    "reviewNote": "Approved by East Singhbhum District Level Committee. Grant of ?5.80L sanctioned by Tata Steel TSRDS."
  },
  {
    "id": "DEMO-PROP-005",
    "projectId": "DEMO-PRJ-005",
    "title": "CSR Technology Grant: Iron ore tailings slurry and hematite red mud runoff polluti",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install modular multi chamber lamella clarifier tank with eco friendly bio flocculant dosing system.",
    "estimatedBudget": 620000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sanjay Birua (Team Lead, Kolhan University)",
    "submittedAt": daysAgo(15),
    "reviewNote": "Approved by West Singhbhum District Level Committee. Grant of ?6.20L sanctioned by Tata Steel Mining & SAIL RMD."
  },
  {
    "id": "DEMO-PROP-006",
    "projectId": "DEMO-PRJ-006",
    "title": "CSR Technology Grant: Elephant migration corridor nocturnal crop raiding and human",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy 8 thermal IR camera towers with YOLOv8 Edge AI elephant detection and ultrasonic acoustic repellers.",
    "estimatedBudget": 510000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Aniket Tirkey (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(16),
    "reviewNote": "Approved by Latehar District Level Committee. Grant of ?5.10L sanctioned by Essar Power CSR & CCL CSR."
  },
  {
    "id": "DEMO-PROP-007",
    "projectId": "DEMO-PRJ-007",
    "title": "CSR Technology Grant: Severe Ganga riverbank scouring and seasonal road washaway i",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install biodegradable vetiver grass root geocells and submerged concrete tetrahedron deflectors.",
    "estimatedBudget": 640000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Tariq Anwar (Team Lead, SKMU Dumka)",
    "submittedAt": daysAgo(17),
    "reviewNote": "Approved by Sahibganj District Level Committee. Grant of ?6.40L sanctioned by Adani Ports & Inland Waterways CSR."
  },
  {
    "id": "DEMO-PROP-008",
    "projectId": "DEMO-PRJ-008",
    "title": "CSR Technology Grant: Monsoon stormwater accumulation submerging Government High S",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install radar water level sentinels, automated solar sump pumps, and perforated precast drainage conduits.",
    "estimatedBudget": 450000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Manish Pandey (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(18),
    "reviewNote": "Approved by Ranchi District Level Committee. Grant of ?4.50L sanctioned by Central Coalfields Ltd (CCL CSR)."
  },
  {
    "id": "DEMO-PROP-009",
    "projectId": "DEMO-PRJ-009",
    "title": "CSR Technology Grant: Fly ash slurry pipeline breach discharging into Konar river ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy mobile continuous hydrocyclone slurry separators and optical suspended solids sensors.",
    "estimatedBudget": 570000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Vikas Kumar (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(19),
    "reviewNote": "Approved by Bokaro District Level Committee. Grant of ?5.70L sanctioned by SAIL Bokaro Steel Plant CSR."
  },
  {
    "id": "DEMO-PROP-010",
    "projectId": "DEMO-PRJ-010",
    "title": "CSR Technology Grant: Untreated electroplating heavy metal and acid bath discharge",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Fabricate decentralized modular electrochemical reduction and heavy metal precipitation unit with smart pH/EC telemetry.",
    "estimatedBudget": 540000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Rohit Mahato (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(10),
    "reviewNote": "Approved by Saraikela Kharsawan District Level Committee. Grant of ?5.40L sanctioned by Adityapur Industrial Association & Tata Motors CSR."
  },
  {
    "id": "DEMO-PROP-011",
    "projectId": "DEMO-PRJ-011",
    "title": "CSR Technology Grant: Fungal shoot blight and Eublemma moth infestation destroying",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Formulate bio fungicide botanical spray based on Trichoderma harzianum and deploy solar pheromone insect light traps.",
    "estimatedBudget": 380000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sushil Munda (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(11),
    "reviewNote": "Approved by Khunti District Level Committee. Grant of ?3.80L sanctioned by Tata Trusts & JASCOLAMPF CSR."
  },
  {
    "id": "DEMO-PROP-012",
    "projectId": "DEMO-PRJ-012",
    "title": "CSR Technology Grant: Fecal coliform and microbial contamination in 32 community h",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy automated inline electrolytic sodium hypochlorite dosers and smart microbial ATP fluorescence rapid sensors.",
    "estimatedBudget": 420000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Pooja Jha (Team Lead, AIIMS Deoghar)",
    "submittedAt": daysAgo(12),
    "reviewNote": "Approved by Deoghar District Level Committee. Grant of ?4.20L sanctioned by Adani Power & Indian Oil CSR."
  },
  {
    "id": "DEMO-PROP-013",
    "projectId": "DEMO-PRJ-013",
    "title": "CSR Technology Grant: Barakar river bridge Pier 3 foundation scouring and concrete",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install MEMS tilt and wireless crack sensor telemetry network combined with underwater epoxy mortar and stone riprap packing.",
    "estimatedBudget": 610000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Alok Ranjan (Team Lead, VBU Hazaribagh)",
    "submittedAt": daysAgo(13),
    "reviewNote": "Approved by Hazaribagh District Level Committee. Grant of ?6.10L sanctioned by NTPC Coal Mining Project CSR."
  },
  {
    "id": "DEMO-PROP-014",
    "projectId": "DEMO-PRJ-014",
    "title": "CSR Technology Grant: Abandoned open pit mica mine quarry slope collapse and unfen",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy drone LiDAR slope stability analysis, wire mesh geogrid terracing, and fast growing native vetiver bio fencing.",
    "estimatedBudget": 480000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Nikhil Barnwal (Team Lead, BIT Sindri)",
    "submittedAt": daysAgo(14),
    "reviewNote": "Approved by Koderma District Level Committee. Grant of ?4.80L sanctioned by Damodar Valley Corporation (DVC CSR)."
  },
  {
    "id": "DEMO-PROP-015",
    "projectId": "DEMO-PRJ-015",
    "title": "CSR Technology Grant: Heavy bauxite haulage truck axle loads causing road subsiden",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy high modulus biaxial geogrid reinforcement with polymer modified bitumen overlay and solar strain gauges.",
    "estimatedBudget": 590000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Aman Linda (Team Lead, Ranchi University)",
    "submittedAt": daysAgo(15),
    "reviewNote": "Approved by Gumla District Level Committee. Grant of ?5.90L sanctioned by Hindalco Industries CSR."
  },
  {
    "id": "DEMO-PROP-016",
    "projectId": "DEMO-PRJ-016",
    "title": "CSR Technology Grant: Severe fluoride contamination in deep borewells causing ende",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install community scale solar electrocoagulation defluoridation units with activated alumina polishing columns.",
    "estimatedBudget": 560000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Pankaj Kumar (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(16),
    "reviewNote": "Approved by Garhwa District Level Committee. Grant of ?5.60L sanctioned by JASCOLAMPF & UPL CSR."
  },
  {
    "id": "DEMO-PROP-017",
    "projectId": "DEMO-PRJ-017",
    "title": "CSR Technology Grant: Opencast coal mining PM2.5 and PM10 dust fallout smothering ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install solar powered high pressure dry fog misting cannon barriers and optical dust sensors.",
    "estimatedBudget": 520000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Rajesh Dangi (Team Lead, VBU Hazaribagh)",
    "submittedAt": daysAgo(17),
    "reviewNote": "Approved by Chatra District Level Committee. Grant of ?5.20L sanctioned by NTPC North Karanpura & CCL CSR."
  },
  {
    "id": "DEMO-PROP-018",
    "projectId": "DEMO-PRJ-018",
    "title": "CSR Technology Grant: Damodar river black sludge sedimentation and coal washery ef",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy continuous hydrocyclone dewatering units and solar floating dissolved oxygen aeration buoys.",
    "estimatedBudget": 610000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sumit Ganguly (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(18),
    "reviewNote": "Approved by Ramgarh District Level Committee. Grant of ?6.10L sanctioned by Tata Steel West Bokaro & CCL CSR."
  },
  {
    "id": "DEMO-PROP-019",
    "projectId": "DEMO-PRJ-019",
    "title": "CSR Technology Grant: Seasonal flash flood washouts of low level causeway isolatin",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct modular lightweight galvanized structural steel pedestrian and light vehicle truss bridge.",
    "estimatedBudget": 630000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Gourav Kispotta (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(19),
    "reviewNote": "Approved by Simdega District Level Committee. Grant of ?6.30L sanctioned by JASCOLAMPF & Tata Trusts."
  },
  {
    "id": "DEMO-PROP-020",
    "projectId": "DEMO-PRJ-020",
    "title": "CSR Technology Grant: Bauxite mine surface red mud runoff burying terraced paddy f",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct bio engineered vetiver grass silt traps and apply organic humic acid and phospho gypsum amendments.",
    "estimatedBudget": 490000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Santosh Asur (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(10),
    "reviewNote": "Approved by Lohardaga District Level Committee. Grant of ?4.90L sanctioned by Hindalco Industries Lohardaga CSR."
  },
  {
    "id": "DEMO-PROP-021",
    "projectId": "DEMO-PRJ-021",
    "title": "CSR Technology Grant: Unfiltered Mayurakshi river basin water supply contaminated ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy multi barrier solar gravity sand filtration units with iron oxide nano coated media and smart turbidity sensors.",
    "estimatedBudget": 510000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Chandan Marandi (Team Lead, SKMU Dumka)",
    "submittedAt": daysAgo(11),
    "reviewNote": "Approved by Dumka District Level Committee. Grant of ?5.10L sanctioned by Jharcraft & JASCOLAMPF CSR."
  },
  {
    "id": "DEMO-PROP-022",
    "projectId": "DEMO-PRJ-022",
    "title": "CSR Technology Grant: Coal thermal plant suspended particulate matter (SPM) fallou",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install automated solar canopy misting sprinklers and optical dust monitoring stations.",
    "estimatedBudget": 480000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Mukesh Poddar (Team Lead, SKMU Dumka)",
    "submittedAt": daysAgo(12),
    "reviewNote": "Approved by Godda District Level Committee. Grant of ?4.80L sanctioned by Adani Power Godda CSR."
  },
  {
    "id": "DEMO-PROP-023",
    "projectId": "DEMO-PRJ-023",
    "title": "CSR Technology Grant: Stone crushing silica dust emission causing acute silicosis ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Retrofit high pressure ultrasonic dry fog dust suppression manifolds and deploy real time optical PM counters.",
    "estimatedBudget": 570000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Devendra Paharia (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(13),
    "reviewNote": "Approved by Pakur District Level Committee. Grant of ?5.70L sanctioned by Eastern Coalfields & State Mineral CSR."
  },
  {
    "id": "DEMO-PROP-024",
    "projectId": "DEMO-PRJ-024",
    "title": "CSR Technology Grant: Ajay river seasonal sand deposition suffocating fertile padd",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct 4 brushwood and rock deflector spurs and distribute 25 tons biochar organic soil conditioner.",
    "estimatedBudget": 430000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Debashis Mondal (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(14),
    "reviewNote": "Approved by Jamtara District Level Committee. Grant of ?4.30L sanctioned by DVC & JASCOLAMPF CSR."
  },
  {
    "id": "DEMO-PROP-025",
    "projectId": "DEMO-PRJ-025",
    "title": "CSR Technology Grant: Heavy coal transport track vibration causing structural crac",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Design recycled fly ash geopolymer seismic damping trenches and sub base vibration attenuation baffles along haulage corridors.",
    "estimatedBudget": 540000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Aditya Raj (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(15),
    "reviewNote": "Approved by Dhanbad District Level Committee. Grant of ?5.40L sanctioned by Bharat Coking Coal Limited (BCCL CSR)."
  },
  {
    "id": "DEMO-PROP-026",
    "projectId": "DEMO-PRJ-026",
    "title": "CSR Technology Grant: High seasonal solar pump failure and inverter degradation du",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Develop hydrophobic self cleaning nano coatings and automatic piezo electric dust wiper rings for rural PV arrays.",
    "estimatedBudget": 480000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Kavita Singh (Team Lead, BIT Sindri)",
    "submittedAt": daysAgo(16),
    "reviewNote": "Approved by Giridih District Level Committee. Grant of ?4.80L sanctioned by Tata Steel Foundation."
  },
  {
    "id": "DEMO-PROP-027",
    "projectId": "DEMO-PRJ-027",
    "title": "CSR Technology Grant: Severe summer thermal stress and mortality in indigenous bla",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct passive evaporative cooled bamboo composite shelters with integrated IoT microclimate misters and electrolyte dispensers.",
    "estimatedBudget": 420000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Shweta Kumari (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(17),
    "reviewNote": "Approved by Palamu District Level Committee. Grant of ?4.20L sanctioned by NTPC CSR Rural Energy Fund."
  },
  {
    "id": "DEMO-PROP-028",
    "projectId": "DEMO-PRJ-028",
    "title": "CSR Technology Grant: Chromium and copper heavy metal bioaccumulation in vegetable",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Synthesize customized agricultural waste pyrolyzed magnetic biochar pellets for in situ heavy metal immobilization.",
    "estimatedBudget": 510000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Neha Roy (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(18),
    "reviewNote": "Approved by East Singhbhum District Level Committee. Grant of ?5.10L sanctioned by Tata Steel TSRDS."
  },
  {
    "id": "DEMO-PROP-029",
    "projectId": "DEMO-PRJ-029",
    "title": "CSR Technology Grant: Acid mine drainage and manganese leaching into tribal forest",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct limestone neutralization permeable reactive barriers (PRBs) coupled with manganese oxide catalytic bio sand filters.",
    "estimatedBudget": 530000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Anjali Soren (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(19),
    "reviewNote": "Approved by West Singhbhum District Level Committee. Grant of ?5.30L sanctioned by Tata Steel Mining & SAIL RMD."
  },
  {
    "id": "DEMO-PROP-030",
    "projectId": "DEMO-PRJ-030",
    "title": "CSR Technology Grant: Frequent monsoon flash flood logjams and wooden culvert coll",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Design modular precast ultra high performance fiber reinforced concrete (UHPFRC) self scouring arch culverts.",
    "estimatedBudget": 560000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Pooja Oraon (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(10),
    "reviewNote": "Approved by Latehar District Level Committee. Grant of ?5.60L sanctioned by Essar Power CSR & CCL CSR."
  },
  {
    "id": "DEMO-PROP-031",
    "projectId": "DEMO-PRJ-031",
    "title": "CSR Technology Grant: River siltation and sudden shoreline recession disrupting in",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy autonomous solar sonar bathymetric mapping drone and dynamic hydrodynamic sediment diversion curtains.",
    "estimatedBudget": 590000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Manoj Mandal (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(11),
    "reviewNote": "Approved by Sahibganj District Level Committee. Grant of ?5.90L sanctioned by Adani Ports & Inland Waterways CSR."
  },
  {
    "id": "DEMO-PROP-032",
    "projectId": "DEMO-PRJ-032",
    "title": "CSR Technology Grant: Cold storage decay and high post harvest loss in peri urban ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Engineer solar powered decentralized phase change material (PCM) thermal storage cooling micro units with smart humidity regulation.",
    "estimatedBudget": 490000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sunil Toppo (Team Lead, Ranchi University)",
    "submittedAt": daysAgo(12),
    "reviewNote": "Approved by Ranchi District Level Committee. Grant of ?4.90L sanctioned by Central Coalfields Ltd (CCL CSR)."
  },
  {
    "id": "DEMO-PROP-033",
    "projectId": "DEMO-PRJ-033",
    "title": "CSR Technology Grant: Toxic phenolic wastewater and cyanide traces in industrial s",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Construct multi stage immobilized enzyme bioreactor coupled with constructed floating wetland phytoremediation beds.",
    "estimatedBudget": 530000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Deepa Mishra (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(13),
    "reviewNote": "Approved by Bokaro District Level Committee. Grant of ?5.30L sanctioned by SAIL Bokaro Steel Plant CSR."
  },
  {
    "id": "DEMO-PROP-034",
    "projectId": "DEMO-PRJ-034",
    "title": "CSR Technology Grant: High volatile organic compound (VOC) emissions and toxic pai",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy photocatalytic TiO2 air purification filter scrubbers with real time photoionization detector (PID) telemetry.",
    "estimatedBudget": 490000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Prakash Sahu (Team Lead, NIT Jamshedpur)",
    "submittedAt": daysAgo(14),
    "reviewNote": "Approved by Saraikela Kharsawan District Level Committee. Grant of ?4.90L sanctioned by Adityapur Industrial Association & Tata Motors CSR."
  },
  {
    "id": "DEMO-PROP-035",
    "projectId": "DEMO-PRJ-035",
    "title": "CSR Technology Grant: Severe stem borer pest infestation damaging Dragon Fruit and",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy smart solar IoT acoustic sensors detecting larval boring frequencies combined with entomopathogenic nematode bio injection.",
    "estimatedBudget": 410000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Kiran Gope (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(15),
    "reviewNote": "Approved by Khunti District Level Committee. Grant of ?4.10L sanctioned by Tata Trusts & JASCOLAMPF CSR."
  },
  {
    "id": "DEMO-PROP-036",
    "projectId": "DEMO-PRJ-036",
    "title": "CSR Technology Grant: Enormous biodegradable floral and leaf waste accumulation de",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Design modular rapid thermophilic bio digestion reactors converting sacred offerings into dry organic bio fertilizer pellets and biogas.",
    "estimatedBudget": 460000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Ravi Ranjan (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(16),
    "reviewNote": "Approved by Deoghar District Level Committee. Grant of ?4.60L sanctioned by Adani Power & Indian Oil CSR."
  },
  {
    "id": "DEMO-PROP-037",
    "projectId": "DEMO-PRJ-037",
    "title": "CSR Technology Grant: Rapid soil erosion and gullying on agricultural slopes cause",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy bio degradable coconut coir geosynthetic check dams and deep rooting vetiver grass bio hedges.",
    "estimatedBudget": 440000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Meenakshi Roy (Team Lead, VBU Hazaribagh)",
    "submittedAt": daysAgo(17),
    "reviewNote": "Approved by Hazaribagh District Level Committee. Grant of ?4.40L sanctioned by NTPC Coal Mining Project CSR."
  },
  {
    "id": "DEMO-PROP-038",
    "projectId": "DEMO-PRJ-038",
    "title": "CSR Technology Grant: Acute groundwater salinity and heavy mineral hardness in dry",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Build solar low pressure capacitive deionization (CDI) water treatment plants with zero chemical reject water.",
    "estimatedBudget": 520000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sudhir Pandey (Team Lead, VBU Hazaribagh)",
    "submittedAt": daysAgo(18),
    "reviewNote": "Approved by Koderma District Level Committee. Grant of ?5.20L sanctioned by Damodar Valley Corporation (DVC CSR)."
  },
  {
    "id": "DEMO-PROP-039",
    "projectId": "DEMO-PRJ-039",
    "title": "CSR Technology Grant: Severe iron oxide staining and sediment blockage in natural ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install multi chamber gravity fed aeration cascading chambers with granular activated carbon and basaltic sand filters.",
    "estimatedBudget": 410000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Pankaj Kujur (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(19),
    "reviewNote": "Approved by Gumla District Level Committee. Grant of ?4.10L sanctioned by Hindalco Industries CSR."
  },
  {
    "id": "DEMO-PROP-040",
    "projectId": "DEMO-PRJ-040",
    "title": "CSR Technology Grant: High soil alkalinity and calcification preventing pulse crop",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Formulate bio acidified organic soil conditioners derived from composted mahua flower residue and phospho gypsum.",
    "estimatedBudget": 430000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sarita Kumari (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(10),
    "reviewNote": "Approved by Garhwa District Level Committee. Grant of ?4.30L sanctioned by JASCOLAMPF & UPL CSR."
  },
  {
    "id": "DEMO-PROP-041",
    "projectId": "DEMO-PRJ-041",
    "title": "CSR Technology Grant: Excessive siltation and heavy sand clogging of micro lift ir",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Install automated vortex sand separator hydrocyclones with solar backwash scraper filters at canal headworks.",
    "estimatedBudget": 470000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Vivek Sharma (Team Lead, BIT Mesra)",
    "submittedAt": daysAgo(11),
    "reviewNote": "Approved by Chatra District Level Committee. Grant of ?4.70L sanctioned by NTPC North Karanpura & CCL CSR."
  },
  {
    "id": "DEMO-PROP-042",
    "projectId": "DEMO-PRJ-042",
    "title": "CSR Technology Grant: Spontaneous combustion and suffocating sulfur dioxide fumes ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy drone thermal IR surveying with localized high expansion hydrogel extinguishing foam injection systems.",
    "estimatedBudget": 550000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Anirban Paul (Team Lead, IIT ISM Dhanbad)",
    "submittedAt": daysAgo(12),
    "reviewNote": "Approved by Ramgarh District Level Committee. Grant of ?5.50L sanctioned by Tata Steel West Bokaro & CCL CSR."
  },
  {
    "id": "DEMO-PROP-043",
    "projectId": "DEMO-PRJ-043",
    "title": "CSR Technology Grant: Rapid rotting and fungal mold spoilage in harvested Mahua fl",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy solar hybrid dehumidification drying tunnels with integrated UV C sanitization chambers for tribal cooperatives.",
    "estimatedBudget": 390000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Nirmal Bage (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(13),
    "reviewNote": "Approved by Simdega District Level Committee. Grant of ?3.90L sanctioned by JASCOLAMPF & Tata Trusts."
  },
  {
    "id": "DEMO-PROP-044",
    "projectId": "DEMO-PRJ-044",
    "title": "CSR Technology Grant: Acidic red soil phosphorus fixation reducing maize and musta",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Formulate phosphate solubilizing fungal microbial inoculants (PSB bio fertilizer) tailored for high aluminum acidic red soils.",
    "estimatedBudget": 410000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Rashmi Minz (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(14),
    "reviewNote": "Approved by Lohardaga District Level Committee. Grant of ?4.10L sanctioned by Hindalco Industries Lohardaga CSR."
  },
  {
    "id": "DEMO-PROP-045",
    "projectId": "DEMO-PRJ-045",
    "title": "CSR Technology Grant: Unregulated stone quarry blasting dust suppressing Mulberry ",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy organic bio spray dust binders and vegetative tall grass dust filtration buffer screens around rearing groves.",
    "estimatedBudget": 440000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sunil Hembrom (Team Lead, SKMU Dumka)",
    "submittedAt": daysAgo(15),
    "reviewNote": "Approved by Dumka District Level Committee. Grant of ?4.40L sanctioned by Jharcraft & JASCOLAMPF CSR."
  },
  {
    "id": "DEMO-PROP-046",
    "projectId": "DEMO-PRJ-046",
    "title": "CSR Technology Grant: High groundwater boron levels affecting wheat crop germinati",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy selective boron specific ion exchange resin column filtration units with automated solar regeneration.",
    "estimatedBudget": 470000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Pradeep Sah (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(16),
    "reviewNote": "Approved by Godda District Level Committee. Grant of ?4.70L sanctioned by Adani Power Godda CSR."
  },
  {
    "id": "DEMO-PROP-047",
    "projectId": "DEMO-PRJ-047",
    "title": "CSR Technology Grant: Groundwater fluoride and heavy iron precipitate poisoning de",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Deploy modular solar electrocoagulation and manganese dioxide catalytic oxidation filter skids.",
    "estimatedBudget": 500000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Sanjay Murmu (Team Lead, SKMU Dumka)",
    "submittedAt": daysAgo(17),
    "reviewNote": "Approved by Pakur District Level Committee. Grant of ?5.00L sanctioned by Eastern Coalfields & State Mineral CSR."
  },
  {
    "id": "DEMO-PROP-048",
    "projectId": "DEMO-PRJ-048",
    "title": "CSR Technology Grant: Heavy soil lateritization and low water retention stunting c",
    "description": "Co-funded university R&D technology deployment project.",
    "approach": "Incorporate biodegradable potassium polyacrylate superabsorbent hydrogels infused with mycorrhizal bio stimulants.",
    "estimatedBudget": 390000,
    "estimatedTimeline": "12 weeks",
    "status": "Approved",
    "submittedBy": "Aniruddha Ghosh (Team Lead, BAU Ranchi)",
    "submittedAt": daysAgo(18),
    "reviewNote": "Approved by Jamtara District Level Committee. Grant of ?3.90L sanctioned by DVC & JASCOLAMPF CSR."
  },
];

export const SEED_TIMELINE: TimelineEvent[] = [
  {
    "id": "DEMO-TL-001",
    "entityType": "challenge",
    "entityId": "DEMO-CH-001",
    "action": "submitted",
    "actor": "Citizen Group (Dhanbad)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Ground subsidence cracks and toxic CO gas venting near Lodna 4 Pits",
    "timestamp": daysAgo(21)
  },
  {
    "id": "DEMO-TL-002",
    "entityType": "challenge",
    "entityId": "DEMO-CH-001",
    "action": "status_changed",
    "actor": "Shri A. K. Rai, DC Dhanbad",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-003",
    "entityType": "challenge",
    "entityId": "DEMO-CH-002",
    "action": "submitted",
    "actor": "Citizen Group (Giridih)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe arsenic and fluoride toxicity in 18 Santhal tribal village handpumps",
    "timestamp": daysAgo(22)
  },
  {
    "id": "DEMO-TL-004",
    "entityType": "challenge",
    "entityId": "DEMO-CH-002",
    "action": "status_changed",
    "actor": "Shri Vikram Singh, DC Giridih",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-005",
    "entityType": "challenge",
    "entityId": "DEMO-CH-003",
    "action": "submitted",
    "actor": "Citizen Group (Palamu)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: North Koel rain shadow drought and deep aquifer drawdown below 42 metres",
    "timestamp": daysAgo(23)
  },
  {
    "id": "DEMO-TL-006",
    "entityType": "challenge",
    "entityId": "DEMO-CH-003",
    "action": "status_changed",
    "actor": "Shri Shashi Ranjan, DC Palamu",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-007",
    "entityType": "challenge",
    "entityId": "DEMO-CH-004",
    "action": "submitted",
    "actor": "Citizen Group (East Singhbhum)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Subarnarekha and Kharkai river confluence backwater flood surge in Bagbera settlement",
    "timestamp": daysAgo(24)
  },
  {
    "id": "DEMO-TL-008",
    "entityType": "challenge",
    "entityId": "DEMO-CH-004",
    "action": "status_changed",
    "actor": "Shri Manjunath Bhajantri, DC East Singhbhum",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-009",
    "entityType": "challenge",
    "entityId": "DEMO-CH-005",
    "action": "submitted",
    "actor": "Citizen Group (West Singhbhum)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Iron ore tailings slurry and hematite red mud runoff polluting Karo river at Gua",
    "timestamp": daysAgo(25)
  },
  {
    "id": "DEMO-TL-010",
    "entityType": "challenge",
    "entityId": "DEMO-CH-005",
    "action": "status_changed",
    "actor": "Shri Kuldeep Chaudhary, DC West Singhbhum",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-011",
    "entityType": "challenge",
    "entityId": "DEMO-CH-006",
    "action": "submitted",
    "actor": "Citizen Group (Latehar)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Elephant migration corridor nocturnal crop raiding and human elephant conflict at Betla buffer",
    "timestamp": daysAgo(26)
  },
  {
    "id": "DEMO-TL-012",
    "entityType": "challenge",
    "entityId": "DEMO-CH-006",
    "action": "status_changed",
    "actor": "Shri Himanshu Mohan, DC Latehar",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-013",
    "entityType": "challenge",
    "entityId": "DEMO-CH-007",
    "action": "submitted",
    "actor": "Citizen Group (Sahibganj)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe Ganga riverbank scouring and seasonal road washaway isolating 14 Diara island villages",
    "timestamp": daysAgo(27)
  },
  {
    "id": "DEMO-TL-014",
    "entityType": "challenge",
    "entityId": "DEMO-CH-007",
    "action": "status_changed",
    "actor": "Shri Umesh Prasad Sah, DC Sahibganj",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-015",
    "entityType": "challenge",
    "entityId": "DEMO-CH-008",
    "action": "submitted",
    "actor": "Citizen Group (Ranchi)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Monsoon stormwater accumulation submerging Government High School road in Hutup",
    "timestamp": daysAgo(28)
  },
  {
    "id": "DEMO-TL-016",
    "entityType": "challenge",
    "entityId": "DEMO-CH-008",
    "action": "status_changed",
    "actor": "Shri Rahul Kumar Sinha, DC Ranchi",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-017",
    "entityType": "challenge",
    "entityId": "DEMO-CH-009",
    "action": "submitted",
    "actor": "Citizen Group (Bokaro)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Fly ash slurry pipeline breach discharging into Konar river intake zone at Phusro",
    "timestamp": daysAgo(29)
  },
  {
    "id": "DEMO-TL-018",
    "entityType": "challenge",
    "entityId": "DEMO-CH-009",
    "action": "status_changed",
    "actor": "Shri Kuldeep Chaudhary, DC Bokaro",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-019",
    "entityType": "challenge",
    "entityId": "DEMO-CH-010",
    "action": "submitted",
    "actor": "Citizen Group (Saraikela Kharsawan)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Untreated electroplating heavy metal and acid bath discharge into Kharkai river tributary",
    "timestamp": daysAgo(20)
  },
  {
    "id": "DEMO-TL-020",
    "entityType": "challenge",
    "entityId": "DEMO-CH-010",
    "action": "status_changed",
    "actor": "Shri Ravi Shankar Shukla, DC Saraikela Kharsawan",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-021",
    "entityType": "challenge",
    "entityId": "DEMO-CH-011",
    "action": "submitted",
    "actor": "Citizen Group (Khunti)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Fungal shoot blight and Eublemma moth infestation destroying tribal Kusum tree lac yields",
    "timestamp": daysAgo(21)
  },
  {
    "id": "DEMO-TL-022",
    "entityType": "challenge",
    "entityId": "DEMO-CH-011",
    "action": "status_changed",
    "actor": "Shri Lokesh Mishra, DC Khunti",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-023",
    "entityType": "challenge",
    "entityId": "DEMO-CH-012",
    "action": "submitted",
    "actor": "Citizen Group (Deoghar)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Fecal coliform and microbial contamination in 32 community handpumps along pilgrim route",
    "timestamp": daysAgo(22)
  },
  {
    "id": "DEMO-TL-024",
    "entityType": "challenge",
    "entityId": "DEMO-CH-012",
    "action": "status_changed",
    "actor": "Shri Vishal Sagar, DC Deoghar",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-025",
    "entityType": "challenge",
    "entityId": "DEMO-CH-013",
    "action": "submitted",
    "actor": "Citizen Group (Hazaribagh)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Barakar river bridge Pier 3 foundation scouring and concrete spalling risk on NH connector",
    "timestamp": daysAgo(23)
  },
  {
    "id": "DEMO-TL-026",
    "entityType": "challenge",
    "entityId": "DEMO-CH-013",
    "action": "status_changed",
    "actor": "Ms. Nancy Sahay, DC Hazaribagh",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-027",
    "entityType": "challenge",
    "entityId": "DEMO-CH-014",
    "action": "submitted",
    "actor": "Citizen Group (Koderma)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Abandoned open pit mica mine quarry slope collapse and unfenced deep water pit hazard",
    "timestamp": daysAgo(24)
  },
  {
    "id": "DEMO-TL-028",
    "entityType": "challenge",
    "entityId": "DEMO-CH-014",
    "action": "status_changed",
    "actor": "Shri Aditya Ranjan, DC Koderma",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-029",
    "entityType": "challenge",
    "entityId": "DEMO-CH-015",
    "action": "submitted",
    "actor": "Citizen Group (Gumla)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Heavy bauxite haulage truck axle loads causing road subsidence and shoulder collapse on Bishunpur ghat",
    "timestamp": daysAgo(25)
  },
  {
    "id": "DEMO-TL-030",
    "entityType": "challenge",
    "entityId": "DEMO-CH-015",
    "action": "status_changed",
    "actor": "Shri Sushant Gaurav, DC Gumla",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-031",
    "entityType": "challenge",
    "entityId": "DEMO-CH-016",
    "action": "submitted",
    "actor": "Citizen Group (Garhwa)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe fluoride contamination in deep borewells causing endemic dental and skeletal fluorosis",
    "timestamp": daysAgo(26)
  },
  {
    "id": "DEMO-TL-032",
    "entityType": "challenge",
    "entityId": "DEMO-CH-016",
    "action": "status_changed",
    "actor": "Shri Shekhar Jamuar, DC Garhwa",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-033",
    "entityType": "challenge",
    "entityId": "DEMO-CH-017",
    "action": "submitted",
    "actor": "Citizen Group (Chatra)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Opencast coal mining PM2.5 and PM10 dust fallout smothering standing tomato and maize crops",
    "timestamp": daysAgo(27)
  },
  {
    "id": "DEMO-TL-034",
    "entityType": "challenge",
    "entityId": "DEMO-CH-017",
    "action": "status_changed",
    "actor": "Shri Abu Imran, DC Chatra",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-035",
    "entityType": "challenge",
    "entityId": "DEMO-CH-018",
    "action": "submitted",
    "actor": "Citizen Group (Ramgarh)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Damodar river black sludge sedimentation and coal washery effluent overflow near Rajrappa",
    "timestamp": daysAgo(28)
  },
  {
    "id": "DEMO-TL-036",
    "entityType": "challenge",
    "entityId": "DEMO-CH-018",
    "action": "status_changed",
    "actor": "Shri Chandan Kumar, DC Ramgarh",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-037",
    "entityType": "challenge",
    "entityId": "DEMO-CH-019",
    "action": "submitted",
    "actor": "Citizen Group (Simdega)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Seasonal flash flood washouts of low level causeway isolating 8 tribal villages in Kolebira",
    "timestamp": daysAgo(29)
  },
  {
    "id": "DEMO-TL-038",
    "entityType": "challenge",
    "entityId": "DEMO-CH-019",
    "action": "status_changed",
    "actor": "Shri Ajay Kumar Singh, DC Simdega",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-039",
    "entityType": "challenge",
    "entityId": "DEMO-CH-020",
    "action": "submitted",
    "actor": "Citizen Group (Lohardaga)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Bauxite mine surface red mud runoff burying terraced paddy fields of Asur tribal farmers",
    "timestamp": daysAgo(20)
  },
  {
    "id": "DEMO-TL-040",
    "entityType": "challenge",
    "entityId": "DEMO-CH-020",
    "action": "status_changed",
    "actor": "Dr. Waghmare Prasad Krishna, DC Lohardaga",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-041",
    "entityType": "challenge",
    "entityId": "DEMO-CH-021",
    "action": "submitted",
    "actor": "Citizen Group (Dumka)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Unfiltered Mayurakshi river basin water supply contaminated with high microbial pathogens and arsenic",
    "timestamp": daysAgo(21)
  },
  {
    "id": "DEMO-TL-042",
    "entityType": "challenge",
    "entityId": "DEMO-CH-021",
    "action": "status_changed",
    "actor": "Shri Ameet Kumar, DC Dumka",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-043",
    "entityType": "challenge",
    "entityId": "DEMO-CH-022",
    "action": "submitted",
    "actor": "Citizen Group (Godda)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Coal thermal plant suspended particulate matter (SPM) fallout damaging betel vine and mango orchards",
    "timestamp": daysAgo(22)
  },
  {
    "id": "DEMO-TL-044",
    "entityType": "challenge",
    "entityId": "DEMO-CH-022",
    "action": "status_changed",
    "actor": "Shri Zeeshan Qamar, DC Godda",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-045",
    "entityType": "challenge",
    "entityId": "DEMO-CH-023",
    "action": "submitted",
    "actor": "Citizen Group (Pakur)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Stone crushing silica dust emission causing acute silicosis risk among tribal workers",
    "timestamp": daysAgo(23)
  },
  {
    "id": "DEMO-TL-046",
    "entityType": "challenge",
    "entityId": "DEMO-CH-023",
    "action": "status_changed",
    "actor": "Shri Mrityunjay Kumar Baranwal, DC Pakur",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-047",
    "entityType": "challenge",
    "entityId": "DEMO-CH-024",
    "action": "submitted",
    "actor": "Citizen Group (Jamtara)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Ajay river seasonal sand deposition suffocating fertile paddy alluvial topsoil",
    "timestamp": daysAgo(24)
  },
  {
    "id": "DEMO-TL-048",
    "entityType": "challenge",
    "entityId": "DEMO-CH-024",
    "action": "status_changed",
    "actor": "Shri Faiz Aq Ahmed Mumtaz, DC Jamtara",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-049",
    "entityType": "challenge",
    "entityId": "DEMO-CH-025",
    "action": "submitted",
    "actor": "Citizen Group (Dhanbad)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Heavy coal transport track vibration causing structural cracks in nearby schools and masonry",
    "timestamp": daysAgo(25)
  },
  {
    "id": "DEMO-TL-050",
    "entityType": "challenge",
    "entityId": "DEMO-CH-025",
    "action": "status_changed",
    "actor": "Shri A. K. Rai, DC Dhanbad",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-051",
    "entityType": "challenge",
    "entityId": "DEMO-CH-026",
    "action": "submitted",
    "actor": "Citizen Group (Giridih)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: High seasonal solar pump failure and inverter degradation due to extreme mica and quartz dust deposition",
    "timestamp": daysAgo(26)
  },
  {
    "id": "DEMO-TL-052",
    "entityType": "challenge",
    "entityId": "DEMO-CH-026",
    "action": "status_changed",
    "actor": "Shri Vikram Singh, DC Giridih",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-053",
    "entityType": "challenge",
    "entityId": "DEMO-CH-027",
    "action": "submitted",
    "actor": "Citizen Group (Palamu)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe summer thermal stress and mortality in indigenous black Bengal goat rearing herds",
    "timestamp": daysAgo(27)
  },
  {
    "id": "DEMO-TL-054",
    "entityType": "challenge",
    "entityId": "DEMO-CH-027",
    "action": "status_changed",
    "actor": "Shri Shashi Ranjan, DC Palamu",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-055",
    "entityType": "challenge",
    "entityId": "DEMO-CH-028",
    "action": "submitted",
    "actor": "Citizen Group (East Singhbhum)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Chromium and copper heavy metal bioaccumulation in vegetable farm soils along Kharkai river discharge channels",
    "timestamp": daysAgo(28)
  },
  {
    "id": "DEMO-TL-056",
    "entityType": "challenge",
    "entityId": "DEMO-CH-028",
    "action": "status_changed",
    "actor": "Shri Manjunath Bhajantri, DC East Singhbhum",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-057",
    "entityType": "challenge",
    "entityId": "DEMO-CH-029",
    "action": "submitted",
    "actor": "Citizen Group (West Singhbhum)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Acid mine drainage and manganese leaching into tribal forest drinking wells",
    "timestamp": daysAgo(29)
  },
  {
    "id": "DEMO-TL-058",
    "entityType": "challenge",
    "entityId": "DEMO-CH-029",
    "action": "status_changed",
    "actor": "Shri Kuldeep Chaudhary, DC West Singhbhum",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-059",
    "entityType": "challenge",
    "entityId": "DEMO-CH-030",
    "action": "submitted",
    "actor": "Citizen Group (Latehar)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Frequent monsoon flash flood logjams and wooden culvert collapse cutting off Mahuadanr valley",
    "timestamp": daysAgo(20)
  },
  {
    "id": "DEMO-TL-060",
    "entityType": "challenge",
    "entityId": "DEMO-CH-030",
    "action": "status_changed",
    "actor": "Shri Himanshu Mohan, DC Latehar",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-061",
    "entityType": "challenge",
    "entityId": "DEMO-CH-031",
    "action": "submitted",
    "actor": "Citizen Group (Sahibganj)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: River siltation and sudden shoreline recession disrupting inland vessel loading and fishing jetties",
    "timestamp": daysAgo(21)
  },
  {
    "id": "DEMO-TL-062",
    "entityType": "challenge",
    "entityId": "DEMO-CH-031",
    "action": "status_changed",
    "actor": "Shri Umesh Prasad Sah, DC Sahibganj",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-063",
    "entityType": "challenge",
    "entityId": "DEMO-CH-032",
    "action": "submitted",
    "actor": "Citizen Group (Ranchi)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Cold storage decay and high post harvest loss in peri urban tomato and green chili crops",
    "timestamp": daysAgo(22)
  },
  {
    "id": "DEMO-TL-064",
    "entityType": "challenge",
    "entityId": "DEMO-CH-032",
    "action": "status_changed",
    "actor": "Shri Rahul Kumar Sinha, DC Ranchi",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-065",
    "entityType": "challenge",
    "entityId": "DEMO-CH-033",
    "action": "submitted",
    "actor": "Citizen Group (Bokaro)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Toxic phenolic wastewater and cyanide traces in industrial storm drains near steel processing belt",
    "timestamp": daysAgo(23)
  },
  {
    "id": "DEMO-TL-066",
    "entityType": "challenge",
    "entityId": "DEMO-CH-033",
    "action": "status_changed",
    "actor": "Shri Kuldeep Chaudhary, DC Bokaro",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-067",
    "entityType": "challenge",
    "entityId": "DEMO-CH-034",
    "action": "submitted",
    "actor": "Citizen Group (Saraikela Kharsawan)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: High volatile organic compound (VOC) emissions and toxic paint sludge fumes in auto ancillary zones",
    "timestamp": daysAgo(24)
  },
  {
    "id": "DEMO-TL-068",
    "entityType": "challenge",
    "entityId": "DEMO-CH-034",
    "action": "status_changed",
    "actor": "Shri Ravi Shankar Shukla, DC Saraikela Kharsawan",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-069",
    "entityType": "challenge",
    "entityId": "DEMO-CH-035",
    "action": "submitted",
    "actor": "Citizen Group (Khunti)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe stem borer pest infestation damaging Dragon Fruit and Papaya horticulture plantations",
    "timestamp": daysAgo(25)
  },
  {
    "id": "DEMO-TL-070",
    "entityType": "challenge",
    "entityId": "DEMO-CH-035",
    "action": "status_changed",
    "actor": "Shri Lokesh Mishra, DC Khunti",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-071",
    "entityType": "challenge",
    "entityId": "DEMO-CH-036",
    "action": "submitted",
    "actor": "Citizen Group (Deoghar)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Enormous biodegradable floral and leaf waste accumulation decaying near religious heritage grounds",
    "timestamp": daysAgo(26)
  },
  {
    "id": "DEMO-TL-072",
    "entityType": "challenge",
    "entityId": "DEMO-CH-036",
    "action": "status_changed",
    "actor": "Shri Vishal Sagar, DC Deoghar",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-073",
    "entityType": "challenge",
    "entityId": "DEMO-CH-037",
    "action": "submitted",
    "actor": "Citizen Group (Hazaribagh)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Rapid soil erosion and gullying on agricultural slopes caused by deforestation and heavy monsoon runoff",
    "timestamp": daysAgo(27)
  },
  {
    "id": "DEMO-TL-074",
    "entityType": "challenge",
    "entityId": "DEMO-CH-037",
    "action": "status_changed",
    "actor": "Ms. Nancy Sahay, DC Hazaribagh",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-075",
    "entityType": "challenge",
    "entityId": "DEMO-CH-038",
    "action": "submitted",
    "actor": "Citizen Group (Koderma)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Acute groundwater salinity and heavy mineral hardness in dry rocky plateau habitations",
    "timestamp": daysAgo(28)
  },
  {
    "id": "DEMO-TL-076",
    "entityType": "challenge",
    "entityId": "DEMO-CH-038",
    "action": "status_changed",
    "actor": "Shri Aditya Ranjan, DC Koderma",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-077",
    "entityType": "challenge",
    "entityId": "DEMO-CH-039",
    "action": "submitted",
    "actor": "Citizen Group (Gumla)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Severe iron oxide staining and sediment blockage in natural hillside seepage drinking water springs",
    "timestamp": daysAgo(29)
  },
  {
    "id": "DEMO-TL-078",
    "entityType": "challenge",
    "entityId": "DEMO-CH-039",
    "action": "status_changed",
    "actor": "Shri Sushant Gaurav, DC Gumla",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-079",
    "entityType": "challenge",
    "entityId": "DEMO-CH-040",
    "action": "submitted",
    "actor": "Citizen Group (Garhwa)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: High soil alkalinity and calcification preventing pulse crop germination in Kanhar river basin",
    "timestamp": daysAgo(20)
  },
  {
    "id": "DEMO-TL-080",
    "entityType": "challenge",
    "entityId": "DEMO-CH-040",
    "action": "status_changed",
    "actor": "Shri Shekhar Jamuar, DC Garhwa",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-081",
    "entityType": "challenge",
    "entityId": "DEMO-CH-041",
    "action": "submitted",
    "actor": "Citizen Group (Chatra)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Excessive siltation and heavy sand clogging of micro lift irrigation canals from opencast mine earthworks",
    "timestamp": daysAgo(21)
  },
  {
    "id": "DEMO-TL-082",
    "entityType": "challenge",
    "entityId": "DEMO-CH-041",
    "action": "status_changed",
    "actor": "Shri Abu Imran, DC Chatra",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-083",
    "entityType": "challenge",
    "entityId": "DEMO-CH-042",
    "action": "submitted",
    "actor": "Citizen Group (Ramgarh)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Spontaneous combustion and suffocating sulfur dioxide fumes in abandoned overburden dump yards",
    "timestamp": daysAgo(22)
  },
  {
    "id": "DEMO-TL-084",
    "entityType": "challenge",
    "entityId": "DEMO-CH-042",
    "action": "status_changed",
    "actor": "Shri Chandan Kumar, DC Ramgarh",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
  {
    "id": "DEMO-TL-085",
    "entityType": "challenge",
    "entityId": "DEMO-CH-043",
    "action": "submitted",
    "actor": "Citizen Group (Simdega)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Rapid rotting and fungal mold spoilage in harvested Mahua flowers during humid monsoon transition",
    "timestamp": daysAgo(23)
  },
  {
    "id": "DEMO-TL-086",
    "entityType": "challenge",
    "entityId": "DEMO-CH-043",
    "action": "status_changed",
    "actor": "Shri Ajay Kumar Singh, DC Simdega",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(13)
  },
  {
    "id": "DEMO-TL-087",
    "entityType": "challenge",
    "entityId": "DEMO-CH-044",
    "action": "submitted",
    "actor": "Citizen Group (Lohardaga)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Acidic red soil phosphorus fixation reducing maize and mustard crop yields in Asur plateau villages",
    "timestamp": daysAgo(24)
  },
  {
    "id": "DEMO-TL-088",
    "entityType": "challenge",
    "entityId": "DEMO-CH-044",
    "action": "status_changed",
    "actor": "Dr. Waghmare Prasad Krishna, DC Lohardaga",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(14)
  },
  {
    "id": "DEMO-TL-089",
    "entityType": "challenge",
    "entityId": "DEMO-CH-045",
    "action": "submitted",
    "actor": "Citizen Group (Dumka)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Unregulated stone quarry blasting dust suppressing Mulberry leaf yield and destroying Tussar silkworm farming",
    "timestamp": daysAgo(25)
  },
  {
    "id": "DEMO-TL-090",
    "entityType": "challenge",
    "entityId": "DEMO-CH-045",
    "action": "status_changed",
    "actor": "Shri Ameet Kumar, DC Dumka",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(15)
  },
  {
    "id": "DEMO-TL-091",
    "entityType": "challenge",
    "entityId": "DEMO-CH-046",
    "action": "submitted",
    "actor": "Citizen Group (Godda)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: High groundwater boron levels affecting wheat crop germination and drinking water quality",
    "timestamp": daysAgo(26)
  },
  {
    "id": "DEMO-TL-092",
    "entityType": "challenge",
    "entityId": "DEMO-CH-046",
    "action": "status_changed",
    "actor": "Shri Zeeshan Qamar, DC Godda",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(16)
  },
  {
    "id": "DEMO-TL-093",
    "entityType": "challenge",
    "entityId": "DEMO-CH-047",
    "action": "submitted",
    "actor": "Citizen Group (Pakur)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Groundwater fluoride and heavy iron precipitate poisoning deep tube wells in tribal hamlets",
    "timestamp": daysAgo(27)
  },
  {
    "id": "DEMO-TL-094",
    "entityType": "challenge",
    "entityId": "DEMO-CH-047",
    "action": "status_changed",
    "actor": "Shri Mrityunjay Kumar Baranwal, DC Pakur",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(17)
  },
  {
    "id": "DEMO-TL-095",
    "entityType": "challenge",
    "entityId": "DEMO-CH-048",
    "action": "submitted",
    "actor": "Citizen Group (Jamtara)",
    "actorRole": "Citizen",
    "description": "Grievance submitted: Heavy soil lateritization and low water retention stunting cashew and fruit sapling survival in dry tracts",
    "timestamp": daysAgo(28)
  },
  {
    "id": "DEMO-TL-096",
    "entityType": "challenge",
    "entityId": "DEMO-CH-048",
    "action": "status_changed",
    "actor": "Shri Faiz Aq Ahmed Mumtaz, DC Jamtara",
    "actorRole": "Government Department",
    "description": "Government validated and approved for university research prototype",
    "previousValue": "Under Review",
    "newValue": "Government Validated",
    "timestamp": daysAgo(12)
  },
];

export const createSeedData = (): WorkflowState => ({
  challenges: SEED_CHALLENGES,
  projects: SEED_PROJECTS,
  proposals: SEED_PROPOSALS,
  timelineEvents: SEED_TIMELINE,
  lastUpdated: new Date().toISOString(),
});
