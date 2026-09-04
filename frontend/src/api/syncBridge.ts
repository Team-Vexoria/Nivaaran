// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — Sync Bridge (Phase 1 Migration: localStorage → API)
//
// Phase 1 dual-write strategy (per BACKEND_ARCHITECTURE.md §23):
//   • API writes succeed (write-through to backend)
//   • Frontend still reads from localStorage (no UI disruption)
//   • STORE_EVENT CustomEvent continues to fire so React re-renders
//
// This preserves backward compatibility while establishing the API as the
// authoritative write path. Phase 2 will switch reads to API-only.
// ─────────────────────────────────────────────────────────────────────────────

import { STORE_EVENT } from '../services/workflowStore';
import { apiClient } from './client';

export interface SyncEventDetail {
  type: string;
  entityType: 'challenge' | 'project' | 'proposal' | 'timeline';
  entityId?: string;
  action: string;
  payload?: unknown;
}

// Track pending sync operations for optimistic UI
const pendingSyncs = new Map<string, Promise<unknown>>();

/**
 * Phase 1 Sync Bridge — API write-through with localStorage fallback reads.
 *
 * Bridges the existing workflowStore (localStorage-based) to the new typed API client.
 * - Writes go through apiClient → backend (authoritative)
 * - Reads still serve from workflowStore (localStorage) for minimal disruption
 * - STORE_EVENT CustomEvent fires after successful sync so React re-renders
 */
export function syncBridge(): void {
  if (typeof window === 'undefined') return;

  // ── Listen for store mutations → forward to API (write-through) ──
  window.addEventListener(
    STORE_EVENT,
    async (e: Event) => {
      const detail = (e as CustomEvent<SyncEventDetail>).detail;
      if (!detail) return;

      const syncPromise = performSync(detail);
      const key = `${detail.entityType}-${detail.entityId}-${Date.now()}`;
      pendingSyncs.set(key, syncPromise);
      syncPromise.finally(() => pendingSyncs.delete(key));
    }
  );
}

/**
 * Perform the actual API sync based on the event detail.
 * Returns the API response or null on failure (localStorage remains source of truth).
 */
async function performSync(detail: SyncEventDetail): Promise<unknown | null> {
  try {
    switch (detail.action) {
      case 'challenge:created':
      case 'challenge:added': {
        const payload = detail.payload as Record<string, unknown>;
        const res = await apiClient.createChallenge(payload as Parameters<typeof apiClient.createChallenge>[0]);
        if (res.ok) {
          console.debug('[SyncBridge] Challenge created via API:', res.ok);
        }
        return res;
      }

      case 'challenge:status_changed':
      case 'challenge:transitioned': {
        const payload = detail.payload as { id?: string; status?: string };
        const id = payload.id || detail.entityId;
        if (!id) return null;
        const res = await apiClient.transitionChallenge(id, 'statusChange', {
          newStatus: payload.status,
        });
        if (res.ok) {
          console.debug('[SyncBridge] Challenge transition via API:', id);
        }
        return res;
      }

      case 'project:created': {
        const payload = detail.payload as Record<string, unknown>;
        const res = await apiClient.createProject(payload as Parameters<typeof apiClient.createProject>[0]);
        if (res.ok) {
          console.debug('[SyncBridge] Project created via API:', res.ok);
        }
        return res;
      }

      case 'proposal:submitted': {
        const payload = detail.payload as Record<string, unknown>;
        const res = await apiClient.submitProposal(payload as Parameters<typeof apiClient.submitProposal>[0]);
        if (res.ok) {
          console.debug('[SyncBridge] Proposal submitted via API:', res.ok);
        }
        return res;
      }

      default:
        // Unknown action — ignore silently
        return null;
    }
  } catch (err) {
    console.error('[SyncBridge] Sync failed:', err);
    // Phase 1: failure doesn't block localStorage — UI still works
    return null;
  }
}

/**
 * Read data from API with localStorage fallback (Phase 1 pattern).
 * Uses apiClient if token available; falls back to workflowStore if offline/unauthorized.
 */
export async function fetchWithFallback<T>(
  apiCall: () => Promise<{ ok: boolean; data?: T }>,
  storeFallback: () => T
): Promise<{ data: T; source: 'api' | 'localStorage' }> {
  try {
    const res = await apiCall();
    if (res.ok && res.data) {
      return { data: res.data, source: 'api' };
    }
  } catch {
    // Fall through to localStorage
  }
  return { data: storeFallback(), source: 'localStorage' };
}

/**
 * Wait for any in-flight sync operations to complete.
 * Useful before switching to Phase 2 API-only reads.
 */
export async function drainPendingSyncs(): Promise<void> {
  const pending = Array.from(pendingSyncs.values());
  if (pending.length > 0) {
    await Promise.all(pending);
  }
}

// Auto-initialize sync bridge on module import
syncBridge();
