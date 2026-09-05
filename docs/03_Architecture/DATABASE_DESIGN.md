# NIVAARAN Database Design

> **Series position:** Document 2 of the architecture doc series. Expands `BACKEND_ARCHITECTURE.md` §10.2 (entity map) into a **complete, executable Prisma schema** — every table, column, type, index, constraint, and the migration/seed strategy to ship it.
>
> **Audience:** Backend engineers, DBAs, and anyone who needs the ground truth of *what NIVAARAN stores and how it is stored*.
>
> **Decisions not repeated here:** workflow state machine (§6), transition registry (§6.3), outbox pattern (§6.6), audit retention (§14) of `BACKEND_ARCHITECTURE.md`. This doc turns those decisions into columns and constraints.
>
> **Schemas are valid Prisma**: every relation block below compiles against Prisma `5.x` + `postgresqlExtensions` + `fullTextSearch` + `multiSchema` preview features. Any deviation (CHECKs, triggers, GISt indexes, PostGIS extensions) is explicitly marked as **"raw SQL migration — not Prisma DSL"**. The `Unsupported(...)` PostGIS columns are the deliberate, documented exception: Prisma passes them through untouched; all `ST_*` reads/writes go through `$queryRaw`.

---

## 1. Executive Summary

NIVAARAN persists to a **single PostgreSQL 16 database with PostGIS** driven by **Prisma ORM**. There is deliberately no second primary database: Mongo is rejected (per `BACKEND_ARCHITECTURE.md` §10.1 rationale) because the workflow needs relational integrity, foreign keys, and ACID across the challenge → project → impact chain. Redis exists but is a **cache and job queue only** — not a source of truth.

```text
┌─────────────────────────────── PostgreSQL 16 + PostGIS (single source of truth) ───────────────────────────────┐
│                                                                                                                │
│  CORE           workflow           AI              AUDIT/EVENTS        GIS              IAM/RBAC               │
│                                                                                                                │
│  users          challenges         ai_recommendations  audit_events    districts       roles                   │
│  organizations  challenge_evidence                      outbox_events   blocks        permissions              │
│  universities   submissions                             app_notifications             role_permissions        │
│  departments    validations                                                         user_roles               │
│                 clusters / cluster_members                                          user_geo_scopes          │
│  projects       university_acceptances                                             refresh_tokens            │
│  teams / team_members                                                                challenge_comments      │
│  proposals      milestones                                                             app_config            │
│  collaborations / offers                                                            evidence bytes →         │
│  pilots / deployments                                                                GCS / MinIO (outside)  │
│  impact_records                                                                       AI provider registry   │
│                                                                                       (via app_config)       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Design principles applied throughout:**

1. **Status is an enum at rest, an engine at work.** The `status` column constrains storage to legal values; the workflow engine determines *transitions*. The DB is the last line of defense, the engine the first (Invariant 1).
2. **Consequential change = transition = one DB transaction = audit + outbox row.** No `UPDATE challenges SET status=...` is ever executed by application code; it goes through the engine, which writes `audit_events` and `outbox_events` in the *same* transaction (§6.6).
3. **Append-only everything that matters.** `audit_events`, `impact_records`, `ai_recommendations`, `validations` are never mutated. Evidence is soft-deleted.
4. **AI outputs live apart from human decisions.** `ai_recommendations` is separate from `validations` and from the decision fields on `challenges`, so the AI→human audit trace is a first-class query (Invariant 2, `Actors_and_roles.md` §23).
5. **Public data is exposed by projection, never by exclusion.** There is no `isPublic` filter on the shared challenge row; the public read model is a separate query layer (`BACKEND_ARCHITECTURE.md` §10.3), and private columns are simply absent from those projections.
6. **The relationship graph is explicit** — Prisma enforces at compile time that every relation has a counterpart, which means the *schema itself* is the first place a broken relationship is caught.

**Scale envelope:** designed for ~100 challenges/day (the hackathon- and near-term scale), with the two growth pressure points — `audit_events` and `outbox_events` — planned for monthly range partitioning the moment they pass ~1M rows (see §9).

---

## 2. Stack & Version Pin

| Concern | Choice | Rationale |
| --- | --- | --- |
| Database | PostgreSQL **16** + PostGIS **3.4** | Latest Postgres; PostGIS for point/boundary GIS. |
| ORM | Prisma **5.x** (schema-first, `prisma migrate`) | TS-native generated client, declarative migrations. |
| Identity | **Firebase Auth (external)** | `BACKEND_ARCHITECTURE.md` §8.1 — identity is external; the profile lives in Postgres keyed by `firebase_uid`. |
| Files | GCS (prod) / MinIO (dev) | `StorageService` interface; **bytes never in Postgres**, only pointers (`challenge_evidence.storage_ref`). |
| Cache/queue | Redis 7 (outside this doc) | Cache + BullMQ; **no truth lives in Redis**. |
| Time | UTC timestamps everywhere | All `DateTime` columns stored UTC, formatted at the edge. |

**Prisma preview features required** (pin in `schema.prisma`):

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch", "multiSchema"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuidOssp(map: "pgcrypto", schema: "public")]
}
```

> `uuidOssp` (pgcrypto) backs `@default(uuid())`. **PostGIS is enabled once** via raw migration — see §10.1; it is *not* a `datasource` extension because Prisma does not manage GEOMETRY types natively.

---

## 3. Conventions

### 3.1 Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Tables | snake_case, plural | `challenges`, `team_members` |
| Columns | snake_case | `firebase_uid`, `block_code` |
| Boolean flags | `is_` prefix | `is_private`, `is_success` |
| Timestamps | `_at` suffix, UTC | `created_at`, `transitioned_at`, `read_at` |
| Soft delete | `deleted_at` (nullable) | `challenges.deleted_at` |
| FKs | `<table>_id` | `challenge_id`, `project_id` |
| Enums | PascalCase, stored uppercase | `ChallengeStatus.SUBMITTED` |

### 3.2 Every mutable row gets

```text
id          UUID   PK, @default(uuid())
created_at  DateTime @default(now())
updated_at  DateTime @updatedAt
```

`updated_at` is managed by Prisma's `@updatedAt`. Rows that are **append-only** (audit, outbox, impact, AI, validations) omit `updated_at`.

### 3.3 Enums live in the database, not in application strings

Every enum below is a Prisma enum → a native Postgres enum. This is the "status enum + last-line-of-defense guard". **Application code must not write literal `"SUBMITTED"` strings**; it references the generated enum constants and passes through the workflow engine.

---

## 4. Enums

```prisma
// ── Identity & roles (BACKEND_ARCHITECTURE.md §8; Actors_and_roles.md) ──────────

enum UserRole {
  CITIZEN
  COMMUNITY_NGO
  PRI          // Panchayati Raj Institution
  ULB          // Urban Local Body
  GOV_VALIDATOR
  GOV_DEPARTMENT
  UNIVERSITY    // university-level admin / VC office
  FACULTY
  STUDENT
  INDUSTRY
  CSR
  LAB
  SUPER_ADMIN
}
// 12 roles = 12 actor types. GOV_VALIDATOR + GOV_DEPARTMENT split the
// "Government" actor so validation powers are not fungible across departments.

enum OrgType {
  UNIVERSITY
  GOVT_DEPARTMENT
  GOVT_BODY       // PRI / ULB / district admin
  COMPANY
  CSR
  LAB
  NGO
  INDIVIDUAL
}

// ── Geographic scope (Actors_and_roles.md §19) ───────────────────────────────

enum GeoScopeType {
  STATE
  DISTRICT
  BLOCK
  PANCHAYAT
}

// ── Workflow (BACKEND_ARCHITECTURE.md §6.2) ──────────────────────────────────

enum ChallengeStatus {
  SUBMITTED
  AI_UNDERSTANDING
  CLARIFICATION_REQUESTED
  VALIDATION_PENDING
  VALIDATED
  DEFERRED            // gov deferred; re-enterable later (non-linear branching)
  REJECTED            // terminal for a rejected challenge
  CLUSTERED
  PRIORITY_RANKED
  MATCHING
  UNIVERSITY_ACCEPTED
  UNIVERSITY_DECLINED
  TEAM_FORMING
  PROPOSAL_REVIEW
  COLLABORATION
  PROTOTYPE
  PILOT
  PROJECT_VALIDATION
  DEPLOYMENT_APPROVED
  IMPACT_MEASUREMENT
  CLOSED               // terminal
  FAILED               // terminal unless workflow:resolve
  STALLED              // re-enterable via workflow:resolve
}

enum ProjectStatus {
  PROPOSAL_REVIEW
  TEAM_FORMING
  ACTIVE
  ON_HOLD
  COMPLETED
  FAILED
}

// ── Domain sub-enums ─────────────────────────────────────────────────────────

enum EvidenceType {
  PHOTO
  VIDEO
  AUDIO
  DOCUMENT
  TELEMETRY       // sensor reading blobs / CSV
  GEOTAG
}

enum ValidationDecision {
  VALID
  NEEDS_CLARIFICATION
  INVALID
  DEFER
}

enum ClusterProcessState {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
}

enum AiKind {
  UNDERSTAND
  SIMILARITY
  PRIORITIZE
  MATCH
  VISION          // evidence image analysis
}

enum AiStatus {
  PENDING
  RUNNING
  SUCCEEDED
  FAILED
  RETRYABLE
}

enum ProposalStatus {
  SUBMITTED
  UNDER_REVIEW
  REVISION_REQUESTED
  APPROVED
  REJECTED
}

enum OfferStatus {
  OPEN
  ACCEPTED
  DECLINED
  CANCELLED
}

enum MilestoneStatus {
  NOT_STARTED
  IN_PROGRESS
  BLOCKED
  DONE
  OVERDUE
}

enum AuditAction {
  SUBMIT
  AI_UNDERSTAND
  REQUEST_CLARIFICATION
  SUPPLY_CLARIFICATION
  VALIDATE
  INVALIDATE
  DEFER
  RECLUSTER
  PRIORITIZE
  MATCH
  ACCEPT
  DECLINE
  FORM_TEAM
  SUBMIT_PROPOSAL
  APPROVE_PROPOSAL
  REQUEST_REVISION
  START_COLLABORATION
  START_PROTOTYPE
  START_PILOT
  VERIFY_VALIDATION
  APPROVE_DEPLOYMENT
  RECORD_IMPACT
  CLOSE
  ESCALATE        // → FAILED/STALLED entry
  RESOLVE         // FAILED/STALLED exit
  UNAUTHORIZED_ATTEMPT   // attempted but denied transition
}

enum NotificationType {
  CHALLENGE_SUBMITTED
  AI_COMPLETED
  CLARIFICATION_REQUESTED
  VALIDATED
  PRIORITY_CHANGED
  UNIVERSITY_MATCHED
  UNIVERSITY_ACCEPTED
  UNIVERSITY_DECLINED
  TEAM_FORMED
  PROPOSAL_SUBMITTED
  COLLABORATION_REQUESTED
  COLLABORATION_ACCEPTED
  MILESTONE_APPROACHING
  MILESTONE_OVERDUE
  PILOT_STARTED
  PILOT_COMPLETED
  VALIDATION_COMPLETED
  DEPLOYMENT_APPROVED
  IMPACT_VERIFIED
  CLOSED
}

enum NotificationChannel {
  IN_APP
  EMAIL
  SMS
}

enum NotificationDeliveryState {
  PENDING
  QUEUED
  DELIVERED
  FAILED
}
```

---

## 5. Schema — Core Domain

### 5.1 `users` — platform member profiles

Identity is **Firebase Auth** (external); this row is the platform profile and the anchor for every authorization scope: roles, organization, geo scope, and resource membership.

```prisma
model User {
  id              String    @id @default(uuid())
  firebase_uid    String    @unique
  name            String
  phone           String?              // PII, protected (Actors §20)
  email           String?              // PII, protected
  avatar_url      String?
  language_pref   String    @default("en")
  is_active       Boolean   @default(true)
  last_login_at   DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // ── authorization scope anchors ──
  organization_id String?
  organization    Organization? @relation(fields: [organization_id], references: [id])
  roles           UserRoleLink[]
  geo_scopes      UserGeoScope[]
  memberships     TeamMember[]
  submissions     Challenge[]  @relation("submitterSubmissions")
  proposals       Proposal[]   @relation("proposalSubmitter")
  impact_records  ImpactRecord[]
  notifications   AppNotification[]
  comments        ChallengeComment[]
  refresh_tokens  RefreshToken[]
  audited_actions AuditEvent[]
  acceptances     UniversityAcceptance[]

  @@index([is_active])
  @@index([created_at])
  @@index([organization_id])
}
```

**Why:** All authorization starts from `User` → `roles` + `organization` + `geo_scopes` + membership. `firebase_uid` is the join key to the identity provider. Phone/email are **individually encrypted at the application layer** before hitting the DB (see `SECURITY_ARCHITECTURE.md`), so even a DB dump does not expose them.

### 5.2 `organizations`, `universities`, `departments`

```prisma
model Organization {
  id            String    @id @default(uuid())
  name          String
  type          OrgType
  short_code    String?            // e.g. BITM, RANCHI_ULB
  verified      Boolean   @default(false)
  contact_email String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  members        User[]
  university     University?
  departments    Department[]
  challenges     Challenge[]       // orgs submitting on behalf (PRI, ULB, dept)
  collaborations_offered Collaboration[] @relation("offeringOrg")

  @@index([type])
}
```

```prisma
model University {
  id              String    @id @default(uuid())
  organization_id String    @unique         // 1:1 → Organization(type=UNIVERSITY)
  name            String
  code            String    @unique          // e.g. "BITM"
  district        String
  city            String
  address         String?
  website         String?
  established_year Int?
  naac_grade      String?
  accreditation   String?
  capacity        Int       @default(1)      // concurrent challenge handling capacity
  description     String?
  facilities      Json[]    @default([])     // [{kind, name, note}] — facilities & innovation centres
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  organization Organization @relation(fields: [organization_id], references: [id])
  departments  Department[]
  projects     Project[]
  pilots       Pilot[]              // (none today; reserved: pilots list uni sites)
}

model Department {
  id              String   @id @default(uuid())
  organization_id String               // org of the university — set explicitly, no random default
  university_id   String
  name            String
  focus_area      String?

  university    University @relation(fields: [university_id], references: [id])
  organization  Organization @relation(fields: [organization_id], references: [id])

  @@index([university_id])
}
```

**Why:** Universities are a first-class profile object with capacity, accreditation, and department structure — used by the matching engine and the university directory. The 1:1 `University–Organization` split means a non-university organization (dept, CSR, lab) has no phantom university row. The 30-real-HEI dataset in the frontend `heiMatchingEngine` seeds maps **1:1** into this table via `seed:demo`.

### 5.3 `challenges` — the root entity of the workflow

This is **the spine**. Every invariant and every workflow rule anchors here.

```prisma
model Challenge {
  id            String    @id @default(uuid())
  version       Int       @default(1)          // optimistic concurrency §6.5

  // ── Identity & location ──
  title         String
  description   String
  category      String                          // taxonomy, validated at creation
  sub_category  String?
  district_code String
  block_code    String?
  location      Unsupported("geometry(Point,4326)")?  // PostGIS pin (detail/GPS)
  area_panchayat String?

  // ── Workflow state (last line of defense — real control is the engine) ──
  status              ChallengeStatus @default(SUBMITTED)
  priority_score      Decimal?  @db.Decimal(4,2)    // 0.00–9.99
  priority_factors    Json?                         // {urgency, severity, scale, publicGood} → reasons

  // AI understanding (denormalized snapshot of the latest UNDERSTAND rec; full
  // history lives in ai_recommendations — AI output never overwrites a human decision)
  ai_summary    String?
  ai_domain     String?
  ai_sub_domain String?
  ai_tags       String[]      @default([])          // Postgres text[]
  ai_severity   String?
  ai_urgency    String?
  ai_confidence Decimal?      @db.Decimal(4,2)

  // Clarification (sub-state of CLARIFICATION_REQUESTED)
  clarification_request  Json?
  clarification_response Json?

  // ── Ownership & scoping ──
  submitter_id    String                         // FK → never NULL (origin invariant)
  submitter_type  UserRole                       // snapshot role at submit
  assigned_org_id String?                        // validating/owning gov org
  reviewer_id     String?

  // soft-delete — challenges soft-delete, never hard (§12)
  deleted_at      DateTime?
  submitted_at    DateTime  @default(now())
  transitioned_at DateTime?                      // last state change (SLA/reports)
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  // ── relations ──
  submitter             User @relation("submitterSubmissions", fields: [submitter_id], references: [id])
  assigned_org          Organization? @relation(fields: [assigned_org_id], references: [id])
  submission            Submission?
  evidence              ChallengeEvidence[]
  validations           Validation[]
  ai_recommendations    AiRecommendation[]
  cluster_members       ClusterMember[]
  acceptances           UniversityAcceptance[]
  project               Project?
  comments              ChallengeComment[]

  @@index([status])
  @@index([district_code, status])              // "what's out there" listings
  @@index([submitter_id, submitted_at])          // citizen timeline
  @@index([block_code])
  @@index([category])
  @@index([assigned_org_id])
}

// CHECK constraints — raw SQL migration, Prisma can't inline them:
//   ALTER TABLE challenges ADD CONSTRAINT chk_priority_range
//     CHECK (priority_score IS NULL OR (priority_score >= 0 AND priority_score <= 9.99));
```

**Why `version`:** the engine does `SELECT ... FOR UPDATE` then `UPDATE ... WHERE id=? AND version=?`. A lost update is impossible; a mismatch returns `409 Conflict` (`BACKEND_ARCHITECTURE.md` §6.5). The `version` column needs no index of its own — the PK covers the `WHERE id=?` leg and version is checked in the same predicate.

### 5.4 `submissions` — the ingest edge

Kept **separate from `challenges`** so a citizen's raw submission (with attachments, geotag, PII) stays immutable while the challenge row it becomes can evolve.

```prisma
model Submission {
  id              String    @id @default(uuid())
  challenge_id    String    @unique      // 1:1 — a submission begets one challenge
  channel         String    @default("web")   // web | sms | field_app
  raw_payload     Json                  // original form payload, immutable
  attachments     Json?                 // [{ref, type, size}] pointers
  submitted_via_agent Boolean @default(false)  // outreach/field agent assisted
  submitted_at    DateTime  @default(now())

  challenge Challenge @relation(fields: [challenge_id], references: [id])
}
```

**Why separate:** if a citizen later amends a description, the *original* submission is preserved as the evidentiary baseline, while the challenge re-flows through permitted transitions.

---

## 6. Schema — Workflow, AI, Validation

### 6.1 `challenge_evidence`

```prisma
model ChallengeEvidence {
  id          String        @id @default(uuid())
  challenge_id String
  type        EvidenceType
  storage_ref String                  // gs://bucket/... or minio bucket key
  mime_type   String?
  size_bytes  Int?
  meta        Json?                   // {capturedAt, gps, device}
  is_private  Boolean       @default(false)   // signed URL only when private (§12)
  uploader_id String
  deleted_at  DateTime?               // soft-delete only — immutability §12
  created_at  DateTime      @default(now())

  challenge Challenge @relation(fields: [challenge_id], references: [id])

  @@index([challenge_id])
  @@index([is_private])
}
```

**Why:** holds only *pointers* to bytes. `storage_ref` is opaque to the app; the `StorageService` resolves it. Private evidence never leaves via the public projection because public read models never select this table.

### 6.2 `ai_recommendations`

```prisma
model AiRecommendation {
  id            String    @id @default(uuid())
  challenge_id  String
  kind          AiKind                     // UNDERSTAND | SIMILARITY | PRIORITIZE | MATCH | VISION
  status        AiStatus  @default(PENDING)

  result        Json?                      // per-kind payload (§7 mapping) — AI output, never a decision
  confidence    Decimal?  @db.Decimal(4,2)
  reasons       Json?                      // human-readable reasons list
  model_version String                     // pinned model+version for auditability

  superseded_by_id String? @unique         // re-run supersedes prior; self-ref trace
  // (the human decision that used this rec is linked via Validation.ai_recommendation_id)
  error_message String?
  attempt_count Int      @default(0)
  completed_at  DateTime?
  created_at    DateTime  @default(now())

  challenge   Challenge @relation(fields: [challenge_id], references: [id])
  validation  Validation?
  audit_events AuditEvent[]

  @@index([challenge_id, kind, created_at])
  @@index([status])
}
```

**Why:** this table makes `AI output ≠ human decision` structural. The audit trace is `audit_events.ai_recommendation_id → ai_recommendations.id`. Re-runs append rows and link via `superseded_by_id` instead of overwriting.

### 6.3 `validations` — human decisions

```prisma
model Validation {
  id             String   @id @default(uuid())
  challenge_id   String
  reviewer_id    String
  decision       ValidationDecision
  reason         String?
  supporting_note String?
  ai_recommendation_id String?  @unique   // which rec informed this decision (≤1 per decision)
  clarification_requested Json?        // structured questions when NEEDS_CLARIFICATION
  decided_at     DateTime @default(now())

  challenge        Challenge @relation(fields: [challenge_id], references: [id])
  ai_recommendation AiRecommendation? @relation(fields: [ai_recommendation_id], references: [id])

  @@index([challenge_id, decided_at])
  @@index([reviewer_id])
}
```

**Why:** one `challenge` accumulates multiple `Validation` rows (a VALID long after a DEFER) — history preserved per *row*, never per *column*, exactly as §9.2 / `Actors_and_roles.md` §23 require.

### 6.4 `clusters`, `cluster_members` — dedup & similarity

```prisma
model Cluster {
  id        String    @id @default(uuid())
  label     String    @unique                // human tag, e.g. "Ranchi monsoon drainage"
  state     ClusterProcessState @default(QUEUED)
  created_at DateTime @default(now())

  members ClusterMember[]
}

model ClusterMember {
  id           String   @id @default(uuid())
  cluster_id   String
  challenge_id String
  similarity   Decimal? @db.Decimal(5,4)    // 0.0000..1.0000 vs cluster centroid
  is_primary   Boolean  @default(false)      // canonical challenge of the cluster
  added_at     DateTime @default(now())

  cluster   Cluster   @relation(fields: [cluster_id], references: [id])
  challenge Challenge @relation(fields: [challenge_id], references: [id])

  @@unique([cluster_id, challenge_id])      // no double membership
  @@index([challenge_id])
}
```

**Why dedup survives here:** deleting a `Cluster` never deletes its member `challenges` — the FK sever only removes `ClusterMember` rows. Matches §10.2 integrity rule #2.

### 6.5 `university_acceptances` — the accept/decline edge

A university accepts (or declines) *before* a project exists, so the accept/decline must be its own record, not a field on `projects`.

```prisma
model UniversityAcceptance {
  id           String   @id @default(uuid())
  challenge_id String
  university_id String
  decision     String                 // "ACCEPTED" | "DECLINED"
  reason       String?
  decided_by   String?                // acting user id
  decided_at   DateTime @default(now())

  challenge Challenge @relation(fields: [challenge_id], references: [id])
  user      User?     @relation(fields: [decided_by], references: [id])

  @@unique([challenge_id, university_id])
  @@index([university_id])
}
```

**Why:** `UNIVERSITY_ACCEPTED` is a challenge state (§6.2), and the accepting institution is later materialized into `projects.university_id`. This junction keeps the accept decision auditable before the project row exists, and is populated at the `MATCHING` stage by the AI's ranked HEI list being *acted upon* one by one.

---

## 7. Schema — Project Lifetime (university → deployment → impact)

### 7.1 `projects`

```prisma
model Project {
  id              String         @id @default(uuid())
  challenge_id    String         @unique       // 1 challenge → at most 1 live project
  university_id   String                       // accepting institution
  status          ProjectStatus  @default(PROPOSAL_REVIEW)
  team_lead_id    String?

  proposal_title    String?
  proposal_abstract String?
  proposal_doc_ref  String?                    // file pointer

  courses_credits   Json?                      // [{code, name, credits, semester}]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  challenge     Challenge     @relation(fields: [challenge_id], references: [id])
  university    University    @relation(fields: [university_id], references: [id])
  team          Team?
  proposal      Proposal?
  milestones    Milestone[]
  impact_records ImpactRecord[]
  collaborations Collaboration[]
  pilots        Pilot[]
  deployments   Deployment[]

  @@index([university_id, status])
}
```

**Why:** `challenge_id @unique` enforces the invariant that a challenge is tackled by **one** project pipeline (matching may consider many; the accepted project is one).

### 7.2 `teams` and `team_members`

```prisma
model Team {
  id          String    @id @default(uuid())
  project_id  String    @unique        // one team per project
  name        String?
  created_at  DateTime  @default(now())

  members TeamMember[]
  project Project     @relation(fields: [project_id], references: [id])
}

model TeamMember {
  id        String   @id @default(uuid())
  team_id   String
  user_id   String
  role      String                 // lead | member | mentor
  skills    String[]  @default([]) // ["civil", "iot", "data"]
  is_mentor Boolean  @default(false)
  joined_at DateTime @default(now())

  team Team @relation(fields: [team_id], references: [id])
  user User @relation(fields: [user_id], references: [id])

  @@unique([team_id, user_id])
  @@index([user_id])
}
```

### 7.3 `proposals`

```prisma
model Proposal {
  id              String        @id @default(uuid())
  project_id      String        @unique
  submitter_id    String
  doc_ref         String?               // full proposal document (storage)
  title           String
  content_md      String?
  status          ProposalStatus @default(SUBMITTED)
  reviewer_id     String?
  review_notes    Json?                 // structured rubric feedback
  revision_request Json?                // what to fix when REVISION_REQUESTED
  submitted_at    DateTime      @default(now())
  reviewed_at     DateTime?

  project   Project @relation(fields: [project_id], references: [id])
  submitter User    @relation("proposalSubmitter", fields: [submitter_id], references: [id])

  @@index([status])
  @@index([reviewer_id])
}
```

### 7.4 `milestones`

```prisma
model Milestone {
  id           String    @id @default(uuid())
  project_id   String
  title        String
  deliverable  String?
  due_at       DateTime
  status       MilestoneStatus @default(NOT_STARTED)
  progress     Int       @default(0)       // 0..100
  evidence_ref String?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  project Project @relation(fields: [project_id], references: [id])

  @@index([project_id, due_at])
  @@index([status])
}
```

**Why `status = OVERDUE` is a stored value:** an overdue-scan worker transitions surviving milestones to OVERDUE and the notifier fires `MILESTONE_OVERDUE`. Denormalized on purpose — `WHERE status='OVERDUE'` is then trivial and correct.

### 7.5 `collaborations` and `offers` — industry / CSR / lab join-in

```prisma
model Collaboration {
  id              String    @id @default(uuid())
  project_id      String
  offering_org_id String                        // industry / CSR / lab / dept org
  need            String                         // what the project needs
  form            String                         // funding | resource | expertise
  acceptance_needed Boolean @default(false)
  status          OfferStatus @default(OPEN)
  created_at      DateTime  @default(now())
  accepted_at     DateTime?

  project          Project      @relation(fields: [project_id], references: [id])
  offering_org     Organization @relation("offeringOrg", fields: [offering_org_id], references: [id])
  offers           Offer[]

  @@index([project_id, status])
  @@index([offering_org_id])
}

model Offer {
  id              String     @id @default(uuid())
  collaboration_id String
  offered_by_org  String
  amount          Decimal?   @db.Decimal(12,2)
  in_kind         Json?                        // {equipment, people, facilities}
  terms           String?
  status          OfferStatus @default(OPEN)
  accepted_at     DateTime?
  created_at      DateTime   @default(now())

  collaboration Collaboration @relation(fields: [collaboration_id], references: [id])

  @@index([collaboration_id])
}
```

**Why the two-hop shape:** a `Collaboration` is *the project's expressed need*; an `Offer` is *a concrete partner's response* to it. Both can carry `acceptance_needed`/`status`, so `accepted_at` lives where the acceptance actually happened.

### 7.6 `pilots`, `deployments`

```prisma
model Pilot {
  id            String    @id @default(uuid())
  project_id    String
  university_id String?
  location      String              // human-readable site
  district_code String
  scope         String?             // "1 panchayat block" etc.
  metrics       Json?               // baseline metrics captured
  evidence_ref  String?
  is_success    Boolean?            // null until verdict
  started_at    DateTime  @default(now())
  ended_at      DateTime?
  created_at    DateTime  @default(now())

  project    Project    @relation(fields: [project_id], references: [id])
  university University? @relation(fields: [university_id], references: [id])

  @@index([project_id])
}

model Deployment {
  id            String    @id @default(uuid())
  project_id    String
  approved_by   String
  approval_ref  String?             // approval doc / letter
  district_code String
  status        String    @default("ACTIVE")   // ACTIVE | PAUSED | RETIRED
  started_at    DateTime  @default(now())
  created_at    DateTime  @default(now())

  project Project @relation(fields: [project_id], references: [id])

  @@index([project_id])
}
```

> `Pilot.university_id` is intentionally nullable — a pilot may be co-run by an external lab/company rather than the host university. `Deployment.approved_by` is a plain string id (an actor snapshot is preserved via the audit event that created this row).

### 7.7 `impact_records` — the "impact-first-class" invariant

```prisma
model ImpactRecord {
  id            String    @id @default(uuid())
  project_id    String
  metric_name   String                  // "students reaching school", "waterlogging days"
  metric_group  String?                 // outcome | output | sdg
  before_value  Decimal?  @db.Decimal(14,2)
  after_value   Decimal?  @db.Decimal(14,2)
  units         String?
  beneficiaries Int?
  evidence_ref  String?                 // proof (survey, telemetry, photo)
  recorded_by   String
  is_verified   Boolean   @default(false)
  verified_at   DateTime?
  created_at    DateTime  @default(now())

  project Project @relation(fields: [project_id], references: [id])
  user    User    @relation(fields: [recorded_by], references: [id])

  @@index([project_id, metric_name])
  @@index([is_verified])
}
```

**Why:** `impact_records.project_id` is NOT NULL (integrity rule #3). Verification is a bool flip + timestamp, and each flip is additionally mirrored as an `audit_event`, so "who verified impact, on what evidence" is always reconstructable.

---

## 8. Schema — Platform Services

### 8.1 `audit_events` (append-only)

```prisma
model AuditEvent {
  id                   String    @id @default(uuid())
  actor_id             String
  actor_role           UserRole?
  actor_org_id         String?
  action               AuditAction
  resource_type        String               // "challenge" | "project" | "user" | ...
  resource_id          String               // polymorphic id — no FK by design
  from_state           String?              // prior ChallengeStatus / ProjectStatus
  to_state             String?
  payload_snapshot     Json?
  human_reason         String?
  ai_recommendation_id String?
  request_trace_id     String?
  created_at           DateTime  @default(now())

  actor            User             @relation(fields: [actor_id], references: [id])
  ai_recommendation AiRecommendation? @relation(fields: [ai_recommendation_id], references: [id])

  // Composite index steering "reconstruct one entity's history":
  @@index([resource_type, resource_id, created_at])
  @@index([actor_id, created_at])
  @@index([action])
  @@index([created_at])
}
```

**Append-only enforcement** — raw SQL migration (Prisma can't express triggers):

```sql
CREATE FUNCTION audit_no_mutation() RETURNS trigger AS $$
BEGIN
  IF (current_setting('nivaaran.allow_audit_edit', true) <> '1') THEN
    RAISE EXCEPTION 'audit_events is append-only';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_append_only
  BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW EXECUTE FUNCTION audit_no_mutation();
```

Retention: 7 years (`AUDIT_RETENTION_YEARS`), archive-then-truncate monthly cron (`BACKEND_ARCHITECTURE.md` §14). Range partitioning at ~1M rows (§9.2).

### 8.2 `outbox_events` (transactional outbox — `BACKEND_ARCHITECTURE.md` §6.6)

```prisma
model OutboxEvent {
  id            String   @id @default(uuid())
  event_type    String                   // "challenge.validated" — String, not enum: grows
  payload       Json                     // full domain payload for consumers
  aggregate_type String                 // "challenge" | "project"
  aggregate_id  String
  status        String   @default("PENDING")   // PENDING | DISPATCHED | FAILED
  attempts      Int      @default(0)
  last_error    String?
  dispatch_trace_id String?              // pub/sub / redis delivery id (dedup)
  created_at    DateTime @default(now())
  dispatched_at DateTime?

  @@index([status, created_at])
  @@index([aggregate_type, aggregate_id])
}
```

**Flow (§6.6):** the transition transaction inserts the `OutboxEvent` row **atomically** with the state change; the poller reads `PENDING`, publishes, marks `DISPATCHED`; a failed publish stays `FAILED` and retries with backoff. No event is lost on a crash mid-cycle because the row was committed with the change.

### 8.3 `app_notifications`

```prisma
model AppNotification {
  id              String    @id @default(uuid())
  recipient_id    String
  type            NotificationType
  channel         NotificationChannel @default(IN_APP)
  delivery_state  NotificationDeliveryState @default(PENDING)
  title           String
  body            String
  payload         Json?                // {resource_type, resource_id, deepLink}
  audit_event_id  String?
  read_at         DateTime?
  delivered_at    DateTime?
  created_at      DateTime  @default(now())

  recipient User @relation(fields: [recipient_id], references: [id])

  @@index([recipient_id, read_at])
  @@index([delivery_state])
  @@index([audit_event_id])
}
```

Every notification references its originating `audit_event_id` for traceability (§13).

### 8.4 IAM & RBAC — "matrix as data"

```prisma
model Role {
  id          String   @id @default(uuid())
  name        UserRole @unique
  description String?
  priority    Int      @default(100)     // order in which overlapping-role conflicts resolve
  created_at  DateTime @default(now())

  user_links      UserRoleLink[]
  permission_links RolePermission[]
}

model Permission {
  id          String  @id @default(uuid())
  capability  String  @unique       // e.g. "challenge:validate", "project:deploy"
  description String?
  created_at  DateTime @default(now())

  role_links RolePermission[]
}

model RolePermission {
  id            String    @id @default(uuid())
  role_name     UserRole
  permission_id String
  created_at    DateTime  @default(now())

  role       Role       @relation(fields: [role_name], references: [name])
  permission Permission @relation(fields: [permission_id], references: [id])

  @@unique([role_name, permission_id])
}

model UserRoleLink {
  id         String    @id @default(uuid())
  user_id    String
  role_name  UserRole
  granted_at DateTime  @default(now())

  user User @relation(fields: [user_id], references: [id])
  role Role @relation(fields: [role_name], references: [name])

  @@unique([user_id, role_name])
  @@index([role_name])
}

model UserGeoScope {
  id            String        @id @default(uuid())
  user_id       String
  scope_type    GeoScopeType
  district_code String?               // "RANCHI"
  block_code    String?               // "KANKE"
  created_at    DateTime      @default(now())

  user User @relation(fields: [user_id], references: [id])

  @@unique([user_id, scope_type, district_code])
}
```

**Why this shape:** authorization stays **data-driven**. Granting `GOV_DEPARTMENT` the `challenge:deploy` capability is a seed-row change, not a deploy (`BACKEND_ARCHITECTURE.md` §8.3). The concrete permission rows are enumerated in `RBAC_MATRIX.md`.

> **FK note:** `UserGeoScope` references district/block **codes** as plain strings rather than FKs into `districts`/`blocks`. This is intentional: geo grants may predate boundary seeding and must not block a user creation on boundary availability.

### 8.5 `refresh_tokens`, `challenge_comments`

```prisma
model RefreshToken {
  id         String    @id @default(uuid())
  user_id    String
  token_hash String    @unique         // never store the raw token
  expires_at DateTime
  revoked_at DateTime?
  created_at DateTime  @default(now())

  user User @relation(fields: [user_id], references: [id])

  @@index([user_id, revoked_at])
}

model ChallengeComment {
  id           String    @id @default(uuid())
  challenge_id String
  author_id    String
  body         String
  parent_id    String?                 // threaded replies
  created_at   DateTime  @default(now())

  challenge Challenge @relation(fields: [challenge_id], references: [id])
  author    User      @relation(fields: [author_id], references: [id])

  @@index([challenge_id, created_at])
}
```

### 8.6 `app_config` — runtime configuration as data

```prisma
model AppConfig {
  key        String   @id
  value      Json
  updated_at DateTime @updatedAt
}
```

Examples: `ai.provider`, `ai.model_version`, `notif.retry_max`, `audit.retention_years`, `matching.default_capacity`. One row per key; the provider registry reads it at startup and on change — a model/provider swap is a config write, not a deploy (`System_architecture.md` §22).

---

## 9. Index Strategy & Growth Plan

### 9.1 The index catalogue (what matters, and why)

| Table | Index | Query it serves |
| --- | --- | --- |
| `challenges` | `(status)` | all "where are things" lists |
| `challenges` | `(district_code, status)` | district listing + gov dashboard filter |
| `challenges` | `(submitter_id, submitted_at)` | citizen's "my reports" timeline |
| `challenges` | `(assigned_org_id)` | gov inbox by owning org |
| `audit_events` | `(resource_type, resource_id, created_at)` | **one entity's full history** — the hot query (§14) |
| `audit_events` | `(actor_id, created_at)` | "everything user X did" |
| `outbox_events` | `(status, created_at)` | poller's `WHERE status='PENDING'` scan |
| `app_notifications` | `(recipient_id, read_at)` | unread count + inbox |
| `ai_recommendations` | `(challenge_id, kind, created_at)` | challenge's AI trace |
| `cluster_members` | `(challenge_id)` | "which cluster is this in?" |
| `impact_records` | `(project_id, metric_name)` | per-project impact export |
| `team_members` | `(user_id)` | "what teams is this user on?" |
| `milestones` | `(project_id, due_at)` | overdue scans |
| `users` | `(firebase_uid)` | identity join |
| `university_acceptances` | `(university_id)` | "what has this uni taken on?" |

**Catalog query that the composite cover-indexes avoid:** nothing here needs a covering index at this scale; the planner is fine with the leading-column prefix of each index above.

**The full-text / semantic-dedup enabler** — raw SQL migration (Prisma has no trigram DSL):

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_challenges_title_trgm ON challenges USING gin (title gin_trgm_ops);
CREATE INDEX idx_challenges_tags_gin  ON challenges USING gin (ai_tags);
```

### 9.2 Partitioning plan (defensive, not YAGNI)

`audit_events` and `outbox_events` are the append-only tables that grow without bound. Trigger at **≥1M rows**:

```sql
-- audit_events: monthly range partition on created_at
ALTER TABLE audit_events PARTITION BY RANGE (created_at);
-- (migration tooling creates month N+1 partitions each month)

-- outbox_events: after DISPATCH, rows are transient. A monthly job archives
-- DELIVERED/DISPATCHED rows older than X days, then deletes — the only
-- mutation permitted on what is otherwise a staged table.
```

Until that threshold, **no partitioning** — it adds operational cost for zero benefit at current scale (§14's explicit note).

---

## 10. PostGIS & GIS Columns

### 10.1 PostGIS setup

PostGIS is **not enabled by default** in vanilla Postgres 16. It must be enabled once via **raw migration** (`prisma migrate` runs plain SQL just fine, but Prisma's schema file cannot declare extensions it doesn't manage):

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
-- verify: SELECT postgis_version();
```

**Spatial columns are NOT Prisma-native.** They are declared as opaque `Unsupported("geometry(Point,4326)")` — Prisma passes them through untouched and never blocks reads/writes; all `ST_*` queries are raw SQL through `$queryRaw`. This is the pragmatic Prisma+PostGIS pattern: **Prisma owns the relational schema, raw SQL owns the geometry.**

### 10.2 Spatial indexes & queries

```sql
CREATE INDEX idx_challenges_location_gist
  ON challenges USING gist (location);

-- 1) bounding-box filter (map viewport)
SELECT id, title FROM challenges
WHERE location && ST_MakeEnvelope(:west, :south, :east, :north, 4326);

-- 2) point-in-boundary (district / block attribution)
SELECT c.id FROM challenges c
JOIN districts d ON d.code = c.district_code
WHERE ST_Contains(d.boundary, c.location);
```

### 10.3 Boundaries (`districts`, `blocks`)

```prisma
model District {
  code         String  @id                   // "RANCHI"
  name         String
  state_code   String  @default("JH")
  boundary     Unsupported("geometry(MultiPolygon,4326)")?
  centroid     Unsupported("geometry(Point,4326)")?
  risk_profile Json?                         // {floodRisk, droughtRisk} summaries
}

model Block {
  code          String  @id
  district_code String
  name          String
  boundary      Unsupported("geometry(MultiPolygon,4326)")?
  updated_at    DateTime @updatedAt

  @@index([district_code])
}
```

**Data source:** the demo uses the 24-district centroid/geojson truth the frontend already has (`JHARKHAND_DISTRICT_CENTROIDS` in `mapDataService.ts`), flushed into `District` via `seed:demo`. Production boundary files (Survey of India / NIC) are a `GIS_ARCHITECTURE.md` decision.

**Boundary indexes** — raw SQL:

```sql
CREATE INDEX idx_districts_boundary_gist  ON districts USING gist (boundary);
CREATE INDEX idx_blocks_boundary_gist     ON blocks    USING gist (boundary);
```

---

## 11. Governance of the `challenges.status` value

The DB enum is the **floor**, never the ceiling:

```text
Application code never writes:
    UPDATE challenges SET status = 'VALIDATED' WHERE id = $1

Application code always writes through:
    engine.transition(challenge, 'challenge:validate', actor, payload)
        → validates actor roles (RBAC + geo scope + ownership)
        → evaluates guards (validations exist, not FAILED, correct edges)
        → UPDATE challenges SET status=target, version=version+1
          WHERE id=? AND version=? ;
        → INSERT INTO audit_events(...) ;
        → INSERT INTO outbox_events(...) ;
        → COMMIT (atomic)
```

Enforcing those last three statements **in one transaction** is what makes the workflow **authoritative** (Invariant 1, `BACKEND_ARCHITECTURE.md` §6). Anyone bypassing `engine.transition` is bypassing the DB's integrity net — which is why the enum + CHECK + version column exist as defense in depth.

---

## 12. Migration Strategy

### 12.1 Workflow

Use **Prisma Migrate**:

```bash
# develop
npx prisma migrate dev --name add_university_profile
# commit schema.prisma + migrations/
# CI / prod
npx prisma migrate deploy
```

Rules:
* **Migrations are reviewed like code.** The generated SQL is read before merge — the sequence matters more than the final state.
* **Raw SQL migrations** (PostGIS `CREATE EXTENSION`, audit trigger, trigram/GiST indexes, CHECK constraints) live alongside Prisma migrations as `*.sql` under `migrations/` and run in the same `migrate deploy` step.
* **Never hand-edit the `_prisma_migrations` table.** If a dev DB diverges, use `migrate resolve`, not force-reset (which silently destroys seed data).

### 12.2 `seed:prod` vs `seed:demo`

| | `seed:prod` | `seed:demo` |
| --- | --- | --- |
| Users | real admins only (invite-created) | demo actors (Aman, Sunil, Officer Verma …) |
| Organizations | real depts/unis if known | 30-real-HEI dataset + 2 district bodies |
| Boundaries | real (Survey of India) | 24-district centroids/geojson |
| Challenges | **none** (real submissions only) | canonical flood/school scenario set |
| Projects / impact | none | BIT Mesra flood-monitoring project arc |
| RBAC | full matrix from `RBAC_MATRIX.md` | same matrix (it is not fake) |

Both seeds write **through the service layer and the workflow engine** (`seed:demo` calls `POST .../submit`, `.../transition`, etc. against the fast path), never `prisma.challenge.create` directly — so demo data exercises the exact production path (`BACKEND_ARCHITECTURE.md` §23 Phase 2, §10.1).

---

## 13. Data Integrity Checklist (invariants → constraints)

| Invariant (`Complete_workflow.md` §33) | Enforced by |
| --- | --- |
| 1 Backend authoritative transitions | §11 engine + enum + version |
| 2 AI decision separate from human | `ai_recommendations` vs `validations` |
| 3 Human oversees consequential AI | `validations.ai_recommendation_id`, `audit.ai_recommendation_id` |
| 4 Evidence preserved | soft-delete only, `challenge_evidence.deleted_at` |
| 5 Resolve conflicts before next stage | guard fn (engine) — DB not the arbiter |
| 6 Transparent role + resource authz | RBAC tables + geo scopes |
| 7 Submitter always known | `challenges.submitter_id` NOT NULL |
| 8 Project always tied to a challenge | `projects.challenge_id` NOT NULL + UNIQUE |
| 9 Public/private separation | separate read models; private cols absent from public projection |
| 10 Failure must not corrupt state | outbox atomicity, AI `FAILED` stays persisted, retries |

---

## 14. Places I deliberately did NOT optimize (yet)

* **No replication / read-replica.** One primary at current scale; the read models are cheap query builders, not separate stores.
* **No separate analytics warehouse.** Impact rollups are group-bys over `impact_records`; the analytics module caches aggregated JSON in `AppConfig`/Redis at compute time.
* **No JSONB flexibility where a column exists.** `raw_payload`, `meta`, `reasons` are JSON **documented**; anything we query/filter on gets a real column (status, district, kind, …).
* **No sharding.** Vertical scale is fine to Hackathon + Phase-1 volume.
* **No cascade deletes on core rows.** Teams/milestones/collaborations belong to a project; a hard `DELETE FROM projects` is disallowed by design (soft-delete). The engine, not the DB, decides when a lifecycle genuinely ends (`CLOSED`, never a delete).
* **No UUID v7.** `@default(uuid())` (v4) is fine at this volume; if ordered ids are ever needed for sharding, switch to v7 in one migration — the type stays `String`.

---

## 15. Open decisions handed to later docs

| Decision | Where |
| --- | --- |
| Concrete RBAC permission rows | `RBAC_MATRIX.md` |
| Encryption-at-rest of PII columns (pgcrypto vs app-layer) | `SECURITY_ARCHITECTURE.md` |
| Boundary data source + geocoder | `GIS_ARCHITECTURE.md` |
| Exact POST body payloads per transition | `API_CONTRACTS.md` |

---

## 16. Appendix — Table Census

| # | Table | Purpose | Append-only? | Notes |
| --- | --- | --- | --- | --- |
| 1 | users | platform profile (Firebase-linked) | – | |
| 2 | organizations | actors that own / institutionally submit | – | |
| 3 | universities | HEI profile for matching | – | 1:1 → org |
| 4 | departments | university sub-units for expertise | – | |
| 5 | challenges | **root workflow entity** | – | version column |
| 6 | submissions | immutable ingest edge (1:1) | ✓ | |
| 7 | challenge_evidence | evidence pointers | soft | |
| 8 | ai_recommendations | AI output snapshot | ✓ | per re-run row |
| 9 | validations | human decisions | ✓ | |
| 10 | clusters | dedup cluster | – | |
| 11 | cluster_members | challenge↔cluster | – | |
| 12 | university_acceptances | accept/decline before project exists | ✓ | |
| 13 | projects | post-matching project | – | |
| 14 | teams / team_members | team membership | – | |
| 15 | proposals | proposal submission/review | – | |
| 16 | milestones | project deliverables | – | |
| 17 | collaborations / offers | industry/CSR/lab join | – | |
| 18 | pilots | pilot records | – | |
| 19 | deployments | deployment records | – | |
| 20 | impact_records | verified outcomes | ✓ | |
| 21 | audit_events | append-only history | ✓ | 7-yr retention |
| 22 | outbox_events | transactional outbox | ✓ (transient) | |
| 23 | app_notifications | in-app inbox | ✓ | |
| 24 | roles / permissions / role_permissions | RBAC matrix-as-data | – | |
| 25 | user_roles | user↔role | – | |
| 26 | user_geo_scopes | geo authorization | – | |
| 27 | refresh_tokens | session rotation | – | hashed |
| 28 | challenge_comments | discussion threads | ✓ | |
| 29 | districts / blocks | GIS boundaries | – | PostGIS |
| 30 | app_config | runtime configuration | – | provider swaps |

**Total: 32 tables across Postgres (30 relational + 2 GIS on PostGIS), plus Redis for cache/queue only.**