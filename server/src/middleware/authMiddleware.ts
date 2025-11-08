import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Create JWT verifier for Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        cognitoId: string;
        userId: number;
        username: string;
        role: UserRole;
        isActive: boolean;
      };
    }
  }
}

/**
 * Verify JWT token from Cognito
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    // Verify token with Cognito
    const payload = await verifier.verify(token);
    const cognitoId = payload.sub;

    // Get user from database with role info
    const user = await prisma.user.findUnique({
      where: { cognitoId },
      select: {
        userId: true,
        cognitoId: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user is active (default to true if null)
    if (user.isActive === false) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Attach user to request with defaults
    req.user = {
      cognitoId: user.cognitoId,
      userId: user.userId,
      username: user.username,
      role: user.role || 'MEMBER', // Default to MEMBER if null
      isActive: user.isActive ?? true, // Default to true if null
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Require specific roles
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
};

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Admin or Project Manager middleware
 */
export const requireManager = requireRole(['ADMIN', 'PROJECT_MANAGER']);
