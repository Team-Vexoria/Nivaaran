// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Typed API Client (Phase 1 Sync Bridge)
// Firebase Bearer token injection · JSON envelope parsing · typed request/response
// ─────────────────────────────────────────────────────────────────────────────

import { getAuth } from 'firebase/auth';
import type { Challenge, Project, Proposal, WorkflowState, TimelineEvent } from '../services/workflowTypes';

// ── API envelope shapes (mirror backend JSON contract) ──────────────────
interface OkEnvelope<T> { ok: true; data: T }
interface ErrEnvelope { ok: false; error: { code: string; message: string; details?: unknown; traceId?: string } }
export type ApiResponse<T> = OkEnvelope<T> | ErrEnvelope;

// ── Auth token helper ────────────────────────────────────────────────────

// Canonical demo bearer tokens for API requests. Each maps a demo user's
// display role to the seeded backend uid (hyphenated `demo-*`), and MUST stay
// in sync with the backend `DEMO_IDENTITIES` map in `backend/src/core/auth.ts`.
// The token alone determines the backend role — no role header is involved.
const DEMO_ROLE_TOKENS: Record<string, string> = {
  Citizen: 'demo-citizen',
  'Government Department': 'demo-department',
  'Government Validator': 'demo-validator',
  'University Admin': 'demo-university',
  'Faculty / Mentor': 'demo-faculty',
  Student: 'demo-student1',
  'Industry / MSME': 'demo-industry',
  'CSR Organization': 'demo-industry',
};

/**
 * Whether the local demo-auth escape hatch is enabled.
 *
 * It is an EXPLICIT build-time opt-in, governed ONLY by `VITE_DEMO_AUTH_ENABLED`
 * being exactly `'true'`. It is deliberately NOT tied to `import.meta.env.DEV`:
 * the self-contained SIH demo stack ships a production Vite build behind Docker
 * Nginx (`npm run build`), yet still needs demo auth enabled for rehearsals.
 *
 * The default (unset, or any value other than exactly `true`) is OFF, so a
 * normal production deployment never exposes the bypass unless it was explicitly
 * configured for this local demo stack. Mirrors the backend's `DEMO_AUTH_ENABLED`.
 */
export function demoAuthEnabled(): boolean {
  return import.meta.env?.VITE_DEMO_AUTH_ENABLED === 'true';
}

/** Derive the matching `demo-*` token for a locally-stored demo user. */
function demoTokenFromLocalUser(): string | null {
  if (!demoAuthEnabled()) return null;
  try {
    const raw = localStorage.getItem('nivaaran_demo_user');
    if (!raw) return null;
    const profile = JSON.parse(raw) as { role?: string; demoToken?: string };
    if (!profile?.role) return null;
    // Prefer an explicitly-stored canonical token, else derive by display role.
    if (typeof profile.demoToken === 'string' && profile.demoToken.startsWith('demo-')) {
      return profile.demoToken;
    }
    return DEMO_ROLE_TOKENS[profile.role] ?? null;
  } catch {
    return null;
  }
}

export async function getBearerToken(): Promise<string | null> {
  // 1. Real Firebase session → use the Firebase ID token (JWT) for Bearer auth.
  try {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
  } catch {
    // Firebase unavailable — fall through to the demo escape hatch below.
  }
  // 2. Demo mode (no Firebase session): send the matching `demo-*` token so the
  //    backend can assign the correct seeded role instead of rejecting the call.
  return demoTokenFromLocalUser();
}

// ── Base client ──────────────────────────────────────────────────────────
// Default: relative `/api/v1` — works through both Vite dev-proxy and Docker
// Nginx without any host/port hardcoding. Set VITE_API_URL to an absolute URL
// only when the API lives on a different origin (e.g. a remote staging server).
const BASE = (import.meta.env?.VITE_API_URL || '') + '/api/v1';

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getBearerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
      signal: controller.signal,
    });
    // The fetch abort does NOT cover reading the response body: once response
    // headers arrive, `res.text()` can stall indefinitely if the server stops
    // sending bytes mid-body (e.g. a large photo upload rejected by a proxy).
    // Race the body read against its own timeout so no caller ever hangs.
    const text = await Promise.race([
      res.text(),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 15_000)
      ),
    ]);
    let body: ApiResponse<T>;
    try {
      body = text ? JSON.parse(text) : { ok: res.ok, data: undefined as any };
    } catch {
      body = { ok: false, error: { code: 'INVALID_JSON', message: `Server returned non-JSON response (${res.status})` } };
    }
    return body;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, error: { code: 'TIMEOUT', message: 'Request timed out' } };
    }
    return { ok: false, error: { code: 'NETWORK_ERROR', message: (e as Error).message } };
  } finally {
    clearTimeout(timeout);
  }
}

// ── Typed API methods ────────────────────────────────────────────────────

export const apiClient = {
  // ── Challenges ────────────────────────────────────────────────────────

  /** GET /api/v1/challenges — list all challenges */
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    return apiRequest<Challenge[]>('/challenges');
  },

  /** GET /api/v1/challenges/:id — single challenge */
  async getChallenge(id: string): Promise<ApiResponse<Challenge>> {
    return apiRequest<Challenge>(`/challenges/${id}`);
  },

  /** GET /api/v1/challenges/:id/transitions — allowed transitions */
  async getTransitions(id: string): Promise<ApiResponse<unknown[]>> {
    return apiRequest(`/challenges/${id}/transitions`);
  },

  /** GET /api/v1/challenges/:id/timeline — timeline events */
  async getTimeline(id: string): Promise<ApiResponse<TimelineEvent[]>> {
    return apiRequest<TimelineEvent[]>(`/challenges/${id}/timeline`);
  },

  /** POST /api/v1/challenges — create a new challenge */
  async createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Challenge>> {
    return apiRequest<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(challenge),
    });
  },

  /**
   * POST /api/v1/challenges/:id/transition
   * Backend contract: { action: string, payload?: object, ifMatch?: number }
   * Returns { challenge, appliedAction, fromStatus, toStatus, availableTransitions, auditEventId, outboxEventId }
   */
  async transitionChallenge(
    id: string,
    action: string,
    payload?: Record<string, unknown>,
    ifMatchVersion?: number
  ): Promise<ApiResponse<unknown>> {
    const body: Record<string, unknown> = { action, ...(payload && { payload }) };
    if (ifMatchVersion !== undefined) {
      // Optimistic concurrency via If-Match header (backend reads req.headers['if-match'])
      // Send version in body as backup; backend controller reads header primarily
    }
    return apiRequest(`/challenges/${id}/transition`, {
      method: 'POST',
      headers: ifMatchVersion !== undefined ? { 'If-Match': String(ifMatchVersion) } : {},
      body: JSON.stringify(body),
    });
  },

  // ── Projects ────────────────────────────────────────────────────────

  /** GET /api/v1/projects — list all projects */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return apiRequest<Project[]>('/projects');
  },

  /** GET /api/v1/projects/:id — single project */
  async getProject(id: string): Promise<ApiResponse<Project>> {
    return apiRequest<Project>(`/projects/${id}`);
  },

  /** POST /api/v1/projects — create a project (auto-created on team:create transition) */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  // ── Proposals ────────────────────────────────────────────────────────

  /** GET /api/v1/proposals — list proposals */
  async getProposals(): Promise<ApiResponse<Proposal[]>> {
    return apiRequest<Proposal[]>('/proposals');
  },

  /** POST /api/v1/proposals — submit a proposal */
  async submitProposal(proposal: Omit<Proposal, 'id' | 'submittedAt'>): Promise<ApiResponse<Proposal>> {
    return apiRequest<Proposal>('/proposals', {
      method: 'POST',
      body: JSON.stringify(proposal),
    });
  },

  /** POST /api/v1/proposals/:id/approve — approve a proposal */
  async approveProposal(id: string): Promise<ApiResponse<Proposal>> {
    return apiRequest<Proposal>(`/proposals/${id}/approve`, { method: 'POST' });
  },

  /** POST /api/v1/proposals/:id/revision — request revision */
  async requestRevision(id: string, note: string): Promise<ApiResponse<Proposal>> {
    return apiRequest<Proposal>(`/proposals/${id}/revision`, {
      method: 'POST',
      body: JSON.stringify({ reviewNote: note }),
    });
  },

  // ── Teams ────────────────────────────────────────────────────────────

  /** GET /api/v1/teams — list teams */
  async getTeams(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/teams');
  },

  /** POST /api/v1/teams — create a team */
  async createTeam(team: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/teams', { method: 'POST', body: JSON.stringify(team) });
  },

  /** POST /api/v1/teams/:id/members — add member */
  async addTeamMember(id: string, member: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest(`/teams/${id}/members`, { method: 'POST', body: JSON.stringify(member) });
  },

  // ── Milestones ──────────────────────────────────────────────────────

  /** GET /api/v1/milestones — list milestones */
  async getMilestones(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/milestones');
  },

  /** POST /api/v1/milestones — create milestone */
  async createMilestone(milestone: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/milestones', { method: 'POST', body: JSON.stringify(milestone) });
  },

  /** POST /api/v1/milestones/:milestoneId — update milestone */
  async updateMilestone(milestoneId: string, updates: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest(`/milestones/${milestoneId}`, { method: 'POST', body: JSON.stringify(updates) });
  },

  // ── Prototypes ──────────────────────────────────────────────────────

  /** GET /api/v1/prototypes — list prototypes */
  async getPrototypes(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/prototypes');
  },

  /** POST /api/v1/prototypes — create prototype update */
  async createPrototype(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/prototypes', { method: 'POST', body: JSON.stringify(data) });
  },

  // ── Pilots ──────────────────────────────────────────────────────────

  /** GET /api/v1/pilots — list pilots */
  async getPilots(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/pilots');
  },

  /** POST /api/v1/pilots — create pilot report */
  async createPilot(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/pilots', { method: 'POST', body: JSON.stringify(data) });
  },

  /** POST /api/v1/pilots/:id/complete — complete pilot */
  async completePilot(id: string, data?: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest(`/pilots/${id}/complete`, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },

  // ── Deployments ─────────────────────────────────────────────────────

  /** GET /api/v1/deployments — list deployments */
  async getDeployments(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/deployments');
  },

  /** POST /api/v1/deployments — create deployment */
  async createDeployment(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/deployments', { method: 'POST', body: JSON.stringify(data) });
  },

  /** POST /api/v1/deployments/:id/approve — approve deployment */
  async approveDeployment(id: string): Promise<ApiResponse<unknown>> {
    return apiRequest(`/deployments/${id}/approve`, { method: 'POST' });
  },

  // ── Impact ──────────────────────────────────────────────────────────

  /** GET /api/v1/impact — list impact records */
  async getImpact(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/impact');
  },

  /** POST /api/v1/impact — create impact record */
  async createImpact(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/impact', { method: 'POST', body: JSON.stringify(data) });
  },

  /** POST /api/v1/impact/:id/verify — verify impact */
  async verifyImpact(id: string): Promise<ApiResponse<unknown>> {
    return apiRequest(`/impact/${id}/verify`, { method: 'POST' });
  },

  // ── Collaborations ──────────────────────────────────────────────────

  /** GET /api/v1/collaborations — list collaborations */
  async getCollaborations(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/collaborations');
  },

  /** POST /api/v1/collaborations — create collaboration */
  async createCollaboration(data: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    return apiRequest('/collaborations', { method: 'POST', body: JSON.stringify(data) });
  },

  /** POST /api/v1/collaborations/:id/accept — accept collaboration */
  async acceptCollaboration(id: string): Promise<ApiResponse<unknown>> {
    return apiRequest(`/collaborations/${id}/accept`, { method: 'POST' });
  },

  // ── Analytics ────────────────────────────────────────────────────────

  /** GET /api/v1/analytics/district-heatmap — pre-aggregated district heatmap */
  async getDistrictHeatmap(): Promise<ApiResponse<unknown>> {
    return apiRequest('/analytics/district-heatmap');
  },

  async getAnalyticsStatus(): Promise<ApiResponse<Record<string, number>>> {
    return apiRequest('/analytics/status-distribution');
  },
  async getAnalyticsPriority(): Promise<ApiResponse<{ bucket: string; count: number }[]>> {
    return apiRequest('/analytics/priority-distribution');
  },
  async getAnalyticsTrend(days = 30): Promise<ApiResponse<{ date: string; count: number; avgPriority: number }[]>> {
    return apiRequest(`/analytics/daily-trend?days=${days}`);
  },
  async getAnalyticsDomains(): Promise<ApiResponse<{ domain: string; category: string; count: number }[]>> {
    return apiRequest('/analytics/domain-breakdown');
  },
  async getAnalyticsAIPerformance(): Promise<ApiResponse<{ avgConfidence: number; totalAnalyzed: number; avgPriorityScore: number }>> {
    return apiRequest('/analytics/ai-performance');
  },
  async getAnalyticsImpact(): Promise<ApiResponse<{ totalProjects: number; totalBeneficiaries: number; totalDeployments: number }>> {
    return apiRequest('/analytics/impact-metrics');
  },

  // ── Identity ────────────────────────────────────────────────────────

  /** GET /api/v1/identity/me — current profile */
  async getProfile(): Promise<ApiResponse<unknown>> {
    return apiRequest('/identity/me');
  },

  /** GET /api/v1/identity/roles — available roles */
  async getRoles(): Promise<ApiResponse<unknown>> {
    return apiRequest('/identity/roles');
  },

  /** GET /api/v1/districts — list all 24 Jharkhand districts */
  async getDistricts(): Promise<ApiResponse<unknown>> {
    return apiRequest('/districts');
  },

  // ── AI Pipeline (5-stage backend enrichment) ─────────────────────────────

  /**
   * POST /api/v1/ai/pipeline
   * Runs the full 5-stage backend AI pipeline: verify → understand → research → prioritize → match
   * Returns enrichment data: research context, university matches, dedup status, backend priority score.
   * Uses the default 15s timeout (research stage has a 6.5s internal ceiling).
   */
  async runAIPipeline(payload: {
    challenge: Record<string, unknown>;
    upvotes?: number;
    existingIds?: string[];
    universities?: unknown[];
  }): Promise<ApiResponse<{
    pipeline: string[];
    verification: { dedupStatus: string; domainCode: string; confidence: number };
    understanding: { summary: string; domain: string; severity: string; confidence: number };
    research: { confidence: number; activeAlert: boolean; governmentAdvisories: string[]; recentIncidents: unknown[]; sourceBreakdown: Record<string, string> };
    priority: { priorityScore: number; riskLevel: string; confidence: number; factors: Record<string, { score: number; max: number; reason: string }> };
    matches: { heiId: string; score: number }[];
    category: string;
    domainCode: string;
    confidence: number;
    modelVersion: string;
  }>> {
    return apiRequest('/ai/pipeline', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ── Typed helper: extract data or throw on error ─────────────────────────
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.ok) {
    return response.data;
  }
  throw new ApiError(response.error.code, response.error.message, response.error.details);
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly traceId?: string;
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// ── Full-state sync: fetch all entities from API (Phase 2 readiness) ──────
export async function fetchFullState(): Promise<WorkflowState> {
  const [challengesRes, projectsRes, proposalsRes] = await Promise.all([
    apiClient.getChallenges(),
    apiClient.getProjects(),
    apiClient.getProposals(),
  ]);

  const challenges = challengesRes.ok ? challengesRes.data : [];
  const projects = projectsRes.ok ? projectsRes.data : [];
  const proposals = proposalsRes.ok ? proposalsRes.data : [];

  return {
    challenges,
    projects,
    proposals,
    timelineEvents: [],
    lastUpdated: new Date().toISOString(),
  };
}

export default apiClient;
