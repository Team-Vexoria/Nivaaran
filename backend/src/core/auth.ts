import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase'; // Assumes firebase admin is configured here
import { prisma } from './prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    firebase_uid: string;
    roles: string[];
    organization_id?: string | null;
  };
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch the platform profile from PostgreSQL
    const dbUser = await prisma.user.findUnique({
      where: { firebase_uid: decodedToken.uid },
      include: { roles: true }
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'User profile not found in database' });
    }

    req.user = {
      id: dbUser.id,
      firebase_uid: dbUser.firebase_uid,
      roles: dbUser.roles.map(r => r.role_name),
      organization_id: dbUser.organization_id,
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
