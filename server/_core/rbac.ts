import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./trpc";
import type { User } from "../../drizzle/schema";

// Allow a small set of super-users to bypass RBAC during initial stages.
// Configure via env var `ADMIN_SUPER_USERS` as comma-separated emails (e.g. "a@x.com,b@x.com").
function isSuperUser(user?: User | null) {
  if (!user) return false;
  const raw = process.env.ADMIN_SUPER_USERS || "";
  if (!raw) return false;
  const list = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !!(user.email && list.includes(user.email.toLowerCase()));
}

// Global switch to disable RBAC checks during development.
// Set `ADMIN_RBAC_DISABLED=1` to bypass all role checks.
function isRbacDisabled() {
  const v = process.env.ADMIN_RBAC_DISABLED;
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Role-Based Access Control (RBAC) Procedures
 * Enforce role checks at the procedure level, not just UI level
 */

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isRbacDisabled()) return next({ ctx });
  if (isSuperUser(ctx.user)) return next({ ctx });
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ quản trị viên mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isRbacDisabled()) return next({ ctx });
  if (isSuperUser(ctx.user)) return next({ ctx });
  if (ctx.user?.role !== "manager" && ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ quản lý viên mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const supervisorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isRbacDisabled()) return next({ ctx });
  if (isSuperUser(ctx.user)) return next({ ctx });
  if (!["supervisor", "manager", "admin"].includes(ctx.user?.role || "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ giám thị mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const accountantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isRbacDisabled()) return next({ ctx });
  if (isSuperUser(ctx.user)) return next({ ctx });
  if (!["accountant", "manager", "admin"].includes(ctx.user?.role || "")) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Chỉ kế toán mới có quyền truy cập",
    });
  }
  return next({ ctx });
});

export const residentProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (isRbacDisabled()) return next({ ctx });
  if (isSuperUser(ctx.user)) return next({ ctx });
  if (ctx.user?.role === "user" || ctx.user?.role === "resident") {
    return next({ ctx });
  }
  // Staff members can also access resident procedures
  if (["supervisor", "manager", "accountant", "admin"].includes(ctx.user?.role || "")) {
    return next({ ctx });
  }
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Bạn không có quyền truy cập",
  });
});
