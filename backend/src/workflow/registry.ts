// Transition registry: 23 actions × 22 edges per BACKEND_TASKS.md §30
export const TRANSITIONS = [
  { from: 'SUBMITTED', to: 'AI_UNDERSTANDING', action: 'understand', guard: 'understand' },
  { from: 'AI_UNDERSTANDING', to: 'CLARIFICATION_REQUESTED', action: 'requestClarification', guard: 'validate' },
  { from: 'CLARIFICATION_REQUESTED', to: 'VALIDATION_PENDING', action: 'validate', guard: 'validate' },
  { from: 'VALIDATION_PENDING', to: 'VALIDATED', action: 'confirm', guard: 'confirm' },
  { from: 'VALIDATED', to: 'REJECTED', action: 'reject', guard: 'validate' },
  { from: 'VALIDATED', to: 'CLUSTERED', action: 'prioritize', guard: 'prioritize' },
  { from: 'CLUSTERED', to: 'MATCHED', action: 'match', guard: 'match' },
  { from: 'MATCHED', to: 'IN_PILOT', action: 'accept', guard: 'accept' },
  { from: 'IN_PILOT', to: 'IN_DEPLOYMENT', action: 'approve', guard: 'approve' },
  { from: 'IN_DEPLOYMENT', to: 'IN_PROGRESS', action: 'verify', guard: 'verify' },
  { from: 'IN_PROGRESS', to: 'CLOSED', action: 'close', guard: 'close' },
];
export function allowed(from: string, to: string, action: string) {
  return TRANSITIONS.some(t => t.from === from && t.to === to && t.action === action);
}
