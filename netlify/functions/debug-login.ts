import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    // Debug info
    const debugInfo = {
      hasDatabase: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      receivedUsername: username,
      receivedPassword: password ? '***masked***' : 'empty',
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE')),
    };

    // If credentials are admin/admin123, return success with debug info
    if (username === 'admin' && password === 'admin123') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: { id: 'debug-admin', username: 'admin', role: 'admin' },
          token: 'debug-token-replace-with-real-jwt',
          debug: debugInfo,
        }),
      };
    }

    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        message: 'Invalid credentials',
        debug: debugInfo,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
