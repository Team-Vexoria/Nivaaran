import { aiQueue } from './index';
aiQueue.process(async (job) => {
  // BE-071: AI understand → embed → recommend → transition
  return { done: true };
});
