import { index, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

export const skills = mysqlTable("skills", {
      id: int("id").autoincrement().primaryKey(),
      code: varchar("code", { length: 50 }).notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      category: mysqlEnum("category", ["life", "communication", "learning", "leadership", "digital", "career", "spiritual", "community", "other"]).notNull().default("other"),
      level: mysqlEnum("level", ["basic", "intermediate", "advanced"]).notNull().default("basic"),
      status: mysqlEnum("status", ["active", "inactive"]).notNull().default("active"),
      description: text("description"),
      objective: text("objective"),
      evaluationCriteria: text("evaluationCriteria"),
      suggestedDuration: varchar("suggestedDuration", { length: 100 }),
      ownerGroup: varchar("ownerGroup", { length: 255 }),
      note: text("note"),
      classCount: int("classCount").notNull().default(0),
      completedCount: int("completedCount").notNull().default(0),
      sortOrder: int("sortOrder").notNull().default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
      codeUnique: unique("skills_code_unique").on(table.code),
      statusIdx: index("skills_status_idx").on(table.status),
      categoryIdx: index("skills_category_idx").on(table.category),
}));

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
