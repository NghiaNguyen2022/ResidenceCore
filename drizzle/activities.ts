import { relations } from "drizzle-orm";
import {
      boolean,
      date,
      index,
      int,
      mysqlEnum,
      mysqlTable,
      text,
      time,
      timestamp,
      unique,
      varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./core";
import { residents } from "./residents";

export const activityTypeEnum = mysqlEnum("activityType", [
      "community",
      "spiritual",
      "study",
      "sports",
      "culture",
      "volunteer",
      "meeting",
      "other",
]);

export const activityStatusEnum = mysqlEnum("activityStatus", [
      "draft",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
]);

export const activityParticipantRoleEnum = mysqlEnum("activityParticipantRole", [
      "participant",
      "organizer",
      "volunteer",
]);

export const activities = mysqlTable(
      "activities",
      {
            id: int("id").autoincrement().primaryKey(),
            code: varchar("code", { length: 50 }).notNull(),
            title: varchar("title", { length: 255 }).notNull(),
            activityType: activityTypeEnum.notNull().default("community"),
            status: activityStatusEnum.notNull().default("scheduled"),
            activityDate: date("activityDate").notNull(),
            startTime: time("startTime"),
            endTime: time("endTime"),
            location: varchar("location", { length: 255 }),
            ownerGroup: varchar("ownerGroup", { length: 255 }),
            expectedParticipants: int("expectedParticipants").notNull().default(0),
            actualParticipants: int("actualParticipants").notNull().default(0),
            description: text("description"),
            notes: text("notes"),
            isPublicOnPortal: boolean("isPublicOnPortal").notNull().default(false),
            isActive: boolean("isActive").notNull().default(true),
            createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            codeUnique: unique("activities_code_unique").on(table.code),
            statusIdx: index("activities_status_idx").on(table.status),
            activityDateIdx: index("activities_activity_date_idx").on(table.activityDate),
            portalIdx: index("activities_portal_idx").on(table.isPublicOnPortal, table.isActive),
      })
);

export const activityParticipants = mysqlTable(
      "activityParticipants",
      {
            id: int("id").autoincrement().primaryKey(),
            activityId: int("activityId")
                  .notNull()
                  .references(() => activities.id, { onDelete: "cascade" }),
            residentId: int("residentId")
                  .notNull()
                  .references(() => residents.id, { onDelete: "cascade" }),
            role: activityParticipantRoleEnum.notNull().default("participant"),
            attended: boolean("attended").notNull().default(false),
            notes: text("notes"),
            createdAt: timestamp("createdAt").defaultNow().notNull(),
            updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      },
      (table) => ({
            activityResidentUnique: unique("activity_participants_activity_resident_unique").on(
                  table.activityId,
                  table.residentId
            ),
            activityIdx: index("activity_participants_activity_idx").on(table.activityId),
            residentIdx: index("activity_participants_resident_idx").on(table.residentId),
      })
);

export const activitiesRelations = relations(activities, ({ one, many }) => ({
      creator: one(users, {
            fields: [activities.createdBy],
            references: [users.id],
      }),
      participants: many(activityParticipants),
}));

export const activityParticipantsRelations = relations(activityParticipants, ({ one }) => ({
      activity: one(activities, {
            fields: [activityParticipants.activityId],
            references: [activities.id],
      }),
      resident: one(residents, {
            fields: [activityParticipants.residentId],
            references: [residents.id],
      }),
}));

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type ActivityParticipant = typeof activityParticipants.$inferSelect;
export type InsertActivityParticipant = typeof activityParticipants.$inferInsert;
