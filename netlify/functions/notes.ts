import { db } from '../../shared/serverless-db';
import { notes, insertNoteSchema } from '../../shared/schema';
import { eq, and, ilike, or, type SQL } from 'drizzle-orm';
import { z } from 'zod';

export const handler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: ''
    };
  }

  try {
    // GET /api/notes - Get all notes with optional filters
    if (event.httpMethod === 'GET') {
      const { search, class: cls, subject, noteType } = event.queryStringParameters || {};
      
      const conditions: SQL<unknown>[] = [];
      
      if (search) {
        conditions.push(
          or(
            ilike(notes.title, `%${search}%`),
            ilike(notes.description, `%${search}%`)
          )!
        );
      }
      
      if (cls) {
        conditions.push(eq(notes.class, cls));
      }
      
      if (subject) {
        conditions.push(eq(notes.subject, subject));
      }
      
      if (noteType) {
        conditions.push(eq(notes.noteType, noteType));
      }
      
      let result;
      if (conditions.length === 0) {
        result = await db.select().from(notes);
      } else {
        result = await db.select().from(notes).where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        );
      }
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      };
    }

    // POST /api/notes - Create a new note (admin only)
    if (event.httpMethod === 'POST') {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      
      console.log('Auth header:', authHeader);
      
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
      console.log('Token:', token);
      
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
      
      const body = JSON.parse(event.body || '{}');
      console.log('Note data:', body);
      
      const noteData = insertNoteSchema.parse(body);
      
      const [note] = await db
        .insert(notes)
        .values(noteData)
        .returning();
        
      console.log('Created note:', note);
        
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
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
    console.error('Notes API error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'Invalid data', errors: error.errors }),
      };
    }
    
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
