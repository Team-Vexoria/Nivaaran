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
  | 'Rejected'                // Terminal: Govt officer rejects (does not meet criteria / duplicate)
  | 'Clustered'               // Stage 3: Deduplication & similar challenges grouped
  | 'Prioritized'             // Stage 4: Transparent priority & severity scoring assigned
  | 'Government Validated'    // Stage 5: Govt officer validates after AI triage & prioritization
  | 'HEI Matched'             // Stage 5-6: AI matched to university
  | 'University Accepted'     // Stage 7: University accepts the challenge
  | 'In Progress'             // Stage 8-9: Team formed, work underway
  | 'Proposal Submitted'      // Stage 9: Solution proposal submitted
  | 'Industry Collaboration'  // Stage 10: Industry / CSR support engaged
  | 'Prototype Active'        // Stage 11: Prototype development
  | 'Pilot Active'            // Stage 12: Field pilot
  | 'Outcome Audit'           // Stage 13: Technical and community validation
  | 'Resolved'                // Stage 14: Deployed
  | 'Closed';                 // Stage 16: Impact measured, archived

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

// ── AI Triage Analysis ────────────────────────────────────────────────────────
export interface PriorityFactors {
  populationImpact:          { score: number; max: number; reason: string };
  economicLifeSaving:        { score: number; max: number; reason: string };
  resolutionCostFeasibility: { score: number; max: number; reason: string };
  hazardUrgency:             { score: number; max: number; reason: string };
}

// ── Stage 4: Live Internet & Government Intelligence Research ──────────────────
// Mirrors the backend UnifiedResearchResult (newsEngine.ts). Attached to a
// challenge's AI analysis after the worker's research stage completes, so the
// government portal can show exactly which real sources contributed to the score.
export interface ResearchSourceBreakdown {
  news?: string;      // 'GNews' | 'NewsAPI' | 'none'
  weather?: string;   // 'disaster-live' | 'disaster-fallback'
  govt?: string;      // 'live' | 'govt-live' | 'db' | 'govt-db' | 'none'
}

export interface ResearchIncident {
  title: string;
  source: string;
  url?: string;
  snippet?: string;
  publishedAt?: string;
  sourceTag?: 'news' | 'govt' | 'db';
}

export interface ResearchResult {
  governmentAdvisories?: string[];
  advisories?: string[];              // alias
  recentIncidents?: ResearchIncident[];
  incidents?: ResearchIncident[];     // alias
  recurringHazard?: boolean;
  recurringHazardIdentified?: boolean;
  severityContext?: string;
  confidence?: number;
  queryUsed?: string;
  activeAlert?: boolean;
  corroborationCount?: number;
  source?: string;                    // top-level source label when present
  sourceBreakdown?: ResearchSourceBreakdown;
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
  research?: ResearchResult;    // live research evidence backing the score
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
  research?: ResearchResult;     // live research evidence backing the score

  // Evidence
  evidenceUrls: string[];        // photo/video URLs
  videoUrl?: string;             // primary video URL
  videoUrls?: string[];          // list of attached video URLs
  audioUrl?: string;             // citizen voice recording URL
  voiceLanguage?: string;        // speech-to-text source language (e.g. 'hi-IN', 'en-IN')
  evidenceType?: 'image' | 'video' | 'mixed';
  
  // Government
  govtOfficerNote?: string;
  needsHumanVerification?: boolean;
  govtValidatedBy?: string;
  govtValidatedAt?: string;

  // University assignment
  assignedHEI?: string;
  assignedDept?: string;
  assignedProjectId?: string;

  // Deduplication / Clustering & Report Velocity
  clusterId?: string;           // Set when AI groups this with similar challenges
  citizenReportCount?: number;  // Total consolidated reports submitted for this issue
  communityUpvotes?: number;    // Upvotes / citizen endorsements

  // Numeric impact inputs (T5.1 — honest numerics, no manufactured defaults)
  affectedPopulation?: number;
  economicValueEstimate?: number;
  estimatedResolutionCost?: number;

  // CSR / Industry
  csrSponsor?: string;

  // Stage 4: Extracted On-Ground Proof & Audit Metadata
  extractedMetadata?: import('./dataExtractionService').IncidentExtractedData;

  // Metadata
  submittedBy?: string;
  submittedByRole?: string;
  reporterId?: string;
  reporterEmail?: string;
  reporterName?: string;
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

// ── Phase 3 project execution records ───────────────────────────────────────
export type CollaborationPartnerType = 'Industry' | 'CSR' | 'MSME' | 'Research Lab';
export type CollaborationSupportType = 'Funding' | 'Hardware' | 'Mentorship' | 'Testing' | 'Deployment';
export type CollaborationOfferStatus = 'Proposed' | 'Details Requested' | 'Accepted' | 'Declined';

export const PARTNER_OPTIONS: CollaborationPartnerType[] = ['Industry', 'CSR', 'MSME', 'Research Lab'];
export const SUPPORT_OPTIONS: CollaborationSupportType[] = ['Funding', 'Hardware', 'Mentorship', 'Testing', 'Deployment'];

export interface CollaborationOffer {
  id: string;
  projectId: string;
  partnerName: string;
  partnerType: CollaborationPartnerType;
  supportType: CollaborationSupportType;
  message: string;
  status: CollaborationOfferStatus;
  submittedAt: string;
  respondedAt?: string;
}

export interface PrototypeUpdate {
  summary: string;
  repositoryUrl?: string;
  telemetryLog?: string;
  evidenceUrls: string[];
  submittedBy: string;
  submittedAt: string;
}

export interface PilotReport {
  location: string;
  participants?: number;
  observations: string;
  metrics?: Record<string, string | number>;
  evidenceUrls: string[];
  submittedBy: string;
  submittedAt: string;
}

export interface OutcomeAudit {
  summary: string;
  verifiedBy: string;
  metrics: Record<string, string | number>;
  evidenceUrls: string[];
  verifiedAt: string;
  auditNotes?: string;
  communityFeedback?: string;
  isSuccessful?: boolean;
}

// ── Project ───────────────────────────────────────────────────────────────────
export type ProjectStatus =
  | 'Accepted'
  | 'Team Formed'
  | 'Proposal Submitted'
  | 'Industry Collaboration'
  | 'Prototype Active'
  | 'Pilot Active'
  | 'Outcome Audit'
  | 'Completed';

export interface Project {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challenge?: any;
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
  collaborationOffers?: CollaborationOffer[];
  prototypeUpdate?: PrototypeUpdate;
  pilotReport?: PilotReport;
  outcomeAudit?: OutcomeAudit;

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

export type Phase3Project = Project;
