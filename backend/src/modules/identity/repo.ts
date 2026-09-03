import { prisma } from '../../core/prisma.js';

export const identityRepo = {
  byId: (id: string) => prisma.user.findUnique({ where: { id } }),
  rolesByUser: (userId: string) => prisma.userRoleLink.findMany({ where: { user_id: userId } }),
};
