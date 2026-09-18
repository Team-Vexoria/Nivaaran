// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Frontend Workflow Store (SIH 26043)
// A singleton data store using localStorage to simulate backend persistence
// for the demo. It dispatches a CustomEvent on update so React can re-render.
// ─────────────────────────────────────────────────────────────────────────────

import { createSeedData } from './workflowSeedData';
import { DISTRICT_PROBLEM_IMAGES } from './districtProblemImages';
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
          // Merge stored challenges with seed data, preserving all stored modifications and progress.
          const seed = createSeedData();
          const seedMap = new Map(seed.challenges.map((sc: any) => [sc.id, sc]));
          const cleanParsedChallenges = (parsed.challenges || []).map((c: any) => {
            const seedCh = c.id ? seedMap.get(c.id) : null;
            let updated = { ...c };
            if (seedCh && seedCh.locationCoords) {
              updated.locationCoords = seedCh.locationCoords;
            }
            if (seedCh && seedCh.stageNumber <= 5) {
              updated.stageNumber = seedCh.stageNumber;
              updated.stageName = seedCh.stageName;
              updated.status = seedCh.status;
            }
            if (seedCh && seedCh.assignedHEI) {
              updated.assignedHEI = seedCh.assignedHEI;
              updated.assignedDept = seedCh.assignedDept;
            }
            if (c.id && DISTRICT_PROBLEM_IMAGES[c.id]) {
              updated.evidenceUrls = [DISTRICT_PROBLEM_IMAGES[c.id]];
            }
            return updated;
          }).filter((c: any) => 
            c.title && !/i cant attach photo|cant attach photo/i.test(c.title + ' ' + (c.description || ''))
          );
          const storedIds = new Set(cleanParsedChallenges.map((c: any) => c.id || c.reportId));
          const missingSeedChallenges = seed.challenges.filter((c: any) => !storedIds.has(c.id) && !storedIds.has(c.reportId));
          const mergedChallenges = [...cleanParsedChallenges, ...missingSeedChallenges];

          const seedPrjMap = new Map(seed.projects.map((sp: any) => [sp.id, sp]));
          const updatedParsedProjects = (parsed.projects || []).map((p: any) => {
            const seedPrj = p.id ? seedPrjMap.get(p.id) : null;
            if (seedPrj) {
              return {
                ...p,
                universityId: seedPrj.universityId,
                universityName: seedPrj.universityName,
                facultyMentorName: seedPrj.facultyMentorName,
                facultyEmail: seedPrj.facultyEmail,
                status: seedPrj.status,
              };
            }
            return p;
          });
          const storedPrjIds = new Set(updatedParsedProjects.map((p: any) => p.id));
          const missingSeedProjects = seed.projects.filter((p: any) => !storedPrjIds.has(p.id));
          const mergedProjects = [...updatedParsedProjects, ...missingSeedProjects];

          const seedPropMap = new Map(seed.proposals.map((sp: any) => [sp.id, sp]));
          const updatedParsedProposals = (parsed.proposals || []).map((p: any) => {
            const seedProp = p.id ? seedPropMap.get(p.id) : null;
            if (seedProp) {
              return {
                ...p,
                universityId: seedProp.universityId,
                universityName: seedProp.universityName,
                status: seedProp.status,
              };
            }
            return p;
          });
          const storedPropIds = new Set(updatedParsedProposals.map((p: any) => p.id));
          const missingSeedProposals = seed.proposals.filter((p: any) => !storedPropIds.has(p.id));
          const mergedProposals = [...updatedParsedProposals, ...missingSeedProposals];

          const storedTlIds = new Set((parsed.timelineEvents || []).map((t: any) => t.id));
          const missingSeedTimeline = seed.timelineEvents.filter((t: any) => !storedTlIds.has(t.id));
          const mergedTimeline = [...(parsed.timelineEvents || []), ...missingSeedTimeline];
          
          const finalState: WorkflowState = {
            ...parsed,
            challenges: mergedChallenges,
            projects: mergedProjects,
            proposals: mergedProposals,
            timelineEvents: mergedTimeline,
          };
          this.persist(finalState);
          return finalState;
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
    let finalChallenges = data.challenges ?? this.state.challenges;
    
    // IMPORTANT: Never let API data overwrite local DEMO seed challenges.
    // DEMO challenges have curated assignedHEI values that must be preserved.
    if (data.challenges) {
      const localDemos = this.state.challenges.filter(c => c.id.startsWith('DEMO-'));
      const incomingNonDemos = data.challenges.filter(c => !c.id.startsWith('DEMO-'));
      // Keep all local DEMOs + non-DEMO from API + any non-DEMO locals not in API
      const incomingIds = new Set(incomingNonDemos.map(c => c.id));
      const localNonDemosNotInApi = this.state.challenges.filter(c => !c.id.startsWith('DEMO-') && !incomingIds.has(c.id));
      finalChallenges = [...localDemos, ...incomingNonDemos, ...localNonDemosNotInApi];
    }

    this.persist({
      ...this.state,
      challenges: finalChallenges,
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

    // ── OPTIMISTIC LOCAL-FIRST PERSIST ──────────────────────────────────
    // Persist to localStorage immediately and return, so the citizen's report
    // is NEVER lost and the UI transitions to success in milliseconds. The
    // backend sync runs in the background (fire-and-forget) and can never
    // block the submit. Previously the local save awaited
    // `apiClient.createChallenge` FIRST — a large base64 photo payload could
    // stall against nginx/Express 1MB body limits (or the response-body read
    // hang), leaving the UI stuck on 'submitting' with the report never
    // written to the store. The background sync below is what actually pushes
    // the record to the backend for the GovPortal's API poll to pick up.
    const now = new Date().toISOString();
    const newChallenge: Challenge = {
      ...challenge,
      id: challenge.id || challenge.reportId || `CH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      reportId: challenge.reportId || challenge.id || `JH-2026-NIV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: challenge.createdAt || now,
      updatedAt: now,
    };

    const challenges = [newChallenge, ...this.state.challenges];
    this.persist({ ...this.state, challenges });

    // Background best-effort backend sync (non-blocking).
    (async () => {
      try {
        const apiRes = await apiClient.createChallenge(newChallenge as Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>);
        if (!apiRes.ok) {
          console.warn('[workflowStore] Backend sync skipped:', apiRes.error?.code, apiRes.error?.message);
        }
      } catch (e) {
        console.warn('[workflowStore] Backend sync failed (non-fatal):', e);
      }
    })();

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

    const isGovActor = actorRole.toLowerCase().includes('gov') || actorRole.toLowerCase().includes('department') || actorRole.toLowerCase().includes('admin') || actorRole.toLowerCase().includes('officer');
    if (currentStage.stageNumber !== nextStage.stageNumber && !isValidStageTransition(currentStage.stageNumber, nextStage.stageNumber) && !isGovActor) {
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
            id: `TL_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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

    this.addTimelineEvent({
      id: `TL_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
    const challenge = this.findChallengeByIdOrReportId(entityId);
    const validIds = new Set<string>([entityId]);
    if (challenge) {
      if (challenge.id) validIds.add(challenge.id);
      if (challenge.reportId) validIds.add(challenge.reportId);
    }
    return this.state.timelineEvents
      .filter((e) => validIds.has(e.entityId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addTimelineEvent(event: TimelineEvent) {
    const timelineEvents = [...this.state.timelineEvents, event];
    this.persist({ ...this.state, timelineEvents });
  }
}

// Export a single instance to be used application-wide
export const workflowStore = new WorkflowStore();
