import { mysqlTable, int, varchar, text, timestamp, boolean, date, mysqlEnum, decimal, time, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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

/**
 * Residents table - Core entity for boarding house residents
 * UPDATED: Thêm residentCode, profileImage, schoolId, và mở rộng thông tin
 */
export const residents = mysqlTable("residents", {
      id: int("id").autoincrement().primaryKey(),
      residentCode: varchar("residentCode", { length: 50 }).notNull().unique(), // Auto-gen: RES-20260529-001
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

/**
 * TaskTypes table - Define types of household tasks
 */
export const taskTypes = mysqlTable("taskTypes", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      estimatedHours: decimal("estimatedHours", { precision: 5, scale: 2 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskType = typeof taskTypes.$inferSelect;
export type InsertTaskType = typeof taskTypes.$inferInsert;

/**
 * TaskAssignments table - Assign tasks to residents
 */
export const taskAssignments = mysqlTable("taskAssignments", {
      id: int("id").autoincrement().primaryKey(),
      taskTypeId: int("taskTypeId").notNull().references(() => taskTypes.id, { onDelete: "cascade" }),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      assignmentDate: date("assignmentDate").notNull(),
      dueDate: date("dueDate").notNull(),
      status: mysqlEnum("status", ["pending", "in_progress", "completed", "overdue", "cancelled"]).default("pending").notNull(),
      completionDate: timestamp("completionDate"),
      notes: varchar("notes", { length: 500 }),
      assignedBy: int("assignedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
      verifiedBy: int("verifiedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type InsertTaskAssignment = typeof taskAssignments.$inferInsert;

/**
 * FeeTypes table - Define fee categories
 */
export const feeTypes = mysqlTable("feeTypes", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 255 }).notNull(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      billingCycle: mysqlEnum("billingCycle", ["monthly", "quarterly", "yearly"]).default("monthly").notNull(),
      description: text("description"),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeeType = typeof feeTypes.$inferSelect;
export type InsertFeeType = typeof feeTypes.$inferInsert;

/**
 * Debts table - Track financial obligations
 */
export const debts = mysqlTable("debts", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      feeTypeId: int("feeTypeId").notNull().references(() => feeTypes.id, { onDelete: "cascade" }),
      billingMonth: varchar("billingMonth", { length: 20 }).notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      dueDate: date("dueDate").notNull(),
      status: mysqlEnum("status", ["unpaid", "partially_paid", "paid", "overdue", "waived"]).default("unpaid").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = typeof debts.$inferInsert;

/**
 * Payments table - Record payment transactions
 */
export const payments = mysqlTable("payments", {
      id: int("id").autoincrement().primaryKey(),
      debtId: int("debtId").notNull().references(() => debts.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      paymentDate: timestamp("paymentDate").defaultNow().notNull(),
      paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "other"]).notNull(),
      reference: varchar("reference", { length: 100 }),
      notes: varchar("notes", { length: 500 }),
      recordedBy: int("recordedBy").notNull().references(() => users.id, { onDelete: "restrict" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications table - Track system notifications
 */
export const notifications = mysqlTable("notifications", {
      id: int("id").autoincrement().primaryKey(),
      recipientId: int("recipientId").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: mysqlEnum("type", ["fee_generated", "debt_overdue", "task_assigned", "attendance_alert", "system"]).notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      content: text("content").notNull(),
      relatedEntityType: varchar("relatedEntityType", { length: 50 }),
      relatedEntityId: int("relatedEntityId"),
      isRead: boolean("isRead").default(false).notNull(),
      sentAt: timestamp("sentAt").defaultNow().notNull(),
      readAt: timestamp("readAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * CronJobLogs table - Track automated job execution
 */
export const cronJobLogs = mysqlTable("cronJobLogs", {
      id: int("id").autoincrement().primaryKey(),
      jobName: varchar("jobName", { length: 255 }).notNull(),
      status: mysqlEnum("status", ["success", "failed", "skipped"]).notNull(),
      executedAt: timestamp("executedAt").defaultNow().notNull(),
      nextScheduledAt: timestamp("nextScheduledAt"),
      errorMessage: text("errorMessage"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CronJobLog = typeof cronJobLogs.$inferSelect;
export type InsertCronJobLog = typeof cronJobLogs.$inferInsert;

// ============================================================================
// DUTY MANAGEMENT TABLES
// ============================================================================

/**
 * DutyTemplates table - Pre-defined duty templates
 * Mẫu công tác được định nghĩa sẵn (Đi chợ, Nấu ăn, etc.)
 */
export const dutyTemplates = mysqlTable("dutyTemplates", {
      id: int("id").autoincrement().primaryKey(),
      templateCode: varchar("templateCode", { length: 50 }).notNull().unique(),
      templateName: varchar("templateName", { length: 100 }).notNull(),
      description: text("description"),
      dutyType: mysqlEnum("dutyType", ["daily", "weekly", "monthly"]).notNull(),
      startTime: time("startTime"),
      endTime: time("endTime"),
      minPersons: int("minPersons").default(1).notNull(),
      maxPersons: int("maxPersons").default(5).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutyTemplate = typeof dutyTemplates.$inferSelect;
export type InsertDutyTemplate = typeof dutyTemplates.$inferInsert;

/**
 * DutyConfigs table - Duty configurations (from template or custom)
 * Cấu hình công tác (từ mẫu hoặc tùy chỉnh)
 */
export const dutyConfigs = mysqlTable("dutyConfigs", {
      id: int("id").autoincrement().primaryKey(),
      dutyCode: varchar("dutyCode", { length: 50 }).notNull().unique(),
      dutyName: varchar("dutyName", { length: 100 }).notNull(),
      description: text("description"),
      templateId: int("templateId").references(() => dutyTemplates.id, { onDelete: "set null" }),
      dutyType: mysqlEnum("dutyType", ["daily", "weekly", "monthly"]).notNull(),
      startTime: time("startTime"),
      endTime: time("endTime"),
      minPersons: int("minPersons").default(1).notNull(),
      maxPersons: int("maxPersons").default(5).notNull(),
      frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
      dayOfWeek: int("dayOfWeek"), // 0-6 (Sun-Sat) for weekly duties
      requiresStudyScheduleCheck: boolean("requiresStudyScheduleCheck").default(true).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutyConfig = typeof dutyConfigs.$inferSelect;
export type InsertDutyConfig = typeof dutyConfigs.$inferInsert;

/**
 * DutyChecklists table - Checklist items for each duty
 * Danh sách công việc cần làm cho từng công tác
 */
export const dutyChecklists = mysqlTable("dutyChecklists", {
      id: int("id").autoincrement().primaryKey(),
      dutyConfigId: int("dutyConfigId").notNull().references(() => dutyConfigs.id, { onDelete: "cascade" }),
      itemOrder: int("itemOrder").notNull(),
      checklistItem: varchar("checklistItem", { length: 255 }).notNull(),
      isRequired: boolean("isRequired").default(true).notNull(),
      description: text("description"),
      estimatedTimeMinutes: int("estimatedTimeMinutes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutyChecklist = typeof dutyChecklists.$inferSelect;
export type InsertDutyChecklist = typeof dutyChecklists.$inferInsert;

/**
 * DutyAssignments table - Assign duties to residents
 * Phân công công tác cho sinh viên
 */
export const dutyAssignments = mysqlTable("dutyAssignments", {
      id: int("id").autoincrement().primaryKey(),
      dutyConfigId: int("dutyConfigId").notNull().references(() => dutyConfigs.id, { onDelete: "cascade" }),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      assignedDate: date("assignedDate").notNull(),
      startDateTime: timestamp("startDateTime"),
      endDateTime: timestamp("endDateTime"),
      status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "skipped", "cancelled"]).default("pending").notNull(),
      completedAt: timestamp("completedAt"),
      notes: text("notes"),
      reason: varchar("reason", { length: 255 }), // Lý do nếu bỏ
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutyAssignment = typeof dutyAssignments.$inferSelect;
export type InsertDutyAssignment = typeof dutyAssignments.$inferInsert;

/**
 * DutySchedules table - Duty rotation schedules
 * Lịch xoay vòng công tác
 */
export const dutySchedules = mysqlTable("dutySchedules", {
      id: int("id").autoincrement().primaryKey(),
      dutyConfigId: int("dutyConfigId").notNull().references(() => dutyConfigs.id, { onDelete: "cascade" }),
      weekNumber: int("weekNumber"),
      dayOfWeek: int("dayOfWeek"), // 0-6 (Sun-Sat)
      startDate: date("startDate").notNull(),
      endDate: date("endDate").notNull(),
      rotationOrder: int("rotationOrder"),
      rotationInterval: int("rotationInterval"), // Khoảng xoay vòng (tuần)
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutySchedule = typeof dutySchedules.$inferSelect;
export type InsertDutySchedule = typeof dutySchedules.$inferInsert;

/**
 * DutyEvaluations table - Evaluate duty completion
 * Đánh giá hoàn thành công tác
 */
export const dutyEvaluations = mysqlTable("dutyEvaluations", {
      id: int("id").autoincrement().primaryKey(),
      assignmentId: int("assignmentId").notNull().references(() => dutyAssignments.id, { onDelete: "cascade" }),
      quality: int("quality"), // 1-3 (Chất lượng)
      punctuality: int("punctuality"), // 1-2 (Đúng giờ)
      professionalism: int("professionalism"), // 1-2 (Tác phong)
      responsibility: int("responsibility"), // 1-2 (Trách nhiệm)
      teamwork: int("teamwork"), // 1-1 (Hợp tác)
      totalScore: int("totalScore"), // 3-10 (Tổng)
      checklistCompletedJson: json("checklistCompletedJson"), // {"1": true, "2": true, ...}
      evaluatorComments: text("evaluatorComments"),
      evaluatedBy: int("evaluatedBy").references(() => residents.id, { onDelete: "set null" }),
      evaluatedAt: timestamp("evaluatedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DutyEvaluation = typeof dutyEvaluations.$inferSelect;
export type InsertDutyEvaluation = typeof dutyEvaluations.$inferInsert;

/**
 * ScheduleConflicts table - Track conflicts between duties and study schedule
 * Xung đột giữa công tác và lịch học
 */
export const scheduleConflicts = mysqlTable("scheduleConflicts", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      dutyConfigId: int("dutyConfigId").notNull().references(() => dutyConfigs.id, { onDelete: "cascade" }),
      studyDayOfWeek: int("studyDayOfWeek"), // 0-6
      studyStartTime: time("studyStartTime"),
      studyEndTime: time("studyEndTime"),
      dutyStartTime: time("dutyStartTime"),
      dutyEndTime: time("dutyEndTime"),
      conflictLevel: mysqlEnum("conflictLevel", ["none", "partial", "full"]).default("none").notNull(),
      conflictMinutes: int("conflictMinutes"), // Phút xung đột
      isResolved: boolean("isResolved").default(false).notNull(),
      resolutionNote: text("resolutionNote"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduleConflict = typeof scheduleConflicts.$inferSelect;
export type InsertScheduleConflict = typeof scheduleConflicts.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const residentsRelations = relations(residents, ({ one, many }) => ({
      user: one(users, { fields: [residents.userId], references: [users.id] }),
      school: one(schools, { fields: [residents.schoolId], references: [schools.id] }),
      room: one(rooms, { fields: [residents.currentRoomId], references: [rooms.id] }),
      parents: many(parents),
      academicInfo: many(residentAcademicInfo),
      attendance: many(attendance),
      tasks: many(taskAssignments),
      debts: many(debts),
      roomHistory: many(roomAssignmentHistory),
      dutyAssignments: many(dutyAssignments),
      dutyEvaluations: many(dutyEvaluations),
      scheduleConflicts: many(scheduleConflicts),
}));

export const parentsRelations = relations(parents, ({ one }) => ({
      resident: one(residents, { fields: [parents.residentId], references: [residents.id] }),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
      programs: many(programs),
      residents: many(residents),
      academicInfo: many(residentAcademicInfo),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
      school: one(schools, { fields: [programs.schoolId], references: [schools.id] }),
      academicInfo: many(residentAcademicInfo),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
      rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ many, one }) => ({
      group: one(groups, { fields: [rooms.groupId], references: [groups.id] }),
      residents: many(residents),
      assignmentHistory: many(roomAssignmentHistory),
      roomAssignments: many(roomAssignments),
      roomLeaders: many(roomLeaders),
}));

export const roomAssignmentHistoryRelations = relations(roomAssignmentHistory, ({ one }) => ({
      resident: one(residents, { fields: [roomAssignmentHistory.residentId], references: [residents.id] }),
      room: one(rooms, { fields: [roomAssignmentHistory.roomId], references: [rooms.id] }),
      assignedByUser: one(users, { fields: [roomAssignmentHistory.assignedBy], references: [users.id] }),
}));

export const roomAssignmentsRelations = relations(roomAssignments, ({ one }) => ({
      resident: one(residents, { fields: [roomAssignments.residentId], references: [residents.id] }),
      room: one(rooms, { fields: [roomAssignments.roomId], references: [rooms.id] }),
}));

export const roomLeadersRelations = relations(roomLeaders, ({ one }) => ({
      room: one(rooms, { fields: [roomLeaders.roomId], references: [rooms.id] }),
      resident: one(residents, { fields: [roomLeaders.residentId], references: [residents.id] }),
}));

export const debtsRelations = relations(debts, ({ one, many }) => ({
      resident: one(residents, { fields: [debts.residentId], references: [residents.id] }),
      feeType: one(feeTypes, { fields: [debts.feeTypeId], references: [feeTypes.id] }),
      payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
      debt: one(debts, { fields: [payments.debtId], references: [debts.id] }),
      recordedByUser: one(users, { fields: [payments.recordedBy], references: [users.id] }),
}));

export const dutyTemplatesRelations = relations(dutyTemplates, ({ many }) => ({
      dutyConfigs: many(dutyConfigs),
}));

export const dutyConfigsRelations = relations(dutyConfigs, ({ one, many }) => ({
      template: one(dutyTemplates, { fields: [dutyConfigs.templateId], references: [dutyTemplates.id] }),
      checklists: many(dutyChecklists),
      assignments: many(dutyAssignments),
      schedules: many(dutySchedules),
      scheduleConflicts: many(scheduleConflicts),
}));

export const dutyChecklistsRelations = relations(dutyChecklists, ({ one }) => ({
      dutyConfig: one(dutyConfigs, { fields: [dutyChecklists.dutyConfigId], references: [dutyConfigs.id] }),
}));

export const dutyAssignmentsRelations = relations(dutyAssignments, ({ one, many }) => ({
      dutyConfig: one(dutyConfigs, { fields: [dutyAssignments.dutyConfigId], references: [dutyConfigs.id] }),
      resident: one(residents, { fields: [dutyAssignments.residentId], references: [residents.id] }),
      evaluation: many(dutyEvaluations),
}));

export const dutySchedulesRelations = relations(dutySchedules, ({ one }) => ({
      dutyConfig: one(dutyConfigs, { fields: [dutySchedules.dutyConfigId], references: [dutyConfigs.id] }),
}));

export const dutyEvaluationsRelations = relations(dutyEvaluations, ({ one }) => ({
      assignment: one(dutyAssignments, { fields: [dutyEvaluations.assignmentId], references: [dutyAssignments.id] }),
      evaluatedByResident: one(residents, { fields: [dutyEvaluations.evaluatedBy], references: [residents.id] }),
}));

export const scheduleConflictsRelations = relations(scheduleConflicts, ({ one }) => ({
      resident: one(residents, { fields: [scheduleConflicts.residentId], references: [residents.id] }),
      dutyConfig: one(dutyConfigs, { fields: [scheduleConflicts.dutyConfigId], references: [dutyConfigs.id] }),
}));


// ============================================================================
// FINANCIAL MANAGEMENT TABLES
// ============================================================================

/**
 * ResidentFeeTypes table - Loại phí cho học viên (Loại 1, 2, 3)
 */
export const residentFeeTypes = mysqlTable("residentFeeTypes", {
      id: int("id").autoincrement().primaryKey(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      roomFee: decimal("roomFee", { precision: 12, scale: 2 }).notNull().default("0"),
      mealFee: decimal("mealFee", { precision: 12, scale: 2 }).notNull().default("0"),
      activitiesFee: decimal("activitiesFee", { precision: 12, scale: 2 }).notNull().default("0"),
      totalMonthlyFee: decimal("totalMonthlyFee", { precision: 12, scale: 2 }).notNull().default("0"),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResidentFeeType = typeof residentFeeTypes.$inferSelect;
export type InsertResidentFeeType = typeof residentFeeTypes.$inferInsert;

/**
 * ResidentFeeAssignments table - Gán loại phí cho học viên
 */
export const residentFeeAssignments = mysqlTable("residentFeeAssignments", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      feeTypeId: int("feeTypeId").notNull().references(() => residentFeeTypes.id, { onDelete: "restrict" }),
      assignedDate: date("assignedDate").notNull(),
      effectiveFromMonth: int("effectiveFromMonth").notNull(),
      effectiveFromYear: int("effectiveFromYear").notNull(),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResidentFeeAssignment = typeof residentFeeAssignments.$inferSelect;
export type InsertResidentFeeAssignment = typeof residentFeeAssignments.$inferInsert;

/**
 * FeeChangeHistory table - Lịch sử thay đổi phí
 */
export const feeChangeHistory = mysqlTable("feeChangeHistory", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      oldFeeTypeId: int("oldFeeTypeId").references(() => residentFeeTypes.id, { onDelete: "set null" }),
      newFeeTypeId: int("newFeeTypeId").notNull().references(() => residentFeeTypes.id, { onDelete: "restrict" }),
      changeReason: varchar("changeReason", { length: 255 }),
      changeDate: date("changeDate").notNull(),
      effectiveFromMonth: int("effectiveFromMonth").notNull(),
      effectiveFromYear: int("effectiveFromYear").notNull(),
      changedBy: int("changedBy").references(() => users.id, { onDelete: "set null" }),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeeChangeHistory = typeof feeChangeHistory.$inferSelect;
export type InsertFeeChangeHistory = typeof feeChangeHistory.$inferInsert;

/**
 * AdditionalFees table - Phí khác (từ hoạt động, khoá học)
 */
export const additionalFees = mysqlTable("additionalFees", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      feeCategory: varchar("feeCategory", { length: 100 }).notNull(),
      description: text("description"),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      billingMonth: int("billingMonth").notNull(),
      billingYear: int("billingYear").notNull(),
      reason: varchar("reason", { length: 255 }),
      relatedActivityId: int("relatedActivityId"),
      relatedCourseId: int("relatedCourseId"),
      status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
      approvedBy: int("approvedBy").references(() => users.id, { onDelete: "set null" }),
      approvedAt: timestamp("approvedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdditionalFee = typeof additionalFees.$inferSelect;
export type InsertAdditionalFee = typeof additionalFees.$inferInsert;

/**
 * BorrowedFees table - Phí mượn/ứng
 */
export const borrowedFees = mysqlTable("borrowedFees", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      borrowDate: date("borrowDate").notNull(),
      reason: text("reason"),
      status: mysqlEnum("status", ["pending", "added_to_fee", "paid"]).default("pending").notNull(),
      addedToMonthlyFeeMonth: int("addedToMonthlyFeeMonth"),
      addedToMonthlyFeeYear: int("addedToMonthlyFeeYear"),
      paidDate: date("paidDate"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BorrowedFee = typeof borrowedFees.$inferSelect;
export type InsertBorrowedFee = typeof borrowedFees.$inferInsert;

/**
 * Revenues table - Phí thu hàng tháng
 */
export const revenues = mysqlTable("revenues", {
      id: int("id").autoincrement().primaryKey(),
      residentId: int("residentId").notNull().references(() => residents.id, { onDelete: "cascade" }),
      billingMonth: int("billingMonth").notNull(),
      billingYear: int("billingYear").notNull(),
      baseFee: decimal("baseFee", { precision: 12, scale: 2 }).notNull(),
      additionalFeeAmount: decimal("additionalFeeAmount", { precision: 12, scale: 2 }).notNull().default("0"),
      borrowedFeeAddition: decimal("borrowedFeeAddition", { precision: 12, scale: 2 }).notNull().default("0"),
      totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
      status: mysqlEnum("status", ["pending", "due", "overdue", "paid", "partial", "cancelled"]).default("pending").notNull(),
      dueDate: date("dueDate").notNull(),
      paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).notNull().default("0"),
      paidDate: date("paidDate"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
      uniqueResidentMonth: unique().on(table.residentId, table.billingMonth, table.billingYear),
}));

export type Revenue = typeof revenues.$inferSelect;
export type InsertRevenue = typeof revenues.$inferInsert;

/**
 * RevenuePayments table - Ghi nhận thanh toán
 */
export const revenuePayments = mysqlTable("revenuePayments", {
      id: int("id").autoincrement().primaryKey(),
      revenueId: int("revenueId").notNull().references(() => revenues.id, { onDelete: "cascade" }),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "other"]).notNull(),
      paymentDate: date("paymentDate").notNull(),
      reference: varchar("reference", { length: 255 }),
      notes: text("notes"),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenuePayment = typeof revenuePayments.$inferSelect;
export type InsertRevenuePayment = typeof revenuePayments.$inferInsert;

/**
 * RevenueHistory table - Lịch sử thay đổi phí thu
 */
export const revenueHistory = mysqlTable("revenueHistory", {
      id: int("id").autoincrement().primaryKey(),
      revenueId: int("revenueId").notNull().references(() => revenues.id, { onDelete: "cascade" }),
      fieldChanged: varchar("fieldChanged", { length: 100 }).notNull(),
      oldValue: text("oldValue"),
      newValue: text("newValue"),
      changeReason: varchar("changeReason", { length: 255 }),
      changedBy: int("changedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RevenueHistory = typeof revenueHistory.$inferSelect;
export type InsertRevenueHistory = typeof revenueHistory.$inferInsert;

/**
 * ExpenseCategories table - Danh mục chi phí
 */
export const expenseCategories = mysqlTable("expenseCategories", {
      id: int("id").autoincrement().primaryKey(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      budgetAmount: decimal("budgetAmount", { precision: 12, scale: 2 }),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;

/**
 * Expenses table - Chi phí vận hành
 */
export const expenses = mysqlTable("expenses", {
      id: int("id").autoincrement().primaryKey(),
      categoryId: int("categoryId").notNull().references(() => expenseCategories.id, { onDelete: "restrict" }),
      department: mysqlEnum("department", ["general", "store", "library", "other"]).default("general").notNull(),
      description: text("description").notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      expenseDate: date("expenseDate").notNull(),
      paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "check", "other"]).notNull(),
      invoiceNumber: varchar("invoiceNumber", { length: 100 }),
      invoiceFile: varchar("invoiceFile", { length: 255 }),
      status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "paid"]).default("draft").notNull(),
      approvedBy: int("approvedBy").references(() => users.id, { onDelete: "set null" }),
      approvedAt: timestamp("approvedAt"),
      rejectionReason: text("rejectionReason"),
      notes: text("notes"),
      createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * StoreRevenues table - Doanh thu cửa hàng
 */
export const storeRevenues = mysqlTable("storeRevenues", {
      id: int("id").autoincrement().primaryKey(),
      revenueDate: date("revenueDate").notNull(),
      productName: varchar("productName", { length: 255 }).notNull(),
      quantity: int("quantity").notNull(),
      unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).notNull(),
      totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
      notes: text("notes"),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoreRevenue = typeof storeRevenues.$inferSelect;
export type InsertStoreRevenue = typeof storeRevenues.$inferInsert;

/**
 * StoreSaleItems table - Chi tiết sản phẩm bán
 */
export const storeSaleItems = mysqlTable("storeSaleItems", {
      id: int("id").autoincrement().primaryKey(),
      productName: varchar("productName", { length: 255 }).notNull(),
      totalQuantitySold: int("totalQuantitySold").notNull().default(0),
      totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).notNull().default("0"),
      averageUnitPrice: decimal("averageUnitPrice", { precision: 12, scale: 2 }),
      lastSaleDate: date("lastSaleDate"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoreSaleItem = typeof storeSaleItems.$inferSelect;
export type InsertStoreSaleItem = typeof storeSaleItems.$inferInsert;

/**
 * StoreExpenses table - Chi phí cửa hàng
 */
export const storeExpenses = mysqlTable("storeExpenses", {
      id: int("id").autoincrement().primaryKey(),
      expenseDate: date("expenseDate").notNull(),
      description: text("description").notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      expenseType: mysqlEnum("expenseType", ["purchase", "rent", "utilities", "staff", "other"]).notNull(),
      notes: text("notes"),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoreExpense = typeof storeExpenses.$inferSelect;
export type InsertStoreExpense = typeof storeExpenses.$inferInsert;

/**
 * LibraryRevenues table - Doanh thu thư viện
 */
export const libraryRevenues = mysqlTable("libraryRevenues", {
      id: int("id").autoincrement().primaryKey(),
      revenueDate: date("revenueDate").notNull(),
      revenueType: mysqlEnum("revenueType", ["rental", "photocopy", "printing", "registration", "other"]).notNull(),
      description: text("description"),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      notes: text("notes"),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LibraryRevenue = typeof libraryRevenues.$inferSelect;
export type InsertLibraryRevenue = typeof libraryRevenues.$inferInsert;

/**
 * LibraryExpenses table - Chi phí thư viện
 */
export const libraryExpenses = mysqlTable("libraryExpenses", {
      id: int("id").autoincrement().primaryKey(),
      expenseDate: date("expenseDate").notNull(),
      description: text("description").notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      expenseType: mysqlEnum("expenseType", ["books", "maintenance", "utilities", "staff", "other"]).notNull(),
      notes: text("notes"),
      recordedBy: int("recordedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LibraryExpense = typeof libraryExpenses.$inferSelect;
export type InsertLibraryExpense = typeof libraryExpenses.$inferInsert;

/**
 * ExpenseHistory table - Lịch sử thay đổi chi phí
 */
export const expenseHistory = mysqlTable("expenseHistory", {
      id: int("id").autoincrement().primaryKey(),
      expenseId: int("expenseId").notNull().references(() => expenses.id, { onDelete: "cascade" }),
      fieldChanged: varchar("fieldChanged", { length: 100 }).notNull(),
      oldValue: text("oldValue"),
      newValue: text("newValue"),
      changeReason: varchar("changeReason", { length: 255 }),
      changedBy: int("changedBy").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExpenseHistory = typeof expenseHistory.$inferSelect;
export type InsertExpenseHistory = typeof expenseHistory.$inferInsert;

// ============================================================================
// FINANCIAL MANAGEMENT RELATIONS
// ============================================================================

export const residentFeeTypesRelations = relations(residentFeeTypes, ({ many }) => ({
      assignments: many(residentFeeAssignments),
      feeChangeHistory: many(feeChangeHistory),
}));

export const residentFeeAssignmentsRelations = relations(residentFeeAssignments, ({ one }) => ({
      resident: one(residents, { fields: [residentFeeAssignments.residentId], references: [residents.id] }),
      feeType: one(residentFeeTypes, { fields: [residentFeeAssignments.feeTypeId], references: [residentFeeTypes.id] }),
}));

export const feeChangeHistoryRelations = relations(feeChangeHistory, ({ one }) => ({
      resident: one(residents, { fields: [feeChangeHistory.residentId], references: [residents.id] }),
      oldFeeType: one(residentFeeTypes, { fields: [feeChangeHistory.oldFeeTypeId], references: [residentFeeTypes.id] }),
      newFeeType: one(residentFeeTypes, { fields: [feeChangeHistory.newFeeTypeId], references: [residentFeeTypes.id] }),
      changedByUser: one(users, { fields: [feeChangeHistory.changedBy], references: [users.id] }),
}));

export const additionalFeesRelations = relations(additionalFees, ({ one }) => ({
      resident: one(residents, { fields: [additionalFees.residentId], references: [residents.id] }),
      approvedByUser: one(users, { fields: [additionalFees.approvedBy], references: [users.id] }),
}));

export const borrowedFeesRelations = relations(borrowedFees, ({ one }) => ({
      resident: one(residents, { fields: [borrowedFees.residentId], references: [residents.id] }),
}));

export const revenuesRelations = relations(revenues, ({ one, many }) => ({
      resident: one(residents, { fields: [revenues.residentId], references: [residents.id] }),
      payments: many(revenuePayments),
      history: many(revenueHistory),
}));

export const revenuePaymentsRelations = relations(revenuePayments, ({ one }) => ({
      revenue: one(revenues, { fields: [revenuePayments.revenueId], references: [revenues.id] }),
      recordedByUser: one(users, { fields: [revenuePayments.recordedBy], references: [users.id] }),
}));

export const revenueHistoryRelations = relations(revenueHistory, ({ one }) => ({
      revenue: one(revenues, { fields: [revenueHistory.revenueId], references: [revenues.id] }),
      changedByUser: one(users, { fields: [revenueHistory.changedBy], references: [users.id] }),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
      expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
      category: one(expenseCategories, { fields: [expenses.categoryId], references: [expenseCategories.id] }),
      approvedByUser: one(users, { fields: [expenses.approvedBy], references: [users.id] }),
      createdByUser: one(users, { fields: [expenses.createdBy], references: [users.id] }),
      history: many(expenseHistory),
}));

export const storeRevenuesRelations = relations(storeRevenues, ({ one }) => ({
      recordedByUser: one(users, { fields: [storeRevenues.recordedBy], references: [users.id] }),
}));

export const storeSaleItemsRelations = relations(storeSaleItems, ({}));

export const storeExpensesRelations = relations(storeExpenses, ({ one }) => ({
      recordedByUser: one(users, { fields: [storeExpenses.recordedBy], references: [users.id] }),
}));

export const libraryRevenuesRelations = relations(libraryRevenues, ({ one }) => ({
      recordedByUser: one(users, { fields: [libraryRevenues.recordedBy], references: [users.id] }),
}));

export const libraryExpensesRelations = relations(libraryExpenses, ({ one }) => ({
      recordedByUser: one(users, { fields: [libraryExpenses.recordedBy], references: [users.id] }),
}));

export const expenseHistoryRelations = relations(expenseHistory, ({ one }) => ({
      expense: one(expenses, { fields: [expenseHistory.expenseId], references: [expenses.id] }),
      changedByUser: one(users, { fields: [expenseHistory.changedBy], references: [users.id] }),
}));

export const organizationRoleCategoryEnum = [
      'management',
      'room',
      'liturgy',
      'academic',
      'activity',
      'finance',
      'discipline',
      'life',
      'other',
] as const;

export const organizationRoles = mysqlTable('organization_roles', {
      id: int('id').primaryKey().autoincrement(),

      code: varchar('code', { length: 50 }).notNull().unique(),
      name: varchar('name', { length: 150 }).notNull().unique(),

      category: mysqlEnum('category', organizationRoleCategoryEnum)
            .notNull()
            .default('other'),

      description: text('description'),

      allowMultipleMembers: boolean('allow_multiple_members')
            .notNull()
            .default(true),

      isActive: boolean('is_active')
            .notNull()
            .default(true),

      sortOrder: int('sort_order')
            .notNull()
            .default(0),

      createdAt: timestamp('created_at')
            .notNull()
            .defaultNow(),

      updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
});

export type OrganizationRole = typeof organizationRoles.$inferSelect;
export type InsertOrganizationRole = typeof organizationRoles.$inferInsert;

export const organizationTermStatusEnum = [
      'active',
      'inactive',
      'closed',
] as const;

export const organizationTerms = mysqlTable('organization_terms', {
      id: int('id').primaryKey().autoincrement(),

      code: varchar('code', { length: 50 }).notNull().unique(),
      name: varchar('name', { length: 150 }).notNull().unique(),

      startDate: date('start_date').notNull(),
      endDate: date('end_date').notNull(),

      status: mysqlEnum('status', organizationTermStatusEnum)
            .notNull()
            .default('inactive'),

      description: text('description'),

      createdAt: timestamp('created_at')
            .notNull()
            .defaultNow(),

      updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
});

export type OrganizationTerm = typeof organizationTerms.$inferSelect;
export type InsertOrganizationTerm = typeof organizationTerms.$inferInsert;

export const organizationAssignmentStatusEnum = [
      'active',
      'ended',
] as const;

export const organizationAssignments = mysqlTable('organization_assignments', {
      id: int('id').primaryKey().autoincrement(),

      termId: int('term_id')
            .notNull()
            .references(() => organizationTerms.id),

      roleId: int('role_id')
            .notNull()
            .references(() => organizationRoles.id),

      residentId: int('resident_id')
            .notNull()
            .references(() => residents.id),

      roomId: int('room_id')
            .references(() => rooms.id),

      startDate: date('start_date').notNull(),
      endDate: date('end_date'),

      status: mysqlEnum('status', organizationAssignmentStatusEnum)
            .notNull()
            .default('active'),

      notes: text('notes'),

      createdAt: timestamp('created_at')
            .notNull()
            .defaultNow(),

      updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
});

export type OrganizationAssignment =
      typeof organizationAssignments.$inferSelect;

export type InsertOrganizationAssignment =
      typeof organizationAssignments.$inferInsert;