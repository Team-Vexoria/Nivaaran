import { Router } from 'express';
const r = Router();
r.get('/clusters', async (req, res) => res.json({ clusters: [] }));
r.get('/clusters/:id', async (req, res) => res.json({ id: req.params.id, members: [] }));
export default r;
