# Nivaaran — RBAC Matrix

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** Role-Based Access Control Matrix
**Status:** Foundational Architecture — Design for Production / Shipping
**Upstream documents:** `Actors_and_roles.md` (§3 actors, §19 ownership, §20 data classes, §27 principles, §28 conceptual matrix, §29–33 role distinctions), `BACKEND_ARCHITECTURE.md` (§8 authN/authZ), `DATABASE_DESIGN.md` (§8.4 roles/permissions models), `API_CONTRACTS.md` (§22 transition catalogue)

---

## 1. Purpose

This document turns the *conceptual* permission matrix of `Actors_and_roles.md` §28 into the **definitive, machine-readable authorization specification** for Nivaaran. It defines:

* the **capability catalogue** — the full, granular list of what any actor can do, derived from the API surface and the transition catalogue (`API_CONTRACTS.md` §22);
* the **role × capability matrix** — every role, every capability, allow / deny / conditional;
* the **concrete `role_permissions` seed rows** that populate the database at startup (the matrix **as data**, per `BACKEND_ARCHITECTURE.md` §8.3);
* the **`authorize(capability, resolver)` middleware contract** — how the engine composes role + org + geo + ownership + workflow-state into a single allow/deny;
* how **geo scope, resource ownership, and workflow state** gate *on top of* the role matrix — the difference between "is allowed to" and "is allowed to, *here, on this, now*".

The governing principle is inherited from `Actors_and_roles.md` §19 and §27(1-5):

> **Role alone is insufficient for authorization.**
> Access is `ROLE + ORGANIZATION + GEOGRAPHIC SCOPE + RESOURCE OWNERSHIP + WORKFLOW STATE`.

The matrix below is the *first* column of that tuple. The other four columns are enforced by the `authorize` middleware's resolver chain (§5).

---

## 2. Roles

The 12 roles are the 12 actor types, matching the `UserRole` enum exactly (`DATABASE_DESIGN.md` §8.1). `GOV_VALIDATOR` and `GOV_DEPARTMENT` are deliberately split so validation powers are **not** fungible across departments (`DATABASE_DESIGN.md` §8.1 note).

| Role (`UserRole`) | Actor | Scope of authority |
| --- | --- | --- |
| `CITIZEN` | Citizen | self + reported challenges, public data |
| `COMMUNITY_NGO` | Community organization / NGO | org + its submitted challenges |
| `PRI` | Panchayati Raj Institution | its panchayat block(s) |
| `ULB` | Urban Local Body | its municipal jurisdiction |
| `GOV_VALIDATOR` | District validation officer | district(s), validation queue |
| `GOV_DEPARTMENT` | Government department (decision-maker) | a portfolio of districts; **not** validation powers |
| `UNIVERSITY` | University admin / VC office | its institution + members |
| `FACULTY` | Faculty / mentor | assigned projects, mentorship |
| `STUDENT` | Student | own team + assigned project contribution |
| `INDUSTRY` | Industry / startup / MSME | its org, partner projects |
| `CSR` | CSR organization | its org, partner projects, funding |
| `LAB` | Research lab / innovation hub | its org, partner collaborations |

Two hard separations (from `Actors_and_roles.md` §29–31):
* **`SUPER_ADMIN` is not a role in the 12 above** for decisions — it is a *platform administration* role only, and never receives government decision powers (`§29`). It is included in the matrix below in its own column for clarity.
* **`UNIVERSITY` (admin) ≠ `FACULTY`**: admin manages the institution; faculty mentors the academic project/team (`§30`). A faculty member does not modify the official institutional profile.

A user may hold **more than one role** (`Actors_and_roles.md` §26, `UserRoleLink` join table). Effective permission is the **union** of granted capabilities, still constrained by org/geo/ownership/workflow of the *request in flight* — multiple roles never create unrestricted access.

---

## 3. Capability Catalogue

Capabilities are the discrete, grantable verbs. Each is a `Permission.capability` row (`DATABASE_DESIGN.md` §8.4). The naming convention follows the resource-transition language from the transition catalogue so that **every workflow action has exactly one capability** governing it.

### 3.1 Challenge lifecycle capabilities

| Capability | What it permits | Backed by |
| --- | --- | --- |
| `challenge:submit` | file a new challenge | `POST /api/v1/challenges` |
| `challenge:readOwn` | read challenges the actor submitted | `GET /challenges/mine` |
| `challenge:readPublic` | read the public challenge feed | `GET /challenges` |
| `challenge:resubmit` | respond to a clarification request | transition `challenge:resubmit` |
| `challenge:addEvidence` | attach evidence to a challenge | `POST /challenges/:id/evidence` |
| `challenge:review` | enter the validation queue / review AI context | validation UI |
| `challenge:validate` | **make** the validation decision | transition `challenge:validate` |
| `challenge:requestClarification` | send clarification questions to submitter | transition `challenge:requestClarification` |
| `challenge:reject` | reject a challenge with reason | transition `challenge:reject` |
| `challenge:defer` | defer (not reject, not validate yet) | transition `challenge:defer` |
| `challenge:cluster` | create/assign a dedup cluster | transition `challenge:cluster` |
| `challenge:prioritize` | **set the final priority score** | transition `challenge:prioritize` |
| `challenge:match` | **trigger university matching** | transition `challenge:match` |
| `challenge:close` | close a completed challenge | transition `challenge:close` |
| `challenge:escalate` | flag a stalled/risky challenge | transition `workflow:escalate` |
| `challenge:resolve` | apply a corrective action | transition `workflow:resolve` |
| `challenge:withdraw` | citizen withdraws own report | workflow action |

### 3.2 Project / university capabilities

| Capability | What it permits | Backed by |
| --- | --- | --- |
| `matching:accept` | university accepts a matched challenge | transition `matching:accept` |
| `matching:decline` | university declines a match | transition `matching:decline` |
| `team:create` | create a team for an accepted project | transition `team:create` |
| `team:manage` | add/remove members (faculty authority) | `POST /teams/:id/members` |
| `team:join` | student requests/joins a team | `POST /teams/:id/join` |
| `proposal:submit` | submit a proposal for the project | transition `proposal:submit` |
| `proposal:review` | review/approve/revision the proposal | transitions `proposal:approve` / `proposal:requestRevision` |
| `project:prototype` | mark/ship the prototype | transition `project:prototype` |
| `project:pilot` | run a pilot | transition `project:pilot` |
| `project:validate` | validate pilot outcome (gov + experts) | transition `project:validate` |
| `deployment:approve` | **approve deployment** (gov decision) | transition `deployment:approve` |
| `impact:verify` | verify impact records | transition `impact:verify` |
| `project:readOwn` | read own project details | `GET /projects/mine` |
| `project:readPartner` | read as a collaboration partner | `GET /projects/:id` |
| `project:readPublic` | read published project info | public project projection |

### 3.3 Collaboration capabilities

| Capability | What it permits | Backed by |
| --- | --- | --- |
| `collab:postNeed` | express a project need | `POST /projects/:id/collaborations` |
| `collab:offer` | make a funding/resource/expertise offer | `POST /collaborations/:id/offers` |
| `collab:accept` | accept a collaboration offer | `PATCH /offers/:id` |
| `collab:mentor` | mentor a project (industry/CSR/lab/community) | `Actors_and_roles.md` §28 |
| `collab:test` | provide testing in a project | `Actors_and_roles.md` §28 |
| `collab:supportDeploy` | support a deployment | `Actors_and_roles.md` §28 |

### 3.4 Platform / data capabilities

| Capability | What it permits | Backed by |
| --- | --- | --- |
| `data:viewPublicAnalytics` | view public/aggregate analytics | `GET /analytics/public` |
| `data:viewGovAnalytics` | view government analytics | `GET /analytics/gov` |
| `data:viewInternalOrg` | view internal org data | org-scoped read |
| `data:viewPrivate` | view private/PII data | `Actors_and_roles.md` §20 PRIVATE |
| `evidence:readPrivate` | read private evidence | short-TTL signed URL |
| `users:manage` | manage users in scope | `SECURITY_ARCHITECTURE.md` |
| `taxonomy:manage` | manage the domain taxonomy | super admin |
| `workflows:configure` | configure workflow/transition rules | super admin |
| `moderation:config` | configure moderation | super admin |
| `app:config` | manage `app_config` | super admin |

---

## 4. Role × Capability Matrix

Read as **"capability (row) allowed for role (column)"** — `✓` = unconditionally allowed, `C` = conditional (resource/geo/state-gated, resolved by `authorize`), `—` = denied.

| Capability | Citizen | NGO | PRI | ULB | GovValid | GovDept | Univ | Faculty | Student | Industry | CSR | Lab | SuperAdmin |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Challenge** | | | | | | | | | | | | | |
| challenge:submit | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — | ✓ |
| challenge:readOwn | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| challenge:readPublic | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| challenge:resubmit | C | C | C | C | — | — | — | — | — | — | — | — | — |
| challenge:addEvidence | C | C | C | C | C | C | C | C | C | C | C | C | ✓ |
| challenge:review | — | C | C | C | ✓ | — | — | — | — | — | — | — | ✓✓ |
| challenge:validate | — | — | — | — | ✓ | — | — | — | — | — | — | — | — |
| challenge:requestClarification | — | — | — | — | ✓ | — | — | — | — | — | — | — | — |
| challenge:reject | — | — | — | — | ✓ | — | — | — | — | — | — | — | — |
| challenge:defer | — | — | — | — | ✓ | — | — | — | — | — | — | — | — |
| challenge:cluster | — | — | — | — | ✓ | — | — | — | — | — | — | — | — |
| challenge:prioritize | — | — | — | — | — | ✓ | — | — | — | — | — | — | C |
| challenge:match | — | — | — | — | — | C | ✓ | ✓ | — | — | — | — | C |
| challenge:close | — | — | — | — | — | ✓ | — | — | — | — | — | — | — |
| challenge:escalate | — | C | C | C | — | ✓ | — | — | — | — | — | — | ✓ |
| challenge:resolve | — | — | — | — | — | ✓ | — | — | — | — | — | — | ✓ |
| **Project / Uni** | | | | | | | | | | | | | |
| matching:accept | — | — | — | — | — | — | ✓ | C | — | — | — | — | — |
| matching:decline | — | — | — | — | — | — | ✓ | C | — | — | — | — | — |
| team:create | — | — | — | — | — | — | C | ✓ | — | — | — | — | — |
| team:manage | — | — | — | — | — | — | C | ✓ | — | — | — | — | — |
| team:join | — | — | — | — | — | — | — | — | C | — | — | — | — |
| proposal:submit | — | — | — | — | — | — | — | ✓ | C | — | — | — | — |
| proposal:review | — | — | — | — | — | — | ✓ | ✓ | — | — | — | — | — |
| project:prototype | — | C | — | — | — | — | ✓ | ✓ | C | ✓ | — | ✓ | — |
| project:pilot | — | — | — | — | — | — | ✓ | ✓ | C | — | — | — | — |
| project:validate | — | — | — | — | ✓ | ✓ | — | — | — | — | — | — | — |
| deployment:approve | — | — | — | — | — | ✓ | — | — | — | — | — | — | — |
| impact:verify | — | — | — | — | ✓ | ✓ | — | — | — | — | — | — | — |
| project:readOwn | C | C | — | — | C | C | ✓ | ✓ | C | C | C | C | ✓ |
| project:readPartner | — | C | — | — | C | C | ✓ | ✓ | C | C | C | C | ✓ |
| project:readPublic | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Collaboration** | | | | | | | | | | | | | |
| collab:postNeed | — | — | — | — | — | — | ✓ | ✓ | C | — | — | C | — |
| collab:offer | — | — | — | — | — | — | — | — | — | ✓ | ✓ | ✓ | ✓ |
| collab:accept | — | — | — | — | — | — | ✓ | ✓ | — | ✓ | ✓ | ✓ | — |
| collab:mentor | — | ✓ | — | — | — | — | — | ✓ | — | ✓ | ✓ | ✓ | — |
| collab:test | — | ✓ | — | — | — | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| collab:supportDeploy | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | — |
| **Platform / Data** | | | | | | | | | | | | | |
| data:viewPublicAnalytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| data:viewGovAnalytics | — | — | C | C | ✓ | ✓ | — | — | — | — | — | — | ✓ |
| data:viewInternalOrg | — | C | C | C | C | C | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| data:viewPrivate | — | — | — | — | C | C | — | — | — | — | — | — | ✓ |
| evidence:readPrivate | — | — | — | — | C | C | C | C | C | C | C | C | ✓ |
| users:manage | — | — | — | — | — | C | ✓ | — | — | C | C | C | ✓ |
| taxonomy:manage | — | — | — | — | — | — | — | — | — | — | — | — | ✓ |
| workflows:configure | — | — | — | — | — | — | — | — | — | — | — | — | ✓ |
| moderation:config | — | — | — | — | — | — | — | — | — | — | — | — | ✓ |
| app:config | — | — | — | — | — | — | — | — | — | — | — | — | ✓ |

**Legend notes:**
* `✓✓` under SuperAdmin for `challenge:review` is **not** a grant — see §4.1.
* `C` cells are *permitted but gated*: the middleware must still pass org / geo / ownership / workflow-state checks (see §5).
* **Denied cells are the security boundary.** A missing cell is a *deny*, enforced as a hard default (see §5.3 — no open `else`).

### 4.1 The Super Admin separation

`SUPER_ADMIN` **cannot validate, prioritize, or decide** challenges as a government actor — it owns *platform administration* only (`Actors_and_roles.md` §29). It *may* `challenge:review` in the narrow sense of viewing any resource for administration/monitoring, but it can never **transition** a challenge's consequential state. The `C` on `challenge:prioritize`/`challenge:match` means *configuration-time* influence (e.g. tuning taxonomy/weights), never a live decision. This is enforced in the resolver, not just the row.

### 4.2 Government split (Validator vs Department)

* **`GOV_VALIDATOR`** owns the *front of funnel*: validate, clarify, reject, defer, cluster. It does **not** set final priority, approve deployment, or close challenges.
* **`GOV_DEPARTMENT`** owns the *end of funnel*: final prioritization, deployment approval, closure, escalation. It does **not** validate individual submissions.
* This split makes it structurally impossible for one officer to both decide a report is valid and then unilaterally approve its deployment.

---

## 5. The `authorize` Middleware Contract

`authorize(capability, resolver)` is the single enforcement primitive. From `BACKEND_ARCHITECTURE.md` §8.2:

```ts
// src/security/authorize.ts (contract)
type Resolver = (ctx: AuthContext, res: ResourceRef) => Promise<ScopeVerdict>;

async function authorize(capability: Capability, resolver?: Resolver) {
  return async (req, res, next) => {
    const ctx = req.auth;                    // identity bundle attached by AuthMiddleware (§8.1)

    // ① Role check — is the capability granted to ANY of the caller's roles?
    if (!ctx.permissions.has(capability)) {
      throw new Forbidden(capability);       // 403
    }

    // ② Resource scope check — default true for non-resource capabilities
    const verdict = resolver
      ? await resolver(ctx, req.resource)    // org + geo + ownership + workflow-state
      : ScopeVerdict.ALLOW;

    if (verdict.deny) throw new ForbiddenScope(verdict.reason);   // 403 with reason
    if (verdict.condition) ctx.scopeContext = verdict;            // surface to service
    next();
  };
}
```

### 5.1 The identity bundle

Attached by `AuthMiddleware` (`BACKEND_ARCHITECTURE.md` §8.1) after Firebase token verification and the Postgres user lookup/upsert:

```ts
interface AuthContext {
  user: { id: string; firebaseUid: string; name: string };
  roles: UserRole[];                       // all granted roles
  permissions: Set<Permission>;            // union across roles
  org?: { id: string; type: OrgType };     // primary organization
  geoScopes: { scopeType: GeoScopeType; districtCode?: string; blockCode?: string }[];
}
```

* `permissions` is the **union** across all of the caller's roles (`UserRoleLink` join). Denial is *not* unionable — see §5.3.
* The bundle is cached in Redis (short TTL) so repeated requests don't re-hit Firebase/DB (`BACKEND_ARCHITECTURE.md` §8.1).

### 5.2 The resolver chain — the other four columns

A resource `resolver` composes the remaining gates **after** the role check passes. This is `Actors_and_roles.md` §19's tuple, and it is where nearly every `C` cell in the matrix is actually judged:

```text
resolver(resource) =
   ORGANIZATION  ✔   resource.orgId ∈ {ctx.org.id ∪ authorized orgs}
   + GEOGRAPHIC  ✔   resource.district/block ∈ ctx.geoScopes        (for geo-scoped actors)
   + RESOURCE     ✔   ownership relation: owner | member | assigned | partner | unrelated
   + WORKFLOW     ✔   resource.status ∈ legal-transition-source set  (for transitions)
   → { allow } | { deny, reason }
```

Examples from the matrix:

| Capability (`C` cell) | Resolver checks |
| --- | --- |
| `challenge:resubmit` (Citizen) | `resource.submitter_id === ctx.user.id` (owner) **and** `resource.status === CLARIFICATION_REQUESTED` (workflow) |
| `challenge:validate` → geo `C` on PRI/ULB limited | `resource.district/block ∈ ctx.geoScopes` **and** status in `{SUBMITTED, AI_UNDERSTANDING, CLARIFICATION_RESPONDED}` |
| `matching:accept` (University) | `resource.assigned_university_id === ctx.org.id` (org) **and** status === `MATCHING` |
| `team:create` (Faculty) | `ctx.org.id === project.university_id` (org) **and** `matching:accept` recorded (workflow) |
| `proposal:submit` (Student `C`) | caller is a **team member** of this project (ownership) **and** status ∈ `{TEAM_FORMING, PROPOSAL_REVIEW}` |
| `collab:offer` (Industry/CSR/Lab) | caller's org **not** already the offering org; project not closed (workflow) |
| `data:viewPrivate` | **capability + explicit** geo/role condition — never implicit |
| `deployment:approve` (GovDept) | `resource.district ∈ ctx.geoScopes` **and** status === `PROJECT_VALIDATION` (or `DEPLOYMENT_APPROVED` re-entry) |

### 5.3 Hard-deny default (the security boundary)

* The capability check is a **closed whitelist**. There is no `else-allowed`, no `*` fallback, no "any logged-in role" shortcut. If a capability is not in `ctx.permissions`, the answer is **403**, unconditionally.
* A role can **override a denial with nothing**: permission is union-of-grants, but the *absence* of a capability across all roles is a hard deny.
* **`SUPER_ADMIN`'s non-grant of decision capabilities is a true denial**, not an override—see §4.1. Admin privilege does not collapse the matrix.

### 5.4 Route-to-contract example

```ts
// challenge routes
POST   /api/v1/challenges                    → authorize('challenge:submit')
POST   /api/v1/challenges/:id/transition     → authorize(ACTION_TO_CAPABILITY[action], challengeResolver)
GET    /api/v1/challenges/mine               → authorize('challenge:readOwn')
GET    /api/v1/challenges/:id                → authorize('challenge:readPublic') OR readOwn (public-or-owner)
```

The transition endpoint maps each action to exactly one capability (the catalogue in §3.1–3.2 *is* that mapping), so **no transition can fire without a granular capability behind it** — closing the `API_CONTRACTS.md` §22 loop. Every transition action in that catalogue has a row in the capability catalogue and exactly one owner role (or explicit `C`).

---

## 6. Concrete `role_permissions` Seed Rows

The database treats the matrix as data (`DATABASE_DESIGN.md` §8.4). At startup, a seed script inserts one `Permission` row per capability and one `RolePermission` link per `✓`/`C` cell above. Partial extract (representative; the full seed mirrors the matrix exactly):

```ts
// seed:rbac.ts (extract — full file mirrors §4 cell-for-cell)
const GRANTS: Record<Capability, UserRole[]> = {
  'challenge:submit':        ['CITIZEN','COMMUNITY_NGO','PRI','ULB','GOV_VALIDATOR','GOV_DEPARTMENT','SUPER_ADMIN'],
  'challenge:validate':      ['GOV_VALIDATOR'],                       // validator only
  'challenge:prioritize':    ['GOV_DEPARTMENT'],                      // department only (+config for admin)
  'deployment:approve':      ['GOV_DEPARTMENT'],
  'matching:accept':         ['UNIVERSITY','FACULTY'],                // faculty = C (org/state resolves)
  'team:create':             ['FACULTY','UNIVERSITY'],
  'team:manage':             ['FACULTY','UNIVERSITY'],
  'proposal:review':         ['UNIVERSITY','FACULTY'],
  'collab:offer':            ['INDUSTRY','CSR','LAB','SUPER_ADMIN'],
  'collab:mentor':           ['COMMUNITY_NGO','FACULTY','INDUSTRY','CSR','LAB'],
  'data:viewGovAnalytics':   ['PRI','ULB','GOV_VALIDATOR','GOV_DEPARTMENT','SUPER_ADMIN'],  // PRI/ULB = C
  'taxonomy:manage':         ['SUPER_ADMIN'],
  'workflows:configure':     ['SUPER_ADMIN'],
  'challenge:close':         ['GOV_DEPARTMENT'],
  'challenge:escalate':      ['COMMUNITY_NGO','PRI','ULB','GOV_DEPARTMENT','SUPER_ADMIN'],
  'project:validate':        ['GOV_VALIDATOR','GOV_DEPARTMENT'],
  'impact:verify':           ['GOV_VALIDATOR','GOV_DEPARTMENT'],
  // ... every capability in §3 has exactly one grant-list, and every §4 ✓/C maps here
};

for (const [cap, roles] of Object.entries(GRANTS)) {
  const perm = await prisma.permission.upsert({ where: { capability: cap }, update: {}, create: { capability: cap } });
  for (const role of roles) {
    await prisma.rolePermission.upsert({
      where: { role_name_permission_id: { role_name: role, permission_id: perm.id } },
      update: {}, create: { role_name: role, permission_id: perm.id },
    });
  }
}
```

### 6.1 Grant-changing policy

* A future permission grant/revoke is a **seed-row + migration change**, not a code deploy (`BACKEND_ARCHITECTURE.md` §8.3).
* **Cross-cutting changes to the matrix must be reviewed against §4.1/§4.2** (super-admin non-decision, validator↔department split) — these two separations are invariants, not tunables.

---

## 7. Workflow-State Gating

Being able to perform a capability does **not** imply the workflow will allow it (Principle 5). The live challenge status is the *last* gate. The authoritative source of legal transitions is the **transition registry** (`Complete_workflow.md` §22, `BACKEND_ARCHITECTURE.md` §6.3). The `authorize` resolver checks `resource.status ∈ legal-source-states(action)`; the engine re-checks it inside its transaction (defense in depth — the DB/engine is the last line, `BACKEND_ARCHITECTURE.md` §2.1).

Example — `challenge:prioritize` (GOV_DEPARTMENT):
* role check passes (grant exists);
* geo check passes (challenge in their district);
* **workflow check**: allowed only from `VALIDATED` (not before validation, not after it has already moved to `MATCHING`). If a stale client tries to prioritize a `MATCHING` challenge, the engine returns `409 UnprocessableWorkflow`.

This is why the frontend can *never* decide access by rendering buttons — it renders by fetching repo state; the server enforces capability + state. The `RBAC` reading of the frontend work is: **UI affordances are hints, never gates** (mirrors `BACKEND_ARCHITECTURE.md` §1's authoritative-engine rule).

---

## 8. Data Visibility Mapping (from §20)

The four visibility classes of `Actors_and_roles.md` §20 map onto capabilities so the read model is enforced:

| Visibility class | Requires | Examples |
| --- | --- | --- |
| `PUBLIC` | `challenge:readPublic` / `project:readPublic` / `data:viewPublicAnalytics` | public challenge title/location/status; published project; verified impact |
| `PARTICIPANT` | `project:readPartner` + ownership resolver (team/collaborator) | project discussions, documents, team info, collaboration requests |
| `ORGANIZATIONAL` | `data:viewInternalOrg` + org resolver | internal university/dept notes, capability data |
| `PRIVATE` | `data:viewPrivate` / `evidence:readPrivate` + explicit condition | citizen contact, private evidence, confidential gov notes |

The read projection layer (`BACKEND_ARCHITECTURE.md` §10.3) constructs each projection to *include* only permitted columns — privacy is enforced by **absence from the payload**, never by trusting a client-side filter (`DATABASE_DESIGN.md` §1.5).

---

## 9. Auditability & Accountability

Every authorized consequential action is written to `audit_events` (append-only, DB-trigger-enforced — `DATABASE_DESIGN.md`), capturing the actor, capability, resource, workflow transition, optional AI recommendation link, and reason. This satisfies `Actors_and_roles.md` §23 (AI→human→decision audit) and Principle 7 (auditability). The RBAC layer therefore serves double duty: it *authorizes* an action and it is the *source of the audit subject* — `ctx.user.id + ctx.permissions` is exactly what the audit event records. See `SECURITY_ARCHITECTURE.md` §6 (audit as a security control).

---

## 10. Cross-References

| Concern | Where it lives |
| --- | --- |
| Conceptual permission matrix (this doc's source) | `Actors_and_roles.md` §28 |
| Authorization tuple (role/org/geo/ownership/state) | `Actors_and_roles.md` §19, §27 |
| Data visibility classes | `Actors_and_roles.md` §20 |
| Agent super-admin / gov / faculty / student distinctions | `Actors_and_roles.md` §29–31 |
| AuthN (identity bundle) + AuthZ middleware | `BACKEND_ARCHITECTURE.md` §8 |
| `roles`/`permissions`/`role_permissions`/`user_role_links`/`user_geo_scopes` models | `DATABASE_DESIGN.md` §8.4 |
| Transition action catalogue (every action has a capability) | `API_CONTRACTS.md` §22 |
| Threats mitigated by this matrix | `SECURITY_ARCHITECTURE.md` §2, §5 |

---

## 11. Delivery Checklist

- [ ] All 40+ capabilities from §3 inserted as `Permission` rows
- [ ] `role_permissions` seed reproduces §4 exactly (cell-for-cell), with §6.1 invariants preserved
- [ ] `authorize(capability, resolver)` middleware implemented with closed-whitelist, hard-deny default
- [ ] Resolver chain implements org + geo + ownership + workflow-state gating (§5.2)
- [ ] Transition endpoint maps every action → one capability (§5.4)
- [ ] Super-admin non-decision and validator↔department splits enforced in resolver, not just rows (§4.1/§4.2)
- [ ] Read projections enforce visibility classes (§8)
- [ ] Audit subject sourced from the same identity bundle used for authorization (§9)
- [ ] Status table in `BACKEND_ARCHITECTURE.md` §26 updated to mark this document complete
