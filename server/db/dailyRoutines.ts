import { sql } from "drizzle-orm";
import {
      int,
      mysqlEnum,
      mysqlTable,
      varchar,
      text,
      date,
      time,
      datetime,
      tinyint,
      index,
} from "drizzle-orm/mysql-core";

/**
 * Existing date-based daily routines.
 * Giữ lại bảng này để dùng cho lịch sinh hoạt/công tác phát sinh theo ngày cụ thể sau này.
 */
export const dailyRoutines = mysqlTable(
      "daily_routines",
      {
            id: int("id").primaryKey().autoincrement(),

            routineDate: date("routine_date").notNull(),
            startTime: time("start_time"),
            endTime: time("end_time"),

            title: varchar("title", { length: 255 }).notNull(),
            description: text("description"),

            location: varchar("location", { length: 255 }),

            category: varchar("category", { length: 100 }),
            responsibleLabel: varchar("responsible_label", { length: 255 }),

            assigneeType: varchar("assignee_type", { length: 50 })
                  .notNull()
                  .default("all"),
            assigneeId: int("assignee_id"),

            status: varchar("status", { length: 50 }).notNull().default("pending"),

            isRequired: tinyint("is_required").notNull().default(1),
            displayOrder: int("display_order").notNull().default(0),

            routineType: varchar("routine_type", { length: 50 })
                  .notNull()
                  .default("daily"),

            isActive: tinyint("is_active").notNull().default(1),

            completedAt: datetime("completed_at"),
            completedBy: int("completed_by"),

            notes: text("notes"),

            createdAt: datetime("created_at").notNull(),
            updatedAt: datetime("updated_at").notNull(),
      },
      (table) => ({
            dateIdx: index("idx_daily_routines_date").on(table.routineDate),
            statusIdx: index("idx_daily_routines_status").on(table.status),
            assigneeIdx: index("idx_daily_routines_assignee").on(
                  table.assigneeType,
                  table.assigneeId
            ),
            activeIdx: index("idx_daily_routines_active").on(table.isActive),
            categoryIdx: index("idx_daily_routines_category").on(table.category),
      })
);

/**
 * Template lịch sinh hoạt.
 * Dùng cho Simple Mode: ngày thường / Chúa nhật / ngày đặc biệt.
 */
export const dailyRoutineTemplates = mysqlTable(
      "daily_routine_templates",
      {
            id: int("id").primaryKey().autoincrement(),

            code: varchar("code", { length: 50 }).notNull().unique(),
            name: varchar("name", { length: 255 }).notNull(),

            dayType: mysqlEnum("day_type", ["weekday", "sunday", "special"])
                  .notNull()
                  .default("weekday"),

            description: text("description"),

            isActive: tinyint("is_active").notNull().default(1),
            sortOrder: int("sort_order").notNull().default(10),

            createdAt: datetime("created_at")
                  .notNull()
                  .default(sql`CURRENT_TIMESTAMP`),
            updatedAt: datetime("updated_at")
                  .notNull()
                  .default(sql`CURRENT_TIMESTAMP`),
      },
      (table) => ({
            codeIdx: index("idx_daily_routine_templates_code").on(table.code),
            dayTypeIdx: index("idx_daily_routine_templates_day_type").on(
                  table.dayType
            ),
            activeIdx: index("idx_daily_routine_templates_active").on(
                  table.isActive
            ),
      })
);

/**
 * Chi tiết từng khung giờ trong template lịch sinh hoạt.
 */
export const dailyRoutineItems = mysqlTable(
      "daily_routine_items",
      {
            id: int("id").primaryKey().autoincrement(),

            templateId: int("template_id")
                  .notNull()
                  .references(() => dailyRoutineTemplates.id, {
                        onDelete: "cascade",
                  }),

            startTime: time("start_time").notNull(),
            endTime: time("end_time").notNull(),

            title: varchar("title", { length: 255 }).notNull(),
            location: varchar("location", { length: 255 }),
            description: text("description"),

            isActive: tinyint("is_active").notNull().default(1),
            sortOrder: int("sort_order").notNull().default(10),

            createdAt: datetime("created_at")
                  .notNull()
                  .default(sql`CURRENT_TIMESTAMP`),
            updatedAt: datetime("updated_at")
                  .notNull()
                  .default(sql`CURRENT_TIMESTAMP`),
      },
      (table) => ({
            templateIdx: index("idx_daily_routine_items_template_id").on(
                  table.templateId
            ),
            timeIdx: index("idx_daily_routine_items_time").on(
                  table.startTime,
                  table.endTime
            ),
            activeIdx: index("idx_daily_routine_items_active").on(table.isActive),
      })
);

export type DailyRoutine = typeof dailyRoutines.$inferSelect;
export type NewDailyRoutine = typeof dailyRoutines.$inferInsert;

export type DailyRoutineTemplate = typeof dailyRoutineTemplates.$inferSelect;
export type NewDailyRoutineTemplate = typeof dailyRoutineTemplates.$inferInsert;

export type DailyRoutineItem = typeof dailyRoutineItems.$inferSelect;
export type NewDailyRoutineItem = typeof dailyRoutineItems.$inferInsert;
