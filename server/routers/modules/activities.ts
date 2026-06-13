import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { TRPCError } from "@trpc/server";
import { activityService } from "../../services/activityService";
import { isManager } from "../../_core/rbac";

function requireManager(user: any) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý hoạt động.",
            });
      }
}

const activityTypeEnum = z.enum([
      "community",
      "spiritual",
      "study",
      "sports",
      "culture",
      "volunteer",
      "meeting",
      "other",
]);

const activityStatusEnum = z.enum([
      "draft",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
]);

const createActivitySchema = z.object({
      code: z.string().trim().min(1, "Mã hoạt động không được để trống"),
      title: z.string().trim().min(1, "Tên hoạt động không được để trống"),
      activityType: activityTypeEnum,
      status: activityStatusEnum,
      activityDate: z.string().trim().min(1, "Vui lòng chọn ngày tổ chức"),
      startTime: z.string().trim().nullable().optional(),
      endTime: z.string().trim().nullable().optional(),
      location: z.string().trim().nullable().optional(),
      ownerGroup: z.string().trim().nullable().optional(),
      expectedParticipants: z.number().int().min(0).optional(),
      description: z.string().trim().nullable().optional(),
      notes: z.string().trim().nullable().optional(),
});

const updateActivitySchema = createActivitySchema
      .omit({ code: true })
      .partial();

export const activitiesRouter = router({
      list: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              status: z.string().optional(),
                              activityType: z.string().optional(),
                              limit: z.number().default(100),
                              offset: z.number().default(0),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  try {
                        return await activityService.list({
                              search: input?.search,
                              status: input?.status,
                              activityType: input?.activityType,
                              limit: input?.limit,
                              offset: input?.offset,
                        });
                  } catch (error) {
                        console.error("[activities.list] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Không thể tải danh sách hoạt động.",
                        });
                  }
            }),

      getById: protectedProcedure
            .input(z.object({ id: z.number() }))
            .query(async ({ input }) => {
                  try {
                        return await activityService.getById(input.id);
                  } catch (error) {
                        if (error instanceof Error && error.message === "Không tìm thấy hoạt động.") {
                              throw new TRPCError({ code: "NOT_FOUND", message: error.message });
                        }
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Không thể tải thông tin hoạt động.",
                        });
                  }
            }),

      create: protectedProcedure
            .input(createActivitySchema)
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        return await activityService.create(input, ctx.user?.id);
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Không thể tạo hoạt động.",
                        });
                  }
            }),

      update: protectedProcedure
            .input(z.object({ id: z.number() }).merge(updateActivitySchema))
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        const { id, ...data } = input;
                        return await activityService.update(id, data);
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Không thể cập nhật hoạt động.",
                        });
                  }
            }),

      delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        return await activityService.delete(input.id);
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Không thể xóa hoạt động.",
                        });
                  }
            }),

      getParticipants: protectedProcedure
            .input(z.object({ activityId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        return await activityService.getParticipants(input.activityId);
                  } catch (error) {
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Không thể tải danh sách tham gia.",
                        });
                  }
            }),

      addParticipant: protectedProcedure
            .input(
                  z.object({
                        activityId: z.number(),
                        residentId: z.number(),
                        role: z.enum(["participant", "organizer", "volunteer"]).optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        return await activityService.addParticipant(
                              input.activityId,
                              input.residentId,
                              input.role
                        );
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Không thể thêm học viên.",
                        });
                  }
            }),

      removeParticipant: protectedProcedure
            .input(z.object({ activityId: z.number(), residentId: z.number() }))
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        return await activityService.removeParticipant(
                              input.activityId,
                              input.residentId
                        );
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Không thể xóa học viên.",
                        });
                  }
            }),

      markAttendance: protectedProcedure
            .input(
                  z.object({
                        activityId: z.number(),
                        residentId: z.number(),
                        attended: z.boolean(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireManager(ctx.user);
                  try {
                        return await activityService.markAttendance(
                              input.activityId,
                              input.residentId,
                              input.attended
                        );
                  } catch (error) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Không thể cập nhật điểm danh.",
                        });
                  }
            }),

      getStats: protectedProcedure.query(async () => {
            try {
                  return await activityService.getStats();
            } catch (error) {
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Không thể tải thống kê.",
                  });
            }
      }),
});
