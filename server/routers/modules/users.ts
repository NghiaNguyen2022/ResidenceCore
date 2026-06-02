import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
      APP_ROLE_KEYS,
      APPOINTMENT_ROLE_KEYS,
      type AppRoleKey,
} from "../../../drizzle/schema";
import { router, protectedProcedure } from "../../_core/trpc";
import { hashPassword } from "../../services/authService";
import { isManager } from "../../_core/rbac";
import { rolesDb, userDb } from "../../db";

const roleKeySchema = z.enum(APP_ROLE_KEYS);

const legacyUserRoleSchema = z.enum([
      "user",
      "admin",
      "manager",
      "supervisor",
      "accountant",
      "resident",
]);

const createUserSchema = z.object({
      username: z.string().trim().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự."),
      password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
      name: z.string().trim().min(1, "Vui lòng nhập họ tên."),
      email: z.string().trim().email("Email không hợp lệ.").optional().nullable(),

      roleKeys: z
            .array(roleKeySchema)
            .min(1, "Vui lòng chọn ít nhất một vai trò."),

      primaryRoleKey: roleKeySchema.optional(),

      residentId: z.number().int().positive().optional().nullable(),

      isActive: z.boolean().optional(),
      mustChangePassword: z.boolean().optional(),
});

const updateUserSchema = z.object({
      id: z.number().int().positive(),
      name: z.string().trim().min(1, "Vui lòng nhập họ tên.").optional(),
      email: z.string().trim().email("Email không hợp lệ.").optional().nullable(),

      roleKeys: z.array(roleKeySchema).min(1).optional(),
      primaryRoleKey: roleKeySchema.optional(),

      isActive: z.boolean().optional(),
      mustChangePassword: z.boolean().optional(),
});

const resetPasswordSchema = z.object({
      userId: z.number().int().positive(),
      newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
      mustChangePassword: z.boolean().optional(),
});

const userIdSchema = z.object({
      userId: z.number().int().positive(),
});

const linkResidentSchema = z.object({
      userId: z.number().int().positive(),
      residentId: z.number().int().positive(),
});

function requireUserManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý người dùng.",
            });
      }
}

function hasAppointmentRole(roleKeys: readonly string[]) {
      return roleKeys.some((roleKey) =>
            (APPOINTMENT_ROLE_KEYS as readonly string[]).includes(roleKey)
      );
}

function resolvePrimaryRole(roleKeys: AppRoleKey[], primaryRoleKey?: AppRoleKey) {
      if (primaryRoleKey && !roleKeys.includes(primaryRoleKey)) {
            throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Vai trò chính phải nằm trong danh sách vai trò đã chọn.",
            });
      }

      if (primaryRoleKey) {
            return primaryRoleKey;
      }

      if (roleKeys.includes("resident")) {
            return "resident";
      }

      if (roleKeys.includes("manager")) {
            return "manager";
      }

      return roleKeys[0];
}

function resolveLegacyUserRole(roleKeys: readonly AppRoleKey[]) {
      if (roleKeys.includes("manager")) {
            return "manager";
      }

      return "resident";
}

function validateRoleCombination(roleKeys: AppRoleKey[]) {
      const hasAppointment = hasAppointmentRole(roleKeys);
      const hasResident = roleKeys.includes("resident");
      const hasManager = roleKeys.includes("manager");

      if (hasAppointment && !hasResident && !hasManager) {
            throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Vai trò bổ nhiệm cần đi cùng tài khoản học viên hoặc quản lý.",
            });
      }
}

export const usersRouter = router({
      list: protectedProcedure
            .input(
                  z
                        .object({
                              search: z.string().optional(),

                              /**
                               * Filter role cũ để không lỗi dữ liệu hiện tại.
                               * Logic mới sẽ ưu tiên userRoles.
                               */
                              role: legacyUserRoleSchema.optional(),

                              isActive: z.boolean().optional(),
                              limit: z.number().int().positive().max(100).optional(),
                              offset: z.number().int().min(0).optional(),
                        })
                        .optional()
            )
            .query(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  return userDb.listUsers({
                        search: input?.search,
                        role: input?.role,
                        isActive: input?.isActive,
                        limit: input?.limit,
                        offset: input?.offset,
                  });
            }),

      getById: protectedProcedure
            .input(
                  z.object({
                        id: z.number().int().positive(),
                  })
            )
            .query(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  const user = await userDb.getManagedUserById(input.id);
                  if (!user) {
                        throw new TRPCError({
                              code: "NOT_FOUND",
                              message: "Không tìm thấy người dùng.",
                        });
                  }

                  const userRoles = await rolesDb.getUserRoles(input.id);

                  return {
                        ...user,
                        roles: userRoles,
                  };
            }),

      create: protectedProcedure
            .input(createUserSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  validateRoleCombination(input.roleKeys);

                  const usernameExists = await userDb.checkUsernameExists(input.username);
                  if (usernameExists) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Tên đăng nhập đã tồn tại.",
                        });
                  }

                  if (input.email) {
                        const emailExists = await userDb.checkEmailExists(input.email);
                        if (emailExists) {
                              throw new TRPCError({
                                    code: "BAD_REQUEST",
                                    message: "Email đã tồn tại.",
                              });
                        }
                  }

                  const primaryRole = resolvePrimaryRole(
                        input.roleKeys,
                        input.primaryRoleKey
                  );

                  const legacyRole = resolveLegacyUserRole(input.roleKeys);
                  const passwordHash = await hashPassword(input.password);

                  const createdUser = await userDb.createManagedUser({
                        username: input.username,
                        passwordHash,
                        name: input.name,
                        email: input.email ?? null,
                        role: legacyRole,
                        isActive: input.isActive ?? true,
                        mustChangePassword: input.mustChangePassword ?? true,
                  });

                  if (!createdUser) {
                        throw new TRPCError({
                              code: "INTERNAL_SERVER_ERROR",
                              message: "Không thể tạo người dùng.",
                        });
                  }

                  const assignedRoles = await rolesDb.assignUserRoles({
                        userId: createdUser.id,
                        roleKeys: input.roleKeys,
                        primaryRoleKey: primaryRole,
                        assignedBy: ctx.user?.id ?? null,
                  });

                  if (input.residentId) {
                        await userDb.linkUserToResident({
                              userId: createdUser.id,
                              residentId: input.residentId,
                        });
                  }

                  const refreshedUser = await userDb.getManagedUserById(createdUser.id);

                  return {
                        ...refreshedUser,
                        roles: assignedRoles,
                  };
            }),

      update: protectedProcedure
            .input(updateUserSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  const existingUser = await userDb.getManagedUserById(input.id);
                  if (!existingUser) {
                        throw new TRPCError({
                              code: "NOT_FOUND",
                              message: "Không tìm thấy người dùng.",
                        });
                  }

                  if (input.email) {
                        const emailExists = await userDb.checkEmailExists(input.email, input.id);
                        if (emailExists) {
                              throw new TRPCError({
                                    code: "BAD_REQUEST",
                                    message: "Email đã tồn tại.",
                              });
                        }
                  }

                  let legacyRole: "manager" | "resident" | undefined;
                  let primaryRole: AppRoleKey | undefined;

                  if (input.roleKeys) {
                        validateRoleCombination(input.roleKeys);
                        primaryRole = resolvePrimaryRole(input.roleKeys, input.primaryRoleKey);
                        legacyRole = resolveLegacyUserRole(input.roleKeys);
                  }

                  const updatedUser = await userDb.updateManagedUser({
                        id: input.id,
                        name: input.name,
                        email: input.email,
                        role: legacyRole,
                        isActive: input.isActive,
                        mustChangePassword: input.mustChangePassword,
                  });

                  let assignedRoles = await rolesDb.getUserRoles(input.id);

                  if (input.roleKeys) {
                        assignedRoles = await rolesDb.assignUserRoles({
                              userId: input.id,
                              roleKeys: input.roleKeys,
                              primaryRoleKey: primaryRole,
                              assignedBy: ctx.user?.id ?? null,
                        });
                  }

                  return {
                        ...updatedUser,
                        roles: assignedRoles,
                  };
            }),

      activate: protectedProcedure.input(userIdSchema).mutation(async ({ ctx, input }) => {
            requireUserManagementAccess(ctx.user);

            return userDb.activateUser(input.userId);
      }),

      deactivate: protectedProcedure
            .input(userIdSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  if (ctx.user?.id === input.userId) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Không thể khóa chính tài khoản đang đăng nhập.",
                        });
                  }

                  return userDb.deactivateUser(input.userId);
            }),

      resetPassword: protectedProcedure
            .input(resetPasswordSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  const passwordHash = await hashPassword(input.newPassword);

                  return userDb.updatePasswordHash(input.userId, passwordHash, {
                        mustChangePassword: input.mustChangePassword ?? true,
                  });
            }),

      linkResident: protectedProcedure
            .input(linkResidentSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  return userDb.linkUserToResident({
                        userId: input.userId,
                        residentId: input.residentId,
                  });
            }),

      unlinkResident: protectedProcedure
            .input(userIdSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  return userDb.unlinkUserFromResident(input.userId);
            }),
});