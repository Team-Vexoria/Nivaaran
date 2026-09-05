# Nivaaran — AI Architecture

**Project:** Nivaaran — Smart Societal Innovation Platform
**Problem Statement:** SIH 26043
**Document:** AI Architecture
**Status:** Foundational Architecture — Design for Production / Shipping
**Upstream documents:** `System_architecture.md` (§10 AI, §22 provider isolation, §37.3 human-oversight, §37.4 explainability), `BACKEND_ARCHITECTURE.md` (§9 AI Service Boundary, §15 Async), `DATABASE_DESIGN.md` (§6.2 `ai_recommendations`, §8.1 enums)

---

## 1. Purpose

This document specifies how **artificial intelligence** participates in the Nivaaran challenge lifecycle. It turns the high-level service boundary from `BACKEND_ARCHITECTURE.md` §9 into a concrete, ship-able design:

* the **`AIProvider` interface** — the single contract every AI capability meets;
* the **concrete MVP providers** — honest server-side re-implementations of the existing frontend engines (`aiTriageEngine`, `heiMatchingEngine`, `aiVisionClassifier`, `deduplicationService`) running over the *real* database;
* the **recommendation → human decision → state** contract (Invariant 2);
* **model versioning and confidence thresholds** — how a recommendation earns the right to be acted on;
* the **`ai_recommendations` table contract** — what is persisted, and why AI output never shares a column with a human decision;
* how AI sits on the **async job layer** (BullMQ) without corrupting the business lifecycle when a model or provider fails (Invariant 10).

The one rule inherited from every upstream doc and restated here so it can never be missed:

> **AI recommends. Humans decide. The backend records both.**
> `BACKEND_ARCHITECTURE.md` §2.2(3) — *"AI recommends; humans decide. Consequential transitions require an authorized human decision."*

AI never mutates challenge state directly. AI produces a **recommendation row**; an authorized human actor turns that recommendation into a **workflow transition**; the engine records the audit trace that joins the two. Every downstream design decision in this document flows from that separation.

---

## 2. Design Principles

1. **Recommendation ≠ decision.** AI output is stored in `ai_recommendations`, never merged into a human decision field. A human override is a *new* audited event (`DATABASE_DESIGN.md` §6.2, `BACKEND_ARCHITECTURE.md` §9.2).
2. **Deterministic by default, generative when useful.** The MVP ships a *deterministic* scoring stack (port of the frontend heuristics) so behavior is reproducible and explainable; an optional LLM/vision provider augments it when an API key is present. Determinism is the floor, not the ceiling.
3. **Explainable, always.** Every recommendation carries `reasons` and `confidence`. A human must be able to see *why* AI scored a challenge the way it did before deciding (`System_architecture.md` §37.4).
4. **Provider-isolated and swappable.** All calls go through a provider registry keyed by config, killing provider lock-in (`System_architecture.md` §22, `BACKEND_ARCHITECTURE.md` §9.1).
5. **Failures are contained.** A down model or a timed-out LLM never blocks, corrupts, or blocks on the challenge row (`BACKEND_ARCHITECTURE.md` §9.3, §19).
6. **Auditable and versioned.** Every recommendation pins its `model_version`; re-runs append and link via `superseded_by_id` instead of overwriting (`DATABASE_DESIGN.md` §6.2).
7. **Honest about the demo.** The seed pipeline runs the *same* provider code over real data — the demo is not faking intelligence with a hardcoded frontend constant (`BACKEND_ARCHITECTURE.md` §9.1).

---

## 3. The `AIProvider` Interface

The interface is the **AI boundary module**'s single public contract. Concrete providers implement it; the rest of the platform depends only on the interface and the provider registry.

### 3.1 Method contract

```text
AIProvider (interface)
  understand(input) → { summary, domain, subDomain, tags, entities, severity, urgency, confidence, reasons }
  embed(text)       → EmbeddingVector
  similarity(a, b)  → { score, reasons }
  prioritize(c)     → { score, factors[], reasons, confidence }
  match(c, heis)    → RankedUniversity[]      // each: { heiId, score, reasons[] }
```

| Method | Purpose | Lifecycle stage it feeds | `ai_recommendations.kind` |
| --- | --- | --- | --- |
| `understand` | Open-domain classification: identify what a reported challenge *is* | AI Understanding → Validation input | `UNDERSTAND` |
| `embed` | Produce a dense text vector for semantic dedup | Dedup | *(internal; feeds `SIMILARITY`)* |
| `similarity` | Compare a candidate report against existing challenges/clusters | Dedup / Clustering | `SIMILARITY` |
| `prioritize` | Score a validated challenge 0–100 across 5 factors | Prioritization | `PRIORITIZE` |
| `match` | Rank universities (HEIs) capable of a challenge | Matching | `MATCH` |
| *(vision, boundary-adjacent)* | Evidence image hazard classification | AI Understanding (evidence) | `VISION` |

The interface deliberately does **not** expose a catch-all `classify()` or a `predict(x)`. Each method maps to exactly one lifecycle concern and one `AiKind`, which keeps the `ai_recommendations` table's `kind` column a clean foreign key onto *intent* rather than a free-text label.

### 3.2 Provider registry & configuration

```text
provider registry (app_config keyed)
  "ai.theme.understand"  → provider id     # e.g. "nivaaran-deterministic"
  "ai.theme.embed"       → provider id     # e.g. "nivaaran-local-tfidf"
  "ai.theme.prioritize"  → provider id
  "ai.theme.match"       → provider id
  "ai.theme.vision"      → provider id     # "none" until key present
```

* The registry is read from `app_config` (`DATABASE_DESIGN.md` — config-as-data), so swapping a provider is a **config change, not a deploy**.
* A provider that is unavailable or unconfigured returns `null` / throws `ProviderUnavailable`; the caller treats that as a *no-recommendation* outcome, never a failure of the lifecycle (see §8).
* This is the same isolation discipline as the storage (`BACKEND_ARCHITECTURE.md` §3) and notification providers — a pattern the platform applies uniformly.

---

## 4. MVP Providers: an honest re-implementation

The demo must be honest per Principle 7. The existing frontend already has four working "AI" engines. None of them touch real server data today — they run on hardcoded arrays in the browser. The MVP's job is to **re-implement the same deterministic logic server-side**, operating on the real `challenges`, `universities`/`departments`, and `district` tables, and expose it through `AIProvider`. This gives the demo *real* recommendations over *real* data, with the architecture in place to upgrade model quality later without touching callers.

| Frontend engine (today) | Server-side provider it becomes | Real data it consumes |
| --- | --- | --- |
| `aiTriageEngine.ts` — 60-domain taxonomy classifier + 5-factor priority scorer | `understand` + `prioritize` | `challenges.title/description`, `GOV_DOMAINS` taxonomy (moved to a seeded `domain_taxonomy` reference) |
| `heiMatchingEngine.ts` — 4-factor HEI match scorer | `match` | `universities` + `theirs departments`/`capabilities`/`labs` (now DB-backed) |
| `aiVisionClassifier.ts` — canvas pixel/edge heuristic | `VISION` (deterministic fallback) | `challenge_evidence.storage_ref` images (server-side downscale) |
| `deduplicationService.ts` — trigram + tag overlap | `embed` + `similarity` | `pg_trgm` GIN indexes + `ai_tags` (`DATABASE_DESIGN.md` §9.1) |

Key detail — **don't port the code, port the logic.** The frontend engines are browser-bound:

* `aiVisionClassifier` uses the HTML `<canvas>` API — the server has no DOM. The port runs a server-side image downscale (sharp/sharpie) and computes the same color/edge heuristics, or routes to a vision provider when configured.
* `aiTriageEngine` reads `import.meta.env.VITE_GEMINI_API_KEY` from the browser — the server reads the key from secrets/`app_config` and never exposes it to clients.
* `domainTaxonomy.ts` (60 `GOV_DOMAINS`) becomes a **seeded reference table** so the taxonomy is data, editable without redeploys, and queryable by the audit trace (`which domain rule fired?`).

Where the LLM calls in the frontend used a **client-side API key**, the server provider uses the **server-side key** through a validated provider wrapper — the key is never shipped to, or accepted from, a browser.

### 4.1 The deterministic `understand` port

The 60-domain classifier (`classifyCategoryNLP`) scores a report against every `GOV_DOMAIN`:

* specific-`problems` phrase matches → `+4` each;
* `keywords` matches → `+1` each;
* highest-scoring domain wins; confidence mapped from the raw score (`98` for ≥4, `93` for ≥2, `88` for ≥1);
* **zero-default rule** preserved — no forced index-0 fallback on no match; instead a low-confidence `custom_extracted` domain with `needsHumanVerification = true`.

This behavior is preserved verbatim in the server: it is the *requires human review* signal that feeds the validation queue.

### 4.2 The deterministic `prioritize` port

The 5-factor weighted regressor is preserved as `PriorityFactors`:

| Factor | Max | Note |
| --- | --- | --- |
| populationImpact | 25 | category/mention-keyword driven |
| infraCriticality | 25 | infrastructure asset criticality |
| hazardUrgency | 25 | safety/health severity velocity |
| communityUpvotes | 15 | `min(15, 5 + floor(upvotes*0.5))` |
| spatialRecurrence | 10 | district GIS recurrence layer |

`priorityScore = min(100, Σ)`; `riskLevel` from the total (`CRITICAL ≥85`, `HIGH ≥70`, `MEDIUM ≥50`, else `STANDARD`). The one change on the server: `communityUpvotes` and `spatialRecurrence` are **read from the database** (upvote counts, GIS recurrence aggregation) rather than passed in from the browser — the engine becomes a true server-side scorer.

### 4.3 The deterministic `match` port

The 4-factor HEI matcher (`departmentFit 40%` / `labFit 30%` / `proximity 20%` / `academic 10%`) is preserved, but its input universities come from the real `universities` + `departments` tables (the 30-institution Jharkhand dataset is seeded there) instead of the frontend constant `JHARKHAND_UNIVERSITIES`. It returns a ranked list capped at `min(98, …)` per institution, sorted descending — exactly the ordering the University intake screen already expects (`UniversityIntakeTab.tsx` uses `calculateHEIMatchScore`).

### 4.4 When to upgrade beyond deterministic

The deterministic stack is the MVP default because it is **reproducible, fast, free, and fully explainable** — the right properties for a government demo. An upgrade path exists for three spots:

| Spot | Upgrade | Enablement |
| --- | --- | --- |
| `understand` (ambiguous reports) | LLM few-shot classification over the 60-domain taxonomy | provider key present |
| `VISION` (evidence image) | hosted vision model (e.g. Gemini 1.5 Flash) | provider key present |
| `similarity` (semantic dedup) | embedding model on `embed(...)` + vector similarity | model configured |

Because every consumer depends on `AIProvider`, not on the deterministic implementation, any of these can be switched behind the registry with zero caller changes. The downgrade path is equally clean: key removed → deterministic fallback resumes. The `model_version` column records which path produced each recommendation.

---

## 5. Recommendation → Human Decision → State

This is the heart of the architecture, and it is identical whether the provider is deterministic or a live LLM. It is `BACKEND_ARCHITECTURE.md` §9.2 made precise:

```text
┌──────────────┐   enqueue job (BullMQ)      ┌──────────────────┐
│ new challenge │ ───────────────────────────▶ │ AI worker        │
│ staged        │                             │ runs understand /│
└──────────────┘                              │  embed / vision  │
                                              └────────┬─────────┘
                                                       │ writes row
                                              ┌────────▼─────────┐
                                              │ ai_recommendations│  kind=UNDERSTAND
                                              │ (SUCCEEDED)       │  result, confidence,
                                              └────────┬─────────┘  reasons, model_version
                                                       │
                                              ┌────────▼─────────┐
                                              │ Human reviews     │  gov_validator opens
                                              │ the challenge     │  challenge w/ rec shown
                                              └────────┬─────────┘
                                                       │ accept / modify / reject
                                              ┌────────▼─────────┐
                                              │ LESSON validation │  transition
                                              │ service → engine  │  challenge:validate
                                              └────────┬─────────┘
                                                       │ one DB transaction
                                              ┌────────▼─────────┐
                                              │ audit_events +    │  links decision →
                                              │ outbox_events      │  ai_recommendation_id
                                              └────────┬─────────┘
                                                       │ poller drains
                                                       ▼ (notifications, next job)
```

### 5.1 The human decision is a *transition*, not a column edit

When a validator accepts, modifies, or rejects a recommendation, the application code **never writes a decision column**. It calls the workflow engine's single transition endpoint (`POST /api/challenges/:id/transition`, action `challenge:validate`) with the human's `decision`, `reason`, and the `aiRecommendationId` it relied on. The engine:

1. **validates** the transition is legal from the current state (transition registry, `Complete_workflow.md` §22);
2. **authorizes** the actor (role + geo scope + ownership, `RBAC_MATRIX.md`);
3. **carries optimistic concurrency** (`If-Match: version`, `409` on mismatch);
4. **writes** the `Validation` row (with `ai_recommendation_id`), the challenge state change, the **`audit_events` row**, and the **`outbox_events` row** in **one transaction** (`DATABASE_DESIGN.md` §6.3, §6.6).

The `Validation.decision` is a *new* row each time — a challenge accumulates many `Validation` rows over its life, so a DEFER long after a VALID is history preserved per-row, never per-column (`DATABASE_DESIGN.md` §6.3).

### 5.2 The audit trace is a first-class join

```sql
-- reconstruct: "for this human decision, what did AI recommend, with what model & confidence?"
SELECT  v.decision, v.reason,
        r.kind, r.confidence, r.reasons, r.model_version
FROM    validations v
JOIN    ai_recommendations r ON r.id = v.ai_recommendation_id
WHERE   v.challenge_id = $1;
```

This is the structural satisfaction of Invariant 2 (`Complete_workflow.md` §33): the human decision and the AI input that informed it are *joined*, never *merged*. `audit_events.ai_recommendation_id → ai_recommendations.id` is the same trace at event level.

### 5.3 A human override is a fresh event, not an edit

If `AI said priority=HIGH` and the validator disagrees and sets `MEDIUM`, the engineer does **not** mutate the `ai_recommendations` row (append-only). A *new* `Validation` decision is recorded, and the challenge carries the human's value going forward. The AI value is still queryable for the audit — and for the metric *"how often do humans override AI, and why?"*, which is exactly the operational signal you want from a recommendation system.

---

## 6. Confidence Thresholds & Enforcements

Confidence is a `Decimal(4,2)` (0.00–0.99) on `ai_recommendations`. Thresholds are **policy data (seed config), not code**, so they can be tuned by the department without a deploy:

| Policy key | Default | Meaning |
| --- | --- | --- |
| `ai.threshold.autoSuggest` | `0.85` | Above this, the recommendation is shown to the reviewer pre-filled as a strong suggestion |
| `ai.threshold.autoAct` | `0.97` | (Reserved) above this, a *permitted* auto-transition may apply — **disabled by default; never for consequential stages** |
| `ai.threshold.humanReview` | `< 0.85` | Below this, the challenge is flagged `needs_human_verification` and routed to the District Officer queue (`aiTriageEngine` already sets `needsHumanVerification` for `<85` exact-match or custom-extracted) |
| `ai.threshold.noDecision` | `< 0.5` | Recommendation is advisory only; shown as context but never as a suggestion |

Derived rules:

1. **Consequential transitions (validation, final prioritization, institution allocation) always require a human.** There is **no** auto-transition in the MVP, regardless of confidence (`BACKEND_ARCHITECTURE.md` §9.2).
2. **Low confidence must not silence the report.** A low-confidence classification still stores a recommendation with `needs_human_verification=true`; the challenge proceeds to the human queue. The report is never dropped because AI was unsure.
3. **Confidence is a gate on *presentation*, not on *survival*.** High confidence shapes a form; low confidence routes to review. Nothing is discarded.

---

## 7. The `ai_recommendations` Table Contract

Full model in `DATABASE_DESIGN.md` §6.2. The contract restated for the AI layer:

```prisma
model AiRecommendation {
  id            String    @id @default(uuid())
  challenge_id  String
  kind          AiKind                     // UNDERSTAND | SIMILARITY | PRIORITIZE | MATCH | VISION
  status        AiStatus  @default(PENDING) // PENDING | RUNNING | SUCCEEDED | FAILED | RETRYABLE

  result        Json?                      // per-kind payload — AI output, never a decision
  confidence    Decimal?  @db.Decimal(4,2) // 0.00–0.99
  reasons       Json?                      // human-readable reasons list
  model_version String                     // pinned model + version, e.g. "deterministic-triage@1.4"

  superseded_by_id String? @unique         // re-run links to its successor (self-ref trace)
  error_message String?
  attempt_count Int      @default(0)
  completed_at  DateTime?
  created_at    DateTime  @default(now())

  challenge   Challenge @relation(fields: [challenge_id], references: [id])
  validation  Validation?                  // the human decision that used this rec (≤1)
  audit_events AuditEvent[]
}
```

### 7.1 Per-kind `result` payload shapes

| `kind` | `result` shape |
| --- | --- |
| `UNDERSTAND` | `{ domain, domainCode, subDomain?, matchedProblem?, severity, urgency, entities[], tags[] }` |
| `SIMILARITY` | `{ nearDuplicates: [{ challengeId, score, reason }], suggestedClusterLabel? }` |
| `PRIORITIZE` | `{ priorityScore, riskLevel, factors: { name, score, max, reason }[] }` |
| `MATCH` | `{ ranked: [{ universityId, score, departmentId?, reasons[] }] }` |
| `VISION` | `{ visualCategory, categoryCode, visionConfidence, detectedFeatures[], visualDescription }` |

Every payload is exactly what the frontend already renders — the University intake table (`UniversityIntakeTab.tsx`), the triage result card, the vision evidence panel — so the API migration is a straight swap from hardcoded arrays to server responses (see the migration mapping in `API_CONTRACTS.md`).

### 7.2 Append-only and self-superseding

* **Never mutated** once `SUCCEEDED`/`FAILED` (Principle 6). A re-run (e.g. a new upvote changes the prioritize score) inserts a **new** row whose `superseded_by_id` points back to the stale one. The chain is traversable: `r → r.superseded_by_id → next`.
* The readable rec for a challenge/kind is the **latest in the supersession chain** — resolved by `WHERE challenge_id=$1 AND kind=$2 AND superseded_by_id IS NULL` (the head of the chain).
* `status` is the one mutable field (a `PENDING` → `RUNNING` → `SUCCEEDED` progression, or `FAILED`/`RETRYABLE`), so a worker can claim and retry safely.

---

## 8. AI on the Async Job Layer (BullMQ)

AI never runs inline in a request handler for expensive work. The pattern is `BACKEND_ARCHITECTURE.md` §15: *request → enqueue → 202 → worker → persists result → emits event*.

### 8.1 Job contracts

| Queue | Job | Input | Output (writes) |
| --- | --- | --- | --- |
| `ai.understand` | classify a new/staged challenge | `challengeId`, title, description, evidence refs | `AiRecommendation(kind=UNDERSTAND[, VISION])` |
| `ai.embed` | index a challenge for dedup | `challengeId` | embedding + `ai_tags`; refresh `SIMILARITY` index |
| `ai.dedup` | compare a report to the index | `challengeId` | `AiRecommendation(kind=SIMILARITY)` → cluster suggestion |
| `ai.prioritize` | rescore on upvote / validation | `challengeId` | `AiRecommendation(kind=PRIORITIZE)`; supersedes prior |
| `ai.match` | rank HEIs after validation | `challengeId` | `AiRecommendation(kind=MATCH)` |

Shared workers consume from the **same monolith service layer**, so business rules are identical whether a call is sync or async (`BACKEND_ARCHITECTURE.md` §15). A worker is just an adapter that pulls a job, invokes `AIProvider`, and calls the same persistence service a realtime endpoint would.

### 8.2 Retry, backoff, and the dead-letter queue

* **exponential backoff** with jitter per provider (e.g. `[1s, 2s, 4s, 8s, 16s, 32s]`, capped);
* **`attempt_count`** persists across retries on the `AiRecommendation` row for observability;
* after max attempts, the job goes to the **dead-letter queue** (DLQ) for manual inspection — *not* silently dropped;
* **timeouts** per provider call (an LLM call has a hard wall-clock cap; a hung provider must not hold a job forever). AI calls get their own OpenTelemetry span so provider timeouts are visible (`BACKEND_ARCHITECTURE.md` §18).

### 8.3 Failure isolation contract (Invariant 10)

| Failure | Behavior |
| --- | --- |
| Provider returns `null` / unsupported (no key) | `AiRecommendation(status=FAILED, error_message="provider not configured")`; challenge proceeds to human review without AI |
| Provider times out | job retried with backoff; `status=RETRYABLE`; challenge row untouched |
| Provider crashes / 5xx on every attempt | job → DLQ after max attempts; `status=FAILED`; **a human can still proceed where the workflow permits** — AI is advisory, never a blocker |
| A down AI during validation | the challenge remains stored and reviewable; the reviewer simply sees "no AI recommendation" context |

The key invariant: **a failed AI job never corrupts the challenge row or blocks its lifecycle.** This is the direct realization of `BACKEND_ARCHITECTURE.md` §9.3 and the `System_architecture.md` §37.10 anti-pattern (AI must not be a hard dependency of the business flow).

### 8.4 Why recommendations never ride the critical path

A submission is staged as a `challenge` regardless of AI. The enqueued `ai.understand` job improves the *context* a reviewer sees. If the worker is 10 minutes behind, the challenge is still in `VALIDATION_PENDING` — just without the AI summary yet. This decoupling is what makes AI safe to add, remove, or swap without touching the workflow engine.

---

## 9. Model Versioning

Every `AiRecommendation` pins a **`model_version`** string so the audit can always answer *"which model produced this recommendation?"* Naming convention:

```text
<provider-family>@<semver>
  e.g.  deterministic-triage@1.4     # understand + prioritize port
        deterministic-hei@1.2        # match port
        deterministic-vision@1.0     # vision heuristic
        deterministic-dedup@1.3      # embed + similarity
        gemini-vision@1.5-flash      # when the LLM/vision provider is enabled
```

Rules:

1. **Version is written at creation time**, not resolved at read time, so a later registry change *cannot* retroactively rewrite history.
2. **A registry/config change that alters behavior bumps the version.** Deterministic logic changes (a matured taxonomy, a rebalanced factor weight) are version bumps, recorded as data (`app_config`), and audited.
3. **Aggregate metrics can compare versions** — *"did `prioritize@1.4` reduce human overrides vs `@1.3`?"* — because each row carries its provenance.

---

## 10. Observability & Governance

### 10.1 Metrics (in addition to `BACKEND_ARCHITECTURE.md` §18)

| Metric | Meaning |
| --- | --- |
| `ai_recommendations_total{kind,status}` | throughput by kind and outcome |
| `ai_recommendation_duration{kind}` | provider latency (per OpenTelemetry span) |
| `ai_provider_failures{provider}` | failures/retries by provider |
| `ai_human_override_rate{kind}` | fraction of decisions that diverge from the recommendation — the single most important quality signal |
| `ai_low_confidence_rate` | share of reports needing human verification |

### 10.2 Explainability as a product feature

Because `reasons` is a first-class column and every payload is rendered, the reviewer UI shows *why*: "priority 86 (HIGH) — population impact (24/25): school & hospital mentions; hazard urgency (24/25): sanitation hazard." This is `System_architecture.md` §37.4 made concrete — a reviewer can challenge the reasoning, not just accept a number.

### 10.3 Human-in-the-loop guarantee

There is **no code path** that lets a recommendation advance a challenge through a consequential stage without an authorized human `Validation`. The transition registry (`Complete_workflow.md` §22, `BACKEND_ARCHITECTURE.md` §6.3) simply has no mapping from `ai_recommendation` rows to state changes; state changes only come from actor-issued transitions. This is enforced in the engine, not by convention.

---

## 11. Cross-References

| Concern | Where it lives |
| --- | --- |
| AI service boundary & provider interface | `BACKEND_ARCHITECTURE.md` §9 |
| `ai_recommendations` / `validations` / `AiKind` / `AiStatus` models | `DATABASE_DESIGN.md` §6.2–6.3, §8.1 |
| The lifecycle stages AI feeds | `Complete_workflow.md` §22 |
| Invariant 2 (AI vs human decision) & Invariant 10 (failure isolation) | `Complete_workflow.md` §33 |
| Who may act on a recommendation | `RBAC_MATRIX.md` (validation, matching decisions) |
| AI endpoint contracts (`/api/ai/*`) | `API_CONTRACTS.md` |
| Async job layer (BullMQ) | `BACKEND_ARCHITECTURE.md` §15 |
| Provider isolation anti-pattern | `System_architecture.md` §22, §37.10 |

---

## 12. Delivery Checklist

- [ ] `AIProvider` interface + provider registry (config-driven) implemented in the AI boundary module
- [ ] Six providers shipped: understand, embed, similarity, prioritize, match, vision (deterministic ports first)
- [ ] `domainTaxonomy.ts` (60 `GOV_DOMAINS`) migrated to a seeded reference table
- [ ] 30-institution Jharkhand dataset seeded into `universities`/`departments` (replacing frontend constant)
- [ ] BullMQ queues for all five AI job kinds, with backoff + DLQ + `attempt_count`
- [ ] Threshold policy keys (`ai.threshold.*`) seeded into `app_config`
- [ ] `ai_recommendations` append-only + supersede chain honored by the persistence service
- [ ] Human decision → transition path fully functional with `ai_recommendation_id` audit join
- [ ] `ai_human_override_rate` + provider-failure metrics wired to Prometheus
- [ ] Status table in `BACKEND_ARCHITECTURE.md` §26 updated to mark this document complete
