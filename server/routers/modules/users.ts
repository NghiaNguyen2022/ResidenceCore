import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
      APP_ROLE_KEYS,
      APPOINTMENT_ROLE_KEYS,
      type AppRoleKey,
} from "../../../drizzle/schema";
import { router } from "../../_core/trpc";
import { managerProcedure } from "../../_core/rbac";
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

      /**
       * User Management Simple Mode chỉ tạo trực tiếp tài khoản quản lý.
       * FE mới có thể không gửi roleKeys; backend sẽ mặc định là ["manager"].
       * Nếu client cũ gửi role khác, backend sẽ chặn cứng.
       */
      roleKeys: z.array(roleKeySchema).optional(),
      primaryRoleKey: roleKeySchema.optional(),

      /**
       * Không link học viên ở màn hình User Management.
       * Tài khoản học viên phải được tạo từ nghiệp vụ thêm học viên.
       */
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

const DEFAULT_RESET_PASSWORD = "123456";

const resetPasswordSchema = z.object({
      userId: z.number().int().positive(),
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

function normalizeUserManagementCreateRoles(roleKeys?: AppRoleKey[]) {
      const normalizedRoleKeys = roleKeys?.length ? roleKeys : (["manager"] as AppRoleKey[]);

      const onlyManager =
            normalizedRoleKeys.length === 1 && normalizedRoleKeys[0] === "manager";

      if (!onlyManager) {
            throw new TRPCError({
                  code: "BAD_REQUEST",
                  message:
                        "Màn hình Người dùng & quyền truy cập chỉ được tạo trực tiếp tài khoản quản lý. Tài khoản học viên và vai trò bổ nhiệm được tạo từ các nghiệp vụ tương ứng.",
            });
      }

      return normalizedRoleKeys;
}

function blockRoleEditingFromUserManagement() {
      throw new TRPCError({
            code: "BAD_REQUEST",
            message:
                  "Không chỉnh sửa vai trò tại màn hình Người dùng & quyền truy cập. Vai trò học viên và vai trò bổ nhiệm được điều phối từ các nghiệp vụ tương ứng.",
      });
}

function isManagerAccount(user: any) {
      if (!user) return false;

      if (user.role === "manager" || user.primaryRoleKey === "manager") {
            return true;
      }

      if (Array.isArray(user.roles)) {
            return user.roles.some((role: any) => {
                  if (typeof role === "string") return role === "manager";
                  return role?.roleKey === "manager" || role?.key === "manager";
            });
      }

      return false;
}

async function requireManagedAccountIsManager(userId: number) {
      const user = await userDb.getManagedUserById(userId);

      if (!user) {
            throw new TRPCError({
                  code: "NOT_FOUND",
                  message: "Không tìm thấy người dùng.",
            });
      }

      if (isManagerAccount(user)) {
            return user;
      }

      const userRoles = await rolesDb.getUserRoles(userId);
      const isManagerByRoles = userRoles.some((role: any) => {
            if (typeof role === "string") return role === "manager";
            return role?.roleKey === "manager" || role?.key === "manager";
      });

      if (!isManagerByRoles) {
            throw new TRPCError({
                  code: "BAD_REQUEST",
                  message:
                        "Tài khoản học viên và vai trò bổ nhiệm được quản lý từ hồ sơ học viên, phân công, bổ nhiệm hoặc nhiệm kỳ; không khóa/mở trực tiếp tại màn hình này.",
            });
      }

      return {
            ...user,
            roles: userRoles,
      };
}

export const usersRouter = router({
      list: managerProcedure
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

      getById: managerProcedure
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

      create: managerProcedure
            .input(createUserSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  const roleKeys = normalizeUserManagementCreateRoles(input.roleKeys);

                  if (input.residentId) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message:
                                    "Không liên kết học viên tại màn hình Người dùng & quyền truy cập. Vui lòng tạo tài khoản học viên từ hồ sơ học viên.",
                        });
                  }

                  validateRoleCombination(roleKeys);

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
                        roleKeys,
                        input.primaryRoleKey
                  );

                  const legacyRole = resolveLegacyUserRole(roleKeys);
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
                        roleKeys,
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

      update: managerProcedure
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

                  if (input.roleKeys || input.primaryRoleKey) {
                        blockRoleEditingFromUserManagement();
                  }

                  if (typeof input.isActive === "boolean") {
                        await requireManagedAccountIsManager(input.id);
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

                  const updatedUser = await userDb.updateManagedUser({
                        id: input.id,
                        name: input.name,
                        email: input.email,
                        isActive: input.isActive,
                        mustChangePassword: input.mustChangePassword,
                  });

                  const assignedRoles = await rolesDb.getUserRoles(input.id);

                  return {
                        ...updatedUser,
                        roles: assignedRoles,
                  };
            }),

      activate: managerProcedure.input(userIdSchema).mutation(async ({ ctx, input }) => {
            requireUserManagementAccess(ctx.user);
            await requireManagedAccountIsManager(input.userId);

            return userDb.activateUser(input.userId);
      }),

      deactivate: managerProcedure
            .input(userIdSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  if (ctx.user?.id === input.userId) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Không thể khóa chính tài khoản đang đăng nhập.",
                        });
                  }

                  await requireManagedAccountIsManager(input.userId);

                  return userDb.deactivateUser(input.userId);
            }),

      resetPassword: managerProcedure
            .input(resetPasswordSchema)
            .mutation(async ({ ctx, input }) => {
                  requireUserManagementAccess(ctx.user);

                  const passwordHash = await hashPassword(DEFAULT_RESET_PASSWORD);

                  const updatedUser = await userDb.updatePasswordHash(input.userId, passwordHash, {
                        // Reset mật khẩu luôn đưa tài khoản về mật khẩu mặc định.
                        // Người dùng sẽ nhập mật khẩu mặc định ở ô "Mật khẩu hiện tại"
                        // trong popup đổi mật khẩu bắt buộc khi đăng nhập lại.
                        mustChangePassword: true,
                  });

                  return {
                        ...updatedUser,
                        defaultPassword: DEFAULT_RESET_PASSWORD,
                  };
            }),

      linkResident: managerProcedure
            .input(linkResidentSchema)
            .mutation(async ({ ctx }) => {
                  requireUserManagementAccess(ctx.user);

                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                              "Không liên kết học viên tại màn hình Người dùng & quyền truy cập. Vui lòng thực hiện từ hồ sơ học viên.",
                  });
            }),

      unlinkResident: managerProcedure
            .input(userIdSchema)
            .mutation(async ({ ctx }) => {
                  requireUserManagementAccess(ctx.user);

                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message:
                              "Không hủy liên kết học viên tại màn hình Người dùng & quyền truy cập. Vui lòng thực hiện từ hồ sơ học viên.",
                  });
            }),
});
