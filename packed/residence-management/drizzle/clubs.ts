import {
      index,
      int,
      mysqlEnum,
      mysqlTable,
      text,
      timestamp,
      unique,
      varchar,
} from "drizzle-orm/mysql-core";

export const clubs = mysqlTable(
      "clubs",
      {
            id: int("id").autoincrement().primaryKey(),
            code: varchar("code", { length: 50 }).notNull(),
            name: varchar("name", { length: 255 }).notNull(),
            clubType: mysqlEnum("clubType", [
                  "study",
                  "music",
                  "sports",
                  "art",
                  "volunteer",
                  "spiritual",
                  "skill",
                  "other",
            ])
                  .notNull()
                  .default("other"),
            status: mysqlEnum("status", ["active", "inactive", "paused"])
                  .notNull()
                  .default("active"),
            leaderName: varchar("leaderName", { length: 255 }),
            mentorName: varchar("mentorName", { length: 255 }),
            meetingSchedule: varchar("meetingSchedule", { length: 255 }),
            location: varchar("location", { length: 255 }),
            memberCount: int("memberCount").notNull().default(0),
            maxMembers: int("maxMembers").notNull().default(0),
            objective: text("objective"),
            note: text("note"),
            sortOrder: int("sortOrder").notNull().default(0),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            codeUnique: unique("clubs_code_unique").on(table.code),
            statusIdx: index("clubs_status_idx").on(table.status),
            typeIdx: index("clubs_type_idx").on(table.clubType),
      })
);

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;
