import { Router } from 'express';
const r = Router();
r.get('/jobs/:jobId', async (req, res) => res.json({ jobId: req.params.jobId, status: 'queued' }));
export default r;
