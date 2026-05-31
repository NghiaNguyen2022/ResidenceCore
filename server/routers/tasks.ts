import { z } from "zod";
import { router } from "../_core/trpc";
import { supervisorProcedure, managerProcedure } from "../_core/rbac";
import * as db from "../db";

const taskTypeSchema = z.object({
  name: z.string().min(1, "Tên công việc không được trống"),
  description: z.string().optional(),
  estimatedHours: z.number().optional(),
});

const taskAssignmentSchema = z.object({
  taskTypeId: z.number(),
  residentId: z.number(),
  assignmentDate: z.date(),
  dueDate: z.date(),
  notes: z.string().optional(),
});

export const tasksRouter = router({
  listTaskTypes: supervisorProcedure.query(async () => {
    return await db.getTaskTypes();
  }),

  createTaskType: managerProcedure
    .input(taskTypeSchema)
    .mutation(async ({ input }) => {
      await db.createTaskType({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Thêm loại công việc thành công",
      };
    }),

  listAssignments: supervisorProcedure
    .input(
      z.object({
        residentId: z.number().optional(),
        status: z.enum(["pending", "in_progress", "completed", "overdue", "cancelled"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return await db.getTaskAssignments({
        residentId: input.residentId,
        status: input.status,
        limit: input.limit,
      });
    }),

  assignTask: managerProcedure
    .input(taskAssignmentSchema)
    .mutation(async ({ input, ctx }) => {
      await db.createTaskAssignment({
        ...input,
        status: "pending",
        assignedBy: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      return {
        success: true,
        message: "Phân công công việc thành công",
      };
    }),

  updateTaskStatus: supervisorProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "overdue", "cancelled"]),
        completionDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "completed" && input.completionDate) {
        updateData.completionDate = input.completionDate;
      }

      if (input.status === "completed") {
        updateData.verifiedBy = ctx.user.id;
      }

      await db.updateTaskAssignment(input.taskId, updateData);

      return {
        success: true,
        message: "Cập nhật trạng thái công việc thành công",
      };
    }),

  getPendingTasks: supervisorProcedure.query(async () => {
    return await db.getPendingTasksCount();
  }),

  getResidentTasks: supervisorProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getTaskAssignments({ residentId: input });
    }),

  getTaskStats: supervisorProcedure.query(async () => {
    const allTasks = await db.getTaskAssignments({ limit: 1000 });

    return {
      total: allTasks.length,
      pending: allTasks.filter((t) => t.status === "pending").length,
      inProgress: allTasks.filter((t) => t.status === "in_progress").length,
      completed: allTasks.filter((t) => t.status === "completed").length,
      overdue: allTasks.filter((t) => t.status === "overdue").length,
      cancelled: allTasks.filter((t) => t.status === "cancelled").length,
      completionRate: 0,
    };
  }),
});
