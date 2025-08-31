import { type User, type InsertUser, type Note, type InsertNote, users, notes } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, ilike, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Note methods
  getAllNotes(): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: string): Promise<boolean>;
  searchNotes(filters: {
    search?: string;
    class?: string;
    subject?: string;
    noteType?: string;
  }): Promise<Note[]>;
}

// Legacy MemStorage class kept for reference but not used

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const existingAdmin = await this.getUserByUsername("admin");
      if (!existingAdmin) {
        // Create default admin user with hashed password
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await db.insert(users).values({
          username: "admin",
          password: hashedPassword,
          role: "admin"
        });
      }
      // No longer adding sample notes - admin will add their own notes
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // Sample notes method removed - admin will manage all notes

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getAllNotes(): Promise<Note[]> {
    return await db.select().from(notes);
  }

  async getNoteById(id: string): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async searchNotes(filters: {
    search?: string;
    class?: string;
    subject?: string;
    noteType?: string;
  }): Promise<Note[]> {
    const conditions = [];
    
    if (filters.search) {
      conditions.push(
        or(
          ilike(notes.title, `%${filters.search}%`),
          ilike(notes.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters.class) {
      conditions.push(eq(notes.class, filters.class));
    }
    
    if (filters.subject) {
      conditions.push(eq(notes.subject, filters.subject));
    }
    
    if (filters.noteType) {
      conditions.push(eq(notes.noteType, filters.noteType));
    }
    
    if (conditions.length === 0) {
      return await db.select().from(notes);
    }
    
    return await db.select().from(notes).where(
      conditions.length === 1 ? conditions[0] : and(...conditions)
    );
  }
}

export const storage = new DatabaseStorage();
