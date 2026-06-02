import { TRPCError } from "@trpc/server";
import { APPOINTMENT_ROLE_KEYS, type AppointmentRoleKey } from "../../drizzle/schema";
import { protectedProcedure } from "./trpc";

type UserLike =
      | {
            id?: number;
            email?: string | null;
            role?: string | null;
            roles?: string[] | null;
            permissions?: string[] | null;
      }
      | null
      | undefined;

export const MANAGEMENT_ROLES = ["manager"] as const;

export const RESIDENT_ROLES = ["resident"] as const;

export const OPERATIONAL_ROLE_KEYS = [
      "manager",
      "resident",
      ...APPOINTMENT_ROLE_KEYS,
] as const;

export type ManagementRoleKey = (typeof MANAGEMENT_ROLES)[number];
export type ResidentRoleKey = (typeof RESIDENT_ROLES)[number];

export type OperationalRoleKey = (typeof OPERATIONAL_ROLE_KEYS)[number];

/**
 * Các role bổ nhiệm/kiêm nhiệm:
 * - team_leader
 * - committee_head
 * - house_leader
 * - deputy
 * - secretary
 * - treasurer
 */
export type AppointmentRole = AppointmentRoleKey;

/**
 * Global switch to disable RBAC checks during development.
 * Set ADMIN_RBAC_DISABLED=1 to bypass all role checks.
 *
 * Giữ tên env cũ ADMIN_RBAC_DISABLED để không cần đổi cấu hình hiện tại.
 */
function isRbacDisabled() {
      const value = process.env.ADMIN_RBAC_DISABLED;
      return value === "1" || value === "true" || value === "yes";
}

/**
 * Allow a small set of manager users to bypass RBAC during initial stages.
 * Configure via env var ADMIN_SUPER_USERS as comma-separated emails.
 *
 * Giữ tên env cũ ADMIN_SUPER_USERS để không ảnh hưởng config đang có.
 */
function isSuperUser(user?: UserLike) {
      if (!user) return false;

      const raw = process.env.ADMIN_SUPER_USERS || "";
      if (!raw) return false;

      const list = raw
            .split(",")
            .map((item) => item.trim().toLowerCase())
            .filter(Boolean);

      return !!(user.email && list.includes(user.email.toLowerCase()));
}

function canBypassRbac(user?: UserLike) {
      return isRbacDisabled() || isSuperUser(user);
}

/**
 * Check một role.
 *
 * Ưu tiên roles[] theo mô hình mới.
 * Fallback về role cũ để không làm vỡ code cũ.
 */
export function hasRole(user: UserLike, roleKey: string) {
      if (!user) return false;

      if (user.roles?.includes(roleKey)) {
            return true;
      }

      return user.role === roleKey;
}

/**
 * Check nhiều role.
 */
export function hasAnyRole(user: UserLike, roleKeys: readonly string[]) {
      if (!user) return false;

      return roleKeys.some((roleKey) => hasRole(user, roleKey));
}

/**
 * Manager là toàn quyền quản lý.
 */
export function isManager(user: UserLike) {
      return hasRole(user, "manager");
}

/**
 * Học viên.
 */
export function isResident(user: UserLike) {
      return hasRole(user, "resident");
}

/**
 * Có ít nhất một role bổ nhiệm/kiêm nhiệm.
 */
export function hasAppointmentRole(user: UserLike) {
      return hasAnyRole(user, APPOINTMENT_ROLE_KEYS);
}

/**
 * Check permission dạng module.action.
 *
 * manager có toàn quyền.
 */
export function hasPermission(user: UserLike, permissionKey: string) {
      if (!user) return false;

      if (isManager(user)) {
            return true;
      }

      return user.permissions?.includes(permissionKey) ?? false;
}

/**
 * Check một trong nhiều permission.
 *
 * manager có toàn quyền.
 */
export function hasAnyPermission(user: UserLike, permissionKeys: readonly string[]) {
      if (!user) return false;

      if (isManager(user)) {
            return true;
      }

      return permissionKeys.some((permissionKey) =>
            user.permissions?.includes(permissionKey)
      );
}

/**
 * Helper dùng trong router/service khi cần chặn bằng role.
 */
export function requireAnyRole(user: UserLike, allowedRoles: readonly string[]) {
      if (canBypassRbac(user)) {
            return;
      }

      if (!hasAnyRole(user, allowedRoles)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền thực hiện thao tác này.",
            });
      }
}

/**
 * Helper dùng trong router/service khi cần chặn bằng permission.
 */
export function requirePermission(user: UserLike, permissionKey: string) {
      if (canBypassRbac(user)) {
            return;
      }

      if (!hasPermission(user, permissionKey)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Bạn không có quyền thực hiện thao tác này.",
            });
      }
}

/**
 * Giữ tên adminProcedure để tương thích các router cũ đang import.
 *
 * Nhưng theo mô hình mới:
 * adminProcedure = managerProcedure
 *
 * Vì không còn role admin. Tài khoản username admin cũng là role manager.
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
      if (canBypassRbac(ctx.user)) {
            return next({ ctx });
      }

      if (!isManager(ctx.user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Chỉ quản lý lưu xá mới có quyền truy cập.",
            });
      }

      return next({ ctx });
});

/**
 * Manager procedure.
 *
 * manager = toàn quyền quản lý.
 */
export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
      if (canBypassRbac(ctx.user)) {
            return next({ ctx });
      }

      if (!isManager(ctx.user)) {
            throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Chỉ quản lý lưu xá mới có quyền truy cập.",
            });
      }

      return next({ ctx });
});

/**
 * Appointment procedure.
 *
 * Dành cho các vai trò bổ nhiệm/kiêm nhiệm:
 * - team_leader
 * - committee_head
 * - house_leader
 * - deputy
 * - secretary
 * - treasurer
 *
 * manager cũng được quyền.
 */
export const appointmentProcedure = protectedProcedure.use(({ ctx, next }) => {
      if (canBypassRbac(ctx.user)) {
            return next({ ctx });
      }

      if (isManager(ctx.user) || hasAppointmentRole(ctx.user)) {
            return next({ ctx });
      }

      throw new TRPCError({
            code: "FORBIDDEN",
            message: "Chỉ người được phân công hoặc quản lý mới có quyền truy cập.",
      });
});

/**
 * Giữ tên supervisorProcedure để tương thích code cũ.
 *
 * Nhưng logic mới không còn role supervisor.
 * supervisorProcedure = appointmentProcedure
 */
export const supervisorProcedure = appointmentProcedure;

/**
 * Accountant procedure giữ lại để tương thích code cũ.
 *
 * Theo mô hình mới:
 * manager kiêm luôn tài chính/kế toán.
 */
export const accountantProcedure = managerProcedure;

/**
 * Resident procedure.
 *
 * Học viên được truy cập.
 * Manager và các role bổ nhiệm cũng được quyền để hỗ trợ/kiểm tra.
 */
export const residentProcedure = protectedProcedure.use(({ ctx, next }) => {
      if (canBypassRbac(ctx.user)) {
            return next({ ctx });
      }

      if (isManager(ctx.user) || isResident(ctx.user) || hasAppointmentRole(ctx.user)) {
            return next({ ctx });
      }

      throw new TRPCError({
            code: "FORBIDDEN",
            message: "Bạn không có quyền truy cập.",
      });
});