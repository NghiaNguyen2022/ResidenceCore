/**
 * Duty Management Database Functions
 * Các hàm liên quan đến quản lý công tác
 */

import { getDb } from "./connection";
import {
      dutyTemplates,
      dutyConfigs,
      dutyChecklists,
      dutyAssignments,
      dutySchedules,
      dutyEvaluations,
      scheduleConflicts,
      residents,
      InsertDutyTemplate,
      InsertDutyConfig,
      InsertDutyChecklist,
      InsertDutyAssignment,
      InsertDutySchedule,
      InsertDutyEvaluation,
      InsertScheduleConflict,
} from "../../drizzle/schema";
import { eq, and, or, gte, lte, between, like, sql, inArray } from "drizzle-orm";

// ============================================================================
// 2.1 DUTY TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Tạo duty template mẫu
 */
export async function createDutyTemplate(data: InsertDutyTemplate) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.insert(dutyTemplates).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to create duty template:", error);
            throw error;
      }
}

/**
 * Lấy duty template theo ID
 */
export async function getDutyTemplate(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(dutyTemplates).where(eq(dutyTemplates.id, id)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get duty template:", error);
            throw error;
      }
}

/**
 * Lấy duty template theo code
 */
export async function getDutyTemplateByCode(code: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(dutyTemplates).where(eq(dutyTemplates.templateCode, code)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get duty template by code:", error);
            throw error;
      }
}

/**
 * Liệt kê tất cả duty templates
 */
export async function listDutyTemplates() {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutyTemplates)
                  .where(eq(dutyTemplates.isActive, true))
                  .orderBy(dutyTemplates.templateName);
            return result;
      } catch (error) {
            console.error("[Database] Failed to list duty templates:", error);
            throw error;
      }
}

/**
 * Lấy resident theo userId
 */
export async function getResidentByUserId(userId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(residents)
                  .where(eq(residents.userId, userId))
                  .limit(1);

            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get resident by userId:", error);
            throw error;
      }
}

/**
 * Lấy assignment theo id
 */
export async function getAssignmentById(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutyAssignments)
                  .where(eq(dutyAssignments.id, id))
                  .limit(1);

            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get assignment by id:", error);
            throw error;
      }
}

/**
 * Cập nhật assignment chỉ khi của resident
 */
export async function updateAssignmentForResident(
      residentId: number,
      assignmentId: number,
      data: Partial<InsertDutyAssignment>
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .update(dutyAssignments)
                  .set(data)
                  .where(and(eq(dutyAssignments.id, assignmentId), eq(dutyAssignments.residentId, residentId)));

            return result;
      } catch (error) {
            console.error("[Database] Failed to update assignment for resident:", error);
            throw error;
      }
}

// ============================================================================
// 2.2 DUTY CONFIG FUNCTIONS
// ============================================================================

/**
 * Tạo duty config
 */
export async function createDutyConfig(data: InsertDutyConfig) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.insert(dutyConfigs).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to create duty config:", error);
            throw error;
      }
}

/**
 * Cập nhật duty config
 */
export async function updateDutyConfig(id: number, data: Partial<InsertDutyConfig>) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.update(dutyConfigs).set(data).where(eq(dutyConfigs.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to update duty config:", error);
            throw error;
      }
}

/**
 * Xóa duty config
 */
export async function deleteDutyConfig(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.delete(dutyConfigs).where(eq(dutyConfigs.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to delete duty config:", error);
            throw error;
      }
}

/**
 * Lấy duty config theo ID
 */
export async function getDutyConfig(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(dutyConfigs).where(eq(dutyConfigs.id, id)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get duty config:", error);
            throw error;
      }
}

/**
 * Lấy duty config theo code
 */
export async function getDutyConfigByCode(code: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.select().from(dutyConfigs).where(eq(dutyConfigs.dutyCode, code)).limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get duty config by code:", error);
            throw error;
      }
}

/**
 * Liệt kê duty configs với filters
 */
export async function listDutyConfigs(filters?: { dutyType?: string; isActive?: boolean }) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db.select().from(dutyConfigs);

            const conditions = [];
            if (filters?.dutyType) {
                  conditions.push(eq(dutyConfigs.dutyType, filters.dutyType as any));
            }
            if (filters?.isActive !== undefined) {
                  conditions.push(eq(dutyConfigs.isActive, filters.isActive));
            }

            if (conditions.length > 0) {
                  query = query.where(and(...conditions));
            }

            const result = await query.orderBy(dutyConfigs.dutyName);
            return result;
      } catch (error) {
            console.error("[Database] Failed to list duty configs:", error);
            throw error;
      }
}

// ============================================================================
// 2.3 DUTY CHECKLIST FUNCTIONS
// ============================================================================

/**
 * Thêm checklist item
 */
export async function addChecklistItem(
      data: InsertDutyChecklist & { itemOrder?: number | null }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let itemOrder = data.itemOrder;

            if (itemOrder === undefined || itemOrder === null) {
                  const existingItems = await db
                        .select()
                        .from(dutyChecklists)
                        .where(eq(dutyChecklists.dutyConfigId, data.dutyConfigId));

                  itemOrder = existingItems.length + 1;
            }

            const result = await db.insert(dutyChecklists).values({
                  ...data,
                  itemOrder,
            } as InsertDutyChecklist);

            return result;
      } catch (error) {
            console.error("[Database] Failed to add checklist item:", error);
            throw error;
      }
}

/**
 * Cập nhật checklist item
 */
export async function updateChecklistItem(id: number, data: Partial<InsertDutyChecklist>) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.update(dutyChecklists).set(data).where(eq(dutyChecklists.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to update checklist item:", error);
            throw error;
      }
}

/**
 * Xóa checklist item
 */
export async function deleteChecklistItem(id: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.delete(dutyChecklists).where(eq(dutyChecklists.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to delete checklist item:", error);
            throw error;
      }
}

/**
 * Lấy checklist theo duty ID
 */
export async function getChecklistByDutyId(dutyConfigId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutyChecklists)
                  .where(eq(dutyChecklists.dutyConfigId, dutyConfigId))
                  .orderBy(dutyChecklists.itemOrder);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get checklist:", error);
            throw error;
      }
}

// ============================================================================
// 2.4 DUTY ASSIGNMENT FUNCTIONS
// ============================================================================

export type DutyAssignedToType = "resident" | "team" | "room" | "committee";

export type DutyAssignmentInput = InsertDutyAssignment & {
      assignedToType?: DutyAssignedToType | null;
      assignedToId?: number | null;
};

function createWallClockDate(dateText: string, timeText = "00:00:00") {
      const [year, month, day] = dateText.split("-").map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(":").map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toDateOnlyText(value: Date | string | null | undefined) {
      if (!value) return "";

      if (typeof value === "string") {
            if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
                  return value.slice(0, 10);
            }

            const parsed = new Date(value);

            if (!Number.isNaN(parsed.getTime())) {
                  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(
                        2,
                        "0"
                  )}-${String(parsed.getUTCDate()).padStart(2, "0")}`;
            }

            return value.slice(0, 10);
      }

      return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(
            2,
            "0"
      )}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

function toTimeText(value: Date | string | null | undefined) {
      if (!value) return null;

      if (typeof value === "string") {
            if (/^\d{2}:\d{2}/.test(value)) {
                  return value.length === 5 ? `${value}:00` : value.slice(0, 8);
            }

            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(value)) {
                  const normalized = value.replace("T", " ").replace("Z", "");
                  return normalized.split(" ")[1]?.slice(0, 8) || null;
            }

            const parsed = new Date(value);

            if (!Number.isNaN(parsed.getTime())) {
                  return `${String(parsed.getUTCHours()).padStart(2, "0")}:${String(
                        parsed.getUTCMinutes()
                  ).padStart(2, "0")}:${String(parsed.getUTCSeconds()).padStart(2, "0")}`;
            }

            return null;
      }

      return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
            value.getUTCMinutes()
      ).padStart(2, "0")}:${String(value.getUTCSeconds()).padStart(2, "0")}`;
}

function toInsertDate(value: Date | string) {
      return createWallClockDate(toDateOnlyText(value), "00:00:00");
}

function toInsertDateTime(dateValue: Date | string, timeValue?: Date | string | null) {
      const dateText = toDateOnlyText(dateValue);
      const timeText = toTimeText(timeValue);

      if (!timeText) return null;

      return createWallClockDate(dateText, timeText);
}

/**
 * Dùng cho query/check ngày, trả về dạng YYYY-MM-DD.
 */
function normalizeDutyAssignmentForCheck(data: DutyAssignmentInput): any {
      const payload: any = { ...data };

      payload.assignedDate = toDateOnlyText(payload.assignedDate);

      if (!payload.assignedToType && payload.residentId) {
            payload.assignedToType = "resident";
            payload.assignedToId = payload.residentId;
      }

      if (payload.assignedToType === "resident") {
            if (!payload.assignedToId && payload.residentId) {
                  payload.assignedToId = payload.residentId;
            }

            if (!payload.residentId && payload.assignedToId) {
                  payload.residentId = payload.assignedToId;
            }
      }

      if (
            payload.assignedToType &&
            payload.assignedToType !== "resident" &&
            payload.assignedToId
      ) {
            payload.residentId = payload.residentId ?? null;
      }

      return payload;
}

/**
 * Dùng riêng khi insert vào Drizzle/MySQL.
 * Các cột DATE/DATETIME phải nhận Date object để tránh lỗi value.toISOString is not a function.
 */
function normalizeDutyAssignmentForInsert(data: DutyAssignmentInput): InsertDutyAssignment {
      const payload: any = normalizeDutyAssignmentForCheck(data);

      const assignedDateValue = payload.assignedDate;

      payload.assignedDate = toInsertDate(assignedDateValue);
      payload.startDateTime = toInsertDateTime(
            assignedDateValue,
            payload.startDateTime || payload.startTime || null
      );
      payload.endDateTime = toInsertDateTime(
            assignedDateValue,
            payload.endDateTime || payload.endTime || null
      );

      return payload as InsertDutyAssignment;
}

/**
 * Backward-compatible name for code paths that need query/check normalization.
 * Do not use this directly for insert.
 */
function normalizeDutyAssignmentInput(data: DutyAssignmentInput): InsertDutyAssignment {
      return normalizeDutyAssignmentForCheck(data) as InsertDutyAssignment;
}

async function validateResidentDutyCapacity(
      db: any,
      payload: any
) {
      const assignedToType = payload.assignedToType || (payload.residentId ? "resident" : null);

      if (assignedToType !== "resident") return;

      const dutyConfigId = Number(payload.dutyConfigId || 0);

      if (!dutyConfigId) return;

      const configRows = await db
            .select()
            .from(dutyConfigs)
            .where(eq(dutyConfigs.id, dutyConfigId))
            .limit(1);

      const config = configRows[0] as any;

      if (!config?.maxPersons) return;

      const assignedDateText = toDateOnlyText(payload.assignedDate);

      const currentRows = await db
            .select()
            .from(dutyAssignments)
            .where(
                  and(
                        eq(dutyAssignments.dutyConfigId, dutyConfigId),
                        sql`DATE(${dutyAssignments.assignedDate}) = ${assignedDateText}`,
                        or(
                              eq(dutyAssignments.assignedToType, "resident" as any),
                              sql`${dutyAssignments.assignedToType} IS NULL`
                        ),
                        inArray(dutyAssignments.status, ACTIVE_DUTY_ASSIGNMENT_STATUSES as any)
                  )
            );

      if (currentRows.length >= Number(config.maxPersons)) {
            throw new Error(
                  `Công tác này đã đủ số lượng tối đa (${config.maxPersons} học viên).`
            );
      }
}

/**
 * Gán công tác cho học viên
 */
export async function assignDuty(data: DutyAssignmentInput) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const checkPayload = normalizeDutyAssignmentForCheck(data);
            await validateResidentDutyCapacity(db, checkPayload);

            const payload = normalizeDutyAssignmentForInsert(data);
            const result = await db.insert(dutyAssignments).values(payload);
            return result;
      } catch (error) {
            console.error("[Database] Failed to assign duty:", error);
            throw error;
      }
}

/**
 * Cập nhật assignment
 */
export async function updateAssignment(id: number, data: Partial<InsertDutyAssignment>) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.update(dutyAssignments).set(data).where(eq(dutyAssignments.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to update assignment:", error);
            throw error;
      }
}

/**
 * Hủy assignment
 */
export async function cancelAssignment(id: number, reason: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .update(dutyAssignments)
                  .set({ status: "cancelled", reason })
                  .where(eq(dutyAssignments.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to cancel assignment:", error);
            throw error;
      }
}

/**
 * Lấy assignments theo resident
 */
export async function getAssignmentsByResident(
      residentId: number,
      filters?: { status?: string; startDate?: Date; endDate?: Date }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db
                  .select()
                  .from(dutyAssignments)
                  .where(eq(dutyAssignments.residentId, residentId));

            const conditions = [];
            if (filters?.status) {
                  conditions.push(eq(dutyAssignments.status, filters.status as any));
            }
            if (filters?.startDate && filters?.endDate) {
                  conditions.push(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            if (conditions.length > 0) {
                  query = query.where(and(...conditions));
            }

            const result = await query.orderBy(dutyAssignments.assignedDate);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get assignments by resident:", error);
            throw error;
      }
}

/**
 * Lấy assignments theo ngày
 */

export async function getAssignmentsByDate(date: Date | string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const dateText = toDateOnlyText(date);

            const result = await db
                  .select()
                  .from(dutyAssignments)
                  .where(sql`DATE(${dutyAssignments.assignedDate}) = ${dateText}`)
                  .orderBy(dutyAssignments.startDateTime);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get assignments by date:", error);
            throw error;
      }
}

/**
 * Lấy assignments theo duty config
 */
export async function getAssignmentsByDuty(
      dutyConfigId: number,
      filters?: { status?: string; startDate?: Date; endDate?: Date }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db
                  .select()
                  .from(dutyAssignments)
                  .where(eq(dutyAssignments.dutyConfigId, dutyConfigId));

            const conditions = [];
            if (filters?.status) {
                  conditions.push(eq(dutyAssignments.status, filters.status as any));
            }
            if (filters?.startDate && filters?.endDate) {
                  conditions.push(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            if (conditions.length > 0) {
                  query = query.where(and(...conditions));
            }

            const result = await query.orderBy(dutyAssignments.assignedDate);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get assignments by duty:", error);
            throw error;
      }
}

/**
 * Lấy assignments theo khoảng ngày
 */
export async function getAssignmentsByDateRange(
      startDate: Date,
      endDate: Date,
      filters?: {
            status?: string;
            assignedToType?: DutyAssignedToType;
            assignedToId?: number;
      }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const conditions = [
                  between(dutyAssignments.assignedDate, startDate, endDate),
            ];

            if (filters?.status) {
                  conditions.push(eq(dutyAssignments.status, filters.status as any));
            }

            if (filters?.assignedToType) {
                  conditions.push(
                        eq(dutyAssignments.assignedToType, filters.assignedToType as any)
                  );
            }

            if (filters?.assignedToId) {
                  conditions.push(eq(dutyAssignments.assignedToId, filters.assignedToId));
            }

            const result = await db
                  .select()
                  .from(dutyAssignments)
                  .where(and(...conditions))
                  .orderBy(dutyAssignments.assignedDate, dutyAssignments.startDateTime);

            return result;
      } catch (error) {
            console.error("[Database] Failed to get assignments by date range:", error);
            throw error;
      }
}

/**
 * Lấy công tác hôm nay
 */
export async function getTodayAssignments() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return getAssignmentsByDate(today);
}

/**
 * Lấy assignments theo đối tượng được phân công
 */
export async function getAssignmentsByAssignee(
      assignedToType: DutyAssignedToType,
      assignedToId: number,
      filters?: { status?: string; startDate?: Date; endDate?: Date }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const conditions = [
                  eq(dutyAssignments.assignedToType, assignedToType as any),
                  eq(dutyAssignments.assignedToId, assignedToId),
            ];

            if (filters?.status) {
                  conditions.push(eq(dutyAssignments.status, filters.status as any));
            }

            if (filters?.startDate && filters?.endDate) {
                  conditions.push(
                        between(
                              dutyAssignments.assignedDate,
                              filters.startDate,
                              filters.endDate
                        )
                  );
            }

            const result = await db
                  .select()
                  .from(dutyAssignments)
                  .where(and(...conditions))
                  .orderBy(dutyAssignments.assignedDate, dutyAssignments.startDateTime);

            return result;
      } catch (error) {
            console.error("[Database] Failed to get assignments by assignee:", error);
            throw error;
      }
}

/**
 * Đánh dấu hoàn thành công tác
 */
export async function markAssignmentCompleted(id: number, notes?: string | null) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .update(dutyAssignments)
                  .set({
                        status: "completed",
                        completedAt: new Date(),
                        notes: notes ?? undefined,
                  } as any)
                  .where(eq(dutyAssignments.id, id));

            return result;
      } catch (error) {
            console.error("[Database] Failed to mark assignment completed:", error);
            throw error;
      }
}

/**
 * Đánh dấu vắng / không làm công tác
 */
export async function markAssignmentSkipped(
      id: number,
      reason?: string | null,
      notes?: string | null
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .update(dutyAssignments)
                  .set({
                        status: "skipped",
                        reason: reason ?? undefined,
                        notes: notes ?? undefined,
                  } as any)
                  .where(eq(dutyAssignments.id, id));

            return result;
      } catch (error) {
            console.error("[Database] Failed to mark assignment skipped:", error);
            throw error;
      }
}

// ============================================================================
// 2.5 DUTY SCHEDULE FUNCTIONS
// ============================================================================

/**
 * Tạo duty schedule
 */
export async function createSchedule(data: InsertDutySchedule) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.insert(dutySchedules).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to create schedule:", error);
            throw error;
      }
}

/**
 * Lấy schedule theo tuần
 */
export async function getScheduleByWeek(weekNumber: number, startDate: Date, endDate: Date) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutySchedules)
                  .where(and(eq(dutySchedules.weekNumber, weekNumber), between(dutySchedules.startDate, startDate, endDate)))
                  .orderBy(dutySchedules.dayOfWeek);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get schedule by week:", error);
            throw error;
      }
}

/**
 * Lấy schedule theo date range
 */
export async function getScheduleByDateRange(startDate: Date, endDate: Date) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutySchedules)
                  .where(and(gte(dutySchedules.startDate, startDate), lte(dutySchedules.endDate, endDate)))
                  .orderBy(dutySchedules.startDate);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get schedule by date range:", error);
            throw error;
      }
}

// ============================================================================
// 2.6 DUTY EVALUATION FUNCTIONS
// ============================================================================

/**
 * Tạo duty evaluation
 */
export async function evaluateDuty(data: InsertDutyEvaluation) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.insert(dutyEvaluations).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to evaluate duty:", error);
            throw error;
      }
}

/**
 * Lấy evaluation theo assignment
 */
export async function getEvaluationByAssignment(assignmentId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(dutyEvaluations)
                  .where(eq(dutyEvaluations.assignmentId, assignmentId))
                  .limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to get evaluation:", error);
            throw error;
      }
}

/**
 * Lấy evaluations theo resident
 */
export async function getEvaluationsByResident(
      residentId: number,
      filters?: { startDate?: Date; endDate?: Date }
) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db
                  .select()
                  .from(dutyEvaluations)
                  .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id))
                  .where(eq(dutyAssignments.residentId, residentId));

            if (filters?.startDate && filters?.endDate) {
                  query = query.where(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            const result = await query.orderBy(dutyAssignments.assignedDate);
            return result;
      } catch (error) {
            console.error("[Database] Failed to get evaluations by resident:", error);
            throw error;
      }
}

/**
 * Lấy evaluation stats
 */
export async function getEvaluationStats(filters?: {
      startDate?: Date;
      endDate?: Date;
      residentId?: number;
}) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db
                  .select()
                  .from(dutyEvaluations)
                  .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id));

            const conditions = [];
            if (filters?.residentId) {
                  conditions.push(eq(dutyAssignments.residentId, filters.residentId));
            }
            if (filters?.startDate && filters?.endDate) {
                  conditions.push(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            if (conditions.length > 0) {
                  query = query.where(and(...conditions));
            }

            const evaluations = await query;

            const avgQuality =
                  evaluations.reduce((sum: number, e: any) => sum + (e.dutyEvaluations.quality || 0), 0) / (evaluations.length || 1);
            const avgPunctuality =
                  evaluations.reduce((sum: number, e: any) => sum + (e.dutyEvaluations.punctuality || 0), 0) / (evaluations.length || 1);
            const avgTotalScore =
                  evaluations.reduce((sum: number, e: any) => sum + (e.dutyEvaluations.totalScore || 0), 0) / (evaluations.length || 1);

            return {
                  totalEvaluations: evaluations.length,
                  averageQuality: Math.round(avgQuality * 100) / 100,
                  averagePunctuality: Math.round(avgPunctuality * 100) / 100,
                  averageScore: Math.round(avgTotalScore * 100) / 100,
            };
      } catch (error) {
            console.error("[Database] Failed to get evaluation stats:", error);
            throw error;
      }
}

// ============================================================================
// 2.7 SCHEDULE CONFLICT FUNCTIONS
// ============================================================================

/**
 * Kiểm tra xung đột lịch
 */
export async function checkScheduleConflict(residentId: number, dutyConfigId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(scheduleConflicts)
                  .where(and(eq(scheduleConflicts.residentId, residentId), eq(scheduleConflicts.dutyConfigId, dutyConfigId)))
                  .limit(1);
            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[Database] Failed to check schedule conflict:", error);
            throw error;
      }
}

/**
 * Lấy conflicts theo resident
 */
export async function getConflictsByResident(residentId: number) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .select()
                  .from(scheduleConflicts)
                  .where(eq(scheduleConflicts.residentId, residentId));
            return result;
      } catch (error) {
            console.error("[Database] Failed to get conflicts by resident:", error);
            throw error;
      }
}

/**
 * Giải quyết conflict
 */
export async function resolveConflict(id: number, resolutionNote: string) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db
                  .update(scheduleConflicts)
                  .set({ isResolved: true, resolutionNote })
                  .where(eq(scheduleConflicts.id, id));
            return result;
      } catch (error) {
            console.error("[Database] Failed to resolve conflict:", error);
            throw error;
      }
}

/**
 * Tạo schedule conflict
 */
export async function createScheduleConflict(data: InsertScheduleConflict) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            const result = await db.insert(scheduleConflicts).values(data);
            return result;
      } catch (error) {
            console.error("[Database] Failed to create schedule conflict:", error);
            throw error;
      }
}

// ============================================================================
// 2.8 DUTY STATISTICS FUNCTIONS
// ============================================================================

/**
 * Lấy duty stats
 */
export async function getDutyStats(filters?: { startDate?: Date; endDate?: Date }) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db.select().from(dutyAssignments);

            if (filters?.startDate && filters?.endDate) {
                  query = query.where(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            const assignments = await query;

            return {
                  total: assignments.length,
                  pending: assignments.filter((a: any) => a.status === "pending").length,
                  confirmed: assignments.filter((a: any) => a.status === "confirmed").length,
                  inProgress: assignments.filter((a: any) => a.status === "in_progress").length,
                  completed: assignments.filter((a: any) => a.status === "completed").length,
                  skipped: assignments.filter((a: any) => a.status === "skipped").length,
                  cancelled: assignments.filter((a: any) => a.status === "cancelled").length,
            };
      } catch (error) {
            console.error("[Database] Failed to get duty stats:", error);
            throw error;
      }
}

/**
 * Lấy resident duty stats
 */
export async function getResidentDutyStats(residentId: number, filters?: { startDate?: Date; endDate?: Date }) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
            let query: any = db
                  .select()
                  .from(dutyAssignments)
                  .where(eq(dutyAssignments.residentId, residentId));

            if (filters?.startDate && filters?.endDate) {
                  query = query.where(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
            }

            const assignments = await query;
            const total = assignments.length;
            const completed = assignments.filter((a) => a.status === "completed").length;

            const evaluations = await db
                  .select()
                  .from(dutyEvaluations)
                  .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id))
                  .where(eq(dutyAssignments.residentId, residentId));
            const avgScore =
                  evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.totalScore || 0), 0) / (evaluations.length || 1);
            const excellent = evaluations.filter((e) => (e.dutyEvaluations.totalScore || 0) >= 9).length;
            return {
                  totalDuties: total,
                  completedCount: completed,
                  averageScore: Math.round(avgScore * 100) / 100,
                  excellentCount: excellent,
            };
      } catch (error) {
            console.error("[Database] Failed to get resident duty stats:", error);
            return { totalDuties: 0, completedCount: 0, averageScore: 0, excellentCount: 0 };
      }
}

export async function getDutyConfigs(filters?: {
      dutyType?: string;
      search?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
}) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query: any = db.select().from(dutyConfigs);
      const conditions = [];

      if (filters?.dutyType) {
            conditions.push(eq(dutyConfigs.dutyType, filters.dutyType as any));
      }

      if (filters?.isActive !== undefined) {
            conditions.push(eq(dutyConfigs.isActive, filters.isActive));
      }

      if (filters?.search) {
            conditions.push(
                  or(
                        like(dutyConfigs.dutyCode, `%${filters.search}%`),
                        like(dutyConfigs.dutyName, `%${filters.search}%`)
                  )
            );
      }

      if (conditions.length > 0) {
            query = query.where(and(...conditions));
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      return await query;
}

export async function getDutyTemplates() {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
            .select()
            .from(dutyTemplates)
            .where(eq(dutyTemplates.isActive, true))
            .orderBy(dutyTemplates.dutyType, dutyTemplates.templateCode);
}

export async function getDutyTemplatesByType(dutyType: "daily" | "weekly" | "monthly") {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
            .select()
            .from(dutyTemplates)
            .where(and(eq(dutyTemplates.dutyType, dutyType), eq(dutyTemplates.isActive, true)))
            .orderBy(dutyTemplates.templateCode);
}


// ============================================================================
// SIMPLE MODE BATCH ASSIGNMENT SUPPORT
// ============================================================================

export type DutyAssignmentAssigneeType = "resident" | "team" | "room" | "committee";

const ACTIVE_DUTY_ASSIGNMENT_STATUSES = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "skipped",
      "absent",
] as const;

export type PreviewDutyAssignmentInput = {
      dutyConfigId: number;
      assignedDates: string[];
      assignedToType: DutyAssignmentAssigneeType;
      assignedToId?: number;
      assignedToIds?: number[];
      startTime?: string | null;
      endTime?: string | null;
      notes?: string | null;
};

export type PreviewDutyAssignmentItem = {
      date: string;
      assignedToId?: number;
      canCreate: boolean;
      reason?: string;
      detail?: string;
      conflictType?: "duplicate" | "capacity" | "study_schedule";
      currentResidentCount?: number;
      minPersons?: number | null;
      maxPersons?: number | null;
};

function buildDateTimeFromDateAndTime(dateText: string, timeText?: string | null) {
      if (!timeText) return null;

      const normalizedTime = timeText.length === 5 ? `${timeText}:00` : timeText;

      return createWallClockDate(dateText, normalizedTime);
}

type StudyDayOfWeek =
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

function getDayOfWeekFromDateText(dateText: string): StudyDayOfWeek {
      const [year, month, day] = dateText.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      switch (date.getDay()) {
            case 0:
                  return "sunday";
            case 1:
                  return "monday";
            case 2:
                  return "tuesday";
            case 3:
                  return "wednesday";
            case 4:
                  return "thursday";
            case 5:
                  return "friday";
            case 6:
                  return "saturday";
            default:
                  return "monday";
      }
}

function normalizePreviewTimeText(value?: string | Date | null) {
      const timeText = toTimeText(value);

      return timeText ? timeText.slice(0, 5) : "";
}

function timeTextToMinutes(value?: string | Date | null) {
      const normalized = normalizePreviewTimeText(value);
      const [hourText, minuteText] = normalized.split(":");
      const hour = Number(hourText);
      const minute = Number(minuteText);

      if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;

      return hour * 60 + minute;
}

function minutesToTimeText(totalMinutes: number) {
      const safeMinutes = Math.max(0, Math.min(24 * 60, totalMinutes));
      const hour = Math.floor(safeMinutes / 60);
      const minute = safeMinutes % 60;

      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isTimeOverlap(input: {
      startA: string;
      endA: string;
      startB: string;
      endB: string;
}) {
      const startA = timeTextToMinutes(input.startA);
      const endA = timeTextToMinutes(input.endA);
      const startB = timeTextToMinutes(input.startB);
      const endB = timeTextToMinutes(input.endB);

      return startA < endB && endA > startB;
}

function expandStudyTimeWithTravel(input: {
      startTime: string | Date | null | undefined;
      endTime: string | Date | null | undefined;
      travelMinutes?: number;
}) {
      const travelMinutes = input.travelMinutes ?? 60;
      const studyStartMinutes = timeTextToMinutes(input.startTime);
      const studyEndMinutes = timeTextToMinutes(input.endTime);

      return {
            busyStartTime: minutesToTimeText(studyStartMinutes - travelMinutes),
            busyEndTime: minutesToTimeText(studyEndMinutes + travelMinutes),
      };
}

// ❌ TODO: Implement when residentStudySchedules table is added (Phase 2 - Education feature)
async function getResidentStudyScheduleConflict(
      db: any,
      input: {
            residentId: number;
            assignedDate: string;
            startTime?: string | null;
            endTime?: string | null;
            travelMinutes?: number;
      }
) {
      return null;
}

async function getDutyAssignmentExistingRows(
      db: any,
      input: {
            dutyConfigId: number;
            assignedDate: string;
            assignedToType: DutyAssignmentAssigneeType;
            assignedToId: number;
      }
) {
      return await db
            .select()
            .from(dutyAssignments)
            .where(
                  and(
                        eq(dutyAssignments.dutyConfigId, input.dutyConfigId),
                        sql`DATE(${dutyAssignments.assignedDate}) = ${input.assignedDate}`,
                        eq(dutyAssignments.assignedToType, input.assignedToType as any),
                        eq(dutyAssignments.assignedToId, input.assignedToId),
                        inArray(dutyAssignments.status, ACTIVE_DUTY_ASSIGNMENT_STATUSES as any)
                  )
            );
}

async function getDutyAssignmentResidentRows(
      db: any,
      input: {
            dutyConfigId: number;
            assignedDate: string;
      }
) {
      return await db
            .select()
            .from(dutyAssignments)
            .where(
                  and(
                        eq(dutyAssignments.dutyConfigId, input.dutyConfigId),
                        sql`DATE(${dutyAssignments.assignedDate}) = ${input.assignedDate}`,
                        or(
                              eq(dutyAssignments.assignedToType, "resident" as any),
                              sql`${dutyAssignments.assignedToType} IS NULL`
                        ),
                        inArray(dutyAssignments.status, ACTIVE_DUTY_ASSIGNMENT_STATUSES as any)
                  )
            );
}

function normalizeAssigneeIds(input: { assignedToId?: number; assignedToIds?: number[] }) {
      const ids = Array.from(
            new Set(
                  [
                        ...(input.assignedToIds || []),
                        input.assignedToId,
                  ]
                        .map((value) => Number(value || 0))
                        .filter((value) => value > 0)
            )
      );

      return ids;
}

export async function previewDutyAssignment(
      input: PreviewDutyAssignmentInput
): Promise<{
      dutyConfig: any;
      items: PreviewDutyAssignmentItem[];
      canCreateCount: number;
      skippedCount: number;
}> {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const configRows = await db
            .select()
            .from(dutyConfigs)
            .where(eq(dutyConfigs.id, input.dutyConfigId))
            .limit(1);

      const dutyConfig = configRows[0] as any;

      if (!dutyConfig) {
            throw new Error("Không tìm thấy mẫu công tác.");
      }

      const items: PreviewDutyAssignmentItem[] = [];
      const assignedDates = Array.from(
            new Set((input.assignedDates || []).map((rawDate) => toDateOnlyText(rawDate)).filter(Boolean))
      ).sort();
      const assigneeIds = normalizeAssigneeIds(input);

      for (const assignedDate of assignedDates) {
            for (const assignedToId of assigneeIds) {

            const duplicateRows = await getDutyAssignmentExistingRows(db, {
                  dutyConfigId: input.dutyConfigId,
                  assignedDate,
                  assignedToType: input.assignedToType,
                  assignedToId,
            });

            if (duplicateRows.length > 0) {
                  items.push({
                        date: assignedDate,
                        assignedToId,
                        canCreate: false,
                        reason: "Đã có phân công cho đối tượng này",
                        conflictType: "duplicate",
                        minPersons: dutyConfig.minPersons ?? null,
                        maxPersons: dutyConfig.maxPersons ?? null,
                  });
                  continue;
            }

            if (input.assignedToType === "resident") {
                  const studyConflict = await getResidentStudyScheduleConflict(db, {
                        residentId: assignedToId,
                        assignedDate,
                        startTime: input.startTime || null,
                        endTime: input.endTime || null,
                        travelMinutes: 60,
                  });

                  if (studyConflict) {
                        items.push({
                              date: assignedDate,
                              assignedToId,
                              canCreate: false,
                              reason: studyConflict.reason,
                              detail: studyConflict.detail,
                              conflictType: "study_schedule",
                              minPersons: dutyConfig.minPersons ?? null,
                              maxPersons: dutyConfig.maxPersons ?? null,
                        });
                        continue;
                  }
            }

            if (input.assignedToType === "resident" && dutyConfig.maxPersons) {
                  const currentResidentRows = await getDutyAssignmentResidentRows(db, {
                        dutyConfigId: input.dutyConfigId,
                        assignedDate,
                  });

                  if (currentResidentRows.length >= Number(dutyConfig.maxPersons)) {
                        items.push({
                              date: assignedDate,
                              assignedToId,
                              canCreate: false,
                              reason: `Đã đủ số lượng tối đa (${dutyConfig.maxPersons} học viên)`,
                              conflictType: "capacity",
                              currentResidentCount: currentResidentRows.length,
                              minPersons: dutyConfig.minPersons ?? null,
                              maxPersons: dutyConfig.maxPersons ?? null,
                        });
                        continue;
                  }

                  items.push({
                        date: assignedDate,
                        assignedToId,
                        canCreate: true,
                        currentResidentCount: currentResidentRows.length,
                        minPersons: dutyConfig.minPersons ?? null,
                        maxPersons: dutyConfig.maxPersons ?? null,
                  });
                  continue;
            }

            items.push({
                  date: assignedDate,
                  assignedToId,
                  canCreate: true,
                  minPersons: dutyConfig.minPersons ?? null,
                  maxPersons: dutyConfig.maxPersons ?? null,
            });
            }
      }

      return {
            dutyConfig,
            items,
            canCreateCount: items.filter((item) => item.canCreate).length,
            skippedCount: items.filter((item) => !item.canCreate).length,
      };
}

export async function assignDutyBatch(input: PreviewDutyAssignmentInput) {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const preview = await previewDutyAssignment(input);
      const createdItems: PreviewDutyAssignmentItem[] = [];
      const skippedItems = preview.items.filter((item) => !item.canCreate);

      for (const item of preview.items.filter((row) => row.canCreate)) {
            const payload = normalizeDutyAssignmentForInsert({
                  dutyConfigId: input.dutyConfigId,
                  residentId: input.assignedToType === "resident" ? ((item as any).assignedToId || null) : null,
                  assignedToType: input.assignedToType,
                  assignedToId: (item as any).assignedToId,
                  assignedDate: item.date,
                  startDateTime: input.startTime,
                  endDateTime: input.endTime,
                  notes: input.notes || undefined,
            } as any);

            await db.insert(dutyAssignments).values(payload);
            createdItems.push(item);
      }

      return {
            created: createdItems.length,
            skipped: skippedItems.length,
            createdItems,
            skippedItems,
            summary: {
                  totalDays: preview.items.length,
                  createdCount: createdItems.length,
                  skippedCount: skippedItems.length,
            },
      };
}