import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'notes-bro-jwt-secret-2025';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function extractTokenFromEvent(event: any): string | null {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}