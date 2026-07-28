import { z } from "zod";
import { router } from "../../_core/trpc";
import { isManager, managerProcedure } from "../../_core/rbac";
import { TRPCError } from "@trpc/server";
import { memberService } from "../../services/memberService";
import { userDb } from "../../db";

const parentSchema = z.object({
      parentType: z.enum(["father", "mother", "guardian"]),
      fullName: z.string().trim().min(1, "Tên không được để trống"),
      phoneNumber: z.string().trim().min(1, "Số điện thoại không được để trống"),
      email: z.string().trim().optional().nullable(),
      idNumber: z.string().trim().optional().nullable(),
      occupation: z.string().trim().optional().nullable(),
      address: z.string().trim().optional().nullable(),
      notes: z.string().trim().optional().nullable(),
});
function requireMemberManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý học viên.",
            });
      }
}

const suggestResidentUsernameSchema = z.object({
      fullName: z.string().trim().min(1, "Vui lòng nhập họ tên học viên."),
});

const createResidentUserSchema = z.object({
      residentId: z.number().int().positive(),
      username: z.string().trim().min(3).optional(),
      temporaryPassword: z.string().min(6).optional(),
      mustChangePassword: z.boolean().optional(),
});

const bulkCreateResidentUsersSchema = z.object({
      residentIds: z.array(z.number().int().positive()).optional(),
      temporaryPassword: z.string().min(6).optional(),
      mustChangePassword: z.boolean().optional(),
});



const educationLevelSchema = z.enum([
      "high_school",
      "vocational",
      "college",
      "university",
      "other",
]);

const educationSchema = z.object({
      residentId: z.number().int().positive(),
      schoolName: z.string().trim().min(1, "Vui lòng nhập trường đang học."),
      educationLevel: educationLevelSchema.optional().nullable(),
      classOrMajor: z.string().trim().optional().nullable(),
      academicYear: z.string().trim().optional().nullable(),
      notes: z.string().trim().optional().nullable(),
});

const dayOfWeekSchema = z.enum([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
]);

const studyScheduleSchema = z.object({
      residentId: z.number().int().positive(),
      dayOfWeek: dayOfWeekSchema,
      startTime: z.string().trim().min(1, "Vui lòng nhập giờ bắt đầu."),
      endTime: z.string().trim().min(1, "Vui lòng nhập giờ kết thúc."),
      subjectName: z.string().trim().optional().nullable(),
      location: z.string().trim().optional().nullable(),
      notes: z.string().trim().optional().nullable(),
});

const updateStudyScheduleSchema = studyScheduleSchema.extend({
      id: z.number().int().positive(),
});

export const membersRouter = router({
      list: managerProcedure
            .input(
                  z
                        .object({
                              status: z.enum(["active", "inactive", "transferred_out"]).optional(),
                              search: z.string().optional(),
                              limit: z.number().default(50),
                              offset: z.number().default(0),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  return await memberService.listMembers({
                        status: input?.status,
                        search: input?.search,
                        limit: input?.limit,
                        offset: input?.offset,
                  });
            }),

      getById: managerProcedure
            .input(z.object({ id: z.number() }))
            .query(async ({ input }) => {
                  try {
                        return await memberService.getMemberById(input.id);
                  } catch (error) {
                        console.error("[members.getById] Error:", error);

                        if (error instanceof Error && error.message === "Member not found") {
                              throw new TRPCError({ code: "NOT_FOUND", message: error.message });
                        }

                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch member",
                        });
                  }
            }),

      create: managerProcedure
            .input(
                  z.object({
                        holyName: z.string().trim().optional().nullable(),
                        fullName: z.string().trim().min(1, "Tên không được để trống"),
                        dateOfBirth: z.date().optional(),
                        gender: z.enum(["male", "female", "other"]).optional(),
                        idNumber: z.string().optional(),
                        permanentAddress: z.string().optional(),
                        phoneNumber: z.string().optional(),
                        schoolId: z.number().optional(),
                        profileImage: z.string().optional(),
                        admissionDate: z.date(),
                        notes: z.string().optional(),
                        parents: z.array(parentSchema).optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.createMember(input);
                  } catch (error) {
                        console.error("[members.create] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to create member",
                        });
                  }
            }),

      update: managerProcedure
            .input(
                  z.object({
                        id: z.number(),
                        holyName: z.string().trim().optional().nullable(),
                        fullName: z.string().trim().optional(),
                        dateOfBirth: z.date().optional(),
                        gender: z.enum(["male", "female", "other"]).optional(),
                        idNumber: z.string().optional(),
                        permanentAddress: z.string().optional(),
                        phoneNumber: z.string().optional(),
                        schoolId: z.number().optional(),
                        profileImage: z.string().optional(),
                        admissionDate: z.date().optional(),
                        notes: z.string().optional(),
                        status: z.enum(["active", "inactive", "transferred_out"]).optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        const { id, ...updateData } = input;
                        return await memberService.updateMember(id, updateData);
                  } catch (error) {
                        console.error("[members.update] Error:", error);

                        if (error instanceof Error && error.message === "Member not found") {
                              throw new TRPCError({ code: "NOT_FOUND", message: error.message });
                        }

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to update member",
                        });
                  }
            }),

      delete: managerProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.deleteMember(input.id);
                  } catch (error: any) {
                        console.error("[members.delete] Error:", error);

                        const isForeignKeyError =
                              error?.code === "ER_ROW_IS_REFERENCED_2" ||
                              error?.errno === 1451 ||
                              String(error?.message || "").includes("foreign key constraint fails");

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: isForeignKeyError
                                    ? "Không thể xóa hồ sơ vì học viên đã phát sinh dữ liệu liên quan. Vui lòng dùng chức năng Rời lưu xá / Ngừng lưu trú để giữ lịch sử."
                                    : error instanceof Error
                                          ? error.message
                                          : "Failed to delete member",
                        });
                  }
            }),

      markAsLeft: managerProcedure
            .input(
                  z.object({
                        id: z.number(),
                        departureDate: z.date(),
                        forceAfterHandover: z.boolean().optional(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.markAsLeft(input.id, input.departureDate, {
                              forceAfterHandover: input.forceAfterHandover,
                        });
                  } catch (error: any) {
                        console.error("[members.markAsLeft] Error:", error);

                        if (
                              error?.code === "NEED_HANDOVER" ||
                              error?.reason === "NEED_HANDOVER"
                        ) {
                              throw new TRPCError({
                                    code: "PRECONDITION_FAILED",
                                    message:
                                          error?.message ||
                                          "Học viên đang giữ chức vụ trong cơ cấu lưu xá. Vui lòng bàn giao hoặc bãi nhiệm trước khi cho rời lưu xá.",
                                    cause: {
                                          reason: "NEED_HANDOVER",
                                          assignments: error?.assignments || [],
                                    },
                              });
                        }

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Failed to mark member as left",
                        });
                  }
            }),
      reactivate: managerProcedure
            .input(
                  z.object({
                        id: z.number(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.reactivateMember(input.id);
                  } catch (error) {
                        console.error("[members.reactivate] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể đăng ký lại học viên.",
                        });
                  }
            }),
            
      assignRoom: managerProcedure
            .input(
                  z.object({
                        id: z.number(),
                        roomId: z.number().optional(),
                        assignedDate: z.date().optional(),
                        eventType: z
                              .enum(["new_entry", "transfer", "temporary_leave", "left"])
                              .default("new_entry"),
                        reason: z.string().optional(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.assignRoom(input);
                  } catch (error) {
                        console.error("[members.assignRoom] Error:", error);

                        if (error instanceof Error && error.message === "Member not found") {
                              throw new TRPCError({ code: "NOT_FOUND", message: error.message });
                        }

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to assign room",
                        });
                  }
            }),

      getStats: managerProcedure.query(async () => {
            try {
                  return await memberService.getStats();
            } catch (error) {
                  console.error("[members.getStats] Error:", error);
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Failed to fetch stats",
                  });
            }
      }),

      getParents: managerProcedure
            .input(z.object({ residentId: z.number() }))
            .query(async ({ input }) => {
                  try {
                        return await memberService.getParents(input.residentId);
                  } catch (error) {
                        console.error("[members.getParents] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch parents",
                        });
                  }
            }),

      listParents: managerProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),
                              parentType: z.enum(["father", "mother", "guardian"]).optional(),
                              residentId: z.number().optional(),
                              limit: z.number().default(200),
                              offset: z.number().default(0),
                        })
                        .optional()
            )
            .query(async ({ input }) => {
                  try {
                        return await memberService.listParents({
                              search: input?.search,
                              parentType: input?.parentType,
                              residentId: input?.residentId,
                              limit: input?.limit,
                              offset: input?.offset,
                        });
                  } catch (error) {
                        console.error("[members.listParents] Error:", error);
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Failed to fetch all parents",
                        });
                  }
            }),

      createParent: managerProcedure
            .input(parentSchema.extend({ residentId: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.createParent(input);
                  } catch (error) {
                        console.error("[members.createParent] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Failed to create parent",
                        });
                  }
            }),

      updateParent: managerProcedure
            .input(parentSchema.partial().extend({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        const { id, ...updateData } = input;
                        return await memberService.updateParent(id, updateData);
                  } catch (error) {
                        console.error("[members.updateParent] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Failed to update parent",
                        });
                  }
            }),

      deleteParent: managerProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.deleteParent(input.id);
                  } catch (error) {
                        console.error("[members.deleteParent] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Failed to delete parent",
                        });
                  }
            }),

      getEducation: managerProcedure
            .input(z.object({ residentId: z.number().int().positive() }))
            .query(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.getEducation(input.residentId);
                  } catch (error) {
                        console.error("[members.getEducation] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể tải thông tin học hành.",
                        });
                  }
            }),

      upsertEducation: managerProcedure
            .input(educationSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.upsertEducation(input);
                  } catch (error) {
                        console.error("[members.upsertEducation] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể lưu thông tin học hành.",
                        });
                  }
            }),

      getStudySchedules: managerProcedure
            .input(z.object({ residentId: z.number().int().positive() }))
            .query(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.getStudySchedules(input.residentId);
                  } catch (error) {
                        console.error("[members.getStudySchedules] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể tải lịch học.",
                        });
                  }
            }),

      createStudySchedule: managerProcedure
            .input(studyScheduleSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.createStudySchedule(input);
                  } catch (error) {
                        console.error("[members.createStudySchedule] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể thêm lịch học.",
                        });
                  }
            }),

      updateStudySchedule: managerProcedure
            .input(updateStudyScheduleSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.updateStudySchedule(input);
                  } catch (error) {
                        console.error("[members.updateStudySchedule] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể cập nhật lịch học.",
                        });
                  }
            }),

      deleteStudySchedule: managerProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                        residentId: z.number().int().positive(),
                  })
            )
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await memberService.deleteStudySchedule(input);
                  } catch (error) {
                        console.error("[members.deleteStudySchedule] Error:", error);

                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error
                                          ? error.message
                                          : "Không thể xóa lịch học.",
                        });
                  }
            }),

      suggestResidentUsername: managerProcedure
            .input(suggestResidentUsernameSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  const baseUsername = userDb.generateResidentUsernameBase(input.fullName);
                  const username = await userDb.findAvailableUsername(baseUsername);

                  return {
                        baseUsername,
                        username,
                  };
            }),

      listResidentsWithoutUser: managerProcedure.query(async ({ ctx }) => {
            requireMemberManagementAccess(ctx.user);

            return userDb.listResidentsWithoutUser();
      }),

      createResidentUser: managerProcedure
            .input(createResidentUserSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  try {
                        return await userDb.createResidentUserForResident({
                              residentId: input.residentId,
                              username: input.username,
                              temporaryPassword: input.temporaryPassword,
                              mustChangePassword: input.mustChangePassword ?? true,
                              assignedBy: ctx.user?.id ?? null,
                        });
                  } catch (error: any) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error?.message || "Không thể tạo tài khoản cho học viên.",
                        });
                  }
            }),

      bulkCreateResidentUsers: managerProcedure
            .input(bulkCreateResidentUsersSchema)
            .mutation(async ({ ctx, input }) => {
                  requireMemberManagementAccess(ctx.user);

                  return userDb.bulkCreateResidentUsers({
                        residentIds: input.residentIds,
                        temporaryPassword: input.temporaryPassword,
                        mustChangePassword: input.mustChangePassword ?? true,
                        assignedBy: ctx.user?.id ?? null,
                  });
            }),
});
