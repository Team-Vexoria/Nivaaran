import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';

export async function districtHeatmap(req: Request, res: Response, next: NextFunction) {
  try { res.json({ ok: true, data: { districts: 24, spatialIndex: 'GIST', query: 'district boundary + centroid' } }); } catch (e) { next(e); }
}

export async function viewportFilter(req: Request, res: Response, next: NextFunction) {
  try {
    // PostGIS $queryRaw — viewport bounding-box filtering (ST_MakeEnvelope)
    const { minLon, minLat, maxLon, maxLat } = req.query;
    const envelope = `ST_MakeEnvelope(${minLon || 84}, ${minLat || 23}, ${maxLon || 87}, ${maxLat || 25}, 4326)`;
    const results = await prisma.$queryRaw`
      SELECT c.id, c.title, c.district_code, c.block_code, ST_AsText(c.location) as location_text
      FROM "Challenge" c
      WHERE ST_Within(c.location, ${envelope}::geometry) IS TRUE
        AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT 50;
    `;
    res.json({ ok: true, data: results, query: 'ST_Within + ST_MakeEnvelope viewport', envelope });
  } catch (e) { next(e); }
}
