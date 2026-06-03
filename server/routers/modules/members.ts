import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { isManager } from "../../_core/rbac";
import { TRPCError } from "@trpc/server";
import { memberService } from "../../services/memberService";
import { userDb } from "../../db";

const parentSchema = z.object({
      parentType: z.enum(["father", "mother", "guardian"]),
      fullName: z.string().min(1, "Tên không được để trống"),
      phoneNumber: z.string().optional(),
      email: z.string().optional(),
      idNumber: z.string().optional(),
      occupation: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
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

export const membersRouter = router({
      list: protectedProcedure
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

      getById: protectedProcedure
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

      create: protectedProcedure
            .input(
                  z.object({
                        holyName: z.string().trim().optional().nullable(),
                        fullName: z.string().min(1, "Tên không được để trống"),
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

      update: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        holyName: z.string().trim().optional().nullable(),
                        fullName: z.string().optional(),
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

      delete: protectedProcedure
            .input(z.object({ id: z.number() }))
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.deleteMember(input.id);
                  } catch (error) {
                        console.error("[members.delete] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: error instanceof Error ? error.message : "Failed to delete member",
                        });
                  }
            }),

      markAsLeft: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        departureDate: z.date(),
                  })
            )
            .mutation(async ({ input }) => {
                  try {
                        return await memberService.markAsLeft(input.id, input.departureDate);
                  } catch (error) {
                        console.error("[members.markAsLeft] Error:", error);
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    error instanceof Error ? error.message : "Failed to mark member as left",
                        });
                  }
            }),

      assignRoom: protectedProcedure
            .input(
                  z.object({
                        id: z.number(),
                        roomId: z.number(),
                        eventType: z
                              .enum(["new_entry", "transfer", "temporary_leave", "left"])
                              .default("new_entry"),
                        reason: z.string().optional(),
                  })
            )
            .mutation(async ({ input }) => {
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

      getStats: protectedProcedure.query(async () => {
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

      getParents: protectedProcedure
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

      listParents: protectedProcedure
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

      createParent: protectedProcedure
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

      updateParent: protectedProcedure
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

      deleteParent: protectedProcedure
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
      suggestResidentUsername: protectedProcedure
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

      listResidentsWithoutUser: protectedProcedure.query(async ({ ctx }) => {
            requireMemberManagementAccess(ctx.user);

            return userDb.listResidentsWithoutUser();
      }),

      createResidentUser: protectedProcedure
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

      bulkCreateResidentUsers: protectedProcedure
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
