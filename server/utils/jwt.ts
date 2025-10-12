import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface TokenPayload {
  id: number;
  email: string;
  type: 'student' | 'coordinator';
}

export function generateToken(payload: TokenPayload): string {
  const expiresIn = payload.type === 'student' ? '7d' : '1d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
