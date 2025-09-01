export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    console.log('Login attempt:', { username, password });

    // Simple hardcoded admin check
    if (username === 'admin' && password === 'admin123') {
      const response = {
        user: {
          id: 'admin-1',
          username: 'admin',
          role: 'admin'
        },
        token: 'VALID_ADMIN_TOKEN_2025'
      };

      console.log('Login successful:', response);

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      };
    }

    console.log('Login failed: Invalid credentials');
    
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Invalid credentials' }),
    };
    
  } catch (error) {
    console.error('Login error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Server error' }),
    };
  }
};
