import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
export async function districtHeatmap(req: Request, res: Response, next: NextFunction) {
  try {
    // Pre-aggregated server-side heatmap per district (challenge count + severity + priority score aggregation)
    const data = await prisma.$queryRaw`
      SELECT c.district_code, COUNT(*) as challenge_count, AVG(c.priority_score) as avg_priority
      FROM "Challenge" c WHERE c.deleted_at IS NULL GROUP BY c.district_code ORDER BY challenge_count DESC LIMIT 24;
    `;
    res.json({ ok: true, data, endpoint: '/api/v1/analytics/district-heatmap', aggregated: true, source: 'Postgres $queryRaw' });
  } catch (e) { next(e); }
}
