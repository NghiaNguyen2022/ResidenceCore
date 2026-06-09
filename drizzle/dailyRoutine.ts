import {
      mysqlTable,
      int,
      varchar,
      text,
      time,
      timestamp,
      boolean,
      mysqlEnum,
} from "drizzle-orm/mysql-core";

export const dailyRoutineTemplates = mysqlTable("daily_routine_templates", {
      id: int("id").primaryKey().autoincrement(),

      code: varchar("code", { length: 50 }).notNull().unique(),
      name: varchar("name", { length: 255 }).notNull(),

      dayType: mysqlEnum("day_type", ["weekday", "sunday", "special"])
            .notNull()
            .default("weekday"),

      description: text("description"),

      isActive: boolean("is_active").notNull().default(true),
      sortOrder: int("sort_order").notNull().default(10),

      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const dailyRoutineItems = mysqlTable("daily_routine_items", {
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

      isActive: boolean("is_active").notNull().default(true),
      sortOrder: int("sort_order").notNull().default(10),

      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type DailyRoutineTemplate = typeof dailyRoutineTemplates.$inferSelect;
export type NewDailyRoutineTemplate = typeof dailyRoutineTemplates.$inferInsert;

export type DailyRoutineItem = typeof dailyRoutineItems.$inferSelect;
export type NewDailyRoutineItem = typeof dailyRoutineItems.$inferInsert;