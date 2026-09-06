import { Router } from 'express';
import { extractEntities } from './entityExtractor';
import { researchProblem } from './internetResearch';
import { scorePriority } from './AIProvider';

const r = Router();

// GET AI decision trace for a challenge
r.get('/ai-decision-trace/:challengeId', async (req, res) => {
  res.json({ challengeId: req.params.challengeId, aiRecommendations: [], humanDecisions: [] });
});

// POST Stage 4: Entity Extraction
r.post('/extract-entities', async (req, res) => {
  try {
    const { description, title } = req.body;
    if (!description && !title) {
      return res.status(400).json({ error: 'Description or title is required' });
    }
    const entities = await extractEntities(description || '', title || '');
    return res.json({ success: true, data: entities });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Entity extraction failed' });
  }
});

// POST Stage 4: Internet & Government Intelligence Research
r.post('/research-problem', async (req, res) => {
  try {
    const { entities } = req.body;
    const research = await researchProblem(entities || {});
    return res.json({ success: true, data: research });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Internet research failed' });
  }
});

// POST Stage 5: 4-Pillar (25% x 4) Priority Scoring
r.post('/score-priority', async (req, res) => {
  try {
    const { challenge, spatial, upvotes } = req.body;
    const result = scorePriority(challenge || {}, spatial, upvotes || 0);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Priority scoring failed' });
  }
});

export default r;
