import { matchQueue } from './index';
matchQueue.process(async (job) => {
  // BE-072: matching engine → candidates → notify
  return { candidates: [] };
});
