import {
      mysqlTable,
      int,
      varchar,
      text,
      date,
      time,
      timestamp,
      boolean,
      mysqlEnum,
} from "drizzle-orm/mysql-core";
import { users } from "./core";
import { residents } from "./residents";

/**
 * Activities table - Quản lý hoạt động chung của lưu xá
 */
export const activities = mysqlTable("activities", {
      id: int("id").autoincrement().primaryKey(),

      code: varchar("code", { length: 50 }).notNull().unique(),
      title: varchar("title", { length: 255 }).notNull(),

      activityType: mysqlEnum("activityType", [
            "community",
            "spiritual",
            "study",
            "sports",
            "culture",
            "volunteer",
            "meeting",
            "other",
      ]).default("other").notNull(),

      status: mysqlEnum("status", [
            "draft",
            "scheduled",
            "in_progress",
            "completed",
            "cancelled",
      ]).default("draft").notNull(),

      activityDate: date("activityDate").notNull(),
      startTime: time("startTime"),
      endTime: time("endTime"),

      location: varchar("location", { length: 255 }),
      ownerGroup: varchar("ownerGroup", { length: 255 }),

      expectedParticipants: int("expectedParticipants").default(0),
      actualParticipants: int("actualParticipants").default(0),

      description: text("description"),
      notes: text("notes"),

      createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),

      isActive: boolean("isActive").default(true).notNull(),

      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * ActivityParticipants table - Học viên tham gia hoạt động
 */
export const activityParticipants = mysqlTable("activityParticipants", {
      id: int("id").autoincrement().primaryKey(),

      activityId: int("activityId")
            .notNull()
            .references(() => activities.id, { onDelete: "cascade" }),

      residentId: int("residentId")
            .notNull()
            .references(() => residents.id, { onDelete: "cascade" }),

      role: mysqlEnum("role", ["participant", "organizer", "volunteer"]).default("participant").notNull(),

      attended: boolean("attended").default(false).notNull(),
      notes: varchar("notes", { length: 500 }),

      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActivityParticipant = typeof activityParticipants.$inferSelect;
export type InsertActivityParticipant = typeof activityParticipants.$inferInsert;
