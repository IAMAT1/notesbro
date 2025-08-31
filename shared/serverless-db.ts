import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Configure for serverless environment
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Initialize default data function for serverless
export async function initializeDefaultData() {
  try {
    const bcrypt = await import('bcrypt');
    const { users } = schema;
    const { eq } = await import('drizzle-orm');
    
    // Check if admin user exists
    const existingUsers = await db.select().from(users).where(eq(users.username, "admin"));
    if (existingUsers.length === 0) {
      // Create default admin user with hashed password
      const hashedPassword = await bcrypt.default.hash("admin123", 10);
      const [newUser] = await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      }).returning();
      console.log("Created admin user:", newUser.username);
    }
  } catch (error) {
    console.error("Error initializing default data:", error);
    throw error; // Re-throw to see the actual error
  }
}
