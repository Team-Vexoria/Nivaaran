-- CreateExtension (PostGIS — must exist before any geometry column is created)
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'COMMUNITY_NGO', 'PRI', 'ULB', 'GOV_VALIDATOR', 'GOV_DEPARTMENT', 'UNIVERSITY', 'FACULTY', 'STUDENT', 'INDUSTRY', 'CSR', 'LAB', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('UNIVERSITY', 'GOVT_DEPARTMENT', 'GOVT_BODY', 'COMPANY', 'CSR', 'LAB', 'NGO', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "GeoScopeType" AS ENUM ('STATE', 'DISTRICT', 'BLOCK', 'PANCHAYAT');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('SUBMITTED', 'AI_UNDERSTANDING', 'CLARIFICATION_REQUESTED', 'VALIDATION_PENDING', 'VALIDATED', 'DEFERRED', 'REJECTED', 'CLUSTERED', 'PRIORITY_RANKED', 'MATCHING', 'UNIVERSITY_ACCEPTED', 'UNIVERSITY_DECLINED', 'TEAM_FORMING', 'PROPOSAL_REVIEW', 'COLLABORATION', 'PROTOTYPE', 'PILOT', 'PROJECT_VALIDATION', 'DEPLOYMENT_APPROVED', 'IMPACT_MEASUREMENT', 'CLOSED', 'FAILED', 'STALLED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROPOSAL_REVIEW', 'TEAM_FORMING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT', 'TELEMETRY', 'GEOTAG');

-- CreateEnum
CREATE TYPE "ValidationDecision" AS ENUM ('VALID', 'NEEDS_CLARIFICATION', 'INVALID', 'DEFER');

-- CreateEnum
CREATE TYPE "ClusterProcessState" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiKind" AS ENUM ('UNDERSTAND', 'SIMILARITY', 'PRIORITIZE', 'MATCH', 'VISION');

-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'RETRYABLE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('OPEN', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('SUBMIT', 'AI_UNDERSTAND', 'REQUEST_CLARIFICATION', 'SUPPLY_CLARIFICATION', 'VALIDATE', 'INVALIDATE', 'DEFER', 'RECLUSTER', 'PRIORITIZE', 'MATCH', 'ACCEPT', 'DECLINE', 'FORM_TEAM', 'SUBMIT_PROPOSAL', 'APPROVE_PROPOSAL', 'REQUEST_REVISION', 'START_COLLABORATION', 'START_PROTOTYPE', 'START_PILOT', 'VERIFY_VALIDATION', 'APPROVE_DEPLOYMENT', 'RECORD_IMPACT', 'CLOSE', 'ESCALATE', 'RESOLVE', 'UNAUTHORIZED_ATTEMPT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CHALLENGE_SUBMITTED', 'AI_COMPLETED', 'CLARIFICATION_REQUESTED', 'VALIDATED', 'PRIORITY_CHANGED', 'UNIVERSITY_MATCHED', 'UNIVERSITY_ACCEPTED', 'UNIVERSITY_DECLINED', 'TEAM_FORMED', 'PROPOSAL_SUBMITTED', 'COLLABORATION_REQUESTED', 'COLLABORATION_ACCEPTED', 'MILESTONE_APPROACHING', 'MILESTONE_OVERDUE', 'PILOT_STARTED', 'PILOT_COMPLETED', 'VALIDATION_COMPLETED', 'DEPLOYMENT_APPROVED', 'IMPACT_VERIFIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationDeliveryState" AS ENUM ('PENDING', 'QUEUED', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "avatar_url" TEXT,
    "language_pref" TEXT NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "short_code" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "contact_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "established_year" INTEGER,
    "naac_grade" TEXT,
    "accreditation" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "facilities" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "focus_area" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sub_category" TEXT,
    "district_code" TEXT NOT NULL,
    "block_code" TEXT,
    "location" geometry(Point,4326),
    "area_panchayat" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'SUBMITTED',
    "priority_score" DECIMAL(4,2),
    "priority_factors" JSONB,
    "ai_summary" TEXT,
    "ai_domain" TEXT,
    "ai_sub_domain" TEXT,
    "ai_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_severity" TEXT,
    "ai_urgency" TEXT,
    "ai_confidence" DECIMAL(4,2),
    "clarification_request" JSONB,
    "clarification_response" JSONB,
    "submitter_id" TEXT NOT NULL,
    "submitter_type" "UserRole" NOT NULL,
    "assigned_org_id" TEXT,
    "reviewer_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transitioned_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'web',
    "raw_payload" JSONB NOT NULL,
    "attachments" JSONB,
    "submitted_via_agent" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeEvidence" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "storage_ref" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "meta" JSONB,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "uploader_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRecommendation" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "kind" "AiKind" NOT NULL,
    "status" "AiStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "confidence" DECIMAL(4,2),
    "reasons" JSONB,
    "model_version" TEXT NOT NULL,
    "superseded_by_id" TEXT,
    "error_message" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "decision" "ValidationDecision" NOT NULL,
    "reason" TEXT,
    "supporting_note" TEXT,
    "ai_recommendation_id" TEXT,
    "clarification_requested" JSONB,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cluster" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "state" "ClusterProcessState" NOT NULL DEFAULT 'QUEUED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClusterMember" (
    "id" TEXT NOT NULL,
    "cluster_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "similarity" DECIMAL(5,4),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClusterMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityAcceptance" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "decided_by" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PROPOSAL_REVIEW',
    "team_lead_id" TEXT,
    "proposal_title" TEXT,
    "proposal_abstract" TEXT,
    "proposal_doc_ref" TEXT,
    "courses_credits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_mentor" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "submitter_id" TEXT NOT NULL,
    "doc_ref" TEXT,
    "title" TEXT NOT NULL,
    "content_md" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "reviewer_id" TEXT,
    "review_notes" JSONB,
    "revision_request" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deliverable" TEXT,
    "due_at" TIMESTAMP(3) NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "evidence_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "offering_org_id" TEXT NOT NULL,
    "need" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "acceptance_needed" BOOLEAN NOT NULL DEFAULT false,
    "status" "OfferStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "collaboration_id" TEXT NOT NULL,
    "offered_by_org" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "in_kind" JSONB,
    "terms" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'OPEN',
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilot" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "university_id" TEXT,
    "location" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "scope" TEXT,
    "metrics" JSONB,
    "evidence_ref" TEXT,
    "is_success" BOOLEAN,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "approval_ref" TEXT,
    "district_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactRecord" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "metric_name" TEXT NOT NULL,
    "metric_group" TEXT,
    "before_value" DECIMAL(14,2),
    "after_value" DECIMAL(14,2),
    "units" TEXT,
    "beneficiaries" INTEGER,
    "evidence_ref" TEXT,
    "recorded_by" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" "UserRole",
    "actor_org_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "from_state" TEXT,
    "to_state" TEXT,
    "payload_snapshot" JSONB,
    "human_reason" TEXT,
    "ai_recommendation_id" TEXT,
    "request_trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "dispatch_trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched_at" TIMESTAMP(3),

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppNotification" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "delivery_state" "NotificationDeliveryState" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "audit_event_id" TEXT,
    "read_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "UserRole" NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "role_name" "UserRole" NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleLink" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_name" "UserRole" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGeoScope" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scope_type" "GeoScopeType" NOT NULL,
    "district_code" TEXT,
    "block_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGeoScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeComment" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "District" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state_code" TEXT NOT NULL DEFAULT 'JH',
    "boundary" geometry(MultiPolygon,4326),
    "centroid" geometry(Point,4326),
    "risk_profile" JSONB,

    CONSTRAINT "District_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Block" (
    "code" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boundary" geometry(MultiPolygon,4326),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_firebase_uid_key" ON "User"("firebase_uid");

-- CreateIndex
CREATE INDEX "User_is_active_idx" ON "User"("is_active");

-- CreateIndex
CREATE INDEX "User_created_at_idx" ON "User"("created_at");

-- CreateIndex
CREATE INDEX "User_organization_id_idx" ON "User"("organization_id");

-- CreateIndex
CREATE INDEX "Organization_type_idx" ON "Organization"("type");

-- CreateIndex
CREATE UNIQUE INDEX "University_organization_id_key" ON "University"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "University_code_key" ON "University"("code");

-- CreateIndex
CREATE INDEX "Department_university_id_idx" ON "Department"("university_id");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE INDEX "Challenge_district_code_status_idx" ON "Challenge"("district_code", "status");

-- CreateIndex
CREATE INDEX "Challenge_submitter_id_submitted_at_idx" ON "Challenge"("submitter_id", "submitted_at");

-- CreateIndex
CREATE INDEX "Challenge_block_code_idx" ON "Challenge"("block_code");

-- CreateIndex
CREATE INDEX "Challenge_category_idx" ON "Challenge"("category");

-- CreateIndex
CREATE INDEX "Challenge_assigned_org_id_idx" ON "Challenge"("assigned_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_challenge_id_key" ON "Submission"("challenge_id");

-- CreateIndex
CREATE INDEX "ChallengeEvidence_challenge_id_idx" ON "ChallengeEvidence"("challenge_id");

-- CreateIndex
CREATE INDEX "ChallengeEvidence_is_private_idx" ON "ChallengeEvidence"("is_private");

-- CreateIndex
CREATE UNIQUE INDEX "AiRecommendation_superseded_by_id_key" ON "AiRecommendation"("superseded_by_id");

-- CreateIndex
CREATE INDEX "AiRecommendation_challenge_id_kind_created_at_idx" ON "AiRecommendation"("challenge_id", "kind", "created_at");

-- CreateIndex
CREATE INDEX "AiRecommendation_status_idx" ON "AiRecommendation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Validation_ai_recommendation_id_key" ON "Validation"("ai_recommendation_id");

-- CreateIndex
CREATE INDEX "Validation_challenge_id_decided_at_idx" ON "Validation"("challenge_id", "decided_at");

-- CreateIndex
CREATE INDEX "Validation_reviewer_id_idx" ON "Validation"("reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cluster_label_key" ON "Cluster"("label");

-- CreateIndex
CREATE INDEX "ClusterMember_challenge_id_idx" ON "ClusterMember"("challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClusterMember_cluster_id_challenge_id_key" ON "ClusterMember"("cluster_id", "challenge_id");

-- CreateIndex
CREATE INDEX "UniversityAcceptance_university_id_idx" ON "UniversityAcceptance"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityAcceptance_challenge_id_university_id_key" ON "UniversityAcceptance"("challenge_id", "university_id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_challenge_id_key" ON "Project"("challenge_id");

-- CreateIndex
CREATE INDEX "Project_university_id_status_idx" ON "Project"("university_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Team_project_id_key" ON "Team"("project_id");

-- CreateIndex
CREATE INDEX "TeamMember_user_id_idx" ON "TeamMember"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_team_id_user_id_key" ON "TeamMember"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_project_id_key" ON "Proposal"("project_id");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_reviewer_id_idx" ON "Proposal"("reviewer_id");

-- CreateIndex
CREATE INDEX "Milestone_project_id_due_at_idx" ON "Milestone"("project_id", "due_at");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE INDEX "Collaboration_project_id_status_idx" ON "Collaboration"("project_id", "status");

-- CreateIndex
CREATE INDEX "Collaboration_offering_org_id_idx" ON "Collaboration"("offering_org_id");

-- CreateIndex
CREATE INDEX "Offer_collaboration_id_idx" ON "Offer"("collaboration_id");

-- CreateIndex
CREATE INDEX "Pilot_project_id_idx" ON "Pilot"("project_id");

-- CreateIndex
CREATE INDEX "Deployment_project_id_idx" ON "Deployment"("project_id");

-- CreateIndex
CREATE INDEX "ImpactRecord_project_id_metric_name_idx" ON "ImpactRecord"("project_id", "metric_name");

-- CreateIndex
CREATE INDEX "ImpactRecord_is_verified_idx" ON "ImpactRecord"("is_verified");

-- CreateIndex
CREATE INDEX "AuditEvent_resource_type_resource_id_created_at_idx" ON "AuditEvent"("resource_type", "resource_id", "created_at");

-- CreateIndex
CREATE INDEX "AuditEvent_actor_id_created_at_idx" ON "AuditEvent"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE INDEX "AuditEvent_created_at_idx" ON "AuditEvent"("created_at");

-- CreateIndex
CREATE INDEX "OutboxEvent_status_created_at_idx" ON "OutboxEvent"("status", "created_at");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregate_type_aggregate_id_idx" ON "OutboxEvent"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "AppNotification_recipient_id_read_at_idx" ON "AppNotification"("recipient_id", "read_at");

-- CreateIndex
CREATE INDEX "AppNotification_delivery_state_idx" ON "AppNotification"("delivery_state");

-- CreateIndex
CREATE INDEX "AppNotification_audit_event_id_idx" ON "AppNotification"("audit_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_capability_key" ON "Permission"("capability");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_name_permission_id_key" ON "RolePermission"("role_name", "permission_id");

-- CreateIndex
CREATE INDEX "UserRoleLink_role_name_idx" ON "UserRoleLink"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleLink_user_id_role_name_key" ON "UserRoleLink"("user_id", "role_name");

-- CreateIndex
CREATE UNIQUE INDEX "UserGeoScope_user_id_scope_type_district_code_key" ON "UserGeoScope"("user_id", "scope_type", "district_code");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_hash_key" ON "RefreshToken"("token_hash");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_revoked_at_idx" ON "RefreshToken"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "ChallengeComment_challenge_id_created_at_idx" ON "ChallengeComment"("challenge_id", "created_at");

-- CreateIndex
CREATE INDEX "Block_district_code_idx" ON "Block"("district_code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_assigned_org_id_fkey" FOREIGN KEY ("assigned_org_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeEvidence" ADD CONSTRAINT "ChallengeEvidence_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRecommendation" ADD CONSTRAINT "AiRecommendation_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validation" ADD CONSTRAINT "Validation_ai_recommendation_id_fkey" FOREIGN KEY ("ai_recommendation_id") REFERENCES "AiRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClusterMember" ADD CONSTRAINT "ClusterMember_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "Cluster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClusterMember" ADD CONSTRAINT "ClusterMember_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAcceptance" ADD CONSTRAINT "UniversityAcceptance_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityAcceptance" ADD CONSTRAINT "UniversityAcceptance_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_offering_org_id_fkey" FOREIGN KEY ("offering_org_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_collaboration_id_fkey" FOREIGN KEY ("collaboration_id") REFERENCES "Collaboration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot" ADD CONSTRAINT "Pilot_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot" ADD CONSTRAINT "Pilot_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactRecord" ADD CONSTRAINT "ImpactRecord_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactRecord" ADD CONSTRAINT "ImpactRecord_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_ai_recommendation_id_fkey" FOREIGN KEY ("ai_recommendation_id") REFERENCES "AiRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppNotification" ADD CONSTRAINT "AppNotification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "Role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleLink" ADD CONSTRAINT "UserRoleLink_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleLink" ADD CONSTRAINT "UserRoleLink_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "Role"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGeoScope" ADD CONSTRAINT "UserGeoScope_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeComment" ADD CONSTRAINT "ChallengeComment_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeComment" ADD CONSTRAINT "ChallengeComment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ── PostGIS spatial indexes (GIST) — required for §11 spatial queries & district heatmap ──
CREATE INDEX "Challenge_location_gist" ON "Challenge" USING GIST ("location");
CREATE INDEX "District_boundary_gist" ON "District" USING GIST ("boundary");
CREATE INDEX "District_centroid_gist" ON "District" USING GIST ("centroid");
CREATE INDEX "Block_boundary_gist" ON "Block" USING GIST ("boundary");

-- ── CHECK constraint (Prisma can't inline; see schema.prisma comment on Challenge) ──
ALTER TABLE "Challenge" ADD CONSTRAINT "chk_priority_range"
  CHECK ("priority_score" IS NULL OR ("priority_score" >= 0 AND "priority_score" <= 9.99));
