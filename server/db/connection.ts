import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "residencecare",
  password: process.env.DATABASE_PASSWORD || "ResidenceCare@123",
  database: process.env.DATABASE_NAME || "residence_care",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool);

export function getDb() {
  return db;
}
