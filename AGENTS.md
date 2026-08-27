# AGENTS.md — NIVAARAN (SIH 26043)

> Context file for AI coding agents (Claude Code, Cursor, Copilot, etc.) working in this repository.
> Read this before generating code, naming things, or making architectural decisions.

## 1. What this project is

**NIVAARAN** (Jharkhand Societal Challenge & Innovation Network) is the implementation of **Smart India
Hackathon Problem Statement 26043 — Smart Societal Innovation Platform**, built for the **Government of
Jharkhand, Department of Higher & Technical Education**.

It is **not** a grievance/complaint portal, a university project board, or an industry networking site on its
own. It is a coordinated ecosystem that turns real citizen-reported societal problems into AI-assisted,
university/industry-executed, government-verified solutions.

**One-line flow:**
`Problem → AI understanding → validation → priority → university matching → multidisciplinary team → industry collaboration → prototype → pilot → deployment → impact measurement`

**Tagline:** *From Community Problems to Scalable Solutions.*

**Core theme:** Disaster Management (flood, drought, landslide, fire, heatwave, infrastructure), with the
architecture kept general enough to support broader societal-challenge domains.

**Geographic scope:** Jharkhand, tracked at district → block → village level via GIS.

---

## 2. The problem this solves

Citizens experience real local problems. Universities have research capability and student talent. Industry
has funding, technology and deployment capacity. **These three are fragmented today** — there is no
structured, trusted channel connecting demand (real problems) with supply (knowledge, people, tech, funding).
NIVAARAN is that orchestration layer, not a passive listing site. Every feature should be evaluated against
whether it moves a real challenge further along the lifecycle in Section 4 — not just whether it looks good.

---

## 3. Users and roles

Access is strict RBAC, least-privilege, per-endpoint and per-UI-action. Design every feature with "which
role(s) can see/do this?" as a first-class question.

| Role | Primary purpose on the platform |
|---|---|
| Citizen | Submit challenges with evidence/location, track status, give feedback |
| Community Org / NGO | Submit + validate community challenges, collaborate on projects |
| Panchayati Raj Institution (PRI) | Submit/verify village/block-level challenges |
| Urban Local Body (ULB) | Report/manage urban challenges |
| Government Department | Validate, prioritize, assign, monitor district/state dashboards |
| University Admin | Manage institution profile, departments, facilities |
| Faculty / Mentor | Mentor teams, review proposals, approve milestones |
| Student | Discover challenges, join teams, build prototypes |
| Industry / Startup / MSME | Mentor, fund, provide tech/testing, support deployment |
| CSR Organization | Fund and support high-impact projects |
| Research Lab / Innovation Hub | Provide specialized expertise and facilities |
| Platform Super Admin | Taxonomy, users, workflows, permissions, moderation |

**Non-negotiable rules for agents:**
- Citizen contact info and private evidence are never exposed to unauthorized roles.
- AI output is *advisory only*. Final prioritization and institutional allocation require explicit human
  approval — never auto-commit an AI decision as final state.
- Every AI suggestion + human decision pair must be written to `audit_logs`.

---

## 4. End-to-end challenge lifecycle (16 stages)

Every challenge record moves through this pipeline. Each stage produces structured data — never leave a stage
as an implicit UI state with no backing record.

| # | Stage | Produces |
|---|---|---|
| 1 | Submission | Challenge + evidence + geo |
| 2 | AI understanding | AI summary, tags, confidence |
| 3 | Validation | Validation decision + notes |
| 4 | Deduplication | Cluster links |
| 5 | Prioritization | Priority score + factors |
| 6 | Institution matching | Match scores + reasons |
| 7 | Acceptance | Acceptance record |
| 8 | Team formation | Team roster + roles |
| 9 | Proposal | Proposal document |
| 10 | Industry collaboration | Collaboration requests |
| 11 | Prototype | Designs, code refs, tests |
| 12 | Pilot | Pilot metrics, issues |
| 13 | Validation (outcomes) | Validation report |
| 14 | Deployment | Deployment evidence |
| 15 | Impact measurement | Impact metrics |
| 16 | Closure & learning | Closure package |

**Status taxonomy (`challenge.status`):** `Submitted → Under Review → Validated → Clustered → Prioritized →
Matching → University Accepted → Project Active → Prototype → Pilot → Deployment → Completed → Impact
Verified → Closed`

**Flagship demo scenario** (use this as the reference story for seed data and test fixtures): a flood-prone
school/village — citizen submits photos + GPS + description → AI classifies flood/education risk → similar
reports clustered → government validates → AI recommends universities with explanations → university accepts
and forms a multidisciplinary team (IoT, GIS, AI/ML, Civil) → industry provides sensors/mentorship → prototype
and pilot results appear on the project dashboard → government dashboard shows hotspot, progress and verified
impact → citizen gets notified and gives feedback.

---

## 5. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite + TypeScript + Tailwind CSS + shadcn/ui (or similar) |
| Routing | React Router, role-based route trees / layout shells |
| Maps / GIS | Leaflet + OpenStreetMap (or Mapbox) |
| Charts | Recharts (or equivalent) |
| Realtime | Socket.io (client + server) |
| HTTP | Axios/fetch with JWT interceptors |
| Backend | Node.js + Express.js (NestJS acceptable if more structure is wanted) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + refresh tokens, bcrypt password hashing, optional Google OAuth |
| Authorization | RBAC — role + permission policies enforced server-side |
| AI | LLM/API for classification, summarization, matching, recommendations — **structured JSON outputs only** |
| File storage | Cloudinary or S3-compatible object storage |
| Notifications | Realtime (Socket.io) + email/SMS/push |
| CI/CD | GitHub Actions — lint, test, build, deploy on `main` |
| Hosting | Frontend → Vercel · Backend → Railway/Render · DB → MongoDB Atlas |
| Error tracking | Sentry (when budget allows) |

**Rationale:** fast MVP delivery, strong TypeScript safety, free/low-cost tiers suitable for a hackathon and
early pilots, and a clear scale-up path (horizontal backend nodes, Atlas tier upgrades, CDN for static assets).

---

## 6. Design system

> The source specification did not define a visual identity — the palette and type choices below are proposed
> defaults for this repo. Treat them as the starting design tokens; update this section if the team locks in a
> different system, so agents always read the current source of truth.

### 6.1 Color theme — light, warm, not stark white

Government/civic + disaster-response context calls for a calm, trustworthy, high-contrast-but-not-clinical
palette. Avoid pure `#FFFFFF` backgrounds; use a warm off-white instead.

| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#FAF8F3` | App background (warm off-white, not pure white) |
| `--bg-surface` | `#F3F0E8` | Cards, panels, table rows |
| `--bg-muted` | `#EAE6DA` | Subtle section dividers, disabled states |
| `--color-primary` | `#1E3A5F` | Deep trust-blue — primary actions, nav, links |
| `--color-primary-hover` | `#16293F` | Primary hover/active |
| `--color-secondary` | `#0F766E` | Teal-green — success, "validated", growth/impact indicators |
| `--color-accent` | `#C2760C` | Warm amber/ochre — CTAs, highlights, in-progress states |
| `--color-danger` | `#B3261E` | High severity / urgent disaster flags |
| `--color-warning` | `#B45309` | Medium severity, pending review |
| `--text-primary` | `#22201B` | Body text (warm near-black, not `#000`) |
| `--text-secondary` | `#5C574C` | Secondary/meta text |
| `--border` | `#DCD6C6` | Card borders, dividers |

Severity/status colors (map, dashboards, badges) should stay within this warm-neutral + blue/teal/amber/red
family — don't introduce cold pure grays or saturated primary red/green/blue that clash with the base palette.

### 6.2 Typography

| Role | Font | Notes |
|---|---|---|
| UI / headings / body (Latin) | **Inter** | Variable font, excellent legibility at small sizes for dashboards |
| Hindi / Devanagari companion | **Noto Sans Devanagari** | Pairs cleanly with Inter for bilingual (Hindi/English) UI |
| Monospace | **JetBrains Mono** | Challenge IDs, technical fields, code refs |

Type scale: keep to a standard 4/8px rhythm (e.g. 12/14/16/20/24/32px) — this is a data-dense, dashboard-heavy
product, so prioritize legibility and consistent vertical rhythm over decorative display type.

### 6.3 UI principles

- Mobile-first, citizen-facing screens must work on low-bandwidth connections (compress media, progressive
  upload).
- Every AI-derived value shown in the UI (category, priority, match score) must show its **reasons/factors**
  next to it and remain human-editable — never render AI output as unexplained, unchangeable truth.
- Status badges, timelines, cards and empty states come from one shared component set — don't reinvent per
  screen.
- Accessibility: keyboard navigation, sufficient contrast against the warm off-white background, labeled
  inputs, alt text on all evidence images.

---

## 7. Information architecture (screens by role)

| Area | Key screens |
|---|---|
| Public | Landing, Explore Challenges, Map, Solutions, Universities, Partners, Impact |
| Citizen | Dashboard, Submit Challenge, My Challenges, Tracking, Notifications, Profile |
| University | Overview, Matched Challenges, Projects, Teams, Faculty, Proposals, Milestones |
| Industry | Discover, Collaboration Requests, Mentorship, Funding, Projects |
| Government | State Overview, District Map, Challenges, Universities, Industry, Projects, Impact, Reports |
| Admin | Users, Taxonomy, Moderation, Workflow, Audit, System Settings |

---

## 8. Data model (MongoDB collections)

| Collection | Purpose |
|---|---|
| `users` | Identity, role, profile, auth |
| `challenges` | Core societal challenge records |
| `challenge_evidence` | Photos, videos, documents (storage refs) |
| `categories` | Domain/sub-domain taxonomy |
| `universities` / `departments` / `faculty` / `students` / `skills` | Institution + people capability graph |
| `projects` / `project_members` / `proposals` / `milestones` | Project lifecycle |
| `industry_partners` / `collaborations` | Industry/CSR relationships |
| `notifications` / `messages` | Comms |
| `impact_metrics` | Before/after outcome data |
| `reviews` | Validation/evaluation records |
| `audit_logs` | Security + AI-decision accountability trail |

**Key `challenges` fields:** `title`, `description` (multilingual), `location` (GeoJSON + district/block/village),
`category`/`subCategory`/`tags`, `status`, `priorityScore` + `priorityFactors`, `aiSummary` + `aiConfidence`,
`clusterId`, `submittedBy`, `validatedBy`, `matchedUniversities: [{university, score, reasons}]`, `projectId`,
`createdAt`/`updatedAt`.

Design principle: **real structured schemas with evidence and audit trails — no hard-coded dummy data in
production code paths.** Seed/demo data must live in isolated seed scripts, never inline in app logic.

---

## 9. API surface (representative)

```
POST   /api/challenges                          Create challenge
GET    /api/challenges                           List/search/filter
GET    /api/challenges/:id                       Details
POST   /api/challenges/:id/evidence              Upload evidence
POST   /api/challenges/:id/ai-analyze             Run AI analysis
POST   /api/challenges/:id/validate               Validate challenge
POST   /api/challenges/:id/match                  Generate institution matches
POST   /api/projects                             Create project
POST   /api/projects/:id/members                 Add team members
POST   /api/projects/:id/milestones              Create milestone
PATCH  /api/projects/:id/milestones/:mid         Update milestone
POST   /api/projects/:id/collaborations          Request industry collaboration
GET    /api/dashboard/government                 Government analytics
GET    /api/map/challenges                       GIS challenge data
```

All mutating endpoints require JWT + RBAC. AI re-analyze should be idempotent. Public submission endpoints are
rate-limited.

---

## 10. AI behavior rules for agents implementing AI features

- **Assistive, not authoritative.** Summarization, classification, entity extraction, priority scoring,
  deduplication, university matching, team recommendations, solution ideation, impact estimation — all of it
  is a suggestion a human can override.
- Every AI output must expose *why* (factors, confidence score). Low-confidence outputs should route to human
  review rather than auto-applying.
- Return AI outputs as structured JSON, not freeform prose, so the UI can render reasons + edit affordances
  reliably.
- Never use sensitive personal information for ranking/prioritization beyond what's operationally necessary.
- Log every AI suggestion alongside the human's final decision in `audit_logs`.

---

## 11. Security & privacy baseline

- JWT + refresh tokens, bcrypt password hashing, HTTPS everywhere, secrets in env vars (never committed).
- RBAC enforced server-side on every mutating route — UI-level hiding is not sufficient.
- File upload validation (type/size) + malware scanning where feasible.
- Rate limiting and abuse prevention on all public-facing submission endpoints from day one.
- Citizen private contact/evidence access is permissioned separately from public challenge data.

---

## 12. Build priority (don't build everything at once)

Implementation order the codebase should follow:

1. Auth + RBAC + user profiles (all roles)
2. Challenge submission + evidence upload + status model
3. AI `/ai-analyze` endpoint (summary, category, priority) with human override UI
4. University profiles + matching API + accept flow
5. Project + team + milestone modules
6. Industry collaboration request/accept
7. GIS map + filters
8. Government dashboard KPIs
9. Public tracking page + notifications
10. Impact metrics + closure
11. Hardening: audit logs, rate limits, moderation

**MVP definition of done** is one full disaster-management story (flood/school/village) running end-to-end
across all the above — not feature volume, and not dummy-data coverage.

---

## 13. Conventions checklist for agents

- [ ] No hard-coded dummy/placeholder data in production code paths — isolate seed scripts.
- [ ] Every new mutating endpoint has an explicit role/permission check.
- [ ] Every AI-derived UI value shows its reasoning and remains editable by an authorized human.
- [ ] New challenge/project state transitions update `status` using the taxonomy in Section 4 — don't invent
      ad hoc status strings.
- [ ] New UI surfaces reuse the shared design tokens in Section 6, not one-off colors/fonts.
- [ ] Sensitive fields (citizen contact, private evidence) are excluded from any response payload not scoped
      to an authorized role.
