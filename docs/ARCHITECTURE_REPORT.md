# Nivaaran — Comprehensive Architecture Report

> **Project:** Nivaaran — Smart Societal Innovation Platform (SIH Problem Statement 26043)
> **Government of Jharkhand, Department of Higher & Technical Education**
> **Scope:** Backend Architecture · Database Design · API Contracts · AI Architecture · System Architecture · RBAC Matrix · GIS Architecture · Security Architecture
> **Generated:** 2026-09-04

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Backend Architecture](#2-backend-architecture)
3. [Database Design](#3-database-design)
4. [API Contracts](#4-api-contracts)
5. [AI Architecture](#5-ai-architecture)
6. [RBAC Matrix](#6-rbac-matrix)
7. [GIS Architecture](#7-gis-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Source Code Structure](#10-source-code-structure)
11. [Flagship End-to-End Demo Problem: Tupudana Culvert Failure Case Study](#11-flagship-end-to-end-demo-problem-tupudana-culvert-failure-case-study)

---

## 1. System Architecture Overview

### 1.1 Core Identity

Nivaaran is a **Smart Societal Innovation Platform** that connects societal problems reported by citizens with the institutions, people, and resources needed to solve them. The platform is scoped to **Jharkhand State** (24 districts) and themed around **Disaster Management**, though it supports broader societal challenges.

The central transformation is:

**Problem → AI Understanding → Validation → Dedup/Clustering → Prioritization → Institution Matching → University Acceptance → Team Formation → Proposal → Industry Collaboration → Prototype → Pilot → Validation → Deployment → Impact Measurement → Closure**

This is a **16-stage lifecycle** that the platform's workflow engine enforces as an authoritative state machine.

### 1.2 Architectural Style: Modular Monolith

Nivaaran is built as a **modular monolith** — a single deployable API process with 13 business modules, each with clear internal boundaries and a well-defined interface. This is a deliberate choice:

- **Single deployable** simplifies operations for a government team without dedicated DevOps
- **Module boundaries** are enforced by code structure and import rules, not network calls
- **Future extraction** to microservices is possible when scale justifies it (each module has its own service layer and repository)
- **No network hop** between modules — critical for a government platform with variable connectivity

### 1.3 The 13 Business Modules

| Module | Responsibility |
|---|---|
| **Auth** | Firebase Auth verification, identity bundle construction, RBAC |
| **Challenge** | Challenge CRUD, lifecycle transitions, evidence management |
| **Validation** | Human review decisions, clarification requests |
| **Cluster** | Deduplication clustering, similarity management |
| **Priority** | Priority scoring, factor computation |
| **Matching** | University/HEI matching, acceptance tracking |
| **Project** | Project lifecycle (proposal → prototype → pilot → deployment → impact) |
| **Team** | Team formation, member management |
| **AI** | Provider-agnostic AI interface, recommendation storage |
| **GIS** | District/block boundaries, spatial queries, point-in-polygon |
| **Analytics** | District heatmap, pre-aggregated reporting |
| **Notification** | Event-driven notifications |
| **Admin** | Platform administration (roles, config, escalation) |

### 1.4 The 4 Architectural Layers

```
┌─────────────────────────────────────────────────────┐
│  CLIENT LAYER                                       │
│  React 18 + TypeScript + Tailwind CSS + Leaflet     │
│  5 portals (Citizen, Gov, Univ, Industry, Admin)    │
├─────────────────────────────────────────────────────┤
│  API LAYER (Modular Monolith)                       │
│  Express 5 + Zod validation + Prisma ORM            │
│  56 endpoints across 24 groups                      │
├─────────────────────────────────────────────────────┤
│  DATA LAYER                                         │
│  PostgreSQL 16 + PostGIS + Redis 7 (BullMQ)         │
│  Firebase Auth (identity) + GCS/MinIO (storage)     │
├─────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                     │
│  Docker + Nginx + TLS/HSTS + Prometheus + Grafana   │
│  OpenTelemetry spans, structured pino logging       │
└─────────────────────────────────────────────────────┘
```

### 1.5 The Central Object: Challenge

The **challenge** is the root entity of the entire system. Every other resource is either owned by or linked to a challenge:

```
Challenge
├── evidence[]          (photos, video, documents, telemetry)
├── validations[]       (human review decisions)
├── aiRecommendations[] (AI understanding, similarity, prioritize, match, vision)
├── clusters[]          (dedup group membership)
├── project             (one-to-one after university acceptance)
│   ├── team
│   ├── milestones[]
│   ├── proposals[]
│   ├── collaborations[]
│   ├── offers[]
│   ├── pilots[]
│   ├── deployments[]
│   └── impactRecords[]
└── auditEvents[]       (append-only lifecycle trace)
```

### 1.6 Data Flow Architecture

```
Citizen submits challenge
        │
        ▼
  [POST /api/v1/challenges]
        │
        ▼
  Prisma → Challenge row (status=SUBMITTED)
        │
        ▼
  BullMQ → ai.understand job
        │
        ▼
  AI worker → AiRecommendation(kind=UNDERSTAND)
        │
        ▼
  Human reviews → POST /api/v1/challenges/:id/transition {action: "challenge:validate"}
        │
        ▼
  Transaction: update status + create Validation row + create audit event + create outbox event
        │
        ▼
  Outbox → Redis → notifications, next jobs, analytics
```

### 1.7 Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Database** | PostgreSQL 16 + PostGIS (not MongoDB) | Relational state machine needs, audit trail integrity, PostGIS maturity, multi-project joins |
| **Workflow Engine** | Authoritative server-side state machine | Prevents client-side state manipulation; 22 explicit transition edges |
| **AI** | Provider-agnostic interface, AI recommends → human decides | Accountability; AI never mutates critical state |
| **AuthN** | Firebase Auth (identity only) | Google identity infrastructure; server verifies every token |
| **AuthZ** | RBAC with 12 roles + 40+ capabilities | Government-grade separation of duties |
| **Async** | BullMQ + Redis | Exponential backoff, dead-letter queue, retry with `attempt_count` |
| **Storage** | GCS (prod) / MinIO (dev) | Pre-signed PUT/GET, private-by-default buckets |
| **Frontend** | React 18 + Tailwind CSS + Leaflet | Role-based portals, civic color palette, multilingual (Hindi/English + tribal languages) |
| **Geography** | PostGIS in primary database | Single source of truth for all spatial data |

---

## 2. Backend Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Runtime** | Node.js | 20 LTS |
| **Language** | TypeScript | strict mode |
| **Framework** | Express | 5.x |
| **Validation** | Zod | — |
| **ORM** | Prisma | — |
| **Database** | PostgreSQL | 16 + PostGIS |
| **Cache/Queue** | Redis | 7 (BullMQ) |
| **Auth** | Firebase Admin SDK | — |
| **Storage** | GCS / MinIO | — |
| **Logging** | pino | — |
| **Observability** | OpenTelemetry + Prometheus + Grafana | — |
| **Testing** | Vitest + Supertest + Testcontainers | — |
| **Build** | Docker | — |

### 2.2 High-Level Topology

```
[Browser] ──TLS──▶ [Nginx] ──▶ [Express API Monolith]
                              │    │    │    │
                              │    ├─ Prisma → PostgreSQL + PostGIS
                              │    ├─ BullMQ → Redis
                              │    ├─ Firebase Admin → Auth
                              │    └─ GCS/MinIO → Storage
                              │
                              │    ┌─ 13 Business Modules
                              │    │  ├─ Auth, Challenge, Validation
                              │    │  ├─ Cluster, Priority, Matching
                              │    │  ├─ Project, Team, AI
                              │    │  ├─ GIS, Analytics, Notification
                              │    │  └─ Admin
                              │    │
                              │    └─ 5 Async Workers
                              │       ├─ AI Worker
                              │       ├─ Match Worker
                              │       ├─ Notify Worker
                              │       └─ Impact Worker
                              │
                              └── Health Check (GET /api/health)
```

### 2.3 The 13 Module Map

Each module follows a consistent **routes → controller → service → repository** layered architecture:

| Module | Routes | Controller | Service | Key Files |
|---|---|---|---|---|
| Auth | `/api/v1/identity` | identity/controller | identity/service | `core/auth.ts` |
| Challenge | `/api/v1/challenges` | challenge/controller | challenge/service | `modules/challenge/` |
| Validation | `/api/v1/validations` | validation/controller | validation/service | `modules/validation/` |
| Cluster | `/api/v1/clusters` | cluster/controller | — | `modules/cluster/` |
| Priority | `/api/v1/priority` | priority/controller | — | `modules/priority/` |
| Matching | `/api/v1/matching` | matching/controller | — | `modules/matching/` |
| Project | `/api/v1/projects` | project/controller | project/service | `modules/project/` |
| Team | `/api/v1/teams` | team/controller | team/service | `modules/team/` |
| AI | `/api/v1/challenges/:id/ai` | ai/controller | ai/service | `modules/ai/` |
| GIS | `/api/v1/districts`, `/api/v1/analytics` | gis/controller | — | `modules/gis/` |
| Analytics | `/api/v1/analytics` | analytics/controller | — | `modules/analytics/` |
| Notification | `/api/v1/notifications` | notification/controller | — | `modules/notification/` |
| Admin | `/api/v1/admin` | admin/controller | — | `modules/admin/` |

### 2.4 The Authoritative Workflow Engine

The workflow engine is the **heart of the backend**. It is the sole authority for all state transitions, enforced through:

1. **Transition Registry** — 22 explicit edges in `workflow/registry.ts`, each with `from[]`, `to`, `action`, `requiredCapability`, `guardName`, `description`
2. **Guard Functions** — Preconditions checked before each transition (e.g., `submissionComplete`, `humanValidationReasonRequired`, `priorityComputed`)
3. **Optimistic Concurrency** — Every challenge has a `version` column; transitions require `If-Match` header, returning `409 CONFLICT` on mismatch
4. **Transactional Outbox** — Every successful transition writes to `audit_events` and `outbox_events` in the same database transaction

**Key invariant:** There is **no** `PATCH /challenges/:id` that writes `status` directly. Every status change goes through `POST /api/v1/challenges/:id/transition`.

### 2.5 The 22 Transition Edges

```
SUBMITTED → UNDER_REVIEW          (challenge:understand, system)
UNDER_REVIEW → VALIDATED          (challenge:validate, gov_validator)
UNDER_REVIEW → CLARIFICATION_REQUESTED (challenge:requestClarification)
CLARIFICATION_REQUESTED → UNDER_REVIEW (challenge:resubmit)
UNDER_REVIEW/SUBMITTED → REJECTED (challenge:reject)
VALIDATED → CLUSTERED             (challenge:cluster)
CLUSTERED → PRIORITIZED           (challenge:prioritize, gov_department)
PRIORITIZED → MATCHING            (challenge:match)
MATCHING → UNIVERSITY_ACCEPTED    (matching:accept, university)
MATCHING → MATCHING (self-loop)   (matching:decline, auto-rematch)
UNIVERSITY_ACCEPTED → TEAM_FORMING (team:create, faculty)
TEAM_FORMING → PROPOSAL_REVIEW    (proposal:submit)
PROPOSAL_REVIEW → PROJECT_ACTIVE  (proposal:approve)
PROPOSAL_REVIEW → TEAM_FORMING    (proposal:requestRevision)
PROJECT_ACTIVE → PROTOTYPE        (project:prototype)
PROTOTYPE → PILOT                 (project:pilot)
PILOT → VALIDATION_PENDING        (project:validate, gov)
PILOT → PROTOTYPE (back)          (project:validate, needsImprovement)
VALIDATION_PENDING → DEPLOYMENT_APPROVED (validation:confirm)
DEPLOYMENT_APPROVED → DEPLOYED    (deployment:approve)
DEPLOYED → IMPACT_VERIFIED        (impact:verify)
IMPACT_VERIFIED → CLOSED          (challenge:close)
// Branching
PROJECT_ACTIVE/PROTOTYPE/PILOT → FAILED (workflow:escalate)
FAILED → PROJECT_ACTIVE           (workflow:resolve)
```

### 2.6 Concurrency & Data Integrity

- **Optimistic locking:** `version` column on every mutable resource; `If-Match` header required; `409 STALE_VERSION` on conflict
- **Transactional outbox:** State change + audit event + outbox event in a single `prisma.$transaction()` — guarantees no orphaned events
- **10 workflow invariants** enforced as guard code (e.g., "AI analysis must be present before validation", "human reason required for rejection")

### 2.7 Async Processing (BullMQ)

| Queue | Job Type | Retry | Backoff |
|---|---|---|---|
| `ai.understand` | Classify challenge | 3 attempts | Exponential [2s, 4s, 8s...] |
| `ai.match` | Rank HEIs | 3 attempts | Exponential |
| `ai.embed` | Index for dedup | 3 attempts | Exponential |
| `notify` | Send notifications | 3 attempts | Exponential |
| `impact` | Process impact | 3 attempts | Exponential |

- **Dead-letter queue** after max attempts — never silently dropped
- **`attempt_count`** persisted on `AiRecommendation` for observability
- AI failures **never block** the challenge lifecycle (Invariant 10)

### 2.8 Per-Module Layered Architecture

```
routes/     → Express router, HTTP parsing, Zod validation
controller/ → HTTP handler, calls service, returns JSON
service/    → Business logic, orchestrates repository calls
repository/ → Prisma queries, data access
```

### 2.9 API Boundary

The API is the **sole entry point** for all clients. The backend is the authorization boundary — the browser never asserts identity, role, or permission. External services (AI, email, SMS) are reached through the provider registry, never directly by clients.

---

## 3. Database Design

### 3.1 Technology Choice

**PostgreSQL 16 + PostGIS** was chosen over the earlier MongoDB proposal for four reasons:

1. **Relational state machine needs** — The workflow engine requires ACID transactions across multiple tables (challenge status + audit + outbox)
2. **Audit trail integrity** — Append-only audit tables with referential integrity constraints
3. **PostGIS maturity** — Native spatial types (`geometry`), GiST indexes, and spatial functions (`ST_Contains`, `ST_MakeEnvelope`, `ST_DWithin`)
4. **Multi-project joins** — Challenges, projects, teams, proposals, milestones all need relational joins

### 3.2 Complete Table Census (32 Tables)

#### Core Domain (Users, Organizations, Challenges)
| Table | Purpose |
|---|---|
| `users` | User profiles, PII encrypted at rest |
| `organizations` | Orgs (universities, NGOs, govt, industry) |
| `universities` | University profiles (NAAC grades, capacity) |
| `departments` | Department listings within universities |
| `challenges` | Root entity — all societal challenges |
| `submissions` | Raw submission payload (immutable) |
| `challenge_evidence` | Photos, video, audio, documents, telemetry |
| `districts` | 24 Jharkhand districts with boundary polygons |
| `blocks` | Block-level boundaries |
| `app_config` | Runtime configuration (tunable without deploy) |

#### Workflow / AI / Validation
| Table | Purpose |
|---|---|
| `ai_recommendations` | AI output (append-only, superseded-by chain) |
| `validations` | Human review decisions (one per review) |
| `clusters` | Dedup clusters |
| `cluster_members` | Challenges in a cluster |
| `university_acceptances` | University acceptances/declines |

#### Project Lifetime
| Table | Purpose |
|---|---|
| `projects` | Solution projects (linked to challenge) |
| `teams` | Project teams |
| `team_members` | Team membership |
| `proposals` | Solution proposals |
| `milestones` | Project milestones |
| `collaborations` | Collaboration needs |
| `offers` | Partner offers |
| `pilots` | Pilot records |
| `deployments` | Deployment approvals |
| `impact_records` | Measured impact metrics |

#### Platform Services
| Table | Purpose |
|---|---|
| `audit_events` | Append-only audit trail (7-year retention) |
| `outbox_events` | Transactional event queue |
| `app_notifications` | User notifications |
| `roles` | RBAC roles |
| `permissions` | RBAC capabilities |
| `role_permissions` | Role-permission mappings |
| `user_roles` | User-role assignments |
| `user_geo_scopes` | Geographic scope per user |
| `refresh_tokens` | Server-side refresh tokens (hashed) |
| `challenge_comments` | Challenge comments |

### 3.3 Key Enums (17)

```typescript
// Workflow status (19 stages)
enum ChallengeStatus {
  SUBMITTED, UNDER_REVIEW, CLARIFICATION_REQUESTED, REJECTED,
  CLUSTERED, PRIORITIZED, MATCHING, UNIVERSITY_ACCEPTED,
  TEAM_FORMING, PROPOSAL_REVIEW, PROJECT_ACTIVE,
  PROTOTYPE, PILOT, VALIDATION_PENDING, DEPLOYMENT_APPROVED,
  DEPLOYED, IMPACT_VERIFIED, CLOSED, FAILED
}

// User roles (12 + SUPER_ADMIN)
enum UserRole { CITIZEN, COMMUNITY_NGO, PRI, ULB, GOV_VALIDATOR,
  GOV_DEPARTMENT, UNIVERSITY, FACULTY, STUDENT, INDUSTRY, CSR, LAB }

// AI kinds
enum AiKind { UNDERSTAND, EMBED, SIMILARITY, PRIORITIZE, MATCH, VISION }

// Validation decisions
enum ValidationDecision { VALID, NEEDS_CLARIFICATION, INVALID, DEFER }

// Evidence types
enum EvidenceType { PHOTO, VIDEO, AUDIO, DOCUMENT, TELEMETRY, GEOTAG }

// Project lifecycle statuses
enum ProjectStatus { DRAFT, ACTIVE, COMPLETE, ARCHIVED }
// ... and more
```

### 3.4 PostGIS Setup

**One-time raw migration:**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Spatial columns (Prisma `Unsupported` pass-through):**
```prisma
location      Unsupported("geometry(Point,4326)")?     // challenges
boundary      Unsupported("geometry(MultiPolygon,4326)")? // districts, blocks
centroid      Unsupported("geometry(Point,4326)")?     // districts
```

**GiST Indexes:**
```sql
CREATE INDEX idx_challenges_location_gist ON challenges USING gist (location);
CREATE INDEX idx_districts_boundary_gist ON districts USING gist (boundary);
CREATE INDEX idx_blocks_boundary_gist ON blocks USING gist (boundary);
```

### 3.5 Data Integrity Design

| Principle | Implementation |
|---|---|
| **Append-only audit** | DB trigger `trg_audit_append_only` prevents UPDATE/DELETE on `audit_events` |
| **Soft delete** | `deleted_at` column on challenges/evidence; never physically removed |
| **PII encryption** | AES-256-GCM per value; phone/email encrypted at application layer |
| **7-year retention** | `audit_events` retained for 7 years (`AUDIT_RETENTION_YEARS` in `app_config`) |
| **Monthly partitioning** | `audit_events` range-partitioned at ~1M rows |
| **Transactionality** | All state changes + audit + outbox in a single DB transaction |
| **Optimistic locking** | `version` column prevents lost updates |
| **Referential integrity** | Foreign key constraints on all relations |

### 3.6 Migration Strategy

- **`seed:demo`** — Seeded data for hackathon demo: 24 districts, 30 universities, challenges, RBAC roles
- **`seed:prod`** — Production seed from official SoI/NIC boundary files, real university data
- Boundary data source switchable via `app_config` key `gis.boundary_source`

---

## 4. API Contracts

### 4.1 Base Conventions

- **Base path:** `/api/v1` (all endpoints versioned)
- **Auth:** `Authorization: Bearer <firebase-id-token>` on all endpoints except `GET /api/v1/health` and public reads
- **Success:** `{ ok: true, data: T }` JSON envelope
- **Error:** `{ ok: false, error: { code, message, details?, traceId? } }`
- **Pagination:** Cursor-based default (default 20, max 100); offset for admin/export
- **Concurrency:** `If-Match: <version>` header on all mutations; `409 STALE_VERSION` on conflict
- **Idempotency:** `Idempotency-Key` header recommended for transitions
- **Total endpoints:** 56 across 24 groups

### 4.2 Public vs Authenticated Surface

| Endpoint | Auth Required | Purpose |
|---|---|---|
| `GET /api/v1/health` | No | Health check |
| `GET /api/v1/challenges` (public read) | No | Public challenge feed |
| `GET /api/v1/challenges/:id` | No (public fields only) | Public challenge detail |
| `GET /api/v1/districts` | No | District list |
| `GET /api/v1/districts/:code` | No | District detail + boundary |
| `GET /api/v1/challenges/spatial` | No | Spatial query (bbox) |
| `GET /api/v1/analytics/district-heatmap` | No | District heatmap |
| All others | Yes | Everything else |

### 4.3 The Transition Endpoint

**The single endpoint for all workflow state changes:**

```
POST /api/v1/challenges/:id/transition
Headers: If-Match: <version>, Idempotency-Key: <uuid>
Body: { action: string, payload?: Record<string, unknown> }
Response: { challenge, appliedAction, fromStatus, toStatus, availableTransitions, auditEventId, outboxEventId }
```

**Complete transition action catalogue (22 actions):**

| Action | Actor | Guard |
|---|---|---|
| `challenge:understand` | System | `submissionComplete` |
| `challenge:validate` | Gov Validator | `humanValidationReasonRequired` |
| `challenge:requestClarification` | Gov Validator | `reasonRequired` |
| `challenge:resubmit` | Citizen | `clarificationPayloadProvided` |
| `challenge:reject` | Gov Validator | `reasonRequired` |
| `challenge:cluster` | System/Reviewer | `alwaysAllow` |
| `challenge:prioritize` | Gov Department | `priorityComputed` |
| `challenge:match` | System | `alwaysAllow` |
| `matching:accept` | University | `universityAdminScope` |
| `matching:decline` | University | `autoRematch` |
| `team:create` | Faculty | `minTeamSeeded` |
| `proposal:submit` | Team | `documentAttached` |
| `proposal:approve` | University | `universityAuthority` |
| `proposal:requestRevision` | University | `revisionNotes` |
| `project:prototype` | Project members | `proposalApproved` |
| `project:pilot` | Faculty lead | `prototypeDeliverable` |
| `project:validate` | Gov + Experts | `pilotSuccess` |
| `validation:confirm` | Gov Decision-maker | `reportApproved` |
| `deployment:approve` | Gov | `deploymentPlan` |
| `impact:verify` | Gov | `metricsEvidence` |
| `challenge:close` | Coordinator | `closurePackage` |
| `workflow:escalate` | Coordinator | `overdueOrRisk` |
| `workflow:resolve` | Coordinator | `correctiveAction` |

### 4.4 Error Format

```typescript
interface ErrorResponse {
  ok: false;
  error: {
    code: string;       // VALIDATION_ERROR, CONFLICT, NOT_FOUND, FORBIDDEN,
                        // UNAUTHORIZED, RATE_LIMITED, UPSTREAM_FAILURE, STALE_VERSION,
                        // WORKFLOW_STATE, ORG_SCOPE, GEO_SCOPE, RESOURCE_SCOPE
    message: string;
    details?: Record<string, string[]>;  // Zod field-level errors
    traceId?: string;
  };
}
```

### 4.5 Key Endpoint Groups

| Group | Endpoints | Auth |
|---|---|---|
| Auth | 3 (sync, me, me-patch) | sync: no |
| Challenge | 7 (create, read, list, update, delete, timeline, transition) | public read |
| Evidence | 3 (presign, confirm, list) | Yes |
| Validation | 1 (list) | Yes |
| AI | 3 (recommendations, understand, vision) | Yes |
| Cluster | 2 (list, detail) | Yes |
| University | 2 (list, detail) | Yes |
| Matching | 1 (run) | Yes |
| Acceptance | 2 (create, list) | Yes |
| Team | 4 (create, read, update-member, remove) | Yes |
| Project | 2 (list, detail) | Yes |
| Proposal | 4 (create, list, approve, request-revision) | Yes |
| Milestone | 2 (list, update) | Yes |
| Collaboration | 2 (create, list) | Yes |
| Offer | 3 (create, accept, decline) | Yes |
| Pilot | 2 (create, list) | Yes |
| Deployment | 2 (create, list) | Yes |
| Impact | 3 (create, list, verify) | Yes |
| District/GIS | 4 (list, detail, spatial, heatmap) | spatial+heatmap: no |
| Notification | 4 (list, unread-count, read, read-all) | Yes |
| Audit | 2 (query, ai-decision-trace) | Admin |
| Admin | 6 (roles, geo-scopes, config, stats, escalate) | Super Admin |
| Jobs | 1 (poll status) | Yes |
| Health | 1 | No |

### 4.6 Public Challenge Projection

```typescript
interface PublicChallengeSummary {
  id: string; title: string; category: string;
  districtCode: string; publicStatusLabel: string;
  priorityScore: number | null; createdAt: string;
}
```

The public projection **never** includes: internal AI confidence, reviewer notes, private evidence URLs, submitter identity, or internal status labels.

---

## 5. AI Architecture

### 5.1 Core Principle

> **AI recommends. Humans decide. The backend records both.**

AI never mutates challenge state directly. AI produces a **recommendation row**; an authorized human actor turns that recommendation into a **workflow transition**. The engine records the audit trace that joins the two.

### 5.2 The `AIProvider` Interface

```typescript
interface AIProvider {
  understand(input) → { summary, domain, subDomain, tags, entities, severity, urgency, confidence, reasons }
  embed(text)       → EmbeddingVector
  similarity(a, b)  → { score, reasons }
  prioritize(c)     → { score, factors[], reasons, confidence }
  match(c, heis)    → RankedUniversity[]
  vision(evidence)  → { visualCategory, categoryCode, visionConfidence, detectedFeatures[] }
}
```

Each method maps to exactly one lifecycle concern and one `AiKind`:

| Method | Lifecycle Stage | `ai_recommendations.kind` |
|---|---|---|
| `understand` | AI Understanding → Validation | `UNDERSTAND` |
| `embed` | Dedup | (feeds `SIMILARITY`) |
| `similarity` | Dedup/Clustering | `SIMILARITY` |
| `prioritize` | Prioritization | `PRIORITIZE` |
| `match` | Matching | `MATCH` |
| `vision` | AI Understanding (evidence) | `VISION` |

### 5.3 MVP Provider: Deterministic Ports

The MVP ships **deterministic** server-side ports of the existing frontend engines, operating on real database data:

| Frontend Engine | Server Provider | Real Data |
|---|---|---|
| `aiTriageEngine.ts` — 60-domain taxonomy + 5-factor scorer | `understand` + `prioritize` | `challenges` table + `GOV_DOMAINS` taxonomy |
| `heiMatchingEngine.ts` — 4-factor HEI scorer | `match` | `universities` + `departments` tables |
| `aiVisionClassifier.ts` — canvas heuristics | `VISION` | `challenge_evidence` images |
| `deduplicationService.ts` — trigram + tag overlap | `embed` + `similarity` | `pg_trgm` GIN indexes |

**Key detail:** The 60 `GOV_DOMAINS` become a **seeded reference table** (not hardcoded constants). The 30-institution Jharkhand dataset is seeded into `universities`/`departments` (not frontend constants).

### 5.4 The 5-Factor Priority Scorer

```
priorityScore = min(100, Σ)

Factors:
  severity           max 20   (CRITICAL=20, HIGH=15, else=10)
  spatialRecurrence  max 20   (GIS cluster density)
  communityUpvotes   max 20   (min(20, floor(upvotes*0.5)))
  institutionalReadiness max 20
  urgency            max 20
```

Risk levels: `CRITICAL ≥85`, `HIGH ≥70`, `MEDIUM ≥50`, `STANDARD` else.

### 5.5 The 4-Factor HEI Matcher

```
scoreHEIMatch() = round(departmentFit(40%) + labFit(30%) + proximity(20%) + academic(10%))

departmentFit:  40 if university department includes challenge category
labFit:         30 if university lab tags include challenge tags
proximity:      min(20, 20 - distanceKm)
academic:       10 (A++), 7 (A+), 4 (else)
```

### 5.6 The `ai_recommendations` Table

```prisma
model AiRecommendation {
  id              String    @id @default(uuid())
  challenge_id    String    // FK → challenges
  kind            AiKind    // UNDERSTAND | SIMILARITY | PRIORITIZE | MATCH | VISION
  status          AiStatus  // PENDING | RUNNING | SUCCEEDED | FAILED | RETRYABLE
  result          Json?     // per-kind payload — AI output only, never a decision
  confidence      Decimal?  // Decimal(4,2) 0.00–0.99
  reasons         Json?
  model_version   String    // "deterministic-triage@1.4"
  superseded_by_id String?  // self-referencing chain (re-runs)
  error_message   String?
  attempt_count   Int       @default(0)
  completed_at    DateTime?
  created_at      DateTime  @default(now())
  validation      Validation? // the human decision that used this rec (≤1)
  audit_events    AuditEvent[]
}
```

**Append-only + superseding:** Never mutated after `SUCCEEDED`/`FAILED`. A re-run inserts a **new** row with `superseded_by_id` pointing to the stale one. The readable rec is the **head** of the chain (`WHERE superseded_by_id IS NULL`).

### 5.7 Confidence Thresholds (Policy Data)

| Policy Key | Default | Meaning |
|---|---|---|
| `ai.threshold.autoSuggest` | `0.85` | Above: shown pre-filled as strong suggestion |
| `ai.threshold.autoAct` | `0.97` | Reserved — disabled, never auto-transition |
| `ai.threshold.humanReview` | `< 0.85` | Flagged `needs_human_verification` |
| `ai.threshold.noDecision` | `< 0.5` | Advisory only |

**Critical rule:** There is **no** auto-transition in the MVP, regardless of confidence. Consequential transitions always require an authorized human `Validation`.

### 5.8 AI on BullMQ (Async Layer)

| Queue | Job | Input | Output |
|---|---|---|---|
| `ai.understand` | Classify challenge | `challengeId` | `AiRecommendation(kind=UNDERSTAND)` |
| `ai.embed` | Index for dedup | `challengeId` | embedding + `ai_tags` |
| `ai.dedup` | Compare to index | `challengeId` | `AiRecommendation(kind=SIMILARITY)` |
| `ai.prioritize` | Rescore | `challengeId` | `AiRecommendation(kind=PRIORITIZE)` |
| `ai.match` | Rank HEIs | `challengeId` | `AiRecommendation(kind=MATCH)` |

**Failure isolation (Invariant 10):** A failed AI job **never** corrupts the challenge row or blocks its lifecycle. The challenge is stored regardless of AI. If the worker is 10 minutes behind, the challenge is still in `VALIDATION_PENDING` — just without the AI summary yet.

### 5.9 Model Versioning

Every recommendation pins `model_version`: `provider-family@semver`
- `deterministic-triage@1.4` — understand + prioritize port
- `deterministic-hei@1.2` — match port
- `gemini-vision@1.5-flash` — when LLM/vision provider enabled

Version is written at **creation time** (not read time), so registry changes cannot retroactively rewrite history.

### 5.10 AI Observability

| Metric | Meaning |
|---|---|
| `ai_recommendations_total{kind,status}` | Throughput |
| `ai_recommendation_duration{kind}` | Provider latency |
| `ai_provider_failures{provider}` | Failures/retries |
| `ai_human_override_rate{kind}` | **Key quality signal** — fraction of decisions diverging from recommendation |
| `ai_low_confidence_rate` | Share needing human verification |

---

## 6. RBAC Matrix

### 6.1 Architecture

The RBAC system is **data-driven** — permissions are stored in the database (`roles`, `permissions`, `role_permissions`, `user_role_links`, `user_geo_scopes`), not hard-coded. Grant changes are a seed-row + migration change, not a code deploy.

**Authorization tuple:** `ROLE + ORGANIZATION + GEOGRAPHIC SCOPE + RESOURCE OWNERSHIP + WORKFLOW STATE`

Role alone is insufficient — it's the **first column** of the tuple. The other four are enforced by the `authorize` middleware's resolver chain.

### 6.2 The 12 Roles

| Role | Scope |
|---|---|
| `CITIZEN` | Self + reported challenges, public data |
| `COMMUNITY_NGO` | Org + its submitted challenges |
| `PRI` | Its panchayat block(s) |
| `ULB` | Its municipal jurisdiction |
| `GOV_VALIDATOR` | District(s), validation queue |
| `GOV_DEPARTMENT` | Portfolio of districts; decision powers |
| `UNIVERSITY` | Institution + members |
| `FACULTY` | Assigned projects, mentorship |
| `STUDENT` | Own team + assigned project |
| `INDUSTRY` | Org, partner projects |
| `CSR` | Org, partner projects, funding |
| `LAB` | Org, partner collaborations |
| `SUPER_ADMIN` | Platform administration only (**never** government decision powers) |

### 6.3 Hard Separations

1. **Super Admin ≠ Decision-maker:** `SUPER_ADMIN` cannot validate, prioritize, or decide challenges as a government actor. Admin privilege does not collapse the matrix.
2. **Validator ≠ Department:** `GOV_VALIDATOR` owns the front of funnel (validate, clarify, reject, defer, cluster). `GOV_DEPARTMENT` owns the end of funnel (prioritize, deploy approve, close, escalate). One officer cannot both validate a claim and unilaterally approve its deployment.
3. **University Admin ≠ Faculty:** Admin manages institutional profile; faculty mentors academic projects.

### 6.4 Capability Catalogue (~40 Capabilities)

Capabilities are the discrete, grantable verbs. Every workflow action has exactly one capability governing it:

- **Challenge lifecycle:** `challenge:submit`, `challenge:validate`, `challenge:reject`, `challenge:prioritize`, `challenge:match`, `challenge:close`, `challenge:escalate`, `challenge:resolve`
- **Project/uni:** `matching:accept`, `matching:decline`, `team:create`, `proposal:submit`, `proposal:approve`, `project:prototype`, `deployment:approve`, `impact:verify`
- **Collaboration:** `collab:postNeed`, `collab:offer`, `collab:accept`, `collab:mentor`, `collab:test`, `collab:supportDeploy`
- **Platform/data:** `data:viewPublicAnalytics`, `data:viewGovAnalytics`, `data:viewPrivate`, `evidence:readPrivate`, `taxonomy:manage`, `workflows:configure`

### 6.5 The `authorize` Middleware

```typescript
function authorize(capability: string, resolver?: Resolver) {
  return async (req, res, next) => {
    const ctx = req.auth;  // identity bundle from AuthMiddleware

    // 1. Role check — is capability granted to ANY caller role?
    if (!ctx.permissions.has(capability)) throw 403;

    // 2. Organization scope — resource.orgId ∈ caller's authorized orgs
    // 3. Geographic scope — resource.district/block ∈ ctx.geoScopes
    // 4. Resource ownership — owner | member | assigned | partner
    // 5. Workflow state — resource.status ∈ legal-source-states(action)

    if (resolver) { const verdict = await resolver(ctx, req.resource); if (!verdict.allowed) throw 403; }
    next();
  };
}
```

**Hard-deny default:** Closed whitelist. No wildcard path. No `else-allowed`. If a capability is not in `ctx.permissions`, the answer is **403**, unconditionally. `SUPER_ADMIN`'s non-grant of decision capabilities is a true denial, not an override.

### 6.6 Data Visibility Classes

| Visibility Class | Requires | Examples |
|---|---|---|
| `PUBLIC` | `challenge:readPublic` | Public challenge title/location/status |
| `PARTICIPANT` | `project:readPartner` + ownership | Project discussions, team info |
| `ORGANIZATIONAL` | `data:viewInternalOrg` + org | Internal university notes |
| `PRIVATE` | `data:viewPrivate` + explicit condition | Citizen contact, private evidence |

Privacy is enforced by **absence from the payload**, never by client-side filtering.

### 6.7 Role-Capability Map (Source Code)

The `core/auth.ts` implements the role-to-capability map as `ROLE_CAPABILITIES`:

```typescript
const ROLE_CAPABILITIES: Record<string, string[]> = {
  SUPER_ADMIN: ['challenge:close', 'challenge:validate', 'challenge:prioritize', 'deployment:approve', 'impact:verify', 'workflow:escalate', 'workflow:resolve'],
  GOV_VALIDATOR: ['challenge:validate', 'challenge:reject', 'challenge:requestClarification', 'challenge:understand', 'validation:confirm'],
  GOV_DEPARTMENT: ['challenge:prioritize', 'challenge:cluster', 'challenge:match', 'matching:accept', 'matching:decline', 'project:prototype', 'project:pilot', 'project:validate', 'deployment:approve', 'impact:verify', 'challenge:close'],
  UNIVERSITY: ['matching:accept', 'matching:decline'],
  FACULTY: ['proposal:submit', 'proposal:approve', 'proposal:requestRevision'],
  // ... CITIZEN, NGO, PRI, ULB, STUDENT, INDUSTRY, CSR, LAB
};
```

Permissions are computed as the **union** across all of a caller's roles. Denial is **not** unionable.

### 6.8 Transition → Capability Mapping

Every transition action in `workflow/registry.ts` has a `requiredCapability` field. The `transitionChallenge()` function in `workflowEngine.ts` checks `authContext.permissions.has(rule.requiredCapability)` before allowing the transition. This closes the loop: **no transition can fire without a granular capability behind it**.

---

## 7. GIS Architecture

### 7.1 PostGIS as First-Class Subsystem

GIS is not a bolted-on map widget — it is a **core capability** enabling spatial challenge assignment, district/block filtering, heatmap analytics, geographic clustering, and disaster context.

**All spatial data lives in PostGIS inside the primary Postgres database.** There is no second geo store.

### 7.2 PostGIS Schema

**Extension (one-time raw migration):**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Spatial columns:**
| Table | Column | Type | Purpose |
|---|---|---|---|
| `challenges` | `location` | `geometry(Point,4326)` | Citizen GPS pin |
| `districts` | `boundary` | `geometry(MultiPolygon,4326)` | District polygon |
| `districts` | `centroid` | `geometry(Point,4326)` | Fast fallback center |
| `blocks` | `boundary` | `geometry(MultiPolygon,4326)` | Block polygon |

**GiST Indexes:**
```sql
CREATE INDEX idx_challenges_location_gist ON challenges USING gist (location);
CREATE INDEX idx_districts_boundary_gist ON districts USING gist (boundary);
CREATE INDEX idx_blocks_boundary_gist ON blocks USING gist (boundary);
```

GiST supports `&&` (bbox overlap), `ST_Contains`, `ST_Within`, `ST_DWithin`, `ST_Intersects`. Without these, spatial queries degrade to sequential scans.

### 7.3 The `Challenge.location` Lifecycle

| Stage | Location State |
|---|---|
| Submit (no GPS) | `location = NULL`; `district_code`/`block_code` from form |
| Submit (with GPS) | `location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)`; auto-attributed by point-in-polygon |
| AI vision (EXIF GPS) | Backfilled from `challenge_evidence.meta.gps` if `location IS NULL` |

**A challenge without a location is NOT blocked** — it enters the pipeline with district/block from the form. PostGIS enriches it later.

### 7.4 Point-in-Polygon Attribution

When a challenge is submitted with GPS coordinates, the server attributes it to its district/block:

```typescript
// backend/src/modules/gis/pointInPolygon.ts
export async function attributeDistrict(lon: number, lat: number): Promise<string | null> {
  const result = await prisma.$queryRaw`
    SELECT d.code FROM "District" d
    WHERE ST_Contains(d.boundary, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326))
    LIMIT 1
  `;
  return result?.[0]?.code ?? null;
}
```

The `ORDER BY ST_Area(d.boundary) ASC` ensures the smallest containing polygon is chosen (blocks before districts).

### 7.5 Spatial Query Patterns

**Bounding-box filter (map viewport):**
```sql
SELECT ... FROM challenges c
WHERE c.location && ST_MakeEnvelope(:west, :south, :east, :north, 4326)
ORDER BY c.priority_score DESC NULLS LAST LIMIT 200;
```
Uses `idx_challenges_location_gist`. The `&&` operator is the fastest spatial filter.

**Distance query ("nearby challenges"):**
```sql
SELECT ..., ST_Distance(c.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_meters
FROM challenges c
WHERE ST_DWithin(c.location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radius_meters)
ORDER BY distance_meters ASC LIMIT 50;
```
`::geography` cast makes `ST_DWithin` operate in **meters**.

**District-boundary challenges:**
```sql
SELECT ... FROM challenges c JOIN districts d ON d.code = c.district_code
WHERE d.code = :district_code ORDER BY c.priority_score DESC;
```
Uses **B-tree index** on `district_code` — PostGIS not needed since code is already stored.

### 7.6 Server-Side Heatmap

The server returns **pre-aggregated data** per district — client-side clustering is fragile and mobile-hostile.

```sql
SELECT c.district_code, COUNT(*) AS total,
       COUNT(*) FILTER (WHERE c.priority_score >= 8.5) AS critical,
       ...
FROM challenges c WHERE c.deleted_at IS NULL
GROUP BY c.district_code;
```

The frontend renders each district polygon with fill intensity proportional to counts. No PostGIS geometry is transferred to the client for the heatmap.

### 7.7 Geocoding Provider Interface

```typescript
interface Geocoder {
  geocode(query: string, districtHint?: string) → { lat, lng, confidence, source } | null;
  reverseGeocode(lat, lng) → { districtCode, blockCode, displayName } | null;
}
```

**MVP:** Offline reverse-geocoding from PostGIS (no external API key). Forward geocoding uses Nominatim or returns null.

**Production:** Swap to Google Geocoding / Mapbox / NIC behind the same provider registry interface.

### 7.8 Leaflet Frontend Integration

| API Endpoint | Response | Map Rendering |
|---|---|---|
| `GET /districts` | `{ code, name, centroid }` | District labels/markers |
| `GET /districts/:code` | `{ code, name, boundary: GeoJSON }` | District polygon overlay |
| `GET /challenges/spatial` | `[{ id, title, category, location }]` | Challenge pins + markercluster |
| `GET /analytics/district-heatmap` | `[{ districtCode, total, critical }]` | District fill intensity |

**The frontend never computes spatial queries itself.** All spatial logic is server-side. The only client-side spatial logic is `markercluster` grouping (pure rendering).

### 7.9 Geographic Scope: 24 Districts

```
Ranchi, Dhanbad, East Singhbhum, West Singhbhum, Bokaro, Giridih,
Hazaribagh, Koderma, Chatra, Latehar, Palamu, Garhwa,
Saraikela Kharsawan, Simdega, Gumla, Khunti, Dumka, Jamtara,
Deoghar, Godda, Sahibganj, Pakur, Lohardaga
```

A challenge's `district_code` must be one of the 24 valid codes (Zod enum check). A government officer's geo scope must be a subset of these districts.

### 7.10 GIS → Workflow Interaction

| Lifecycle Moment | GIS Role |
|---|---|
| Challenge submission | Point-in-polygon attributes district/block |
| AI understand | Vision backfills GPS from EXIF |
| Dedup/clustering | `ST_DWithin` as similarity signal |
| Prioritization | `spatialRecurrence` factor reads GIS density |
| Matching | University proximity uses `ST_Distance` |
| Pilot/Deployment | Location recorded for GIS-grounded tracking |
| Impact measurement | `district_code` spatial validation |
| Analytics | District heatmap aggregation |

### 7.11 Migration Path (Demo → Production)

| Aspect | Demo/Hackathon | Production |
|---|---|---|
| Boundary data | Simplified GeoJSON from `mapDataService.ts` | SoI/NIC official shapefiles |
| Geocoding | Offline PostGIS reverse-geocode only | PostGIS + production geocoder |
| Scale | ~100/day | ~10k/day (GiST handles easily) |
| Clustering | Client-side `markercluster` | Server-side `ST_ClusterWithin` if needed |
| Block boundaries | Optional | Required for PRI/ULB enforcement |

---

## 8. Security Architecture

### 8.1 Defense-in-Depth Model

Security is **defense in depth**: transport (TLS) → identity (Firebase) → authorization (server-only RBAC) → data-at-rest (encryption) → integrity (audit, append-only) → availability (rate limiting, isolation). No single layer is trusted alone.

### 8.2 Trust Boundaries

```
[Browser] ──TLS──▶ [LB/TLS] ──▶ [API Monolith] ──▶ [Postgres + PostGIS]
   │                    │                    │                │
   │ Firebase Auth      │                [Redis]          [GCS/MinIO]
   [Google identity]    └── trust boundary ◄── all authN/authZ here
```

**The browser is untrusted.** It may render whatever we serve, but it can never assert identity, role, or permission that the server does not independently prove.

### 8.3 Authentication (Identity-Only)

Firebase Auth is used **strictly for identity** — it never decides authorization.

1. Client authenticates with Firebase (Google/phone/email) → receives Firebase **ID token** (JWT)
2. Every API request sends `Authorization: Bearer <idToken>`
3. `AuthMiddleware` verifies token server-side with `firebase-admin`
4. Verified `sub` (firebase_uid) is joined/upserted into Postgres `users` row
5. Middleware loads **identity bundle** (`user`, `roles[]`, `org`, `geoScopes[]`, `permissions[]`) — cached in Redis (short TTL)
6. Only from that bundle does any downstream authorization derive

**Disabled/denied actors:** A user whose roles are removed is not authorized even with a valid Firebase token. Login ≠ access. Authorization re-reads the bundle every request.

### 8.4 PII Protection & Encryption at Rest

Citizen contact data (phone, email) is protected with **column-level encryption**:

| Aspect | Decision |
|---|---|
| Primitive | **AES-256-GCM** per value |
| Key | **Envelope encryption**: DEK wrapped by KEK held in KMS/vault |
| Nonce | Unique 12-byte IV per value (`ciphertext‖iv‖tag`) |
| Storage | `enc:{iv‖tag‖ct}` with key version |
| Decryption | Only service layer, for explicitly authorized subject |
| Key rotation | KEK version bump → re-encrypt DEKs; old DEK readable until re-encrypt |

```text
KEK (KMS/vault)
  │ wrap/unwrap
  ▼
DEK (app memory, short-lived) → AES-256-GCM per PII value
  │
  ▼
value_pii = enc { DEK, iv‖tag‖ciphertext }
```

A DB dump returns **ciphertext** — not phone numbers. Even full-table exfiltration does not expose PII without the DEK (and the DEK without the KEK).

**Data minimization:** `audit_events` does not copy PII — it stores `payload_snapshot` of structure/counters, not citizen contact.

### 8.5 Rate Limiting (Tiered, Redis-Backed)

| Tier | Applies to | Limits |
|---|---|---|
| Public/anonymous | Unauthenticated reads | 100 req/15min/IP |
| Authenticated | Citizens | 600 req/15min |
| Government | Validators/depts | 600 req/15min |
| Institutional | University/faculty | 600 req/15min |
| Administrative | Super admin/ops | 3000 req/15min |
| Auth endpoints | Any | 10 req/min/IP per credential |
| AI inference | AI endpoints | 30 req/5min |

### 8.6 Evidence Access Control

Evidence bytes live in **GCS (prod) / MinIO (dev)**, never in Postgres. The `challenge_evidence` table holds only `storage_ref` pointers.

**Upload flow:** Pre-signed PUT URL → client PUTs directly to storage → confirm → record metadata. Bytes never transit the API.

**Download flow:** Short-TTL signed URLs (5 min). Private evidence only for `evidence:readPrivate` grantees. URLs are response-scoped, never persisted, and expire quickly. All issuance is audited.

**Bucket default:** Private by default. No object is world-readable.

### 8.7 The Audit Trail as a Security Control

`audit_events` is a **security control**, not just accountability:

- **Append-only** enforced by DB trigger (`trg_audit_append_only`) — code cannot UPDATE/DELETE even by accident
- **Immutable:** Every consequential action writes `{ actor_id, actor_role, actor_org_id, action, resource_type, resource_id, from_state, to_state, human_reason, ai_recommendation_id, request_trace_id }`
- **7-year retention** (`AUDIT_RETENTION_YEARS` in `app_config`)
- **Monthly range-partitioned at ~1M rows** for queryability without unbounded growth
- **Anti-repudiation:** The join `Validation.ai_recommendation_id → ai_recommendations` proves *"AI suggested X; human decided Y based on Z"*

Audit is written **inside the same DB transaction** as the state change + outbox row — no orphaned audit rows.

### 8.8 Transport & Web Controls

- **HTTPS only**; TLS termination at load balancer; HSTS enforced
- **CORS** allow-list = known client origin(s) only (never `*`)
- **Clickjacking:** `X-Frame-Options: DENY` / CSP `frame-ancestors`
- **XSS:** CSP headers; user content stored as-is, encoded on render; `X-Content-Type-Options: nosniff`
- **SQL injection:** All queries via Prisma (parameterized); raw `$queryRaw` never interpolates user input
- **SSRF:** Provider registry fixes outbound hosts; no user-supplied URLs fetched
- **Secrets:** `.env` git-ignored, `.env.example` has placeholders only; production secrets in vault/KMS; `app_config` holds zero secrets

### 8.9 STRIDE Threat Model (Selected)

| # | Threat | Primary Controls |
|---|---|---|
| T1 | Identity spoofing | Firebase Auth, server-side token verify, refresh rotation |
| T2 | Privilege escalation | Server-only RBAC, closed whitelist |
| T3 | Workflow state tampering | Authoritative engine, transitions only, optimistic concurrency |
| T5 | PII disclosure | Encrypt-at-rest, visibility classes, projections |
| T6 | Private evidence disclosure | Private bucket, short-TTL signed URLs |
| T7 | DB compromise | PII column encryption ⇒ ciphertext |
| T14 | Repudiation of decisions | Audit records actor, role, org, AI link, reason |
| T16 | Data exfiltration via over-scoped responses | Projection-based read layer |

### 8.10 Failure & Availability

| Failure | Behavior |
|---|---|
| AI/notification/provider down | Challenge remains stored and lifecycle-consistent |
| Redis down | Cache miss only; committed transitions unaffected |
| DB is durable source of truth | Redis is never the only copy of anything that matters |
| Identity/RBAC cache unavailable | Middleware falls back to live DB resolution (fail-closed) |

---

## 9. Cross-Cutting Concerns

### 9.1 Observability

- **Structured logging:** pino with `traceId` correlation across all requests
- **OpenTelemetry:** Spans for AI calls, DB queries, transitions — visible in Grafana
- **Prometheus metrics:** Request rate, latency, errors per route; `ai_human_override_rate`, `ai_provider_failures`
- **Health check:** `GET /api/v1/health` reports DB, Redis, GCS status

### 9.2 Error Handling

All errors use the `ErrorResponse` envelope. Zod validation errors → `422 VALIDATION_ERROR` with field-level `details`. Workflow guard failures → `409 CONFLICT`. Authorization failures → `403 FORBIDDEN`. Unhandled errors → `500 INTERNAL_ERROR` with server-side logging.

### 9.3 Testing Strategy

- **Vitest + Supertest + Testcontainers** for integration tests
- **Golden rule:** The workflow engine is the most-tested component — every transition edge has a test
- **Unit tests** for each provider (`AIProvider`, `scorePriority`, `scoreHEIMatch`, `pointInPolygon`)
- **Testcontainers** for Postgres/PostGIS/Redis in CI

### 9.4 Deployment Shape

- **Docker** containerized
- **Nginx** as reverse proxy with TLS termination
- **Helmet** for security headers
- **Single process** (modular monolith) — no service mesh complexity
- **Future extraction:** Each module has its own service/repository layer, ready for extraction if scale demands it

### 9.5 Frontend → Backend Migration Path

The frontend currently uses a `workflowStore` with localStorage as a temporary store. The migration is **two-phase**:

**Phase 1:** Dual-write — backend API writes succeed, but frontend still reads from localStorage. `STORE_EVENT` CustomEvent mechanism continues.
**Phase 2:** API-only — frontend reads entirely from the backend. `workflowStore` methods map to API endpoints.

| workflowStore method | API endpoint |
|---|---|
| `addChallenge(c)` | `POST /api/v1/challenges` |
| `updateChallengeStatus(id, status)` | `POST /api/v1/challenges/:id/transition { action, payload }` |
| `addProject(p)` | Auto-created by `team:create` transition |
| `addProposal(p)` | `POST /api/v1/projects/:projectId/proposals` |
| `getChallenges()` | `GET /api/v1/challenges` |
| `getProjects()` | `GET /api/v1/projects` |

---

## 10. Source Code Structure

### 10.1 Backend (`backend/src/`)

```
backend/src/
├── core/                          # Cross-cutting infrastructure
│   ├── prisma.ts                  # Prisma client singleton
│   ├── auth.ts                    # AuthContext type + ROLE_CAPABILITIES + authenticate + authorize
│   ├── config.ts                  # Runtime configuration
│   ├── redis.ts                   # Redis client
│   ├── logger.ts                  # pino structured logger
│   ├── errors.ts                  # Custom error classes (NotFound, Forbidden, Conflict)
│   ├── rateLimiter.ts             # Tiered rate limiter (Redis-backed)
│   ├── workflowEngine.ts          # Authoritative workflow transition engine
│   ├── workers/                   # BullMQ workers (ai, match, notify, impact)
│   │   ├── ai-worker.ts
│   │   ├── match-worker.ts
│   │   ├── notify-worker.ts
│   │   └── impact-worker.ts
│   ├── workers/index.ts
│   └── outbox.ts                  # Transactional outbox pattern
├── middleware/
│   ├── auth.ts                    # AuthMiddleware + authorize middleware
│   └── requestId.ts               # Request ID + pino correlation
├── security/
│   ├── authorize.ts               # authorize(capability, resolver) enforcement
│   ├── encryption.ts              # AES-256-GCM encryptPII/decryptPII with scrypt key derivation
│   ├── capabilities.ts            # ~40 capability registry
│   └── resolvers.ts               # Resolver primitives: org, geo, ownership, workflow-state
├── workflow/                      # Workflow engine internals
│   ├── registry.ts                # 22 transition edges (TransitionRule[])
│   ├── guards.ts                  # Guard functions for each transition
│   └── payloads.ts                # Payload schemas
├── modules/                       # 13 business modules
│   ├── auth/                      # Identity controller + routes
│   ├── challenge/                 # Challenge CRUD + transitions
│   ├── validation/                # Validation decisions
│   ├── cluster/                   # Dedup clusters
│   ├── priority/                  # Priority scoring
│   ├── matching/                  # HEI matching
│   ├── project/                   # Project lifecycle
│   ├── team/                      # Team management
│   ├── ai/                        # AIProvider + AI service
│   │   ├── AIProvider.ts          # 60-domain taxonomy + 5-factor priority + 4-factor HEI match
│   │   └── service.ts             # storeRecommendation, submitAIJob
│   ├── gis/                       # GIS boundary queries
│   │   ├── controller.ts          # District heatmap + viewport filter
│   │   └── pointInPolygon.ts      # ST_Contains district attribution
│   ├── analytics/                 # Pre-aggregated analytics
│   │   └── controller.ts          # District heatmap endpoint
│   ├── admin/                     # Platform admin endpoints
│   ├── evidence/                  # Presign/confirm/evidence list
│   ├── milestone/                 # Milestone CRUD
│   ├── pilot/                     # Pilot records
│   ├── deployment/                # Deployment approvals
│   ├── impact/                    # Impact measurement
│   ├── collaboration/             # Collaboration needs/offers
│   ├── notification/              # User notifications
│   ├── prototype/                 # Prototype records
│   └── proposal/                  # Proposal submit/approve/revision
└── app.ts                         # Express app, helmet, cors, all route wiring

backend/prisma/seeds/
├── demo.ts                        # Demo seed data
├── prod.ts                        # Production seed
├── scenarios.ts                   # Flood + school canonical scenarios
├── regions.ts                     # 24 Jharkhand districts + admin blocks
└── rbac.ts                        # RBAC seed rows (mirrors RBAC_MATRIX.md)
```

### 10.2 Frontend (`frontend/src/`)

```
frontend/src/
├── App.tsx                        # Root orchestrator; role-based portal mounting
├── main.tsx                       # React DOM entry point
├── index.css                      # Tailwind directives
├── components/
│   ├── ProtectedRoute.tsx         # Secondary role assertion
│   ├── QuickReportModal.tsx       # Citizen challenge submission (glassmorphism)
│   ├── map/                       # Leaflet map integration
│   │   ├── JharkhandMapExplorer.tsx
│   │   ├── MapViewport.tsx
│   │   ├── MapSidebar.tsx
│   │   ├── ChallengePopupCard.tsx
│   │   └── JharkhandMapExplorer.tsx
│   ├── gov/                       # Government portal components
│   │   ├── ClusterReviewTab.tsx
│   │   ├── ProposalReviewTab.tsx
│   │   ├── DeploymentApprovalTab.tsx
│   │   └── ClosureTab.tsx
│   ├── citizen/                   # Citizen portal components
│   │   ├── CitizenHomeTab.tsx
│   │   ├── CitizenMyReportsTab.tsx
│   │   ├── CitizenRegionChatTab.tsx
│   │   ├── CitizenCommunityFeedTab.tsx
│   │   ├── CitizenLeaderboardTab.tsx
│   │   └── CitizenProfileTab.tsx
│   ├── university/                # University portal components
│   │   ├── UniversityIntakeTab.tsx
│   │   ├── MultidisciplinaryTeamTab.tsx
│   │   ├── ProposalManagerTab.tsx
│   │   └── StudentWorkspaceTab.tsx
│   ├── PortalUIStates.tsx
│   ├── IntroVideoSplash.tsx
│   ├── CertificateModal.tsx
│   ├── LoadingScreen.tsx
│   ├── ErrorBoundary.tsx
│   ├── PublicNavbar.tsx
│   └── CitizenNavbar.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx
│   └── portals/                   # 5 dedicated portal shells
│       ├── CitizenPortal.tsx
│       ├── GovPortal.tsx
│       ├── UniversityPortal.tsx
│       ├── IndustryPortal.tsx
│       ├── CommunityPortal.tsx
│       ├── LabPortal.tsx
│       ├── PRIPortal.tsx
│       ├── ULBPortal.tsx
│       └── AdminPortal.tsx
├── context/
│   ├── AuthContext.tsx            # Firebase Auth provider
│   └── LanguageContext.tsx        # Multilingual (Hindi/English + tribal)
├── services/                      # Frontend engines + API clients
│   ├── aiTriageEngine.ts          # 60-domain classifier (frontend port)
│   ├── heiMatchingEngine.ts       # 4-factor HEI matcher (frontend port)
│   ├── aiVisionClassifier.ts      # Canvas-based vision heuristic
│   ├── deduplicationService.ts    # Trigram + tag overlap
│   ├── domainTaxonomy.ts          # 60 GOV_DOMAINS
│   ├── workflowStore.ts           # LocalStorage workflow state (Phase 1)
│   ├── workflowLifecycle.ts       # Lifecycle state machine
│   ├── workflowAdapters.ts        # Frontend↔API bridge
│   ├── syncBridge.ts              # Phase 1 dual-write bridge
│   ├── useWorkflowStore.ts        # React hook for workflow state
│   ├── mapDataService.ts          # JHARKHAND_BOUNDS, CENTROIDS, getSeverityColor
│   ├── universityData.ts          # University data
│   ├── firebaseService.ts         # Firebase integration
│   └── translationEngine.ts       # i18n engine
├── config/
│   └── firebase.ts                # Firebase SDK config
├── i18n/                          # Internationalization
│   ├── translationEngine.ts
│   ├── translations.ts
│   ├── locales/
│   │   ├── en.ts, hi.ts           # English, Hindi
│   │   ├── khr.ts, nag.ts, kru.ts, mun.ts, sat.ts, kur.ts  # Tribal languages
│   │   ├── bho.ts, mag.ts, ho.ts, ur.ts
└── i18n/types.ts
```

### 10.3 Frontend Design System

- **Framework:** React 18 + TypeScript (strict) + Vite
- **Styling:** Tailwind CSS v3.4.1 + PostCSS + Autoprefixer
- **Icons:** `lucide-react`
- **Routing:** Stateful conditional rendering based on RBAC (not URL-based declarative routing)
- **Portals:** 5 role-based portal components, each wrapped in `<ProtectedRoute>`
- **Map:** Leaflet + OpenStreetMap tiles; all spatial queries from API
- **Design palette:** Civic/government disaster-management aesthetic
  - `nivaaran-primary` (`#1E3A5F`) — deep trust-blue
  - `nivaaran-secondary` (`#0F766E`) — teal-green for success
  - `nivaaran-accent` (`#C2760C`) — warm amber/ochre
  - `nivaaran-danger` (`#B3261E`) — high severity red
  - Backgrounds: warm off-whites (`#FAF8F3`); borders (`#DCD6C6`)
- **Typography:** Inter (body), Plus Jakarta Sans (headings), Noto Sans Devanagari (Hindi), JetBrains Mono (IDs)
- **Multilingual:** English, Hindi, + 8 Jharkhand tribal languages (Kharia, Nagpuri, Kurmali, Mundari, Santali, Kurukh, Ho, Urdu)

### 10.4 Key Frontend Service Ports

The frontend already has working "AI" engines that the backend mirrors server-side:

| Frontend Service | What it does | Backend equivalent |
|---|---|---|
| `aiTriageEngine.ts` | 60-domain taxonomy + 5-factor priority | `AIProvider.understand` + `scorePriority` |
| `heiMatchingEngine.ts` | 4-factor HEI match scorer | `AIProvider.match` + `scoreHEIMatch` |
| `aiVisionClassifier.ts` | Canvas pixel/edge heuristic | `AIProvider.VISION` |
| `deduplicationService.ts` | Trigram + tag overlap | `AIProvider.similarity` + `pg_trgm` |
| `domainTaxonomy.ts` | 60 `GOV_DOMAINS` | Seeded reference table |
| `mapDataService.ts` | `JHARKHAND_BOUNDS`, `CENTROIDS`, `getSeverityColor` | Leaflet constants + `districts` table |

---

## 11. Flagship End-to-End Demo Problem: Tupudana Culvert Failure Case Study

> **Case Docket ID:** `NIV-JH-RNC-2026-0042`  
> **Problem Classification:** `PUBLIC_INFRASTRUCTURE_ROAD_BRIDGES` (`GOV-CIVIC-04` / Culvert Failure & Arterial Washout)  
> **Jurisdiction:** Tupudana Industrial Belt & Hatia Block, Ranchi District, Jharkhand  
> **Geo-Coordinates:** `23.2842° N, 85.3126° E` (EPSG:4326 / WGS 84)  
> **Severity & Urgency:** **P1 Critical / Emergency Disaster Mitigation** (Composite Score: **94.05 / 100**)  
> **Primary Stakeholders:** Citizens & Transporters, Road Construction Department (RCD) Jharkhand, DC Ranchi / DDMA, Birla Institute of Technology (BIT Mesra), Tupudana Industrial Estate Manufacturers Association (TIEMA).

---

### 11.1 Incident Overview & Physical Context

In late August 2026, severe localized monsoon cloudbursts over the Hatia–Kanke catchment generated heavy runoff through the Subarnarekha river tributary nallah. At the Tupudana–Balalong arterial link road (chainage `KM 4+350`), an aging single-barrel 1.8m masonry hume-pipe culvert suffered catastrophic structural failure:
1. **Hydraulic Backwater Surcharge:** Peak flood volume overwhelmed the culvert barrel capacity, resulting in intense scouring of the unreinforced stone masonry wing walls and abutment subgrade.
2. **Subgrade Liquefaction & Piping:** Water percolated through the road foundation, eroding the granular sub-base and undermining the pavement structure.
3. **Pavement & Barrel Collapse:** Under combined hydrodynamic uplift and heavy 40-tonne commercial stone tipper axle loading, the culvert barrel caved in. A chasm **4.2 meters deep and 7.8 meters wide** formed across the two-lane carriageway, completely severing vehicular transit.
4. **Socio-Economic Impact:** 
   - **Transit Severance:** Direct arterial connection between Hatia Railway Yard, the Tupudana Industrial Area (35 operational MSME stone crushers, foundry units, and agro-processing factories), and 14 peripheral tribal villages (approx. 22,000 residents) was instantly cut.
   - **Emergency Services:** Ambulances en route to Hatia Sub-Divisional Hospital were forced onto a circuitous 14.5 km detour via the Ring Road, increasing emergency response transit time from 9 minutes to over 48 minutes.
   - **Daily Commute:** More than 1,200 school students and daily industrial workers were stranded on opposite banks of the swollen torrent.

---

### 11.2 End-to-End Workflow Stages

The complete lifecycle of this crisis demonstrates the operation of Nivaaran's 13 backend modules, AI triage engine, PostGIS spatial layer, HEI collaboration pipeline, and audit ledger across nine distinct operational stages.

```mermaid
sequenceDiagram
    autonumber
    actor C as Citizen / Mukhiya
    participant GW as Nivaaran Intake Gateway
    participant AI as AI Perception & Triage Engine
    participant DEDUP as PostGIS & Dedup Engine
    participant GOV as DC Ranchi & RCD Jharkhand
    participant HEI as BIT Mesra (Civil Engg)
    participant CSR as TIEMA (CSR Partner)
    participant LEDGER as Immutable Audit Ledger

    C->>GW: 1. Submits Grievance (IVR/WhatsApp/Web) + Geotagged Photos
    GW->>AI: Dispatches raw submission payload
    AI->>AI: 2. Vision defect classification & automated PII masking
    AI->>DEDUP: 3. Spatial ST_DWithin (250m) & Trigram clustering
    DEDUP-->>LEDGER: Creates Master Challenge CH-JH-RNC-2026-0042 (14 reports aggregated)
    AI->>AI: 4. Computes 5-factor Priority Score (94.05/100 -> P1 Emergency)
    AI->>GOV: 5. Auto-routes ticket to RCD Ranchi & DDMA (4h ACK / 24h Containment SLA)
    GOV->>GOV: Authorizes containment, traffic diversion & declares site validation
    AI->>HEI: 6. 4-factor matching engine pairs BIT Mesra Civil & Hydraulic Dept (95.3% match)
    HEI->>HEI: HoD & Faculty accept challenge; deploy multidisciplinary student team
    HEI->>HEI: 7. Drone photogrammetry, HEC-RAS 2D modeling & geotechnical SPT testing
    HEI->>GOV: 8. Delivers twin-cell RCC box culvert CAD/DPR & Jharkhand SoR BoQ (Rs 39.05L)
    CSR->>GOV: Sanctions Rs 10L CSR co-funding alongside Rs 29.05L SDMF emergency grant
    GOV->>HEI: 9. Empaneled contractor executes 5-milestone construction with third-party audit
    HEI->>LEDGER: Uploads ultrasonic pulse velocity & static load deflection test (0.42mm)
    LEDGER->>C: Push notifications with before/after proofs; feedback loop closed
```

---

#### Stage 1: Citizen Complaint (Multi-Modal Intake & Geotagged Evidence)

* **Responsible Stakeholders:** 
  - Primary Complainant: Shri Sunil Linda (Commercial Logistics Transporter, Hatia Truckers Union).
  - Secondary Informant: Shri Rameshwar Oraon (Gram Pradhan / Mukhiya, Gram Panchayat Balalong).
* **Intake Channels:** 
  - Dual-mode submission via Nivaaran IVR Voice Gateway (`+91-651-2400XXX`) and WhatsApp Civic Bot.
  - Complainant spoke in Nagpuri/Hindi dialect: *"तुपुदाना–बालालोंग मुख्य सड़क की पुरानी पुलिया रात के फ्लैश फ्लड में पूरी तरह टूट गई है। 15 फीट का गड्ढा बन गया है, कोई भी गाड़ी, ऑटो या एम्बुलेंस नहीं जा पा रही है।"*
* **Captured Payload & Telemetry:**
  - **Coordinates:** `lat: 23.2842`, `lng: 85.3126` (verified against PostGIS block polygon: `RANCHI_HATIA`).
  - **Evidence Bundle:** Three high-resolution smartphone photographs capturing:
    1. Scoured downstream masonry retaining wall and exposed road foundation.
    2. Overtopped and washed-out bituminous wearing course with a 4.2m crater.
    3. Heavy turbulent torrent traversing the breached roadbed.
  - **Citizen Authentication:** Aadhaar-linked OTP authentication via UIDAI gateway; registered mobile number verified.
* **Initial Workflow State:** `SUBMITTED` (`WorkflowStage: 1`).

---

#### Stage 2: AI Verification & PII Masking (Perception Pipeline & Privacy Protection)

* **Responsible Stakeholders:** Nivaaran Background Worker (`ai.perception.worker`), Whisper/Bhashini ASR Service, Computer Vision Model Pipeline.
* **Autonomous Operations Executed:**
  1. **Vernacular Transcription & Entity Extraction:**
     - ASR converts Nagpuri voice note to English/Hindi canonical text.
     - Named Entity Recognition (NER) extracts key parameters: `Asset: Culvert/Bridge`, `Location: Tupudana-Balalong link road`, `Damage: Structural collapse`, `Impact: Transit cutoff`.
  2. **Computer Vision Defect Classification (`AIProvider.VISION`):**
     - Image analysis identifies feature vectors corresponding to:
       - `STRUCTURAL_MASONRY_FAILURE` (Confidence: **96.4%**)
       - `ROADWAY_WASHOUT_CHASM` (Confidence: **94.8%**)
       - `SURCHARGE_WATER_EROSION` (Confidence: **91.2%**)
     - Synthesizes technical domain: `PUBLIC_INFRASTRUCTURE_ROAD_BRIDGES` (`GOV-CIVIC-04`).
  3. **Automated PII Redaction (Privacy Invariant 6):**
     - Text scrubber masks citizen telephone number (`+91 98351 XXXXX`) and national identity digits.
     - Computer Vision pipeline detects private vehicle registration plates (`JH-01-XX-XXXX`) in the background of photo #2 and runs OpenCV Gaussian blur ($k=25$).
     - Bystander facial regions are identified and blurred before database insertion.
  4. **Evidence Cryptographic Hashing:**
     - SHA-256 fingerprint generated for sanitized evidence records (`hash: 8f9b4a...c712`) and recorded in `challenge_evidence` table.
* **Output:** Sanitized, tamper-evident challenge record stored in `challenges` table without PII leakage.
* **Workflow State Transition:** `SUBMITTED` → `AI_TRIAGED` (`WorkflowStage: 2`).

---

#### Stage 3: Duplicate Detection & Spatial Clustering (Spatio-Temporal Aggregation)

* **Responsible Stakeholders:** Nivaaran Cluster Engine (`ClusterModule`, `deduplicationService.ts`).
* **Trigger Condition:** Within 4 hours of the collapse, **14 independent citizen grievances** were lodged regarding the same incident from adjacent phone numbers, geotagged between `23.2838° N, 85.3120° E` and `23.2846° N, 85.3132° E`.
* **Execution Mechanics:**
  1. **Spatial Buffer Calculation:**
     ```sql
     SELECT id, title, location_coords, ST_Distance(
       geom, ST_SetSRID(ST_MakePoint(85.3126, 23.2842), 4326)::geography
     ) AS distance_meters
     FROM challenges
     WHERE ST_DWithin(
       geom, ST_SetSRID(ST_MakePoint(85.3126, 23.2842), 4326)::geography, 250
     ) AND status NOT IN ('CLOSED_RESOLVED', 'REJECTED');
     ```
     Result: 13 matching active records found within a 180-meter radius.
  2. **Lexical & Semantic Similarity:**
     - PostgreSQL `pg_trgm` similarity score on `title` and `description` vectors:
       `similarity("Tupudana culvert broken", "Pulia collapsed near Balalong Tupudana") = 0.91`.
  3. **Master-Cluster Consolidation:**
     - Nivaaran automatically designates the first validated ticket as the **Master Challenge** (`CH-JH-RNC-2026-0042`).
     - The other 13 submissions are attached as child references (`is_cluster_master: false`, `master_challenge_id: 'CH-JH-RNC-2026-0042'`).
     - Aggregates reported impact figures: Cumulative estimated affected citizens updated from 2,000 to **22,000+**, with 35 MSME manufacturing facilities impacted.
     - All 14 reporting citizens automatically subscribed to push SMS broadcast updates.
* **Workflow State Transition:** `AI_TRIAGED` → `CLUSTERED` (`WorkflowStage: 3`).

---

#### Stage 4: P1 Priority Scoring (Multi-Factor Mathematical Rubric)

* **Responsible Stakeholders:** Nivaaran AI Triage Engine (`aiTriageEngine.ts`, `PriorityModule`).
* **Formula & Factor Breakdown:**
  Nivaaran evaluates civic crises across five weighted dimensions ($W_1 \dots W_5$):

$$\text{Priority Score} = \sum_{i=1}^5 w_i \cdot s_i = w_S S + w_U U + w_P P + w_E E + w_V V$$

| Factor | Weight ($w_i$) | Score ($s_i$, max 25) | Computed Value | Mathematical Rationale |
|---|---|---|---|---|
| **Structural Severity ($S$)** | 0.25 | 25.0 / 25 | 6.25 | Complete roadway loss, 4.2m chasm, total structural collapse of drainage asset. |
| **Hazard Urgency ($U$)** | 0.25 | 24.0 / 25 | 6.00 | Active monsoon flash flood, high risk of vehicles plunging into chasm during darkness. |
| **Population Impact ($P$)** | 0.20 | 23.0 / 25 | 4.60 | 22,000+ residents cut off; primary ambulance transit diverted +35 minutes. |
| **Evidence Quality ($E$)** | 0.15 | 25.0 / 25 | 3.75 | 14 corroborated citizen reports, high-res geotagged photos, zero PII anomalies. |
| **Vulnerability & Economic Loss ($V$)** | 0.15 | 23.0 / 25 | 3.45 | 35 MSMEs halted, stone transport paralyzed, peri-urban tribal agricultural commute severed. |
| **Total Composite Score** | **1.00** | **119 / 125** | **94.05 / 100** | **Normalized Priority: P1 EMERGENCY / HIGH PRIORITY** |

* **Automated System Actions:**
  - Emergency P1 Strobe badge attached to challenge ticket on GIS Command Center.
  - Automatic push dispatch to District Magistrate / Deputy Commissioner (DC) Ranchi emergency dashboard.
* **Workflow State Transition:** `CLUSTERED` → `PRIORITIZED` (`WorkflowStage: 4`).

---

#### Stage 5: Automatic Government Routing (Jurisdictional Dispatch & Emergency Containment)

* **Responsible Stakeholders:** 
  - Primary Executing Department: Road Construction Department (RCD), Government of Jharkhand (Executive Engineer, Ranchi Road Division).
  - District Disaster Authority: Deputy Commissioner (DC) Ranchi & District Disaster Management Authority (DDMA).
  - Municipal & Industrial Nodal: Tupudana Industrial Area Development Authority (RIADA / JIDCO) & Ranchi Municipal Corporation (RMC).
  - Law & Order: Hatia / Tupudana Traffic Police Station.
* **Automated Routing Rules Execution:**
  - Spatial mapping matches coordinates `(23.2842, 85.3126)` with:
    - **District:** Ranchi (`DIS-JH-01`)
    - **Block:** Hatia (`BLK-JH-RNC-04`)
    - **Competent Road Authority:** RCD Division Ranchi (Road Code: `MDR-RNC-082`).
* **SLA Timers & Field Actions:**
  - **4-Hour Acknowledgement SLA:** Acknowledged by Assistant Engineer (RCD Ranchi) within **1 hour 12 minutes**.
  - **24-Hour Containment SLA:**
    - Executive Engineer RCD and Hatia Traffic Police deployed within 3 hours.
    - Full physical barricading with high-visibility reflective drums, solar blinking amber lights, and concrete jersey barriers installed at 100m approaches.
    - Heavy vehicles diverted to NH-75 Extension / Ring Road; light two-wheeler pedestrian bypass footbridge erected 80 meters upstream within 18 hours.
  - **Formal Administrative Validation:** DC Ranchi inspects the electronic dossier on the Nivaaran Portal and executes digital transition signature:
    `transition: VALIDATE -> GOVT_VALIDATED` with note: *"Inspected in situ. Arterial collapse verified. Emergency restoration and HEI bridge engineering required immediately."*
* **Workflow State Transition:** `PRIORITIZED` → `GOVT_VALIDATED` (`WorkflowStage: 5`).

---

#### Stage 6: Academic & Expert Matching with BIT Mesra (HEI Match Algorithm)

* **Responsible Stakeholders:** Nivaaran HEI Matching Engine (`heiMatchingEngine.ts`), Department of Civil and Environmental Engineering, Birla Institute of Technology (BIT Mesra), Ranchi.
* **4-Factor HEI Match Scoring Engine:**

$$\text{HEI Match} = 0.40 \cdot S_{\text{domain}} + 0.25 \cdot S_{\text{geo}} + 0.20 \cdot S_{\text{tier}} + 0.15 \cdot S_{\text{lab}}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               BIT MESRA HEI MATCH EVALUATION                           │
├───────────────────────┬────────┬────────┬──────────────────────────────────────────────┤
│ Metric Dimension      │ Weight │ Score  │ Justification                                │
├───────────────────────┼────────┼────────┼──────────────────────────────────────────────┤
│ 1. Domain Match       │ 40%    │ 98/100 │ Specialized Civil & Water Resources division │
│ 2. Proximity (18.2km) │ 25%    │ 94/100 │ PostGIS Haversine distance: 18.2 km via NH   │
│ 3. Tier & Accreditation│ 20%   │ 95/100 │ Deemed University, NIRF Top Rank, NAAC A+    │
│ 4. Lab Infrastructure │ 15%    │ 92/100 │ UTM (1000kN), HEC-RAS workstations, Drone Lab│
├───────────────────────┼────────┼────────┼──────────────────────────────────────────────┤
│ Composite Match Index │ 100%   │ 95.3%  │ RANK #1 STATEWIDE FOR HYDRAULIC/ROAD DESIGN  │
└───────────────────────┴────────┴────────┴──────────────────────────────────────────────┘
```

* **Institutional Acceptance & Nivaaran Research Docket:**
  - Head of Department (Civil Engineering, BIT Mesra) receives the digital matching docket `JH-RNC-DPR-0042` via the University Portal.
  - Formal institutional acceptance confirmed within **4 hours 45 minutes**.
* **Multidisciplinary Project Team Formation (`DEMO-TEAM-BIT-042`):**
  - **Faculty Mentor:** Dr. Anand Prakash (Professor of Structural & Hydraulic Engineering, BIT Mesra).
  - **Student Team Lead:** Manish Pandey (Final Year B.Tech Civil Engineering — Structural Analysis).
  - **Student Co-Investigators:**
    - Aniket Tirkey (B.Tech Civil — Geotechnical Investigation & Soil Mechanics).
    - Deepa Mishra (M.Tech Water Resources — Catchment Hydrology & HEC-RAS 2D).
    - Vivek Sharma (B.Tech Civil & Geomatics — Drone Survey & AutoCAD Detailing).
* **Workflow State Transition:** `GOVT_VALIDATED` → `INSTITUTION_MATCHED` → `INSTITUTION_ACCEPTED` → `TEAM_FORMED` (`WorkflowStages: 6–8`).

---

#### Stage 7: Technical Assessment & Field Diagnostic

* **Responsible Stakeholders:** BIT Mesra Civil Engineering Project Team, RCD Assistant Engineer, District Geologist.
* **On-Site Field Investigation (Completed within 48 Hours):**
  1. **Drone Photogrammetry & Topographic Profiling:**
     - DJI Matrice 300 RTK drone survey deployed over a 1.5 km reach.
     - Generated high-density 3D LiDAR point cloud and digital surface model (DSM) with 2cm contour intervals.
     - Upstream catchment basin measured at **12.8 km²**, comprising rocky ridges with a high runoff coefficient ($C = 0.68$).
  2. **Hydrological & Hydraulic Simulation (HEC-RAS 2D):**
     - Computed 50-year return period peak flood discharge:
       
$$Q_{\text{peak}} = 0.278 \cdot C \cdot I \cdot A = 0.278 \times 0.68 \times 65\text{ mm/hr} \times 12.8\text{ km}^2 = 42.6\text{ m}^3/\text{s}$$

     - **Root Cause Identified:** The original 1.8m hume pipe possessed a maximum hydraulic capacity of only **$16.8\text{ m}^3/\text{s}$** (a deficit of **60.5%**). During peak storm inflow, headwater overtopped the embankment at **$3.8\text{ m/s}$**, creating severe exit vortex scouring that undermined the unreinforced stone masonry.
  3. **Geotechnical Core Drilling & Soil Bearing Tests:**
     - Standard Penetration Test (SPT) conducted across three boreholes to a depth of 6.0 meters.
     - Subsoil stratigraphy: 0.0m–1.8m silty sand alluvial wash; 1.8m–4.2m soft micaceous sandy silt; >4.2m weathered granite gneiss bedrock.
     - Safe Bearing Capacity (SBC) of foundation stratum at -2.5m depth: **$115\text{ kN/m}^2$**.
     - Identified active piping phenomena behind the failed abutment backfill.
* **Deliverable:** Comprehensive Technical Assessment Report uploaded to Nivaaran repository with raw HEC-RAS `.prj` models and soil lab test reports.
* **Workflow State Transition:** `TEAM_FORMED` → `PROPOSAL_SUBMITTED` (`WorkflowStage: 9`).

---

#### Stage 8: DPR, CAD & Cost Estimate Generation (Engineering Delivery & Co-Funding)

* **Responsible Stakeholders:** BIT Mesra Project Team, RCD Executive Engineer, TIEMA Executive Committee, DC Ranchi.
* **Engineering Design Specification:**
  - **Proposed Replacement:** **Twin-Cell Reinforced Cement Concrete (RCC) Box Culvert**.
  - **Geometric Parameters:** 
    - Number of cells: 2 identical barrels.
    - Clear internal span: **$2 \times 4.5\text{ meters} = 9.0\text{ meters}$ total waterway opening**.
    - Clear internal height: **$3.0\text{ meters}$** (providing 0.8m freeboard above 50-year High Flood Level of $Q = 42.6\text{ m}^3/\text{s}$).
    - Total barrel length: 12.0 meters (accommodating a standard 7.5m two-lane carriageway + 1.5m paved shoulders + crash barriers).
  - **Design Standards Complied:** IRC:SP:13 (Guidelines for Design of Small Bridges & Culverts), IRC:112 (Code of Practice for Concrete Road Bridges), IRC:6 (Standard Specifications for Road Bridges: Loads & Stresses for IRC Class 70R Tracked & Wheeled Loading).
  - **Structural Highlights:**
    - Concrete Grade: **M35** high-durability concrete with silica fume admixture.
    - Reinforcement: **Fe 500D TMT** corrosion-resistant thermo-mechanically treated rebar.
    - Foundation: 400mm thick continuous RCC raft slab resting on 150mm M15 leveling concrete and 300mm boulder packing.
    - Scour Mitigation: Upstream and downstream RCC curtain/drop walls (depth 2.0m) tied to 300mm thick wire-mesh stone gabion aprons over non-woven geotextile filter fabric ($300\text{ g/m}^2$).
* **CAD Deliverables Generated:**
  - General Arrangement Drawing (GAD) Sheet 1: Key Plan, Plan at Bed Level, Longitudinal Section along Roadway (`DWG-JH-RNC-042-GAD.pdf`).
  - Structural Reinforcement Detailing Sheet 2: Cross Section of Twin Box, Bar Bending Schedule (BBS), Wingwall Sections (`DWG-JH-RNC-042-STR.pdf`).
* **Itemized Bill of Quantities (BoQ) & Cost Estimate (Jharkhand RCD SoR 2024–25):**

| Item No. | Jharkhand SoR Code | Description of Civil Work | Quantity | Unit | Rate (₹) | Total Amount (₹) |
|---|---|---|---|---|---|---|
| **1** | `RCD-SOR-2.1` | Earthwork excavation in all soils including dewatering and shoring | 480.0 | m³ | 340.00 | ₹1,63,200 |
| **2** | `RCD-SOR-3.4` | Providing and laying boulder soling with stone spalls compacted | 75.0 | m³ | 1,280.00 | ₹96,000 |
| **3** | `RCD-SOR-4.1` | Plain Cement Concrete (M15 grade) for leveling course under raft | 38.0 | m³ | 4,850.00 | ₹1,84,300 |
| **4** | `RCD-SOR-5.8` | Reinforced Cement Concrete (M35 grade) for Raft, Outer Walls, Intermediate Wall, and Top Slab | 148.0 | m³ | 9,800.00 | ₹14,50,400 |
| **5** | `RCD-SOR-6.2` | Supplying, cutting, bending, and placing Thermo-Mechanically Treated (Fe 500D) reinforcement steel | 17.2 | Tonnes | 68,500.00 | ₹11,78,200 |
| **6** | `RCD-SOR-8.5` | Wire-mesh galvanized stone gabion apron (1.5m $\times$ 1.0m $\times$ 0.5m) and geotextile filter fabric | 65.0 | m³ | 3,450.00 | ₹2,24,250 |
| **7** | `RCD-SOR-9.1` | Granular sub-base (GSB) and Wet Mix Macadam (WMM) road approaches (60m total) | 120.0 | m³ | 1,950.00 | ₹2,34,000 |
| **8** | `RCD-SOR-10.4`| Dense Bituminous Macadam (50mm) and Bituminous Concrete (30mm) surfacing with tack coat | 450.0 | m² | 420.00 | ₹1,89,000 |
| **9** | `RCD-SOR-12.1`| W-Beam metallic crash barriers, solar blinkers, and retro-reflective hazard signage | 48.0 | Metres | 2,250.00 | ₹1,08,000 |
| **10**| `RCD-QC-01`   | Third-party quality control, core testing, ultrasonic testing, and contingencies | L.S. | Job | Lump Sum | ₹77,650 |
| **TOTAL**| | **ESTIMATED PROJECT CAPITAL COST** | | | | **₹39,05,000** |

* **Innovative Public-CSR Co-Financing Architecture:**
  - **State Disaster Mitigation Fund (SDMF / RCD Head):** **₹29,05,000 (74.4%)** sanctioned under immediate emergency executive powers by DC Ranchi.
  - **Corporate Social Responsibility (CSR Co-Investment):** **₹10,00,000 (25.6%)** committed by the Tupudana Industrial Estate Manufacturers Association (TIEMA) through Nivaaran's CSR Module, recognizing the commercial value of restoring logistics links.
* **Administrative Sanction:** Dual-signed Technical Sanction (TS) and Administrative Approval (AA) issued on Nivaaran within **72 hours** of incident report.
* **Workflow State Transition:** `PROPOSAL_SUBMITTED` → `PROPOSAL_ACCEPTED` → `CSR_PARTNERED` (`WorkflowStages: 9–10`).

---

#### Stage 9: Resolution Tracking, Construction & Verification

* **Responsible Stakeholders:** Empaneled Fast-Track Contractor, Executive Engineer RCD Ranchi, BIT Mesra Third-Party Quality Audit Cell, Gram Pradhan & Complainants.
* **Milestone-Driven Execution Ledger:**
  Execution was tracked through five immutable audit milestones on the Nivaaran state machine:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              5-MILESTONE EXECUTION TIMELINE                            │
├───────────┬────────┬─────────────────────────────────────────────────┬─────────────────┤
│ Milestone │ Day    │ Civil Engineering Scope Executed                │ Audit Proof     │
├───────────┼────────┼─────────────────────────────────────────────────┼─────────────────┤
│ MS-1      │ Day 4  │ Site containment, stream bypass, cofferdam,     │ Geotagged drone │
│           │        │ and structural foundation excavation to -2.8m.  │ photo + signoff │
├───────────┼────────┼─────────────────────────────────────────────────┼─────────────────┤
│ MS-2      │ Day 12 │ Boulder soling, M15 leveling PCC, bottom raft   │ Cube 7-day test │
│           │        │ rebar binding and monolithic raft casting (M35).│ (28.4 MPa)      │
├───────────┼────────┼─────────────────────────────────────────────────┼─────────────────┤
│ MS-3      │ Day 22 │ Outer/intermediate vertical walls and deck slab │ Curing log +    │
│           │        │ shuttering, reinforcement tying and M35 casting.│ moisture sensor │
├───────────┼────────┼─────────────────────────────────────────────────┼─────────────────┤
│ MS-4      │ Day 32 │ Wing walls, upstream/downstream gabion aprons,  │ Bitumen density │
│           │        │ GSB/WMM approaches, and DBM/BC blacktopping.    │ core report     │
├───────────┼────────┼─────────────────────────────────────────────────┼─────────────────┤
│ MS-5      │ Day 38 │ Static load deflection testing (2x 40t trucks)  │ Load deflection │
│           │        │ and Ultrasonic Pulse Velocity (UPV) scan.       │ log (0.42mm)    │
└───────────┴────────┴─────────────────────────────────────────────────┴─────────────────┘
```

* **Independent Third-Party Verification by BIT Mesra:**
  - **Ultrasonic Pulse Velocity (UPV) Test:** Average pulse velocity recorded at **$4,410\text{ m/s}$**, confirming excellent concrete density without internal honeycombing or voids.
  - **Proof Load Testing:** Two fully loaded 40-tonne commercial tipper trucks positioned over the midspan for 24 hours. Central deck deflection recorded by dial gauges: **$0.42\text{ mm}$**, safely below the IRC:112 permissible limit of $L/800 = 4500/800 = \mathbf{5.625\text{ mm}}$.
* **Public Ledger & Citizen Feedback Loop Closure:**
  - High-definition before-and-after photographs uploaded to the Nivaaran Public Transparency Portal.
  - Automated SMS and WhatsApp broadcast delivered in Nagpuri and Hindi to all 14 original complainants and the Balalong Village Mukhiya:
    *"आपका तुपुदाना पुलिया निर्माण कार्य पूरा हो चुका है और सड़क यातायात हेतु खोल दी गई है। निवारण को अपना फीडबैक दें।"*
  - Complainants recorded a **5/5 Citizen Satisfaction Rating** on civic responsiveness.
* **Measurable Societal & Economic Impact Recorded:**
  - **Travel Time Restored:** Eliminated the 14.5 km circuitous Ring Road detour, saving **35 minutes per commute trip**.
  - **Economic Savings:** Saved an estimated **₹14.8 Lakhs per month** in commercial freight transit fuel and vehicle wear for Tupudana MSMEs.
  - **Emergency Access:** Restored 9-minute ambulance response time between 14 villages and Hatia Sub-Divisional Hospital.
  - **Disaster Resilience:** The new twin-cell RCC box structure provides **$250\%$ of the previous hydraulic discharge capacity**, fully flood-resilient against 50-year extreme rainfall events.
* **Archival into Provincial Knowledge Repository:**
  - Complete DPR, CAD schematics, and HEC-RAS hydraulic models archived in the Nivaaran Open Engineering Library as an approved prototype blueprint for culvert replacement across all 24 Jharkhand District Administrations.
* **Final Lifecycle State:** `RESOLVED` → `IMPACT_MEASURED` → `CLOSED_SUCCESS` (`WorkflowStages: 14–16`).

---

### 11.3 Full 16-Stage Lifecycle Execution Matrix

To satisfy the authoritative 16-stage state machine enforced by the Nivaaran Workflow Engine (`workflowLifecycle.ts` and `Complete_workflow.md`), the following matrix maps the exact execution, responsible stakeholders, inputs, and delivered artifacts across every single stage of the Tupudana crisis:

| Stage # | Lifecycle Key | Workflow Status | Primary Stakeholder | Operational Input | Core Transformation / Action | Output Artifact / Audit Proof |
|---|---|---|---|---|---|---|
| **Stage 1** | `SUBMISSION` | `Submitted` | Sunil Linda (Citizen) & Mukhiya | IVR voice note + 3 smartphone photos | Citizen lodges grievance with GPS telemetry (`23.2842, 85.3126`) | Raw challenge record `CH-JH-RNC-2026-0042` |
| **Stage 2** | `AI_UNDERSTANDING` | `Under Review` | AI Perception Worker | Raw audio + photos + description | Bhashini/Whisper ASR + CV defect classification (96.4%) + regex PII scrubber | Sanitized challenge dossier & SHA-256 evidence hash |
| **Stage 3** | `DEDUPLICATION_CLUSTERING`| `Clustered` | PostGIS Clustering Engine | 14 concurrent spatial submissions | PostGIS `ST_DWithin` (250m buffer) + `pg_trgm` lexical match (0.91) | Master Challenge with 13 subscriber tickets |
| **Stage 4** | `PRIORITIZATION` | `Prioritized` | AI Triage Engine | Aggregated hazard & impact data | 5-Factor mathematical rubric evaluation ($S=25, U=24, P=23, E=25, V=23$) | Score **94.05/100** (`P1 Emergency` badge triggered) |
| **Stage 5** | `VALIDATION` | `Government Validated` | DC Ranchi & RCD Exec Engineer | Triage alert + field photos | On-ground inspection; reflective barricades & bypass footbridge deployed | Digital validation signoff & containment audit |
| **Stage 6** | `INSTITUTION_MATCHING` | `HEI Matched` | HEI Matching Engine | Taxonomy `GOV-CIVIC-04` + GIS | 4-Factor HEI algorithm matches BIT Mesra Civil Engineering (18.2 km) | Research docket `JH-RNC-DPR-0042` (Match: 95.3%) |
| **Stage 7** | `UNIVERSITY_ACCEPTANCE` | `University Accepted` | HoD Civil Engg (BIT Mesra) | Institutional matching docket | Academic review of problem scope, lab availability, and syllabus credit | Formal acceptance logged within 4 hours 45 mins |
| **Stage 8** | `TEAM_FORMATION` | `In Progress` | Prof. Anand Prakash (Mentor) | Student talent registry | Multidisciplinary team formed: 4 B.Tech/M.Tech Civil & Geomatics scholars | Project team `DEMO-TEAM-BIT-042` registered |
| **Stage 9** | `PROPOSAL` | `Proposal Submitted` | BIT Mesra Project Team | Drone LiDAR + HEC-RAS 2D model | Engineering investigation reveals 60.5% hydraulic capacity deficit; proposes twin box | Detailed Project Report (DPR) & HEC-RAS `.prj` |
| **Stage 10** | `INDUSTRY_CSR_COLLABORATION`| `Industry Collaboration` | TIEMA & RCD Jharkhand | DPR budget & CSR matching portal | TIEMA pledges ₹10.00L CSR co-funding alongside ₹29.05L SDMF grant | Tripartite Public-Private Partnership MoU |
| **Stage 11** | `PROTOTYPE` | `Prototype Active` | BIT Mesra CAD Workstation | IRC:SP:13 & IRC:112 design codes | Structural modeling, reinforcement detailing, bar bending schedules, and BoQ | GAD drawings (`DWG-JH-RNC-042-GAD.pdf`) & SoR BoQ |
| **Stage 12** | `PILOT` | `Pilot Active` | Fast-Track Contractor & RCD | Construction drawings & site permits | Stream bypass cofferdam, trenching to -2.8m, and M35 bottom raft slab cast | 7-day cube test log (28.4 MPa) & drone progress scan |
| **Stage 13** | `TECHNICAL_COMMUNITY_VALIDATION`| `Outcome Audit` | BIT Mesra Quality Audit Cell | 28-day cured twin-cell structure | Non-destructive UPV scan ($4,410\text{ m/s}$) & 24h proof load deflection test ($0.42\text{ mm}$) | Structural integrity compliance certificate |
| **Stage 14** | `DEPLOYMENT` | `Resolved` | RCD Ranchi Division | Cured culvert & approach base | Laying 60m bituminous pavement approaches (DBM/BC), crash barriers & blinkers | Roadway re-opened to heavy commercial traffic |
| **Stage 15** | `IMPACT_MEASUREMENT` | `Measuring Impact` | District Monitoring Cell & Citizens | Traffic telemetry & citizen surveys | Verified 35 mins detour saved, ₹14.8L/mo logistics savings, 100% positive feedback | Social Impact Scorecard & Citizen Audit Ledger |
| **Stage 16** | `CLOSURE_LEARNING` | `Closed` | State Innovation Council | Full project lifecycle package | Complete DPR, CAD drawings, and HEC-RAS models published to Provincial Knowledge Base | Archival as reproducible template for all 24 districts |

---

### 11.4 Architectural Invariant Traceability Matrix

The Tupudana Culvert Failure demonstration directly validates all ten fundamental architectural invariants of Nivaaran:

| Invariant | System Rule | Demonstration in Tupudana Case |
|---|---|---|
| **Inv 1: Challenge Centrality** | Every resource belongs to a challenge | DPR, CAD blueprints, BoQ, HEI allocations, and audit logs are keyed to `CH-JH-RNC-2026-0042`. |
| **Inv 2: Authoritative State Engine** | No direct status writes; transition endpoint only | All 9 stage changes were processed through `POST /api/v1/challenges/:id/transition`. |
| **Inv 3: Human Oversight on AI** | AI advises; authenticated humans decide | AI computed P1 score and suggested RCD routing; DC Ranchi and HoD BIT Mesra signed transitions. |
| **Inv 4: Immutable Evidence** | Evidence files are never hard deleted | Original flood damage photos, drone point clouds, and test cubes are cryptographically hashed. |
| **Inv 5: Conflict Resolution Gate** | Cannot advance while conflicting data exists | Duplicate reports were merged into a single master ticket before government dispatch. |
| **Inv 6: Contextual Authorization** | Role + Org + Geo + State scoping | Only RCD Ranchi and BIT Mesra Civil department had write permissions for this ticket. |
| **Inv 7: Submitter Traceability** | Submitter ID always recorded | Initial citizen telephone & Aadhaar hashed at intake; authenticated OTP audit trail stored. |
| **Inv 8: 1:1 Challenge-Project Link** | Project strictly bound to parent challenge | Engineering project `DEMO-PRJ-0042` is bound by a foreign key constraint to `CH-JH-RNC-2026-0042`. |
| **Inv 9: Public/Private Separation** | PII excluded at query time | Public ledger shows technical BoQ and progress photos; citizen telephone numbers are omitted. |
| **Inv 10: Fault Isolation** | Background job failures do not block lifecycle | ASR/vision services run asynchronously via BullMQ; temporary worker lag never stalls ticket filing. |

---

## Summary of Key Architectural Invariants

1. **The challenge is the central object** — every other resource is owned by or linked to a challenge
2. **The workflow engine is authoritative** — there is no `PATCH` that writes status directly; every transition goes through `POST /api/v1/challenges/:id/transition`
3. **AI never mutates critical state** — AI produces recommendations; humans make decisions via transitions; both are recorded
4. **Role alone is insufficient** — authorization = ROLE + ORG + GEO + OWNERSHIP + WORKFLOW STATE
5. **PostGIS is the single source of truth for all spatial data** — no second geo store
6. **Privacy is enforced by absence from payload** — projections, not post-hoc filtering
7. **Audit is append-only** — enforced by DB trigger, retained 7 years, partitioned at 1M rows
8. **A failed AI job never blocks the lifecycle** — AI is advisory, never a blocker
9. **The browser is untrusted** — all identity verification, capability checks, and scoping happen server-side
10. **Grants are data, not code** — permission changes are seed-row + migration changes, not deploys

---

*This report synthesizes all documentation (`docs/01_Problem/`, `docs/02_Project/`, `docs/03_Architecture/`) and source code (`backend/src/`, `frontend/src/`, `backend/prisma/`) into a single reference covering backend architecture, database design, API contracts, AI architecture, system architecture, RBAC matrix, GIS architecture, and security architecture.*
