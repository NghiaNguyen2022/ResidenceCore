import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  residents,
  parents,
  rooms,
  roomAssignments,
  roomLeaders,
  groups,
  dutyTemplates,
  dutyConfigs,
  dutyChecklists,
  dutyAssignments,
  dutySchedules,
  dutyEvaluations,
  scheduleConflicts,
  InsertDutyTemplate,
  InsertDutyConfig,
  InsertDutyChecklist,
  InsertDutyAssignment,
  InsertDutySchedule,
  InsertDutyEvaluation,
  InsertScheduleConflict,
} from "../drizzle/schema";
import { eq, like, and, isNull, count, sql, desc, between } from "drizzle-orm";
import { db } from "./index";
/**
 * ============================================
 * DATABASE CONNECTION
 * ============================================
 */

// Tạo connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "residencecare",
  password: process.env.DATABASE_PASSWORD || "ResidenceCare@123",
  database: process.env.DATABASE_NAME || "residence_care",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tạo Drizzle instance
export const db = drizzle(pool);

/**
 * ============================================
 * USER FUNCTIONS
 * ============================================
 */

/**
 * Lấy user theo username
 */
export async function getUserByUsername(username: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[getUserByUsername] Error:", error);
    return null;
  }
}

/**
 * Lấy user theo ID
 */
export async function getUserById(id: number) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return null;
  }
}

/**
 * Cập nhật last signed in time
 */
export async function updateUserLastSignedIn(userId: number, signedInAt: Date) {
  try {
    const result = await db
      .update(users)
      .set({ lastSignedIn: signedInAt })
      .where(eq(users.id, userId));
    
    return result;
  } catch (error) {
    console.error("[updateUserLastSignedIn] Error:", error);
    throw error;
  }
}

/**
 * Tạo hoặc cập nhật user
 */
export async function upsertUser(data: {
  username: string;
  passwordHash: string;
  name?: string | null;
  email?: string;
  role?: "user" | "admin" | "manager" | "supervisor" | "accountant" | "resident";
}) {
  try {
    // Kiểm tra user đã tồn tại chưa
    const existingUser = await getUserByUsername(data.username);

    if (existingUser) {
      // Update user nếu đã tồn tại
      await db
        .update(users)
        .set({
          passwordHash: data.passwordHash,
          name: data.name,
          email: data.email,
          role: data.role || "user",
          lastSignedIn: new Date(),
        })
        .where(eq(users.username, data.username));

      return existingUser;
    } else {
      // Tạo user mới
      const result = await db.insert(users).values({
        username: data.username,
        passwordHash: data.passwordHash,
        name: data.name,
        email: data.email,
        role: data.role || "user",
      });

      return await getUserById(result.insertId);
    }
  } catch (error) {
    console.error("[upsertUser] Error:", error);
    throw error;
  }
}

// ============================================================================
// RESIDENTS FUNCTIONS
// ============================================================================

/**
 * Tạo học viên mới
 */
export async function createResident(data: {
  residentCode: string;
  fullName: string;
  dateOfBirth?: Date | null;
  gender?: "male" | "female" | "other";
  idNumber?: string;
  permanentAddress?: string;
  phoneNumber?: string;
  schoolId?: number;
  profileImage?: string;
  admissionDate: Date;
  notes?: string;
}) {
  try {
    const result = await db.insert(residents).values(data);
    return result;
  } catch (error) {
    console.error("[createResident] Error:", error);
    throw error;
  }
}

/**
 * Lấy học viên theo ID
 */
export async function getResidentById(id: number) {
  try {
    const result = await db
      .select()
      .from(residents)
      .where(eq(residents.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[getResidentById] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách học viên
 */
export async function getResidents(filters?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(residents);

    if (filters?.search) {
      query = query.where(
        or(
          like(residents.fullName, `%${filters.search}%`),
          like(residents.residentCode, `%${filters.search}%`),
          like(residents.phoneNumber, `%${filters.search}%`)
        )
      );
    }

    if (filters?.status) {
      query = query.where(eq(residents.status, filters.status as any));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error("[getResidents] Error:", error);
    return [];
  }
}

/**
 * Cập nhật học viên
 */
export async function updateResident(id: number, data: Partial<any>) {
  try {
    await db.update(residents).set(data).where(eq(residents.id, id));
  } catch (error) {
    console.error("[updateResident] Error:", error);
    throw error;
  }
}

export async function markResidentAsLeft(id: number, departureDate: Date) {
  try {
    await db
      .update(residents)
      .set({ status: "transferred_out", departureDate, updatedAt: new Date() })
      .where(eq(residents.id, id));
  } catch (error) {
    console.error("[markResidentAsLeft] Error:", error);
    throw error;
  }
}

/**
 * Xóa học viên
 */
export async function deleteResident(id: number) {
  try {
    await db.delete(residents).where(eq(residents.id, id));
  } catch (error) {
    console.error("[deleteResident] Error:", error);
    throw error;
  }
}

/**
 * Lấy thống kê học viên
 */
export async function getResidentsStats() {
  try {
    const total = await db
      .select({ count: count() })
      .from(residents);

    const active = await db
      .select({ count: count() })
      .from(residents)
      .where(eq(residents.status, "active"));

    const inactive = await db
      .select({ count: count() })
      .from(residents)
      .where(eq(residents.status, "inactive"));

    return {
      total: total[0]?.count || 0,
      active: active[0]?.count || 0,
      inactive: inactive[0]?.count || 0,
    };
  } catch (error) {
    console.error("[getResidentsStats] Error:", error);
    return { total: 0, active: 0, inactive: 0 };
  }
}

// ============================================================================
// PARENTS FUNCTIONS
// ============================================================================

/**
 * Tạo cha mẹ
 */
export async function createParent(data: {
  residentId: number;
  parentType: "father" | "mother" | "guardian";
  fullName: string;
  phoneNumber?: string;
  email?: string;
  idNumber?: string;
  occupation?: string;
  address?: string;
  notes?: string;
}) {
  try {
    const result = await db.insert(parents).values(data);
    return result;
  } catch (error) {
    console.error("[createParent] Error:", error);
    throw error;
  }
}

/**
 * Lấy cha mẹ theo ID
 */
export async function getParentById(id: number) {
  try {
    const result = await db
      .select()
      .from(parents)
      .where(eq(parents.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[getParentById] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách cha mẹ của học viên
 */
export async function getParentsByResident(residentId: number) {
  try {
    const result = await db
      .select()
      .from(parents)
      .where(eq(parents.residentId, residentId));

    return result;
  } catch (error) {
    console.error("[getParentsByResident] Error:", error);
    return [];
  }
}

export async function getParentsByResidentId(residentId: number) {
  return getParentsByResident(residentId);
}

/**
 * Cập nhật cha mẹ
 */
export async function updateParent(id: number, data: Partial<any>) {
  try {
    await db.update(parents).set(data).where(eq(parents.id, id));
  } catch (error) {
    console.error("[updateParent] Error:", error);
    throw error;
  }
}

/**
 * Xóa cha mẹ
 */
export async function deleteParent(id: number) {
  try {
    await db.delete(parents).where(eq(parents.id, id));
  } catch (error) {
    console.error("[deleteParent] Error:", error);
    throw error;
  }
}

// ============================================================================
// ROOMS FUNCTIONS
// ============================================================================

/**
 * Tạo phòng mới
 */
export async function createRoom(data: {
  roomCode: string;
  capacity: number;
  groupId?: number;
  notes?: string;
}) {
  try {
    const result = await db.insert(rooms).values(data);
    return result;
  } catch (error) {
    console.error("[createRoom] Error:", error);
    throw error;
  }
}

/**
 * Lấy phòng theo ID
 */
export async function getRoomById(id: number) {
  try {
    const result = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[getRoomById] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách phòng
 */
export async function getRooms(filters?: {
  search?: string;
  capacity?: number;
  groupId?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(rooms);

    if (filters?.search) {
      query = query.where(like(rooms.roomCode, `%${filters.search}%`));
    }

    if (filters?.capacity) {
      query = query.where(eq(rooms.capacity, filters.capacity));
    }

    if (filters?.groupId) {
      query = query.where(eq(rooms.groupId, filters.groupId));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error("[getRooms] Error:", error);
    return [];
  }
}

/**
 * Cập nhật phòng
 */
export async function updateRoom(id: number, data: Partial<any>) {
  try {
    await db.update(rooms).set(data).where(eq(rooms.id, id));
  } catch (error) {
    console.error("[updateRoom] Error:", error);
    throw error;
  }
}

/**
 * Xóa phòng
 */
export async function deleteRoom(id: number) {
  try {
    await db.delete(rooms).where(eq(rooms.id, id));
  } catch (error) {
    console.error("[deleteRoom] Error:", error);
    throw error;
  }
}

/**
 * Lấy thống kê phòng
 */
export async function getRoomsStats() {
  try {
    const total = await db
      .select({ count: count() })
      .from(rooms);

    return {
      total: total[0]?.count || 0,
    };
  } catch (error) {
    console.error("[getRoomsStats] Error:", error);
    return { total: 0 };
  }
}

/**
 * Lấy chi tiết phòng kèm danh sách học viên
 */
export async function getRoomDetails(roomId: number) {
  try {
    const room = await getRoomById(roomId);
    if (!room) return null;

    const residents = await getResidentsInRoom(roomId);

    return {
      ...room,
      residents,
    };
  } catch (error) {
    console.error("[getRoomDetails] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách phòng kèm chi tiết
 */
export async function getRoomsWithDetails(filters?: {
  search?: string;
  capacity?: number;
  groupId?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    const roomsList = await getRooms(filters);

    const roomsWithDetails = await Promise.all(
      roomsList.map(async (room) => {
        const residentsCount = await getRoomCurrentOccupancy(room.id);
        return {
          ...room,
          residentsCount,
        };
      })
    );

    return roomsWithDetails;
  } catch (error) {
    console.error("[getRoomsWithDetails] Error:", error);
    return [];
  }
}

/**
 * Gán học viên vào phòng
 */
export async function assignResidentToRoom(data: {
  residentId: number;
  roomId: number;
  assignedDate: Date;
  eventType: "new_entry" | "transfer" | "temporary_leave" | "left";
  reason?: string;
  notes?: string;
}) {
  try {
    const result = await db.insert(roomAssignments).values(data);
    return result;
  } catch (error) {
    console.error("[assignResidentToRoom] Error:", error);
    throw error;
  }
}

/**
 * Lấy lịch sử gán phòng của học viên
 */
export async function getRoomAssignmentHistory(residentId: number) {
  try {
    const result = await db
      .select()
      .from(roomAssignments)
      .where(eq(roomAssignments.residentId, residentId))
      .orderBy(desc(roomAssignments.assignedDate));

    return result;
  } catch (error) {
    console.error("[getRoomAssignmentHistory] Error:", error);
    return [];
  }
}

/**
 * Lấy danh sách học viên trong phòng (hiện tại)
 */
export async function getResidentsInRoom(roomId: number) {
  try {
    const result = await db
      .select({
        id: roomAssignments.id,
        residentId: roomAssignments.residentId,
        roomId: roomAssignments.roomId,
        assignedDate: roomAssignments.assignedDate,
        unassignedDate: roomAssignments.unassignedDate,
        eventType: roomAssignments.eventType,
        reason: roomAssignments.reason,
        resident: residents,
      })
      .from(roomAssignments)
      .innerJoin(residents, eq(roomAssignments.residentId, residents.id))
      .where(
        and(
          eq(roomAssignments.roomId, roomId),
          isNull(roomAssignments.unassignedDate)
        )
      )
      .orderBy(roomAssignments.assignedDate);

    return result;
  } catch (error) {
    console.error("[getResidentsInRoom] Error:", error);
    return [];
  }
}

/**
 * Kiểm tra phòng có trống không
 */
export async function isRoomAvailable(roomId: number, capacity: number) {
  try {
    const residents = await getResidentsInRoom(roomId);
    return residents.length < capacity;
  } catch (error) {
    console.error("[isRoomAvailable] Error:", error);
    return false;
  }
}

/**
 * Lấy số lượng học viên hiện tại trong phòng
 */
export async function getRoomCurrentOccupancy(roomId: number) {
  try {
    const residents = await getResidentsInRoom(roomId);
    return residents.length;
  } catch (error) {
    console.error("[getRoomCurrentOccupancy] Error:", error);
    return 0;
  }
}

// ============================================================================
// ROOM LEADERS FUNCTIONS
// ============================================================================

/**
 * Bổ nhiệm trưởng phòng
 */
export async function appointRoomLeader(data: {
  roomId: number;
  residentId: number;
  appointedDate: Date;
  notes?: string;
}) {
  try {
    const result = await db.insert(roomLeaders).values(data);
    return result;
  } catch (error) {
    console.error("[appointRoomLeader] Error:", error);
    throw error;
  }
}

/**
 * Lấy trưởng phòng hiện tại
 */
export async function getCurrentRoomLeader(roomId: number) {
  try {
    const result = await db
      .select()
      .from(roomLeaders)
      .where(
        and(
          eq(roomLeaders.roomId, roomId),
          isNull(roomLeaders.unappointedDate)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[getCurrentRoomLeader] Error:", error);
    return null;
  }
}

export async function getRoomLeader(roomId: number) {
  return getCurrentRoomLeader(roomId);
}

export async function getRoomLeaderHistory(roomId: number) {
  try {
    const result = await db
      .select()
      .from(roomLeaders)
      .where(eq(roomLeaders.roomId, roomId))
      .orderBy(desc(roomLeaders.appointedDate));

    return result;
  } catch (error) {
    console.error("[getRoomLeaderHistory] Error:", error);
    return [];
  }
}

/**
 * Hủy bổ nhiệm trưởng phòng
 */
export async function removeRoomLeader(id: number, unappointedDate: Date) {
  try {
    await db
      .update(roomLeaders)
      .set({ unappointedDate })
      .where(eq(roomLeaders.id, id));
  } catch (error) {
    console.error("[removeRoomLeader] Error:", error);
    throw error;
  }
}

// ============================================================================
// DUTY MANAGEMENT FUNCTIONS
// ============================================================================

// 2.1 DUTY TEMPLATE FUNCTIONS

/**
 * Tạo duty template mẫu
 */
export async function createDutyTemplate(data: InsertDutyTemplate) {
  try {
    const result = await db.insert(dutyTemplates).values(data);
    return result;
  } catch (error) {
    console.error("[createDutyTemplate] Error:", error);
    throw error;
  }
}

/**
 * Lấy duty template theo ID
 */
export async function getDutyTemplate(id: number) {
  try {
    const result = await db
      .select()
      .from(dutyTemplates)
      .where(eq(dutyTemplates.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[getDutyTemplate] Error:", error);
    return undefined;
  }
}

/**
 * Danh sách tất cả duty templates
 */
export async function listDutyTemplates() {
  try {
    const result = await db
      .select()
      .from(dutyTemplates)
      .where(eq(dutyTemplates.isActive, true));
    return result;
  } catch (error) {
    console.error("[listDutyTemplates] Error:", error);
    return [];
  }
}

// 2.2 DUTY CONFIG FUNCTIONS

/**
 * Tạo duty config từ template hoặc tùy chỉnh
 */
export async function createDutyConfig(data: InsertDutyConfig) {
  try {
    const result = await db.insert(dutyConfigs).values(data);
    return result;
  } catch (error) {
    console.error("[createDutyConfig] Error:", error);
    throw error;
  }
}

/**
 * Cập nhật duty config
 */
export async function updateDutyConfig(id: number, data: Partial<InsertDutyConfig>) {
  try {
    await db.update(dutyConfigs).set(data).where(eq(dutyConfigs.id, id));
  } catch (error) {
    console.error("[updateDutyConfig] Error:", error);
    throw error;
  }
}

/**
 * Xóa duty config
 */
export async function deleteDutyConfig(id: number) {
  try {
    await db.delete(dutyConfigs).where(eq(dutyConfigs.id, id));
  } catch (error) {
    console.error("[deleteDutyConfig] Error:", error);
    throw error;
  }
}

/**
 * Lấy duty config theo ID
 */
export async function getDutyConfig(id: number) {
  try {
    const result = await db
      .select()
      .from(dutyConfigs)
      .where(eq(dutyConfigs.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[getDutyConfig] Error:", error);
    return undefined;
  }
}

/**
 * Danh sách duty configs
 */
export async function listDutyConfigs(filters?: { dutyType?: string; isActive?: boolean }) {
  try {
    let query = db.select().from(dutyConfigs);

    const conditions = [];
    if (filters?.isActive !== undefined) {
      conditions.push(eq(dutyConfigs.isActive, filters.isActive));
    }
    if (filters?.dutyType) {
      conditions.push(eq(dutyConfigs.dutyType, filters.dutyType as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error("[listDutyConfigs] Error:", error);
    return [];
  }
}

// 2.3 DUTY CHECKLIST FUNCTIONS

/**
 * Thêm checklist item
 */
export async function addChecklistItem(data: InsertDutyChecklist) {
  try {
    const result = await db.insert(dutyChecklists).values(data);
    return result;
  } catch (error) {
    console.error("[addChecklistItem] Error:", error);
    throw error;
  }
}

/**
 * Cập nhật checklist item
 */
export async function updateChecklistItem(id: number, data: Partial<InsertDutyChecklist>) {
  try {
    await db.update(dutyChecklists).set(data).where(eq(dutyChecklists.id, id));
  } catch (error) {
    console.error("[updateChecklistItem] Error:", error);
    throw error;
  }
}

/**
 * Lấy checklist của duty config
 */
export async function getChecklistByDutyId(dutyConfigId: number) {
  try {
    const result = await db
      .select()
      .from(dutyChecklists)
      .where(eq(dutyChecklists.dutyConfigId, dutyConfigId))
      .orderBy(dutyChecklists.itemOrder);
    return result;
  } catch (error) {
    console.error("[getChecklistByDutyId] Error:", error);
    return [];
  }
}

// 2.4 DUTY ASSIGNMENT FUNCTIONS

/**
 * Gán công tác cho sinh viên
 */
export async function assignDuty(data: InsertDutyAssignment) {
  try {
    const result = await db.insert(dutyAssignments).values(data);
    return result;
  } catch (error) {
    console.error("[assignDuty] Error:", error);
    throw error;
  }
}

/**
 * Cập nhật phân công công tác
 */
export async function updateAssignment(id: number, data: Partial<InsertDutyAssignment>) {
  try {
    await db.update(dutyAssignments).set(data).where(eq(dutyAssignments.id, id));
  } catch (error) {
    console.error("[updateAssignment] Error:", error);
    throw error;
  }
}

/**
 * Lấy danh sách sinh viên được gán công tác
 */
export async function getAssignmentsByDuty(
  dutyConfigId: number,
  filters?: { status?: string; startDate?: Date; endDate?: Date }
) {
  try {
    let query = db
      .select()
      .from(dutyAssignments)
      .where(eq(dutyAssignments.dutyConfigId, dutyConfigId));

    if (filters?.status) {
      query = query.where(eq(dutyAssignments.status, filters.status as any));
    }

    if (filters?.startDate && filters?.endDate) {
      query = query.where(
        between(dutyAssignments.assignedDate, filters.startDate, filters.endDate)
      );
    }

    const result = await query;
    return result;
  } catch (error) {
    console.error("[getAssignmentsByDuty] Error:", error);
    return [];
  }
}

// 2.5 DUTY SCHEDULE FUNCTIONS

/**
 * Tạo lịch công tác
 */
export async function createSchedule(data: InsertDutySchedule) {
  try {
    const result = await db.insert(dutySchedules).values(data);
    return result;
  } catch (error) {
    console.error("[createSchedule] Error:", error);
    throw error;
  }
}

/**
 * Lấy lịch công tác theo tuần
 */
export async function getScheduleByWeek(weekNumber: number, startDate: Date, endDate: Date) {
  try {
    const result = await db
      .select()
      .from(dutySchedules)
      .where(
        and(
          eq(dutySchedules.weekNumber, weekNumber),
          between(dutySchedules.startDate, startDate, endDate)
        )
      );
    return result;
  } catch (error) {
    console.error("[getScheduleByWeek] Error:", error);
    return [];
  }
}

/**
 * Lấy lịch công tác trong khoảng thời gian
 */
export async function getScheduleByDateRange(startDate: Date, endDate: Date) {
  try {
    const result = await db
      .select()
      .from(dutySchedules)
      .where(between(dutySchedules.startDate, startDate, endDate));
    return result;
  } catch (error) {
    console.error("[getScheduleByDateRange] Error:", error);
    return [];
  }
}

// 2.6 DUTY EVALUATION FUNCTIONS

/**
 * Đánh giá công tác
 */
export async function evaluateDuty(data: InsertDutyEvaluation) {
  try {
    const result = await db.insert(dutyEvaluations).values(data);
    return result;
  } catch (error) {
    console.error("[evaluateDuty] Error:", error);
    throw error;
  }
}

/**
 * Lấy thống kê đánh giá
 */
export async function getEvaluationStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  residentId?: number;
}) {
  try {
    let query = db.select().from(dutyEvaluations);

    if (filters?.residentId) {
      query = query
        .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id))
        .where(eq(dutyAssignments.residentId, filters.residentId));
    }

    const evaluations = await query;
    const total = evaluations.length;
    const avgScore =
      evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.totalScore || 0), 0) /
      (total || 1);
    const excellent = evaluations.filter(
      (e) => (e.dutyEvaluations.totalScore || 0) >= 9
    ).length;
    const good = evaluations.filter(
      (e) => (e.dutyEvaluations.totalScore || 0) >= 7 && (e.dutyEvaluations.totalScore || 0) < 9
    ).length;
    const normal = evaluations.filter(
      (e) => (e.dutyEvaluations.totalScore || 0) >= 5 && (e.dutyEvaluations.totalScore || 0) < 7
    ).length;
    const poor = evaluations.filter((e) => (e.dutyEvaluations.totalScore || 0) < 5).length;

    return {
      totalEvaluations: total,
      averageScore: Math.round(avgScore * 100) / 100,
      excellentCount: excellent,
      goodCount: good,
      normalCount: normal,
      poorCount: poor,
    };
  } catch (error) {
    console.error("[getEvaluationStats] Error:", error);
    return {
      totalEvaluations: 0,
      averageScore: 0,
      excellentCount: 0,
      goodCount: 0,
      normalCount: 0,
      poorCount: 0,
    };
  }
}

// 2.7 SCHEDULE CONFLICT FUNCTIONS

/**
 * Kiểm tra xung đột giữa công tác và lịch học
 */
export async function checkScheduleConflict(residentId: number, dutyConfigId: number) {
  try {
    const result = await db
      .select()
      .from(scheduleConflicts)
      .where(
        and(
          eq(scheduleConflicts.residentId, residentId),
          eq(scheduleConflicts.dutyConfigId, dutyConfigId)
        )
      )
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[checkScheduleConflict] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách xung đột của sinh viên
 */
export async function getConflictsByResident(residentId: number) {
  try {
    const result = await db
      .select()
      .from(scheduleConflicts)
      .where(
        and(
          eq(scheduleConflicts.residentId, residentId),
          eq(scheduleConflicts.isResolved, false)
        )
      );
    return result;
  } catch (error) {
    console.error("[getConflictsByResident] Error:", error);
    return [];
  }
}

/**
 * Giải quyết xung đột
 */
export async function resolveConflict(id: number, resolutionNote: string) {
  try {
    await db
      .update(scheduleConflicts)
      .set({ isResolved: true, resolutionNote })
      .where(eq(scheduleConflicts.id, id));
  } catch (error) {
    console.error("[resolveConflict] Error:", error);
    throw error;
  }
}

/**
 * Tạo conflict record
 */
export async function createScheduleConflict(data: InsertScheduleConflict) {
  try {
    const result = await db.insert(scheduleConflicts).values(data);
    return result;
  } catch (error) {
    console.error("[createScheduleConflict] Error:", error);
    throw error;
  }
}

// 2.8 STATISTICS & REPORT FUNCTIONS

/**
 * Lấy thống kê công tác
 */
export async function getDutyStats(filters?: { startDate?: Date; endDate?: Date }) {
  try {
    let query = db.select().from(dutyAssignments);

    if (filters?.startDate && filters?.endDate) {
      query = query.where(
        between(dutyAssignments.assignedDate, filters.startDate, filters.endDate)
      );
    }

    const assignments = await query;
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === "completed").length;
    const pending = assignments.filter(
      (a) => a.status === "pending" || a.status === "confirmed"
    ).length;
    const skipped = assignments.filter(
      (a) => a.status === "skipped" || a.status === "cancelled"
    ).length;

    return {
      totalDuties: total,
      completedCount: completed,
      pendingCount: pending,
      skippedCount: skipped,
    };
  } catch (error) {
    console.error("[getDutyStats] Error:", error);
    return { totalDuties: 0, completedCount: 0, pendingCount: 0, skippedCount: 0 };
  }
}

/**
 * Lấy thống kê công tác của sinh viên
 */
export async function getResidentDutyStats(
  residentId: number,
  filters?: { startDate?: Date; endDate?: Date }
) {
  try {
    let query = db
      .select()
      .from(dutyAssignments)
      .where(eq(dutyAssignments.residentId, residentId));

    if (filters?.startDate && filters?.endDate) {
      query = query.where(
        between(dutyAssignments.assignedDate, filters.startDate, filters.endDate)
      );
    }

    const assignments = await query;
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === "completed").length;

    // Lấy đánh giá
    const evaluations = await db
      .select()
      .from(dutyEvaluations)
      .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id))
      .where(eq(dutyAssignments.residentId, residentId));

    const avgScore =
      evaluations.reduce((sum, e) => sum + (e.dutyEvaluations.totalScore || 0), 0) /
      (evaluations.length || 1);
    const excellent = evaluations.filter(
      (e) => (e.dutyEvaluations.totalScore || 0) >= 9
    ).length;

    return {
      totalDuties: total,
      completedCount: completed,
      averageScore: Math.round(avgScore * 100) / 100,
      excellentCount: excellent,
    };
  } catch (error) {
    console.error("[getResidentDutyStats] Error:", error);
    return { totalDuties: 0, completedCount: 0, averageScore: 0, excellentCount: 0 };
  }
}


/**
 * ============================================
 * MISSING DUTY FUNCTIONS - THÊM VÀO DB.TS
 * ============================================
 */

/**
 * Lấy công tác theo code
 */
export async function getDutyConfigByCode(dutyCode: string) {
  try {
    const config = await db
      .select()
      .from(dutyConfigs)
      .where(eq(dutyConfigs.dutyCode, dutyCode))
      .limit(1);
    return config[0] || null;
  } catch (error) {
    console.error("[getDutyConfigByCode] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách công tác theo bộ lọc
 */
export async function getDutyConfigs(filters?: {
  dutyType?: string;
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db.select().from(dutyConfigs);

    const conditions = [];

    if (filters?.dutyType) {
      conditions.push(eq(dutyConfigs.dutyType, filters.dutyType));
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
  } catch (error) {
    console.error("[getDutyConfigs] Error:", error);
    return [];
  }
}

/**
 * Lấy công tác được gán cho học viên theo ngày
 */
export async function getAssignmentsByDate(date: Date) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const assignments = await db
      .select()
      .from(dutyAssignments)
      .innerJoin(dutyConfigs, eq(dutyAssignments.dutyConfigId, dutyConfigs.id))
      .where(between(dutyAssignments.assignedDate, startOfDay, endOfDay));

    return assignments;
  } catch (error) {
    console.error("[getAssignmentsByDate] Error:", error);
    return [];
  }
}

/**
 * Lấy công tác được gán cho học viên
 */
export async function getAssignmentsByResident(filters?: {
  residentId: number;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = db
      .select()
      .from(dutyAssignments)
      .innerJoin(dutyConfigs, eq(dutyAssignments.dutyConfigId, dutyConfigs.id))
      .where(eq(dutyAssignments.residentId, filters?.residentId || 0));

    if (filters?.status) {
      query = query.where(eq(dutyAssignments.status, filters.status));
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error("[getAssignmentsByResident] Error:", error);
    return [];
  }
}

/**
 * Hủy công tác
 */
export async function cancelAssignment(id: number, reason?: string) {
  try {
    await db
      .update(dutyAssignments)
      .set({
        status: "cancelled",
        notes: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(dutyAssignments.id, id));

    return { success: true };
  } catch (error) {
    console.error("[cancelAssignment] Error:", error);
    throw error;
  }
}

/**
 * Lấy đánh giá công tác
 */
export async function getEvaluationByAssignment(assignmentId: number) {
  try {
    const evaluation = await db
      .select()
      .from(dutyEvaluations)
      .where(eq(dutyEvaluations.assignmentId, assignmentId))
      .limit(1);

    return evaluation[0] || null;
  } catch (error) {
    console.error("[getEvaluationByAssignment] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách đánh giá của học viên
 */
export async function getEvaluationsByResident(residentId: number) {
  try {
    const evaluations = await db
      .select()
      .from(dutyEvaluations)
      .innerJoin(dutyAssignments, eq(dutyEvaluations.assignmentId, dutyAssignments.id))
      .where(eq(dutyAssignments.residentId, residentId));

    return evaluations;
  } catch (error) {
    console.error("[getEvaluationsByResident] Error:", error);
    return [];
  }
}

/**
 * Xóa công việc khỏi checklist
 */
export async function deleteChecklistItem(id: number) {
  try {
    await db.delete(dutyChecklists).where(eq(dutyChecklists.id, id));
    return { success: true };
  } catch (error) {
    console.error("[deleteChecklistItem] Error:", error);
    throw error;
  }
}

/**
 * Lấy danh sách công tác mẫu (active)
 */
export async function getDutyTemplates() {
  try {
    const templates = await db
      .select()
      .from(dutyTemplates)
      .where(eq(dutyTemplates.isActive, true))
      .orderBy(dutyTemplates.dutyType, dutyTemplates.templateCode);

    return templates;
  } catch (error) {
    console.error("[getDutyTemplates] Error:", error);
    return [];
  }
}

/**
 * Lấy công tác mẫu theo code
 */
export async function getDutyTemplateByCode(templateCode: string) {
  try {
    const template = await db
      .select()
      .from(dutyTemplates)
      .where(
        and(
          eq(dutyTemplates.templateCode, templateCode),
          eq(dutyTemplates.isActive, true)
        )
      )
      .limit(1);

    return template[0] || null;
  } catch (error) {
    console.error("[getDutyTemplateByCode] Error:", error);
    return null;
  }
}

/**
 * Lấy danh sách công tác mẫu theo loại (daily/weekly/monthly)
 */
export async function getDutyTemplatesByType(dutyType: string) {
  try {
    const templates = await db
      .select()
      .from(dutyTemplates)
      .where(
        and(
          eq(dutyTemplates.dutyType, dutyType),
          eq(dutyTemplates.isActive, true)
        )
      )
      .orderBy(dutyTemplates.templateCode);

    return templates;
  } catch (error) {
    console.error("[getDutyTemplatesByType] Error:", error);
    return [];
  }
}