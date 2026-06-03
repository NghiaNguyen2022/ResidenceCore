import { mysqlTable, int, varchar, text, date, mysqlEnum, timestamp, boolean, time, json } from "drizzle-orm/mysql-core";
import { users, schools, programs } from "./core";

/**
 * Residents table - Core entity for boarding house residents
 * UPDATED: Thêm residentCode, profileImage, schoolId, và mở rộng thông tin
 */
export const residents = mysqlTable("residents", {
      id: int("id").autoincrement().primaryKey(),
      residentCode: varchar("residentCode", { length: 50 }).notNull().unique(), // Auto-gen: RES-20260529-001
      holyName: varchar("holyName", { length: 100 }),
      userId: int("userId"),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      dateOfBirth: date("dateOfBirth"),
      gender: mysqlEnum("gender", ["male", "female", "other"]),
      idNumber: varchar("idNumber", { length: 50 }), // CCCD/CMND
      permanentAddress: text("permanentAddress"),
      phoneNumber: varchar("phoneNumber", { length: 20 }),
      schoolId: int("schoolId").references(() => schools.id, { onDelete: "set null" }),
      profileImage: varchar("profileImage", { length: 500 }), // URL to S3 or local storage
      status: mysqlEnum("status", ["active", "inactive", "transferred_out"]).default("active").notNull(),
      currentRoomId: int("currentRoomId"),
      admissionDate: date("admissionDate").notNull(), // Ngày ở lưu trú (không mặc định hôm nay)
      departureDate: date("departureDate"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resident = typeof residents.$inferSelect;
export type InsertResident = typeof residents.$inferInsert;

/**
 * Parents table - NEW: Thông tin cha mẹ/người giám hộ
 */
export const parents = mysqlTable("parents", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      parentType: mysqlEnum("parentType", ["father", "mother", "guardian"]).notNull(),
      fullName: varchar("fullName", { length: 255 }).notNull(),
      phoneNumber: varchar("phoneNumber", { length: 20 }),
      email: varchar("email", { length: 320 }),
      idNumber: varchar("idNumber", { length: 50 }), // CCCD/CMND
      occupation: varchar("occupation", { length: 255 }), // Nghề nghiệp
      address: text("address"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parent = typeof parents.$inferSelect;
export type InsertParent = typeof parents.$inferInsert;

/**
 * ResidentAcademicInfo table - Academic enrollment tracking
 */
export const residentAcademicInfo = mysqlTable("residentAcademicInfo", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      schoolId: int("schoolId").notNull().references(() => schools.id, { onDelete: "cascade" }),
      programId: int("programId").notNull().references(() => programs.id, { onDelete: "cascade" }),
      class: varchar("class", { length: 100 }),
      academicYear: varchar("academicYear", { length: 20 }).notNull(),
      enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
      status: mysqlEnum("status", ["enrolled", "graduated", "transferred", "suspended"]).default("enrolled").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResidentAcademicInfo = typeof residentAcademicInfo.$inferSelect;
export type InsertResidentAcademicInfo = typeof residentAcademicInfo.$inferInsert;

/**
 * Groups table - NEW: Tổ/nhóm trong ký túc xá
 */
export const groups = mysqlTable("groups", {
      id: int("id").primaryKey().autoincrement(),
      groupCode: varchar("groupCode", { length: 50 }).notNull().unique(),
      groupName: varchar("groupName", { length: 255 }).notNull(),
      description: text("description"),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

/**
 * Rooms table - Physical room definitions
 */
export const rooms = mysqlTable("rooms", {
      id: int("id").autoincrement().primaryKey(),
      roomCode: varchar("roomCode", { length: 50 }).notNull().unique(),
      capacity: int("capacity").notNull(),
      groupId: int("groupId").references(() => groups.id, { onDelete: "set null" }),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

/**
 * RoomAssignmentHistory table - Track room changes
 */
export const roomAssignmentHistory = mysqlTable("roomAssignmentHistory", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
      assignmentDate: timestamp("assignmentDate").defaultNow().notNull(),
      releaseDate: timestamp("releaseDate"),
      reason: varchar("reason", { length: 255 }),
      assignedBy: int("assignedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RoomAssignmentHistory = typeof roomAssignmentHistory.$inferSelect;
export type InsertRoomAssignmentHistory = typeof roomAssignmentHistory.$inferInsert;

/**
 * Room Assignments table - Track resident room assignments
 */
export const roomAssignments = mysqlTable("roomAssignments", {
      id: int("id").primaryKey().autoincrement(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
      assignedDate: date("assignedDate").notNull(),
      unassignedDate: date("unassignedDate"),
      eventType: mysqlEnum("eventType", ["new_entry", "transfer", "temporary_leave", "left"]).notNull(),
      reason: varchar("reason", { length: 255 }),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type RoomAssignment = typeof roomAssignments.$inferSelect;
export type InsertRoomAssignment = typeof roomAssignments.$inferInsert;

/**
 * Room Leaders table - Track room leaders
 */
export const roomLeaders = mysqlTable("roomLeaders", {
      id: int("id").primaryKey().autoincrement(),
      roomId: int("roomId").notNull().references(() => rooms.id, { onDelete: "cascade" }),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      appointedDate: date("appointedDate").notNull(),
      unappointedDate: date("unappointedDate"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type RoomLeader = typeof roomLeaders.$inferSelect;
export type InsertRoomLeader = typeof roomLeaders.$inferInsert;

/**
 * AttendanceSchedule table - Define recurring attendance activities
 */
export const attendanceSchedule = mysqlTable("attendanceSchedule", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      type: mysqlEnum("type", ["check_in", "check_out", "meal", "study_hour", "curfew", "activity"]).notNull(),
      scheduledTime: time("scheduledTime").notNull(),
      tolerance: int("tolerance").default(0),
      isDaily: boolean("isDaily").default(true).notNull(),
      daysOfWeek: json("daysOfWeek"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AttendanceSchedule = typeof attendanceSchedule.$inferSelect;
export type InsertAttendanceSchedule = typeof attendanceSchedule.$inferInsert;

/**
 * Attendance table - Daily attendance records
 */
export const attendance = mysqlTable("attendance", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      scheduleId: int("scheduleId").notNull().references(() => attendanceSchedule.id, { onDelete: "cascade" }),
      attendanceDate: date("attendanceDate").notNull(),
      status: mysqlEnum("status", ["present", "absent", "excused", "late"]).notNull(),
      checkInTime: timestamp("checkInTime"),
      checkOutTime: timestamp("checkOutTime"),
      notes: varchar("notes", { length: 500 }),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;
