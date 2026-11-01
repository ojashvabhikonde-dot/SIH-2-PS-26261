import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Ensure .env is loaded regardless of working directory
const rootEnvPath = path.resolve(__dirname, '../../.env');
const backendEnvPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvPath });

// Resolve absolute path to SQLite dev.db
const defaultDbPath = path.resolve(__dirname, '../../prisma/dev.db').replace(/\\/g, '/');

const databaseUrl = process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
  ? process.env.DATABASE_URL
  : (process.env.DATABASE_URL?.startsWith('file:') && path.isAbsolute(process.env.DATABASE_URL.slice(5)))
  ? process.env.DATABASE_URL
  : `file:${defaultDbPath}`;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

export default prisma;

