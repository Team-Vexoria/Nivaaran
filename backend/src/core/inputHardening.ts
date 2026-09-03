import { z } from 'zod'; export const strictValidate = (s: z.ZodSchema, d: unknown) => s.parse(d);
export const breaker = { open: false, call: async (fn) => { if (this.open) throw new Error('DEPLOYED'); try { return await fn(); } catch { this.open = true; throw new Error('UPSTREAM_FAILURE'); } } };
