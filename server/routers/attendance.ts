import { z } from "zod";
import { router } from "../_core/trpc";
import { supervisorProcedure, managerProcedure } from "../_core/rbac";
import * as db from "../db";

const attendanceScheduleSchema = z.object({
  name: z.string().min(1, "Tên hoạt động không được trống"),
  type: z.enum(["check_in", "check_out", "meal", "study_hour", "curfew", "activity"]),
  scheduledTime: z.string(),
  tolerance: z.number().default(0),
  isDaily: z.boolean().default(true),
  daysOfWeek: z.array(z.number()).optional(),
});

const attendanceRecordSchema = z.object({
  residentId: z.number(),
  scheduleId: z.number(),
  attendanceDate: z.date(),
  status: z.enum(["present", "absent", "excused", "late"]),
  checkInTime: z.date().optional(),
  checkOutTime: z.date().optional(),
  notes: z.string().optional(),
});

export const attendanceRouter = router({
  listSchedules: supervisorProcedure.query(async () => {
    return await db.getAttendanceSchedules();
  }),

  createSchedule: managerProcedure
    .input(attendanceScheduleSchema)
    .mutation(async ({ input }) => {
      await db.createAttendanceSchedule({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm lịch biểu thành công",
      };
    }),

  recordAttendance: supervisorProcedure
    .input(attendanceRecordSchema)
    .mutation(async ({ input, ctx }) => {
      await db.recordAttendance({
        ...input,
        recordedBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Ghi nhận điểm danh thành công",
      };
    }),

  getAttendanceByDate: supervisorProcedure
    .input(z.date())
    .query(async ({ input }) => {
      return await db.getAttendanceByDate(input);
    }),

  getResidentAttendance: supervisorProcedure
    .input(
      z.object({
        residentId: z.number(),
        limit: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      return await db.getResidentAttendance(input.residentId, input.limit);
    }),

  getTodayAttendance: supervisorProcedure.query(async () => {
    const today = new Date();
    return await db.getAttendanceByDate(today);
  }),

  getAttendanceStats: supervisorProcedure
    .input(
      z.object({
        residentId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const records = await db.getResidentAttendance(input.residentId, 1000);

      const filtered = records.filter((r) => {
        const date = new Date(r.attendanceDate);
        return date >= input.startDate && date <= input.endDate;
      });

      const stats = {
        total: filtered.length,
        present: filtered.filter((r) => r.status === "present").length,
        absent: filtered.filter((r) => r.status === "absent").length,
        excused: filtered.filter((r) => r.status === "excused").length,
        late: filtered.filter((r) => r.status === "late").length,
        presentRate: 0,
      };

      if (stats.total > 0) {
        stats.presentRate = Math.round((stats.present / stats.total) * 100);
      }

      return stats;
    }),
});
