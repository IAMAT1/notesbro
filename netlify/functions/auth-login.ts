import { Handler } from '@netlify/functions';
import { db, initializeDefaultData } from '../../shared/serverless-db';
import { users, loginSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { generateToken } from '../../shared/auth-utils';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    // Initialize default data on first request
    await initializeDefaultData();
    
    const body = JSON.parse(event.body || '{}');
    const { username, password } = loginSchema.parse(body);
    
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const authUser = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    
    const token = generateToken(authUser);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: authUser,
        token,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: 'Invalid request data' }),
    };
  }
};