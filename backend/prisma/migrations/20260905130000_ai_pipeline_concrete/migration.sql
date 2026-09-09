-- NIVAARAN AI pipeline — concrete persistence (SIH 26043 Wave 0 T0.2)
--  Covers every Prisma model/field added after 20260903120000_init that is
--  not already covered by 20260905000000_model_version.
--
--  Added since init:
--    * model DedupRecord
--    * Challenge columns: vision_result, research_result, dedup_status, duplicate_of, citizen_report_count
--    * enum AiKind value RESEARCH
--    * enum ValidationDecision value FAKE_REJECTED
--  All statements are idempotent so the migration is safe to replay after a
--  manual `prisma db push` in local dev.

-- ── AiKind.RESEARCH (added after init) ─────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'RESEARCH'
      AND enumtypid = 'AiKind'::regtype
  ) THEN
    ALTER TYPE "AiKind" ADD VALUE 'RESEARCH';
  END IF;
END $$;

-- ── ValidationDecision.FAKE_REJECTED (added after init) ────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'FAKE_REJECTED'
      AND enumtypid = 'ValidationDecision'::regtype
  ) THEN
    ALTER TYPE "ValidationDecision" ADD VALUE 'FAKE_REJECTED';
  END IF;
END $$;

-- ── Challenge: pipeline columns ────────────────────────────────────────────
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "vision_result"        JSONB;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "research_result"      JSONB;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "dedup_status"         TEXT;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "duplicate_of"         TEXT;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "citizen_report_count" INTEGER NOT NULL DEFAULT 1;

-- ── DedupRecord table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "DedupRecord" (
  "id"           TEXT NOT NULL,
  "hash"         TEXT NOT NULL,
  "challenge_id" TEXT NOT NULL,
  "district"     TEXT,
  "lat"          DOUBLE PRECISION,
  "lng"          DOUBLE PRECISION,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DedupRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DedupRecord_hash_key" ON "DedupRecord"("hash");
CREATE INDEX IF NOT EXISTS "DedupRecord_hash_idx"              ON "DedupRecord"("hash");
CREATE INDEX IF NOT EXISTS "DedupRecord_district_created_at_idx" ON "DedupRecord"("district", "created_at");
