/**
 * Duty Management Database Functions
 * Các hàm liên quan đến quản lý công tác
 */

import { getDb } from "./user";
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
import { eq, and, or, gte, lte, between, inArray } from "drizzle-orm";

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
    let query = db.select().from(dutyConfigs);

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
export async function addChecklistItem(data: InsertDutyChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(dutyChecklists).values(data);
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

/**
 * Gán công tác cho học viên
 */
export async function assignDuty(data: InsertDutyAssignment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(dutyAssignments).values(data);
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
    let query = db
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
export async function getAssignmentsByDate(date: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select()
      .from(dutyAssignments)
      .where(eq(dutyAssignments.assignedDate, date))
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
    let query = db
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
    let query = db
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
    let query = db
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
      evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.quality || 0), 0) / (evaluations.length || 1);
    const avgPunctuality =
      evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.punctuality || 0), 0) / (evaluations.length || 1);
    const avgScore =
      evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.totalScore || 0), 0) / (evaluations.length || 1);

    return {
      totalEvaluations: evaluations.length,
      averageQuality: Math.round(avgQuality * 100) / 100,
      averagePunctuality: Math.round(avgPunctuality * 100) / 100,
      averageScore: Math.round(avgScore * 100) / 100,
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
    let query = db.select().from(dutyAssignments);

    if (filters?.startDate && filters?.endDate) {
      query = query.where(between(dutyAssignments.assignedDate, filters.startDate, filters.endDate));
    }

    const assignments = await query;

    return {
      total: assignments.length,
      pending: assignments.filter((a) => a.status === "pending").length,
      confirmed: assignments.filter((a) => a.status === "confirmed").length,
      inProgress: assignments.filter((a) => a.status === "in_progress").length,
      completed: assignments.filter((a) => a.status === "completed").length,
      skipped: assignments.filter((a) => a.status === "skipped").length,
      cancelled: assignments.filter((a) => a.status === "cancelled").length,
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
    let query = db
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