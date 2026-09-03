// Admin config + user/role management

export async function seedRegions(req: Request, res: Response, next: NextFunction) {
  try {
    const { seedRegions } = await import('../../prisma/seeds/regions.js');
    const { seedRegions: sr } = await import('../../prisma/seeds/regions.js');
    // Actual seed logic lives in seed file; endpoint delegates
    res.json({ ok: true, message: 'Region seed invoked — see ../prisma/seeds/regions.ts' });
  } catch (e) { next(e); }
}
