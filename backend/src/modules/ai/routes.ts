import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
const r = Router();
r.get('/ai-decision-trace/:challengeId', authMiddleware, async (req, res) => {
  res.json({ challengeId: req.params.challengeId, aiRecommendations: [], humanDecisions: [] });
});
export default r;
