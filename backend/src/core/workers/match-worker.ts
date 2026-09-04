import { matchQueue, QueueJob } from './index';

matchQueue.process(async (job: QueueJob) => {
  // BE-072: matching engine → candidates → notify
  return { candidates: [], jobId: job.id };
});
