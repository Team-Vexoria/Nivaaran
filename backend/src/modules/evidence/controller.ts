import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { getPresignedUrl } from '../../core/s3.js';
export async function presign(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await getPresignedUrl(req.body.filename, req.body.contentType, 'upload');
    res.json({ ok: true, data: { uploadUrl: url, key: req.body.filename } });
  } catch (e) { next(e); }
}
export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const ev = await prisma.evidence.create({ data: { challenge_id: req.body.challenge_id, type: req.body.type, url: req.body.url, geotag: req.body.geotag ? JSON.stringify(req.body.geotag) : null, uploaded_by: req.auth?.user?.id || 'system' } });
    res.json({ ok: true, data: ev });
  } catch (e) { next(e); }
}
