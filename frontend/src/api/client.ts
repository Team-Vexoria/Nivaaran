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
async function getBearerToken(): Promise<string | null> {
  try {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) return null;
    // getIdToken() returns the Firebase ID token (JWT) suitable for Bearer auth
    return await currentUser.getIdToken();
  } catch {
    return null;
  }
}

// ── Base client ──────────────────────────────────────────────────────────
const BASE = '/api/v1';

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
    let body: ApiResponse<T>;
    const text = await res.text();
    try {
      body = text ? JSON.parse(text) : { ok: res.ok, data: undefined as any };
    } catch {
      body = { ok: false, error: { code: 'INVALID_JSON', message: `Server returned non-JSON response (${res.status})` } };
    }
    return body;
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === 'AbortError') {
      return { ok: false, error: { code: 'TIMEOUT', message: 'Request timed out' } };
    }
    return { ok: false, error: { code: 'NETWORK_ERROR', message: (e as Error).message } };
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

  // ── Deployments ─────────────────────────────────────────────────────

  /** GET /api/v1/deployments — list deployments */
  async getDeployments(): Promise<ApiResponse<unknown[]>> {
    return apiRequest('/deployments');
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
