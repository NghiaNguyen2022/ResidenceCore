import { getDb } from "./connection";
import {
      and,
      asc,
      count,
      desc,
      eq,
      inArray,
      isNull,
      like,
      or,
} from "drizzle-orm";
import {
      InsertParent,
      InsertResident,
      parents,
      residents,
      roomAssignments,
      rooms,
      residentEducation,
      InsertResidentEducation,
      residentStudySchedules
} from "../../drizzle/schema";

function getParentTypePriority(parentType?: string | null) {
      switch (parentType) {
            case "mother":
                  return 1;
            case "father":
                  return 2;
            case "guardian":
                  return 3;
            default:
                  return 9;
      }
}

function pickPrimaryContact(parentRows: Array<any>) {
      if (!parentRows || parentRows.length === 0) {
            return null;
      }

      const sortedParents = [...parentRows].sort((a, b) => {
            const priorityDiff =
                  getParentTypePriority(a.parentType) - getParentTypePriority(b.parentType);

            if (priorityDiff !== 0) {
                  return priorityDiff;
            }

            const aHasPhone = a.phoneNumber ? 0 : 1;
            const bHasPhone = b.phoneNumber ? 0 : 1;

            if (aHasPhone !== bHasPhone) {
                  return aHasPhone - bHasPhone;
            }

            return Number(a.id || 0) - Number(b.id || 0);
      });

      return (
            sortedParents.find((parent) => parent.phoneNumber) ||
            sortedParents[0] ||
            null
      );
}

async function attachPrimaryContacts<T extends { id: number }>(
      residentRows: T[]
) {
      if (!residentRows || residentRows.length === 0) {
            return residentRows;
      }

      const db = getDb();
      const residentIds = residentRows.map((resident) => resident.id);

      if (residentIds.length === 0) {
            return residentRows;
      }

      const parentRows = await db
            .select({
                  id: parents.id,
                  residentId: parents.residentId,
                  parentType: parents.parentType,
                  fullName: parents.fullName,
                  phoneNumber: parents.phoneNumber,
                  email: parents.email,
            })
            .from(parents)
            .where(inArray(parents.residentId, residentIds));

      const parentsByResidentId = new Map<number, any[]>();

      for (const parent of parentRows) {
            const list = parentsByResidentId.get(parent.residentId) || [];
            list.push(parent);
            parentsByResidentId.set(parent.residentId, list);
      }

      return residentRows.map((resident) => {
            const primaryContact = pickPrimaryContact(
                  parentsByResidentId.get(resident.id) || []
            );

            return {
                  ...resident,
                  primaryContactType: primaryContact?.parentType ?? null,
                  primaryContactName: primaryContact?.fullName ?? null,
                  primaryContactPhone: primaryContact?.phoneNumber ?? null,
                  primaryContactEmail: primaryContact?.email ?? null,
            };
      });
}

function getResidentSelectFields() {
      return {
            id: residents.id,
            residentCode: residents.residentCode,
            holyName: residents.holyName,
            fullName: residents.fullName,
            dateOfBirth: residents.dateOfBirth,
            gender: residents.gender,
            idNumber: residents.idNumber,
            permanentAddress: residents.permanentAddress,
            phoneNumber: residents.phoneNumber,
            schoolId: residents.schoolId,
            profileImage: residents.profileImage,
            admissionDate: residents.admissionDate,
            departureDate: residents.departureDate,
            status: residents.status,
            notes: residents.notes,
            userId: residents.userId,
            currentRoomId: residents.currentRoomId,
            createdAt: residents.createdAt,
            updatedAt: residents.updatedAt,

            roomId: rooms.id,
            roomCode: rooms.roomCode,
            roomName: rooms.roomCode,
            currentRoomCode: rooms.roomCode,
            currentRoomName: rooms.roomCode,
      };
}

export async function createResident(data: InsertResident) {
      const db = getDb();

      try {
            await db.insert(residents).values(data);

            const result = await db
                  .select()
                  .from(residents)
                  .where(eq(residents.residentCode, data.residentCode))
                  .orderBy(desc(residents.id))
                  .limit(1);

            return result.length > 0 ? result[0] : null;
      } catch (error) {
            console.error("[createResident] Error:", error);
            throw error;
      }
}

export async function getResidentById(id: number) {
      const db = getDb();

      const result = await db
            .select(getResidentSelectFields())
            .from(residents)
            .leftJoin(rooms, eq(residents.currentRoomId, rooms.id))
            .where(eq(residents.id, id))
            .limit(1);

      if (result.length === 0) {
            return null;
      }

      const withContacts = await attachPrimaryContacts(result);

      return withContacts.length > 0 ? withContacts[0] : result[0];
}

export async function getResidents(filters?: {
      search?: string;
      status?: string;
      limit?: number;
      offset?: number;
}) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;
            conditions.push(
                  or(
                        like(residents.fullName, keyword),
                        like(residents.holyName, keyword),
                        like(residents.residentCode, keyword),
                        like(residents.phoneNumber, keyword),
                        like(rooms.roomCode, keyword)
                  )
            );
      }

      if (filters?.status && filters.status !== "all") {
            conditions.push(eq(residents.status, filters.status as any));
      }

      let query: any = db
            .select(getResidentSelectFields())
            .from(residents)
            .leftJoin(rooms, eq(residents.currentRoomId, rooms.id));

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      query = query.orderBy(asc(residents.fullName));

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      const residentRows = await query;

      return attachPrimaryContacts(residentRows);
}

export async function updateResident(
      id: number,
      data: Partial<InsertResident>
) {
      const db = getDb();

      await db
            .update(residents)
            .set({
                  ...data,
                  updatedAt: new Date(),
            })
            .where(eq(residents.id, id));

      return getResidentById(id);
}

async function closeOpenRoomAssignmentForResident(
      residentId: number,
      unassignedDate: Date,
      reason?: string
) {
      const db = getDb();

      const currentAssignments = await db
            .select()
            .from(roomAssignments)
            .where(
                  and(
                        eq(roomAssignments.residentId, residentId),
                        isNull(roomAssignments.unassignedDate)
                  )
            )
            .limit(1);

      const currentAssignment = currentAssignments[0];

      if (!currentAssignment) {
            return null;
      }

      const currentReason = currentAssignment.reason;
      const nextReason = reason
            ? currentReason
                  ? `${currentReason}; ${reason}`
                  : reason
            : currentReason;

      await db
            .update(roomAssignments)
            .set({
                  unassignedDate,
                  reason: nextReason,
            })
            .where(eq(roomAssignments.id, currentAssignment.id));

      return currentAssignment;
}

export async function markResidentAsLeft(id: number, departureDate: Date) {
      const db = getDb();

      /**
       * Rời lưu xá phải nhả phòng:
       * - Đóng assignment đang mở bằng unassignedDate.
       * - Set residents.currentRoomId = null.
       * - Không xóa roomAssignments để giữ lịch sử phòng.
       */
      await closeOpenRoomAssignmentForResident(
            id,
            departureDate,
            "Rời lưu xá / ngừng lưu trú"
      );

      await db
            .update(residents)
            .set({
                  status: "transferred_out",
                  departureDate,
                  currentRoomId: null,
                  updatedAt: new Date(),
            })
            .where(eq(residents.id, id));

      return getResidentById(id);
}
type EducationLevel =
      | "high_school"
      | "vocational"
      | "college"
      | "university"
      | "other";

export type ResidentEducationInput = {
      residentId: number;
      schoolName: string;
      educationLevel?: EducationLevel | null;
      classOrMajor?: string | null;
      academicYear?: string | null;
      notes?: string | null;
};

type DayOfWeek =
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

function getDayOfWeekFromDateText(dateText: string): DayOfWeek {
      const date = new Date(`${dateText}T00:00:00`);

      const day = date.getDay();

      switch (day) {
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
function normalizeTimeText(value: string) {
      if (!value) return "";
      return value.slice(0, 5);
}

function timeTextToMinutes(value: string) {
      const normalized = normalizeTimeText(value);

      const [hourText, minuteText] = normalized.split(":");

      const hour = Number(hourText);
      const minute = Number(minuteText);

      if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return 0;
      }

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
      startTime: string;
      endTime: string;
      travelMinutes?: number;
}) {
      const travelMinutes = input.travelMinutes ?? 60;

      const studyStartMinutes = timeTextToMinutes(input.startTime);
      const studyEndMinutes = timeTextToMinutes(input.endTime);

      const busyStartMinutes = Math.max(0, studyStartMinutes - travelMinutes);
      const busyEndMinutes = Math.min(24 * 60, studyEndMinutes + travelMinutes);

      return {
            busyStartTime: minutesToTimeText(busyStartMinutes),
            busyEndTime: minutesToTimeText(busyEndMinutes),
      };
}

export type ResidentStudyScheduleInput = {
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};
export async function checkResidentStudyScheduleConflict(input: {
      residentId: number;
      assignmentDate: string;
      startTime: string;
      endTime: string;
      travelMinutes?: number;
}) {
      const db = getDb();

      if (!input.assignmentDate || !input.startTime || !input.endTime) {
            return {
                  hasConflict: false,
                  conflicts: [],
            };
      }

      const travelMinutes = input.travelMinutes ?? 60;
      const dayOfWeek = getDayOfWeekFromDateText(input.assignmentDate);

      const schedules = await db
            .select()
            .from(residentStudySchedules)
            .where(
                  and(
                        eq(residentStudySchedules.residentId, input.residentId),
                        eq(residentStudySchedules.dayOfWeek, dayOfWeek),
                        eq(residentStudySchedules.isActive, true)
                  )
            );

      const conflicts = schedules
            .map((schedule) => {
                  const expandedTime = expandStudyTimeWithTravel({
                        startTime: String(schedule.startTime),
                        endTime: String(schedule.endTime),
                        travelMinutes,
                  });

                  return {
                        ...schedule,
                        busyStartTime: expandedTime.busyStartTime,
                        busyEndTime: expandedTime.busyEndTime,
                        travelMinutes,
                  };
            })
            .filter((schedule) =>
                  isTimeOverlap({
                        startA: input.startTime,
                        endA: input.endTime,
                        startB: schedule.busyStartTime,
                        endB: schedule.busyEndTime,
                  })
            );

      return {
            hasConflict: conflicts.length > 0,
            conflicts,
      };
}

export type UpdateResidentStudyScheduleInput = {
      id: number;
      residentId: number;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectName?: string | null;
      location?: string | null;
      notes?: string | null;
};

export async function deleteResident(id: number) {
      const db = getDb();

      return await db.delete(residents).where(eq(residents.id, id));
}

export async function getResidentsStats() {
      const db = getDb();

      const total = await db.select({ count: count() }).from(residents);

      const active = await db
            .select({ count: count() })
            .from(residents)
            .where(eq(residents.status, "active"));

      const inactive = await db
            .select({ count: count() })
            .from(residents)
            .where(eq(residents.status, "inactive"));

      const transferredOut = await db
            .select({ count: count() })
            .from(residents)
            .where(eq(residents.status, "transferred_out"));

      return {
            total: total[0]?.count || 0,
            active: active[0]?.count || 0,
            inactive: inactive[0]?.count || 0,
            transferred_out: transferredOut[0]?.count || 0,
      };
}

export async function createParent(data: InsertParent) {
      const db = getDb();

      await db.insert(parents).values(data);

      const result = await db
            .select()
            .from(parents)
            .where(
                  and(
                        eq(parents.residentId, data.residentId),
                        eq(parents.parentType, data.parentType),
                        eq(parents.fullName, data.fullName)
                  )
            )
            .orderBy(desc(parents.id))
            .limit(1);

      return result.length > 0 ? result[0] : null;
}

export async function getParentById(id: number) {
      const db = getDb();

      const result = await db
            .select()
            .from(parents)
            .where(eq(parents.id, id))
            .limit(1);

      return result.length > 0 ? result[0] : null;
}

export async function getParentsByResident(residentId: number) {
      const db = getDb();

      return await db
            .select()
            .from(parents)
            .where(eq(parents.residentId, residentId))
            .orderBy(asc(parents.parentType), asc(parents.fullName));
}

export async function getParentsByResidentId(residentId: number) {
      return getParentsByResident(residentId);
}

export async function getAllParents(filters?: {
      search?: string;
      parentType?: "father" | "mother" | "guardian";
      residentId?: number;
      limit?: number;
      offset?: number;
}) {
      const db = getDb();
      const conditions: any[] = [];

      if (filters?.residentId) {
            conditions.push(eq(parents.residentId, filters.residentId));
      }

      if (filters?.parentType) {
            conditions.push(eq(parents.parentType, filters.parentType));
      }

      if (filters?.search?.trim()) {
            const keyword = `%${filters.search.trim()}%`;
            conditions.push(
                  or(
                        like(parents.fullName, keyword),
                        like(parents.phoneNumber, keyword),
                        like(parents.email, keyword),
                        like(parents.idNumber, keyword),
                        like(parents.occupation, keyword),
                        like(parents.address, keyword),
                        like(parents.notes, keyword),
                        like(residents.fullName, keyword),
                        like(residents.holyName, keyword),
                        like(residents.residentCode, keyword)
                  )
            );
      }

      let query: any = db
            .select({
                  id: parents.id,
                  residentId: parents.residentId,
                  parentType: parents.parentType,
                  fullName: parents.fullName,
                  phoneNumber: parents.phoneNumber,
                  email: parents.email,
                  idNumber: parents.idNumber,
                  occupation: parents.occupation,
                  address: parents.address,
                  notes: parents.notes,
                  createdAt: parents.createdAt,
                  updatedAt: parents.updatedAt,

                  residentFullName: residents.fullName,
                  residentHolyName: residents.holyName,
                  residentCode: residents.residentCode,
                  residentStatus: residents.status,
            })
            .from(parents)
            .innerJoin(residents, eq(parents.residentId, residents.id))
            .orderBy(
                  asc(residents.fullName),
                  asc(parents.parentType),
                  asc(parents.fullName)
            );

      if (conditions.length > 0) {
            query = query.where(and(...conditions) as any);
      }

      if (filters?.limit) {
            query = query.limit(filters.limit);
      }

      if (filters?.offset) {
            query = query.offset(filters.offset);
      }

      return await query;
}

export async function updateParent(id: number, data: Partial<InsertParent>) {
      const db = getDb();

      await db
            .update(parents)
            .set({
                  ...data,
                  updatedAt: new Date(),
            })
            .where(eq(parents.id, id));

      return getParentById(id);
}

export async function deleteParent(id: number) {
      const db = getDb();

      return await db.delete(parents).where(eq(parents.id, id));
}
/**
 * Reactivate resident after they return to the residence.
 *
 * Luồng đăng ký lại / quay lại lưu xá:
 * - Chuyển trạng thái về active
 * - Xóa departureDate
 * - Không tự gán lại phòng cũ
 * - Giữ lịch sử phòng cũ trong roomAssignments
 * - currentRoomId để null, sau đó quản lý sẽ gán phòng mới
 */
export async function reactivateResident(id: number) {
      const db = getDb();

      await db
            .update(residents)
            .set({
                  status: "active",
                  departureDate: null,
                  currentRoomId: null,
                  updatedAt: new Date(),
            })
            .where(eq(residents.id, id));

      return getResidentById(id);
}
export async function getResidentEducationByResidentId(residentId: number) {
      const db = getDb();

      const rows = await db
            .select()
            .from(residentEducation)
            .where(
                  and(
                        eq(residentEducation.residentId, residentId),
                        eq(residentEducation.isActive, true)
                  )
            )
            .limit(1);

      return rows[0] || null;
}

export async function upsertResidentEducation(data: ResidentEducationInput) {
      const db = getDb();

      const existing = await getResidentEducationByResidentId(data.residentId);

      if (existing) {
            await db
                  .update(residentEducation)
                  .set({
                        schoolName: data.schoolName,
                        educationLevel: data.educationLevel || "university",
                        classOrMajor: data.classOrMajor || null,
                        academicYear: data.academicYear || null,
                        notes: data.notes || null,
                        updatedAt: new Date(),
                  })
                  .where(eq(residentEducation.id, existing.id));

            return getResidentEducationByResidentId(data.residentId);
      }

      await db.insert(residentEducation).values({
            residentId: data.residentId,
            schoolName: data.schoolName,
            educationLevel: data.educationLevel || "university",
            classOrMajor: data.classOrMajor || null,
            academicYear: data.academicYear || null,
            notes: data.notes || null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
      });

      return getResidentEducationByResidentId(data.residentId);
}

function isValidTimeRange(startTime: string, endTime: string) {
      if (!startTime || !endTime) {
            return false;
      }

      return startTime < endTime;
}
export async function getResidentStudySchedulesByResidentId(residentId: number) {
      const db = getDb();

      return db
            .select()
            .from(residentStudySchedules)
            .where(
                  and(
                        eq(residentStudySchedules.residentId, residentId),
                        eq(residentStudySchedules.isActive, true)
                  )
            )
            .orderBy(
                  residentStudySchedules.dayOfWeek,
                  residentStudySchedules.startTime
            );
}

export async function createResidentStudySchedule(
      data: ResidentStudyScheduleInput
) {
      const db = getDb();

      if (!isValidTimeRange(data.startTime, data.endTime)) {
            throw new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      }

      await db.insert(residentStudySchedules).values({
            residentId: data.residentId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            subjectName: data.subjectName || null,
            location: data.location || null,
            notes: data.notes || null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
      } as any);

      return getResidentStudySchedulesByResidentId(data.residentId);
}

export async function updateResidentStudySchedule(
      data: UpdateResidentStudyScheduleInput
) {
      const db = getDb();

      if (!isValidTimeRange(data.startTime, data.endTime)) {
            throw new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      }

      const existing = await db
            .select()
            .from(residentStudySchedules)
            .where(
                  and(
                        eq(residentStudySchedules.id, data.id),
                        eq(residentStudySchedules.residentId, data.residentId),
                        eq(residentStudySchedules.isActive, true)
                  )
            )
            .limit(1);

      if (!existing[0]) {
            throw new Error("Không tìm thấy lịch học.");
      }

      await db
            .update(residentStudySchedules)
            .set({
                  dayOfWeek: data.dayOfWeek,
                  startTime: data.startTime,
                  endTime: data.endTime,
                  subjectName: data.subjectName || null,
                  location: data.location || null,
                  notes: data.notes || null,
                  updatedAt: new Date(),
            } as any)
            .where(eq(residentStudySchedules.id, data.id));

      return getResidentStudySchedulesByResidentId(data.residentId);
}

export async function deactivateResidentStudySchedule(input: {
      id: number;
      residentId: number;
}) {
      const db = getDb();

      const existing = await db
            .select()
            .from(residentStudySchedules)
            .where(
                  and(
                        eq(residentStudySchedules.id, input.id),
                        eq(residentStudySchedules.residentId, input.residentId),
                        eq(residentStudySchedules.isActive, true)
                  )
            )
            .limit(1);

      if (!existing[0]) {
            throw new Error("Không tìm thấy lịch học.");
      }

      await db
            .update(residentStudySchedules)
            .set({
                  isActive: false,
                  updatedAt: new Date(),
            } as any)
            .where(eq(residentStudySchedules.id, input.id));

      return getResidentStudySchedulesByResidentId(input.residentId);
}