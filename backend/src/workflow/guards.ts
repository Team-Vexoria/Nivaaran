export const guards = { understand: () => true, validate: () => true, confirm: () => true };

export const checkCapabilities = (auth: any) => auth?.permissions?.has('challenge:prioritize') || false;
