import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'notes-bro-jwt-secret-2025';

export async function handler(event: any) {
  // Allow CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    
    // Hardcoded admin login for testing
    if (body.username === 'admin' && body.password === 'admin123') {
      const user = {
        id: 'admin-1',
        username: 'admin',
        role: 'admin'
      };
      
      // Generate a real JWT token
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
      
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          user,
          token
        }),
      };
    }

    return {
      statusCode: 401,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Invalid credentials' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Server error' }),
    };
  }
}
