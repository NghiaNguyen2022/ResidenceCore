import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { isManager } from "../../_core/rbac";
import { TRPCError } from "@trpc/server";
import { dailyRoutineService } from "../../services/dailyRoutineService";

function requireDailyRoutineManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý lịch sinh hoạt.",
            });
      }
}

const dayTypeSchema = z.enum(["weekday", "sunday", "special"]);
const routineStatusSchema = z.enum(["pending", "completed", "cancelled"]);
const routineTypeSchema = z.enum(["daily", "weekly", "special"]);
const assigneeTypeSchema = z.enum(["all", "resident", "room", "group"]);

const nullableTrimmedString = z
      .string()
      .trim()
      .optional()
      .nullable();

export const dailyRoutineRouter = router({
      /**
       * Existing date-based daily routine APIs.
       * Giữ để không ảnh hưởng phần daily_routines cũ nếu đang dùng.
       */
      list: protectedProcedure
            .input(
                  z
                        .object({
                              fromDate: z.string().optional(),
                              toDate: z.string().optional(),
                              status: z.union([routineStatusSchema, z.literal("all")]).optional(),
                              isActive: z.boolean().optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.list(input ?? {});
            }),

      today: protectedProcedure.query(async () => {
            return dailyRoutineService.today();
      }),

      create: protectedProcedure
            .input(
                  z.object({
                        routineDate: z.string().min(1, "Vui lòng chọn ngày sinh hoạt."),
                        startTime: nullableTrimmedString,
                        endTime: nullableTrimmedString,
                        title: z.string().trim().min(1, "Tên hoạt động không được để trống."),
                        description: nullableTrimmedString,
                        location: nullableTrimmedString,
                        category: nullableTrimmedString,
                        responsibleLabel: nullableTrimmedString,
                        assigneeType: assigneeTypeSchema.optional(),
                        assigneeId: z.number().int().positive().optional().nullable(),
                        status: routineStatusSchema.optional(),
                        isRequired: z.boolean().optional(),
                        displayOrder: z.number().int().optional(),
                        routineType: routineTypeSchema.optional(),
                        isActive: z.boolean().optional(),
                        notes: nullableTrimmedString,
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.create(input);
            }),

      update: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        routineDate: z.string().optional(),
                        startTime: nullableTrimmedString,
                        endTime: nullableTrimmedString,
                        title: z.string().trim().optional(),
                        description: nullableTrimmedString,
                        location: nullableTrimmedString,
                        category: nullableTrimmedString,
                        responsibleLabel: nullableTrimmedString,
                        assigneeType: assigneeTypeSchema.optional(),
                        assigneeId: z.number().int().positive().optional().nullable(),
                        status: routineStatusSchema.optional(),
                        isRequired: z.boolean().optional(),
                        displayOrder: z.number().int().optional(),
                        routineType: routineTypeSchema.optional(),
                        isActive: z.boolean().optional(),
                        notes: nullableTrimmedString,
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.update(input);
            }),

      complete: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.complete(input.id, ctx.user?.id ?? null);
            }),

      cancel: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.cancel(input.id);
            }),

      remove: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.remove(input.id);
            }),

      /**
       * Template-based daily routine APIs.
       * Dùng cho Simple Mode: mẫu lịch ngày thường / Chúa nhật / ngày đặc biệt.
       */
      listTemplates: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().trim().optional(),
                              dayType: z.union([dayTypeSchema, z.literal("all")]).optional(),
                              isActive: z.boolean().optional(),
                              limit: z.number().int().positive().max(500).optional(),
                              offset: z.number().int().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.listTemplates(input ?? {});
            }),

      getTemplate: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.getTemplate(input.id);
            }),

      getTemplateWithItems: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.getTemplateWithItems(input.id);
            }),

      createTemplate: protectedProcedure
            .input(
                  z.object({
                        code: z.string().trim().min(1, "Mã mẫu lịch không được để trống."),
                        name: z.string().trim().min(1, "Tên mẫu lịch không được để trống."),
                        dayType: dayTypeSchema.optional(),
                        description: nullableTrimmedString,
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().int().optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.createTemplate(input);
            }),

      updateTemplate: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        code: z.string().trim().optional(),
                        name: z.string().trim().optional(),
                        dayType: dayTypeSchema.optional(),
                        description: nullableTrimmedString,
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().int().optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.updateTemplate(input);
            }),

      removeTemplate: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.removeTemplate(input.id);
            }),

      listItems: protectedProcedure
            .input(
                  z
                        .object({
                              templateId: z.number().int().positive().optional(),
                              isActive: z.boolean().optional(),
                              limit: z.number().int().positive().max(1000).optional(),
                              offset: z.number().int().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.listItems(input ?? {});
            }),

      getItem: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .query(async ({ input }) => {
                  return dailyRoutineService.getItem(input.id);
            }),

      createItem: protectedProcedure
            .input(
                  z.object({
                        templateId: z.number().int().positive(),
                        startTime: z.string().trim().min(1, "Vui lòng nhập giờ bắt đầu."),
                        endTime: z.string().trim().min(1, "Vui lòng nhập giờ kết thúc."),
                        title: z.string().trim().min(1, "Tên hoạt động không được để trống."),
                        location: nullableTrimmedString,
                        description: nullableTrimmedString,
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().int().optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.createItem(input);
            }),

      updateItem: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        templateId: z.number().int().positive().optional(),
                        startTime: z.string().trim().optional(),
                        endTime: z.string().trim().optional(),
                        title: z.string().trim().optional(),
                        location: nullableTrimmedString,
                        description: nullableTrimmedString,
                        isActive: z.boolean().optional(),
                        sortOrder: z.number().int().optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.updateItem(input);
            }),

      removeItem: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireDailyRoutineManagementAccess(ctx.user);

                  return dailyRoutineService.removeItem(input.id);
            }),
});
