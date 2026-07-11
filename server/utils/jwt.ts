import jwt from 'jsonwebtoken';

// No insecure fallback: tokens signed with a known default secret are forgeable.
function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set. Add it to your environment or .env file.');
  }
  return secret;
}

export interface TokenPayload {
  id: number;
  email: string;
  type: 'student' | 'coordinator';
}

export function generateToken(payload: TokenPayload): string {
  const expiresIn = payload.type === 'student' ? '7d' : '1d';
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
