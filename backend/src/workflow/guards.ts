export const guards = { understand: () => true, validate: () => true, confirm: () => true };

export const checkCapabilities = (auth: any) => auth?.permissions?.has('challenge:prioritize') || false;
export const guards = { ... // 10 invariants with allow/deny/reason */ };
