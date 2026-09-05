// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — React Hook for API-backed Workflow Store (Phase 1)
//
// Bridges the typed API client with the existing useWorkflowStore React hook.
// Phase 2: reads from apiClient (API-first). Writes still through apiClient.
          // dual-write sunset (BACKEND_ARCHITECTURE.md §23) — API authoritative.
// Phase 2 ACTIVE: reads from apiClient.getChallenges()/getProjects()/getProposals()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useWorkflowStore } from './useWorkflowStore';
import { workflowStore } from './workflowStore';
import { toWorkflowChallengeFromApi } from './workflowAdapters';
import { apiClient } from '../api/client';
import { ApiError } from '../api/client';
import type { WorkflowState, Challenge, Project } from './workflowTypes';

interface UseApiWorkflowStoreReturn extends WorkflowState {
  // Phase 2: reading from apiClient (API-first)
  source: 'localStorage' | 'api';
  loading: boolean;
  error: ApiError | null;
  // Actions that write through to API
  transitionChallenge: (id: string, action: string, payload?: Record<string, unknown>) => Promise<boolean>;
  createChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  // Phase 2 readiness: force refresh from API
  refreshFromApi: () => Promise<void>;
}

export function useApiWorkflowStore(): UseApiWorkflowStoreReturn {
  const storeState = useWorkflowStore();
  const [source, setSource] = useState<'localStorage' | 'api'>('localStorage');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Phase 2 readiness: background refresh from API (non-blocking)
  const refreshFromApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getChallenges();
      if (res.ok && res.data && Array.isArray(res.data)) {
        for (const item of res.data) {
          const adapted = toWorkflowChallengeFromApi(item);
          await workflowStore.addChallenge(adapted);
        }
        setSource('api');
      }
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e);
      }
      // Stay on localStorage on failure
    } finally {
      setLoading(false);
    }
  }, []);

  // Phase 2: load from API as primary source; localStorage as fallback only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [chRes, _projRes, _propRes] = await Promise.all([
          apiClient.getChallenges(), apiClient.getProjects(), apiClient.getProposals()
        ]);
        if (!cancelled) {
          if (chRes.ok && chRes.data && Array.isArray(chRes.data)) {
            for (const item of chRes.data) {
              const adapted = toWorkflowChallengeFromApi(item);
              await workflowStore.addChallenge(adapted);
            }
            setSource('api');
          }
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) { setLoading(false); setError(e instanceof ApiError ? e : new ApiError('LOAD_ERROR', 'Failed to load from API')); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Write-through actions ──────────────────────────────────────────

  const transitionChallenge = useCallback(
    async (id: string, action: string, payload?: Record<string, unknown>): Promise<boolean> => {
      setError(null);
      try {
        const res = await apiClient.transitionChallenge(id, action, payload);
        if (res.ok) {
          if (payload?.newStatus) {
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
        if (res.ok) return true;
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
