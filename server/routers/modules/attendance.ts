import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { isManager } from "../../_core/rbac";
import { protectedProcedure, router } from "../../_core/trpc";
import {
      createAttendanceSchedule,
      deleteAttendanceSchedule,
      listAttendanceRecords,
      listAttendanceSchedules,
      saveAttendanceBatch,
      updateAttendanceSchedule,
} from "../../db/attendance";

function requireAttendanceManager(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý điểm danh.",
            });
      }
}

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày điểm danh không hợp lệ.");
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ điểm danh không hợp lệ.");
const schedulePayloadSchema = z.object({
      name: z.string().trim().min(1).max(255),
      type: z.enum(["check_in", "check_out", "meal", "study_hour", "curfew", "activity"]),
      scheduledTime: timeSchema,
      tolerance: z.number().int().min(0).max(180).optional(),
      isDaily: z.boolean().optional().default(true),
      daysOfWeek: z.array(z.string()).max(7).optional().nullable(),
});

export const attendanceRouter = router({
      listSchedules: protectedProcedure.query(async ({ ctx }) => {
            requireAttendanceManager(ctx.user);
            return listAttendanceSchedules();
      }),

      createSchedule: protectedProcedure
            .input(schedulePayloadSchema)
            .mutation(async ({ ctx, input }) => {
                  requireAttendanceManager(ctx.user);
                  return createAttendanceSchedule(input);
            }),

      updateSchedule: protectedProcedure
            .input(schedulePayloadSchema.partial().extend({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireAttendanceManager(ctx.user);
                  const { id, ...data } = input;
                  return updateAttendanceSchedule(id, data);
            }),

      deleteSchedule: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireAttendanceManager(ctx.user);

                  try {
                        return await deleteAttendanceSchedule(input.id);
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể xóa lịch điểm danh.",
                        });
                  }
            }),

      listRecords: protectedProcedure
            .input(
                  z.object({
                        scheduleId: z.number().int().positive(),
                        attendanceDate: dateSchema,
                  })
            )
            .query(async ({ ctx, input }) => {
                  requireAttendanceManager(ctx.user);
                  return listAttendanceRecords(input);
            }),

      saveBatch: protectedProcedure
            .input(
                  z.object({
                        scheduleId: z.number().int().positive(),
                        attendanceDate: dateSchema,
                        records: z
                              .array(
                                    z.object({
                                          residentId: z.number().int().positive(),
                                          status: z.enum(["present", "absent", "excused", "late"]),
                                          notes: z.string().max(500).optional().nullable(),
                                          checkedAt: z.coerce.date().optional().nullable(),
                                    })
                              )
                              .min(1)
                              .max(1000),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireAttendanceManager(ctx.user);

                  if (!ctx.user?.id) {
                        throw new TRPCError({ code: "UNAUTHORIZED", message: "Vui lòng đăng nhập." });
                  }

                  return saveAttendanceBatch({
                        ...input,
                        recordedBy: Number(ctx.user.id),
                  });
            }),
});
