import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { dailyRoutineService } from "../../services/dailyRoutineService";

const dailyRoutineStatusSchema = z.enum(["pending", "completed", "cancelled"]);
const dailyRoutineTypeSchema = z.enum(["daily", "weekly", "special"]);
const assigneeTypeSchema = z.enum(["all", "resident", "room", "group"]);

export const dailyRoutineRouter = router({
      list: protectedProcedure
            .input(
                  z
                        .object({
                              fromDate: z.string().optional(),
                              toDate: z.string().optional(),
                              status: z
                                    .union([dailyRoutineStatusSchema, z.literal("all")])
                                    .optional(),
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
                        startTime: z.string().nullable().optional(),
                        endTime: z.string().nullable().optional(),

                        title: z.string().min(1, "Vui lòng nhập tên hoạt động."),
                        description: z.string().nullable().optional(),

                        location: z.string().nullable().optional(),

                        category: z.string().nullable().optional(),
                        responsibleLabel: z.string().nullable().optional(),

                        assigneeType: assigneeTypeSchema.optional(),
                        assigneeId: z.number().nullable().optional(),

                        status: dailyRoutineStatusSchema.optional(),

                        isRequired: z.boolean().optional(),
                        displayOrder: z.number().optional(),

                        routineType: dailyRoutineTypeSchema.optional(),
                        isActive: z.boolean().optional(),

                        notes: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return dailyRoutineService.create(input);
            }),

      update: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),

                        routineDate: z.string().optional(),
                        startTime: z.string().nullable().optional(),
                        endTime: z.string().nullable().optional(),

                        title: z.string().optional(),
                        description: z.string().nullable().optional(),

                        location: z.string().nullable().optional(),

                        category: z.string().nullable().optional(),
                        responsibleLabel: z.string().nullable().optional(),

                        assigneeType: assigneeTypeSchema.optional(),
                        assigneeId: z.number().nullable().optional(),

                        status: dailyRoutineStatusSchema.optional(),

                        isRequired: z.boolean().optional(),
                        displayOrder: z.number().optional(),

                        routineType: dailyRoutineTypeSchema.optional(),
                        isActive: z.boolean().optional(),

                        notes: z.string().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return dailyRoutineService.update(input);
            }),

      complete: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        completedBy: z.number().nullable().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  return dailyRoutineService.complete(input.id, input.completedBy);
            }),

      cancel: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                  })
            )
            .mutation(async ({ input }) => {
                  return dailyRoutineService.cancel(input.id);
            }),

      delete: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                  })
            )
            .mutation(async ({ input }) => {
                  return dailyRoutineService.remove(input.id);
            }),
});