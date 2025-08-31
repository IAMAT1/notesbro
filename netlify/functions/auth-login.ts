import { Handler } from '@netlify/functions';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configure for serverless
neonConfig.fetchConnectionCache = true;

// Define schema directly in function to avoid import issues
const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
});

const JWT_SECRET = process.env.JWT_SECRET || 'notes-bro-jwt-secret-2025';

export const handler: Handler = async (event, context) => {
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
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Database not configured' }),
      };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });

    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Username and password required' }),
      };
    }

    // Special case: if logging in as admin/admin123, create the user if it doesn't exist
    if (username === 'admin' && password === 'admin123') {
      try {
        // Try to create tables if they don't exist
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
          )
        `);

        // Check if admin exists
        const existingUsers = await db.execute(sql`SELECT * FROM users WHERE username = 'admin'`);
        
        if (!existingUsers.rows || existingUsers.rows.length === 0) {
          // Create admin user
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await db.execute(sql`
            INSERT INTO users (username, password, role) 
            VALUES ('admin', ${hashedPassword}, 'admin')
          `);
        }
      } catch (createError) {
        console.error('Error creating admin user:', createError);
      }
    }

    // Now try to login
    const userResult = await db.execute(sql`SELECT * FROM users WHERE username = ${username}`);
    
    if (!userResult.rows || userResult.rows.length === 0) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    const user = userResult.rows[0] as any;
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
    
    const token = jwt.sign(authUser, JWT_SECRET, { expiresIn: '24h' });

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
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Login failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
    };
  }
};
