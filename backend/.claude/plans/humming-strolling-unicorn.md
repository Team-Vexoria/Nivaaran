# Plan: Next Phase After P0 (BE-001…BE-010)
Context: Phase 0 complete. User "do whatever docs tell you" in plan mode.
Approach: BE-020/021 identity, BE-022/023 challenge (geo + outbox), BE-024 project, wire app.ts, verify DB.
Critical files: src/modules/identity/controller|service|repo; src/modules/challenge/controller|service; src/modules/project/controller|service; src/app.ts; src/core/auth.ts (authorize fix).
Verification: compile + DB query + endpoint hits.
