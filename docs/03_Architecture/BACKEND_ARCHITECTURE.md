# Nivaaran — Backend Architecture

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** Backend Architecture
**Status:** Foundational Architecture — Design for Production / Shipping
**Upstream documents:** `System_architecture.md`, `Complete_workflow.md`, `Actors_and_roles.md`, `Requirements.md`, `Readme.md`

---

## 1. Purpose

This document defines the **backend architecture** of Nivaaran at a production / shipping level. It zooms into the high-level `System_architecture.md` to specify:

* the concrete **monolithic module structure** and folder layout
* the **authoritative workflow engine** (the 16-stage lifecycle as a real server-side state machine)
* the **authentication & authorization** model (who may act, and on what)
* the **AI service boundary** (recommendation → human decision → state)
* the **data layer** (database, ORM, geospatial, migrations)
* the **file / evidence** layer
* the **notification** layer (event-driven)
* the **audit** layer
* the **asynchronous processing** layer
* **security, observability, testing and deployment** for a shipped product

The single most important architectural rule inherited from `System_architecture.md` (§38 Anti-pattern 1) is:

> **The backend is the authoritative source for critical state transitions.**
> A frontend must never send `status = DEPLOYMENT` and have it trusted. The backend must verify whether that transition is authorized, correctly-sequenced and complete, then apply it and record the event.

This document is therefore written around the **workflow engine** as the centerpiece — every other subsystem exists to serve the problem-to-impact lifecycle.

---

## 2. Architectural Context & Design Principles

### 2.1 What we inherit

From the upstream docs, the following are **stable** and must not be contradicted:

| Stable principle | Source |
| --- | --- |
| Challenge-centric architecture (a challenge moves through an enriching lifecycle) | `System_architecture.md` §37.1, `Complete_workflow.md` §2 |
| 16-stage lifecycle with controlled branching (not strictly linear) | `Complete_workflow.md` §22 |
| Human oversight of consequential AI decisions | `System_architecture.md` §37.3, §10 |
| Explainable AI recommendations | `System_architecture.md` §37.4 |
| Role + resource + organizational + geographic + workflow-state authorization | `Actors_and_roles.md` §19 |
| Public / participant / organizational / private data separation | `Actors_and_roles.md` §20 |
| Evidence preservation | `System_architecture.md` §37.7 |
| Modular business domains (modular monolith first) | `System_architecture.md` §40–41 |
| AI/notification/geo providers isolated behind service boundaries | `System_architecture.md` §22, §37.11 |
| Production data separated from demo seed data | `System_architecture.md` §33 |
| The 10 workflow invariants hold regardless of implementation | `Complete_workflow.md` §33 |

### 2.2 Design principles for the backend

1. **The backend is the source of truth.** All state transitions, authorization decisions and audit events are server-side.
2. **Transitions are explicit, not free-form.** A challenge never "jumps" stages and never moves by arbitrary string assignment.
3. **AI recommends; humans decide.** Consequential transitions require an authorized human decision.
4. **Every consequential change is audited.** We can reconstruct who did what, with what AI input and what reason.
5. **Least privilege and resource ownership.** A user can act only on resources they own, manage or participate in, within their org/geo scope.
6. **Public and private data never mix.** Internal AI confidence, review notes and private evidence are never exposed through public APIs.
7. **Failures are isolated.** A down AI or notification provider must not corrupt the business lifecycle.
8. **Demo-ready without fake-data dependency.** Seed scripts use the same APIs and workflows as production.
9. **Modular monolith with clear future extraction boundaries.** Modules depend inward; they can later be split into services without a rewrite.

---

## 3. Technology Stack (deliberate decisions)

The upstream docs left technology open. The following are the **initial shipping decisions**, each with rationale. They are the *default*, not a discussion — deviations require a written decision record.

| Concern | Decision | Rationale |
| --- | --- | --- |
| Language | **Node.js 20 LTS, TypeScript (strict)** | Existing backend is already Node/TS; one language across front/back; TS strict catches the class of bugs that plague workflow logic. |
| HTTP framework | **Express 5** | Backend scaffold already uses Express; mature, minimal, easy to reason about a modular monolith. |
| Validation | **Zod** (schemas shared from a types package) | Type-safe runtime validation at the boundary; used by services and controllers for input validation. |
| ORM | **Prisma** | Type-safe schema, migrations, relational integrity, first-class PostGIS-ready Postgres. |
| Primary database | **PostgreSQL 16** | Relational integrity for a state machine and audit trail; transactions; strong geospatial story (see GIS). |
| Geospatial | **PostGIS** extension on Postgres | District/block boundaries, point locations, spatial queries, clustering — first-class GIS without a second store. |
| Cache / queues | **Redis 7** | Caching, job queue (BullMQ), and pub/sub for notification fan-out. |
| Identity / AuthN | **Firebase Auth** (verify ID tokens server-side) | Frontend already uses Firebase Auth; server verifies via `firebase-admin` — keeps one identity source and defers password/2FA work to a hardened provider. |
| AuthZ (authorization) | **Own `users` + `roles` + `permissions` tables in Postgres**, resolved per request | Authorization is project-specific (org, geo, resource ownership, workflow state). Firebase is identity only; **it never decides what a user may do.** |
| File / evidence storage | **Storage provider interface** → Google Cloud Storage (default) + **MinIO** for local dev | Evidence is a first-class, separate concern; provider isolation per `System_architecture.md` §16 & §22. |
| Logging | **pino** (structured JSON) | Single structured log stream for observability; no ad-hoc `console`. |
| Observability | **OpenTelemetry + Prometheus + Grafana** | Metrics, traces, and per-module error/duration monitoring. |
| Job queue | **BullMQ** on Redis | Async AI, embedding generation, bulk notifications, report generation, digest emails. |
| Tests | **Vitest + Supertest + Testcontainers** | Unit (services), integration (API against real Postgres/Redis in testcontainers), workflow-state tests. |
| Runtime | **Docker** (one API service; Postgres + Redis infra) | Reproducible stage-1 deployment without premature microservices. |

### 3.1 Why Postgres/Prisma over the earlier Mongo lean

`System_architecture.md` §5.4 mentioned MongoDB as a technical-spec proposal, but explicitly left the choice open. We choose **Postgres** because the workflow engine is fundamentally a **relational state machine** with strong integrity requirements:

* **Transitions and invariants** are easier to enforce with foreign keys, unique constraints and transactions (one challenge ↔ many projects ↔ one impact, etc.).
* **Audit history** is append-only integrity-heavy data — a natural relational fit.
* **GIS** requires real spatial queries on district/block boundaries — PostGIS is far more mature than Mongo's geo for this and keeps GIS in the primary base.
* **Multi-project / multi-collaborator** joins are awkward in a document store.

This is a deliberate divergence from the earlier proposal, made explicit here so it is not silently "inherited" as the docs require.

---

## 4. High-Level Topology

A **modular monolith**: one deployable API process containing all business modules, each with clear boundaries.

```text
                     ┌────────────────────────────────────────────┐
                     │              API SERVICE (Node)            │
                     │                                            │
                     │  HTTP layer (Express)  →  routes  →  ctx   │
                     │                                            │
                     │  AUTH MIDDLEWARE                           │
                     │   (verify token → resolve user/role/scope) │
                     │                                            │
                     │  MODULES (each: routes→controller→service→ │
                     │           ├─ Challenge                     │
                     │           ├─ AI                            │
                     │           ├─ Validation                    │
                     │           ├─ Similarity/Cluster            │
                     │           ├─ Priority                      │
                     │           ├─ Matching                      │
                     │           ├─ University                    │
                     │           ├─ Team                          │
                     │           ├─ Project                       │
                     │           ├─ Collaboration                 │
                     │           ├─ Impact                        │
                     │           ├─ Notification                  │
                     │           └─ Audit                         │
                     │                                            │
                     │  WORKFLOW ENGINE (authoritative state      │
                     │   machine + transition registry)            │
                     │  EVENT BUS (in-process pub/sub → queue)    │
                     └──────────────┬─────────────────────────────┘
                          │         │            │
                   ┌──────┴──┐ ┌────┴─────┐ ┌────┴─────┐
                   │ Postgres│ │  Redis   │ │  GCS/    │
                   │ +PostGIS│ │(queue/cache/pub-sub)│ MinIO │
                   └─────────┘ └──────────┘ └──────────┘
                          │                │
                     ┌────┴─────┐   ┌──────┴────────┐
                     │ Workers  │   │ External: AI, │
                     │ (BullMQ) │   │ SMS, Email,   │
                     └──────────┘   │ Maps          │
                                    └───────────────┘
```

Stage-1 ships **one API process + one optional worker process**. Redis and Postgres are managed or self-hosted. No feature requires a second API instance at hackathon scale; the monolith keeps futures open (see §22).

---

## 5. Module Map

Each business module owns its routes, controller, service(s) and repository. **Dependencies point inward**: higher modules may use lower ones; nothing reaches up or across arbitrarily.

```text
LAYER ORDER (dependency direction: ↓ ::: upper may depend on lower)

  API layer
    └── Auth middleware / context
        │
  BUSINESS MODULES  (the 13 domains)
    ├── Challenge        (owns the core record + lifecycle root)
    ├── Validation       (review queue, decisions)
    ├── Similarity       (clustering, dedup)
    ├── Priority         (scoring + human override)
    ├── Matching         (HEI ranking + acceptance workflow)
    ├── University       (institution profiles, departments)
    ├── Team             (formation, membership, roles)
    ├── Project          (proposals, milestones, prototype/pilot/deploy)
    ├── Collaboration    (needs, offers, funding)
    ├── Impact           (metrics, evidence, verification)
    ├── Notification     (events → in-app/email/sms)
    ├── Audit            (append-only event log)
    │
  CROSS-CUTTING / INFRA
    ├── Workflow engine  (transition registry, state machine)  [used by many modules]
    ├── AI service boundary (provider-agnostic)  [used by AI/priority/matching/etc.]
    ├── Storage service   (file provider interface)
    ├── Event bus         (in-process pub/sub → BullMQ)
    ├── Config, logger, errors, db (Prisma), redis
    └── Seed scripts (demo data through real APIs)
```

### 5.1 Module responsibilities (traced to requirements)

| Module | Key responsibilities | Key requirements |
| --- | --- | --- |
| Challenge | CRUD, submission, evidence association, location, status, search/filter, history | REQ-CH / REQ-CM |
| AI | understanding, classification, entity extraction, summarization, similarity, priority, matching, impact estimation — all as **recommendations** | REQ-AI, REQ-DEDUP, REQ-MATCH, REQ-PRI |
| Validation | review queue, verify/reject/clarify, reviewer notes, history | REQ-VAL |
| Similarity | embedding lookup, candidate duplicates, cluster membership, cluster review | REQ-DEDUP |
| Priority | factor-weighted scoring, explanation, human adjustment, history | REQ-PRI |
| Matching | capability representation, candidate selection, ranked + explainable matches, acceptance workflow | REQ-MATCH |
| University | institutional profile, departments, facilities, innovation centres, participation | REQ-UNI |
| Team | team creation, members, roles, skills, faculty mentors, lifecycle | REQ-TEAM |
| Project | projects, proposals, milestones, deliverables, progress, prototype/pilot/deployment/closure | REQ-LIFE, REQ-MILE, REQ-PROP |
| Collaboration | project needs, partner discovery, offers, acceptance, mentorship/funding/testing | REQ-IND |
| Impact | KPI definitions, before/after, beneficiaries, evidence, verification, reporting | REQ-IMPACT |
| Notification | events → recipients → channels → in-app/email/sms | REQ-COMM |
| Audit | append-only event record, AI→human decision trace | REQ-SEC / REQ-RAI |

---

## 6. The Authoritative Workflow Engine (centerpiece)

### 6.1 Model

The lifecycle is a **server-side state machine**. A challenge has a `status` (stage). It moves only through **defined transitions** in a **transition registry**. The engine, not any controller, applies a status change.

```text
Challenge (current state)
    ↓
POST /api/challenges/:id/transition   (body: { action, payload })
    ↓
Engine.authorize(actor, challenge, action)        ← RBAC + org/geo/resource scope
    ↓
Engine.guard(action, fromState, challengeData)    ← sequencing + invariants
    ↓
Engine.execute(action, payload)  →  domain service     ← business work (create project, etc.)
    ↓
Engine.transition(fromState → toState, snapshot)     ← persist with a version/rowversion
    ↓
Engine.audit(event)                                  ← append-only log (incl. AI input + human reason)
Engine.emit(event)                                   ← on the event bus → notifications
    ↓
HTTP 200 { challenge, status, nextTransitions, events }
```

**Why actions and not raw status strings:** an action expresses *intent* (`challenge:validate`), letting the engine enforce *rules* (only a `validator` with geo scope, only from `UNDER_REVIEW` or `SUBMITTED`, only if AI analysis present, never from `REJECTED`). A client can never send `status`. This is the fix for Anti-pattern 1.

### 6.2 States (statuses)

From `Complete_workflow.md` §21 taxonomy, kept as an enum, plus the branching/terminal states and the refinements that make the state machine executable. The 16 lifecycle stages map 1:1 onto the forward-path states; the additional states (CLARIFICATION_REQUESTED, VALIDATION_PENDING, DEPLOYMENT_APPROVED, FAILED/STALLED, PROPOSAL_REVIEW, TEAM_FORMING) are **sub-states** that capture controlled branching and internal gates the docs describe in `Complete_workflow.md` §22.

```text
SUBMITTED
CLARIFICATION_REQUESTED        (branch of UNDER_REVIEW)
UNDER_REVIEW
REJECTED                       (terminal, with reason)
VALIDATED
CLUSTERED
PRIORITIZED
MATCHING                       (institution selection)
UNIVERSITY_ACCEPTED
TEAM_FORMING                   (team created; proposal not yet submitted)
PROPOSAL_REVIEW                (proposal submitted; awaiting approval)
PROJECT_ACTIVE                 (proposal approved; project executing)
PROTOTYPE
PILOT
VALIDATION_PENDING             (post-pilot validation outcome pending)
DEPLOYMENT_APPROVED
DEPLOYED
IMPACT_VERIFIED
CLOSED                          (terminal, closure package)
FAILED / STALLED                (risk/escalation state — recoverable)
```

The **16 stages** map onto these statuses 1:1 for the forward path. Branching (clarification, rejection, decline→rematch, pilot-needs-improvement) is captured by alternate edges.

### 6.3 Transition registry (core examples)

The registry is data — a declared table the engine walks. This is the backbone; it must be kept exhaustive. Each row is a **defined edge**; any transition not in this table is rejected by the engine.

| From | Action | Actor (role + scope) | Guard | To |
| --- | --- | --- | --- | --- |
| SUBMITTED | `challenge:understand` | system (AI) | challenge data complete (title, description, location present) | UNDER_REVIEW |
| UNDER_REVIEW | `challenge:validate` | Government Validator (geo scope) | AI analysis present; not already validated | VALIDATED |
| UNDER_REVIEW | `challenge:requestClarification` | Government Reviewer | reason required | CLARIFICATION_REQUESTED |
| CLARIFICATION_REQUESTED | `challenge:resubmit` | submitter (owner) | new evidence present | UNDER_REVIEW |
| UNDER_REVIEW / SUBMITTED | `challenge:reject` | Government Validator | reason required | REJECTED |
| VALIDATED | `challenge:cluster` | system / reviewer | similarity run | CLUSTERED |
| CLUSTERED | `challenge:prioritize` | Government Coordinator | priority computed, human-confirmed | PRIORITIZED |
| PRIORITIZED | `challenge:match` | system | HEI candidates generated | MATCHING |
| MATCHING | `matching:accept` | University Admin (that institution) | on offer list | UNIVERSITY_ACCEPTED |
| MATCHING | `matching:decline` → auto-rematch | University Admin | reason; rematch to alternates | MATCHING |
| UNIVERSITY_ACCEPTED | `team:create` | Faculty (that institution) | team members seeded (min 1 student + 1 faculty mentor) | TEAM_FORMING |
| TEAM_FORMING | `proposal:submit` | Faculty/Students (project members) | proposal document attached | PROPOSAL_REVIEW |
| PROPOSAL_REVIEW | `proposal:approve` | University Authority / Faculty (that institution) | proposal reviewed & approved | PROJECT_ACTIVE |
| PROPOSAL_REVIEW | `proposal:requestRevision` | University Authority / Faculty | revision notes provided | TEAM_FORMING |
| PROJECT_ACTIVE | `project:prototype` | Faculty/Student (project members) | proposal approved | PROTOTYPE |
| PROTOTYPE | `project:pilot` | Faculty (project) | prototype deliverable attached | PILOT |
| PILOT | `project:validate` [success] | Government + Experts + Community | pilot metrics + evidence; validation = SUCCESS | VALIDATION_PENDING |
| PILOT | `project:validate` [needs-improvement] | Government + Experts + Community | pilot metrics + evidence; validation = NEEDS_IMPROVEMENT | PROTOTYPE |
| VALIDATION_PENDING | `validation:confirm` | Government Decision-Maker | validation report approved | DEPLOYMENT_APPROVED |
| DEPLOYMENT_APPROVED | `deployment:approve` | Government Decision-Maker | deployment plan + responsible org | DEPLOYED |
| DEPLOYED | `impact:verify` | Government / Project | impact metrics + evidence | IMPACT_VERIFIED |
| IMPACT_VERIFIED | `challenge:close` | Government Coordinator | closure package complete | CLOSED |
| PROJECT_ACTIVE / PROTOTYPE / PILOT | `workflow:escalate` | Government Coordinator | overdue milestone / stalled flag / risk threshold | FAILED / STALLED |
| FAILED / STALLED | `workflow:resolve` | Government Coordinator | resolution reason; corrective action documented | PROJECT_ACTIVE |

Every authorization decision also checks **scope**, not just role: a Government Validator may act only on challenges in their district; a University Admin only on that university's matches; a Faculty member only on projects they mentor; a Student only on teams they belong to (see §8).

### 6.4 Guards & invariants

The engine enforces the **10 invariants** from `Complete_workflow.md` §33 as guard code:

| Invariant | Enforcement |
| --- | --- |
| 1. Submission traceable to submitter + evidence | foreign keys on `challenge` → `user`/`evidence`; evidence rows never deleted |
| 2. AI must not silently overwrite human decision | AI recommendation stored separately (see §9); a human override is a distinct audited event |
| 3. No jumping stages | transitions only via registry edges |
| 4. Only authorized actors cause consequential transitions | `authorize()` per action |
| 5. Declined match doesn't terminate a valid challenge | `matching:decline` routes back to MATCHING with alternates, guarded to not auto-terminal |
| 6. Clustering never destroys source submissions | clusters reference child challenge IDs; submissions immutable |
| 7. Project progress connected to originating challenge | `project.challengeId` FK + project lifecycle child of challenge lifecycle |
| 8. Impact connected to its project | `impact.projectId` FK; cannot exist standalone |
| 9. Public visibility never leaks private data | separate read models/APIs (see §10) |
| 10. Temporary technical failure doesn't corrupt lifecycle | AI/notification/map failures are isolated & retryable (see §15, §19) |

Transitions that violate any guard return `409 Conflict` with a structured problem object, never a silent partial change.

### 6.5 Concurrency & integrity

* Each challenge carries a **`version` (optimistic concurrency)**. A transition is a transaction: `BEGIN; SELECT ... FOR UPDATE; guard; execute; UPDATE ... SET status=?, version=version+1 WHERE version=?; INSERT audit; COMMIT`. A stale write is rejected.
* All transition effects (status + side-effects like project creation) are committed **in one DB transaction** where possible; async side-effects (notifications, AI jobs) are enqueued only **after** commit via the event bus.
* Domain services are pure-ish and unit-testable; the engine coordinates.

### 6.6 Event bus reliability (transactional outbox)

The in-process event bus (§4) is fast but has a failure window: if the process crashes *after* the DB transaction commits but *before* the event is enqueued into Redis/BullMQ, the notification and downstream work is silently lost.

For production the engine uses the **transactional outbox pattern**: within the same DB transaction that commits the state change, the engine also writes the domain event row into an `outbox_events` table. A separate poller (running in the API process or in the worker) drains the outbox and publishes to Redis. This makes the handoff **durable**: the event is either committed or not; there is no half-committed state.

```text
DB transaction:
  UPDATE challenges SET status=..., version=...
  INSERT audit_events (...)
  INSERT outbox_events (type, payload, createdAt)     ← in the same transaction
  COMMIT

Poller (runs every ~100ms):
  SELECT * FROM outbox_events WHERE published=false ORDER BY id LIMIT 50
  → publish each to Redis queue
  → UPDATE SET published=true
  → delete published rows older than 24h
```

This satisfies Invariant 10 (technical failures do not corrupt lifecycle) and the failure isolation requirement from `Complete_workflow.md` §29: a transient Redis outage does not lose the business event.

### 6.6 Workflow public vs internal

Two projections of the same state:
* **Public status label** (`getPublicStatusLabel` already on frontend) — citizen-facing wording.
* **Internal stage + guards** — full registry, AI confidence, notes; never in public payloads.

---

## 7. Layered Architecture (per module)

Each module follows one consistent layering so any developer/agent can navigate the whole monolith:

```text
src/modules/<domain>/
  routes.ts          # Express Router; declares paths + auth roles (decorative)
  controller.ts      # parse/validate request (Zod), call service, map → HTTP
  service.ts         # business rules, orchestration, uses workflow engine
  repository.ts      # Prisma queries; the ONLY place SQL/queries live
  types.ts           # module DTOs / schemas
  (ai.ts)            # only when the module talks to the AI boundary
```

Rules:
* **Controller** is thin: validate input, call exactly one service operation, translate result/errors. No SQL, no AI calls, no business logic.
* **Service** contains business rules and owns transactions. It may call other services (by interface) and the workflow engine.
* **Repository** owns all Prisma/data access; services never write raw queries.
* **Routes** express required capability/permission as metadata; the **authorization middleware** is the single enforcement point (§8), so routes never enforce inline `if (role === ...)`.

---

## 8. Authentication & Authorization

### 8.1 Authentication (Who are you?)

* Client holds a **Firebase ID token** (from Firebase Auth, as already used on the frontend).
* Request → `AuthMiddleware`:
  1. Extract `Bearer` token.
  2. Verify with `firebase-admin` (cached public keys, clock-skew handled).
  3. Look up/upsert the user in Postgres `users` by `firebaseUid`.
  4. Load their **identity bundle**: `{ user, roles[], org {id,type,geoScope[]}, permissions[] }`.
  5. Attach to request context.
* Identity is cached in Redis (short TTL) so repeated requests don't hit Firebase/DB each time.

### 8.2 Authorization (What may you do, and on what?)

Authorization is **not** `if (role==='gov')`. It resolves through the full scope chain from `Actors_and_roles.md` §19:

```text
User
  + Role                          (citizen, community/ngo, pri, ulb, gov, university, faculty, student, industry, csr, lab, super_admin)
  + Organization                  (university X, dept Y / govt dept Z / company W)
  + Geographic scope              (district(s), block(s), state)
  + Resource ownership            (owns / member of / manages this challenge, team, project)
  + Workflow state                (may act only when the workflow allows)
  → Decision: allow / deny
```

Implementation:
* **Permission registry**: a table mapping `(role, capability)` → allowed. E.g. `('gov_validator','challenge:validate')`.
* **Resource scope resolver**: a service that, given a resource id, computes the caller's relationship to it (owner? member? assigned? partner? unrelated).
* **Authorization middleware** per route declares the capability + scoping function. A single `authorize(capability, resolver)` composes role check + org check + geo check + resource check + workflow-state check before the controller runs.
* **Super Admin** is scoped to *platform* administration (users, roles, taxonomy, workflow config, moderation) and must NOT receive government decision powers — matching `Actors_and_roles.md` §29.

### 8.3 RBAC matrix

The concrete matrix lives in the future `RBAC_MATRIX.md` (derived from `Actors_and_roles.md` §28). The backend treats that matrix as data (`role_permissions`), not hard-code. A future grant change is a DB row + migration, not a code deploy.

---

## 9. AI Service Boundary

Per `System_architecture.md` §10 & §22, AI is a **service capability**, provider-isolated, and never mutates critical state directly.

### 9.1 Provider-agnostic interface

```text
AIProvider (interface)
  understand(input) → { summary, domain, subDomain, tags, entities, severity, urgency, confidence, reasons }
  embed(text)       → EmbeddingVector
  similarity(a, b)  → number + reasons
  prioritize(c)     → { score, factors[], reasons, confidence }
  match(c, heis)    → RankedUniversity[] (each: { heiId, score, reasons[] })
```

* The interface lives in the **AI boundary module**; concrete providers (a real LLM wrapper, an embedding service, or the existing frontend heuristics re-implemented server-side) implement it.
* All concrete calls go through a **provider registry** so a model/provider swap is a config change. This kills the provider-lock-in anti-pattern.
* Default MVP providers may wrap the **existing `heiMatchingEngine` / `aiTriageEngine` / `aiVisionClassifier` logic server-side**, running over the real data, so the demo is honest: AI is a recommendation on the server, not a frontend constant.

### 9.2 Recommendation → decision contract

Consequential decisions (validation, final prioritization, institution allocation) follow:

```text
AI computes recommendation
   ↓ confidence + reasons
Human reviews (authorized actor)
   ↓ accept / modify / reject
Service records the decision
   ↓ transition via workflow engine
Audit stores { aiRecommendation, aiConfidence, aiReasons, humanDecision, humanReason, actor, timestamp, modelVersion }
```

AI output is stored in a **separate `ai_recommendations` table**, never merged into the human decision fields. A human override is a *new* audited event, satisfying Invariant 2.

### 9.3 Failure isolation

* If the AI provider is unavailable, the challenge **remains stored**; `aiStatus = PENDING/FAILED/RETRYABLE`; a worker retries with backoff; a human can proceed without AI where the workflow permits. (Invariant 10; `Complete_workflow.md` §29.)

---

## 10. Data Layer

### 10.1 Database & ORM

* **PostgreSQL 16 + PostGIS** driven by **Prisma** (schema-first, migrations).
* All migrations versioned and run in CI/CD and in dev.
* Seeds are split: `seed:prod` (no fake data) vs `seed:demo` (canonical flood/school scenario + district shapes) — both through the same services/APIs per `System_architecture.md` §33.

### 10.2 Core entity map (full schema in `DATABASE_DESIGN.md`)

```text
users
  firebaseUid, role(s), orgId, name, contact(protected), geoScope
organizations          # university / dept / govt dept / company / csr / lab
universities           # profile, departments[], facilities, innovation centres, capacity
challenges             # title, description, location(PostGIS), category, status,
                       #   version, submitterId, block/district, priority, clusterId
challenge_evidence     # challengeId, type, storageRef, meta, isPrivate
ai_recommendations     # challengeId, kind, result, confidence, reasons, modelVersion
validations            # challengeId, reviewerId, decision, reason, clarifications[]
clusters               # label; cluster_members(challengeId)
projects               # challengeId, universityId, status, teamLead...
teams / team_members   # project/team membership, skills, role, faculty mentor
proposals              # projectId, docRef, status, review
milestones             # projectId, title, deliverable, due, status, progress
collaborations / offers# project need ↔ partner offer ↔ acceptance
pilots, deployments    # project records (location, metrics, evidence)
impact_records         # projectId, metric, beforeValue, afterValue, beneficiaries, evidence
app_notifications      # recipientId, type, channel, payload, readAt
audit_events           # append-only (see §14)
role_permissions       # RBAC matrix as data
```

Key integrity rules (mirror the invariants):
* `challenge.submitterId` FK → never null; evidence never hard-deleted (soft-delete/flag).
* `cluster_members` reference `challenges`; deleting a cluster never deletes challenges.
* `project.challengeId` NOT NULL; `impact_records.projectId` NOT NULL.
* Status transitions constrained by the engine (not by DB enum alone), but a `status` enum + partial unique indexes guard obvious corruption.

### 10.3 Public vs private (Invariant 9)

Two read paths:
* **Public API / projections** expose only public fields (title, public status label, published project info, verified impact) — by leaving internal columns out, not by filtering after the fact.
* **Authenticated internal API** exposes participant/org/private data only to the scoped actor.
* Query builders are separate for the two paths so a leak is impossible by construction.

---

## 11. GIS

* PostGIS stores challenge points and district/block boundary shapes.
* The existing frontend `JharkhandMapExplorer` already visualizes districts with centroids/scoring; the backend now **feeds real spatial data**:
  * `GET /api/districts` (with geometry/bounds), `GET /api/challenges?district=&bbox=` (spatial filters), region analytics (counts/severity by district).
* Geocoding: when a citizen drops a pin or provides GPS, the app stores lat/lng; geocoding (address ↔ coord) is provider-isolated (initially an open/lightweight choice; see `GIS_ARCHITECTURE.md` to follow).
* Heatmaps/point-clustering computed server-side from stored points + boundaries.

---

## 12. File & Evidence

* `StorageService` interface: `put(stream, meta)`, `get(ref)`, `signedUrl(ref, ttl)`, `delete(ref)`.
* Default impl = **GCS**; local dev = **MinIO** (same interface) — keeps provider isolation.
* Upload flow: client requests a **pre-signed upload URL** from the API (the API validates type/size + authorization and stores metadata), then the client PUTs directly to storage, then calls `challenge:addEvidence` with the ref. Evidence validity/ownership is enforced server-side.
* Stored metadata lives in `challenge_evidence`; media bytes never touch the API process.
* **Access control per data class**: evidence may be `public` (proof photos) or `private` (sensitive). Signed URLs are issued only to authorized actors and carry short TTLs, so private evidence is never link-shared accidentally.

---

## 13. Notification Layer (event-driven)

* Business modules **emit domain events** on the in-process **event bus** (e.g. `challenge.validated`, `university.accepted`, `milestone.overdue`).
* A **notification coordinator** subscribes: determines recipients (from resource relationships + preferences), builds channels (in-app mandatory; email/SMS optional), and enqueues delivery jobs.
* **In-app** is required and durable: rows in `app_notifications`, served via authenticated API and delivered live through Firebase/Socket when available.
* **Email/SMS** are provider-isolated (e.g. SendGrid/Twilio behind an interface); providers queue via BullMQ so a provider outage never loses the business event (`Complete_workflow.md` §29; Invariant 10).
* Every notification references its originating `audit_event` for traceability.

Event list (subset — from `Complete_workflow.md` §26): submitted, ai_completed, clarification_requested, validated, priority_changed, university_matched, university_accepted, university_declined, team_formed, proposal_submitted, collaboration_requested/accepted, milestone_approaching/overdue, pilot_started/completed, validation_completed, deployment_approved, impact_verified, closed.

---

## 14. Audit Layer

* An **append-only** `audit_events` table (no update/delete; inserted within the transition transaction).
* Every consequential event records: actor, org, resource (challenge/project), action, from→to state (or before/after), payload snapshot, **AI contribution** (recommendation id), human reason, timestamp, request trace id.
* The **AI→human decision trace** required by `Actors_and_roles.md` §23 is a first-class query (join `audit_events` to `ai_recommendations`).
* Audits are immutable to application code; retention/export are separate admin operations.
* **Retention policy:** Government accountability requires long-term retention. Default: audit rows are retained for a minimum of **7 years** (configurable via `AUDIT_RETENTION_YEARS` env var). Rows older than retention are archived to cold storage (GCS) before deletion; a monthly cron job handles the archive-then-truncate cycle. At hackathon scale, no archival is needed — the volume is negligible.
* **Scale:** `audit_events` grows with every transition and every AI recommendation. At moderate throughput (~100 challenges/day), this table reaches ~1M rows/year — well within Postgres capacity without partitioning. If scale exceeds this, **monthly range partitioning** on `createdAt` is the planned optimization (already a Postgres-native feature). The Prisma schema should include a composite index on `(resourceType, resourceId, createdAt)` for the core query pattern (reconstructing one challenge's history).

---

## 15. Asynchronous Processing

* **BullMQ** on Redis for: AI analysis/embedding jobs, similarity index updates, bulk/notification delivery, analytics/report generation, overdue-milestone scans.
* Pattern: user request → enqueue job → return 202 → worker processes → persists result → emits event (which triggers notification). This matches `System_architecture.md` §27.
* Worker(s) consume from the same monolith's service layer (shared code), so business rules are identical whether the call is sync or async.
* **Retries + exponential backoff + dead-letter queue**; a failed AI job never corrupts the challenge row (Invariant 10).

---

## 16. Error Handling & Validation

* **Zod** at the boundary for all inputs; validation errors → `422` with field-level detail (never 500).
* **Domain error hierarchy**: `NotAuthorized(403)`, `ForbiddenScope(403)`, `NotFound(404)`, `Conflict(409, with guard detail)`, `ValidationError(422)`, `UnprocessableWorkflow(409)`, `ExternalFailure(502/503)`. All map to a consistent problem-object body.
* Uncaught errors go to a global handler → structured JSON + log (with trace id); never leaks stack internals to clients.
* Idempotency: transition endpoints accept an `Idempotency-Key` so retries don't double-apply.

---

## 17. Security

* Transport: HTTPS only (TLS termination at load balancer).
* AuthN: Firebase Auth server-side token verification (never trusting client claims).
* AuthZ: server-only resolution (never trusting role from the client).
* Input validation everywhere (Zod), SQL via Prisma (parameterized), no raw string interpolation into queries.
* Rate limiting on auth/challenge/evidence endpoints (e.g. express-rate-limit + Redis).
* CORS restricted to the known client origin.
* Secrets via env/secret manager (never in repo; `.env.example` only).
* Evidence files validated (type/size), stored privately, served via short-TTL signed URLs.
* Audit for sensitive operations; moderation hooks per REQ-MOD.
* Full details in the future **`SECURITY_ARCHITECTURE.md`** (threat model, RBAC matrix, data-class access table).

---

## 18. Observability

* **Structured logs** (pino) with a per-request `traceId`/`context` (actor, org, resource, action).
* **OpenTelemetry** spans: HTTP → middleware → service → DB/AI/external. AI calls get their own spans (we can see provider timeouts).
* **Metrics** (Prometheus): request rate/latency/errors per route; business metrics: challenges submitted, validated, matching failures, stalled projects, overdue milestones, AI failures, notification failures.
* **Dashboards** (Grafana): technical + business panels kept separate, per `System_architecture.md` §35.

---

## 19. Failure Isolation (map to invariant 10)

| Failure | Behavior |
| --- | --- |
| AI provider down | challenge remains stored; `aiStatus` pending/retryable; human may proceed where allowed |
| Notification provider down | business transition commits; delivery job retries |
| Map service down | challenge data unaffected; GIS endpoints degrade to data-only |
| Redis down | cache miss only; queue jobs held; committed transitions unaffected (do not put in-memory queue as sole transport for durable events) |
| DB down | API returns 503 with retry; no partial transitions |

---

## 20. Testing Strategy

| Layer | Tool | Covers |
| --- | --- | --- |
| Unit (services/engine) | Vitest | transition guards, invariants, scoring, permission resolution, pure logic |
| Integration (API) | Supertest + Testcontainers (real Postgres+PostGIS+Redis) | full endpoint → DB flow, auth/scope enforcement, concurrency (rowversion) |
| Workflow-state tests | parametrized | every registry edge: authorized actor, correct next state, audit + notification emitted; unauthorized → 403; wrong ordering → 409 |
| AI boundary | contract tests against a fake provider | recommendation contract stable; provider swap is safe |
| Migration tests | CI | migrations clean apply/rollback on a fresh Postgres |

**Golden rule:** the workflow engine is the most-tested unit in the codebase — its edge table is a spec we execute as tests.

---

## 21. Deployment Shape (Stage-1)

```text
Internet
   ↓ (HTTPS)
Load balancer (TLS)
   ├── API service (Docker, horizontal-ready, ≥1 replica)
   └── Worker (BullMQ consumer, separate container)   [can colocate at hackathon scale]
Postgres+PostGIS  (managed or container)
Redis             (managed or container)
GCS / MinIO       (evidence)
Firebase Auth     (identity)

CI/CD: lint → tsc → unit → integration (testcontainers) → migrations → deploy (Docker image).
Secrets: injected from env/secret manager.
```

This satisfies `System_architecture.md` §42. Scaling to Stage-2/3 (API cluster, more workers, CDN) is additive — the monolith boundaries and queues are ready.

---

## 22. Future Extraction Boundaries

The modular monolith keeps clean seams so a domain (e.g. AI, or Notifications) can later be extracted to its own service **without rewrites**:
* Modules talk to each other only through typed service interfaces, not DB tables.
* The AI boundary and Notification/event bus are already transport-shaped.
* Repositories are isolated per module.

---

## 23. Frontend → Backend Data Flow (migration from workflowStore)

The current frontend uses `workflowStore` (localStorage + `STORE_EVENT` CustomEvent) to drive live reactivity across all five portals. Once the backend is implemented, the frontend migration follows a clear two-phase path:

### Phase 1: backend feeds the frontend (dual-write, migration-safe)

* The frontend stops writing to `workflowStore` directly for any write operation (validate, match, create project, etc.) — all writes go through the backend API.
* The frontend continues to **read** from `workflowStore` via `STORE_EVENT` for live UI reactivity (this is the cheap, already-working live pattern).
* A **sync bridge** is added to the frontend: after every successful API write, the response (updated challenge/project status) is written into `workflowStore`, which triggers the existing `STORE_EVENT` listeners and keeps the UI live.
* `workflowStore.getChallenges()` and `workflowStore.getProjects()` remain the frontend's read path during this phase.

### Phase 2: backend is the sole source (full migration)

* `workflowStore` becomes a **thin client-side cache** of backend API responses, not a write target.
* A **polling or WebSocket/SSE subscription** to backend endpoints (e.g. `GET /api/challenges`, `GET /api/projects`) replaces manual localStorage writes.
* The existing `STORE_EVENT` CustomEvent mechanism is preserved for internal reactivity, but it is now **always triggered by incoming backend data**, never by a direct local mutation.
* The `workflowSeedData.ts` seed is replaced by backend seed scripts (`seed:demo`) that write through the same API endpoints as production, so all demo data passes through the authoritative workflow engine.

**What this means for the current codebase:**
* All portal components that read from `workflowStore.getChallenges()` or `workflowStore.getProjects()` need no changes in Phase 1 — the read path is identical.
* All portal components that call `workflowStore.addChallenge()` / `.updateChallengeStatus()` etc. get routed through API calls that write back to the store via the sync bridge.
* The `STORE_EVENT` + `useEffect` pattern already used in `CitizenHomeTab`, `LandingPage`, `CitizenCommunityFeedTab` continues to work unchanged — it is the right reactivity pattern; the only change is what writes to the store.

---

## 24. Convention Summary for the API (contracts follow)

* Base path `/api`, all endpoints namespaced by module (`/api/challenges`, `/api/projects`, `/api/districts`, …).
* Transitions via `POST /api/challenges/:id/transition { action, payload }` (or dedicated action endpoints for clarity where a payload is rich).
* Consistent error body; consistent pagination; optimistic-concurrency via `version` on write.
* Full request/response contracts are the subject of the next document — **`API_CONTRACTS.md`**.

---

## 24. Mapping: Workflow → Backend

| Core chain (`Complete_workflow.md` §34) | Backend home |
| --- | --- |
| Challenge → AI Understanding | Challenge module + AI boundary |
| Validation → Similarity → Priority | Validation + Similarity + Priority modules (via engine) |
| Matching → Acceptance | Matching + University modules |
| Project → Team → Proposal | Project + Team modules |
| Collaboration → Prototype → Pilot | Collaboration + Project modules |
| Validation → Deployment → Impact | Project (validate/deploy) + Impact modules |
| Closure | Project module (closure package) |
| Communication + Audit (throughout) | Notification + Audit modules (event bus) |

---

## 25. Conformance to the 13 Stable Principles

| Principle (System Arch §37) | Where enforced |
| --- | --- |
| 1 Challenge-centric | workflow engine rooted on `challenge` |
| 2 Lifecycle-driven | §6 state machine |
| 3 Human oversight of consequential AI | §9.2 recommendation→decision |
| 4 Explainable AI | confidence + reasons on every AI output |
| 5 Role + resource-aware authz | §8 |
| 6 Public/private separation | §10.3 |
| 7 Evidence preservation | §12, soft-delete + immutable evidence |
| 8 Modular domains | §5 |
| 9 GIS first-class | §11 |
| 10 Impact first-class | Impact module + FK integrity |
| 11 Providers isolated | §9.1, §12, §13 |
| 12 Prod/demo data separated | §10.1 seeds |
| 13 Backend authoritative for transitions | §6 (the whole point) |

---

## 26. Architecture Documentation Status

| Decision | Document | Status |
| --- | --- | --- |
| Exact Prisma schema, columns, indexes, spatial types, migration + seed strategy | `DATABASE_DESIGN.md` | ✅ Complete (34 models, 23 enums, validated against Prisma 5.22) |
| Exact endpoint list + request/response schemas | `API_CONTRACTS.md` | ✅ Complete (56 endpoints, 24 groups, transition catalogue) |
| Concrete AI provider, recommendation→decision contract, model versioning | `AI_ARCHITECTURE.md` | ✅ Complete (provider interface, deterministic MVP, BullMQ integration) |
| Threat model, PII encryption, rate limiting, evidence access control, audit-as-control | `SECURITY_ARCHITECTURE.md` | ✅ Complete (STRIDE-lite, AES-256-GCM PII, tiered rate limits) |
| Concrete RBAC permission rows, authorize() middleware, capability catalogue | `RBAC_MATRIX.md` | ✅ Complete (40+ capabilities, 12 roles, seed rows, resolver chain) |
| PostGIS schema, boundary data sources, geocoding, spatial queries, Leaflet contract | `GIS_ARCHITECTURE.md` | ✅ Complete (GiST indexes, 4 spatial query patterns, heatmap contract) |

---

## 27. Status

**Current status:** Backend architecture defined at production/shipping level, aligned to the stable principles in `System_architecture.md`.

**Stable now:**
* modular monolith + 13-domain module map
* authoritative workflow engine: 19-state machine, transition registry with 22 explicit edges + FAILED/STALLED recovery
* concurrency: optimistic locking + transactional outbox for event durability
* server-side authentication + multi-scope authorization (role + org + geo + resource + workflow state)
* AI as provider-isolated, human-supervised recommendation boundary
* Postgres + PostGIS data layer, Prisma migrations, prod/demo seed split
* frontend→backend migration path defined (workflowStore → sync bridge → backend-first)
* evidence storage via provider interface + signed URLs
* event-driven notifications + durable audit (7-year retention, partition-ready)
* async jobs with retry/dead-letter
* security, observability, testing, stage-1 deployment shape

**Companion docs (all complete):**
`DATABASE_DESIGN.md` → `API_CONTRACTS.md` → `AI_ARCHITECTURE.md` → `SECURITY_ARCHITECTURE.md` → `RBAC_MATRIX.md` → `GIS_ARCHITECTURE.md`.

The full architecture documentation series is now complete. All 7 documents (`BACKEND_ARCHITECTURE.md` through `GIS_ARCHITECTURE.md`) are cross-referenced, internally consistent, and ready to serve as the authoritative design specification for implementation.
