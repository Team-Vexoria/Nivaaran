import { z } from 'zod';

export const strictValidate = (s: z.ZodSchema, d: unknown) => s.parse(d);

let isCircuitOpen = false;

export const breaker = {
  get open(): boolean {
    return isCircuitOpen;
  },
  set open(val: boolean) {
    isCircuitOpen = val;
  },
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (isCircuitOpen) {
      throw new Error('CIRCUIT_BREAKER_OPEN');
    }
    try {
      return await fn();
    } catch (err) {
      isCircuitOpen = true;
      throw new Error('UPSTREAM_FAILURE');
    }
  },
};
