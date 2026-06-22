import { protectedProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "../../db";
import { dutyAssignments } from "../../../drizzle/schema";


const assignmentScopeInput = z.object({
      dutyConfigId: z.number(),
      assignedDates: z.array(z.string()).min(1),
      assignedToType: z.enum(["resident", "team", "room", "committee"]),
      assignedToId: z.number(),
      startTime: z.string().optional().nullable(),
      endTime: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
});

/**
 * ============================================
 * DUTIES ROUTER - QUẢN LÝ CÔNG TÁC
 * ============================================
 */

export const dutiesRouter = router({
      /**
       * ========== TEMPLATES ENDPOINTS ==========
       */

      /**
       * Lấy danh sách công tác mẫu
       */
      listTemplates: protectedProcedure.query(async () => {
            try {
                  const templates = await db.getDutyTemplates();
                  return templates;
            } catch (error) {
                  console.error("[duties.listTemplates] Error:", error);
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch templates",
                  });
            }
      }),

      /**
       * Lấy công tác mẫu theo code
       */
      getTemplate: protectedProcedure
            .input(z.object({ templateCode: z.string() }))
            .query(async ({ input }) => {
                  try {
                        const template = await db.getDutyTemplateByCode(input.templateCode);
                        if (!template) {
                              throw new TRPCError({
                                    code: "NOT_FOUND",
                                    message: "Template not found",
                              });
                        }
                        return template;
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.getTemplate] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch template",
                        });
                  }
            }),

      /**
       * ========== DUTY CONFIG ENDPOINTS ==========
       */

      /**
       * Lấy danh sách công tác
       */
      listConfigs: protectedProcedure
            .input(
                  z.object({
                        dutyType: z.enum(["daily", "weekly", "monthly", "event"]).optional(),
                        search: z.string().optional(),
                        isActive: z.boolean().optional(),
                        limit: z.number().default(50),
                        offset: z.number().default(0),
                  }).optional()
            )
            .query(async ({ input }) => {
                  try {
                        const configs = await db.getDutyConfigs({
                              dutyType: input?.dutyType,
                              search: input?.search,
                              isActive: input?.isActive !== false,
                              limit: input?.limit || 50,
                              offset: input?.offset || 0,
                        });
                        return configs;
                  } catch (error) {
                        console.error("[duties.listConfigs] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch duty configs",
                        });
                  }
            }),

      /**
       * Lấy chi tiết công tác
       */
      getConfig: protectedProcedure
            .input(z.object({ id: z.number() }))
            .query(async ({ input }) => {
                  try {
                        const config = await db.getDutyConfig(input.id);
                        if (!config) {
                              throw new TRPCError({
                                    code: "NOT_FOUND",
                                    message: "Duty config not found",
                              });
                        }
                        return config;
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.getConfig] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch duty config",
                        });
                  }
            }),

      /**
       * Tạo công tác mới
       */
      createConfig: protectedProcedure
            .input(
                  z.object({
                        dutyCode: z.string().min(1, "Mã công tác không được để trống"),
                        dutyName: z.string().min(1, "Tên công tác không được để trống"),
                        description: z.string().optional(),
                        dutyType: z.enum(["daily", "weekly", "monthly", "event"]),
                        startTime: z.string().optional(),
                        endTime: z.string().optional(),
                        minPersons: z.number().min(1, "Số người tối thiểu phải lớn hơn 0"),
                        maxPersons: z.number().min(1, "Số người tối đa phải lớn hơn 0"),
                        frequency: z.enum(["daily", "weekly", "monthly", "event"]).optional(),
                        dayOfWeek: z.number().optional(),
                        frequencyPerWeek: z.number().optional().nullable(),
                        frequencyPerMonth: z.number().optional().nullable(),
                        weeklyDaysJson: z.any().optional().nullable(),
                        monthWeeksJson: z.any().optional().nullable(),
                        monthWeekDaysJson: z.any().optional().nullable(),
                        monthDaysJson: z.any().optional().nullable(),
                        eventName: z.string().optional().nullable(),
                        eventStartDate: z.date().optional().nullable(),
                        eventEndDate: z.date().optional().nullable(),
                        requiresStudyScheduleCheck: z.boolean().default(true),
                        isActive: z.boolean().default(true),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        // Check if duty code already exists
                        const existing = await db.getDutyConfigByCode(input.dutyCode);
                        if (existing) {
                              throw new TRPCError({
                                    code: "CONFLICT",
                                    message: "Mã công tác đã tồn tại",
                              });
                        }

                        const result = await db.createDutyConfig(input);
                        const config = await db.getDutyConfig(result.insertId);
                        return config;
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.createConfig] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to create duty config",
                        });
                  }
            }),

      /**
       * Cập nhật công tác
       */
      updateConfig: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        dutyName: z.string().optional(),
                        description: z.string().optional(),
                        startTime: z.string().optional(),
                        endTime: z.string().optional(),
                        minPersons: z.number().optional(),
                        maxPersons: z.number().optional(),
                        frequency: z.enum(["daily", "weekly", "monthly", "event"]).optional(),
                        dayOfWeek: z.number().optional(),
                        frequencyPerWeek: z.number().optional().nullable(),
                        frequencyPerMonth: z.number().optional().nullable(),
                        weeklyDaysJson: z.any().optional().nullable(),
                        monthWeeksJson: z.any().optional().nullable(),
                        monthWeekDaysJson: z.any().optional().nullable(),
                        monthDaysJson: z.any().optional().nullable(),
                        eventName: z.string().optional().nullable(),
                        eventStartDate: z.date().optional().nullable(),
                        eventEndDate: z.date().optional().nullable(),
                        requiresStudyScheduleCheck: z.boolean().optional(),
                        isActive: z.boolean().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const { id, ...updateData } = input;

                        await db.updateDutyConfig(id, updateData);

                        const config = await db.getDutyConfig(id);
                        if (!config) {
                              throw new TRPCError({
                                    code: "NOT_FOUND",
                                    message: "Duty config not found",
                              });
                        }

                        return config;
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.updateConfig] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to update duty config",
                        });
                  }
            }),

      /**
       * Xóa công tác
       */
      deleteConfig: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        await db.deleteDutyConfig(input.id);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.deleteConfig] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to delete duty config",
                        });
                  }
            }),

      /**
       * ========== CHECKLIST ENDPOINTS ==========
       */

      /**
       * Lấy danh sách công việc của công tác
       */
      getChecklist: protectedProcedure
            .input(z.object({ dutyConfigId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        const checklist = await db.getChecklistByDutyId(input.dutyConfigId);
                        return checklist;
                  } catch (error) {
                        console.error("[duties.getChecklist] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch checklist",
                        });
                  }
            }),

      /**
       * Thêm công việc vào checklist
       */
      addChecklistItem: protectedProcedure
            .input(
                  z.object({
                        dutyConfigId: z.number(),
                        checklistItem: z.string().min(1, "Nội dung công việc không được để trống"),
                        description: z.string().optional(),
                        isRequired: z.boolean().default(true),
                        itemOrder: z.number().int().positive().optional(),
                        stageType: z.enum(["normal", "preparation", "during", "after"]).optional(),
                        minPersons: z.number().min(1).optional(),
                        maxPersons: z.number().min(1).optional(),
                        estimatedTimeMinutes: z.number().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const result = await db.addChecklistItem(input);
                        return result;
                  } catch (error) {
                        console.error("[duties.addChecklistItem] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to add checklist item",
                        });
                  }
            }),

      /**
       * Cập nhật công việc trong checklist
       */
      updateChecklistItem: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        checklistItem: z.string().optional(),
                        description: z.string().optional(),
                        isRequired: z.boolean().optional(),
                        stageType: z.enum(["normal", "preparation", "during", "after"]).optional(),
                        minPersons: z.number().min(1).optional(),
                        maxPersons: z.number().min(1).optional(),
                        estimatedTimeMinutes: z.number().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const { id, ...updateData } = input;
                        await db.updateChecklistItem(id, updateData);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.updateChecklistItem] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to update checklist item",
                        });
                  }
            }),

      /**
       * Xóa công việc khỏi checklist
       */
      deleteChecklistItem: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        await db.deleteChecklistItem(input.id);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.deleteChecklistItem] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to delete checklist item",
                        });
                  }
            }),

      /**
       * ========== STATISTICS ENDPOINTS ==========
       */

      /**
       * Lấy thống kê công tác
       */
      getDutyStats: protectedProcedure.query(async () => {
            try {
                  const stats = await db.getDutyStats();
                  return stats;
            } catch (error) {
                  console.error("[duties.getDutyStats] Error:", error);
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch duty stats",
                  });
            }
      }),

      /**
       * Lấy thống kê công tác của học viên
       */
      getResidentDutyStats: protectedProcedure
            .input(z.object({ residentId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        const stats = await db.getResidentDutyStats(input.residentId);
                        return stats;
                  } catch (error) {
                        console.error("[duties.getResidentDutyStats] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch resident duty stats",
                        });
                  }
            }),

      /**
       * ========== ASSIGNMENT ENDPOINTS ==========
       */

      /**
       * Lấy công tác được gán cho học viên
       */
      getAssignmentsByResident: protectedProcedure
            .input(
                  z.object({
                        residentId: z.number(),
                        status: z.enum(["pending", "confirmed", "in_progress", "completed", "skipped", "cancelled"]).optional(),
                        limit: z.number().default(50),
                        offset: z.number().default(0),
                  })
            )
            .query(async ({ input }) => {
                  try {
                        const assignments = await db.getAssignmentsByResident({
                              residentId: input.residentId,
                              status: input.status,
                              limit: input.limit,
                              offset: input.offset,
                        });
                        return assignments;
                  } catch (error) {
                        console.error("[duties.getAssignmentsByResident] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch resident assignments",
                        });
                  }
            }),

      /**
       * Lấy công tác của chính người dùng resident
       */
      getMyAssignments: protectedProcedure.query(async ({ ctx }) => {
            try {
                  if (ctx.user?.role !== "resident") {
                        throw new TRPCError({
                              code: "FORBIDDEN",
                              message: "Chỉ resident mới được xem công tác của mình",
                        });
                  }

                  const resident = await db.getResidentByUserId(ctx.user.id);
                  if (!resident) {
                        throw new TRPCError({
                              code: "NOT_FOUND",
                              message: "Hồ sơ resident không tìm thấy",
                        });
                  }

                  const assignments = await db.getAssignmentsByResident(resident.id);
                  return assignments;
            } catch (error) {
                  if (error instanceof TRPCError) throw error;
                  console.error("[duties.getMyAssignments] Error:", error);
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch assignments for current resident",
                  });
            }
      }),

      /**
       * Cập nhật công tác của resident hiện tại
       */
      updateMyAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        status: z.enum(["pending", "confirmed", "in_progress", "completed", "skipped", "cancelled"]).optional(),
                        completedAt: z.date().optional(),
                        notes: z.string().optional(),
                  })
            )
            .mutation(async ({ input, ctx }) => {
                  try {
                        if (ctx.user?.role !== "resident") {
                              throw new TRPCError({
                                    code: "FORBIDDEN",
                                    message: "Chỉ resident mới được cập nhật công tác của mình",
                              });
                        }

                        const resident = await db.getResidentByUserId(ctx.user.id);
                        if (!resident) {
                              throw new TRPCError({
                                    code: "NOT_FOUND",
                                    message: "Hồ sơ resident không tìm thấy",
                              });
                        }

                        const assignment = await db.getAssignmentById(input.id);
                        if (!assignment || assignment.residentId !== resident.id) {
                              throw new TRPCError({
                                    code: "FORBIDDEN",
                                    message: "Bạn không có quyền cập nhật công tác này",
                              });
                        }

                        await db.updateAssignmentForResident(resident.id, input.id, {
                              status: input.status,
                              completedAt: input.completedAt,
                              notes: input.notes,
                        });

                        return { success: true };
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.updateMyAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to update assignment",
                        });
                  }
            }),

      /**
       * Lấy công tác trong ngày
       */
      getAssignmentsByDate: protectedProcedure
            .input(z.object({ date: z.date() }))
            .query(async ({ input }) => {
                  try {
                        const assignments = await db.getAssignmentsByDate(input.date);
                        return assignments;
                  } catch (error) {
                        console.error("[duties.getAssignmentsByDate] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch assignments by date",
                        });
                  }
            }),

      /**
       * Lấy công tác hôm nay
       */
      getTodayAssignments: protectedProcedure.query(async () => {
            try {
                  const assignments = await db.getTodayAssignments();
                  return assignments;
            } catch (error) {
                  console.error("[duties.getTodayAssignments] Error:", error);
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch today assignments",
                  });
            }
      }),

      /**
       * Lấy công tác theo khoảng ngày
       */
      getAssignmentsByDateRange: protectedProcedure
            .input(
                  z.object({
                        startDate: z.date(),
                        endDate: z.date(),
                        status: z
                              .enum([
                                    "pending",
                                    "confirmed",
                                    "in_progress",
                                    "completed",
                                    "skipped",
                                    "cancelled",
                              ])
                              .optional(),
                        assignedToType: z
                              .enum(["resident", "team", "room", "committee"])
                              .optional(),
                        assignedToId: z.number().optional(),
                  })
            )
            .query(async ({ input }) => {
                  try {
                        const assignments = await db.getAssignmentsByDateRange(
                              input.startDate,
                              input.endDate,
                              {
                                    status: input.status,
                                    assignedToType: input.assignedToType,
                                    assignedToId: input.assignedToId,
                              }
                        );
                        return assignments;
                  } catch (error) {
                        console.error("[duties.getAssignmentsByDateRange] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch assignments by date range",
                        });
                  }
            }),

      /**
       * Lấy công tác theo đối tượng phụ trách
       */
      getAssignmentsByAssignee: protectedProcedure
            .input(
                  z.object({
                        assignedToType: z.enum(["resident", "team", "room", "committee"]),
                        assignedToId: z.number(),
                        status: z
                              .enum([
                                    "pending",
                                    "confirmed",
                                    "in_progress",
                                    "completed",
                                    "skipped",
                                    "cancelled",
                              ])
                              .optional(),
                        startDate: z.date().optional(),
                        endDate: z.date().optional(),
                  })
            )
            .query(async ({ input }) => {
                  try {
                        const assignments = await db.getAssignmentsByAssignee(
                              input.assignedToType,
                              input.assignedToId,
                              {
                                    status: input.status,
                                    startDate: input.startDate,
                                    endDate: input.endDate,
                              }
                        );
                        return assignments;
                  } catch (error) {
                        console.error("[duties.getAssignmentsByAssignee] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch assignments by assignee",
                        });
                  }
            }),

      /**
       * Đánh dấu hoàn thành công tác
       */
      completeAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        notes: z.string().optional().nullable(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        await db.markAssignmentCompleted(input.id, input.notes);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.completeAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Failed to complete assignment",
                        });
                  }
            }),

      /**
       * Đánh dấu vắng / không làm công tác
       */
      skipAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        reason: z.string().optional().nullable(),
                        notes: z.string().optional().nullable(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        await db.markAssignmentSkipped(input.id, input.reason, input.notes);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.skipAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Failed to skip assignment",
                        });
                  }
            }),


      /**
       * Xem trước phân công theo ngày / nguyên tuần
       */
      previewAssignment: protectedProcedure
            .input(assignmentScopeInput)
            .query(async ({ input }) => {
                  try {
                        return await db.previewDutyAssignment(input);
                  } catch (error) {
                        console.error("[duties.previewAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Failed to preview assignment",
                        });
                  }
            }),

      /**
       * Lưu phân công hàng loạt, tự bỏ qua ngày không hợp lệ
       */
      assignDutyBatch: protectedProcedure
            .input(assignmentScopeInput)
            .mutation(async ({ input }) => {
                  try {
                        return await db.assignDutyBatch(input);
                  } catch (error) {
                        console.error("[duties.assignDutyBatch] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Failed to assign duties",
                        });
                  }
            }),

      /**
       * Gán công tác cho học viên / tổ / phòng / ban
       */
      assignDuty: protectedProcedure
            .input(
                  z.object({
                        dutyConfigId: z.number(),
                        dutyTaskId: z.number().optional().nullable(),
                        residentId: z.number().optional().nullable(),
                        assignedToType: z
                              .enum(["resident", "team", "room", "committee"])
                              .optional()
                              .nullable(),
                        assignedToId: z.number().optional().nullable(),
                        assignedDate: z.date(),
                        startDateTime: z.date().optional(),
                        endDateTime: z.date().optional(),
                        notes: z.string().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const result = await db.assignDuty(input as any);
                        return result;
                  } catch (error) {
                        console.error("[duties.assignDuty] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to assign duty",
                        });
                  }
            }),

      /**
       * Cập nhật trạng thái công tác
       */
      updateAssignment: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        status: z.enum(["pending", "confirmed", "in_progress", "completed", "skipped", "cancelled"]).optional(),
                        completedAt: z.date().optional(),
                        notes: z.string().optional(),
                  })
            )
            .mutation(async ({ input, ctx }) => {
                  try {
                        const staffRoles = ["admin", "manager", "supervisor", "accountant"];

                        if (ctx.user?.role === "resident") {
                              const resident = await db.getResidentByUserId(ctx.user.id);
                              if (!resident) {
                                    throw new TRPCError({
                                          code: "NOT_FOUND",
                                          message: "Hồ sơ resident không tìm thấy",
                                    });
                              }

                              const assignment = await db.getAssignmentById(input.id);
                              if (!assignment || assignment.residentId !== resident.id) {
                                    throw new TRPCError({
                                          code: "FORBIDDEN",
                                          message: "Bạn không có quyền cập nhật công tác này",
                                    });
                              }

                              await db.updateAssignmentForResident(resident.id, input.id, {
                                    status: input.status,
                                    completedAt: input.completedAt,
                                    notes: input.notes,
                              });
                              return { success: true };
                        }

                        if (!ctx.user || !staffRoles.includes(ctx.user.role)) {
                              throw new TRPCError({
                                    code: "FORBIDDEN",
                                    message: "Bạn không có quyền cập nhật công tác này",
                              });
                        }

                        const { id, ...updateData } = input;
                        await db.updateAssignment(id, updateData);
                        return { success: true };
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.updateAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to update assignment",
                        });
                  }
            }),

      /**
       * Hủy công tác
       */
      cancelAssignment: protectedProcedure
            .input(z.object({ id: z.number(), reason: z.string().optional() }))
            .mutation(async ({ input }) => {
                  try {
                        await db.cancelAssignment(input.id, input.reason);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.cancelAssignment] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to cancel assignment",
                        });
                  }
            }),

      /**
       * ========== EVALUATION ENDPOINTS ==========
       */

      /**
       * Đánh giá công tác
       */
      evaluateDuty: protectedProcedure
            .input(
                  z.object({
                        assignmentId: z.number(),
                        quality: z.number().min(1).max(3),
                        punctuality: z.number().min(1).max(2),
                        professionalism: z.number().min(1).max(2),
                        responsibility: z.number().min(1).max(2),
                        teamwork: z.number().min(1).max(1),
                        notes: z.string().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const result = await db.evaluateDuty(input);
                        return result;
                  } catch (error) {
                        console.error("[duties.evaluateDuty] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to evaluate duty",
                        });
                  }
            }),

      /**
       * Lấy đánh giá công tác
       */
      getEvaluation: protectedProcedure
            .input(z.object({ assignmentId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        const evaluation = await db.getEvaluationByAssignment(input.assignmentId);
                        return evaluation;
                  } catch (error) {
                        console.error("[duties.getEvaluation] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch evaluation",
                        });
                  }
            }),

      /**
       * Lấy danh sách đánh giá của học viên
       */
      getResidentEvaluations: protectedProcedure
            .input(z.object({ residentId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        const evaluations = await db.getEvaluationsByResident(input.residentId);
                        return evaluations;
                  } catch (error) {
                        console.error("[duties.getResidentEvaluations] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch resident evaluations",
                        });
                  }
            }),
      getTemplatesByType: protectedProcedure
            .input(z.object({ dutyType: z.enum(["daily", "weekly", "monthly", "event"]) }))
            .query(async ({ input }) => {
                  try {
                        const templates = await db.getDutyTemplatesByType(input.dutyType);
                        return templates;
                  } catch (error) {
                        console.error("[duties.getTemplatesByType] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch duty templates by type",
                        });
                  }
            }),
      createAssignments: protectedProcedure
            .input(
                  z.object({
                        assignments: z.array(
                              z.object({
                                    dutyConfigId: z.number(),
                                    residentId: z.number(),
                                    assignedWeek: z.number(),
                                    status: z.enum(["pending", "completed", "cancelled"]),
                              })
                        ),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const assignmentsToInsert = input.assignments.map((assignment) => ({
                              dutyConfigId: assignment.dutyConfigId,
                              residentId: assignment.residentId,
                              assignedDate: new Date(),
                              status: assignment.status,
                        }));

                        await db.db.insert(dutyAssignments).values(assignmentsToInsert);
                        return { success: true };
                  } catch (error) {
                        console.error("[duties.createAssignments] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to create assignments",
                        });
                  }
            }),

      /**
       * Gợi ý phân công thông minh dựa trên lịch học
       */
      getSmartSuggestions: protectedProcedure
            .input(
                  z.object({
                        dutyConfigId: z.number(),
                        targetDate: z.string(), // YYYY-MM-DD
                        travelMinutes: z.number().optional().default(60),
                  })
            )
            .query(async ({ input }) => {
                  try {
                        const config = await db.getDutyConfig(input.dutyConfigId);
                        if (!config) {
                              throw new TRPCError({ code: "NOT_FOUND", message: "Không tìm thấy cấu hình công tác" });
                        }

                        const allResidents = await db.getResidents({ status: "active" });

                        const results = await Promise.all(
                              allResidents.map(async (resident) => {
                                    if (!config.startTime || !config.endTime) {
                                          return { resident, hasConflict: false, conflicts: [] };
                                    }
                                    const check = await db.checkResidentStudyScheduleConflict({
                                          residentId: resident.id,
                                          assignmentDate: input.targetDate,
                                          startTime: String(config.startTime),
                                          endTime: String(config.endTime),
                                          travelMinutes: input.travelMinutes,
                                    });
                                    return { resident, hasConflict: check.hasConflict, conflicts: check.conflicts };
                              })
                        );

                        return {
                              dutyConfig: config,
                              targetDate: input.targetDate,
                              available: results.filter((r) => !r.hasConflict).map((r) => r.resident),
                              conflicted: results
                                    .filter((r) => r.hasConflict)
                                    .map((r) => ({ resident: r.resident, conflicts: r.conflicts })),
                              noSchedule: results.filter((r) => !r.hasConflict).length,
                        };
                  } catch (error) {
                        if (error instanceof TRPCError) throw error;
                        console.error("[duties.getSmartSuggestions] Error:", error);
                        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to get smart suggestions" });
                  }
            }),

      /**
       * Phân công hàng loạt cho nhiều học viên cùng lúc
       */
      bulkAssignResidents: protectedProcedure
            .input(
                  z.object({
                        dutyConfigId: z.number(),
                        dutyTaskId: z.number().optional().nullable(),
                        residentIds: z.array(z.number()).min(1),
                        assignedDate: z.string(), // YYYY-MM-DD
                        startTime: z.string().optional().nullable(),
                        endTime: z.string().optional().nullable(),
                        notes: z.string().optional().nullable(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const date = new Date(input.assignedDate);
                        const rows = input.residentIds.map((residentId) => ({
                              dutyConfigId: input.dutyConfigId,
                              residentId,
                              assignedToType: "resident" as const,
                              assignedToId: residentId,
                              assignedDate: date,
                              status: "pending" as const,
                              notes: input.notes ?? null,
                        }));
                        await db.db.insert(dutyAssignments).values(rows as any);
                        return { success: true, count: rows.length };
                  } catch (error) {
                        console.error("[duties.bulkAssignResidents] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to bulk assign duties",
                        });
                  }
            }),
});

