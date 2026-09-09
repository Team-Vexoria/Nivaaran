// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — React Hook for API-backed Workflow Store (Phase 2)
//
// Reads from apiClient (API-first). Writes through apiClient.
// Falls back to localStorage when API is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useWorkflowStore } from './useWorkflowStore';
import { workflowStore } from './workflowStore';
import { toWorkflowChallengeFromApi } from './workflowAdapters';
import { apiClient, ApiError } from '../api/client';
import type { WorkflowState, Challenge, Project } from './workflowTypes';

interface UseApiWorkflowStoreReturn extends WorkflowState {
  source: 'localStorage' | 'api';
  loading: boolean;
  error: ApiError | null;
  transitionChallenge: (id: string, action: string, payload?: Record<string, unknown>) => Promise<boolean>;
  createChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  refreshFromApi: () => Promise<void>;
}

export function useApiWorkflowStore(): UseApiWorkflowStoreReturn {
  const storeState = useWorkflowStore();
  const [source, setSource] = useState<'localStorage' | 'api'>('localStorage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Load from API on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [chRes, projRes, propRes] = await Promise.all([
          apiClient.getChallenges(),
          apiClient.getProjects(),
          apiClient.getProposals(),
        ]);
        
        if (cancelled) return;

        const challenges: Challenge[] = [];
        if (chRes.ok && chRes.data && Array.isArray(chRes.data)) {
          for (const item of chRes.data) {
            challenges.push(toWorkflowChallengeFromApi(item));
          }
        }

        const projects: Project[] = [];
        if (projRes.ok && projRes.data && Array.isArray(projRes.data)) {
          for (const item of projRes.data) {
            projects.push(item as Project);
          }
        }

        const proposals = propRes.ok && propRes.data && Array.isArray(propRes.data) ? propRes.data : [];

        // Bulk-load into workflowStore (no API calls triggered)
        workflowStore.loadFromApi({ challenges, projects, proposals });
        
        if (challenges.length > 0) {
          setSource('api');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e : new ApiError('LOAD_ERROR', 'Failed to load from API'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Force refresh from API
  const refreshFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const chRes = await apiClient.getChallenges();
      if (chRes.ok && chRes.data && Array.isArray(chRes.data)) {
        const challenges = chRes.data.map((item: any) => toWorkflowChallengeFromApi(item));
        workflowStore.loadFromApi({ challenges });
        setSource('api');
      }
    } catch (e) {
      if (e instanceof ApiError) setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Write-through actions ──────────────────────────────────────────

  const transitionChallenge = useCallback(
    async (id: string, action: string, payload?: Record<string, unknown>): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient.transitionChallenge(id, action, payload);
        if (res.ok) {
          // Refresh the specific challenge from store
          const challenge = workflowStore.getChallenge(id);
          if (challenge && payload?.newStatus) {
            await workflowStore.transitionChallenge(
              id,
              payload.newStatus as any,
              (payload.actor as string) || 'User',
              (payload.actorRole as string) || 'CITIZEN',
              payload.note as string | undefined
            );
          }
          return true;
        }
        setError(new ApiError(
          (res as any).error?.code || 'UNKNOWN',
          (res as any).error?.message || 'Transition failed'
        ));
        return false;
      } catch (e) {
        if (e instanceof ApiError) setError(e);
        return false;
      }
    },
    []
  );

  const createChallenge = useCallback(
    async (challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient.createChallenge(challenge);
        if (res.ok && res.data) {
          const adapted = toWorkflowChallengeFromApi(res.data);
          await workflowStore.addChallenge(adapted);
          return true;
        }
        setError(new ApiError(
          (res as any).error?.code || 'UNKNOWN',
          (res as any).error?.message || 'Create failed'
        ));
        return false;
      } catch (e) {
        if (e instanceof ApiError) setError(e);
        return false;
      }
    },
    []
  );

  const createProject = useCallback(
    async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient.createProject(project);
        if (res.ok && res.data) {
          await workflowStore.createProject(res.data as Project);
          return true;
        }
        setError(new ApiError(
          (res as any).error?.code || 'UNKNOWN',
          (res as any).error?.message || 'Create failed'
        ));
        return false;
      } catch (e) {
        if (e instanceof ApiError) setError(e);
        return false;
      }
    },
    []
  );

  return {
    ...storeState,
    source,
    loading,
    error,
    transitionChallenge,
    createChallenge,
    createProject,
    refreshFromApi,
  };
}
