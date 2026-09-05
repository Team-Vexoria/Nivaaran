import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { DISTRICTS, BLOCKS } from '../../constants/regions.js';

// Admin config + user/role management

export async function seedRegions(_req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const d of DISTRICTS) {
        await tx.district.upsert({ where: { code: d.code }, update: { name: d.name }, create: { code: d.code, name: d.name } });
      }
      for (const b of BLOCKS) {
        await tx.block.upsert({ where: { code: b.code }, update: { name: b.name }, create: { ...b } });
      }
    });
    res.json({ ok: true, message: `Seeded ${DISTRICTS.length} districts and ${BLOCKS.length} blocks` });
  } catch (e) {
    next(e);
  }
}
