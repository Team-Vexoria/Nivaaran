// Point-in-polygon automatic district attribution (PostGIS ST_Contains / ST_Within)
import { prisma } from '../../core/prisma.js';
export async function attributeDistrict(lon: number, lat: number): Promise<string | null> {
  const result = await prisma.$queryRaw`SELECT d.code FROM "District" d WHERE ST_Contains(d.boundary, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)) LIMIT 1`;
  return result?.[0]?.code ?? null;
}
