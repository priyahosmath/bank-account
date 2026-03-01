import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Set up WebSocket for Neon serverless client if needed
neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || '';

let pool: Pool | null = null;

export async function getDb() {
  if (!DATABASE_URL) {
    // In production, this error will be caught by the API route and logged
    console.error('CRITICAL: DATABASE_URL is missing from environment variables.');
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      // Forcing SSL for Neon
      ssl: true
    });
  }

  return pool;
}

// Function to initialize the database schema for Postgres
export async function initDb() {
  try {
    const db = await getDb();

    // Using a simpler check for schema initialization
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 5000.0
      );
      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return db;
  } catch (error) {
    console.error('Database Initialization Error:', error);
    throw error;
  }
}
