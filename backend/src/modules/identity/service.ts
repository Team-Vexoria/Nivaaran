import { prisma } from '../../core/prisma.js';
import { NotFoundError } from '../../core/errors.js';

export const identityService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundError('User not found');
    return {
      id: user.id,
      firebase_uid: user.firebase_uid,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r: any) => r.role.name),
    };
  },
  async listRoles() {
    return prisma.role.findMany({ orderBy: { name: 'asc' } });
  },
};
