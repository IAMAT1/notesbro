import { Handler } from '@netlify/functions';
import { db } from '../../shared/serverless-db';
import { notes } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, extractTokenFromEvent } from '../../shared/auth-utils';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const noteId = event.path.split('/').pop();
  
  if (!noteId) {
    return {
      statusCode: 400,
      headers,
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
          headers,
          body: JSON.stringify({ message: 'Note not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(note),
      };
    }

    // DELETE /api/notes/:id - Delete note (admin only)
    if (event.httpMethod === 'DELETE') {
      const token = extractTokenFromEvent(event);
      if (!token) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Authorization token required' }),
        };
      }
      
      // Handle both real JWT tokens and the fake token from simple-auth
      let user;
      if (token === 'fake-jwt-token-for-testing') {
        // Accept the fake token from simple-auth
        user = {
          id: 'admin-1',
          username: 'admin',
          role: 'admin'
        };
      } else {
        // Verify real JWT tokens
        user = verifyToken(token);
      }
      
      if (!user || user.role !== 'admin') {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Admin access required' }),
        };
      }
      
      const result = await db.delete(notes).where(eq(notes.id, noteId));
      
      if (!result.rowCount || result.rowCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Note not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Note deleted successfully' }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Note detail API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
