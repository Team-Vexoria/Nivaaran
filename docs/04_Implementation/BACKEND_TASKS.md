# NIVAARAN — Backend Implementation Task Backlog

> **Scope:** every backend task required to take the server from *scaffolding* to *shippable API*, grounded in `03_Architecture/BACKEND_ARCHITECTURE.md`, `API_CONTRACTS.md`, and `RBAC_MATRIX.md`.
> **Status legend:** ☐ not started · ◐ partial (code exists but incomplete) · ☑ done
> **Effort:** S ≈ ≤½ day · M ≈ 1–2 days · L ≈ 3–5 days · XL ≈ 1 week+
> Task IDs are stable (`BE-NNN`) — reference them in commits and PRs.

---

## Where the backend is today (baseline)

| Area | State | Evidence |
| --- | --- | --- |
| Prisma schema | ◐ Excellent, ~35 models / 22-value `ChallengeStatus` enum | `backend/prisma/schema.prisma` (851 lines) |
| Migrations | ☐ **None exist** | no `prisma/migrations/` dir |
| Express app | ◐ Health check only; all routes commented out | `src/index.ts` |
| Workflow engine | ◐ Skeleton with TODOs (no action→state resolution, no RBAC, no guards) | `src/core/workflowEngine.ts` |
| Auth | ◐ **Two competing impls** — `core/auth.ts` (correct, Postgres RBAC) vs `middleware/auth.ts` (demo token-claim role) | reconcile required |
| Modules | ☐ **None** (`src/modules/` does not exist) | — |
| Infra (config/logger/errors/redis) | ☐ None | — |
| Async workers (BullMQ) | ☐ None | — |
| Tests | ☐ None | — |

**Bottom line:** the data model and container setup are production-grade; the API surface and all business logic are unbuilt. ~56 endpoints across 24 groups are specified but unimplemented.

---

## Phase overview & dependency order

| Phase | Theme | Unblocks | Rough effort |
| --- | --- | --- | --- |
| **P0** | Foundation & fixes (migrations, infra, app skeleton, seeds) | everything | ~1 wk |
| **P1** | Identity, RBAC registry, `authorize()` | every protected route | ~1 wk |
| **P2** | Workflow engine (transition registry, guards, outbox) | all state changes | ~1.5 wk |
| **P3** | Front-of-funnel modules (Challenge, Evidence, AI, Validation, Cluster, Priority) | citizen→validation flow | ~2 wk |
| **P4** | Back-of-funnel modules (Matching→Team→Proposal→Pilot→Deploy→Impact) | full lifecycle | ~2–3 wk |
| **P5** | Cross-cutting services (Notification, Audit, GIS, Admin, Jobs) | dashboards & governance | ~1.5 wk |
| **P6** | Async workers (BullMQ) | AI/matching/notify side-effects | ~1 wk |
| **P7** | Security, observability, hardening | production readiness | ~1 wk |
| **P8** | Testing (unit/integration/testcontainers) | confidence & regression safety | ~1.5 wk |
| **P9** | Frontend integration migration (sync bridge → backend-first) | real end-to-end | ~1.5 wk |

Phases are ordered by hard dependency. Within P3–P6 individual modules can be parallelized once P0–P2 land.

---

## Phase 0 — Foundation & Fixes

*Goal: a booting server with real infra, a migrated PostGIS database, and seed data. Nothing below can be tested without this.*

### BE-001 · Generate initial Prisma migration + enable PostGIS — **M** ☐
- Create `prisma/migrations/` from the existing schema (`prisma migrate dev --name init`).
- The schema uses `Unsupported("geometry(Point,4326)")` and PostGIS types — the migration must run `CREATE EXTENSION IF NOT EXISTS postgis;` **before** table creation. Add it as a manual first migration or a `prisma/migrations/0000_postgis/migration.sql`.
- Verify spatial columns + GIST indexes materialize on `postgis/postgis:16-3.4`.
- **Accept:** `prisma migrate deploy` runs clean on a fresh DB; `\d challenge` shows the geometry column; health check passes.
- **Refs:** `BACKEND_ARCHITECTURE.md` §10, §11.

### BE-002 · Reconcile the duplicate auth implementations — **S** ☐
- `src/core/auth.ts` (Postgres RBAC lookup, correct) and `src/middleware/auth.ts` (demo `x-demo-role` / token-claim role, incorrect per architecture) conflict.
- Keep the Postgres-backed identity model; fold the *dev demo fallback* into it behind an explicit `NODE_ENV==='development'` flag as a seam, not as the default path.
- Delete or clearly deprecate the losing file so no route can import the wrong one.
- **Accept:** exactly one exported auth entrypoint; grep shows no route importing the demo variant in prod paths.
- **Refs:** `BACKEND_ARCHITECTURE.md` §8.1; `RBAC_MATRIX.md` §5.1.

### BE-003 · Typed, validated config loader — **S** ☐
- `src/core/config.ts`: load `.env`, validate with Zod (`DATABASE_URL`, `REDIS_URL`, `PORT`, `CLIENT_URL`, `FIREBASE_*`, storage creds, `NODE_ENV`). Fail fast with a readable error on missing/invalid vars.
- Export a frozen typed `config` object; ban direct `process.env` reads elsewhere.
- **Accept:** boot aborts with a clear message when a required var is absent.
- **Refs:** `BACKEND_ARCHITECTURE.md` §17 (secrets), §21.

### BE-004 · Structured logger (pino) + request-id — **S** ☐
- `src/core/logger.ts` (pino, pretty in dev, JSON in prod). Add a request-id middleware that stamps every log line and response header.
- **Accept:** each request logs a correlation id; errors log with stack + id.
- **Refs:** `BACKEND_ARCHITECTURE.md` §18.

### BE-005 · Error taxonomy + global error middleware — **M** ☐
- `src/core/errors.ts`: `AppError` base + `BadRequest(400)`, `Unauthorized(401)`, `Forbidden(403)`, `ForbiddenScope(403)`, `NotFound(404)`, `Conflict(409)` (optimistic-concurrency), `Unprocessable(422)`, `TooManyRequests(429)`.
- Global Express error handler maps thrown errors → the standard error envelope from `API_CONTRACTS.md`; Zod errors → 422 with field details; unknown → 500 (no internal leakage in prod).
- **Accept:** every error path returns the documented JSON shape; version-conflict surfaces as 409.
- **Refs:** `BACKEND_ARCHITECTURE.md` §16; `API_CONTRACTS.md` error format.

### BE-006 · Redis client + cache helper — **S** ☐
- `src/core/redis.ts`: singleton client (ioredis), health ping, get/set-with-TTL helper, namespaced keys. Used by the identity-bundle cache (BE-010) and rate limiter (BE-071).
- **Accept:** health check reports Redis connectivity; TTL keys expire.
- **Refs:** `BACKEND_ARCHITECTURE.md` §8.1, §15.

### BE-007 · Express app assembly + middleware chain — **M** ☐
- Compose `src/app.ts` (separate from `index.ts` for testability): `helmet`, `cors` (from config allow-list), `express.json` with size limit, request-id, logger, router mount points for all 24 groups (stubbed), 404 handler, error handler last.
- Move `listen()` + graceful shutdown (Redis + Prisma disconnect) to `index.ts`.
- **Accept:** app boots, `/api/health` green, unknown route → documented 404.
- **Refs:** `BACKEND_ARCHITECTURE.md` §7, §19.

### BE-008 · RBAC seed — roles, permissions, role→permission grants — **M** ☐
- `prisma/seeds/rbac.ts`: seed the 13 roles, the ~40 capabilities from `RBAC_MATRIX.md` §3, and the grant matrix (§4) into `Role`, `Permission`, `RolePermission`. Encode `C` (conditional) grants as grants whose resolver runs at request time — the seed stores the grant; the condition lives in code.
- Idempotent (upsert), safe to re-run.
- **Accept:** DB reflects the matrix exactly; a spot-check of denied cells shows no row.
- **Refs:** `RBAC_MATRIX.md` §3–§4.

### BE-009 · Reference + demo seeds — **M** ☐
- `seed:prod` — 24 Jharkhand districts + blocks (`District`, `Block`), app config defaults, taxonomy.
- `seed:demo` — a handful of users per role, sample challenges across lifecycle stages, one worked-through project, for demos/tests. Keep the two seeds separate so prod never gets demo data.
- **Accept:** `npm run seed:prod` and `seed:demo` both idempotent; demo login users map to real `User` + `UserRoleLink` rows.
- **Refs:** frontend already lists 24 districts; `BACKEND_ARCHITECTURE.md` §11.

### BE-010 · Docker/compose/env consistency pass — **S** ☐
- Reconcile `Dockerfile` (`CMD npm run dev`) vs `docker-compose.yml` command override; ensure `migrate deploy` runs before start; add `redis` service; wire healthchecks + `depends_on: condition: service_healthy`; provide `.env.example`.
- **Accept:** `docker compose up` brings postgres+redis+backend to healthy with migrations applied.
- **Refs:** current `backend/docker-compose.yml`, `Dockerfile` (git-modified).

---

## Phase 1 — Identity, RBAC & Authorization core

*Goal: `authorize(capability, resolver)` — the single enforcement primitive — works, backed by a cached identity bundle. Every protected route depends on this.*

### BE-020 · Auth middleware → identity bundle + Redis cache — **M** ☐
- Finalize `AuthMiddleware`: verify Firebase token → upsert/lookup `User` by `firebase_uid` → build `AuthContext { user, roles[], permissions:Set, org?, geoScopes[] }` (permissions = **union** across roles via `UserRoleLink`).
- Cache the bundle in Redis (short TTL) keyed by uid; invalidate on role/scope change.
- **Accept:** repeated requests hit cache (no Firebase/DB round-trip); bundle shape matches `RBAC_MATRIX.md` §5.1.
- **Refs:** `BACKEND_ARCHITECTURE.md` §8.1; `RBAC_MATRIX.md` §5.1. **Deps:** BE-002, BE-006.

### BE-021 · Capability registry (typed) — **S** ☐
- `src/security/capabilities.ts`: the ~40 capabilities as a typed union/const (`challenge:submit`, `challenge:validate`, `matching:accept`, `data:viewPrivate`, `app:config`, …). Single source of truth referenced by the seed (BE-008) and `authorize()`.
- **Accept:** compile-time exhaustiveness; capability strings can't drift from the seed.
- **Refs:** `RBAC_MATRIX.md` §3.

### BE-022 · `authorize(capability, resolver)` middleware — **M** ☐
- Implement the exact contract from `RBAC_MATRIX.md` §5: ① role check against `ctx.permissions` (hard-deny default, no `else-allow`); ② optional resource resolver; deny → `ForbiddenScope` with reason; conditional → attach `scopeContext` for the service.
- **Accept:** missing capability → 403 unconditionally; `SUPER_ADMIN` non-grants stay denied (§4.1, §5.3).
- **Refs:** `RBAC_MATRIX.md` §5, §5.3. **Deps:** BE-020, BE-021.

### BE-023 · Resolver chain primitives — **L** ☐
- `src/security/resolvers.ts`: composable checks — **organization** (`resource.orgId ∈ authorized orgs`), **geographic** (`resource.district/block ∈ ctx.geoScopes`), **resource ownership** (owner|member|assigned|partner|unrelated), **workflow-state** (`resource.status ∈ legal source set`). Compose into per-capability resolvers (the `C` cells).
- **Accept:** each example row in `RBAC_MATRIX.md` §5.2 has a matching resolver with a unit test.
- **Refs:** `RBAC_MATRIX.md` §5.2; `Actors_and_roles.md` §19. **Deps:** BE-022.

### BE-024 · Auth module endpoints — **S** ☐
- `POST /auth/sync` (upsert profile after Firebase signup, no auth), `GET /auth/me`, `PATCH /auth/me`.
- **Accept:** first-login sync creates `User`; `me` returns roles + scopes.
- **Refs:** `API_CONTRACTS.md` §Auth. **Deps:** BE-020.

---

## Phase 2 — Workflow Engine (the authoritative centerpiece)

*Goal: every lifecycle state change goes through one guarded, transactional, audited transition function. This is the heart of the system.*

### BE-030 · Transition registry (22 edges) — **L** ☐
- `src/workflow/registry.ts`: declarative map of the 23 actions → `{ fromStates[], toState, capability, payloadSchema, guards[] }`. Encode the full catalogue from `API_CONTRACTS.md` §22 and `Complete_workflow.md` state machine. Include `workflow:escalate`/`workflow:resolve` self-edges.
- **Accept:** registry is exhaustive over the `ChallengeStatus` enum; illegal (from,action) pairs are absent → rejected by default.
- **Refs:** `API_CONTRACTS.md` §22; `BACKEND_ARCHITECTURE.md` §6.3.

### BE-031 · Payload Zod schemas for all actions — **S** ☐
- `src/workflow/payloads.ts`: one Zod schema per action (e.g. `challenge:reject → { reason: string }`, `project:validate → { outcome: "SUCCESS"|"NEEDS_IMPROVEMENT", metrics?, evidenceUrls? }`, `matching:accept → { universityId }`).
- **Accept:** malformed payload → 422 before any DB work.
- **Refs:** `API_CONTRACTS.md` §22.

### BE-032 · Guard implementations (the 10 invariants) — **L** ☐
- `src/workflow/guards.ts`: pure predicate guards enforcing the workflow invariants (e.g. *validate requires AI analysis present*, *no deployment without successful pilot validation*, *gov-validator vs gov-department separation*, *acceptance before team*, *team before proposal*). Each guard returns allow / `{deny, reason}`.
- **Accept:** each invariant has a guard + a failing-case unit test.
- **Refs:** `BACKEND_ARCHITECTURE.md` §6 (invariants); `Complete_workflow.md`; `RBAC_MATRIX.md` §4.2.

### BE-033 · `transitionChallenge()` — atomic, concurrent-safe, audited — **L** ☐
- Replace the skeleton in `src/core/workflowEngine.ts`: resolve action→registry entry → authorize (capability + resolver) → validate payload → run guards → in one `$transaction`: update with `where:{id, version}` (optimistic concurrency; `version` mismatch → 409 `Conflict`), write `AuditEvent` (correct `AuditAction`, `from_state`/`to_state`, payload snapshot), write `OutboxEvent`.
- Handle side-effect-only actions (`challenge:match`, `impact:verify`) that enqueue work.
- **Accept:** concurrent transitions — exactly one wins, loser gets 409; audit + outbox rows always accompany a successful state change (never one without the other).
- **Refs:** `BACKEND_ARCHITECTURE.md` §6, §14; `API_CONTRACTS.md` §concurrency. **Deps:** BE-030/031/032, BE-022.

### BE-034 · Transactional outbox poller/dispatcher — **M** ☐
- `src/workflow/outbox.ts`: poll unprocessed `OutboxEvent` rows, dispatch to the in-process event bus / BullMQ (P6), mark processed with retry/backoff + dead-letter. At-least-once delivery; consumers idempotent.
- **Accept:** killing the process mid-dispatch loses no event; re-delivery doesn't double-apply.
- **Refs:** `BACKEND_ARCHITECTURE.md` §15. **Deps:** BE-033, BE-006.

### BE-035 · `POST /challenges/:id/transition` endpoint — **S** ☐
- Thin controller: body `{ action, payload }` → `transitionChallenge`. Return updated projection + new version.
- **Accept:** drives the whole lifecycle from one endpoint; unknown action → 400.
- **Refs:** `API_CONTRACTS.md` §Challenge/transition. **Deps:** BE-033.

---

## Phase 3 — Front-of-funnel modules

*Goal: citizen submission → AI understanding → validation → dedup → prioritization works end to end. Each module follows `routes → controller → service → repository → types` (+`ai.ts`).*

### BE-040 · Challenge module — **L** ☐
- `POST /challenges` (create, `challenge:submit`), `GET /challenges/:id`, `GET /challenges` (public feed, pagination + filters: district, status, category), `GET /challenges/mine`, `PATCH /challenges/:id`, `DELETE` (soft-delete via `deleted_at`), `GET /challenges/:id/timeline` (from audit events).
- On create: set `SUBMITTED`, write audit + outbox (`challenge:understand` auto-trigger).
- **Accept:** public vs private projections differ correctly; pagination matches contract; soft-deleted rows hidden from feed.
- **Refs:** `API_CONTRACTS.md` §Challenge; `BACKEND_ARCHITECTURE.md` §6. **Deps:** BE-033.

### BE-041 · Evidence & object-storage service — **L** ☐
- Storage abstraction (GCS in prod, MinIO in dev) behind one interface. `POST /challenges/:id/evidence/presign` (short-TTL signed upload URL), `POST …/confirm` (persist `ChallengeEvidence` after client upload), `GET …/evidence` (signed read URLs; private evidence gated by `evidence:readPrivate`).
- **Accept:** no bytes flow through the API; private evidence needs capability + scope; URLs expire.
- **Refs:** `API_CONTRACTS.md` §Evidence; `BACKEND_ARCHITECTURE.md` §12. **Deps:** BE-022.

### BE-042 · AI service boundary (provider-agnostic) — **L** ☐
- `src/modules/ai/provider.ts`: interface `understand()`, `embed()`, `similarity()`, `prioritize()`, `match()` with a default adapter (start with a deterministic/stub or the existing frontend heuristic ported server-side; real provider pluggable later). **AI recommends; humans decide** — persist to `AiRecommendation`, never mutate decision fields.
- `GET /challenges/:id/ai/recommendations`, `POST …/understand`, `POST …/vision`.
- **Accept:** recommendations are stored separately from human decisions; provider swap requires no caller change; every recommendation is traceable (feeds BE-062).
- **Refs:** `BACKEND_ARCHITECTURE.md` §9; `API_CONTRACTS.md` §AI. **Deps:** BE-040.

### BE-043 · Validation module — **M** ☐
- `GET /challenges/:id/validation`. Validation *decisions* are made via transitions (`challenge:validate` / `requestClarification` / `reject` / `defer`) — this module exposes the queue + read model and enforces the gov-validator scope.
- **Accept:** only `GOV_VALIDATOR` (+ scoped `C` roles) can act; AI context visible to reviewers.
- **Refs:** `API_CONTRACTS.md` §Validation; `RBAC_MATRIX.md` §4.2. **Deps:** BE-033, BE-042.

### BE-044 · Similarity / Cluster (dedup) module — **M** ☐
- `GET /clusters`, `GET /clusters/:id`. Clustering runs via `challenge:cluster` transition + AI `embed/similarity`; persist `Cluster` / `ClusterMember`.
- **Accept:** duplicate challenges group under one cluster; cluster read model returns members + representative.
- **Refs:** `API_CONTRACTS.md` §Cluster; `BACKEND_ARCHITECTURE.md` §9. **Deps:** BE-042.

### BE-045 · Prioritization module — **M** ☐
- `challenge:prioritize` transition sets the final score/factors (coordinator-only); expose read of priority + AI-suggested vs human-set values.
- **Accept:** AI suggestion and human score stored distinctly; only coordinator sets final.
- **Refs:** `API_CONTRACTS.md` §22; `RBAC_MATRIX.md` (`challenge:prioritize`). **Deps:** BE-033, BE-042.

---

## Phase 4 — Back-of-funnel modules (matching → impact)

*Goal: matched university → team → proposal → prototype → pilot → validation → deployment → impact → closure.*

### BE-050 · University & Matching module — **L** ☐
- `GET /universities`, `GET /universities/:id`, `POST /matching/run` (`challenge:match` → matching engine produces candidates), acceptance flow via `matching:accept` / `matching:decline` (auto-rematch on decline). Persist `UniversityAcceptance`.
- **Accept:** only the matched university's admin can accept (org resolver); decline triggers rematch.
- **Refs:** `API_CONTRACTS.md` §University/Matching/Acceptance; `RBAC_MATRIX.md` §5.2. **Deps:** BE-033, BE-042.

### BE-051 · Team module — **M** ☐
- `team:create` transition (faculty of accepted university), `GET /teams/:id`, `POST /teams/:id/members`, `PATCH`/`DELETE` member, `POST /teams/:id/join` (student request). Persist `Team` / `TeamMember`.
- **Accept:** team creation requires recorded acceptance (guard); membership changes gated by faculty authority.
- **Refs:** `API_CONTRACTS.md` §Team; `RBAC_MATRIX.md` (`team:*`). **Deps:** BE-050.

### BE-052 · Project module — **M** ☐
- Projects are **auto-created** by `team:create`/`proposal:approve` (no direct create endpoint). `GET /projects`, `GET /projects/:id`, `GET /projects/mine`. Public vs partner vs owner projections.
- **Accept:** no orphan projects; projection respects `project:readOwn/readPartner/readPublic`.
- **Refs:** `API_CONTRACTS.md` §Project, §23 mapping. **Deps:** BE-051.

### BE-053 · Proposal module — **M** ☐
- `proposal:submit` (team members), `GET /projects/:id/proposals`, `proposal:approve` / `proposal:requestRevision` (university authority). Persist `Proposal`.
- **Accept:** revision loop works; approve advances project state.
- **Refs:** `API_CONTRACTS.md` §Proposal. **Deps:** BE-052.

### BE-054 · Milestone module — **S** ☐
- `GET /projects/:id/milestones`, `PATCH /milestones/:id`. Persist `Milestone`.
- **Accept:** milestone status changes audited.
- **Refs:** `API_CONTRACTS.md` §Milestone. **Deps:** BE-052.

### BE-055 · Collaboration & Offer module — **M** ☐
- `POST /projects/:id/collaborations` (post need), `GET`, `POST /collaborations/:id/offers`, `PATCH /offers/:id` (accept), decline. Guard: offering org not already engaged; project not closed. Persist `Collaboration` / `Offer`.
- **Accept:** industry/CSR/lab can offer; accept links partner to project with `project:readPartner`.
- **Refs:** `API_CONTRACTS.md` §Collaboration/Offer; `RBAC_MATRIX.md` (`collab:*`). **Deps:** BE-052.

### BE-056 · Pilot & Deployment module — **M** ☐
- `project:prototype`, `project:pilot`, `project:validate` (gov + experts), `deployment:approve` (gov-department, geo-scoped) transitions; `POST/GET /pilots`, `POST/GET /deployments`. Persist `Pilot` / `Deployment`.
- **Accept:** deployment blocked without a successful pilot validation (guard); approval geo-scoped.
- **Refs:** `API_CONTRACTS.md` §Pilot/Deployment; `RBAC_MATRIX.md` §5.2. **Deps:** BE-033.

### BE-057 · Impact module — **M** ☐
- `POST /projects/:id/impact`, `GET`, `impact:verify` transition. Persist `ImpactRecord`; feeds closure (`challenge:close`).
- **Accept:** impact verification advances toward closure; unverified impact can't close.
- **Refs:** `API_CONTRACTS.md` §Impact. **Deps:** BE-056.

---

## Phase 5 — Cross-cutting services

### BE-060 · Notification coordinator + endpoints — **L** ☐
- Consume `OutboxEvent`s → materialize `AppNotification` per the notifications list in `Complete_workflow.md`. `GET /notifications`, `GET …/unread-count`, `PATCH …/:id/read`, `PATCH …/read-all`. (Delivery channels beyond in-app are P6 workers.)
- **Accept:** each lifecycle transition produces the specified notifications to the right recipients; idempotent on redelivery.
- **Refs:** `API_CONTRACTS.md` §Notification; `BACKEND_ARCHITECTURE.md` §13. **Deps:** BE-034.

### BE-061 · Audit query API — **M** ☐
- `GET /audit` (admin-only, filter by resource/actor/action/date, paginated). Read model over `AuditEvent`. 7-year retention policy documented + enforced (no hard-delete of audit rows).
- **Accept:** admin can reconstruct any resource's full history; non-admin → 403.
- **Refs:** `API_CONTRACTS.md` §Audit; `BACKEND_ARCHITECTURE.md` §14. **Deps:** BE-022.

### BE-062 · AI decision-trace endpoint — **M** ☐
- `GET /ai-decision-trace/:challengeId` — correlate `AiRecommendation`s with the human decisions (audit) that followed, so every AI-influenced outcome is explainable.
- **Accept:** trace shows "AI suggested X → human decided Y by whom, when."
- **Refs:** `API_CONTRACTS.md` §Audit; `BACKEND_ARCHITECTURE.md` §9. **Deps:** BE-042, BE-061.

### BE-063 · GIS / PostGIS endpoints — **L** ☐
- `GET /districts`, `GET /districts/:code`, `GET /challenges/spatial` (bbox/radius query, public), `GET /analytics/district-heatmap` (public aggregate). Use PostGIS spatial queries + GIST indexes.
- **Accept:** spatial query returns challenges within a polygon/radius; heatmap aggregates by district; no PII in public endpoints.
- **Refs:** `API_CONTRACTS.md` §District/GIS; `BACKEND_ARCHITECTURE.md` §11. **Deps:** BE-001, BE-040.

### BE-064 · Admin module — **M** ☐
- `POST /users/:id/roles`, `PATCH …/geo-scopes`, `GET/PATCH /config` (`app_config`), `GET /stats`, `POST /escalate`. All `SUPER_ADMIN` / scoped-admin gated; role/scope changes invalidate the Redis identity cache (BE-020).
- **Accept:** granting a role takes effect on next request (cache invalidated); config changes audited.
- **Refs:** `API_CONTRACTS.md` §Admin; `RBAC_MATRIX.md` §4.1. **Deps:** BE-020, BE-022.

### BE-065 · Jobs status endpoint — **S** ☐
- `GET /jobs/:jobId` — poll async job status (matching, AI understanding). Backed by BullMQ (P6).
- **Accept:** returns queued/active/completed/failed + result ref.
- **Refs:** `API_CONTRACTS.md` §Jobs. **Deps:** BE-070.

---

## Phase 6 — Async workers (BullMQ)

### BE-070 · Worker & queue infrastructure — **M** ☐
- BullMQ setup on Redis: queue registry, worker bootstrap (separate process/entrypoint), retry/backoff, dead-letter, graceful shutdown. Outbox dispatcher (BE-034) enqueues here.
- **Accept:** workers run out-of-band from the API; failed jobs retry then dead-letter.
- **Refs:** `BACKEND_ARCHITECTURE.md` §15. **Deps:** BE-006, BE-034.

### BE-071 · AI-understanding worker — **M** ☐
- Consume `challenge.understand` → call AI `understand`/`embed` → write `AiRecommendation` → transition `challenge:validate`-ready. Idempotent.
- **Accept:** new challenge auto-processed without blocking the submit request.
- **Refs:** `BACKEND_ARCHITECTURE.md` §9, §15. **Deps:** BE-070, BE-042.

### BE-072 · Matching worker — **M** ☐
- Consume `challenge.match` → run matching engine → produce candidate universities → notify. Exposes status via BE-065.
- **Accept:** matching runs async; `POST /matching/run` returns a jobId.
- **Refs:** `API_CONTRACTS.md` §Matching. **Deps:** BE-070, BE-050.

### BE-073 · Notification dispatch worker — **S** ☐
- Consume notification events → deliver via out-of-app channels (email/SMS/push adapters, stubbed initially). In-app rows already written by BE-060.
- **Accept:** channel delivery retried independently of in-app notification.
- **Refs:** `BACKEND_ARCHITECTURE.md` §13. **Deps:** BE-070, BE-060.

### BE-074 · Impact-verification worker — **S** ☐
- Consume `impact:verify` → run verification checks → update `ImpactRecord`.
- **Accept:** verification runs async and audited.
- **Refs:** `API_CONTRACTS.md` §Impact. **Deps:** BE-070, BE-057.

---

## Phase 7 — Security, Observability & Hardening

### BE-080 · Rate limiting + abuse controls — **S** ☐
- Redis-backed rate limiter (per-IP + per-user), stricter on auth/sync and submission. 429 with `Retry-After`.
- **Refs:** `BACKEND_ARCHITECTURE.md` §17. **Deps:** BE-006.

### BE-081 · CORS lockdown, headers, input hardening — **S** ☐
- CORS allow-list from config (no `*` in prod), helmet CSP, body size limits, Zod validation on **every** input boundary, reject unknown fields.
- **Refs:** `BACKEND_ARCHITECTURE.md` §17.

### BE-082 · Secret management — **S** ☐
- No secrets in repo; document `.env` → secret-manager path for prod; verify Firebase service-account handling.
- **Refs:** `BACKEND_ARCHITECTURE.md` §17, §21.

### BE-083 · Observability — metrics + tracing — **M** ☐
- OpenTelemetry traces, Prometheus metrics endpoint, Grafana-ready; RED metrics per route; workflow-transition counters; queue depth gauges.
- **Refs:** `BACKEND_ARCHITECTURE.md` §18.

### BE-084 · Failure isolation — **M** ☐
- Circuit breakers / timeouts around AI provider and object storage; degrade gracefully (queue for retry) rather than failing the request path.
- **Refs:** `BACKEND_ARCHITECTURE.md` §19. **Deps:** BE-042, BE-041.

---

## Phase 8 — Testing

### BE-090 · Test harness (Vitest + Supertest + Testcontainers) — **M** ☐
- Vitest config; Testcontainers spin up Postgres+PostGIS and Redis per suite; migration + seed fixtures; Supertest app factory (uses `app.ts` from BE-007).
- **Refs:** `BACKEND_ARCHITECTURE.md` §20.

### BE-091 · Workflow invariant test suite — **L** ☐
- Table-driven tests over the transition registry: every legal edge succeeds, every illegal (from,action) rejects, each of the 10 guards fails on its violation, optimistic-concurrency conflict → 409.
- **Accept:** the state machine cannot regress silently.
- **Refs:** `BACKEND_ARCHITECTURE.md` §6, §20. **Deps:** BE-030–033, BE-090.

### BE-092 · RBAC/authorization test suite — **M** ☐
- Assert the `RBAC_MATRIX.md` grid: every ✓ passes, every denied cell 403s, every `C` cell passes/denies by resolver. Include the gov-validator/gov-department separation and super-admin non-grants.
- **Refs:** `RBAC_MATRIX.md` §4–§5. **Deps:** BE-022/023, BE-090.

### BE-093 · Module integration tests — **L** ☐
- Per-module happy-path + failure integration tests (Supertest) covering the 56 endpoints; one full-lifecycle end-to-end test (submit → close).
- **Refs:** `API_CONTRACTS.md` §24 census. **Deps:** all P3–P5.

---

## Phase 9 — Frontend integration migration

*Goal: replace the localStorage `workflowStore` with the real backend, per `BACKEND_ARCHITECTURE.md` §23, without a big-bang cutover.*

### BE-100 · API client + auth token wiring (frontend) — **M** ☐
- Typed API client (base `/api/v1`), Firebase ID token attached to requests, error envelope handling, 401 refresh.
- **Deps:** BE-024.

### BE-101 · Phase-1 sync bridge (dual-write) — **L** ☐
- On each `workflowStore` mutation, also call the mapped API (`addChallenge → POST /challenges`, `updateChallengeStatus → POST …/transition {action,payload}`, `addProposal → POST …/proposals`). Reads still come from localStorage; fire `STORE_EVENT` after API write succeeds. Reconcile the client-side stage machine with server actions (status is now an *action*, never a raw set).
- **Accept:** demo keeps working; every local change is mirrored server-side; failures surfaced, not swallowed.
- **Refs:** `API_CONTRACTS.md` §23; `BACKEND_ARCHITECTURE.md` §23. **Deps:** BE-035, BE-040, BE-053.

### BE-102 · Phase-2 backend-first reads — **L** ☐
- Flip reads (`getChallenges/getProjects`) to poll the API; retire localStorage as source of truth; keep `STORE_EVENT` as a thin cache-update signal. Remove the client-side heuristic AI in favor of server `AiRecommendation`s.
- **Accept:** app functions with localStorage cleared; a second browser sees the same data.
- **Refs:** `API_CONTRACTS.md` §23. **Deps:** BE-101, all P3–P5.

---

## Cross-references

- **Lifecycle & invariants:** `02_Project/Complete_workflow.md`
- **Backend architecture (authoritative):** `03_Architecture/BACKEND_ARCHITECTURE.md`
- **Endpoint contracts & transition catalogue:** `03_Architecture/API_CONTRACTS.md` (§22 actions, §23 FE mapping, §24 census)
- **Authorization grid:** `03_Architecture/RBAC_MATRIX.md`
- **Roles:** `02_Project/Actors_and_roles.md`

## Suggested first sprint (unblock the most)

`BE-001 → BE-003 → BE-005 → BE-007 → BE-008/009` (bootable, migrated, seeded server), then `BE-020 → BE-022 → BE-023` (authz core), then `BE-030 → BE-033 → BE-035` (workflow engine + transition endpoint). After that, `BE-040` opens the whole front-of-funnel and modules parallelize.
