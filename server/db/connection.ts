import * as mysql from "mysql2/promise";
import type * as schema from "../../drizzle/schema";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "residencecare",
  password: process.env.DATABASE_PASSWORD || "ResidenceCare@123",
  database: process.env.DATABASE_NAME || "residence_care",
  charset: "utf8mb4_unicode_ci",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle<typeof schema>(pool as any);

export function getDb(): MySql2Database<typeof schema> {
  return db;
}
