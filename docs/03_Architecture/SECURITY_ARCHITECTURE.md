# Nivaaran — Security Architecture

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** Security Architecture
**Status:** Foundational Architecture — Design for Production / Shipping
**Upstream documents:** `Actors_and_roles.md` (§20 data visibility, §24 authN), `BACKEND_ARCHITECTURE.md` (§8 auth, §14 audit, §16 errors, §17 security, §19 failure isolation), `DATABASE_DESIGN.md` (§5.3 challenges/contact, §6.1 evidence, §8.4 RBAC, §10 `user` PII encryption, `audit_events`)

---

## 1. Purpose

This document specifies how Nivaaran secures a government-facing societal data platform. It is the concrete companion to `BACKEND_ARCHITECTURE.md` §17 and the privacy intent of `Actors_and_roles.md` §20. It defines:

* the **threat model** — a STRIDE-style view adapted to this system, scoped to what actually matters at ~100 challenges/day;
* **authentication** — Firebase Auth as identity-only; the server is the sole verifier;
* **authorization** — how the RBAC matrix (`RBAC_MATRIX.md`) becomes a runtime control (recap, with the security lens);
* **PII protection** — encryption at rest for citizen contact data;
* **rate limiting** — per-role, per-endpoint tiers;
* **secrets management** — env → vault for production;
* **transport & web controls** — HTTPS, CORS, CSP, input validation/sanitization;
* **evidence access control** — private evidence behind short-TTL signed URLs;
* **the audit trail as a security control** — not just accountability.

Security posture is **defense in depth**: transport (TLS), identity (Firebase), authorization (server-only RBAC), data-at-rest (encryption), integrity (audit, append-only), and availability (rate limiting, isolation). No single layer is trusted alone.

---

## 2. Threat Model (STRIDE-lite for a government platform)

Scoped and prioritized for this system — it is not a generic catalogue. Threats are rated **Likelihood × Impact** on the government context (citizen trust, legal exposure, operational continuity).

### 2.1 Threat table

| # | Threat (category) | Target | Likelihood | Impact | Primary controls |
| --- | --- | --- | :---: | :---: | --- |
| T1 | Identity spoofing / account takeover (Spoofing) | AuthN | Med | **High** | Firebase Auth, server-side token verify, refresh-token rotation+revocation (§3) |
| T2 | Privilege escalation via forged role claims (Spoofing) | AuthZ | Low | **High** | Never trust client claims; server-only RBAC resolution (§4) |
| T3 | Tamper with workflow state (Tampering) | Challenges/Projects | Med | **High** | Authoritative engine; transitions only; optimistic concurrency; audit (§`RBAC_MATRIX` §7) |
| T4 | Tamper with audit trail (Tampering) | Audit | Low | **High** | Append-only trigger; separate retention (§6) |
| T5 | PII disclosure (Information disclosure) | Citizen data | Med | **High** | Encrypt-at-rest; visibility classes; public-vs-private projections (§5, §8) |
| T6 | Private evidence disclosure (Information disclosure) | Evidence | Med | High | Private bucket; short-TTL signed URLs; pre-signed PUT (§8) |
| T7 | Data breach via DB compromise (Info disclosure) | Whole DB | Low | **High** | PII column encryption ⇒ ciphertext even in a dump (§5.2) |
| T8 | Brute-force / credential stuffing on auth (DoS/Spof) | AuthN | Med | Med | Rate limiting tiers; provider-side throttling (§7.2) |
| T9 | API abuse / resource exhaustion (DoS) | API | Med | Med | Per-route rate limits; payload cap; provider isolation (§7) |
| T10 | XSS via user content (Tampering/Injection) | Frontend | Med | Med | CSP; output encoding; sanitize on render, store as-is (§9.3) |
| T11 | SQL injection (Injection) | DB | Low | **High** | Prisma parameterized queries; no raw interpolation (§9.4) |
| T12 | SSRF via fetch-able refs / AI provider (Spoofing) | Outbound | Low | Med | Provider registry fixes hosts; no user-supplied URLs fetch (§9.5) |
| T13 | Malicious upload (resource poisoning) (Tampering) | Evidence | Med | Med | Type/size allow-list; store private; scan (§8.2) |
| T14 | Repudiation of a consequential decision (Repudiation) | Decisions | Low | High | Audit records actor, role, org, AI link, reason (§6) |
| T15 | Job/queue poisoning via failed workers (Tampering) | Async | Low | Med | Retry/DLQ; `ai_recommendations` append-only; no partial writes (§`AI_ARCHITECTURE` §8) |
| T16 | Data exfiltration via over-scoped API responses (Info disclosure) | API | Med | Med | Projection-based read layer, never whole-row serialization (§8.4) |

### 2.2 Trust boundaries

```text
[Browser] ──TLS──▶ [LB/TLS term] ──▶ [API monolith] ──▶ [Postgres + PostGIS]
   │                    │                    │                │
   │ Firebase Auth      │                [Redis]          [GCS/MinIO]
   [Google identity]    └── trust boundary ◄── all authN/authZ here, never in browser
```

* **The browser is untrusted.** It may render whatever we serve, but it can never assert identity, role, or permission that the server does not independently prove.
* **The API is the authorization boundary.** All identity verification, capability checks, and scoping happen server-side, in one place.
* **Postgres, GCS/MinIO, Redis** are internal; reached only through the API's service layer. PII is encrypted so even a DB-holder cannot read it.

---

## 3. Authentication (identity-only)

From `Actors_and_roles.md` §24 and `BACKEND_ARCHITECTURE.md` §8.1. Firebase Auth is used **strictly for identity** — it never decides authorization, and the server never trusts a client-supplied role.

### 3.1 Flow

1. Client authenticates with **Firebase Auth** (Google/phone/email). It receives a Firebase **ID token** (JWT).
2. Every API request sends `Authorization: Bearer <idToken>`.
3. **`AuthMiddleware`** verifies the token server-side with `firebase-admin` (cached public keys, clock-skew handled — §`BACKEND_ARCHITECTURE` §8.1).
4. The verified `sub` (`firebase_uid`) is joined/upserted into the Postgres `users` row.
5. The middleware loads the **identity bundle** (`user`, `roles[]`, `org`, `geoScopes[]`, `permissions[]` from the RBAC join) and attaches it to the request context — cached in Redis (short TTL).
6. *Only from that bundle* does any downstream authorization decision derive. The client's claimed roles are ignored.

```ts
// middleware/auth.ts (contract)
const { uid } = await firebaseAdmin.verifyIdToken(bearerToken);   // 401 on fail
const user = await authService.loadOrCreateUser(uid);             // 401 if disabled
const bundle = await rbacService.loadIdentityBundle(user.id);     // roles + perms + scopes
req.auth = bundle;                                                // cached in redis, short TTL
```

### 3.2 Session & refresh-token hardening

* **Firebase Auth** manages long-lived sessions; the API-authorizing token is short-lived. On expiry, the client re-issues without re-login (provider SDK).
* Server-side `refresh_tokens` table (`DATABASE_DESIGN.md` §8.5) stores only a **`token_hash`** — never the raw token. It is used for server-coordinated long-lived access (e.g. service/agent accounts, field-app sync) with explicit **revocation**:
  * `revoked_at` on password change / device termination / admin action;
  * rotation on use (old hash invalidated when a new one is minted);
  * expiry enforced (`expires_at`); a `REVOKED` token is `403`, not silent 401.
* **Idempotency on transitions** (`Idempotency-Key`, `BACKEND_ARCHITECTURE.md` §16) prevents harmless double-submit that could otherwise look like replay.

### 3.3 Disabled/denied actors

A user whose roles are removed, whose org is disabled, or who is suspended is **not authorized** even with a valid Firebase token — authorization re-reads the bundle every request (with short cache TTL) and honors `users.status`. Login ≠ access.

---

## 4. Authorization (server-only RBAC)

The complete matrix is in `RBAC_MATRIX.md`. Security-relevant rules restated here because they are the *controls*, not just policy:

* **Closed whitelist, hard deny.** `authorize(capability, resolver)` denies by default; only explicit grants allow. There is no wildcard path.
* **Ownership + scope always.** A grant row only opens a door; the `resolver` still checks organization, geographic scope, resource ownership, and workflow state. Capability ≠ blanket right.
* **Super Admin ≠ decision-maker.** Platform administration does not confer government decision powers (`RBAC_MATRIX.md` §4.1).
* **Validator ≠ department split** is structural — one officer cannot both validate a claim and unilaterally approve its deployment (§`RBAC_MATRIX` §4.2).
* **Fail closed.** Any resolution error, missing scope, or ambiguous state returns **deny** and is logged. There is no `DefaultAllow`.

---

## 5. PII Protection & Encryption at Rest

Citizen contact data (phone, email) and any `PRIVATE` fields are protected in depth. The storage rule, from `DATABASE_DESIGN.md` §5.3:

> *"Phone/email are individually encrypted at the application layer before hitting the DB, so even a DB dump does not expose them."*

### 5.1 What is considered PII

| Field | Class | Handling |
| --- | --- | --- |
| `users.phone` | PRIVATE | individual field encryption |
| `users.email` | PRIVATE | individual field encryption (non-Firebase contact) |
| `users.firebase_uid` | identity key | treated as sensitive; never serialized to public projections |
| `submissions.raw_payload` | participant→private | stored, immutable; never in public read paths |

### 5.2 Field-level encryption design (the "column-dump-proof" control)

| Aspect | Decision |
| --- | --- |
| Primitive | AES-256-GCM per value |
| Key | envelope encryption: a **data-encryption key (DEK)**, itself wrapped by a **key-encryption key (KEK)** held in the secrets manager / KMS |
| Nonce | unique 12-byte IV per value, stored alongside (`ciphertext‖iv‖tag`) |
| Storage shape | each PII column holds `enc:{enc:base64(iv‖tag‖ct)}` marked with cipher metadata + key version |
| Decryption | only the service layer decrypts, for an explicitly authorized subject; decrypted values are never logged, cached long-lived, or placed in projections |
| Key rotation | KEK version bumped → re-encrypt DEKs; old DEK remains readable until ciphertext eagerly re-encrypted; key version column per value |

```text
KEK (KMS / vault)            app can decrypt a value IF it has the uage KEK version
     │ wrap/unwrap
   DEK  (app memory, short-lived)     AES-256-GCM per PII value
     │
   value_pii = enc { DEK, iv ‖ tag ‖ ciphertext("9949…") }
```

Consequences: a DB dump returns **ciphertext**, not phone numbers. Even a full-table exfiltration does not expose PII without the DEK (and the DEK without the KEK).

### 5.3 Data-minimization & retention

* Evidence and submissions store the **minimum** PII needed; `submissions.raw_payload` is the immutable original, but public read models select only what is legally public.
* `audit_events` does **not** copy PII — it stores `payload_snapshot` of *structure/counters*, not citizen contact.
* Data-class access is enforced by the visibility projections (§8.4) and the RBAC private-grant rows (`data:viewPrivate`, `evidence:readPrivate`).

---

## 6. The Audit Trail as a Security Control

`audit_events` (`DATABASE_DESIGN.md` §6.7) is a **security control**, not just accountability:

* **Append-only, enforced by DB trigger** (`trg_audit_append_only`) — the code *cannot* `UPDATE/DELETE` it even by accident or privilege, unless the DBA grants the `nivaaran.allow_audit_edit` escape (kept off in prod).
* **Immutable decisions**: every consequential action writes `{ actor_id, actor_role, actor_org_id, action, resource_type, resource_id, from_state, to_state, human_reason, ai_recommendation_id, request_trace_id }`.
* **Traceability** for regulatory/inquiry lookup: `(resource_type, resource_id, created_at)` index reconstructs one entity's full history; `(actor_id, created_at)` reconstructs a user's full footprint.
* **Retention**: 7 years (`AUDIT_RETENTION_YEARS` in `app_config`), monthly archive-then-truncate, **range-partitioned at ~1M rows** (`DATABASE_DESIGN.md` §9.2) so it stays queryable without unbounded table growth.
* **Dispute resolution / anti-repudiation** (T14): the audit join `Validation.ai_recommendation_id → ai_recommendations` proves *"AI suggested X; human decided Y based on Z"* — the exact evidence an inquiry would demand.

Audit is written **inside the same DB transaction** as the state change + outbox row, so a transition that succeeded is always audited, and an audit row is never orphaned without its transition.

---

## 7. Rate Limiting & Abuse Mitigation

### 7.1 Tiers (per role, per endpoint)

A **tiered** rate limiter (Redis-backed) applies different limits by identity class. Anonymous/public gets the strictest floor; authenticated citizens a realistic ceiling; government and institutional actors higher but still bounded.

| Tier | Applies to | Example limits (per IP/actor per window) |
| --- | --- | --- |
| Public/anonymous | unauthenticated reads | 30 req/min/IP |
| Citizen | authenticated citizens | 240 req/min, burst 5 |
| NGO/PRI/ULB | local actors | 300 req/min |
| Government | validators/depts | 600 req/min |
| Institutional | university/faculty/industry | 600 req/min |
| Administrative | super admin / ops | 900 req/min (but sensitive routes tighter) |
| Auth endpoints | any | strict: 10 req/min/IP per credential attempt |

Constants live in `app_config` (`limits.*`), tunable without deploy.

### 7.2 Specific throttles

| Surface | Rule |
| --- | --- |
| Password / phone auth | provide-side throttling + per-IP attempt cap; exponential backoff on repeat failures |
| Challenge submit | per-actor cap (e.g. N/day) to cap spam and matching load (T9) |
| Evidence upload | per-actor file count + bytes/day; size per file allow-list (T13) |
| AI endpoints | per-actor generation quota (protects provider cost/availability) |
| Transition | per-challenge concurrency against `version` (optimistic lock) |

### 7.3 Abuse signals

Head-of-line floods, single-actor scraping of public feeds, and transition hammering surface in Prometheus (`request rate/latency/errors per route`, `BACKEND_ARCHITECTURE.md` §18) and trigger alerting. A repeated pattern escalates tier or blocks the actor, with an audit record.

---

## 8. Evidence Access Control

Evidence bytes live in **GCS (prod) / MinIO (dev)**, never in Postgres (`DATABASE_DESIGN.md` §6.1 — `challenge_evidence` holds only `storage_ref` pointers). Private evidence is protected end-to-end:

### 8.1 Storage privacy default

* Buckets are **private by default**. No object is world-readable.
* `challenge_evidence.is_private` sets class: public index-thumbnails may be served via CDN for the public feed; anything private is never placed on a URL the public can reach without a signed grant.

### 8.2 Upload (pre-signed PUT)

```text
Client → POST /challenges/:id/evidence            (authorized)
   └─ server validates type + size allow-list      (image/jpeg,png,webp; ≤10MB; video ≤50MB)
   └─ server returns pre-signed PUT URL (short TTL, single object, bound to user+challenge)
Client → PUT bytes directly to storage             (bytes never transit the API)
Client → POST /challenges/:id/evidence/confirm     (record storage_ref, size, mime, is_private)
```
The uploader cannot PUT to arbitrary buckets/keys — the pre-signed PUT is scoped to one object owned by this challenge (SSRF/T13 mitigated).

### 8.3 Download (short-TTL signed URL)

* Public evidence: served through a **signed URL with a short TTL** (e.g. 5 min) so the *pointer* is what's public, not a permanent hotlink, and it can be revoked.
* Private evidence: only `evidence:readPrivate` grantees (with the same resolver scoping) receive a signed URL; **URLs are response-scoped, never persisted**, and expire in seconds-to-minutes.

All signed-URL issuance is **audited** (`action` + `resource_id`), giving an access trail for private evidence.

### 8.4 Projection-based read (anti-overexposure, T16)

The read layer (`BACKEND_ARCHITECTURE.md` §10.3) builds projections that **include** only permitted fields. PII and private evidence columns are physically absent from public/participant projections — the server never *filters then forgets*; it *constructs then serves*. `data:viewPrivate` rows are a narrow, explicit, audited exception.

---

## 9. Transport, Web, & Injection Controls

### 9.1 Transport

HTTPS only; TLS termination at the load balancer. HSTS enforces it. No plaintext to the API from any environment.

### 9.2 CORS & framing

* CORS allow-list = the known client origin(s) only (via `app_config`/env, never `*`).
* `X-Frame-Options: DENY` / CSP `frame-ancestors` to block clickjacking.
* No credentials-bearing cross-origin unless explicitly allowed.

### 9.3 XSS & content

* **CSP** headers restrict script sources (self; trusted CDN allow-list — matching the artifact/UI CSP discipline). No inline `eval` from user data.
* User content is **stored as-is** (preserve evidence) but **encoded on render** by the frontend's framework (React escapes by default — reinforced with explicit sanitization for any `dangerouslySetInnerHTML`).
* Evidence served with correct `Content-Security-Policy`/`Content-Type`; images aren't parsed as HTML (Sniffing headers: `X-Content-Type-Options: nosniff`).

### 9.4 SQL injection

* All queries via **Prisma** (parameterized). Raw migrations/`$queryRaw` never interpolate user input; geo queries bind parameters for geometry ids/values. No string-built SQL (T11).

### 9.5 SSRF & fetch-ability

* The **provider registry** (`AI_ARCHITECTURE.md` §3.2) fixes outbound hosts; no user-supplied URL is ever fetched by the server (T12). Evidence is fetched only from the configured storage host.
* Notification/provider hooks use allow-listed endpoints + shared secrets, never arbitrary webhooks from config that an attacker can influence.

### 9.6 Secrets management

| Environment | Where secrets live | Env-file rule |
| --- | --- | --- |
| Dev | `.env` (git-ignored) + `.env.example` committed with **placeholders only** | never a real secret in repo |
| CI | secrets from the CI secret store, injected at runtime | |
| Staging/Prod | **vault / KMS** (Google Secret Manager or HashiCorp Vault), injected at deploy, rotated | `app_config` holds *non-secret* tunables only (never API keys, DB creds, encryption keys) |

RULE: **No secrets in code; no secrets in `app_config`; no secrets in public artifacts.** If a secret is ever committed, rotate it and treat it as leaked.

---

## 10. Failure & Availability Controls

From `BACKEND_ARCHITECTURE.md` §19 and `AI_ARCHITECTURE.md` §8:

* **AI/notification/provider down** → challenge remains stored and lifecycle-consistent; advisory recovery paths, no data loss (Invariant 10).
* **Redis down** → cache miss only; committed transitions unaffected (queue jobs held, no in-memory-sole transport for durable events).
* **Map/geo down** → GIS endpoints degrade to data-only.
* **DB is the durable source of truth**; Redis is never the only copy of anything that matters.
* **Graceful degradation with fail-closed auth**: if the identity/RBAC cache is unavailable, the middleware falls back to live DB resolution rather than caching deny/allow without verification — a temporary latency increase is acceptable; a wrong allow is not.

---

## 11. Cross-References

| Concern | Where it lives |
| --- | --- |
| Conceptual permission matrix | `RBAC_MATRIX.md` (this doc's enforcement target) |
| AuthN identity bundle + authN middleware | `BACKEND_ARCHITECTURE.md` §8 |
| Authorization tuple | `Actors_and_roles.md` §19, §27 |
| Data visibility classes | `Actors_and_roles.md` §20 |
| Error/problem-object contract | `API_CONTRACTS.md`, `BACKEND_ARCHITECTURE.md` §16 |
| `role_permissions` / `refresh_tokens` / `audit_events` / `user` PII models | `DATABASE_DESIGN.md` §8.4–8.5, §6.7, §5.3 |
| Evidence storage + signed URLs + soft-delete | `DATABASE_DESIGN.md` §6.1, §12 |
| Audit retention & partitioning | `DATABASE_DESIGN.md` §9.2, `BACKEND_ARCHITECTURE.md` §14 |
| Provider isolation for async safety | `AI_ARCHITECTURE.md` §8 |

---

## 12. Delivery Checklist

- [ ] `AuthMiddleware` verifies Firebase tokens server-side; no client role/scope claim ever trusted (§3)
- [ ] Identity bundle cached (short TTL) and re-checked; disabled actors fail closed (§3.3)
- [ ] `authorize()` closed-whitelist with full resolver chain and hard-deny default (§4)
- [ ] PII field encryption (AES-256-GCM, DEK/KEK, key-versioned) in place for `users.phone/email` (§5)
- [ ] Tiered rate limiting live (Redis), perc-actor and per-IP, tunable via `app_config` (§7)
- [ ] Evidence: private bucket default, pre-signed PUT/GET, type/size allow-list, short TTLs, audited issuance (§8)
- [ ] Read projections exclude PII/private columns by construction (§8.4)
- [ ] Audit append-only trigger active; retention + partitioning configured (§6)
- [ ] Secrets in vault/KMS; `app_config` holds zero secrets; `.env.example` placeholders (§9.6)
- [ ] TLS/HSTS, locked CORS, CSP/nosniff set (§9)
- [ ] Status table in `BACKEND_ARCHITECTURE.md` §26 updated to mark this document complete