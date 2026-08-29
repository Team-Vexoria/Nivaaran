// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Frontend Workflow Store (SIH 26043)
// A singleton data store using localStorage to simulate backend persistence
// for the demo. It dispatches a CustomEvent on update so React can re-render.
// ─────────────────────────────────────────────────────────────────────────────

import { createSeedData } from './workflowSeedData';
import type {
  WorkflowState,
  Challenge,
  Project,
  TimelineEvent,
  ChallengeStatus,
  ChallengeStageMetadata,
} from './workflowTypes';

const STORE_KEY = 'nivaaran_workflow_state';
export const STORE_EVENT = 'nivaaran-store-updated';

// This is intentionally limited to the status vocabulary already used by the
// current frontend. The broader canonical lifecycle is handled separately.
export const CHALLENGE_STAGE_METADATA: Record<ChallengeStatus, ChallengeStageMetadata> = {
  'Submitted': { stageNumber: 1, stageName: 'Stage 1: Citizen Submission' },
  'Under Review': { stageNumber: 2, stageName: 'Stage 2: AI Triage Complete — Awaiting Government Review' },
  'Evidence Requested': { stageNumber: 2, stageName: 'Stage 2: Evidence Requested by Government Officer' },
  'Government Validated': { stageNumber: 3, stageName: 'Stage 3: Government Validated & Prioritized' },
  'HEI Matched': { stageNumber: 6, stageName: 'Stage 6: Institution Matching' },
  'University Accepted': { stageNumber: 7, stageName: 'Stage 7: University Accepted & Project Allocation' },
  'In Progress': { stageNumber: 8, stageName: 'Stage 8: Team Formation & Project Initiation' },
  'Proposal Submitted': { stageNumber: 9, stageName: 'Stage 9: Technical Proposal Submitted' },
  'Prototype Active': { stageNumber: 11, stageName: 'Stage 11: Prototype Development & Testing' },
  'Pilot Active': { stageNumber: 12, stageName: 'Stage 12: Field Pilot Deployment' },
  'Resolved': { stageNumber: 14, stageName: 'Stage 14: Solution Deployed' },
  'Closed': { stageNumber: 16, stageName: 'Stage 16: Impact Measured & Challenge Closed' },
};

class WorkflowStore {
  private state: WorkflowState;

  constructor() {
    this.state = this.loadState();
    // Break circular dependency with dynamic import
    setTimeout(() => {
      import('./workflowAdapters').then(m => {
        m.migrateLegacyChallenges();
        m.migrateLegacyProjects();
      }).catch(e => console.error("Migration import failed", e));
    }, 0);
  }

  // ── Persistence ─────────────────────────────────────────────────────────────

  private loadState(): WorkflowState {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (this.isWorkflowState(parsed)) return parsed;

        // Preserve malformed data for diagnosis instead of silently destroying it.
        localStorage.setItem(`${STORE_KEY}_corrupt_${Date.now()}`, stored);
      }
    } catch (e) {
      console.error('Failed to parse workflow state from localStorage:', e);
    }
    // If empty or corrupt, seed with demo data
    const seed = createSeedData();
    this.persist(seed);
    return seed;
  }

  private isWorkflowState(value: unknown): value is WorkflowState {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<WorkflowState>;
    return Array.isArray(candidate.challenges)
      && Array.isArray(candidate.projects)
      && Array.isArray(candidate.proposals)
      && Array.isArray(candidate.timelineEvents)
      && typeof candidate.lastUpdated === 'string';
  }

  private persist(newState: WorkflowState) {
    this.state = newState;
    this.state.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
      // Notify React components to re-render
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(STORE_EVENT));
      }
    } catch (e) {
      console.error('Failed to save workflow state to localStorage:', e);
    }
  }

  // ── General ─────────────────────────────────────────────────────────────────

  public getState(): WorkflowState {
    return this.state;
  }

  public resetDemoData(): WorkflowState {
    const seed = createSeedData();
    this.persist(seed);
    try {
      localStorage.removeItem('nivaaran_challenges');
      localStorage.removeItem('nivaaran_projects');
    } catch (e) {
      // Ignore errors
    }
    return seed;
  }

  // ── Challenges ──────────────────────────────────────────────────────────────

  public getChallenges(): Challenge[] {
    return this.state.challenges || [];
  }

  public getChallenge(id: string): Challenge | undefined {
    return this.findChallengeByIdOrReportId(id);
  }

  public findChallengeByIdOrReportId(idOrReportId: string): Challenge | undefined {
    return this.state.challenges.find((c) => c.id === idOrReportId || c.reportId === idOrReportId);
  }

  public addChallenge(challenge: Challenge): { created?: Challenge, duplicate?: boolean, existing?: Challenge } {
    const existing = this.findChallengeByIdOrReportId(challenge.id) || this.findChallengeByIdOrReportId(challenge.reportId);
    if (existing) {
      return { duplicate: true, existing };
    }

    const now = new Date().toISOString();
    const newChallenge = {
      ...challenge,
      id: challenge.id || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: challenge.createdAt || now,
      updatedAt: now,
    };
    
    const challenges = [newChallenge, ...this.state.challenges];
    this.persist({ ...this.state, challenges });
    return { created: newChallenge };
  }

  public updateChallenge(id: string, updates: Partial<Challenge>): Challenge | undefined {
    const challenge = this.findChallengeByIdOrReportId(id);
    if (!challenge) return undefined;
    
    let updatedChallenge: Challenge | undefined;
    const challenges = this.state.challenges.map((ch) => {
      if (ch.id === challenge.id) {
        updatedChallenge = { ...ch, ...updates, updatedAt: new Date().toISOString() };
        return updatedChallenge;
      }
      return ch;
    });
    this.persist({ ...this.state, challenges });
    return updatedChallenge;
  }

  public transitionChallenge(
    id: string,
    newStatus: ChallengeStatus,
    actor: string,
    actorRole: string,
    note?: string
  ): boolean {
    const challenge = this.findChallengeByIdOrReportId(id);
    if (!challenge) return false;

    const previousStatus = challenge.status;
    const stage = CHALLENGE_STAGE_METADATA[newStatus];
    const updated = this.updateChallenge(challenge.id, {
      status: newStatus,
      stageNumber: stage.stageNumber,
      stageName: stage.stageName,
      ...(note && { govtOfficerNote: note }),
    });

    if (!updated) return false;

    this.addTimelineEvent({
      id: `TL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      entityType: 'challenge',
      entityId: challenge.id,
      action: 'status_changed',
      actor,
      actorRole,
      description: note || `Status changed from ${previousStatus} to ${newStatus}`,
      previousValue: previousStatus,
      newValue: newStatus,
      timestamp: new Date().toISOString(),
    });
    
    return true;
  }

  // ── Projects ────────────────────────────────────────────────────────────────

  public getProjects(): Project[] {
    return this.state.projects || [];
  }

  public getProject(id: string): Project | undefined {
    return this.state.projects.find((p) => p.id === id);
  }

  public getProjectByChallengeId(challengeId: string): Project | undefined {
    return this.state.projects.find((p) => p.challengeId === challengeId);
  }

  public createProject(project: Project): Project | { duplicate: true, existing: Project } {
    const existing = this.getProject(project.id) || this.getProjectByChallengeId(project.challengeId);
    if (existing) {
      return { duplicate: true, existing };
    }
    
    const projects = [...this.state.projects, project];
    this.persist({ ...this.state, projects });

    this.addTimelineEvent({
      id: `TL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      entityType: 'project',
      entityId: project.id,
      action: 'created',
      actor: project.facultyMentorName,
      actorRole: 'Faculty / Mentor',
      description: 'Project created from accepted challenge',
      timestamp: new Date().toISOString(),
    });
    
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.getProject(id);
    if (!project) return undefined;
    
    let updatedProject: Project | undefined;
    const projects = this.state.projects.map((p) => {
      if (p.id === id) {
        updatedProject = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return updatedProject;
      }
      return p;
    });
    this.persist({ ...this.state, projects });
    return updatedProject;
  }

  // ── Timeline ────────────────────────────────────────────────────────────────

  public getTimelineEvents(entityId: string): TimelineEvent[] {
    return this.state.timelineEvents
      .filter((e) => e.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addTimelineEvent(event: TimelineEvent) {
    const timelineEvents = [...this.state.timelineEvents, event];
    this.persist({ ...this.state, timelineEvents });
  }
}

// Export a single instance to be used application-wide
export const workflowStore = new WorkflowStore();
