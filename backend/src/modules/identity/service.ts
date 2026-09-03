import { PrismaClient } from '@prisma/client';
import { AppError } from '../../core/errors.js';

const prisma = new PrismaClient();

export const identityService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new AppError('NOT_FOUND', 'User not found');
    return {
      id: user.id,
      firebase_uid: user.firebase_uid,
      name: user.name,
      email: user.email,
      roles: user.roles.map((r: any) => r.role_name || r.role?.name),
    };
  },
  async listRoles() {
    return prisma.role.findMany({ orderBy: { priority: 'asc' } });
  },
};
