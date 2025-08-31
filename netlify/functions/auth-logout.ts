import { Handler } from '@netlify/functions';

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

  // In a serverless environment, session handling is different
  // For now, we'll just return a success response
  // In a real deployment, you'd handle JWT tokens or similar
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Logged out successfully' }),
  };
};