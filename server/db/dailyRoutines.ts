import {
      int,
      mysqlTable,
      varchar,
      text,
      date,
      time,
      datetime,
      tinyint,
      index,
} from "drizzle-orm/mysql-core";

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

export type DailyRoutine = typeof dailyRoutines.$inferSelect;
export type NewDailyRoutine = typeof dailyRoutines.$inferInsert;