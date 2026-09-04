import { aiQueue, QueueJob } from './index';

aiQueue.process(async (job: QueueJob) => {
  // BE-071: AI understand → embed → recommend → transition
  return { done: true, jobId: job.id };
});
