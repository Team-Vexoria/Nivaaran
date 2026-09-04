import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { getPresignedUrl } from '../../core/s3.js';
import { EvidenceType } from '@prisma/client';

export async function presign(req: Request, res: Response, next: NextFunction) {
  try {
    const url = await getPresignedUrl(req.body.filename, req.body.contentType, 'upload');
    res.json({ ok: true, data: { uploadUrl: url, key: req.body.filename } });
  } catch (e) {
    next(e);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const typeStr = (req.body.type || 'PHOTO').toUpperCase();
    const evidenceType = (EvidenceType as any)[typeStr] || EvidenceType.PHOTO;
    const ev = await prisma.challengeEvidence.create({
      data: {
        challenge_id: req.body.challenge_id,
        type: evidenceType,
        storage_ref: req.body.url || req.body.storage_ref || req.body.filename,
        mime_type: req.body.mime_type || 'image/jpeg',
        uploader_id: (req as any).auth?.user?.id || req.body.uploader_id || 'anonymous-uploader',
        meta: req.body.caption || req.body.district_code ? {
          caption: req.body.caption || null,
          district_code: req.body.district_code || null,
          block_code: req.body.block_code || null,
        } : undefined,
      },
    });
    res.json({ ok: true, data: ev });
  } catch (e) {
    next(e);
  }
}
