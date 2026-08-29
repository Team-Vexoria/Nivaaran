// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Shared Workflow Types (SIH 26043)
// Strongly-typed interfaces for the entire challenge-to-impact lifecycle.
// Used by workflowStore.ts, useWorkflowStore.ts, and eventually all portals.
// ─────────────────────────────────────────────────────────────────────────────

// ── Challenge Status Lifecycle ────────────────────────────────────────────────
// Maps to the 16-stage lifecycle defined in Complete_workflow.md
export type ChallengeStatus =
  | 'Submitted'               // Stage 1: Citizen submits
  | 'Under Review'            // Stage 2: AI triage complete, awaiting govt review
  | 'Evidence Requested'      // Stage 2b: Govt officer requests more evidence
  | 'Government Validated'    // Stage 3: Govt validates & prioritizes
  | 'HEI Matched'             // Stage 5-6: AI matched to university
  | 'University Accepted'     // Stage 7: University accepts the challenge
  | 'In Progress'             // Stage 8-9: Team formed, work underway
  | 'Proposal Submitted'      // Stage 9: Solution proposal submitted
  | 'Prototype Active'        // Stage 11: Prototype development
  | 'Pilot Active'            // Stage 12: Field pilot
  | 'Resolved'                // Stage 14: Deployed
  | 'Closed';                 // Stage 16: Impact measured, archived

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

// ── AI Triage Analysis ────────────────────────────────────────────────────────
export interface PriorityFactors {
  populationImpact:    { score: number; max: number; reason: string };
  infraCriticality:    { score: number; max: number; reason: string };
  hazardUrgency:       { score: number; max: number; reason: string };
  communityUpvotes:    { score: number; max: number; reason: string };
  spatialRecurrence:   { score: number; max: number; reason: string };
}

export interface AIAnalysis {
  category: string;
  categoryCode: string;
  matchedProblem?: string;
  confidenceScore: number;      // 0-100
  priorityScore: number;        // 0-100
  riskLevel: RiskLevel;
  factors: PriorityFactors;
  reasoning: string;
  needsHumanVerification: boolean;
  recommendedUniversityDepts: string[];
}

// ── Challenge ─────────────────────────────────────────────────────────────────
export interface Challenge {
  id: string;
  reportId: string;
  title: string;
  description: string;           // detailed description / summary

  // Location
  district: string;
  block: string;
  village: string;
  locationCoords?: { lat: number; lng: number };
  formattedAddress?: string;

  // Status
  status: ChallengeStatus;
  stageNumber: number;
  stageName: string;

  // AI Analysis
  category: string;
  aiAnalysis?: AIAnalysis;
  priorityScore?: number;
  confidenceScore?: number;
  riskLevel?: RiskLevel;

  // Evidence
  evidenceUrls: string[];        // photo/video URLs
  
  // Government
  govtOfficerNote?: string;
  needsHumanVerification?: boolean;
  govtValidatedBy?: string;
  govtValidatedAt?: string;

  // University assignment
  assignedHEI?: string;
  assignedDept?: string;
  assignedProjectId?: string;

  // CSR / Industry
  csrSponsor?: string;

  // Metadata
  submittedBy?: string;
  submittedByRole?: string;
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// ── Team Member ───────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  departmentName: string;
  role: string;                   // e.g. 'Team Lead', 'Developer', 'Researcher'
  skills: string[];
  email?: string;
}

// ── Milestone ─────────────────────────────────────────────────────────────────
export type MilestoneStatus = 'Completed' | 'In Progress' | 'Pending';

export interface Milestone {
  id: string;
  stageNumber: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  targetDays: number;
  evidenceUrl?: string;
  completedAt?: string;           // ISO timestamp
}

// ── Proposal ──────────────────────────────────────────────────────────────────
export type ProposalStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Revision Requested' | 'Rejected';

export interface Proposal {
  id: string;
  projectId: string;
  title: string;
  description: string;
  approach: string;
  estimatedBudget: number;
  estimatedTimeline: string;      // e.g. "12 weeks"
  status: ProposalStatus;
  submittedBy?: string;
  submittedAt?: string;           // ISO timestamp
  reviewNote?: string;
}

// ── Project ───────────────────────────────────────────────────────────────────
export type ProjectStatus =
  | 'Accepted'
  | 'Team Formed'
  | 'Proposal Submitted'
  | 'Prototype Active'
  | 'Pilot Active'
  | 'Completed';

export interface Project {
  id: string;
  challengeId: string;
  challengeTitle: string;
  category: string;
  district: string;

  // University
  universityId: string;
  universityName: string;
  facultyMentorName: string;
  facultyEmail: string;

  // Team
  teamMembers: TeamMember[];

  // Status
  status: ProjectStatus;

  // Milestones
  milestones: Milestone[];

  // Proposals
  proposals: Proposal[];

  // Budget
  budgetEstimated?: number;
  budgetApproved?: number;

  // Metadata
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
}

// ── Timeline Event ────────────────────────────────────────────────────────────
export type EntityType = 'challenge' | 'project' | 'proposal' | 'milestone';

export interface TimelineEvent {
  id: string;
  entityType: EntityType;
  entityId: string;
  action: string;                 // e.g. 'status_changed', 'team_member_added', 'proposal_submitted'
  actor: string;                  // who performed the action
  actorRole: string;              // e.g. 'Citizen', 'Government Department', 'Faculty / Mentor'
  description: string;            // human-readable description
  previousValue?: string;         // e.g. previous status
  newValue?: string;              // e.g. new status
  timestamp: string;              // ISO timestamp
}

export interface ChallengeStageMetadata {
  stageNumber: number;
  stageName: string;
}

// ── Workflow State (the full localStorage blob) ───────────────────────────────
export interface WorkflowState {
  challenges: Challenge[];
  projects: Project[];
  proposals: Proposal[];
  timelineEvents: TimelineEvent[];
  lastUpdated: string;            // ISO timestamp
}

// ── Filter Types ──────────────────────────────────────────────────────────────
export interface ChallengeFilters {
  status?: ChallengeStatus | ChallengeStatus[];
  district?: string;
  riskLevel?: RiskLevel;
  category?: string;
  hasProject?: boolean;
}

export interface ProjectFilters {
  status?: ProjectStatus | ProjectStatus[];
  district?: string;
  universityId?: string;
  challengeId?: string;
}
