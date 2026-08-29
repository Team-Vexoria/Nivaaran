// ─────────────────────────────────────────────────────────────────────────────
// NIVAARAN — React Hook for Workflow Store (SIH 26043)
// Subscribes to the workflowStore CustomEvent to trigger React re-renders.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { workflowStore, STORE_EVENT } from './workflowStore';
import type { WorkflowState } from './workflowTypes';

/**
 * A custom React hook that provides reactive access to the global WorkflowStore.
 * Components using this hook will re-render automatically when the store changes.
 */
export function useWorkflowStore(): WorkflowState {
  const [state, setState] = useState<WorkflowState>(workflowStore.getState());

  useEffect(() => {
    // Handler that syncs React state with the latest store state
    const handleUpdate = () => {
      setState(workflowStore.getState());
    };

    // Listen for the custom event emitted by workflowStore.persist()
    window.addEventListener(STORE_EVENT, handleUpdate);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener(STORE_EVENT, handleUpdate);
    };
  }, []);

  return state;
}
