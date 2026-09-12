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
  Proposal,
  TimelineEvent,
  ChallengeStatus,
} from './workflowTypes';
import { formatStageName, getStageForStatus, isValidStageTransition } from './workflowLifecycle';
import { apiClient } from '../api/client';

const STORE_KEY = 'nivaaran_workflow_state';
export const STORE_EVENT = 'nivaaran-store-updated';

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

    // Cross-tab sync: when localStorage changes in another tab, reload state.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (!e.key || !e.key.startsWith('nivaaran_')) return;
        try {
          if (e.key === STORE_KEY && e.newValue) {
            const parsed: unknown = JSON.parse(e.newValue);
            if (this.isWorkflowState(parsed)) {
              this.state = parsed;
            }
          }
          window.dispatchEvent(new CustomEvent('nivaaran-storage-changed', {
            detail: { key: e.key }
          }));
        } catch {
          // Ignore malformed cross-tab payload
        }
      });
    }
  }

  // ── Persistence ──────────────────────────────────────────────────────────────

  private loadState(): WorkflowState {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (this.isWorkflowState(parsed)) {
          // If stored state is from older seed with < 15 challenges or full allocations, upgrade to new unallocated demo state
          if (parsed.challenges.length < 15 || parsed.projects.length > 11 || parsed.challenges.some(c => c.id === 'DEMO-CH-015' && c.assignedHEI)) {
            const seed = createSeedData();
            this.persist(seed);
            return seed;
          }
          // Sanitize any dashes in loaded challenges
          parsed.challenges = parsed.challenges.map(c => ({
            ...c,
            title: c.title ? c.title.replace(/[—–]/g, ' to ').replace(/--+/g, ' ') : c.title,
            description: c.description ? c.description.replace(/[—–]/g, ' to ').replace(/--+/g, ' ') : c.description,
          }));
          return parsed;
        }
        localStorage.setItem(`${STORE_KEY}_corrupt_${Date.now()}`, stored);
      }
    } catch (e) {
      console.error('Failed to parse workflow state from localStorage:', e);
    }
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(STORE_EVENT));
      }
    } catch (e) {
      console.error('Failed to save workflow state to localStorage:', e);
    }
  }

  // ── General ──────────────────────────────────────────────────────────────────

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

  /**
   * Bulk-load data from API response (Phase 2: API-first mode).
   * Replaces localStorage data with server data without triggering API calls.
   */
  public loadFromApi(data: { challenges?: Challenge[]; projects?: Project[]; proposals?: Proposal[] }) {
    this.persist({
      ...this.state,
      challenges: data.challenges ?? this.state.challenges,
      projects: data.projects ?? this.state.projects,
      proposals: data.proposals ?? this.state.proposals,
    });
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

  public async addChallenge(challenge: Challenge): Promise<{ created?: Challenge, duplicate?: boolean, existing?: Challenge }> {
    const existing = this.findChallengeByIdOrReportId(challenge.id) || this.findChallengeByIdOrReportId(challenge.reportId);
    if (existing) {
      return { duplicate: true, existing };
    }

    // Try API first, fall back to local
    try {
      const apiRes = await apiClient.createChallenge(challenge as Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>);
      if (apiRes.ok && apiRes.data) {
        const serverChallenge = apiRes.data as Challenge;
        const challenges = [serverChallenge, ...this.state.challenges];
        this.persist({ ...this.state, challenges });
        return { created: serverChallenge };
      }
    } catch (e) {
      console.warn('API createChallenge failed, using local fallback:', e);
    }
    
    // Fallback to local persistence
    const now = new Date().toISOString();
    const newChallenge: Challenge = {
      ...challenge,
      id: challenge.id || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: challenge.createdAt || now,
      updatedAt: now,
    };
    
    const challenges = [newChallenge, ...this.state.challenges];
    this.persist({ ...this.state, challenges });
    return { created: newChallenge };
  }

  public async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | undefined> {
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

  public deleteChallenge(id: string): boolean {
    const challenge = this.findChallengeByIdOrReportId(id);
    if (!challenge) return false;
    const challenges = this.state.challenges.filter((ch) => ch.id !== challenge.id && ch.reportId !== challenge.reportId);
    this.persist({ ...this.state, challenges });
    return true;
  }

  public async transitionChallenge(
    id: string,
    newStatus: ChallengeStatus,
    actor: string,
    actorRole: string,
    note?: string
  ): Promise<{ success: boolean; reason?: string }> {
    const challenge = this.findChallengeByIdOrReportId(id);
    if (!challenge) return { success: false, reason: 'Challenge not found' };

    const previousStatus = challenge.status;
    const currentStage = getStageForStatus(previousStatus);
    const nextStage = getStageForStatus(newStatus);

    if (!currentStage || !nextStage) {
      return { success: false, reason: 'Invalid or unknown status mapping' };
    }

    if (currentStage.stageNumber !== nextStage.stageNumber && !isValidStageTransition(currentStage.stageNumber, nextStage.stageNumber)) {
      return { success: false, reason: `Invalid transition from stage ${currentStage.stageNumber} to ${nextStage.stageNumber}` };
    }

    // Try API transition first
    try {
      const action = `challenge:${newStatus.toLowerCase().replace(/\s+/g, '_')}`;
      const apiRes = await apiClient.transitionChallenge(challenge.id, action, { newStatus, note, actor, actorRole });
      if (apiRes.ok) {
        const updated = await this.updateChallenge(challenge.id, {
          status: newStatus,
          stageNumber: nextStage.stageNumber,
          stageName: formatStageName(nextStage.stageNumber),
          ...(note && { govtOfficerNote: note }),
        });
        if (updated) {
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
            timestamp: new Date().toISOString()
          });
        }
        return { success: true };
      }
    } catch (e) {
      console.warn('API transition failed, using local fallback:', e);
    }

    // Fallback to local update
    const updated = await this.updateChallenge(challenge.id, {
      status: newStatus,
      stageNumber: nextStage.stageNumber,
      stageName: formatStageName(nextStage.stageNumber),
      ...(note && { govtOfficerNote: note }),
    });
    if (!updated) return { success: false, reason: 'Update failed' };

    return { success: true };
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

  public async createProject(project: Project): Promise<Project | { duplicate: true, existing: Project }> {
    const existing = this.getProject(project.id) || this.getProjectByChallengeId(project.challengeId);
    if (existing) {
      return { duplicate: true, existing };
    }
    
    // Try API first
    try {
      const apiRes = await apiClient.createProject(project as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
      if (apiRes.ok && apiRes.data) {
        const serverProject = apiRes.data as Project;
        const projects = [...this.state.projects, serverProject];
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
        
        return serverProject;
      }
    } catch (e) {
      console.warn('API createProject failed, using local fallback:', e);
    }

    // Fallback to local
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
