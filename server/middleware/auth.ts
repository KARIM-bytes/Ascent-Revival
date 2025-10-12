import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access token required',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }
};

export const requireStudent = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== 'student') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Student access required.',
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

export const requireCoordinator = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.type !== 'coordinator') {
    return res.status(403).json({
      error: true,
      message: 'Access denied. Coordinator access required.',
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
  }
  next();
};
