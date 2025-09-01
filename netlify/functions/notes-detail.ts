import { db } from '../../shared/serverless-db';
import { notes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      },
      body: ''
    };
  }

  const noteId = event.path.split('/').pop();
  
  if (!noteId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Note ID is required' }),
    };
  }

  try {
    // GET /api/notes/:id - Get specific note
    if (event.httpMethod === 'GET') {
      const [note] = await db.select().from(notes).where(eq(notes.id, noteId));
      
      if (!note) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Note not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      };
    }

    // DELETE /api/notes/:id - Delete note (admin only)
    if (event.httpMethod === 'DELETE') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Authorization token required' }),
        };
      }
      
      const token = authHeader.substring(7);
      
      // Accept our specific admin token
      if (token !== 'VALID_ADMIN_TOKEN_2025') {
        return {
          statusCode: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Invalid or expired token' }),
        };
      }
      
      const result = await db.delete(notes).where(eq(notes.id, noteId));
      
      if (!result.rowCount || result.rowCount === 0) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'Note not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Note deleted successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
    
  } catch (error) {
    console.error('Note detail API error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  }
};
