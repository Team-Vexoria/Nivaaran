import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

export const verifyFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header.' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (!firebaseAuth) {
      throw new Error('Firebase Admin Auth instance is not initialized.');
    }
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken.role as string) || 'Citizen',
    };
    return next();
  } catch (error) {
    // Development mode fallback
    if (process.env.NODE_ENV === 'development' && token.startsWith('demo_')) {
      req.user = {
        uid: token,
        email: 'demo@nivaaran.gov.in',
        role: (req.headers['x-demo-role'] as string) || 'Citizen',
      };
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Invalid or expired Firebase ID token.', details: error });
  }
};

export const requireRoles = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden: User identity or role missing.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized for this resource. Required: [${roles.join(', ')}]`,
      });
    }

    return next();
  };
};
