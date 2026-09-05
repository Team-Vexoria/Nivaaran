# NIVAARAN API Contracts

> **Series position:** Document 3. Turns `DATABASE_DESIGN.md` tables and `BACKEND_ARCHITECTURE.md` §6.3 transitions into a **complete, exhaustive endpoint catalogue** with TypeScript request/response types, error format, pagination, concurrency, and the file upload protocol.
>
> **Audience:** Frontend developers, API consumers, QA engineers writing integration tests.
>
> **Aligns with:** `DATABASE_DESIGN.md` column names exactly, `workflowTypes.ts` frontend types for the public surface, `BACKEND_ARCHITECTURE.md` §6.3 for all transitions.
>
> **Stable convention:** all payloads are JSON unless stated. All timestamps are ISO 8601 UTC. All IDs are UUIDs.

---

## 1. Conventions

### 1.1 Base path

```
/api/v1
```

All endpoints are versioned under `/api/v1`. The `/v1` prefix is literal (not a placeholder). A future breaking change gets `/api/v2`; the old surface stays.

### 1.2 Authentication

Every endpoint except `GET /api/v1/health` and the public read paths (§1.6) requires a valid Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

The server verifies this token with `firebase-admin`, resolves the `User` row and their `identity bundle` (roles, org, geo scopes, permissions) from Postgres/Redis, and attaches it to the request context. The token is never forwarded; the backend is the authority for all authorization decisions.

### 1.3 Success body

All success responses use the **JSON envelope**:

```typescript
interface SuccessResponse<T> {
  ok: true;
  data: T;
}
```

List endpoints add pagination metadata (§1.4).

### 1.4 Error body

Every error — validation, authorization, conflict, not-found, upstream failure — uses one consistent shape:

```typescript
interface ErrorResponse {
  ok: false;
  error: {
    code: string;           // machine-readable code: "VALIDATION_ERROR", "CONFLICT", "NOT_FOUND"
    message: string;        // human-readable summary
    details?: Record<string, string[]>;  // field-level errors (Zod: {field: ["required"]})
    traceId?: string;       // for support; matches server log correlation
  };
}
```

| HTTP Status | `code` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Malformed JSON, missing required fields |
| 401 | `UNAUTHORIZED` | No token or invalid/expired token |
| 403 | `FORBIDDEN` | Authenticated but role/scope lacks the required capability |
| 404 | `NOT_FOUND` | Resource does not exist (or is soft-deleted) |
| 409 | `CONFLICT` | Workflow guard violated; stale version; duplicate unique constraint |
| 422 | `VALIDATION_ERROR` | Zod validation failed (field-level detail in `details`) |
| 429 | `RATE_LIMITED` | Rate limit exceeded (see `SECURITY_ARCHITECTURE.md`) |
| 502 | `UPSTREAM_FAILURE` | External provider (AI, email, SMS) is down |
| 503 | `SERVICE_UNAVAILABLE` | Database or Redis temporarily unreachable |

### 1.5 Pagination

All list endpoints support pagination. The **default** for authenticated list views is cursor-based; admin/export endpoints may use offset-based as a fallback.

```typescript
// Query params for list endpoints
interface PaginationParams {
  cursor?: string;     // opaque cursor from previous response
  limit?: number;      // default 20, max 100
  sort?: string;       // "created_at:desc" (default) or "created_at:asc"
}

// Response envelope for lists
interface ListResponse<T> {
  ok: true;
  data: T[];
  pagination: {
    nextCursor: string | null;   // null = no more pages
    hasMore: boolean;
    count: number;               // total items in the matching query (not just this page)
  };
}
```

### 1.6 Optimistic concurrency

Any endpoint that mutates a resource carrying a `version` field accepts an `If-Match` header:

```
If-Match: 3
```

If the server's current version differs, it returns `409 CONFLICT` with code `STALE_VERSION`. The client must re-read the resource and retry with the current version. The `version` field is always included in GET responses.

For the **transition endpoint** (§2.1), the version is checked inside the same transaction as the state change, so there is no window for a lost update.

### 1.7 Public read surface

A set of **public endpoints** requires no authentication and returns only fields safe for anonymous/public consumption. These serve the landing page, public challenge tracker, and embedded widgets. The public projection **never** includes: internal AI confidence, reviewer notes, private evidence URLs, submitter identity, or internal status labels.

```typescript
// Public challenge projection (what anonymous sees)
interface PublicChallengeSummary {
  id: string;
  title: string;
  category: string;
  districtCode: string;
  publicStatusLabel: string;     // human-friendly stage label (from getPublicStatusLabel)
  priorityScore: number | null;
  createdAt: string;
}
```

All other endpoints require authentication.

---

## 2. Challenge Endpoints

The challenge is the root entity. All other resources are either owned by or linked to a challenge.

### 2.1 `POST /api/v1/challenges/:id/transition`

**The** endpoint for all workflow state changes. There is no `PATCH /challenges/:id` that writes `status` directly; every status change goes through this single entry point so the engine's guards, authorization, audit, and outbox are always invoked.

```typescript
// ── Request ──
interface TransitionRequest {
  action: string;           // action name from §6.3: "challenge:validate", "team:create", etc.
  payload?: Record<string, unknown>;  // action-specific data (reason, evidence, etc.)
}

// ── Request headers ──
// If-Match: <version>   (required for all transitions)
// Idempotency-Key: <uuid> (optional but recommended; prevents double-apply on retry)

// ── Success 200 ──
interface TransitionResponse {
  ok: true;
  data: {
    challenge: ChallengeResponse;
    appliedAction: string;
    fromStatus: string;
    toStatus: string;
    // next transitions available from the new state
    availableTransitions: string[];
    // audit event created by this transition
    auditEventId: string;
    // outbox event created (event type for downstream consumers)
    outboxEventId: string;
  };
}
```

### 2.2 `POST /api/v1/challenges`

Submit a new challenge (citizen or authorized actor).

```typescript
// ── Request ──
interface CreateChallengeRequest {
  title: string;
  description: string;
  category: string;               // taxonomy value
  districtCode: string;           // e.g. "RANCHI"
  blockCode?: string;
  location?: { lat: number; lng: number };
  evidence?: CreateEvidenceInput[];
}

// ── Success 201 ──
// data: ChallengeResponse (status = SUBMITTED)
```

### 2.3 `GET /api/v1/challenges/:id`

Full challenge detail (authenticated, scope-gated). Returns everything the actor is authorized to see.

```typescript
interface ChallengeResponse {
  id: string;
  version: number;
  title: string;
  description: string;
  category: string;
  subCategory: string | null;
  districtCode: string;
  blockCode: string | null;
  location: { lat: number; lng: number } | null;
  areaPanchayat: string | null;

  status: string;                    // internal enum value
  publicStatusLabel: string;         // human-friendly label (derived)
  stageNumber: number;               // 1-16 lifecycle stage (derived)
  priorityScore: number | null;
  priorityFactors: Record<string, unknown> | null;

  // AI understanding
  aiSummary: string | null;
  aiDomain: string | null;
  aiTags: string[];
  aiSeverity: string | null;
  aiConfidence: number | null;

  // Clarification
  clarificationRequest: Record<string, unknown> | null;
  clarificationResponse: Record<string, unknown> | null;

  // Ownership
  submitterId: string;
  submitterType: string;
  assignedOrgId: string | null;
  reviewerId: string | null;

  // Timestamps
  submittedAt: string;
  transitionedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 2.4 `GET /api/v1/challenges`

List challenges with filters. Role and geo scope are applied automatically; the user sees only what they are authorized to.

```typescript
interface ChallengeListParams extends PaginationParams {
  status?: string;
  districtCode?: string;
  category?: string;
  assignedOrgId?: string;
  submitterId?: string;              // "me" resolves to the authenticated user
  hasProject?: boolean;
}

// response: ListResponse<ChallengeResponse>
```

### 2.5 `PATCH /api/v1/challenges/:id`

Update mutable non-status fields (title, description, category, location). Status changes still require the transition endpoint.

```typescript
interface UpdateChallengeRequest {
  title?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  blockCode?: string;
  location?: { lat: number; lng: number };
  areaPanchayat?: string;
}
// Headers: If-Match: <version>
```

### 2.6 `DELETE /api/v1/challenges/:id`

Soft-delete (sets `deleted_at`). Only the submitter or a gov coordinator may do this, and only in SUBMITTED status (before validation).

### 2.7 `GET /api/v1/challenges/:id/timeline`

The full audit trail for one challenge, ordered chronologically.

```typescript
interface TimelineEvent {
  id: string;
  entityType: string;                // "challenge" | "project" | "proposal"
  entityId: string;
  action: string;                    // AuditAction enum value
  actor: string;                     // user display name
  actorRole: string;
  description: string;               // human-readable
  fromState: string | null;
  toState: string | null;
  humanReason: string | null;
  aiRecommendationId: string | null;
  createdAt: string;
}

// response: ListResponse<TimelineEvent>
```

---

## 3. Evidence Upload

### 3.1 `POST /api/v1/challenges/:id/evidence/presign`

Request a pre-signed upload URL. The server validates file type/size and authorization, stores the metadata row, and returns a short-lived signed URL for the client to PUT directly to storage.

```typescript
interface PresignRequest {
  fileName: string;
  mimeType: string;                  // image/jpeg, video/mp4, etc.
  fileSize: number;                  // bytes
  isPrivate?: boolean;               // default false
}

interface PresignResponse {
  uploadUrl: string;                 // signed URL; client PUTs file here
  storageRef: string;                // server-assigned storage key
  expiresAt: string;                 // ISO timestamp
  evidenceId: string;                // the ChallengeEvidence row (PENDING until upload confirmed)
}
```

### 3.2 `POST /api/v1/challenges/:id/evidence/confirm`

After the client has PUT the file to the signed URL, it calls this to confirm the upload is complete. The server marks the evidence row as confirmed.

```typescript
interface ConfirmEvidenceRequest {
  evidenceId: string;
  storageRef: string;                // must match the presigned ref
}

// response: 200 { ok: true, data: { evidence: EvidenceResponse } }
```

### 3.3 `GET /api/v1/challenges/:id/evidence`

List evidence for a challenge. Private evidence URLs are only included for authorized actors (signed, short TTL).

```typescript
interface EvidenceResponse {
  id: string;
  challengeId: string;
  type: string;                     // PHOTO | VIDEO | AUDIO | DOCUMENT | TELEMETRY | GEOTAG
  storageRef: string;
  mimeType: string | null;
  sizeBytes: number | null;
  isPrivate: boolean;
  url: string | null;               // signed URL, only when authorized
  createdAt: string;
}
```

---

## 4. Validation Endpoints

### 4.1 `GET /api/v1/challenges/:id/validations`

List validation decisions for a challenge (the full review history).

```typescript
// response: ListResponse<ValidationResponse>

interface ValidationResponse {
  id: string;
  challengeId: string;
  reviewerId: string;
  decision: string;                  // VALID | NEEDS_CLARIFICATION | INVALID | DEFER
  reason: string | null;
  supportingNote: string | null;
  aiRecommendationId: string | null;
  clarificationRequested: Record<string, unknown> | null;
  decidedAt: string;
}
```

---

## 5. AI Recommendation Endpoints

### 5.1 `GET /api/v1/challenges/:id/ai-recommendations`

The full AI recommendation history for a challenge — each run, superseded or current.

```typescript
// response: ListResponse<AiRecommendationResponse>

interface AiRecommendationResponse {
  id: string;
  challengeId: string;
  kind: string;                     // UNDERSTAND | SIMILARITY | PRIORITIZE | MATCH | VISION
  status: string;                   // PENDING | RUNNING | SUCCEEDED | FAILED | RETRYABLE
  result: Record<string, unknown> | null;  // per-kind payload
  confidence: number | null;
  reasons: Record<string, unknown> | null;
  modelVersion: string;
  supersededById: string | null;
  attemptCount: number;
  completedAt: string | null;
  createdAt: string;
}
```

### 5.2 `POST /api/v1/challenges/:id/ai/understand`

Trigger AI understanding analysis (normally auto-triggered on submit; this is for re-run or manual trigger).

```typescript
// Request: no body required
// Headers: If-Match: <version>
// Response: 202 { ok: true, data: { jobId: string } }
// Poll status: GET /api/v1/jobs/:jobId
```

### 5.3 `POST /api/v1/challenges/:id/ai/vision`

Trigger computer vision analysis on a specific evidence attachment.

```typescript
interface VisionRequest {
  evidenceId: string;
}
// Response: 202 { ok: true, data: { jobId: string } }
```

---

## 6. Cluster / Dedup Endpoints

### 6.1 `GET /api/v1/clusters`

List all clusters (for cluster review UI).

```typescript
// response: ListResponse<ClusterResponse>

interface ClusterResponse {
  id: string;
  label: string;
  state: string;                    // QUEUED | RUNNING | COMPLETED | FAILED
  memberCount: number;
  primaryChallengeId: string | null;
  createdAt: string;
}
```

### 6.2 `GET /api/v1/clusters/:id`

Full cluster detail including member challenges.

```typescript
interface ClusterDetailResponse extends ClusterResponse {
  members: {
    challengeId: string;
    challengeTitle: string;
    similarity: number | null;
    isPrimary: boolean;
  }[];
}
```

---

## 7. University / Matching Endpoints

### 7.1 `GET /api/v1/universities`

List university profiles (for the matching UI and university directory).

```typescript
interface UniversityListParams extends PaginationParams {
  district?: string;
  verified?: boolean;
}

// response: ListResponse<UniversityResponse>

interface UniversityResponse {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  district: string;
  city: string;
  naacGrade: string | null;
  capacity: number;
  facilities: Record<string, unknown>[];
  departments: { id: string; name: string; focusArea: string | null }[];
}
```

### 7.2 `GET /api/v1/universities/:id`

Full university detail including active projects and capacity status.

```typescript
interface UniversityDetailResponse extends UniversityResponse {
  website: string | null;
  establishedYear: number | null;
  accreditation: string | null;
  description: string | null;
  activeProjectCount: number;
  projects: { id: string; challengeId: string; status: string; challengeTitle: string }[];
}
```

### 7.3 `POST /api/v1/challenges/:id/matching/run`

Trigger the HEI matching engine for a challenge (system or coordinator).

```typescript
// Request: no body
// Headers: If-Match: <version>
// Response: 202 { ok: true, data: { jobId: string } }
```

### 7.4 `POST /api/v1/challenges/:id/acceptances`

University admin accepts or declines a matched challenge.

```typescript
interface AcceptanceRequest {
  universityId: string;              // must match the authenticated user's org
  decision: "ACCEPTED" | "DECLINED";
  reason?: string;
}

// Headers: If-Match: <version>
// Response: 200 { ok: true, data: { acceptance: AcceptanceResponse } }

interface AcceptanceResponse {
  id: string;
  challengeId: string;
  universityId: string;
  decision: string;
  reason: string | null;
  decidedBy: string | null;
  decidedAt: string;
}
```

### 7.5 `GET /api/v1/challenges/:id/acceptances`

List acceptances for a challenge (tracks the decline→rematch history).

```typescript
// response: ListResponse<AcceptanceResponse>
```

---

## 8. Team Endpoints

### 8.1 `POST /api/v1/challenges/:id/teams`

Create a team for an accepted challenge.

```typescript
interface CreateTeamRequest {
  name?: string;
  members: {
    userId: string;
    role: string;                     // "lead" | "member" | "mentor"
    skills?: string[];
    isMentor?: boolean;
  }[];
}

// Headers: If-Match: <version>
// Response: 201 { ok: true, data: { team: TeamResponse } }

interface TeamResponse {
  id: string;
  projectId: string;
  name: string | null;
  members: {
    id: string;
    userId: string;
    name: string;
    role: string;
    skills: string[];
    isMentor: boolean;
    joinedAt: string;
  }[];
  createdAt: string;
}
```

### 8.2 `GET /api/v1/projects/:projectId/team`

Get the team for a project.

```typescript
// response: 200 { ok: true, data: { team: TeamResponse } }
```

### 8.3 `PATCH /api/v1/teams/:teamId/members/:userId`

Update a team member's role or skills.

```typescript
interface UpdateTeamMemberRequest {
  role?: string;
  skills?: string[];
}
```

### 8.4 `DELETE /api/v1/teams/:teamId/members/:userId`

Remove a team member.

---

## 9. Project Endpoints

### 9.1 `GET /api/v1/projects`

List projects with filters.

```typescript
interface ProjectListParams extends PaginationParams {
  status?: string;
  universityId?: string;
  challengeId?: string;
}

// response: ListResponse<ProjectResponse>

interface ProjectResponse {
  id: string;
  challengeId: string;
  challengeTitle: string;
  universityId: string;
  universityName: string;
  status: string;
  proposalTitle: string | null;
  teamLeadId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 9.2 `GET /api/v1/projects/:id`

Full project detail including milestones, team, and impact records.

```typescript
interface ProjectDetailResponse extends ProjectResponse {
  proposalAbstract: string | null;
  proposalDocRef: string | null;
  coursesCredits: Record<string, unknown> | null;
  team: TeamResponse | null;
  milestones: MilestoneResponse[];
  impactRecords: ImpactRecordResponse[];
  collaborationCount: number;
  pilotCount: number;
  deploymentCount: number;
}
```

---

## 10. Proposal Endpoints

### 10.1 `POST /api/v1/projects/:projectId/proposals`

Submit a proposal for a project.

```typescript
interface CreateProposalRequest {
  title: string;
  contentMd: string;                 // markdown body
  docRef?: string;                   // optional uploaded doc
}

// Headers: If-Match: <version>
// Response: 201 { ok: true, data: { proposal: ProposalResponse } }

interface ProposalResponse {
  id: string;
  projectId: string;
  submitterId: string;
  title: string;
  contentMd: string | null;
  status: string;
  submittedAt: string;
}
```

### 10.2 `GET /api/v1/projects/:projectId/proposals`

List proposals for a project (there may be revisions).

```typescript
// response: ListResponse<ProposalResponse>
```

### 10.3 `POST /api/v1/proposals/:id/approve`

Approve a proposal (university authority).

```typescript
interface ApproveProposalRequest {
  reviewNotes?: Record<string, unknown>;
}
// Headers: If-Match: <version>
// Response: 200 { ok: true, data: { proposal: ProposalResponse } }
```

### 10.4 `POST /api/v1/proposals/:id/request-revision`

Request revision on a proposal.

```typescript
interface RequestRevisionRequest {
  revisionRequest: Record<string, unknown>;  // structured feedback
}
// Headers: If-Match: <version>
```

---

## 11. Milestone Endpoints

### 11.1 `GET /api/v1/projects/:projectId/milestones`

```typescript
// response: ListResponse<MilestoneResponse>

interface MilestoneResponse {
  id: string;
  projectId: string;
  title: string;
  deliverable: string | null;
  dueAt: string;
  status: string;
  progress: number;                  // 0..100
  evidenceRef: string | null;
  createdAt: string;
}
```

### 11.2 `PATCH /api/v1/milestones/:id`

Update milestone progress or status.

```typescript
interface UpdateMilestoneRequest {
  status?: string;
  progress?: number;
  evidenceRef?: string;
}
```

---

## 12. Collaboration / Offer Endpoints

### 12.1 `POST /api/v1/projects/:projectId/collaborations`

Post a collaboration need (project team posts what they need).

```typescript
interface CreateCollaborationRequest {
  offeringOrgId: string;
  need: string;
  form: string;                      // "funding" | "resource" | "expertise"
  acceptanceNeeded?: boolean;
}

// Response: 201 { ok: true, data: { collaboration: CollaborationResponse } }

interface CollaborationResponse {
  id: string;
  projectId: string;
  offeringOrgId: string;
  offeringOrgName: string;
  need: string;
  form: string;
  acceptanceNeeded: boolean;
  status: string;
  offers: OfferResponse[];
  createdAt: string;
}
```

### 12.2 `GET /api/v1/projects/:projectId/collaborations`

```typescript
// response: ListResponse<CollaborationResponse>
```

### 12.3 `POST /api/v1/collaborations/:id/offers`

Partner submits an offer in response to a collaboration need.

```typescript
interface CreateOfferRequest {
  amount?: number;
  inKind?: Record<string, unknown>;
  terms?: string;
}

// Response: 201 { ok: true, data: { offer: OfferResponse } }

interface OfferResponse {
  id: string;
  collaborationId: string;
  offeredByOrg: string;
  amount: number | null;
  inKind: Record<string, unknown> | null;
  terms: string | null;
  status: string;
  acceptedAt: string | null;
  createdAt: string;
}
```

### 12.4 `POST /api/v1/offers/:id/accept`

Accept an offer (project team or collaboration owner).

```typescript
// Headers: If-Match: <version>
// Response: 200 { ok: true, data: { offer: OfferResponse } }
```

### 12.5 `POST /api/v1/offers/:id/decline`

Decline an offer with a reason.

```typescript
interface DeclineOfferRequest { reason?: string; }
// Headers: If-Match: <version>
```

---

## 13. Pilot & Deployment Endpoints

### 13.1 `POST /api/v1/projects/:projectId/pilots`

Record a pilot.

```typescript
interface CreatePilotRequest {
  universityId?: string;
  location: string;
  districtCode: string;
  scope?: string;
  metrics?: Record<string, unknown>;
  evidenceRef?: string;
}

// Headers: If-Match: <version>
// Response: 201 { ok: true, data: { pilot: PilotResponse } }

interface PilotResponse {
  id: string;
  projectId: string;
  universityId: string | null;
  location: string;
  districtCode: string;
  scope: string | null;
  metrics: Record<string, unknown> | null;
  evidenceRef: string | null;
  isSuccess: boolean | null;
  startedAt: string;
  endedAt: string | null;
}
```

### 13.2 `GET /api/v1/projects/:projectId/pilots`

```typescript
// response: ListResponse<PilotResponse>
```

### 13.3 `POST /api/v1/projects/:projectId/deployments`

Record a deployment approval.

```typescript
interface CreateDeploymentRequest {
  approvedBy: string;
  approvalRef?: string;
  districtCode: string;
}

// Headers: If-Match: <version>
// Response: 201 { ok: true, data: { deployment: DeploymentResponse } }

interface DeploymentResponse {
  id: string;
  projectId: string;
  approvedBy: string;
  approvalRef: string | null;
  districtCode: string;
  status: string;
  startedAt: string;
}
```

### 13.4 `GET /api/v1/projects/:projectId/deployments`

```typescript
// response: ListResponse<DeploymentResponse>
```

---

## 14. Impact Endpoints

### 14.1 `POST /api/v1/projects/:projectId/impact`

Record an impact metric.

```typescript
interface CreateImpactRequest {
  metricName: string;
  metricGroup?: string;              // "outcome" | "output" | "sdg"
  beforeValue?: number;
  afterValue?: number;
  units?: string;
  beneficiaries?: number;
  evidenceRef?: string;
}

// Response: 201 { ok: true, data: { impact: ImpactRecordResponse } }

interface ImpactRecordResponse {
  id: string;
  projectId: string;
  metricName: string;
  metricGroup: string | null;
  beforeValue: number | null;
  afterValue: number | null;
  units: string | null;
  beneficiaries: number | null;
  evidenceRef: string | null;
  recordedBy: string;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
}
```

### 14.2 `GET /api/v1/projects/:projectId/impact`

```typescript
// response: ListResponse<ImpactRecordResponse>
```

### 14.3 `POST /api/v1/impact/:id/verify`

Verify an impact record (government decision-maker).

```typescript
// Headers: If-Match: <version>
// Response: 200 { ok: true, data: { impact: ImpactRecordResponse } }
```

---

## 15. District / GIS Endpoints

### 15.1 `GET /api/v1/districts`

List all 24 Jharkhand districts with geometry.

```typescript
// response: ListResponse<DistrictResponse>

interface DistrictResponse {
  code: string;                     // "RANCHI"
  name: string;
  stateCode: string;
  centroid: { lat: number; lng: number } | null;
  riskProfile: Record<string, unknown> | null;
  // boundary geometry is NOT included in list (too large); use detail endpoint
}
```

### 15.2 `GET /api/v1/districts/:code`

Full district detail including boundary GeoJSON.

```typescript
interface DistrictDetailResponse extends DistrictResponse {
  boundary: Record<string, unknown> | null;  // GeoJSON MultiPolygon
}
```

### 15.3 `GET /api/v1/challenges/spatial`

Spatial query: challenges within a bounding box or within a district boundary.

```typescript
interface SpatialQueryParams {
  west?: number;
  south?: number;
  east?: number;
  north?: number;
  districtCode?: string;
  status?: string;
  category?: string;
  limit?: number;                   // default 100, max 500
}

// response: { ok: true, data: { challenges: SpatialChallengeResponse[] } }

interface SpatialChallengeResponse {
  id: string;
  title: string;
  category: string;
  districtCode: string;
  status: string;
  priorityScore: number | null;
  location: { lat: number; lng: number };
}
```

### 15.4 `GET /api/v1/analytics/district-heatmap`

Aggregated challenge counts by district, for the heatmap layer.

```typescript
interface HeatmapQueryParams {
  status?: string;
  category?: string;
}

// response: { ok: true, data: { districts: DistrictHeatmapResponse[] } }

interface DistrictHeatmapResponse {
  districtCode: string;
  totalChallenges: number;
  activeChallenges: number;
  avgPriorityScore: number | null;
  centroid: { lat: number; lng: number };
}
```

---

## 16. Notification Endpoints

### 16.1 `GET /api/v1/notifications`

List the authenticated user's notifications.

```typescript
interface NotificationListParams extends PaginationParams {
  unreadOnly?: boolean;
}

// response: ListResponse<NotificationResponse>

interface NotificationResponse {
  id: string;
  type: string;                     // NotificationType enum
  channel: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}
```

### 16.2 `GET /api/v1/notifications/unread-count`

```typescript
// response: { ok: true, data: { count: number } }
```

### 16.3 `POST /api/v1/notifications/:id/read`

Mark a notification as read.

### 16.4 `POST /api/v1/notifications/read-all`

Mark all unread notifications as read.

---

## 17. Audit Endpoints (admin only)

### 17.1 `GET /api/v1/audit`

Query the audit trail. Admin/gov-coordinator only.

```typescript
interface AuditQueryParams extends PaginationParams {
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  action?: string;
  from?: string;                    // ISO timestamp
  to?: string;                      // ISO timestamp
}

// response: ListResponse<AuditEventResponse>

interface AuditEventResponse {
  id: string;
  actorId: string;
  actorRole: string | null;
  actorOrgId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  fromState: string | null;
  toState: string | null;
  payloadSnapshot: Record<string, unknown> | null;
  humanReason: string | null;
  aiRecommendationId: string | null;
  requestTraceId: string | null;
  createdAt: string;
}
```

### 17.2 `GET /api/v1/audit/ai-decision-trace/:challengeId`

The full AI→human decision trace for one challenge: every recommendation, which human acted on it, and the audit events linking them.

```typescript
interface AiDecisionTraceResponse {
  challengeId: string;
  events: {
    recommendation: AiRecommendationResponse | null;
    humanDecision: ValidationResponse | null;
    auditEvent: AuditEventResponse;
  }[];
}
```

---

## 18. Auth Endpoints

### 18.1 `POST /api/v1/auth/sync`

Called by the client after Firebase sign-in. The server verifies the Firebase token, upserts the user profile, and returns the identity bundle.

```typescript
// Request: no body (token in Authorization header)
// Response: 200 {
//   ok: true,
//   data: {
//     user: UserResponse,
//     roles: string[],
//     organization: { id: string; name: string; type: string } | null,
//     geoScopes: { scopeType: string; districtCode: string | null; blockCode: string | null }[],
//     permissions: string[]
//   }
// }

interface UserResponse {
  id: string;
  firebaseUid: string;
  name: string;
  email: string | null;
  phone: string | null;             // null when not authorized to see
  avatarUrl: string | null;
  languagePref: string;
  createdAt: string;
}
```

### 18.2 `GET /api/v1/auth/me`

Return the current user's profile + identity bundle (same shape as sync response).

### 18.3 `PATCH /api/v1/auth/me`

Update own profile (name, language, avatar).

```typescript
interface UpdateProfileRequest {
  name?: string;
  languagePref?: string;
  avatarUrl?: string;
}
```

---

## 19. Admin Endpoints (super_admin only)

These are internal platform administration endpoints, scoped to the `SUPER_ADMIN` role. They are not consumed by any portal UI except the admin dashboard.

### 19.1 `POST /api/v1/admin/users/:id/roles`

Grant or revoke a role.

```typescript
interface ManageRoleRequest {
  role: string;                     // UserRole enum value
  action: "GRANT" | "REVOKE";
}
```

### 19.2 `PATCH /api/v1/admin/users/:id/geo-scopes`

Set the geo scopes for a user.

```typescript
interface UpdateGeoScopesRequest {
  scopes: {
    scopeType: string;
    districtCode?: string;
    blockCode?: string;
  }[];
}
```

### 19.3 `GET /api/v1/admin/config`

List runtime configuration (`app_config` rows).

### 19.4 `PATCH /api/v1/admin/config/:key`

Update a runtime configuration value.

```typescript
interface UpdateConfigRequest {
  value: Record<string, unknown>;
}
```

### 19.5 `GET /api/v1/admin/stats`

Platform-wide statistics (total challenges, active projects, resolution rate, etc.).

### 19.6 `POST /api/v1/admin/challenges/:id/escalate`

Manually escalate a challenge to FAILED/STALLED (gov coordinator or super admin).

```typescript
interface EscalateRequest {
  reason: string;
  correctiveAction?: string;
}
// Headers: If-Match: <version>
```

---

## 20. Job Status Endpoint

Long-running operations (AI analysis, matching) return a `jobId`. This endpoint polls job status.

```typescript
// GET /api/v1/jobs/:jobId
// Response: 200 {
//   ok: true,
//   data: {
//     id: string;
//     type: string;                   // "ai:understand" | "ai:match" | ...
//     status: string;                 // "pending" | "running" | "completed" | "failed"
//     result: Record<string, unknown> | null;
//     error: string | null;
//     createdAt: string;
//     completedAt: string | null;
//   }
// }
```

---

## 21. Health Check

```typescript
// GET /api/v1/health
// Response: 200 {
//   ok: true,
//   data: {
//     status: "healthy",
//     version: "0.1.0",
//     uptime: number,
//     dependencies: {
//       postgres: "ok",
//       redis: "ok",
//       gcs: "ok"
//     }
//   }
// }
```

No authentication required.

---

## 22. Transition Action Catalogue

The complete list of actions accepted by `POST /api/v1/challenges/:id/transition`, with their required `payload` shape:

| Action | Required payload | Guard notes |
| --- | --- | --- |
| `challenge:understand` | *(none)* | auto-triggered; system-only |
| `challenge:validate` | `{ reason?: string }` | AI analysis must be present |
| `challenge:requestClarification` | `{ questions: Record<string, unknown> }` | |
| `challenge:resubmit` | `{ clarificationResponse: Record<string, unknown> }` | submitter only |
| `challenge:reject` | `{ reason: string }` | reason required |
| `challenge:cluster` | `{ clusterId?: string }` | system or reviewer |
| `challenge:prioritize` | `{ score: number, factors: Record<string, unknown> }` | coordinator |
| `challenge:match` | *(none)* | triggers matching engine |
| `matching:accept` | `{ universityId: string }` | university admin of that org |
| `matching:decline` | `{ universityId: string, reason?: string }` | auto-rematch |
| `team:create` | `{ members: TeamMemberInput[] }` | faculty of accepted university |
| `proposal:submit` | `{ title, contentMd, docRef? }` | team members |
| `proposal:approve` | `{ reviewNotes?: Record<string, unknown> }` | university authority |
| `proposal:requestRevision` | `{ revisionRequest: Record<string, unknown> }` | university authority |
| `project:prototype` | `{ summary, evidenceUrls? }` | project members |
| `project:pilot` | `{ location, districtCode, metrics? }` | faculty lead |
| `project:validate` | `{ outcome: "SUCCESS" \| "NEEDS_IMPROVEMENT", metrics?, evidenceUrls? }` | gov + experts |
| `validation:confirm` | `{ report: Record<string, unknown> }` | gov decision-maker |
| `deployment:approve` | `{ districtCode, approvalRef? }` | gov decision-maker |
| `impact:verify` | *(none)* | triggers impact verification |
| `challenge:close` | `{ closurePackage: Record<string, unknown> }` | coordinator |
| `workflow:escalate` | `{ reason: string, riskThreshold?: string }` | coordinator |
| `workflow:resolve` | `{ reason: string, correctiveAction: string }` | coordinator |

---

## 23. Frontend → API Mapping

For the frontend migration (`BACKEND_ARCHITECTURE.md` §23), this table maps existing `workflowStore` methods to their API replacements:

| workflowStore method | API endpoint | Notes |
| --- | --- | --- |
| `addChallenge(c)` | `POST /api/v1/challenges` | Phase 1: dual-write; Phase 2: API only |
| `updateChallengeStatus(id, status)` | `POST /api/v1/challenges/:id/transition { action, payload }` | Status is now an action, never a raw set |
| `addProject(p)` | auto-created by `team:create` or `proposal:approve` transition | No direct project creation endpoint |
| `addProposal(p)` | `POST /api/v1/projects/:projectId/proposals` | |
| `getChallenges()` | `GET /api/v1/challenges` | Phase 1: still reads from localStorage; Phase 2: polls this endpoint |
| `getProjects()` | `GET /api/v1/projects` | Same two-phase migration |

The `STORE_EVENT` CustomEvent mechanism continues to work in Phase 1 — it is triggered by the sync bridge after API writes succeed.

---

## 24. Endpoint Census

| Module | Endpoints | Auth required? |
| --- | --- | --- |
| Auth | 3 (sync, me, me-patch) | sync: no; others: yes |
| Challenge | 7 (create, read, read-list, update, delete, timeline, transition) | public read: no; others: yes |
| Evidence | 3 (presign, confirm, list) | yes |
| Validation | 1 (list) | yes |
| AI | 3 (recommendations, understand, vision) | yes |
| Cluster | 2 (list, detail) | yes |
| University | 2 (list, detail) | yes |
| Matching | 1 (run) | yes |
| Acceptance | 2 (create, list) | yes |
| Team | 4 (create, read, update-member, remove-member) | yes |
| Project | 2 (list, detail) | yes |
| Proposal | 4 (create, list, approve, request-revision) | yes |
| Milestone | 2 (list, update) | yes |
| Collaboration | 2 (create, list) | yes |
| Offer | 3 (create, accept, decline) | yes |
| Pilot | 2 (create, list) | yes |
| Deployment | 2 (create, list) | yes |
| Impact | 3 (create, list, verify) | yes |
| District/GIS | 4 (list, detail, spatial, heatmap) | spatial+heatmap: no |
| Notification | 4 (list, unread-count, read, read-all) | yes |
| Audit | 2 (query, ai-decision-trace) | admin only |
| Admin | 6 (roles, geo-scopes, config, config-update, stats, escalate) | super_admin |
| Jobs | 1 (poll status) | yes |
| Health | 1 | no |

**Total: 56 endpoints** across 24 groups.

---

## 25. Status

**Complete.** All endpoints, request/response types, error format, pagination, concurrency, upload flow, transition catalogue, and frontend migration mapping are defined.

**What this doc deliberately leaves to later docs:**
* Concrete RBAC rows that gate each endpoint → `RBAC_MATRIX.md`
* Rate-limit tiers per endpoint → `SECURITY_ARCHITECTURE.md`
* GIS spatial query implementation details → `GIS_ARCHITECTURE.md`