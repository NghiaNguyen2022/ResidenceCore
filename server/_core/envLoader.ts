import dotenv from 'dotenv';
import path from 'path';

// Load .env trước
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Load .env.local sau (override .env)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('[envLoader] DATABASE_URL:', process.env.DATABASE_URL ? '✓ Loaded' : '✗ Missing');
console.log('[envLoader] JWT_SECRET:', process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing');
