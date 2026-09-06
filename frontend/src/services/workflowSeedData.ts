// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Demo Seed Data (SIH 26043)
// Realistic Jharkhand-specific challenges and projects at various lifecycle
// stages. Used by workflowStore.seedDemoDataIfEmpty().
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Challenge,
  Project,
  Proposal,
  TimelineEvent,
  WorkflowState,
} from './workflowTypes';

// ── Helper: generate timestamps relative to "now" ────────────────────────────
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

// ── Seed Challenges ──────────────────────────────────────────────────────────

const SEED_CHALLENGES: Challenge[] = [
  // 1. Brand-new submission — just arrived
  {
    id: 'DEMO-CH-001',
    reportId: 'NIV-2026-0001',
    title: 'Severe heat stroke risk among brick kiln workers in Jharia',
    description: 'Over 200 brick kiln workers in Jharia industrial belt are exposed to extreme heat (48°C+) without shade, hydration stations or emergency medical kits. Three hospitalisations reported in the last week alone. Community leaders requesting urgent government intervention.',
    district: 'Dhanbad',
    block: 'Jharia',
    village: 'Kusunda',
    locationCoords: { lat: 23.7460, lng: 86.4132 },
    formattedAddress: 'Jharia Industrial Belt, Kusunda, Dhanbad, Jharkhand',
    status: 'Submitted',
    stageNumber: 1,
    stageName: 'Stage 1: Citizen Submission',
    category: 'Occupational Health & Industrial Safety',
    aiAnalysis: {
      category: 'Occupational Health & Industrial Safety',
      categoryCode: 'GOV-OHS',
      matchedProblem: 'Heat stroke risk in industrial zones',
      confidenceScore: 94,
      priorityScore: 78,
      riskLevel: 'HIGH',
      factors: {
        populationImpact:          { score: 18, max: 25, reason: '200+ workers directly affected in active employment zone' },
        economicLifeSaving:        { score: 20, max: 25, reason: 'High heat exhaustion risk with active medical hospitalisations' },
        resolutionCostFeasibility: { score: 22, max: 25, reason: 'Turnkey low-cost misting/shade stations deployable within 48 hrs' },
        hazardUrgency:             { score: 18, max: 25, reason: '48°C peak temperatures ongoing; immediate emergency relief needed' },
      },
      reasoning: 'High-urgency occupational hazard with active medical incidents. Temperature extremes combined with lack of protective infrastructure create immediate life-safety risk.',
      needsHumanVerification: false,
      recommendedUniversityDepts: ['Environmental Science', 'Occupational Health', 'Public Health Engineering'],
    },
    priorityScore: 78,
    confidenceScore: 94,
    riskLevel: 'HIGH',
    evidenceUrls: [],
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },

  // 2. Under Review — AI triaged, awaiting govt
  {
    id: 'DEMO-CH-002',
    reportId: 'NIV-2026-0002',
    title: 'Road collapse and sinkhole near Ramgarh–Hazaribagh NH connecting bridge',
    description: 'A 15-metre section of NH-33 near the Ramgarh bypass has collapsed due to heavy monsoon runoff, creating a sinkhole. Vehicles are diverting through unpaved village roads causing dust pollution and accidents. Three minor accidents reported. PWD has not responded in 4 days.',
    district: 'Ramgarh',
    block: 'Ramgarh',
    village: 'Patratu',
    locationCoords: { lat: 23.6316, lng: 85.5230 },
    formattedAddress: 'NH-33 Bypass, Patratu, Ramgarh, Jharkhand',
    status: 'Under Review',
    stageNumber: 2,
    stageName: 'Stage 2: AI Triage Complete — Awaiting Government Review',
    category: 'Road Infrastructure & Transport Safety',
    aiAnalysis: {
      category: 'Road Infrastructure & Transport Safety',
      categoryCode: 'GOV-ROAD',
      matchedProblem: 'Road collapse / sinkhole on national highway',
      confidenceScore: 97,
      priorityScore: 88,
      riskLevel: 'CRITICAL',
      factors: {
        populationImpact:          { score: 22, max: 25, reason: 'NH-33 serves 50,000+ daily commuters between Ramgarh and Hazaribagh' },
        economicLifeSaving:        { score: 24, max: 25, reason: 'Critical arterial transport and economic corridor protected' },
        resolutionCostFeasibility: { score: 18, max: 25, reason: 'Structural culvert reinforcement and rapid asphalt paving required' },
        hazardUrgency:             { score: 24, max: 25, reason: 'Active sinkhole with ongoing vehicle diversions and accident reports' },
      },
      reasoning: 'Critical infrastructure failure on a national highway with immediate safety implications. Spatial recurrence suggests underlying geological or drainage issues requiring engineering investigation.',
      needsHumanVerification: false,
      recommendedUniversityDepts: ['Civil Engineering', 'Geotechnical Engineering', 'Remote Sensing & GIS'],
    },
    priorityScore: 88,
    confidenceScore: 97,
    riskLevel: 'CRITICAL',
    evidenceUrls: [],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },

  // 3. Government Validated — queued for HEI matching
  {
    id: 'DEMO-CH-003',
    reportId: 'NIV-2026-0003',
    title: 'Chronic drainage flooding in Kanke Block during monsoon season',
    description: 'Kanke Block residential areas face annual flooding due to blocked storm drains and inadequate drainage infrastructure. 1,200+ households affected. Stagnant water leads to dengue outbreaks every year. The drainage system was last maintained in 2018.',
    district: 'Ranchi',
    block: 'Kanke',
    village: 'Kanke',
    locationCoords: { lat: 23.4031, lng: 85.3208 },
    formattedAddress: 'Kanke Block, Ranchi, Jharkhand',
    status: 'Government Validated',
    stageNumber: 3,
    stageName: 'Stage 3: Government Validated & Prioritized',
    category: 'Flood Management & Drainage Infrastructure',
    aiAnalysis: {
      category: 'Flood Management & Drainage Infrastructure',
      categoryCode: 'GOV-FLOOD',
      matchedProblem: 'Urban drainage flooding',
      confidenceScore: 96,
      priorityScore: 91,
      riskLevel: 'CRITICAL',
      factors: {
        populationImpact:          { score: 24, max: 25, reason: '1,200+ households directly affected annually' },
        economicLifeSaving:        { score: 23, max: 25, reason: 'Residential property loss prevention & dengue epidemic containment' },
        resolutionCostFeasibility: { score: 21, max: 25, reason: 'Modular de-siltation & IoT water-level sensor telemetry under ₹3.5L' },
        hazardUrgency:             { score: 23, max: 25, reason: 'Active monsoon season with continuous water ingress' },
      },
      reasoning: 'Highest priority challenge. Chronic, recurring, affecting 1,200+ households with compounding public health risks. Government validation confirms severity.',
      needsHumanVerification: false,
      recommendedUniversityDepts: ['Civil Engineering', 'Environmental Engineering', 'Remote Sensing & GIS', 'Urban Planning'],
    },
    priorityScore: 91,
    confidenceScore: 96,
    riskLevel: 'CRITICAL',
    evidenceUrls: [],
    govtOfficerNote: 'Validated by District Collector Office. Site inspection confirms drainage infrastructure failure. Priority clearance for HEI matching.',
    govtValidatedBy: 'Shri Rajesh Kumar, SDO Kanke',
    govtValidatedAt: daysAgo(5),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
  },

  // 4. University Accepted — project created, team formed
  {
    id: 'DEMO-CH-004',
    reportId: 'NIV-2026-0004',
    title: 'Elephant corridor damage and crop raiding in Daltongunj forest fringe',
    description: 'Elephant herds from Betla National Park are increasingly entering agricultural zones near Daltongunj due to corridor fragmentation. 80+ farming families affected. Crop damage estimated at ₹18 lakh this season. Two near-fatal encounters reported.',
    district: 'Palamu',
    block: 'Daltonganj',
    village: 'Betla',
    locationCoords: { lat: 23.8731, lng: 84.0640 },
    formattedAddress: 'Betla Forest Fringe, Daltonganj, Palamu, Jharkhand',
    status: 'In Progress',
    stageNumber: 8,
    stageName: 'Stage 8: Team Formation & Project Initiation',
    category: 'Wildlife Conservation & Human-Animal Conflict',
    aiAnalysis: {
      category: 'Wildlife Conservation & Human-Animal Conflict',
      categoryCode: 'GOV-WILD',
      matchedProblem: 'Elephant corridor fragmentation and crop raiding',
      confidenceScore: 95,
      priorityScore: 85,
      riskLevel: 'HIGH',
      factors: {
        populationImpact:          { score: 20, max: 25, reason: '80+ farming families with crop losses' },
        economicLifeSaving:        { score: 22, max: 25, reason: 'Preservation of ₹18L+ seasonal crop yield and human life safety' },
        resolutionCostFeasibility: { score: 21, max: 25, reason: 'Solar-powered acoustic/seismic perimeter early-warning sensors' },
        hazardUrgency:             { score: 22, max: 25, reason: 'Near-fatal human-elephant encounters reported in active season' },
      },
      reasoning: 'Critical human-animal conflict with economic losses and life-safety risk. Requires multidisciplinary solution spanning wildlife ecology, IoT sensors, and community engagement.',
      needsHumanVerification: false,
      recommendedUniversityDepts: ['Forestry & Wildlife Science', 'Remote Sensing & GIS', 'Electronics & IoT', 'Agronomy'],
    },
    priorityScore: 85,
    confidenceScore: 95,
    riskLevel: 'HIGH',
    evidenceUrls: [],
    govtOfficerNote: 'Accepted by BIT Sindri. Multidisciplinary R&D team assigned from Forestry and Electronics departments.',
    govtValidatedBy: 'Shri Anand Prakash, DFO Palamu',
    govtValidatedAt: daysAgo(18),
    assignedHEI: 'BIT Sindri',
    assignedDept: 'Forestry & Wildlife Science',
    assignedProjectId: 'DEMO-PRJ-001',
    createdAt: daysAgo(22),
    updatedAt: daysAgo(3),
  },

  // 5. Prototype Active — full project with proposal submitted
  {
    id: 'DEMO-CH-005',
    reportId: 'NIV-2026-0005',
    title: 'Handpump arsenic contamination in 12 villages of Giridih district',
    description: 'Water quality testing by PHED reveals arsenic levels 3x above WHO safe limits in handpumps across 12 villages in Giridih. Approximately 8,000 residents rely on these handpumps as their primary drinking water source. Cases of arsenicosis skin lesions reported at PHC.',
    district: 'Giridih',
    block: 'Giridih',
    village: 'Multiple (12 villages)',
    locationCoords: { lat: 24.1882, lng: 86.2994 },
    formattedAddress: 'Giridih Block, Giridih District, Jharkhand',
    status: 'Prototype Active',
    stageNumber: 11,
    stageName: 'Stage 11: Prototype Development & Testing',
    category: 'Drinking Water Quality & Contamination',
    aiAnalysis: {
      category: 'Drinking Water Quality & Contamination',
      categoryCode: 'GOV-WATER',
      matchedProblem: 'Arsenic contamination in drinking water',
      confidenceScore: 99,
      priorityScore: 95,
      riskLevel: 'CRITICAL',
      factors: {
        populationImpact:          { score: 25, max: 25, reason: '8,000+ residents across 12 villages dependent on contaminated source' },
        economicLifeSaving:        { score: 25, max: 25, reason: 'Arsenicosis morbidity prevention & clean drinking water protection' },
        resolutionCostFeasibility: { score: 20, max: 25, reason: 'Low-cost nano-adsorbent filter cartridge retrofit per handpump' },
        hazardUrgency:             { score: 25, max: 25, reason: 'Active toxicity at 3x WHO threshold with chronic health damage' },
      },
      reasoning: 'Maximum severity. Active poisoning of 8,000+ people. Requires immediate filtration solution and long-term groundwater remediation.',
      needsHumanVerification: false,
      recommendedUniversityDepts: ['Environmental Engineering', 'Chemistry', 'Public Health', 'Biotechnology'],
    },
    priorityScore: 95,
    confidenceScore: 99,
    riskLevel: 'CRITICAL',
    evidenceUrls: [],
    govtOfficerNote: 'IIT (ISM) Dhanbad team has developed low-cost arsenic filtration prototype. Lab testing complete. Preparing for field pilot in 3 villages.',
    govtValidatedBy: 'Shri Vikram Singh, DC Giridih',
    govtValidatedAt: daysAgo(35),
    assignedHEI: 'IIT (ISM) Dhanbad',
    assignedDept: 'Environmental Engineering',
    assignedProjectId: 'DEMO-PRJ-002',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(1),
  },
];

// ── Seed Projects ────────────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  // Project for CH-004: Elephant corridor
  {
    id: 'DEMO-PRJ-001',
    challengeId: 'DEMO-CH-004',
    challengeTitle: 'Elephant corridor damage and crop raiding in Daltongunj forest fringe',
    category: 'Wildlife Conservation & Human-Animal Conflict',
    district: 'Palamu',
    universityId: 'BIT-SINDRI',
    universityName: 'BIT Sindri',
    facultyMentorName: 'Dr. Priya Sharma',
    facultyEmail: 'priya.sharma@bitsindri.ac.in',
    teamMembers: [
      { id: 'TM-001', name: 'Aditya Kumar', departmentName: 'Forestry & Wildlife Science', role: 'Team Lead', skills: ['Wildlife tracking', 'GIS mapping', 'Field surveys'] },
      { id: 'TM-002', name: 'Sneha Mishra', departmentName: 'Electronics & Communication', role: 'IoT Developer', skills: ['Arduino', 'LoRa sensors', 'Embedded systems'] },
      { id: 'TM-003', name: 'Rahul Oraon', departmentName: 'Computer Science', role: 'ML Engineer', skills: ['Python', 'Image classification', 'Edge computing'] },
      { id: 'TM-004', name: 'Meena Tirkey', departmentName: 'Agronomy', role: 'Community Liaison', skills: ['Agriculture extension', 'Tribal community engagement', 'Hindi/Mundari'] },
    ],
    status: 'Team Formed',
    milestones: [
      { id: 'MS-001', stageNumber: 1, title: 'Literature Review & Site Survey', description: 'Conduct field survey of elephant corridor and affected agricultural zones', status: 'Completed', targetDays: 14, completedAt: daysAgo(10) },
      { id: 'MS-002', stageNumber: 2, title: 'IoT Sensor Network Design', description: 'Design LoRa-based seismic/acoustic sensor array for elephant movement detection', status: 'In Progress', targetDays: 21 },
      { id: 'MS-003', stageNumber: 3, title: 'ML Model Training', description: 'Train image/acoustic classifier to distinguish elephant movement from other wildlife', status: 'Pending', targetDays: 28 },
      { id: 'MS-004', stageNumber: 4, title: 'Community Alert System', description: 'Build SMS/speaker alert system integrated with sensor network', status: 'Pending', targetDays: 14 },
      { id: 'MS-005', stageNumber: 5, title: 'Field Pilot Deployment', description: 'Deploy prototype in 2 villages along Betla corridor', status: 'Pending', targetDays: 21 },
    ],
    proposals: [],
    budgetEstimated: 285000,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(3),
  },

  // Project for CH-005: Arsenic filtration
  {
    id: 'DEMO-PRJ-002',
    challengeId: 'DEMO-CH-005',
    challengeTitle: 'Handpump arsenic contamination in 12 villages of Giridih district',
    category: 'Drinking Water Quality & Contamination',
    district: 'Giridih',
    universityId: 'IIT-ISM-DHANBAD',
    universityName: 'IIT (ISM) Dhanbad',
    facultyMentorName: 'Prof. Ankit Verma',
    facultyEmail: 'ankit.verma@iitism.ac.in',
    teamMembers: [
      { id: 'TM-005', name: 'Deepak Sahu', departmentName: 'Environmental Engineering', role: 'Team Lead', skills: ['Water treatment', 'Filtration systems', 'Chemical analysis'] },
      { id: 'TM-006', name: 'Kavita Singh', departmentName: 'Chemistry', role: 'Materials Researcher', skills: ['Nanomaterials', 'Iron-based adsorbents', 'Lab protocols'] },
      { id: 'TM-007', name: 'Arjun Mahto', departmentName: 'Mechanical Engineering', role: 'Product Designer', skills: ['CAD/CAM', '3D printing', 'Manufacturing design'] },
      { id: 'TM-008', name: 'Ritu Kumari', departmentName: 'Biotechnology', role: 'Bioremediation Specialist', skills: ['Phytoremediation', 'Soil microbiology', 'Field sampling'] },
      { id: 'TM-009', name: 'Vikash Prasad', departmentName: 'Computer Science', role: 'Data Analyst', skills: ['Python', 'Water quality monitoring dashboards', 'IoT data logging'] },
    ],
    status: 'Prototype Active',
    milestones: [
      { id: 'MS-006', stageNumber: 1, title: 'Water Quality Baseline Assessment', description: 'Sample and test arsenic levels across all 12 village handpumps', status: 'Completed', targetDays: 10, completedAt: daysAgo(28) },
      { id: 'MS-007', stageNumber: 2, title: 'Filter Media Development', description: 'Develop iron oxide nanoparticle-based filtration media', status: 'Completed', targetDays: 21, completedAt: daysAgo(14) },
      { id: 'MS-008', stageNumber: 3, title: 'Prototype Assembly', description: 'Build low-cost filtration unit using locally available materials', status: 'Completed', targetDays: 14, completedAt: daysAgo(5) },
      { id: 'MS-009', stageNumber: 4, title: 'Lab Performance Testing', description: 'Test filtration efficiency, flow rate, and media lifespan in controlled lab conditions', status: 'In Progress', targetDays: 14 },
      { id: 'MS-010', stageNumber: 5, title: 'Field Pilot (3 villages)', description: 'Deploy filtration units in 3 pilot villages and monitor arsenic levels for 4 weeks', status: 'Pending', targetDays: 28 },
      { id: 'MS-011', stageNumber: 6, title: 'Scale-up & Deployment Plan', description: 'Finalise manufacturing BOM, cost optimisation, and deployment plan for remaining 9 villages', status: 'Pending', targetDays: 21 },
    ],
    proposals: [],
    budgetEstimated: 520000,
    budgetApproved: 480000,
    createdAt: daysAgo(32),
    updatedAt: daysAgo(1),
  },
];

// ── Seed Proposals ───────────────────────────────────────────────────────────

const SEED_PROPOSALS: Proposal[] = [
  {
    id: 'DEMO-PROP-001',
    projectId: 'DEMO-PRJ-002',
    title: 'Low-Cost Iron Oxide Nanoparticle Arsenic Filtration System for Rural Jharkhand',
    description: 'A gravity-fed, maintenance-minimal arsenic removal system using locally synthesised iron oxide nanoparticle media, designed for direct attachment to existing India Mark II handpumps.',
    approach: 'Phase 1: Synthesise FeOOH nanoparticle adsorbent from locally available ferric chloride. Phase 2: Design gravity-fed filter cartridge compatible with India Mark II handpump outlets. Phase 3: Lab validation targeting <10 ppb arsenic in treated water. Phase 4: Deploy in 3 pilot villages with IoT-monitored water quality sensors. Phase 5: Community training on filter maintenance and replacement schedule.',
    estimatedBudget: 480000,
    estimatedTimeline: '16 weeks',
    status: 'Approved',
    submittedBy: 'Deepak Sahu (Team Lead)',
    submittedAt: daysAgo(20),
    reviewNote: 'Approved by faculty mentor and district administration. CSR funding confirmed from Tata Steel Foundation for pilot phase.',
  },
];

// ── Seed Timeline Events ─────────────────────────────────────────────────────

const SEED_TIMELINE: TimelineEvent[] = [
  // CH-001 events
  { id: 'DEMO-TL-001', entityType: 'challenge', entityId: 'DEMO-CH-001', action: 'submitted', actor: 'Anonymous Citizen', actorRole: 'Citizen', description: 'Challenge submitted from Jharia industrial belt', timestamp: hoursAgo(3) },

  // CH-002 events
  { id: 'DEMO-TL-002', entityType: 'challenge', entityId: 'DEMO-CH-002', action: 'submitted', actor: 'Ravi Sharma', actorRole: 'Citizen', description: 'Challenge submitted: Road collapse on NH-33', timestamp: daysAgo(2) },
  { id: 'DEMO-TL-003', entityType: 'challenge', entityId: 'DEMO-CH-002', action: 'ai_triage_complete', actor: 'Nivaaran AI Engine', actorRole: 'System', description: 'AI triage complete — classified as CRITICAL (score 88). Category: Road Infrastructure.', timestamp: daysAgo(2) },

  // CH-003 events
  { id: 'DEMO-TL-004', entityType: 'challenge', entityId: 'DEMO-CH-003', action: 'submitted', actor: 'Kanke Ward Councillor', actorRole: 'Citizen', description: 'Challenge submitted: Chronic drainage flooding in Kanke Block', timestamp: daysAgo(10) },
  { id: 'DEMO-TL-005', entityType: 'challenge', entityId: 'DEMO-CH-003', action: 'status_changed', actor: 'Shri Rajesh Kumar, SDO Kanke', actorRole: 'Government Department', description: 'Government validated. Site inspection confirms drainage infrastructure failure.', previousValue: 'Under Review', newValue: 'Government Validated', timestamp: daysAgo(5) },

  // CH-004 events
  { id: 'DEMO-TL-006', entityType: 'challenge', entityId: 'DEMO-CH-004', action: 'submitted', actor: 'Betla Forest Committee', actorRole: 'Citizen', description: 'Challenge submitted: Elephant corridor damage in Daltongunj', timestamp: daysAgo(22) },
  { id: 'DEMO-TL-007', entityType: 'challenge', entityId: 'DEMO-CH-004', action: 'status_changed', actor: 'Shri Anand Prakash, DFO Palamu', actorRole: 'Government Department', description: 'Government validated after joint inspection with forest department', previousValue: 'Under Review', newValue: 'Government Validated', timestamp: daysAgo(18) },
  { id: 'DEMO-TL-008', entityType: 'challenge', entityId: 'DEMO-CH-004', action: 'hei_matched', actor: 'Nivaaran HEI Matching Engine', actorRole: 'System', description: 'Matched to BIT Sindri (Forestry & Wildlife Science) — match score 87/100', timestamp: daysAgo(16) },
  { id: 'DEMO-TL-009', entityType: 'challenge', entityId: 'DEMO-CH-004', action: 'status_changed', actor: 'Dr. Priya Sharma, BIT Sindri', actorRole: 'Faculty / Mentor', description: 'University accepted challenge. Multidisciplinary team formation initiated.', previousValue: 'HEI Matched', newValue: 'In Progress', timestamp: daysAgo(15) },
  { id: 'DEMO-TL-010', entityType: 'project',   entityId: 'DEMO-PRJ-001', action: 'created', actor: 'Dr. Priya Sharma', actorRole: 'Faculty / Mentor', description: 'Project created from accepted challenge', timestamp: daysAgo(15) },
  { id: 'DEMO-TL-011', entityType: 'project',   entityId: 'DEMO-PRJ-001', action: 'team_formed', actor: 'Dr. Priya Sharma', actorRole: 'Faculty / Mentor', description: 'Multidisciplinary team of 4 members assembled from Forestry, Electronics, CS, and Agronomy', timestamp: daysAgo(14) },
  { id: 'DEMO-TL-012', entityType: 'milestone', entityId: 'MS-001',       action: 'completed', actor: 'Aditya Kumar', actorRole: 'Student', description: 'Literature review and site survey completed', timestamp: daysAgo(10) },

  // CH-005 events
  { id: 'DEMO-TL-013', entityType: 'challenge', entityId: 'DEMO-CH-005', action: 'submitted', actor: 'Giridih PHED Office', actorRole: 'Citizen', description: 'Challenge submitted: Arsenic contamination in 12 villages', timestamp: daysAgo(40) },
  { id: 'DEMO-TL-014', entityType: 'challenge', entityId: 'DEMO-CH-005', action: 'status_changed', actor: 'Shri Vikram Singh, DC Giridih', actorRole: 'Government Department', description: 'Government validated. PHED lab reports confirm arsenic levels 3x WHO limits.', previousValue: 'Under Review', newValue: 'Government Validated', timestamp: daysAgo(35) },
  { id: 'DEMO-TL-015', entityType: 'challenge', entityId: 'DEMO-CH-005', action: 'status_changed', actor: 'Prof. Ankit Verma, IIT(ISM)', actorRole: 'Faculty / Mentor', description: 'IIT (ISM) Dhanbad accepted. Environmental Engineering dept lead.', previousValue: 'HEI Matched', newValue: 'In Progress', timestamp: daysAgo(32) },
  { id: 'DEMO-TL-016', entityType: 'project',   entityId: 'DEMO-PRJ-002', action: 'created', actor: 'Prof. Ankit Verma', actorRole: 'Faculty / Mentor', description: 'Project created for arsenic filtration solution', timestamp: daysAgo(32) },
  { id: 'DEMO-TL-017', entityType: 'proposal',  entityId: 'DEMO-PROP-001', action: 'submitted', actor: 'Deepak Sahu', actorRole: 'Student', description: 'Solution proposal submitted: Iron oxide nanoparticle filtration system', timestamp: daysAgo(20) },
  { id: 'DEMO-TL-018', entityType: 'proposal',  entityId: 'DEMO-PROP-001', action: 'approved', actor: 'Prof. Ankit Verma', actorRole: 'Faculty / Mentor', description: 'Proposal approved. CSR funding confirmed for pilot phase.', timestamp: daysAgo(18) },
  { id: 'DEMO-TL-019', entityType: 'milestone', entityId: 'MS-008',       action: 'completed', actor: 'Arjun Mahto', actorRole: 'Student', description: 'Prototype filtration unit assembled and ready for lab testing', timestamp: daysAgo(5) },
  { id: 'DEMO-TL-020', entityType: 'challenge', entityId: 'DEMO-CH-005', action: 'status_changed', actor: 'System', actorRole: 'System', description: 'Challenge advanced to Prototype Active stage', previousValue: 'In Progress', newValue: 'Prototype Active', timestamp: daysAgo(5) },
];


// ── Export full seed state ───────────────────────────────────────────────────

export const createSeedData = (): WorkflowState => ({
  challenges: SEED_CHALLENGES,
  projects: SEED_PROJECTS,
  proposals: SEED_PROPOSALS,
  timelineEvents: SEED_TIMELINE,
  lastUpdated: new Date().toISOString(),
});
