import { PrismaClient, ChallengeStatus, UserRole, OrgType } from '@prisma/client';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();

// ── Demo users with multi-role assignments ──────────────────────────────────

export const DEMO_USERS = [
  {
    id: 'demo-citizen',
    firebase_uid: 'demo-citizen',
    name: 'Riya Devi',
    email: 'riya@jhar.example',
    phone: '+919876543210',
    roles: [UserRole.CITIZEN],
    organization_id: null,
  },
  {
    id: 'demo-validator',
    firebase_uid: 'demo-validator',
    name: 'Officer Meena Sharma',
    email: 'meena@gov.example',
    phone: '+919876543211',
    roles: [UserRole.GOV_VALIDATOR],
    organization_id: 'gov-ranchi-urban',
  },
  {
    id: 'demo-department',
    firebase_uid: 'demo-department',
    name: 'Dept. Officer Singh',
    email: 'singh@gov.example',
    phone: '+919876543212',
    roles: [UserRole.GOV_DEPARTMENT],
    organization_id: 'gov-ranchi-urban',
  },
  {
    id: 'demo-university',
    firebase_uid: 'demo-university',
    name: 'University Admin',
    email: 'admin@bitm.ac.in',
    phone: '+919876543213',
    roles: [UserRole.UNIVERSITY],
    organization_id: 'org-bitm',
  },
  {
    id: 'demo-faculty',
    firebase_uid: 'demo-faculty',
    name: 'Prof. A. Kumar',
    email: 'akumar@bitm.ac.in',
    phone: '+919876543214',
    roles: [UserRole.FACULTY],
    organization_id: 'org-bitm',
  },
  {
    id: 'demo-student1',
    firebase_uid: 'demo-student1',
    name: 'Priya Singh',
    email: 'priya.singh@bitm.ac.in',
    phone: '+919876543215',
    roles: [UserRole.STUDENT],
    organization_id: 'org-bitm',
  },
  {
    id: 'demo-student2',
    firebase_uid: 'demo-student2',
    name: 'Rahul Verma',
    email: 'rahul.verma@bitm.ac.in',
    phone: '+919876543216',
    roles: [UserRole.STUDENT],
    organization_id: 'org-bitm',
  },
  {
    id: 'demo-student3',
    firebase_uid: 'demo-student3',
    name: 'Anita Yadav',
    email: 'anita.yadav@bitm.ac.in',
    phone: '+919876543217',
    roles: [UserRole.STUDENT],
    organization_id: 'org-bitm',
  },
  {
    id: 'demo-industry',
    firebase_uid: 'demo-industry',
    name: 'CSR Head - Tata Steel Foundation',
    email: 'csr@tatasteel.com',
    phone: '+919876543218',
    roles: [UserRole.INDUSTRY, UserRole.CSR],
    organization_id: 'org-tata-csr',
  },
];

// ── Organizations ───────────────────────────────────────────────────────────

export const DEMO_ORGS = [
  {
    id: 'org-bitm',
    name: 'BIT Mesra',
    type: OrgType.UNIVERSITY,
    short_code: 'BITM',
    verified: true,
    contact_email: 'contact@bitm.ac.in',
  },
  {
    id: 'org-tata-csr',
    name: 'Tata Steel Foundation',
    type: OrgType.CSR,
    short_code: 'TSF',
    verified: true,
    contact_email: 'csr@tatasteel.com',
  },
  {
    id: 'gov-ranchi-urban',
    name: 'Ranchi Municipal Corporation',
    type: OrgType.GOVT_DEPARTMENT,
    short_code: 'RMC',
    verified: true,
    contact_email: 'ranchi@gov.in',
  },
];

// ── Universities ────────────────────────────────────────────────────────────

const DEMO_UNIVERSITIES = [
  {
    id: 'uni-bitm',
    organization_id: 'org-bitm',
    name: 'Birla Institute of Technology, Mesra',
    code: 'BITM',
    district: 'RANCHI',
    city: 'Ranchi',
    address: 'Mesra, Ranchi, Jharkhand 835215',
    website: 'https://www.bitm.ac.in',
    established_year: 1964,
    naac_grade: 'A+',
    accreditation: 'NAAC A+',
    capacity: 5,
    description: 'Premier engineering institute with strong civil engineering and IoT labs.',
    facilities: [
      { kind: 'LAB', name: 'IoT & Sensors Lab', note: 'Water level sensors, telemetry' },
      { kind: 'LAB', name: 'Civil Engineering Lab', note: 'Hydraulic modeling' },
      { kind: 'FACILITY', name: 'Innovation Center', note: 'Student startups' },
    ],
  },
];

// ── Departments ─────────────────────────────────────────────────────────────

const DEMO_DEPARTMENTS = [
  {
    id: 'dept-bitm-civil',
    organization_id: 'org-bitm',
    university_id: 'uni-bitm',
    name: 'Civil Engineering Department',
    focus_area: 'Hydraulics, Urban Water Management, Disaster Mitigation',
  },
  {
    id: 'dept-bitm-eee',
    organization_id: 'org-bitm',
    university_id: 'uni-bitm',
    name: 'Electrical & Electronics Engineering',
    focus_area: 'IoT Systems, Embedded Sensors, Telemetry',
  },
];

// ── The flagship flood challenge ──────────────────────────────────────────────

const FLOOD_CHALLENGE = {
  id: 'flood-ranchi-2026',
  title: 'Monsoon Waterlogging in Ranchi Kanke/Harmu',
  description:
    'Recurring monsoon waterlogging affects 2000+ households across Kanke and Harmu wards. ' +
    'Standing water of 30-60cm blocks access to 3 government schools and causes road disruptions. ' +
    'Primary causes: inadequate drainage capacity, clogged drains, and insufficient stormwater outlets. ' +
    'Affected areas: Ward 12 (Kanke), Ward 18 (Harmu), Ward 24 (Kanpachar).',
  category: 'INFRASTRUCTURE',
  sub_category: 'URBAN_DRAINAGE',
  district_code: 'RANCHI',
  block_code: 'RANCHI_KANKE',
  status: ChallengeStatus.VALIDATED,
  priority_score: 8.5,
  priority_factors: {
    urgency: 'HIGH',
    severity: 'HIGH',
    scale: 2000,
    publicGood: 'EDUCATION, HEALTH',
    reasons: [
      'Multiple schools cut off during monsoon',
      'Health risk: waterborne diseases',
      'Daily commuting disrupted for 2000+ households',
      'Road damage reported in 3 wards',
    ],
  },
  ai_summary:
    'AI analysis identifies recurring drainage bottleneck at Kanke-Harmu intersection. ' +
    'Historical data shows 5 years of similar complaints. Suggests infrastructure intervention over reactive measures.',
  ai_domain: 'URBAN_INFRASTRUCTURE',
  ai_sub_domain: 'WATER_MANAGEMENT',
  ai_tags: ['drainage', 'waterlogging', 'urban-infrastructure', 'monsoon', 'school-access'],
  ai_severity: 'HIGH',
  ai_urgency: 'HIGH',
  ai_confidence: 0.87,
};

// ── Evidence for the flood challenge ──────────────────────────────────────────

export const EVIDENCE = [
  {
    challenge_id: 'flood-ranchi-2026',
    type: 'PHOTO',
    storage_ref: 'gs://nivaaran-evidence/flood-2026/kanke-main-road.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 2456000,
    meta: {
      caption: 'Main road waterlogging at Kanke crossing',
      capturedAt: '2026-06-15T10:30:00Z',
      gps: { lat: 23.3685, lng: 85.3303 },
      device: 'OnePlus 11',
    },
    is_private: false,
    uploader_id: 'demo-citizen',
  },
  {
    challenge_id: 'flood-ranchi-2026',
    type: 'PHOTO',
    storage_ref: 'gs://nivaaran-evidence/flood-2026/school-entrance.jpg',
    mime_type: 'image/jpeg',
    size_bytes: 1890000,
    meta: {
      caption: 'School entrance blocked by water',
      capturedAt: '2026-06-15T08:15:00Z',
      gps: { lat: 23.3701, lng: 85.3289 },
      device: 'OnePlus 11',
    },
    is_private: false,
    uploader_id: 'demo-citizen',
  },
  {
    challenge_id: 'flood-ranchi-2026',
    type: 'DOCUMENT',
    storage_ref: 'gs://nivaaran-evidence/flood-2026/ward-committee-memo.pdf',
    mime_type: 'application/pdf',
    size_bytes: 156000,
    meta: {
      caption: 'Ward committee formal complaint memo',
      documentType: 'ward-committee-note',
      submittedBy: 'Ward Committee - Kanke',
    },
    is_private: false,
    uploader_id: 'demo-validator',
  },
];

// ── AI recommendations ──────────────────────────────────────────────────────

const AI_RECOMMENDATIONS = [
  {
    challenge_id: 'flood-ranchi-2026',
    kind: 'UNDERSTAND',
    status: 'SUCCEEDED',
    result: {
      summary: 'Recurring waterlogging pattern detected over 5 years.',
      rootCauses: [
        'Drainage capacity insufficient for peak monsoon runoff',
        'Multiple drain clogs reported in ward complaints',
        'No stormwater diversion infrastructure',
      ],
      recommendedActions: ['Drainage infrastructure upgrade', 'Regular maintenance schedule'],
      estimatedImpact: 'High - affects 2000+ households',
    },
    confidence: 0.89,
    reasons: [
      'Historical data shows 5 similar incidents',
      'Multiple citizen reports from same area',
      'Photo evidence confirms standing water depth',
    ],
    model_version: 'nivaaran-understand-v2.3',
    completed_at: new Date('2026-06-16T09:00:00Z'),
  },
  {
    challenge_id: 'flood-ranchi-2026',
    kind: 'PRIORITIZE',
    status: 'SUCCEEDED',
    result: {
      score: 8.5,
      factors: {
        publicGood: 9.0,
        severity: 8.5,
        urgency: 8.0,
        scale: 7.5,
      },
      tier: 'TIER_1',
      priority: 'HIGH',
    },
    confidence: 0.92,
    reasons: [
      'Affects school access (high publicGood)',
      'Multiple wards impacted (scale)',
      'Recurring issue (urgency)',
    ],
    model_version: 'nivaaran-prioritize-v1.8',
    completed_at: new Date('2026-06-16T09:05:00Z'),
  },
  {
    challenge_id: 'flood-ranchi-2026',
    kind: 'MATCH',
    status: 'SUCCEEDED',
    result: {
      matchedUniversities: [
        {
          university_id: 'uni-bitm',
          score: 0.91,
          reasons: [
            'Civil engineering dept has hydraulics expertise',
            'IoT lab can deploy water level sensors',
            'Location proximity (same district)',
          ],
        },
      ],
    },
    confidence: 0.91,
    reasons: [
      'BITM Civil Engineering has hydraulics research',
      'Proximity allows site visits',
      'IoT capability for monitoring solutions',
    ],
    model_version: 'nivaaran-match-v1.4',
    completed_at: new Date('2026-06-20T14:30:00Z'),
  },
];

// ── Cluster ─────────────────────────────────────────────────────────────────

const FLOOD_CLUSTER = {
  id: 'cluster-ranchi-drainage',
  label: 'Ranchi Urban Drainage',
  state: 'COMPLETED',
  members: ['flood-ranchi-2026'],
};

// ── Validation ──────────────────────────────────────────────────────────────

const VALIDATION = {
  challenge_id: 'flood-ranchi-2026',
  reviewer_id: 'demo-validator',
  decision: 'VALID',
  reason: 'Confirmed through on-site visit and ward committee memo.',
  supporting_note:
    'Visited Kanke crossing on 2026-06-17. Water depth verified at 45cm. ' +
    'Three schools in affected area. Drainage infrastructure requires upgrade.',
};

// ── University acceptance ───────────────────────────────────────────────────

const ACCEPTANCE = {
  challenge_id: 'flood-ranchi-2026',
  university_id: 'uni-bitm',
  decision: 'ACCEPTED',
  reason:
    'Our Civil Engineering and EEE departments have complementary expertise. ' +
    'Student team can deploy IoT monitoring and propose infrastructure solutions.',
  decided_by: 'demo-university',
};

// ── Project ─────────────────────────────────────────────────────────────────

const PROJECT = {
  id: 'proj-bitm-flood-monitor',
  challenge_id: 'flood-ranchi-2026',
  university_id: 'uni-bitm',
  status: 'ACTIVE',
  team_lead_id: 'demo-student1',
  proposal_title: 'IoT-Based Flood Monitoring & Drainage Optimization',
  proposal_abstract:
    'Deploy smart water level sensors across affected wards with real-time telemetry. ' +
    'Analyze data patterns to propose targeted infrastructure upgrades. ' +
    'Build a public dashboard for residents and municipal monitoring.',
  proposal_doc_ref: 'gs://nivaaran-proposals/bitm-flood-monitor-proposal.pdf',
};

// ── Team ────────────────────────────────────────────────────────────────────

const TEAM = {
  id: 'team-bitm-flood-monitor',
  project_id: 'proj-bitm-flood-monitor',
  name: 'FloodWatch BITM',
};

// ── Team Members ────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  {
    team_id: 'team-bitm-flood-monitor',
    user_id: 'demo-student1',
    role: 'lead',
    skills: ['civil-engineering', 'hydraulics', 'project-management'],
    is_mentor: false,
  },
  {
    team_id: 'team-bitm-flood-monitor',
    user_id: 'demo-student2',
    role: 'member',
    skills: ['iot', 'embedded-systems', 'sensors'],
    is_mentor: false,
  },
  {
    team_id: 'team-bitm-flood-monitor',
    user_id: 'demo-student3',
    role: 'member',
    skills: ['data-science', 'dashboarding', 'visualization'],
    is_mentor: false,
  },
  {
    team_id: 'team-bitm-flood-monitor',
    user_id: 'demo-faculty',
    role: 'mentor',
    skills: ['civil-engineering', 'hydraulics'],
    is_mentor: true,
  },
];

// ── Proposal ────────────────────────────────────────────────────────────────

const PROPOSAL = {
  id: 'proposal-bitm-flood-monitor',
  project_id: 'proj-bitm-flood-monitor',
  submitter_id: 'demo-student1',
  title: 'IoT-Based Flood Monitoring & Drainage Optimization',
  content_md:
    '# Project Proposal: FloodWatch BITM\n\n' +
    '## Problem\n' +
    'Monsoon waterlogging in Kanke and Harmu wards affects 2000+ households, ' +
    'blocks school access, and causes recurring road disruptions.\n\n' +
    '## Proposed Solution\n' +
    '1. Deploy 10 IoT water level sensors across affected wards\n' +
    '2. Real-time telemetry to cloud dashboard\n' +
    '3. Data-driven drainage optimization proposals\n' +
    '4. Public-facing monitoring portal\n\n' +
    '## Team\n' +
    '- Civil Engineering (2 students)\n' +
    '- EEE/IoT (1 student)\n' +
    '- Faculty mentor: Prof. A. Kumar\n\n' +
    '## Timeline\n' +
    'Phase 1 (2 months): Sensor deployment and baseline data\n' +
    'Phase 2 (3 months): Pattern analysis and proposals\n' +
    'Phase 3 (2 months): Municipal collaboration and pilot\n',
  status: 'APPROVED',
  reviewer_id: 'demo-department',
  review_notes: {
    technicalFeasibility: 9,
    publicImpact: 10,
    timelineRealistic: 8,
    comments: 'Strong proposal with clear methodology. Approved for prototype phase.',
  },
};

// ── Milestones ──────────────────────────────────────────────────────────────

const MILESTONES = [
  {
    project_id: 'proj-bitm-flood-monitor',
    title: 'Deploy 10 water level sensors',
    deliverable: 'Sensors installed and transmitting data',
    due_at: new Date('2026-08-01'),
    status: 'DONE',
    progress: 100,
    evidence_ref: 'gs://nivaaran-evidence/bitm-flood/sensor-deployment-20260801.jpg',
  },
  {
    project_id: 'proj-bitm-flood-monitor',
    title: 'Collect 30 days of baseline data',
    deliverable: 'Dataset with water level readings and patterns',
    due_at: new Date('2026-08-30'),
    status: 'IN_PROGRESS',
    progress: 65,
    evidence_ref: null,
  },
  {
    project_id: 'proj-bitm-flood-monitor',
    title: 'Submit drainage optimization proposal',
    deliverable: 'Technical proposal with specific interventions',
    due_at: new Date('2026-10-15'),
    status: 'NOT_STARTED',
    progress: 0,
    evidence_ref: null,
  },
  {
    project_id: 'proj-bitm-flood-monitor',
    title: 'Public dashboard launch',
    deliverable: 'Real-time water level dashboard for residents',
    due_at: new Date('2026-10-30'),
    status: 'NOT_STARTED',
    progress: 0,
    evidence_ref: null,
  },
];

// ── Collaborations ──────────────────────────────────────────────────────────

const COLLABORATIONS = [
  {
    project_id: 'proj-bitm-flood-monitor',
    offering_org_id: 'org-tata-csr',
    need: 'Funding for sensor deployment and pilot',
    form: 'FUNDING',
    acceptance_needed: true,
    status: 'OPEN',
  },
];

const OFFER = {
  collaboration_id: 'collab-tata-flood-monitor',
  offered_by_org: 'org-tata-csr',
  amount: 500000,
  in_kind: {
    equipment: '5 water level sensors from Tata Steel IoT unit',
    facilities: 'Access to monitoring dashboard infrastructure',
  },
  terms: 'Recognition in project documentation and public acknowledgment.',
  status: 'OPEN',
};

// ── Pilot ───────────────────────────────────────────────────────────────────

const PILOT = {
  project_id: 'proj-bitm-flood-monitor',
  university_id: 'uni-bitm',
  location: 'Kanke and Harmu wards, Ranchi',
  district_code: 'RANCHI',
  scope: '10 sensor deployment across 3 wards',
  metrics: {
    baselineWaterLevel: '30-60cm during peak monsoon',
    affectedHouseholds: 2000,
    schoolsAffected: 3,
    roadsBlocked: 5,
  },
  started_at: new Date('2026-08-01'),
};

// ── Deployment ──────────────────────────────────────────────────────────────

const DEPLOYMENT = {
  project_id: 'proj-bitm-flood-monitor',
  approved_by: 'demo-department',
  approval_ref: 'RMC/Approval/2026/0047',
  district_code: 'RANCHI',
  status: 'ACTIVE',
  started_at: new Date('2026-08-15'),
};

// ── Impact Records ──────────────────────────────────────────────────────────

const IMPACT_RECORDS = [
  {
    project_id: 'proj-bitm-flood-monitor',
    metric_name: 'Waterlogging detection time',
    metric_group: 'output',
    before_value: 0, // No system before
    after_value: 1, // Real-time monitoring
    units: 'hours-to-detection',
    beneficiaries: 2000,
    evidence_ref: 'gs://nivaaran-impact/bitm-flood/dashboard-screenshot-20260815.png',
    recorded_by: 'demo-student1',
    is_verified: false,
  },
  {
    project_id: 'proj-bitm-flood-monitor',
    metric_name: 'Households with real-time flood alerts',
    metric_group: 'outcome',
    before_value: 0,
    after_value: 500, // Early pilot phase
    units: 'households',
    beneficiaries: 500,
    evidence_ref: 'gs://nivaaran-impact/bitm-flood/user-signups-20260815.json',
    recorded_by: 'demo-student1',
    is_verified: false,
  },
];

// ── Audit Events ────────────────────────────────────────────────────────────

const AUDIT_EVENTS = [
  {
    actor_id: 'demo-citizen',
    actor_role: UserRole.CITIZEN,
    action: 'SUBMIT',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    to_state: 'SUBMITTED',
    payload_snapshot: { title: FLOOD_CHALLENGE.title },
    human_reason: 'Daily waterlogging blocking school route',
    created_at: new Date('2026-06-15T14:30:00Z'),
  },
  {
    actor_id: 'demo-citizen',
    actor_role: UserRole.CITIZEN,
    action: 'AI_UNDERSTAND',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'SUBMITTED',
    to_state: 'AI_UNDERSTANDING',
    created_at: new Date('2026-06-15T14:35:00Z'),
  },
  {
    actor_id: 'demo-validator',
    actor_role: UserRole.GOV_VALIDATOR,
    action: 'VALIDATE',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'VALIDATION_PENDING',
    to_state: 'VALIDATED',
    human_reason: 'On-site verification confirms',
    created_at: new Date('2026-06-17T11:00:00Z'),
  },
  {
    actor_id: 'demo-validator',
    actor_role: UserRole.GOV_VALIDATOR,
    action: 'PRIORITIZE',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    payload_snapshot: { priority_score: 8.5, tier: 'TIER_1' },
    created_at: new Date('2026-06-18T10:00:00Z'),
  },
  {
    actor_id: 'demo-validator',
    actor_role: UserRole.GOV_VALIDATOR,
    action: 'MATCH',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'VALIDATED',
    to_state: 'MATCHING',
    created_at: new Date('2026-06-18T11:00:00Z'),
  },
  {
    actor_id: 'demo-university',
    actor_role: UserRole.UNIVERSITY,
    action: 'ACCEPT',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'MATCHING',
    to_state: 'UNIVERSITY_ACCEPTED',
    human_reason: 'Department expertise matches problem domain',
    created_at: new Date('2026-06-21T09:00:00Z'),
  },
  {
    actor_id: 'demo-student1',
    actor_role: UserRole.STUDENT,
    action: 'FORM_TEAM',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'UNIVERSITY_ACCEPTED',
    to_state: 'TEAM_FORMING',
    created_at: new Date('2026-06-22T14:00:00Z'),
  },
  {
    actor_id: 'demo-student1',
    actor_role: UserRole.STUDENT,
    action: 'SUBMIT_PROPOSAL',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    to_state: 'PROPOSAL_REVIEW',
    created_at: new Date('2026-07-01T11:30:00Z'),
  },
  {
    actor_id: 'demo-department',
    actor_role: UserRole.GOV_DEPARTMENT,
    action: 'APPROVE_PROPOSAL',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'PROPOSAL_REVIEW',
    to_state: 'COLLABORATION',
    created_at: new Date('2026-07-10T15:00:00Z'),
  },
  {
    actor_id: 'demo-student1',
    actor_role: UserRole.STUDENT,
    action: 'START_COLLABORATION',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'COLLABORATION',
    to_state: 'PROTOTYPE',
    created_at: new Date('2026-07-15T10:00:00Z'),
  },
  {
    actor_id: 'demo-student1',
    actor_role: UserRole.STUDENT,
    action: 'START_PROTOTYPE',
    resource_type: 'challenge',
    resource_id: 'flood-ranchi-2026',
    from_state: 'PROTOTYPE',
    to_state: 'PROJECT_ACTIVE',
    created_at: new Date('2026-08-01T08:00:00Z'),
  },
];

// ── Comments ────────────────────────────────────────────────────────────────

const COMMENTS = [
  {
    challenge_id: 'flood-ranchi-2026',
    author_id: 'demo-validator',
    body:
      'Thank you for the detailed report. I will conduct an on-site visit this week ' +
      'and coordinate with the ward committee for formal assessment.',
    created_at: new Date('2026-06-16T09:00:00Z'),
  },
  {
    challenge_id: 'flood-ranchi-2026',
    author_id: 'demo-citizen',
    body: 'The committee visit confirmed the issue. Please update once inspection is complete.',
    created_at: new Date('2026-06-17T12:00:00Z'),
  },
  {
    challenge_id: 'flood-ranchi-2026',
    author_id: 'demo-university',
    body:
      'BITM Civil Engineering is interested in collaborating on this. ' +
      'Our team has expertise in hydraulic modeling and IoT monitoring.',
    created_at: new Date('2026-06-20T16:00:00Z'),
  },
];

// ── Helper functions ────────────────────────────────────────────────────────

async function seedUsers(tx: any) {
  for (const u of DEMO_USERS) {
    await tx.user.upsert({
      where: { firebase_uid: u.firebase_uid },
      update: {
        name: u.name,
        email: u.email,
        phone: u.phone,
        is_active: true,
        organization_id: u.organization_id,
      },
      create: {
        id: u.id,
        firebase_uid: u.firebase_uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        is_active: true,
        organization_id: u.organization_id,
      },
    });

    for (const roleName of u.roles) {
      await tx.userRoleLink.upsert({
        where: { user_id_role_name: { user_id: u.id, role_name: roleName } },
        update: {},
        create: { user_id: u.id, role_name: roleName, granted_at: new Date() },
      });
    }
  }
}

async function seedOrganizations(tx: any) {
  for (const org of DEMO_ORGS) {
    await tx.organization.upsert({
      where: { id: org.id },
      update: org,
      create: org,
    });
  }
}

async function seedUniversities(tx: any) {
  for (const uni of DEMO_UNIVERSITIES) {
    await tx.university.upsert({
      where: { code: uni.code },
      update: uni,
      create: uni,
    });
  }
}

async function seedDepartments(tx: any) {
  for (const dept of DEMO_DEPARTMENTS) {
    await tx.department.upsert({
      where: { id: dept.id },
      update: dept,
      create: dept,
    });
  }
}

async function seedFloodChallenge(tx: any) {
  await tx.challenge.upsert({
    where: { id: FLOOD_CHALLENGE.id },
    update: FLOOD_CHALLENGE,
    create: {
      ...FLOOD_CHALLENGE,
      version: 1,
      submitted_at: new Date('2026-06-15T14:30:00Z'),
      created_at: new Date('2026-06-15T14:30:00Z'),
      updated_at: new Date('2026-07-15T10:00:00Z'),
      submitter_id: 'demo-citizen',
      submitter_type: UserRole.CITIZEN,
    },
  });
}

async function seedEvidence(tx: any) {
  // Index-based id: two PHOTO records would collide on a type-based id.
  for (let i = 0; i < EVIDENCE.length; i++) {
    const ev = EVIDENCE[i];
    const id = `${ev.challenge_id}-evidence-${i}`;
    await tx.challengeEvidence.upsert({
      where: { id },
      update: ev,
      create: {
        id,
        ...ev,
        created_at: new Date(),
      },
    });
  }
}

async function seedAIRecommendations(tx: any) {
  for (const rec of AI_RECOMMENDATIONS) {
    await tx.aiRecommendation.upsert({
      where: { id: `${rec.challenge_id}-${rec.kind}` },
      update: rec,
      create: {
        id: `${rec.challenge_id}-${rec.kind}`,
        ...rec,
      },
    });
  }
}

async function seedCluster(tx: any) {
  await tx.cluster.upsert({
    where: { id: FLOOD_CLUSTER.id },
    update: { label: FLOOD_CLUSTER.label, state: FLOOD_CLUSTER.state },
    create: {
      id: FLOOD_CLUSTER.id,
      label: FLOOD_CLUSTER.label,
      state: FLOOD_CLUSTER.state,
    },
  });

  for (const challengeId of FLOOD_CLUSTER.members) {
    await tx.clusterMember.upsert({
      where: { cluster_id_challenge_id: { cluster_id: FLOOD_CLUSTER.id, challenge_id: challengeId } },
      update: {},
      create: {
        cluster_id: FLOOD_CLUSTER.id,
        challenge_id: challengeId,
        is_primary: true,
      },
    });
  }
}

async function seedValidation(tx: any) {
  await tx.validation.upsert({
    where: { id: `${VALIDATION.challenge_id}-validation` },
    update: VALIDATION,
    create: {
      id: `${VALIDATION.challenge_id}-validation`,
      ...VALIDATION,
      ai_recommendation_id: `${VALIDATION.challenge_id}-UNDERSTAND`,
    },
  });
}

async function seedAcceptance(tx: any) {
  await tx.universityAcceptance.upsert({
    where: { challenge_id_university_id: { challenge_id: ACCEPTANCE.challenge_id, university_id: ACCEPTANCE.university_id } },
    update: ACCEPTANCE,
    create: ACCEPTANCE,
  });
}

async function seedProject(tx: any) {
  await tx.project.upsert({
    where: { id: PROJECT.id },
    update: PROJECT,
    create: {
      ...PROJECT,
      createdAt: new Date('2026-06-22T15:00:00Z'),
      updatedAt: new Date('2026-08-01T08:00:00Z'),
    },
  });
}

async function seedTeam(tx: any) {
  await tx.team.upsert({
    where: { id: TEAM.id },
    update: TEAM,
    create: {
      ...TEAM,
      created_at: new Date('2026-06-22T15:00:00Z'),
    },
  });

  for (const member of TEAM_MEMBERS) {
    await tx.teamMember.upsert({
      where: { team_id_user_id: { team_id: member.team_id, user_id: member.user_id } },
      update: member,
      create: {
        ...member,
        joined_at: new Date('2026-06-22T15:30:00Z'),
      },
    });
  }
}

async function seedProposal(tx: any) {
  await tx.proposal.upsert({
    where: { id: PROPOSAL.id },
    update: PROPOSAL,
    create: {
      ...PROPOSAL,
      submitted_at: new Date('2026-07-01T11:30:00Z'),
    },
  });
}

async function seedMilestones(tx: any) {
  for (let i = 0; i < MILESTONES.length; i++) {
    const m = MILESTONES[i];
    await tx.milestone.upsert({
      where: { id: `${m.project_id}-milestone-${i}` },
      update: { ...m, project_id: m.project_id },
      create: {
        id: `${m.project_id}-milestone-${i}`,
        ...m,
        created_at: new Date('2026-07-01T12:00:00Z'),
        updated_at: new Date(),
      },
    });
  }
}

async function seedCollaborations(tx: any) {
  for (let i = 0; i < COLLABORATIONS.length; i++) {
    const c = COLLABORATIONS[i];
    await tx.collaboration.upsert({
      where: { id: `${c.project_id}-collab-${i}` },
      update: { ...c, project_id: c.project_id },
      create: {
        id: `${c.project_id}-collab-${i}`,
        ...c,
        created_at: new Date('2026-07-01T14:00:00Z'),
      },
    });

    const offer = i < 1 ? OFFER : null;
    if (offer) {
      await tx.offer.upsert({
        where: { id: `offer-${i}` },
        update: { ...offer, collaboration_id: `${c.project_id}-collab-${i}` },
        create: {
          id: `offer-${i}`,
          ...offer,
          collaboration_id: `${c.project_id}-collab-${i}`,
          created_at: new Date('2026-07-05T10:00:00Z'),
        },
      });
    }
  }
}

async function seedPilot(tx: any) {
  await tx.pilot.upsert({
    where: { id: `${PILOT.project_id}-pilot` },
    update: PILOT,
    create: {
      id: `${PILOT.project_id}-pilot`,
      ...PILOT,
      created_at: new Date('2026-08-01T08:00:00Z'),
    },
  });
}

async function seedDeployment(tx: any) {
  await tx.deployment.upsert({
    where: { id: `${DEPLOYMENT.project_id}-deployment` },
    update: DEPLOYMENT,
    create: {
      id: `${DEPLOYMENT.project_id}-deployment`,
      ...DEPLOYMENT,
      created_at: new Date('2026-08-15T09:00:00Z'),
    },
  });
}

async function seedImpactRecords(tx: any) {
  for (let i = 0; i < IMPACT_RECORDS.length; i++) {
    const ir = IMPACT_RECORDS[i];
    await tx.impactRecord.upsert({
      where: { id: `${ir.project_id}-impact-${i}` },
      update: { ...ir, project_id: ir.project_id },
      create: {
        id: `${ir.project_id}-impact-${i}`,
        ...ir,
        created_at: new Date('2026-08-15T10:00:00Z'),
      },
    });
  }
}

async function seedAuditEvents(tx: any) {
  for (let i = 0; i < AUDIT_EVENTS.length; i++) {
    const ae = AUDIT_EVENTS[i];
    await tx.auditEvent.upsert({
      where: { id: `audit-${i}` },
      update: ae,
      create: {
        id: `audit-${i}`,
        ...ae,
      },
    });
  }
}

async function seedComments(tx: any) {
  for (let i = 0; i < COMMENTS.length; i++) {
    const c = COMMENTS[i];
    await tx.challengeComment.upsert({
      where: { id: `${c.challenge_id}-comment-${i}` },
      update: c,
      create: {
        id: `${c.challenge_id}-comment-${i}`,
        ...c,
      },
    });
  }
}

// ── Expected-data manifest ───────────────────────────────────────────────────
// Canonical ids and counts for the flood scenario, exported so the demo-readiness
// verifier (scripts/verify-demo.ts) and the readiness tests can assert the seed is
// complete without duplicating literals.
export const DEMO_EXPECTED = {
  challengeId: FLOOD_CHALLENGE.id,
  projectId: PROJECT.id,
  clusterId: FLOOD_CLUSTER.id,
  userCount: DEMO_USERS.length,
  orgCount: DEMO_ORGS.length,
  evidenceCount: EVIDENCE.length,
  aiRecommendationCount: AI_RECOMMENDATIONS.length,
  milestoneCount: MILESTONES.length,
  impactRecordCount: IMPACT_RECORDS.length,
} as const;

// ── Runner ───────────────────────────────────────────────────────────────────
// The whole scenario is seeded inside ONE transaction: any failure rolls the
// entire demo dataset back rather than leaving a half-seeded database. Ordering
// matters because Postgres checks foreign keys immediately (non-deferred) —
// organizations precede the users/universities/departments that reference them,
// and the flood challenge precedes all of its downstream workflow records.
export async function seedDemo(client: PrismaClient = prisma): Promise<void> {
  await client.$transaction(async (tx) => {
    await seedOrganizations(tx);
    await seedUsers(tx);
    await seedUniversities(tx);
    await seedDepartments(tx);
    await seedFloodChallenge(tx);
    await seedEvidence(tx);
    await seedAIRecommendations(tx);
    await seedCluster(tx);
    await seedValidation(tx);
    await seedAcceptance(tx);
    await seedProject(tx);
    await seedTeam(tx);
    await seedProposal(tx);
    await seedMilestones(tx);
    await seedCollaborations(tx);
    await seedPilot(tx);
    await seedDeployment(tx);
    await seedImpactRecords(tx);
    await seedAuditEvents(tx);
    await seedComments(tx);
  });
}

// Only run when executed directly (`tsx prisma/seeds/demo.ts`, `npm run seed`, or
// the Docker entrypoint) — NOT when imported by a test or the readiness verifier,
// which need the exported dataset without side effects.
function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(entry) === path.resolve(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isDirectRun()) {
  console.log('Seeding comprehensive flood scenario...');
  seedDemo()
    .then(() => console.log('✅ Comprehensive flood scenario seeded successfully!'))
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
