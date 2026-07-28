import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router } from "../../_core/trpc";
import { managerProcedure } from "../../_core/rbac";
import { APP_ROLE_KEYS } from "../../../drizzle/schema";
import { rolesDb } from "../../db";
import { isManager } from "../../_core/rbac";

const roleKeySchema = z.enum(APP_ROLE_KEYS);

const assignUserRolesSchema = z.object({
      userId: z.number().int().positive(),
      roleKeys: z.array(roleKeySchema).min(1, "Vui lòng chọn ít nhất một vai trò."),
      primaryRoleKey: roleKeySchema.optional(),
});

function requireRoleManagementAccess(user: {
      id?: number;
      role?: string | null;
      roles?: string[] | null;
} | null | undefined) {
      if (!isManager(user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền quản lý vai trò người dùng.",
            });
      }
}

export const rolesRouter = router({
      /**
       * Danh sách role đang hoạt động.
       *
       * Role admin không còn dùng trong mô hình mới.
       * username admin chỉ là tài khoản mặc định có role manager.
       */
      list: managerProcedure.query(async ({ ctx }) => {
            requireRoleManagementAccess(ctx.user);

            return rolesDb.getActiveRoles();
      }),

      /**
       * Lấy vai trò hiện tại của một user.
       *
       * Dùng khi mở form sửa người dùng/phân quyền.
       */
      getUserRoles: managerProcedure
            .input(
                  z.object({
                        userId: z.number().int().positive(),
                  })
            )
            .query(async ({ ctx, input }) => {
                  requireRoleManagementAccess(ctx.user);

                  return rolesDb.getUserRoles(input.userId);
            }),

      /**
       * Gán nhiều role cho một user.
       *
       * Ví dụ học viên là tổ trưởng:
       * roleKeys = ["resident", "team_leader"]
       * primaryRoleKey = "resident"
       */
      assignUserRoles: managerProcedure
            .input(assignUserRolesSchema)
            .mutation(async ({ ctx, input }) => {
                  requireRoleManagementAccess(ctx.user);

                  if (
                        input.primaryRoleKey &&
                        !input.roleKeys.includes(input.primaryRoleKey)
                  ) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Vai trò chính phải nằm trong danh sách vai trò đã chọn.",
                        });
                  }

                  return rolesDb.assignUserRoles({
                        userId: input.userId,
                        roleKeys: input.roleKeys,
                        primaryRoleKey: input.primaryRoleKey,
                        assignedBy: ctx.user?.id ?? null,
                  });
            }),
});
