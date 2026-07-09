import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { isManager } from "../../_core/rbac";
import { activityService } from "../../services/activityService";

function requireActivityManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý hoạt động.",
            });
      }
}

function getUserIdFromContext(ctx: any) {
      const userId = ctx?.user?.id ?? ctx?.session?.user?.id ?? ctx?.auth?.user?.id ?? ctx?.userId;
      if (!userId) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Vui lòng đăng nhập để tiếp tục." });
      }
      return Number(userId);
}

const activityTypeSchema = z.enum([
      "community",
      "spiritual",
      "study",
      "sports",
      "culture",
      "volunteer",
      "meeting",
      "other",
]);

const activityStatusSchema = z.enum(["draft", "scheduled", "in_progress", "completed", "cancelled"]);

const listInputSchema = z
      .object({
            search: z.string().trim().optional().nullable(),
            status: z.union([activityStatusSchema, z.literal("all")]).optional().nullable(),
            activityType: z.union([activityTypeSchema, z.literal("all")]).optional().nullable(),
            fromDate: z.string().trim().optional().nullable(),
            toDate: z.string().trim().optional().nullable(),
            limit: z.number().int().min(1).max(300).optional().default(100),
            offset: z.number().int().min(0).optional().default(0),
      })
      .optional();

const createActivityInputSchema = z.object({
      code: z.string().trim().min(1, "Vui lòng nhập mã hoạt động."),
      title: z.string().trim().min(1, "Vui lòng nhập tên hoạt động."),
      activityType: activityTypeSchema.default("community"),
      status: activityStatusSchema.default("scheduled"),
      activityDate: z.string().trim().min(1, "Vui lòng chọn ngày tổ chức."),
      startTime: z.string().trim().optional().nullable(),
      endTime: z.string().trim().optional().nullable(),
      location: z.string().trim().optional().nullable(),
      ownerGroup: z.string().trim().optional().nullable(),
      expectedParticipants: z.number().int().min(0).optional().nullable(),
      description: z.string().trim().optional().nullable(),
      notes: z.string().trim().optional().nullable(),
      isPublicOnPortal: z.boolean().optional().default(false),
});

const updateActivityInputSchema = createActivityInputSchema
      .omit({ code: true })
      .partial()
      .extend({ id: z.number().int().positive() });

export const activitiesRouter = router({
      list: protectedProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
            requireActivityManagementAccess(ctx.user);
            return activityService.list(input || {});
      }),

      listPublic: protectedProcedure.input(listInputSchema).query(async ({ input }) => {
            return activityService.listPublic(input || {});
      }),

      getStats: protectedProcedure.query(async ({ ctx }) => {
            requireActivityManagementAccess(ctx.user);
            return activityService.getStats();
      }),

      getById: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .query(async ({ ctx, input }) => {
                  requireActivityManagementAccess(ctx.user);
                  return activityService.getById(input.id);
            }),

      create: protectedProcedure.input(createActivityInputSchema).mutation(async ({ ctx, input }) => {
            requireActivityManagementAccess(ctx.user);
            const userId = getUserIdFromContext(ctx);
            return activityService.create(input, userId);
      }),

      update: protectedProcedure.input(updateActivityInputSchema).mutation(async ({ ctx, input }) => {
            requireActivityManagementAccess(ctx.user);
            const { id, ...data } = input;
            return activityService.update(id, data);
      }),

      cancel: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireActivityManagementAccess(ctx.user);
                  return activityService.cancel(input.id);
            }),

      delete: protectedProcedure
            .input(z.object({ id: z.number().int().positive() }))
            .mutation(async ({ ctx, input }) => {
                  requireActivityManagementAccess(ctx.user);
                  return activityService.delete(input.id);
            }),
});
