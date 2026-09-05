import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/prisma.js';
import { DISTRICTS } from '../../constants/districts.js';

export async function districtHeatmap(req: Request, res: Response, next: NextFunction) {
  try {
    const groups = await prisma.challenge.groupBy({
      by: ['district_code'],
      where: { deleted_at: null },
      _count: { id: true },
      _avg: { priority_score: true },
    });

    const districts = DISTRICTS.map((d) => {
      const match = groups.find((g) => g.district_code === d.code);
      const total = match ? match._count.id : 0;
      return {
        districtCode: d.code,
        districtName: d.name,
        totalChallenges: total,
        activeChallenges: total,
        avgPriorityScore: match?._avg.priority_score ? Number(match._avg.priority_score) : null,
      };
    });

    res.json({
      ok: true,
      data: {
        districts,
        totalCount: districts.reduce((acc, d) => acc + d.totalChallenges, 0),
      },
    });
  } catch (e) {
    next(e);
  }
}

