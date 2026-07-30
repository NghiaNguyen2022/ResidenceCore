import { mysqlTable, int, varchar, text, timestamp, boolean, date, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended to support multiple roles: admin, manager, supervisor, accountant, resident
 */
export const users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      username: varchar("username", { length: 64 }).notNull().unique(),
      passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
      name: text("name"),
      email: varchar("email", { length: 320 }).unique(),
      role: mysqlEnum("role", ["user", "admin", "manager", "supervisor", "accountant", "resident"]).default("user").notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn"),
      mustChangePassword: boolean("mustChangePassword").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Session table for tracking user sessions
 */
export const sessions = mysqlTable("sessions", {
      id: varchar("id", { length: 255 }).primaryKey(),
      userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Schools table - Educational institutions
 */
export const schools = mysqlTable("schools", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      type: mysqlEnum("type", ["high_school", "college", "university"]).notNull(),
      address: text("address"),
      phoneNumber: varchar("phoneNumber", { length: 20 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

/**
 * Programs table - Academic programs/majors
 */
export const programs = mysqlTable("programs", {
      id: int("id").autoincrement().primaryKey(),
      schoolId: int("schoolId").notNull().references(() => schools.id, { onDelete: "cascade" }),
      name: varchar("name", { length: 255 }).notNull(),
      code: varchar("code", { length: 50 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;
