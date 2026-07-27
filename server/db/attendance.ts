import { and, asc, count, eq } from "drizzle-orm";

import { attendance, attendanceSchedule } from "../../drizzle/schema";
import { getDb } from "./connection";

export type AttendanceRecordInput = {
      residentId: number;
      status: "present" | "absent" | "excused" | "late";
      notes?: string | null;
      checkedAt?: Date | null;
};

export async function listAttendanceSchedules() {
      return getDb()
            .select()
            .from(attendanceSchedule)
            .orderBy(asc(attendanceSchedule.scheduledTime), asc(attendanceSchedule.name));
}

export async function createAttendanceSchedule(data: {
      name: string;
      type: "check_in" | "check_out" | "meal" | "study_hour" | "curfew" | "activity";
      scheduledTime: string;
      tolerance?: number;
      isDaily?: boolean;
      daysOfWeek?: string[] | null;
}) {
      const result = await getDb().insert(attendanceSchedule).values({
            name: data.name.trim(),
            type: data.type,
            scheduledTime: data.scheduledTime,
            tolerance: data.tolerance ?? 0,
            isDaily: data.isDaily ?? true,
            daysOfWeek: data.daysOfWeek ?? null,
      });

      return { id: Number(result[0].insertId) };
}

export async function updateAttendanceSchedule(
      id: number,
      data: {
            name?: string;
            type?: "check_in" | "check_out" | "meal" | "study_hour" | "curfew" | "activity";
            scheduledTime?: string;
            tolerance?: number;
            isDaily?: boolean;
            daysOfWeek?: string[] | null;
      }
) {
      await getDb()
            .update(attendanceSchedule)
            .set({
                  ...data,
                  name: data.name?.trim(),
            })
            .where(eq(attendanceSchedule.id, id));

      return { success: true };
}

export async function deleteAttendanceSchedule(id: number) {
      const [usage] = await getDb()
            .select({ total: count() })
            .from(attendance)
            .where(eq(attendance.scheduleId, id));

      if (Number(usage?.total || 0) > 0) {
            throw new Error("Không thể xóa lịch đã có dữ liệu điểm danh.");
      }

      await getDb().delete(attendanceSchedule).where(eq(attendanceSchedule.id, id));
      return { success: true };
}

export async function listAttendanceRecords(input: {
      scheduleId: number;
      attendanceDate: string;
}) {
      const attendanceDay = new Date(`${input.attendanceDate}T00:00:00`);

      return getDb()
            .select()
            .from(attendance)
            .where(
                  and(
                        eq(attendance.scheduleId, input.scheduleId),
                        eq(attendance.attendanceDate, attendanceDay)
                  )
            )
            .orderBy(asc(attendance.residentId));
}

export async function saveAttendanceBatch(input: {
      scheduleId: number;
      attendanceDate: string;
      recordedBy: number;
      records: AttendanceRecordInput[];
}) {
      const db = getDb();
      const attendanceDay = new Date(`${input.attendanceDate}T00:00:00`);

      await db.transaction(async (tx) => {
            for (const record of input.records) {
                  const existing = await tx
                        .select({ id: attendance.id })
                        .from(attendance)
                        .where(
                              and(
                                    eq(attendance.scheduleId, input.scheduleId),
                                    eq(attendance.attendanceDate, attendanceDay),
                                    eq(attendance.residentId, record.residentId)
                              )
                        )
                        .limit(1);

                  const values = {
                        status: record.status,
                        notes: record.notes?.trim() || null,
                        checkInTime: record.checkedAt ?? new Date(),
                        recordedBy: input.recordedBy,
                  };

                  if (existing[0]) {
                        await tx
                              .update(attendance)
                              .set(values)
                              .where(eq(attendance.id, existing[0].id));
                  } else {
                        await tx.insert(attendance).values({
                              residentId: record.residentId,
                              scheduleId: input.scheduleId,
                              attendanceDate: attendanceDay,
                              ...values,
                        });
                  }
            }
      });

      return { success: true, saved: input.records.length };
}
